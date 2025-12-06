// src/pages/auth/LoginPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import UserTypeTabs from './components/UserTypeTabs';
import GoogleLoginButton from './components/GoogleLoginButton';
import { EyeIcon, EyeSlashIcon, AcademicCapIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student',
  });

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData(prev => ({ ...prev, role: tab }));
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Email domain validation for college emails
    const collegeDomain = 'college.edu';
    const validDomains = ['student.college.edu', 'faculty.college.edu', 'admin.college.edu', 'college.edu'];
    const emailDomain = formData.email.split('@')[1];
    
    if (!validDomains.includes(emailDomain)) {
      toast.error(`Please use your official college email (e.g., @student.college.edu)`);
      return;
    }

    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      toast.success(`Welcome back, ${result.user.name}!`);
      
      // Redirect based on role
      switch(result.user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'faculty':
          navigate('/faculty/dashboard');
          break;
        default:
          navigate('/student/dashboard');
      }
    } catch (err) {
      toast.error(err || 'Login failed. Please check your credentials.');
    }
  };

  // Handle Google login success
  const handleGoogleSuccess = async (response) => {
    try {
      const email = response.profileObj.email;
      const collegeDomain = 'sece.ac.in';
      
      // Validate college email
      if (!email.endsWith(`@${collegeDomain}`)) {
        toast.error(`Please use your official college email (@${collegeDomain})`);
        return;
      }

      // Send token to backend
      const result = await dispatch(loginUser({
        email,
        tokenId: response.tokenId,
        role: activeTab,
        method: 'google'
      })).unwrap();

      toast.success(`Welcome ${result.user.name}!`);
      
      // Redirect based on role
      switch(result.user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'faculty':
          navigate('/faculty/dashboard');
          break;
        default:
          navigate('/student/dashboard');
      }
    } catch (err) {
      toast.error(err || 'Google login failed');
    }
  };

  // Handle Google login failure
  const handleGoogleFailure = (error) => {
    console.error('Google login failed:', error);
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-start items-center relative overflow-hidden pt-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* College Logo & Name */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-64 h-64 bg-white rounded-3xl flex items-center justify-center shadow-2xl p-6 mb-8">
            <img src="/images/sece-logo.png" alt="SECE Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">Sri Eshwar College of Engineering</h1>
          <p className="text-xl text-blue-100 font-medium">Course Management System</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="w-40 h-40 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 p-4 border border-gray-100">
              <img src="/images/sece-logo.png" alt="SECE Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sri Eshwar College of Engineering</h1>
            <p className="text-gray-600 text-lg mt-2 font-medium">Course Management System</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Welcome Back</h2>
              <p className="text-gray-600 text-base">Sign in to access your account</p>
            </div>

            {/* User Type Tabs */}
            <UserTypeTabs 
              activeTab={activeTab} 
              onTabChange={handleTabChange} 
            />

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  College Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="vasanth.m@sece.ac.in"
                    className="w-full px-4 py-3 pl-11 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <svg className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pl-11 pr-11 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <svg className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onFailure={handleGoogleFailure}
              activeTab={activeTab}
            />

            {/* Registration Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Register here
                </Link>
              </p>
            </div>

            {/* Security Notice */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Secure Authentication</p>
                    <p className="text-xs text-gray-600 leading-relaxed">This portal is protected with enterprise-grade security. All access attempts are logged and monitored for your safety.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Help Links */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Help Center</span>
              </a>
              <span className="text-gray-300">•</span>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Support</span>
              </a>
              <span className="text-gray-300">•</span>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Privacy</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default LoginPage;