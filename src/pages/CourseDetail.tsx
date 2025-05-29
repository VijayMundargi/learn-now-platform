
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

// Mock course data (in a real app, this would come from an API)
const mockCourses = [
  {
    id: 1,
    title: "Complete React Development Bootcamp",
    description: "Learn React from basics to advanced concepts with hands-on projects and real-world applications. This comprehensive course covers everything you need to become a proficient React developer.",
    fullDescription: "This comprehensive React bootcamp is designed to take you from a complete beginner to an advanced React developer. You'll learn modern React concepts including hooks, context API, state management, and build real-world projects that you can add to your portfolio.",
    price: 2999,
    category: "Web Development",
    instructor: "John Doe",
    duration: "40 hours",
    level: "Beginner",
    image: "/placeholder.svg",
    modules: [
      "Introduction to React and JSX",
      "Components and Props",
      "State and Event Handling",
      "React Hooks",
      "Context API and State Management",
      "Routing with React Router",
      "Building Real-world Projects",
      "Deployment and Best Practices"
    ],
    prerequisites: ["Basic HTML, CSS, and JavaScript knowledge", "Familiarity with ES6+ syntax"],
    whatYouLearn: [
      "Build modern React applications from scratch",
      "Master React hooks and functional components",
      "Implement state management solutions",
      "Create responsive and interactive user interfaces",
      "Deploy React applications to production"
    ]
  }
];

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = parseInt(id || '1');
  
  // In a real app, you'd fetch the course data based on the ID
  const course = mockCourses.find(c => c.id === courseId) || mockCourses[0];

  const handleEnroll = () => {
    toast({
      title: "Enrollment Successful!",
      description: `You have successfully enrolled in "${course.title}". A confirmation email has been sent to your registered email address.`,
    });
    
    // Redirect to My Courses after a short delay
    setTimeout(() => {
      navigate('/my-courses');
    }, 2000);
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          onClick={handleGoBack}
          variant="outline"
          className="mb-6 border-purple-200 text-purple-600 hover:bg-purple-50"
        >
          ← Back to Courses
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-purple-100 text-purple-700">
                    {course.category}
                  </Badge>
                  <Badge variant="outline">
                    {course.level}
                  </Badge>
                  <Badge variant="outline">
                    {course.duration}
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  {course.description}
                </CardDescription>
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <p className="text-sm text-gray-600">Instructor</p>
                    <p className="font-semibold text-gray-800">{course.instructor}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-green-600">₹{course.price}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Course Description */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {course.fullDescription}
                </p>
                
                <Separator className="my-6" />
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">What You'll Learn</h3>
                    <ul className="space-y-2">
                      {course.whatYouLearn.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Prerequisites</h3>
                    <ul className="space-y-2">
                      {course.prerequisites.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Modules */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle>Course Curriculum</CardTitle>
                <CardDescription>
                  {course.modules.length} modules • {course.duration} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {course.modules.map((module, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{module}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="shadow-lg border-0 bg-white sticky top-20">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl font-bold">
                    {course.title.charAt(0)}
                  </span>
                </div>
                <CardTitle className="text-2xl">
                  ₹{course.price}
                </CardTitle>
                <CardDescription>
                  One-time payment • Lifetime access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleEnroll}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg"
                >
                  Enroll Now
                </Button>
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{course.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Instructor:</span>
                    <span className="font-medium">{course.instructor}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
