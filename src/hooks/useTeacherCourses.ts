
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useTeacherCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0
  });
  const [loading, setLoading] = useState(true);

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
        .select('id, is_published')
        .eq('instructor_id', user.id);

      const courseIds = coursesData?.map(c => c.id) || [];

      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select('id')
        .in('course_id', courseIds);

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

  useEffect(() => {
    fetchCourses();
    fetchStats();
  }, [user]);

  return {
    courses,
    stats,
    loading,
    handleDeleteCourse,
    handleTogglePublish,
    refetch: () => {
      fetchCourses();
      fetchStats();
    }
  };
};
