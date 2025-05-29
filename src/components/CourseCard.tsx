
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  instructor: string;
  duration: string;
  level: string;
  image: string;
}

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: number) => void;
  onViewDetails: (courseId: number) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEnroll, onViewDetails }) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white overflow-hidden">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-purple-400 via-blue-500 to-indigo-600 flex items-center justify-center">
          <div className="text-white text-6xl font-bold opacity-20">
            {course.title.charAt(0)}
          </div>
        </div>
        <Badge className="absolute top-3 right-3 bg-white text-purple-600 hover:bg-white">
          {course.category}
        </Badge>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {course.title}
        </CardTitle>
        <CardDescription className="text-gray-600 line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Instructor: {course.instructor}</span>
          <span>{course.duration}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-green-600">₹{course.price}</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {course.level}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onViewDetails(course.id)}
            variant="outline" 
            className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            View Details
          </Button>
          <Button 
            onClick={() => onEnroll(course.id)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            Enroll Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
