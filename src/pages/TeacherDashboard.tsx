
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Users, Eye } from 'lucide-react';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.role !== 'teacher') {
      navigate('/dashboard');
      return;
    }
    fetchCourses();
    fetchStats();
  }, [user, userProfile]);

  const fetchCourses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          enrollments(count)
        `)
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('is_published')
        .eq('instructor_id', user.id);

      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select('id')
        .in('course_id', 
          coursesData?.map(c => c.id) || []
        );

      setStats({
        totalCourses: coursesData?.length || 0,
        publishedCourses: coursesData?.filter(c => c.is_published).length || 0,
        totalEnrollments: enrollmentsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course deleted successfully"
      });
      
      fetchCourses();
      fetchStats();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive"
      });
    }
  };

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: !currentStatus })
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Course ${!currentStatus ? 'published' : 'unpublished'} successfully`
      });
      
      fetchCourses();
      fetchStats();
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "Failed to update course status",
        variant: "destructive"
      });
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalCourses}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xl">📚</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-3xl font-bold text-green-600">{stats.publishedCourses}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalEnrollments}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
          
          {courses.length === 0 ? (
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <div className="text-6xl text-gray-300 mb-4">📖</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses yet</h3>
                <p className="text-gray-500 mb-6">Create your first course to get started</p>
                <Button 
                  onClick={() => navigate('/teacher/create-course')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge 
                        className={course.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                      >
                        {course.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/teacher/edit-course/${course.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Price: ₹{course.price}</span>
                        <span>Category: {course.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          {course.enrollments?.[0]?.count || 0} students
                        </div>
                        <Button
                          size="sm"
                          variant={course.is_published ? "outline" : "default"}
                          onClick={() => handleTogglePublish(course.id, course.is_published)}
                        >
                          {course.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
