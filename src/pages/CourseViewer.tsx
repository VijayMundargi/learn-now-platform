
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Play, CheckCircle, Download, ArrowLeft } from 'lucide-react';

const CourseViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      fetchCourseData();
    }
  }, [id, user]);

  const fetchCourseData = async () => {
    try {
      console.log('Fetching course data for ID:', id);

      // Check if user is enrolled
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user?.id)
        .eq('course_id', id)
        .maybeSingle();

      if (enrollmentError) {
        console.error('Error checking enrollment:', enrollmentError);
        throw enrollmentError;
      }

      if (!enrollment) {
        toast({
          title: "Access Denied",
          description: "You are not enrolled in this course",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      // Get course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) {
        console.error('Error fetching course:', courseError);
        throw courseError;
      }

      setCourse(courseData);

      // Get lessons for this course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index', { ascending: true });

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
        throw lessonsError;
      }

      console.log('Lessons data:', lessonsData);
      setLessons(lessonsData || []);
      if (lessonsData && lessonsData.length > 0) {
        setCurrentLesson(lessonsData[0]);
      }

      // Fetch user progress
      const lessonIds = lessonsData?.map(l => l.id) || [];
      const { data: progressData, error: progressError } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user?.id)
        .in('lesson_id', lessonIds);

      if (progressError) {
        console.error('Error fetching progress:', progressError);
      }

      setProgress(progressData || []);

      // Check for certificate
      const { data: certData, error: certError } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user?.id)
        .eq('course_id', id)
        .maybeSingle();

      if (certError) {
        console.error('Error fetching certificate:', certError);
      }

      setCertificate(certData);

      console.log('Course data loaded successfully');
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch course data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!lessonId || !user?.id) {
      console.error('Missing lesson ID or user ID');
      return;
    }

    try {
      console.log('Marking lesson complete:', lessonId);

      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error marking lesson complete:', error);
        throw error;
      }

      // Update local state
      setProgress(prev => {
        const exists = prev.some(p => p.lesson_id === lessonId);
        if (!exists) {
          return [...prev, { lesson_id: lessonId }];
        }
        return prev;
      });

      // Check if all lessons are complete
      const newProgress = [...progress];
      if (!newProgress.some(p => p.lesson_id === lessonId)) {
        newProgress.push({ lesson_id: lessonId });
      }
      
      if (newProgress.length === lessons.length && !certificate) {
        await generateCertificate();
      }

      toast({
        title: "Success",
        description: "Lesson marked as complete!"
      });
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete",
        variant: "destructive"
      });
    }
  };

  const generateCertificate = async () => {
    try {
      console.log('Generating certificate for course:', id);

      const { data, error } = await supabase
        .from('certificates')
        .insert({
          user_id: user?.id,
          course_id: id,
          certificate_url: `${window.location.origin}/certificate/${id}/${user?.id}`,
          issued_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error generating certificate:', error);
        throw error;
      }

      setCertificate(data);
      toast({
        title: "Congratulations!",
        description: "You've completed the course and earned a certificate!"
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error",
        description: "Failed to generate certificate",
        variant: "destructive"
      });
    }
  };

  const isLessonComplete = (lessonId: string) => {
    return progress.some(p => p.lesson_id === lessonId);
  };

  const getProgressPercentage = () => {
    return lessons.length > 0 ? (progress.length / lessons.length) * 100 : 0;
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

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Course not found</h2>
            <Button onClick={() => navigate('/my-courses')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            onClick={() => navigate('/my-courses')}
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Courses
          </Button>
        </div>

        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.title}</h1>
          <p className="text-gray-600">{course.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-0">
                {currentLesson?.video_url ? (
                  <div>
                    <video 
                      src={currentLesson.video_url}
                      controls
                      className="w-full h-96 rounded-t-lg"
                      key={currentLesson.id}
                      onError={(e) => {
                        console.error('Video error:', e);
                        console.log('Video URL:', currentLesson.video_url);
                      }}
                    />
                    <div className="p-6">
                      <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
                      <p className="text-gray-600 mb-4">
                        Lesson {lessons.findIndex(l => l.id === currentLesson.id) + 1} of {lessons.length}
                        {currentLesson.duration && ` • ${Math.floor(currentLesson.duration / 60)} minutes`}
                      </p>
                      <div className="flex gap-4">
                        {!isLessonComplete(currentLesson.id) && (
                          <Button 
                            onClick={() => markLessonComplete(currentLesson.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </Button>
                        )}
                        {isLessonComplete(currentLesson.id) && (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completed
                          </Badge>
                        )}
                        {certificate && (
                          <Button 
                            onClick={() => navigate(`/certificate/${id}/${user?.id}`)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            View Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {currentLesson ? `No video available for "${currentLesson.title}"` : 'Select a lesson to start watching'}
                      </p>
                      {currentLesson && (
                        <p className="text-sm text-gray-400 mt-2">
                          Video URL: {currentLesson.video_url || 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Course Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={getProgressPercentage()} className="h-2" />
                  <p className="text-sm text-gray-600">
                    {progress.length} of {lessons.length} lessons completed
                  </p>
                  {certificate && (
                    <Badge className="bg-green-100 text-green-700">
                      Course Completed! 🎉
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Lessons ({lessons.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessons.length > 0 ? (
                    lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          currentLesson?.id === lesson.id 
                            ? 'bg-purple-100 border-purple-300 border' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setCurrentLesson(lesson)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isLessonComplete(lesson.id) ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Play className="w-5 h-5 text-gray-400" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{lesson.title}</p>
                              <p className="text-xs text-gray-500">
                                Lesson {index + 1}
                                {lesson.duration && ` • ${Math.floor(lesson.duration / 60)} min`}
                                {lesson.video_url && ` • Video available`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No lessons available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
