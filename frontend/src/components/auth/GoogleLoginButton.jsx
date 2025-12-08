import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { setCredentials } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const GoogleLoginButton = ({ role }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      console.log('Google credential received:', credentialResponse);
      const response = await authAPI.googleLogin({
        token: credentialResponse.credential,
        role
      });
      console.log('Backend response:', response);
      
      dispatch(setCredentials({
        user: response.user,
        token: response.token
      }));
      toast.success('Login successful!');
      navigate(`/${role}/dashboard`);
    } catch (error) {
      console.error('Google login error details:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      toast.error(error.message || error.error || 'Google login failed');
    }
  };

  const handleError = () => {
    toast.error('Google login failed');
  };

  return (
    <div className="mt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </div>
    </div>
  );
};

export default GoogleLoginButton;
