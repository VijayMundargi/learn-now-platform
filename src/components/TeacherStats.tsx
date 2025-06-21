
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface TeacherStatsProps {
  stats: {
    totalCourses: number;
    publishedCourses: number;
    totalEnrollments: number;
  };
}

const TeacherStats = ({ stats }: TeacherStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalCourses}</p>
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
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-3xl font-bold text-green-600">{stats.publishedCourses}</p>
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
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalEnrollments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStats;
