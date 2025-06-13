import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900/50 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">ShareZone</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Secure file sharing platform with advanced features for individuals and teams. 
              Upload, share, and manage your files with ease.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@sharezone.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <span className="text-white font-semibold mb-4 block">Quick Links</span>
            <div className="space-y-2">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors block">
                Home
              </Link>
              <Link to="/#features" className="text-gray-400 hover:text-white transition-colors block">
                Features
              </Link>
              <Link to="/#pricing" className="text-gray-400 hover:text-white transition-colors block">
                Pricing
              </Link>
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors block">
                Sign In
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <span className="text-white font-semibold mb-4 block">Support</span>
            <div className="space-y-2">
              <span className="text-gray-400 block">Help Center</span>
              <span className="text-gray-400 block">Privacy Policy</span>
              <span className="text-gray-400 block">Terms of Service</span>
              <span className="text-gray-400 block">Contact Us</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <span className="text-gray-400 text-sm">
              © {new Date().getFullYear()} ShareZone. All rights reserved.
            </span>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Made with ❤️ for secure file sharing</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;