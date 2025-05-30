
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

const Certificate = () => {
  const { courseId, userId } = useParams();
  const [certificate, setCertificate] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificateData();
  }, [courseId, userId]);

  const fetchCertificateData = async () => {
    try {
      const { data: certData } = await supabase
        .from('certificates')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .single();

      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setCertificate(certData);
      setCourse(courseData);
      setUserProfile(profileData);
    } catch (error) {
      console.error('Error fetching certificate data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!certificate) {
    return <div className="flex items-center justify-center h-screen">Certificate not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="bg-white shadow-2xl border-8 border-purple-200">
          <CardContent className="p-12 text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-purple-800 mb-2">Certificate of Completion</h1>
              <div className="w-32 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto"></div>
            </div>

            <div className="mb-8">
              <p className="text-lg text-gray-600 mb-4">This is to certify that</p>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {userProfile?.full_name || 'Student'}
              </h2>
              <p className="text-lg text-gray-600 mb-4">has successfully completed the course</p>
              <h3 className="text-2xl font-bold text-purple-700 mb-6">
                {course?.title}
              </h3>
            </div>

            <div className="flex justify-between items-end mt-16">
              <div className="text-left">
                <div className="w-48 h-px bg-gray-400 mb-2"></div>
                <p className="text-sm text-gray-600">Date of Completion</p>
                <p className="font-semibold">
                  {new Date(certificate.issued_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">🏆</span>
                </div>
                <p className="text-xs text-gray-500">Learning Platform</p>
              </div>

              <div className="text-right">
                <div className="w-48 h-px bg-gray-400 mb-2"></div>
                <p className="text-sm text-gray-600">Instructor Signature</p>
                <p className="font-semibold">Verified</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Certificate ID: {certificate.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Certificate;
