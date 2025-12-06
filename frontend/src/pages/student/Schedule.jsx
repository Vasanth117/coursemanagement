import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '../../api/student';
import { FiCalendar, FiClock, FiMapPin, FiBook } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge } from '../../components/common';

const Schedule = () => {
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['studentSchedule'],
    queryFn: studentAPI.getSchedule
  });

  if (isLoading) return <LoadingSpinner />;

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
        <p className="text-gray-600 mt-1">Your weekly class timetable</p>
      </div>

      {/* Weekly Schedule */}
      <div className="grid grid-cols-1 gap-6">
        {weekDays.map((day, dayIndex) => {
          const dayClasses = schedule?.filter(c => c.schedule?.days?.includes(day)) || [];
          return (
            <Card key={day} className="animate-slide-up" style={{ animationDelay: `${dayIndex * 100}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{day}</h2>
                <Badge variant="primary">{dayClasses.length} classes</Badge>
              </div>
              {dayClasses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No classes scheduled</p>
              ) : (
                <div className="space-y-3">
                  {dayClasses.map((classItem, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all">
                      <div className="p-3 bg-blue-600 rounded-xl">
                        <FiBook className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{classItem.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{classItem.courseCode}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-700">
                          <div className="flex items-center space-x-2">
                            <FiClock className="h-4 w-4 text-blue-600" />
                            <span>{classItem.schedule?.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FiMapPin className="h-4 w-4 text-blue-600" />
                            <span>{classItem.schedule?.room}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FiBook className="h-4 w-4 text-blue-600" />
                            <span>{classItem.faculty?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Schedule;
