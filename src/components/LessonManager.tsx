
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VideoUpload from './VideoUpload';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface Lesson {
  id?: string;
  title: string;
  video_url: string;
  duration: number;
  order_index: number;
}

interface LessonManagerProps {
  lessons: Lesson[];
  onLessonsChange: (lessons: Lesson[]) => void;
  courseId?: string;
}

const LessonManager = ({ lessons, onLessonsChange, courseId }: LessonManagerProps) => {
  const addLesson = () => {
    const newLesson: Lesson = {
      title: '',
      video_url: '',
      duration: 0,
      order_index: lessons.length + 1
    };
    onLessonsChange([...lessons, newLesson]);
  };

  const updateLesson = (index: number, field: keyof Lesson, value: string | number) => {
    const updatedLessons = lessons.map((lesson, i) => 
      i === index ? { ...lesson, [field]: value } : lesson
    );
    onLessonsChange(updatedLessons);
  };

  const removeLesson = (index: number) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    // Reorder remaining lessons
    const reorderedLessons = updatedLessons.map((lesson, i) => ({
      ...lesson,
      order_index: i + 1
    }));
    onLessonsChange(reorderedLessons);
  };

  const moveLesson = (fromIndex: number, toIndex: number) => {
    const updatedLessons = [...lessons];
    const [movedLesson] = updatedLessons.splice(fromIndex, 1);
    updatedLessons.splice(toIndex, 0, movedLesson);
    
    // Reorder all lessons
    const reorderedLessons = updatedLessons.map((lesson, i) => ({
      ...lesson,
      order_index: i + 1
    }));
    onLessonsChange(reorderedLessons);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Course Lessons</h3>
        <Button type="button" onClick={addLesson} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {lessons.map((lesson, index) => (
        <Card key={index} className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                Lesson {lesson.order_index}
              </CardTitle>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeLesson(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`lesson-title-${index}`}>Lesson Title</Label>
              <Input
                id={`lesson-title-${index}`}
                value={lesson.title}
                onChange={(e) => updateLesson(index, 'title', e.target.value)}
                placeholder="Enter lesson title"
                required
              />
            </div>

            <div>
              <Label>Lesson Video</Label>
              <VideoUpload
                onVideoUploaded={(url) => updateLesson(index, 'video_url', url)}
                currentVideo={lesson.video_url}
                bucket="lesson-videos"
                folder={courseId || 'temp'}
              />
            </div>

            <div>
              <Label htmlFor={`lesson-duration-${index}`}>Duration (minutes)</Label>
              <Input
                id={`lesson-duration-${index}`}
                type="number"
                value={lesson.duration}
                onChange={(e) => updateLesson(index, 'duration', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {lessons.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No lessons added yet. Click "Add Lesson" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default LessonManager;
