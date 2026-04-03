import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentAPI } from '../../api/student';
import { FiMessageSquare, FiClock, FiUser, FiSearch, FiFilter, FiCheckCircle, FiBook, FiPaperclip, FiInfo, FiTag } from 'react-icons/fi';
import { LoadingSpinner, Card, Badge, Button } from '../../components/common';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const queryClient = useQueryClient();
  const { user } = useSelector(state => state.auth);

  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['studentAnnouncements', { search: searchTerm, priority: priorityFilter, type: typeFilter }],
    queryFn: () => studentAPI.getAnnouncements({ 
      search: searchTerm, 
      priority: priorityFilter === 'all' ? undefined : priorityFilter,
      type: typeFilter === 'all' ? undefined : typeFilter,
      sort: '-createdAt'
    })
  });

  const markReadMutation = useMutation({
    mutationFn: studentAPI.markAnnouncementRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['studentAnnouncements']);
      toast.success('Announcement marked as read');
    },
    onError: () => toast.error('Failed to mark as read')
  });

  const announcements = announcementsData?.data || [];

  const isRead = (announcement) => {
    return announcement.readBy?.some(read => 
      (typeof read.user === 'string' ? read.user : read.user?._id) === user?._id
    );
  };

  if (isLoading && !announcements.length) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="animate-slide-up">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
              <FiMessageSquare className="text-white w-8 h-8" />
            </div>
            Announcements
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Official updates from your courses and departments</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group min-w-[280px]">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none w-full transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative group">
              <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-12 pr-10 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all text-gray-700 min-w-[160px]"
              >
                <option value="all">All Types</option>
                <option value="general">General</option>
                <option value="urgent">Urgent</option>
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="event">Event</option>
              </select>
            </div>

            <div className="relative group">
              <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="pl-12 pr-10 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-all text-gray-700 min-w-[160px]"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {announcements.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-24 text-center border-dashed border-2 bg-gray-50/50">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
            <FiInfo className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">No announcements yet</h3>
          <p className="text-gray-500 max-w-sm mt-3 text-lg">
            {searchTerm || priorityFilter !== 'all' || typeFilter !== 'all'
              ? "We couldn't find any announcements matching your current search criteria."
              : "Items posted by your departments or instructors will appear here. No news is good news!"}
          </p>
          {(searchTerm || priorityFilter !== 'all' || typeFilter !== 'all') && (
            <Button 
              variant="secondary" 
              className="mt-8 rounded-xl px-8"
              onClick={() => { setSearchTerm(''); setPriorityFilter('all'); setTypeFilter('all'); }}
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {announcements.map((announcement, index) => {
            const isUnread = !isRead(announcement);
            return (
              <Card 
                key={announcement._id} 
                className={`group flex flex-col md:flex-row gap-6 p-6 transition-all duration-300 relative border-l-8 overflow-hidden
                  ${isUnread ? 'bg-white shadow-xl shadow-blue-500/5 ring-1 ring-blue-500/10' : 'bg-white/80 opacity-90 hover:opacity-100'}
                  hover:scale-[1.01] animate-slide-up
                `}
                style={{ 
                  borderLeftColor: 
                    announcement.priority === 'critical' ? '#ef4444' : 
                    announcement.priority === 'high' ? '#f59e0b' : 
                    announcement.priority === 'medium' ? '#3b82f6' : '#94a3b8',
                  animationDelay: `${index * 80}ms`
                }}
              >
                {/* Visual indicator for unread */}
                {isUnread && (
                  <div className="absolute top-4 right-4 animate-pulse">
                    <span className="flex h-3 w-3 rounded-full bg-blue-600"></span>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-3">
                        <Badge variant={
                          announcement.type === 'assignment' ? 'warning' :
                          announcement.type === 'exam' ? 'danger' :
                          announcement.type === 'urgent' ? 'danger' : 'primary'
                        } className="uppercase tracking-widest text-[10px]">
                          {announcement.type}
                        </Badge>
                        <h3 className={`text-2xl font-bold ${isUnread ? 'text-gray-900 text-shadow-sm' : 'text-gray-700'}`}>
                          {announcement.title}
                        </h3>
                       </div>
                    </div>
                    
                    {isUnread && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        icon={FiCheckCircle}
                        className="rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-none group/btn"
                        onClick={() => markReadMutation.mutate(announcement._id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 mb-6">
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiBook className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Course</span>
                        <span className="text-sm font-bold text-gray-700">{announcement.course?.code || "GENERAL"}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FiUser className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Posted By</span>
                        <span className="text-sm font-semibold text-gray-700">{announcement.createdBy?.name || "Administrator"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <FiClock className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Date Posted</span>
                        <span className="text-sm font-medium text-gray-700">{format(new Date(announcement.createdAt), 'MMM d, yyyy • p')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative group/content bg-gray-50/30 rounded-2xl p-4 border border-gray-50 group-hover:border-blue-100 transition-all">
                    <p className={`text-lg leading-relaxed whitespace-pre-wrap ${isUnread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                      {announcement.content}
                    </p>
                  </div>

                  {announcement.attachments?.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                        <FiPaperclip className="animate-bounce" /> Attachments ({announcement.attachments.length})
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {announcement.attachments.map((file, idx) => (
                          <a 
                            key={idx}
                            href={file.path || file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-2 bg-white shadow-sm border border-gray-100 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all text-sm font-semibold text-blue-600"
                          >
                            <span className="bg-blue-50 group-hover/attachment:bg-blue-400 p-1 rounded-md transition-colors">
                              <FiPaperclip className="w-4 h-4" />
                            </span>
                            {file.originalName || file.filename || file.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Announcements;
