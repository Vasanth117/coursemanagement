import React from 'react';
import { ResetPasswordForm } from '../../components/auth';
import { FiShield } from 'react-icons/fi';

const ResetPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 p-4 border border-gray-100">
            <img src="/images/sece-logo.png" alt="SECE Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SECE Course Management</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 animate-fade-in">
          <ResetPasswordForm />

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start space-x-3">
                <FiShield className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Secure Password Reset</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Your new password will be encrypted and stored securely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
