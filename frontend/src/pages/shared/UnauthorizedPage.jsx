import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiHome } from 'react-icons/fi';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <FiShield className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow-lg hover:shadow-xl"
        >
          <FiHome className="w-5 h-5" />
          <span>Go Home</span>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
