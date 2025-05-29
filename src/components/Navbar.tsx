
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDashboardLink = () => {
    if (userProfile?.role === 'teacher') {
      return '/teacher/dashboard';
    }
    return '/dashboard';
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? getDashboardLink() : "/"} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SC</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SkillCert
            </span>
          </Link>
          
          {user ? (
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to={getDashboardLink()} 
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
              >
                {userProfile?.role === 'teacher' ? 'My Courses' : 'Browse Courses'}
              </Link>
              {userProfile?.role === 'student' && (
                <Link 
                  to="/my-courses" 
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
                >
                  My Enrollments
                </Link>
              )}
              {userProfile?.role === 'teacher' && (
                <Link 
                  to="/teacher/create-course" 
                  className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
                >
                  Create Course
                </Link>
              )}
              <span className="text-sm text-gray-600">
                Welcome, {userProfile?.full_name || 'User'}
              </span>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/login"
                className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
              >
                Login
              </Link>
              <Link 
                to="/signup"
              >
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
          
          <div className="md:hidden">
            {user ? (
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
