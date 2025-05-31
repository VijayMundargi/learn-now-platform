
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      console.log('Fetching enrolled courses for user:', user?.id);

      // First get enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user?.id)
        .order('enrolled_at', { ascending: false });

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        throw enrollmentsError;
      }

      if (!enrollments || enrollments.length === 0) {
        console.log('No enrollments found');
        setEnrolledCourses([]);
        setLoading(false);
        return;
      }

      console.log('Enrollments found:', enrollments);

      // Get course details for each enrollment
      const courseIds = enrollments.map(e => e.course_id);
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds);

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        throw coursesError;
      }

      // Get instructor profiles
      const instructorIds = [...new Set(courses?.map(c => c.instructor_id) || [])];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', instructorIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without instructor names if profiles fetch fails
      }

      // Get lessons for progress calculation
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, course_id')
        .in('course_id', courseIds);

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
      }

      // Get user's lesson progress
      const lessonIds = lessons?.map(l => l.id) || [];
      const { data: progress, error: progressError } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user?.id)
        .in('lesson_id', lessonIds);

      if (progressError) {
        console.error('Error fetching progress:', progressError);
      }

      // Get certificates
      const { data: certificates, error: certificatesError } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user?.id)
        .in('course_id', courseIds);

      if (certificatesError) {
        console.error('Error fetching certificates:', certificatesError);
      }

      // Combine all data
      const coursesWithDetails = enrollments.map(enrollment => {
        const course = courses?.find(c => c.id === enrollment.course_id);
        const instructor = profiles?.find(p => p.id === course?.instructor_id);
        const courseLessons = lessons?.filter(l => l.course_id === enrollment.course_id) || [];
        const completedLessons = progress?.filter(p => 
          courseLessons.some(l => l.id === p.lesson_id)
        ) || [];
        const certificate = certificates?.find(c => c.course_id === enrollment.course_id);

        const totalLessons = courseLessons.length;
        const completedCount = completedLessons.length;
        const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        return {
          ...enrollment,
          course: course || {},
          instructor_name: instructor?.full_name || 'Unknown Instructor',
          totalLessons,
          completedLessons: completedCount,
          progress: progressPercentage,
          isCompleted: progressPercentage === 100,
          hasCertificate: !!certificate,
          certificate
        };
      });

      console.log('Final courses with details:', coursesWithDetails);
      setEnrolledCourses(coursesWithDetails);
    } catch (error) {
      console.error('Error in fetchEnrolledCourses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLearning = (courseId: string) => {
    navigate(`/course-viewer/${courseId}`);
  };

  const handleViewCertificate = (courseId: string) => {
    navigate(`/certificate/${courseId}/${user?.id}`);
  };

  const getStatusColor = (isCompleted: boolean) => {
    return isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading your courses...</div>
        </div>
      </div>
    );
  }

  const completedCoursesCount = enrolledCourses.filter(c => c.isCompleted).length;
  const inProgressCoursesCount = enrolledCourses.filter(c => !c.isCompleted).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Courses</h1>
          <p className="text-gray-600">
            Track your learning progress and continue your education journey
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-3xl font-bold text-gray-800">{enrolledCourses.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedCoursesCount}</p>
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
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{inProgressCoursesCount}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">⏳</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        <div className="space-y-6">
          {enrolledCourses.map((enrollment, index) => {
            const course = enrollment.course;
            return (
              <Card 
                key={enrollment.id} 
                className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl font-bold text-gray-800">
                          {course.title || 'Untitled Course'}
                        </CardTitle>
                        <Badge className={getStatusColor(enrollment.isCompleted)}>
                          {enrollment.isCompleted ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                      <CardDescription className="text-gray-600">
                        Instructor: {enrollment.instructor_name} • {course.category || 'General'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-3">
                      {enrollment.isCompleted && enrollment.hasCertificate ? (
                        <Button 
                          onClick={() => handleViewCertificate(course.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          View Certificate
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleContinueLearning(course.id)}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          Continue Learning
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-800">
                          {enrollment.completedLessons}/{enrollment.totalLessons} lessons ({enrollment.progress}%)
                        </span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>
                    
                    {/* Course Info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-600 pt-2 border-t">
                      <span>Enrolled on: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                      <span>Price: ₹{course.price || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {enrolledCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses enrolled yet</h3>
            <p className="text-gray-500 mb-6">Start your learning journey by exploring our course catalog</p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              Browse Courses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
