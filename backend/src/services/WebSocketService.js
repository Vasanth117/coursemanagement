const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();
    
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
  }

  handleConnection(ws, req) {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'auth') {
          this.authenticateClient(ws, data.token);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      this.clients.delete(ws);
    });
  }

  authenticateClient(ws, token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.id;
      ws.userRole = decoded.role;
      this.clients.set(ws, { userId: decoded.id, role: decoded.role });
    } catch (error) {
      ws.close();
    }
  }

  broadcastEnrollmentUpdate(enrollment) {
    const message = {
      type: 'enrollment_update',
      data: enrollment
    };

    this.clients.forEach((client, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        // Send to admin/faculty
        if (client.role === 'admin' || client.role === 'faculty') {
          ws.send(JSON.stringify(message));
        }
        // Send to specific student
        if (client.role === 'student' && client.userId === enrollment.student.toString()) {
          ws.send(JSON.stringify(message));
        }
      }
    });
  }

  broadcastStatsUpdate(stats) {
    const message = {
      type: 'stats_update',
      data: stats
    };

    this.clients.forEach((client, ws) => {
      if (ws.readyState === WebSocket.OPEN && (client.role === 'admin' || client.role === 'faculty')) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  broadcastNewAssignment(assignment, studentIds) {
    const message = {
      type: 'new_assignment',
      data: {
        assignmentId: assignment._id,
        title: assignment.title,
        courseId: assignment.course,
        dueDate: assignment.dueDate
      }
    };

    const studentIdStrings = studentIds.map(id => id.toString());

    this.clients.forEach((client, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        // Send to targeted students
        if (client.role === 'student' && studentIdStrings.includes(client.userId)) {
          ws.send(JSON.stringify(message));
        }
        // Send to faculty who created it (optional, for confirmation)
        if (client.role === 'faculty' && client.userId === assignment.createdBy.toString()) {
          ws.send(JSON.stringify(message));
        }
      }
    });
  }
}

module.exports = WebSocketService;