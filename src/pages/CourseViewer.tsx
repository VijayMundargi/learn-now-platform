
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
import { Play, CheckCircle, Download } from 'lucide-react';

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
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          lessons(*),
          enrollments(*)
        `)
        .eq('id', id)
        .single();

      if (courseError) throw courseError;

      // Check if user is enrolled
      const isEnrolled = course.enrollments.some((e: any) => e.user_id === user?.id);
      if (!isEnrolled) {
        navigate('/dashboard');
        return;
      }

      setCourse(course);
      
      const sortedLessons = course.lessons.sort((a: any, b: any) => a.order_index - b.order_index);
      setLessons(sortedLessons);
      setCurrentLesson(sortedLessons[0]);

      // Fetch user progress
      const { data: progressData } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user?.id)
        .in('lesson_id', sortedLessons.map((l: any) => l.id));

      setProgress(progressData || []);

      // Check for certificate
      const { data: certData } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user?.id)
        .eq('course_id', id)
        .maybeSingle();

      setCertificate(certData);
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
    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user?.id,
          lesson_id: lessonId
        });

      if (error) throw error;

      setProgress([...progress, { lesson_id: lessonId }]);

      // Check if all lessons are complete
      const completedCount = progress.length + 1;
      if (completedCount === lessons.length && !certificate) {
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
      const { data, error } = await supabase
        .from('certificates')
        .insert({
          user_id: user?.id,
          course_id: id,
          certificate_url: `${window.location.origin}/certificate/${id}/${user?.id}`
        })
        .select()
        .single();

      if (error) throw error;

      setCertificate(data);
      toast({
        title: "Congratulations!",
        description: "You've completed the course and earned a certificate!"
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-0">
                {currentLesson?.video_url ? (
                  <video 
                    src={currentLesson.video_url}
                    controls
                    className="w-full h-96 rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <p className="text-gray-500">No video available</p>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{currentLesson?.title}</h2>
                  <div className="flex gap-4">
                    {!isLessonComplete(currentLesson?.id) && (
                      <Button 
                        onClick={() => markLessonComplete(currentLesson?.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                    {certificate && (
                      <Button 
                        onClick={() => window.open(certificate.certificate_url, '_blank')}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Certificate
                      </Button>
                    )}
                  </div>
                </div>
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
                <CardTitle>Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        currentLesson?.id === lesson.id 
                          ? 'bg-purple-100 border-purple-300' 
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
                              {Math.floor(lesson.duration / 60)} min
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
