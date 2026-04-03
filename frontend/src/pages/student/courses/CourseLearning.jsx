import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../../api/student';
import { 
  FiBook, 
  FiFileText, 
  FiDownload, 
  FiCheckCircle, 
  FiClock, 
  FiChevronRight, 
  FiArrowLeft,
  FiPlay,
  FiCheck,
  FiLock,
  FiCalendar,
  FiEye,
  FiUser
} from 'react-icons/fi';
import { 
  LoadingSpinner, 
  Card, 
  Badge, 
  Button, 
  ProgressBar,
  ErrorMessage,
  EmptyState
} from '../../../components/common';

const CourseLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch course details including everything
  const { data, isLoading, error } = useQuery({
    queryKey: ['courseLearning', id],
    queryFn: () => studentAPI.getCourseDetails(id),
    enabled: !!id
  });

  const courseData = data?.data || data;
  const course = courseData?.course;
  const resources = courseData?.resources || [];
  const assignments = courseData?.assignments || courseData?.course?.assignments || [];
  const grades = courseData?.grades || [];

  if (isLoading) return <LoadingSpinner fullScreen text="Preparing your classroom..." />;
  
  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorMessage 
          message="Failed to load course materials. Please make sure you are enrolled." 
          onRetry={() => window.location.reload()}
        />
        <Button variant="secondary" icon={FiArrowLeft} onClick={() => navigate('/student/courses')} className="mt-4">
          Back to Courses
        </Button>
      </div>
    );
  }

  // Combine resources and assignments into "Modules" or a "Learning Path"
  // For this implementation, we'll treat them as a sequential list
  const learningItems = [
    ...(resources.map(r => ({ ...r, learningType: 'resource' }))),
    ...(assignments.map(a => ({ ...a, learningType: 'assignment' })))
  ].sort((a, b) => new Date(a.createdAt || a.uploadedAt) - new Date(b.createdAt || b.uploadedAt));

  const totalItems = learningItems.length;
  // Calculate progress based on graded assignments or viewed resources (if tracked)
  // For now, let's use graded assignments as a proxy for progress
  const completedAssignments = assignments.filter(a => {
    const grade = grades.find(g => g.assignment?._id === a._id || g.assignment === a._id);
    return grade && (grade.status === 'submitted' || grade.status === 'graded');
  }).length;
  
  const progressPercentage = totalItems > 0 ? Math.round((completedAssignments / totalItems) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in p-4 pb-20">
      {/* Course Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-800 text-white p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/student/courses')}
              className="flex items-center text-blue-100 hover:text-white transition-colors text-sm font-medium mb-2"
            >
              <FiArrowLeft className="mr-2" /> Back to My Courses
            </button>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-blue-100">
              <span className="flex items-center"><FiBook className="mr-2" /> {course.code}</span>
              <span className="flex items-center"><FiClock className="mr-2" /> {course.credits} Credits</span>
              <span className="flex items-center font-bold px-3 py-1 bg-white/20 rounded-full backdrop-blur-md">
                {course.semester} {course.year}
              </span>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 w-full md:w-auto">
            <p className="text-sm font-medium text-blue-100 mb-2">Overall Completion</p>
            <div className="flex items-center gap-4">
              <div className="h-4 w-48 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-2xl font-bold">{progressPercentage}%</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Learning Path */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Step-by-Step Learning Path</h2>
            <Badge variant="info" className="px-4 py-1.5">{learningItems.length} Steps Total</Badge>
          </div>

          {learningItems.length === 0 ? (
            <EmptyState 
              title="No learning material yet" 
              description="Your instructor hasn't uploaded any resources or assignments for this course yet."
            />
          ) : (
            <div className="relative space-y-8">
              {/* Vertical line connecting steps */}
              <div className="absolute left-8 top-10 bottom-10 w-1 bg-gray-100 rounded-full -z-10" />

              {learningItems.map((item, index) => {
                const isAssignment = item.learningType === 'assignment';
                const grade = isAssignment ? grades.find(g => g.assignment?._id === item._id || g.assignment === item._id) : null;
                const isCompleted = isAssignment ? (grade?.status === 'submitted' || grade?.status === 'graded') : false;
                
                return (
                  <div key={item._id} className="group relative pl-20 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    {/* Step Icon Indicator */}
                    <div className={`
                      absolute left-0 top-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg
                      ${isCompleted ? 'bg-green-500 text-white scale-110 shadow-green-200' : 'bg-white text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}
                    `}>
                      {isCompleted ? <FiCheckCircle className="w-8 h-8" /> : <span className="text-2xl font-black">{index + 1}</span>}
                    </div>

                    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-xl ${isCompleted ? 'border-l-4 border-green-500' : 'hover:border-blue-500'}`}>
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                             <Badge variant={isAssignment ? 'warning' : 'info'} size="sm" className="uppercase tracking-wider">
                              {isAssignment ? 'Assignment' : 'Resource'}
                            </Badge>
                            {isAssignment && (
                              <Badge variant={isCompleted ? 'success' : 'gray'} size="sm">
                                {isCompleted ? 'Completed' : 'Pending'}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs font-medium text-gray-500 pt-2">
                            {isAssignment ? (
                              <>
                                <span className="flex items-center"><FiCalendar className="mr-1" /> Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                                <span className="flex items-center"><FiCheck className="mr-1" /> {item.maxPoints} Points</span>
                              </>
                            ) : (
                              <>
                                <span className="flex items-center uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded text-[10px]">{item.type}</span>
                                <span className="flex items-center"><FiClock className="mr-1" /> Added: {new Date(item.uploadedAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center md:items-end justify-center md:justify-end">
                          {isAssignment ? (
                            <Link to={`/student/assignments/${item._id}`} className="w-full md:w-auto">
                              <Button 
                                variant={isCompleted ? 'secondary' : 'primary'} 
                                icon={isCompleted ? FiEye : FiPlay}
                                className="w-full"
                              >
                                {isCompleted ? 'Review Work' : 'Start Task'}
                              </Button>
                            </Link>
                          ) : (
                            <a 
                              href={item.fileUrl || item.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="w-full md:w-auto"
                            >
                              <Button variant="secondary" icon={FiDownload} className="w-full">
                                Download
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Instructor Card */}
          <Card className="bg-gradient-to-br from-white to-gray-50 border-none shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <FiUser className="mr-2 text-blue-600" /> Your Instructor
            </h3>
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl uppercase">
                {course.faculty?.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{course.faculty?.name}</p>
                <p className="text-sm text-gray-500">{course.faculty?.department}</p>
                <p className="text-xs text-blue-600 font-medium mt-1">{course.faculty?.email}</p>
              </div>
            </div>
            <Button variant="secondary" fullWidth className="mt-6 border-dashed text-gray-600">
              Contact Instructor
            </Button>
          </Card>

          {/* Stats Card */}
          <Card className="bg-white border-none shadow-xl">
             <h3 className="text-lg font-bold text-gray-900 mb-6">Course Metrics</h3>
             <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Syllabus Covered</span>
                    <span className="font-bold text-blue-600">{progressPercentage}%</span>
                  </div>
                  <ProgressBar value={progressPercentage} size="md" />
               </div>

               <div className="grid grid-cols-2 gap-4 mt-6">
                 <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-2xl font-black text-blue-700">{resources.length}</p>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">Resources</p>
                 </div>
                 <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-2xl font-black text-indigo-700">{assignments.length}</p>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-tighter">Assignments</p>
                 </div>
               </div>
               
               {courseData.currentGrade !== undefined && (
                 <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
                    <p className="text-sm text-green-600 font-medium mb-1">Current Standing</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-black text-green-700">{courseData.currentGrade}%</span>
                      <Badge variant="success" className="mb-2">{courseData.letterGrade}</Badge>
                    </div>
                 </div>
               )}
             </div>
          </Card>

          {/* Next Milestone */}
          {learningItems.find(item => item.learningType === 'assignment' && !grades.find(g => (g.assignment?._id === item._id || g.assignment === item._id) && (g.status === 'submitted' || g.status === 'graded'))) && (
            <Card className="bg-gradient-to-br from-indigo-900 to-blue-900 border-none shadow-2xl text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FiClock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Upcoming Milestone</h3>
              </div>
              {(() => {
                const nextAssignment = learningItems.find(item => item.learningType === 'assignment' && !grades.find(g => (g.assignment?._id === item._id || g.assignment === item._id) && (g.status === 'submitted' || g.status === 'graded')));
                return (
                  <div>
                    <p className="text-blue-200 text-sm mb-1">{nextAssignment.title}</p>
                    <p className="text-xl font-bold mb-4">Due {new Date(nextAssignment.dueDate).toLocaleDateString()}</p>
                    <Link to={`/student/assignments/${nextAssignment._id}`}>
                      <Button fullWidth variant="primary" className="bg-white text-indigo-900 hover:bg-blue-50 border-none">
                        Resume Learning
                      </Button>
                    </Link>
                  </div>
                );
              })()}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Internal Link Helper
const Link = ({ children, to, className, ...props }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(to)} 
      className={`cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default CourseLearning;
