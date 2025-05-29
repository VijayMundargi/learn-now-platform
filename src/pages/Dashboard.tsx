
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const mockCourses = [
  {
    id: 1,
    title: "Complete React Development Bootcamp",
    description: "Learn React from basics to advanced concepts with hands-on projects and real-world applications.",
    price: 2999,
    category: "Web Development",
    instructor: "John Doe",
    duration: "40 hours",
    level: "Beginner",
    image: "/placeholder.svg"
  },
  {
    id: 2,
    title: "Python for Data Science",
    description: "Master Python programming for data analysis, visualization, and machine learning applications.",
    price: 3499,
    category: "Data Science",
    instructor: "Jane Smith",
    duration: "35 hours",
    level: "Intermediate",
    image: "/placeholder.svg"
  },
  {
    id: 3,
    title: "Digital Marketing Masterclass",
    description: "Complete guide to digital marketing including SEO, social media, and content marketing strategies.",
    price: 1999,
    category: "Marketing",
    instructor: "Mike Johnson",
    duration: "25 hours",
    level: "Beginner",
    image: "/placeholder.svg"
  },
  {
    id: 4,
    title: "UI/UX Design Fundamentals",
    description: "Learn user interface and user experience design principles with practical design projects.",
    price: 2799,
    category: "Design",
    instructor: "Sarah Wilson",
    duration: "30 hours",
    level: "Beginner",
    image: "/placeholder.svg"
  },
  {
    id: 5,
    title: "Advanced JavaScript & Node.js",
    description: "Deep dive into JavaScript ES6+ features and build scalable backend applications with Node.js.",
    price: 3999,
    category: "Web Development",
    instructor: "David Brown",
    duration: "45 hours",
    level: "Advanced",
    image: "/placeholder.svg"
  },
  {
    id: 6,
    title: "Machine Learning with Python",
    description: "Comprehensive course on machine learning algorithms and implementation using Python libraries.",
    price: 4499,
    category: "Data Science",
    instructor: "Emily Davis",
    duration: "50 hours",
    level: "Advanced",
    image: "/placeholder.svg"
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');

  const categories = [...new Set(mockCourses.map(course => course.category))];

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesPrice = !selectedPrice || 
                        (selectedPrice === 'under-2000' && course.price < 2000) ||
                        (selectedPrice === '2000-3000' && course.price >= 2000 && course.price <= 3000) ||
                        (selectedPrice === 'over-3000' && course.price > 3000);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleEnroll = (courseId: number) => {
    const course = mockCourses.find(c => c.id === courseId);
    if (course) {
      toast({
        title: "Enrollment Successful!",
        description: `You have successfully enrolled in "${course.title}". A confirmation email has been sent.`,
      });
    }
  };

  const handleViewDetails = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedPrice('');
  };

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
            Discover thousands of courses and advance your career with expert-led training
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
                course={course}
                onEnroll={handleEnroll}
                onViewDetails={handleViewDetails}
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
