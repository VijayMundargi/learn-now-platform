
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!instructor_id(full_name),
          enrollments(user_id)
        `)
        .eq('is_published', true)
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

  const categories = [...new Set(courses.map(course => course.category).filter(Boolean))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesPrice = !selectedPrice || 
                        (selectedPrice === 'under-2000' && course.price < 2000) ||
                        (selectedPrice === '2000-3000' && course.price >= 2000 && course.price <= 3000) ||
                        (selectedPrice === 'over-3000' && course.price > 3000);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in courses",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (existingEnrollment) {
        toast({
          title: "Already Enrolled",
          description: "You are already enrolled in this course",
        });
        return;
      }

      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId
        });

      if (error) throw error;

      const course = courses.find(c => c.id === courseId);
      toast({
        title: "Enrollment Successful!",
        description: `You have successfully enrolled in "${course?.title}". Start learning now!`,
      });

      // Refresh courses to update enrollment status
      fetchCourses();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedPrice('');
  };

  const isEnrolled = (course: any) => {
    return course.enrollments?.some((enrollment: any) => enrollment.user_id === user?.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading courses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Learn Skills That Matter
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 animate-fade-in">
            Discover courses created by expert instructors and advance your career
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 h-12">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                <SelectTrigger className="w-48 h-12">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-2000">Under ₹2,000</SelectItem>
                  <SelectItem value="2000-3000">₹2,000 - ₹3,000</SelectItem>
                  <SelectItem value="over-3000">Over ₹3,000</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={clearFilters}
                variant="outline"
                className="h-12 border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Course Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Available Courses ({filteredCourses.length})
          </h2>
          <p className="text-gray-600">
            Discover our comprehensive collection of professional courses
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <div 
              key={course.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CourseCard
                course={{
                  id: course.id,
                  title: course.title,
                  description: course.description || '',
                  price: course.price || 0,
                  category: course.category || 'General',
                  instructor: course.profiles?.full_name || 'Unknown Instructor',
                  duration: '40 hours', // TODO: Calculate from lessons
                  level: course.level || 'Beginner',
                  image: course.thumbnail_url || "/placeholder.svg"
                }}
                onEnroll={() => handleEnroll(course.id)}
                onViewDetails={() => handleViewDetails(course.id)}
                isEnrolled={isEnrolled(course)}
              />
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
