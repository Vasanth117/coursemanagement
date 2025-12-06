import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm, RoleSelector } from '../../components/auth';
import { FiShield } from 'react-icons/fi';

const RegisterPage = () => {
  const [selectedRole, setSelectedRole] = useState('student');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-start items-center relative overflow-hidden pt-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-64 h-64 bg-white rounded-3xl flex items-center justify-center shadow-2xl p-6 mb-8">
            <img src="/images/sece-logo.png" alt="SECE Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            Sri Eshwar College of Engineering
          </h1>
          <p className="text-xl text-blue-100 font-medium">Course Management System</p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="w-40 h-40 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 p-4 border border-gray-100">
              <img src="/images/sece-logo.png" alt="SECE Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Sri Eshwar College of Engineering
            </h1>
            <p className="text-gray-600 text-lg mt-2 font-medium">Course Management System</p>
          </div>

          {/* Register Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 animate-fade-in">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Create Account</h2>
              <p className="text-gray-600 text-base">Register to get started</p>
            </div>

            <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />

            <RegisterForm role={selectedRole} />

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Security Notice */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start space-x-3">
                  <FiShield className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Secure Registration</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Your information is encrypted and stored securely. Use your official college email.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
