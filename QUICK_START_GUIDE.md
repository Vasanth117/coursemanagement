# 🚀 SECE Course Management System - Quick Start Guide

## 📋 Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote)
- Git

## 🔧 Installation & Setup

### 1. Backend Setup
```bash
cd "e:\course manage"

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your settings:
PORT=5001
MONGODB_URI=mongodb://localhost:27017/course_management
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Start backend server
npm run dev
```

Backend will run on: **http://localhost:5001**

### 2. Frontend Setup
```bash
cd "e:\course manage\frontend"

# Install dependencies
npm install

# Start frontend development server
npm start
```

Frontend will run on: **http://localhost:3000**

## 👥 Default User Accounts

### Admin Account
- **Email**: admin@college.edu
- **Password**: admin123
- **Role**: Administrator

### Faculty Account
- **Email**: faculty@college.edu
- **Password**: faculty123
- **Role**: Faculty

### Student Account
- **Email**: student@college.edu
- **Password**: student123
- **Role**: Student

## 🎯 Key Features by Role

### 👨‍💼 Admin Features
- User management (Create, Edit, Delete users)
- Course approval workflow
- System analytics and reports
- Settings configuration
- View all system activities

**Access**: http://localhost:3000/admin/dashboard

### 👨‍🏫 Faculty Features
- Create and manage courses
- Create assignments
- Grade student submissions
- Mark attendance
- Post announcements
- Upload course resources
- View enrolled students

**Access**: http://localhost:3000/faculty/dashboard

### 👨‍🎓 Student Features
- Browse and enroll in courses
- View enrolled courses
- Submit assignments
- View grades and GPA
- Check class schedule
- View announcements
- Download course materials

**Access**: http://localhost:3000/student/dashboard

## 📁 Project Structure

```
e:\course manage\
├── backend\
│   ├── src\
│   │   ├── controllers\      # API controllers
│   │   ├── models\           # MongoDB models
│   │   ├── routes\           # API routes
│   │   ├── middleware\       # Auth, validation
│   │   ├── services\         # Business logic
│   │   └── utils\            # Helper functions
│   ├── .env                  # Environment variables
│   └── server.js             # Entry point
│
└── frontend\
    ├── src\
    │   ├── api\              # API integration
    │   ├── components\       # Reusable components
    │   ├── pages\            # Page components
    │   ├── contexts\         # React contexts
    │   ├── hooks\            # Custom hooks
    │   ├── utils\            # Utility functions
    │   ├── router\           # Route configuration
    │   ├── styles\           # CSS files
    │   └── App.js            # Main app component
    └── package.json
```

## 🎨 Design System

### Colors (SECE Branding)
- **Primary Blue**: #2563eb
- **Secondary Indigo**: #4f46e5
- **Success Green**: #10b981
- **Warning Orange**: #f59e0b
- **Danger Red**: #ef4444

### Typography
- **Font**: Inter, Poppins
- **Headings**: Bold, 2xl-3xl
- **Body**: Regular, sm-base

## 🔌 API Endpoints

### Authentication
- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/login` - Login user
- POST `/api/v1/auth/forgot-password` - Request password reset
- POST `/api/v1/auth/reset-password/:token` - Reset password

### Users (Admin)
- GET `/api/v1/admin/users` - Get all users
- POST `/api/v1/admin/users` - Create user
- GET `/api/v1/admin/users/:id` - Get user details
- PUT `/api/v1/admin/users/:id` - Update user
- DELETE `/api/v1/admin/users/:id` - Delete user

### Courses
- GET `/api/v1/courses` - Get all courses
- POST `/api/v1/courses` - Create course (Faculty)
- GET `/api/v1/courses/:id` - Get course details
- PUT `/api/v1/courses/:id` - Update course
- DELETE `/api/v1/courses/:id` - Delete course

### Assignments
- GET `/api/v1/assignments` - Get assignments
- POST `/api/v1/assignments` - Create assignment
- GET `/api/v1/assignments/:id` - Get assignment details
- PUT `/api/v1/assignments/:id` - Update assignment
- DELETE `/api/v1/assignments/:id` - Delete assignment

### Enrollments
- POST `/api/v1/enrollments` - Enroll in course
- GET `/api/v1/enrollments/my-courses` - Get enrolled courses
- DELETE `/api/v1/enrollments/:id` - Drop course

### Grades
- GET `/api/v1/grades` - Get grades
- POST `/api/v1/grades` - Submit grade
- GET `/api/v1/grades/student/:studentId` - Get student grades

## 🧪 Testing the System

### 1. Test Authentication
1. Go to http://localhost:3000
2. Click "Get Started" or "Login"
3. Use default credentials above
4. Verify redirect to appropriate dashboard

### 2. Test Admin Features
1. Login as admin
2. Navigate to User Management
3. Create a new user
4. Edit user details
5. View user profile
6. Check analytics dashboard

### 3. Test Faculty Features
1. Login as faculty
2. Create a new course
3. Create an assignment
4. View enrolled students
5. Mark attendance
6. Post announcement

### 4. Test Student Features
1. Login as student
2. Browse available courses
3. Enroll in a course
4. View course details
5. Submit an assignment
6. Check grades

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
net start MongoDB
```

**Port Already in Use**
```bash
# Change PORT in .env file
PORT=5002
```

### Frontend Issues

**Dependencies Error**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API Connection Error**
- Check if backend is running on port 5001
- Verify API_BASE_URL in frontend config
- Check CORS settings in backend

### Common Errors

**JWT Token Expired**
- Logout and login again
- Token expires after 7 days

**File Upload Failed**
- Check file size (max 10MB)
- Verify upload directory permissions

**Email Not Sending**
- Check SMTP credentials in .env
- Enable "Less secure app access" for Gmail

## 📊 Database Management

### View Database
```bash
# Connect to MongoDB
mongo

# Switch to database
use course_management

# View collections
show collections

# View users
db.users.find().pretty()

# View courses
db.courses.find().pretty()
```

### Reset Database
```bash
# Drop database (WARNING: Deletes all data)
use course_management
db.dropDatabase()

# Restart backend to recreate collections
```

## 🔒 Security Best Practices

1. **Change default passwords** immediately
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** for production deployment
4. **Set up email verification** for new users
5. **Regular database backups**
6. **Monitor system logs** for suspicious activity

## 📈 Performance Tips

1. **Enable caching** in React Query
2. **Optimize images** before upload
3. **Use pagination** for large lists
4. **Enable compression** in Express
5. **Index MongoDB** collections

## 🚀 Production Deployment

### Backend Deployment
1. Set NODE_ENV=production
2. Use production MongoDB URI
3. Configure SSL certificates
4. Set up process manager (PM2)
5. Enable logging and monitoring

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to hosting (Netlify, Vercel, etc.)
3. Configure environment variables
4. Set up CDN for static assets

## 📞 Support

For issues or questions:
- Check documentation in `/docs` folder
- Review API documentation
- Check browser console for errors
- Review backend logs

## ✅ System Status

- ✅ Backend: Running on port 5001
- ✅ Frontend: Running on port 3000
- ✅ Database: MongoDB connected
- ✅ Authentication: JWT working
- ✅ File Upload: Configured
- ✅ Email Service: Configured

## 🎓 Next Steps

1. **Customize branding** - Update logo and colors
2. **Add more courses** - Populate with real data
3. **Configure email** - Set up SMTP for notifications
4. **Train users** - Provide user guides
5. **Monitor system** - Set up analytics
6. **Backup data** - Regular database backups

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅

**Happy Learning! 🎓**
