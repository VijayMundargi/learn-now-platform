
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Star } from 'lucide-react';

interface Course {
  id: number | string;
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
  onEnroll: (courseId: number | string) => void;
  onViewDetails: (courseId: number | string) => void;
  isEnrolled?: boolean;
}

const CourseCard = ({ course, onEnroll, onViewDetails, isEnrolled = false }: CourseCardProps) => {
  return (
    <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-purple-600 text-white hover:bg-purple-700">
            {course.category}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            {course.level}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2 mb-2">
          {course.title}
        </CardTitle>
        <CardDescription className="text-gray-600 line-clamp-3">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="py-3">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium">{course.instructor}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{course.duration}</span>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <Star className="w-4 h-4 text-gray-300" />
              <span className="text-sm text-gray-600 ml-2">(4.0)</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-purple-600">₹{course.price}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 gap-3">
        <Button
          onClick={() => onViewDetails(course.id)}
          variant="outline"
          className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
        >
          View Details
        </Button>
        <Button
          onClick={() => onEnroll(course.id)}
          disabled={isEnrolled}
          className={`flex-1 ${
            isEnrolled 
              ? 'bg-green-100 text-green-700 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
          }`}
        >
          {isEnrolled ? 'Enrolled' : 'Enroll Now'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
