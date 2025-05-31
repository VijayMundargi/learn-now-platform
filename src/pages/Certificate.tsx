
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const Certificate = () => {
  const { courseId, userId } = useParams();
  const [certificate, setCertificate] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificateData();
  }, [courseId, userId]);

  const fetchCertificateData = async () => {
    try {
      // Get certificate data
      const { data: certData } = await supabase
        .from('certificates')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .single();

      // Get course data
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      // Get user profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Get user email from auth users (if accessible)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      let email = '';
      
      if (user && user.id === userId) {
        email = user.email || '';
      } else {
        // If we can't get the email from auth, we'll use a placeholder
        email = 'student@example.com';
      }

      setCertificate(certData);
      setCourse(courseData);
      setUserProfile(profileData);
      setUserEmail(email);
    } catch (error) {
      console.error('Error fetching certificate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a new window for the certificate
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate - ${course?.title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: linear-gradient(135deg, #f3e8ff, #dbeafe, #e0e7ff);
            }
            .certificate { 
              max-width: 800px; 
              margin: 0 auto; 
              background: white; 
              padding: 60px; 
              text-align: center; 
              border: 8px solid #d8b4fe;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }
            .header { margin-bottom: 40px; }
            .title { font-size: 36px; font-weight: bold; color: #7c3aed; margin-bottom: 10px; }
            .divider { width: 120px; height: 4px; background: linear-gradient(to right, #7c3aed, #2563eb); margin: 0 auto; }
            .content { margin: 40px 0; }
            .certify-text { font-size: 18px; color: #4b5563; margin-bottom: 20px; }
            .student-name { font-size: 32px; font-weight: bold; color: #1f2937; margin: 20px 0; }
            .course-title { font-size: 24px; font-weight: bold; color: #7c3aed; margin: 20px 0; }
            .footer { display: flex; justify-content: space-between; align-items: end; margin-top: 60px; }
            .footer-item { text-align: center; }
            .footer-left, .footer-right { text-align: left; width: 200px; }
            .footer-right { text-align: right; }
            .line { width: 200px; height: 1px; background: #9ca3af; margin-bottom: 8px; }
            .label { font-size: 14px; color: #6b7280; }
            .value { font-weight: 600; }
            .seal { width: 80px; height: 80px; background: linear-gradient(135deg, #7c3aed, #2563eb); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
            .certificate-id { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <h1 class="title">Certificate of Completion</h1>
              <div class="divider"></div>
            </div>
            
            <div class="content">
              <p class="certify-text">This is to certify that</p>
              <h2 class="student-name">${userProfile?.full_name || 'Student'}</h2>
              <p class="certify-text">Email: ${userEmail}</p>
              <p class="certify-text">has successfully completed the course</p>
              <h3 class="course-title">${course?.title}</h3>
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <div class="line"></div>
                <p class="label">Date of Completion</p>
                <p class="value">${new Date(certificate?.issued_at).toLocaleDateString()}</p>
              </div>
              
              <div class="footer-item">
                <div class="seal">🏆</div>
                <p style="font-size: 12px; color: #6b7280;">Learning Platform</p>
              </div>
              
              <div class="footer-right">
                <div class="line"></div>
                <p class="label">Instructor Signature</p>
                <p class="value">Verified</p>
              </div>
            </div>
            
            <div class="certificate-id">
              <p>Certificate ID: ${certificate?.id}</p>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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
        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Print Certificate
          </Button>
          <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

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
              <p className="text-md text-gray-600 mb-4">
                Email: {userEmail}
              </p>
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
