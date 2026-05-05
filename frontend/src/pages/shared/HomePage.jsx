import React from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiUsers, FiAward, FiTrendingUp, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import collegeLogo from '../../assets/images/college-logo.png';

const HomePage = () => {
  const features = [
    {
      icon: FiBook,
      title: 'Course Management',
      description: 'Comprehensive course creation, enrollment, and lesson management system',
      color: 'blue'
    },
    {
      icon: FiUsers,
      title: 'Student Portal',
      description: 'Access courses, submit assignments, and track academic progress',
      color: 'indigo'
    },
    {
      icon: FiAward,
      title: 'Grade Tracking',
      description: 'Real-time grade updates and GPA calculation for students',
      color: 'purple'
    },
    {
      icon: FiTrendingUp,
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and reporting for administrators',
      color: 'green'
    }
  ];

  const stats = [
    { value: '1000+', label: 'Active Students' },
    { value: '150+', label: 'Faculty Members' },
    { value: '200+', label: 'Courses Offered' },
    { value: '98%', label: 'Success Rate' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={collegeLogo} alt="SECE Logo" className="h-16 w-16 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sri Eshwar</h1>
                <p className="text-sm text-gray-600">College of Engineering</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="px-6 py-2 text-blue-600 hover:text-blue-700 font-semibold transition">
                Login
              </Link>
              <Link to="/register" className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Welcome to <span className="text-blue-600">Sri Eshwar</span> Course Management System
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A comprehensive educational platform for managing courses, assignments, and advanced academic delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl font-semibold text-center flex items-center justify-center space-x-2">
                  <span>Get Started</span>
                  <FiArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/login" className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold text-center">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl">
                <img src="/images/dashboard-preview.png" alt="Dashboard Preview" className="rounded-xl shadow-lg" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl animate-float">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FiCheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">System Status</p>
                    <p className="text-lg font-bold text-gray-900">All Systems Operational</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <p className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage academic activities efficiently</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`p-4 bg-${feature.color}-100 rounded-xl inline-block mb-4`}>
                  <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Built for Everyone</h2>
            <p className="text-xl text-blue-100">Tailored experiences for students, faculty, and administrators</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white hover:bg-white/20 transition">
              <FiUsers className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Students</h3>
              <ul className="space-y-2 text-blue-100">
                <li>• Browse and enroll in courses</li>
                <li>• Submit assignments online</li>
                <li>• Track grades and GPA</li>
                <li>• View class schedule</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white hover:bg-white/20 transition">
              <FiBook className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Faculty</h3>
              <ul className="space-y-2 text-blue-100">
                <li>• Create and manage courses</li>
                <li>• Assign and grade work</li>
                <li>• Track student attendance</li>
                <li>• Post announcements</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white hover:bg-white/20 transition">
              <FiTrendingUp className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Administrators</h3>
              <ul className="space-y-2 text-blue-100">
                <li>• Manage users and roles</li>
                <li>• Approve courses</li>
                <li>• View analytics and reports</li>
                <li>• System configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-8">Join thousands of students and faculty using our platform</p>
            <Link to="/register" className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition shadow-lg hover:shadow-xl font-semibold">
              <span>Create Your Account</span>
              <FiArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src={collegeLogo} alt="SECE" className="h-12 w-12" />
                <div>
                  <h3 className="font-bold text-lg">Sri Eshwar</h3>
                  <p className="text-sm text-gray-400">College of Engineering</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">Sri Eshwar Course Management System - Empowering the next generation of engineers</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/courses" className="hover:text-white transition">Courses</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
                <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Email: info@sece.ac.in</li>
                <li>Phone: +91 422 2630866</li>
                <li>Address: Kinathukadavu, Coimbatore, Tamil Nadu</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Sri Eshwar College of Engineering. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
