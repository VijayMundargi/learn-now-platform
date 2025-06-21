
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users, Eye } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  is_published: boolean;
  enrollments?: { count: number }[];
}

interface TeacherCourseCardProps {
  course: Course;
  onDelete: (courseId: string) => void;
  onTogglePublish: (courseId: string, currentStatus: boolean) => void;
}

const TeacherCourseCard = ({ course, onDelete, onTogglePublish }: TeacherCourseCardProps) => {
  const navigate = useNavigate();

  const handleViewCourse = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge 
            className={course.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
          >
            {course.is_published ? 'Published' : 'Draft'}
          </Badge>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/teacher/edit-course/${course.id}`)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(course.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Price: ₹{course.price}</span>
            <span>Category: {course.category}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              {course.enrollments?.[0]?.count || 0} students
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewCourse}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant={course.is_published ? "outline" : "default"}
                onClick={() => onTogglePublish(course.id, course.is_published)}
              >
                {course.is_published ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherCourseCard;
