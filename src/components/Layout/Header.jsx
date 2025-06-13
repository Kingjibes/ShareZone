
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Settings, 
  LogOut, 
  Crown,
  Menu,
  X,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
  ];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">ShareZone</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                  setTimeout(() => {
                    document.querySelector(item.href.replace('/', ''))?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex"
                >
                  Dashboard
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
                          {user.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          {user.plan === 'premium' ? <Crown className="w-3 h-3 text-yellow-500" /> : <div className="w-3 h-3"></div>}
                          <span className="text-xs capitalize">{user.plan} Plan</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="gradient-bg hover:opacity-90"
                >
                  Get Started
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 py-4"
          >
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                 <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-white transition-colors px-2 py-1"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/');
                    setMobileMenuOpen(false);
                    setTimeout(() => {
                      document.querySelector(item.href.replace('/', ''))?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  {item.name}
                </a>
              ))}
              
              {!user && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                  <Button variant="ghost" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Sign In</Button>
                  <Button onClick={() => { navigate('/register'); setMobileMenuOpen(false);}} className="gradient-bg hover:opacity-90">Get Started</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
