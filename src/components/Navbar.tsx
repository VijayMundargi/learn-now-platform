
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Logout logic would go here
    console.log('Logging out...');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SC</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SkillCert
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/my-courses" 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
            >
              My Courses
            </Link>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
            >
              Logout
            </Button>
          </div>
          
          <div className="md:hidden">
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
