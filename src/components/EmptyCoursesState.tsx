
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const EmptyCoursesState = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardContent className="p-12 text-center">
        <div className="text-6xl text-gray-300 mb-4">📖</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses yet</h3>
        <p className="text-gray-500 mb-6">Create your first course to get started</p>
        <Button 
          onClick={() => navigate('/teacher/create-course')}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyCoursesState;
