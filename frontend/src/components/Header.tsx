import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X } from 'lucide-react';

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

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <div className="bg-[#F2F2F2]/95 backdrop-blur-sm border-2 border-[#DDDDDD] rounded-full mx-auto max-w-7xl">
        <div className="flex items-center justify-between h-20 lg:h-20 px-8 lg:px-12">
          <Link to="/" className="font-playfair font-bold text-xl text-black hover:text-gray-600 transition-colors">
            DualiteHack
          </Link>

          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12">
            {navLinks.map((link) => (
              link.isExternal ? (
                <a key={link.href} href={link.href} className="font-inter font-light text-nav text-black hover:text-gray-600 transition-colors">
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} to={link.href} className="font-inter font-light text-nav text-black hover:text-gray-600 transition-colors">
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          <div className="hidden lg:block bg-purple-button shadow-nav rounded-full px-6 py-3 lg:px-8 lg:py-4">
            {user ? (
              <button onClick={handleSignOut} className="font-inter font-medium text-button text-black hover:text-gray-600 transition-colors">
                Sign Out
              </button>
            ) : (
              <button onClick={() => navigate('/auth')} className="font-inter font-medium text-button text-black hover:text-gray-600 transition-colors">
                Register Now
              </button>
            )}
          </div>

          <button className="lg:hidden text-black" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden mt-2 bg-[#F2F2F2]/95 backdrop-blur-sm border-2 border-[#DDDDDD] rounded-2xl mx-auto max-w-7xl p-4">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              link.isExternal ? (
                <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="font-inter font-light text-nav text-black hover:text-gray-600 transition-colors text-center">
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} to={link.href} onClick={() => setIsMenuOpen(false)} className="font-inter font-light text-nav text-black hover:text-gray-600 transition-colors text-center">
                  {link.label}
                </Link>
              )
            ))}
            <div className="pt-4 border-t border-gray-300">
              {user ? (
                <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="w-full text-center font-inter font-medium text-button text-black hover:text-gray-600 transition-colors">
                  Sign Out
                </button>
              ) : (
                <button onClick={() => { navigate('/auth'); setIsMenuOpen(false); }} className="w-full text-center font-inter font-medium text-button text-black hover:text-gray-600 transition-colors">
                  Register Now
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
