
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Clock, User, Star, Play, CheckCircle, ArrowLeft } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [instructor, setInstructor] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      console.log('Fetching course details for ID:', id);

      // Get course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (courseError) {
        console.error('Error fetching course:', courseError);
        throw courseError;
      }

      if (!courseData) {
        toast({
          title: "Course not found",
          description: "The course you're looking for doesn't exist or is not published",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      setCourse(courseData);

      // Get instructor details
      const { data: instructorData, error: instructorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', courseData.instructor_id)
        .single();

      if (instructorError) {
        console.error('Error fetching instructor:', instructorError);
      }

      setInstructor(instructorData);

      // Get lessons for this course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index', { ascending: true });

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
      }

      console.log('Lessons data:', lessonsData);
      setLessons(lessonsData || []);

      // Check if user is enrolled (if logged in)
      if (user) {
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', id)
          .maybeSingle();

        if (enrollmentError) {
          console.error('Error checking enrollment:', enrollmentError);
        }

        setIsEnrolled(!!enrollmentData);
      }

    } catch (error) {
      console.error('Error fetching course details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch course details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in courses",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (isEnrolled) {
      // Navigate to course viewer if already enrolled
      navigate(`/course-viewer/${id}`);
      return;
    }

    setEnrolling(true);

    try {
      console.log('Enrolling in course:', id);

      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: id
        });

      if (error) {
        console.error('Error enrolling:', error);
        throw error;
      }

      setIsEnrolled(true);
      toast({
        title: "Enrollment Successful!",
        description: `You have successfully enrolled in "${course?.title}". Start learning now!`,
      });

      // Navigate to course viewer
      navigate(`/course-viewer/${id}`);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setEnrolling(false);
    }
  };

  const calculateTotalDuration = () => {
    const totalMinutes = lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading course details...</div>
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
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
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
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-0">
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-purple-600 text-white">
                      {course.category || 'General'}
                    </Badge>
                    <Badge variant="secondary">
                      {course.level || 'Beginner'}
                    </Badge>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    {course.title}
                  </h1>
                  
                  <p className="text-gray-600 mb-6">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                        {instructor?.full_name || 'Unknown Instructor'}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{calculateTotalDuration()}</span>
                    </div>

                    <div className="flex items-center">
                      <Play className="w-4 h-4 mr-2" />
                      <span>{lessons.length} lessons</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            {course.what_you_will_learn && course.what_you_will_learn.length > 0 && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.what_you_will_learn.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.requirements.map((requirement: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-purple-600 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Course Content / Lessons */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Course Content ({lessons.length} lessons)</CardTitle>
              </CardHeader>
              <CardContent>
                {lessons.length > 0 ? (
                  <div className="space-y-3">
                    {lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Play className="w-5 h-5 text-purple-600 mr-3" />
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {lesson.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Lesson {index + 1}
                              {lesson.duration && ` • ${Math.floor(lesson.duration / 60)} min`}
                            </p>
                          </div>
                        </div>
                        {lesson.video_url && (
                          <Badge variant="secondary" className="text-xs">
                            Video Available
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No lessons have been added to this course yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="bg-white shadow-lg border-0 sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    ₹{course.price || 0}
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <Star className="w-4 h-4 text-gray-300" />
                    <span className="text-sm text-gray-600 ml-2">(4.0)</span>
                  </div>
                </div>

                <Button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className={`w-full mb-4 ${
                    isEnrolled 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                  }`}
                >
                  {enrolling ? 'Enrolling...' : isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                </Button>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Duration:</span>
                    <span className="font-medium">{calculateTotalDuration()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Lessons:</span>
                    <span className="font-medium">{lessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{course.level || 'Beginner'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Certificate:</span>
                    <span className="font-medium">Yes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Card */}
            {instructor && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {instructor.full_name?.charAt(0) || 'I'}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {instructor.full_name || 'Unknown Instructor'}
                    </h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {instructor.role || 'Instructor'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
