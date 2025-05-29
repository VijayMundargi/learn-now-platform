
import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Mock enrolled courses data
const enrolledCourses = [
  {
    id: 1,
    title: "Complete React Development Bootcamp",
    instructor: "John Doe",
    category: "Web Development",
    progress: 65,
    lastAccessed: "2 days ago",
    enrolledOn: "March 15, 2024",
    status: "In Progress"
  },
  {
    id: 2,
    title: "Python for Data Science",
    instructor: "Jane Smith",
    category: "Data Science",
    progress: 100,
    lastAccessed: "1 week ago",
    enrolledOn: "February 28, 2024",
    status: "Completed"
  },
  {
    id: 3,
    title: "Digital Marketing Masterclass",
    instructor: "Mike Johnson",
    category: "Marketing",
    progress: 30,
    lastAccessed: "5 days ago",
    enrolledOn: "March 20, 2024",
    status: "In Progress"
  }
];

const MyCourses = () => {
  const handleContinueLearning = (courseId: number) => {
    console.log(`Continue learning course ${courseId}`);
    // In a real app, this would navigate to the course content
  };

  const handleViewCertificate = (courseId: number) => {
    console.log(`View certificate for course ${courseId}`);
    // In a real app, this would show/download the certificate
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

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
                  <p className="text-3xl font-bold text-green-600">
                    {enrolledCourses.filter(c => c.status === 'Completed').length}
                  </p>
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
                  <p className="text-3xl font-bold text-blue-600">
                    {enrolledCourses.filter(c => c.status === 'In Progress').length}
                  </p>
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
          {enrolledCourses.map((course, index) => (
            <Card 
              key={course.id} 
              className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl font-bold text-gray-800">
                        {course.title}
                      </CardTitle>
                      <Badge className={getStatusColor(course.status)}>
                        {course.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-600">
                      Instructor: {course.instructor} • {course.category}
                    </CardDescription>
                  </div>
                  <div className="flex gap-3">
                    {course.status === 'Completed' ? (
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
                      <span className="text-sm font-medium text-gray-800">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  
                  {/* Course Info */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-600 pt-2 border-t">
                    <span>Enrolled on: {course.enrolledOn}</span>
                    <span>Last accessed: {course.lastAccessed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {enrolledCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses enrolled yet</h3>
            <p className="text-gray-500 mb-6">Start your learning journey by exploring our course catalog</p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
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
