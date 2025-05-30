import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import LessonManager from '@/components/LessonManager';

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    level: 'beginner',
    what_you_will_learn: [''],
    requirements: [''],
    thumbnail_url: ''
  });
  const [lessons, setLessons] = useState<any[]>([]);

  const categories = [
    'Web Development',
    'Data Science',
    'Marketing',
    'Design',
    'Business',
    'Photography',
    'Music',
    'Health & Fitness',
    'Language Learning',
    'Personal Development'
  ];

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const { data: course, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        title: course.title,
        description: course.description || '',
        category: course.category || '',
        price: course.price?.toString() || '0',
        level: course.level,
        what_you_will_learn: course.what_you_will_learn || [''],
        requirements: course.requirements || [''],
        thumbnail_url: course.thumbnail_url || ''
      });

      if (course.lessons) {
        const sortedLessons = course.lessons
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((lesson: any) => ({
            ...lesson,
            duration: Math.floor(lesson.duration / 60) // Convert seconds to minutes
          }));
        setLessons(sortedLessons);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "Error",
        description: "Failed to fetch course details",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setLoading(true);
    
    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        level: formData.level,
        what_you_will_learn: formData.what_you_will_learn.filter(item => item.trim() !== ''),
        requirements: formData.requirements.filter(item => item.trim() !== ''),
        thumbnail_url: formData.thumbnail_url,
        updated_at: new Date().toISOString()
      };

      const { error: courseError } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id);

      if (courseError) throw courseError;

      // Delete existing lessons and insert new ones
      const { error: deleteError } = await supabase
        .from('lessons')
        .delete()
        .eq('course_id', id);

      if (deleteError) throw deleteError;

      // Insert updated lessons
      if (lessons.length > 0) {
        const lessonsData = lessons.map(lesson => ({
          course_id: id,
          title: lesson.title,
          video_url: lesson.video_url,
          duration: lesson.duration * 60, // Convert minutes to seconds
          order_index: lesson.order_index
        }));

        const { error: lessonsError } = await supabase
          .from('lessons')
          .insert(lessonsData);

        if (lessonsError) throw lessonsError;
      }

      toast({
        title: "Success",
        description: "Course updated successfully!"
      });

      navigate('/teacher/dashboard');
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleArrayChange = (index: number, value: string, field: 'what_you_will_learn' | 'requirements') => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const addArrayItem = (field: 'what_you_will_learn' | 'requirements') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const removeArrayItem = (index: number, field: 'what_you_will_learn' | 'requirements') => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Edit Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter course title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ImageUpload
                onImageUploaded={(url) => setFormData({...formData, thumbnail_url: url})}
                currentImage={formData.thumbnail_url}
                bucket="course-thumbnails"
                folder={user?.id || 'temp'}
              />

              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your course..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0 for free course"
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="level">Difficulty Level</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label>What you'll learn</Label>
                {formData.what_you_will_learn.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'what_you_will_learn')}
                      placeholder="Learning outcome"
                    />
                    {formData.what_you_will_learn.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeArrayItem(index, 'what_you_will_learn')}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('what_you_will_learn')}
                >
                  Add Learning Outcome
                </Button>
              </div>

              <div className="space-y-4">
                <Label>Requirements</Label>
                {formData.requirements.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'requirements')}
                      placeholder="Course requirement"
                    />
                    {formData.requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeArrayItem(index, 'requirements')}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('requirements')}
                >
                  Add Requirement
                </Button>
              </div>

              <LessonManager
                lessons={lessons}
                onLessonsChange={setLessons}
                courseId={id}
              />

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {loading ? 'Updating...' : 'Update Course'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/teacher/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditCourse;
