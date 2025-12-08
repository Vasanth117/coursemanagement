# Course Management System

A comprehensive course management system built with Node.js, Express, and MongoDB.

## Features

- **User Management**: Admin, Faculty, and Student roles
- **Course Management**: Create, update, and manage courses
- **Enrollment System**: Student enrollment with approval workflow
- **Assignment Management**: Create and manage assignments
- **Grade Management**: Grade assignments and track student progress
- **Attendance Tracking**: Mark and track student attendance
- **File Upload**: Support for assignments, submissions, and resources
- **Email Notifications**: Automated email notifications
- **Authentication**: JWT-based authentication with college email validation

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd course-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update environment variables in `.env` file

5. Start MongoDB service

6. Seed the database:
```bash
npm run seed
```

7. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/logout` - Logout user

### Courses
- `GET /api/v1/courses` - Get all courses
- `POST /api/v1/courses` - Create course
- `GET /api/v1/courses/:id` - Get single course
- `PUT /api/v1/courses/:id` - Update course
- `DELETE /api/v1/courses/:id` - Delete course

### Enrollments
- `GET /api/v1/enrollments` - Get all enrollments
- `POST /api/v1/enrollments` - Create enrollment
- `PUT /api/v1/enrollments/:id/approve` - Approve enrollment
- `PUT /api/v1/enrollments/:id/reject` - Reject enrollment

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app
```

## College Email Requirements

All users must use official college email domains:
- Admin: `@admin.college.edu` or `@college.edu`
- Faculty: `@faculty.college.edu` or `@college.edu`
- Student: `@student.college.edu` or `@college.edu`

## License

MIT License