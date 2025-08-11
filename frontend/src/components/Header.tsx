import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isHomePage = location.pathname === '/';

  const navLinks = isHomePage
    ? [
        { href: '#about', label: 'About', isExternal: true },
        { href: '#timeline', label: 'Timeline', isExternal: true },
        { href: '#features', label: 'Features', isExternal: true },
        { href: '#products', label: 'Products', isExternal: true },
      ]
    : [
        { href: '/projects', label: 'Projects', isExternal: false },
        ...(user ? [
          { href: '/upload', label: 'Upload', isExternal: false }, 
          { href: '/dashboard', label: 'Dashboard', isExternal: false }
        ] : []),
      ];

  // Animation variants
  const headerAnimation = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const navItemAnimation = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const mobileMenuAnimation = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.header 
      className="fixed top-4 left-4 right-4 z-50"
      initial="hidden"
      animate="visible"
      variants={headerAnimation}
    >
      <div className="bg-[#F2F2F2]/95 backdrop-blur-sm border-2 border-[#DDDDDD] rounded-full mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-20 lg:h-20 px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/" className="font-playfair font-bold text-xl text-black hover:text-gray-600 transition-colors">
              DualiteHack
            </Link>
          </motion.div>

          <motion.nav 
            className="hidden lg:flex items-center space-x-8 xl:space-x-12"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.3
                }
              }
            }}
          >
            {navLinks.map((link, index) => (
              <motion.div key={link.href} variants={navItemAnimation}>
                {link.isExternal ? (
                  <a href={link.href} className="font-inter font-light text-nav text-black hover:text-gray-600 transition-colors">
                    {link.label}
                  </a>
                ) : (
                  <Link to={link.href} className="font-inter font-light text-nav text-black hover:text-gray-600 transition-colors">
                    {link.label}
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.nav>

          <motion.div 
            className="hidden lg:block bg-purple-button shadow-nav rounded-full px-6 py-3 lg:px-8 lg:py-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {user ? (
              <button onClick={handleSignOut} className="font-inter font-medium text-button text-black hover:text-gray-600 transition-colors">
                Sign Out
              </button>
            ) : (
              <button onClick={() => navigate('/auth')} className="font-inter font-medium text-button text-black hover:text-gray-600 transition-colors">
                Register Now
              </button>
            )}
          </motion.div>

          <motion.button 
            className="lg:hidden text-black" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="lg:hidden mt-2 bg-[#F2F2F2]/95 backdrop-blur-sm border-2 border-[#DDDDDD] rounded-2xl mx-auto max-w-7xl p-4"
            variants={mobileMenuAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.nav 
              className="flex flex-col space-y-4"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.1
                  }
                }
              }}
            >
              {navLinks.map((link) => (
                <motion.div key={link.href} variants={navItemAnimation}>
                  {link.isExternal ? (
                    <a href={link.href} onClick={() => setIsMenuOpen(false)} className="font-inter font-light text-nav text-black hover:text-gray-600 transition-colors text-center">
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} onClick={() => setIsMenuOpen(false)} className="font-inter font-light text-nav text-black hover:text-gray-600 transition-colors text-center">
                      {link.label}
                    </Link>
                  )}
                </motion.div>
              ))}
              <motion.div 
                className="pt-4 border-t border-gray-300"
                variants={navItemAnimation}
              >
                {user ? (
                  <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="w-full text-center font-inter font-medium text-button text-black hover:text-gray-600 transition-colors">
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => { navigate('/auth'); setIsMenuOpen(false); }} className="w-full text-center font-inter font-medium text-button text-black hover:text-gray-600 transition-colors">
                    Register Now
                  </button>
                )}
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
