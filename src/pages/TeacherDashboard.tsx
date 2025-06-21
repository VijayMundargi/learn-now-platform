
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import TeacherStats from '@/components/TeacherStats';
import TeacherCourseCard from '@/components/TeacherCourseCard';
import EmptyCoursesState from '@/components/EmptyCoursesState';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherCourses } from '@/hooks/useTeacherCourses';
import { Plus } from 'lucide-react';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { courses, stats, loading, handleDeleteCourse, handleTogglePublish } = useTeacherCourses();

  useEffect(() => {
    if (userProfile?.role !== 'teacher') {
      navigate('/dashboard');
      return;
    }
  }, [userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
            <p className="text-gray-600">Manage your courses and track your impact</p>
          </div>
          <Button 
            onClick={() => navigate('/teacher/create-course')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>

        {/* Stats Cards */}
        <TeacherStats stats={stats} />

        {/* Courses List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
          
          {courses.length === 0 ? (
            <EmptyCoursesState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <TeacherCourseCard
                  key={course.id}
                  course={course}
                  onDelete={handleDeleteCourse}
                  onTogglePublish={handleTogglePublish}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
