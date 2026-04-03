import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>© 2025 Isaii AI.</span>
            <span><i> @ vasanth</i></span>
            <span className="hidden md:inline">All rights reserved.</span>
          </div>

        

          <div className="flex items-center space-x-6 text-sm">
            <a href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy</a>
            <a href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">Terms</a>
            <a href="/support" className="text-gray-600 hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
