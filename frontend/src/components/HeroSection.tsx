import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const words = ['SCALABLE', 'LAUNCH-READY', 'MODULAR', 'FRICTIONLESS', 'FUTURE-PROOF'];

  useEffect(() => {
    // Trigger animations after component mounts
    setIsLoaded(true);
    
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[200vh] bg-[#F2F2F2] pt-32 pb-60 overflow-hidden">
      {/* Background cream overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream/30 via-transparent to-cream/40"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        {/* Central Hero Content */}
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center relative z-50">
          
          {/* Top tagline */}
          <p className="font-poppins text-sm sm:text-base lg:text-small text-black leading-relaxed mb-4 sm:mb-6">
            build build build ship ship ship!
          </p>
          
          {/* Main Title */}
          <h1 className="font-playfair font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-hero leading-tight text-dark-gray mb-6 sm:mb-8">
            A CREATIVE<br />
            VIBE-CODING<br />
            HACKATHON
          </h1>
          
          {/* Subtitle with lines */}
          <div className="flex items-center justify-center space-x-4 sm:space-x-6 mb-8 sm:mb-12">
            <div className="h-px bg-black w-12 sm:w-16"></div>
            <h2 className="font-poppins font-medium text-base sm:text-lg md:text-xl lg:text-2xl text-black text-center whitespace-nowrap">
              WE BUILD<br />
              
                <span 
                  key={currentWordIndex}
                  className="inline-block animate-fadeInOut text-dark-gray"
                  style={{
                    animation: 'fadeInOut 2s ease-in-out'
                  }}
                >
                  {words[currentWordIndex]} 
                </span> PRODUCTS
            </h2>
            <div className="h-px bg-black w-12 sm:w-16"></div>
          </div>

          {/* CTA Button */}
          <button 
            className="bg-dark-gray shadow-button rounded-xl px-8 sm:px-12 py-3 sm:py-4 hover:bg-gray-800 transition-colors"
            onClick={() => navigate('/projects')}
          >
            <span className="font-gidugu text-sm sm:text-base lg:text-lg text-white font-bold">
              SEE PROJECTS
            </span>
          </button>
        </div>

      </div>

      {/* SVG Components Positioned at Extreme Edges - Outside container */}

      {/* Left Side - Build great products and win exciting prizes (2Dualite.svg) - Slide from left */}
      <div className={`hidden lg:block absolute top-[45%] sm:top-[48%] lg:top-[20%] left-0 sm:-left-2 lg:-left-4 xl:-left-6 w-40 sm:w-48 md:w-56 lg:w-64 xl:w-70 z-20 transform -translate-y-1/2 transition-all duration-1000 ease-out ${
        isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}>
        <img 
          src="/assets/2Dualite.svg" 
          alt="Build great products and win exciting prizes"
          className="w-full h-auto"
        />
      </div>

      {/* Top Left - Build at lightning speed with Alpha (1Dualite.svg) - Slide from left with delay */}
      <div className={`hidden lg:block absolute top-[8%] sm:top-[10%] lg:top-[26%] left-2 sm:left-4 md:left-6 lg:left-8 xl:left-10 w-44 sm:w-52 md:w-60 lg:w-68 xl:w-72 z-30 transition-all duration-1000 ease-out delay-300 ${
        isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}>
        <img 
          src="/assets/1Dualite.svg" 
          alt="Build at lightning speed with Alpha"
          className="w-full h-auto"
        />
      </div>

      {/* Right Side - Supabase Integration live (4Dualite.svg) - Slide from right */}
      <div className={`hidden lg:block absolute top-[8%] sm:top-[10%] lg:top-[12%] right-0 sm:-right-2 lg:-right-4 xl:-right-6 w-44 sm:w-52 md:w-60 lg:w-68 xl:w-50 z-20 transition-all duration-1000 ease-out ${
        isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <img 
          src="/assets/4Dualite.svg" 
          alt="Supabase Integration live"
          className="w-full h-auto"
        />
      </div>

      {/* Right Side - Compete with other cracked devs (3Dualite.svg) - Slide from right with delay */}
      <div className={`hidden lg:block absolute top-[45%] sm:top-[48%] lg:top-[40%] right-0 sm:right-0 md:right-6 lg:right-1 xl:right-14 w-40 sm:w-48 md:w-56 lg:w-64 xl:w-80 z-30 transform -translate-y-1/2 transition-all duration-1000 ease-out delay-300 ${
        isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <img 
          src="/assets/3Dualite.svg" 
          alt="Compete with other cracked devs"
          className="w-full h-auto"
        />
      </div>

      {/* Centered 5Dualite.svg overlapping everything - Much much lower position */}
      <div className="absolute left-1/2 top-[75%] sm:top-[78%] lg:top-[67%] z-40 w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%] max-w-4xl xl:max-w-5xl 2xl:max-w-6xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {/* Tilted cards at the edges of 5Dualite.svg - BEHIND the main card */}
        <img 
          src="/assets/6Dualite.svg" 
          alt="From Idea to website within a day"
          className="absolute -left-8 sm:-left-12 md:-left-16 lg:-left-24 xl:-left-32 bottom-2 sm:bottom-4 lg:bottom-6 xl:bottom-8 w-24 sm:w-32 md:w-40 lg:w-56 xl:w-72 2xl:w-90 rotate-[-12deg] z-10"
        />
        <img 
          src="/assets/7Dualite.svg" 
          alt="Validate fast. Scale seamlessly"
          className="absolute -right-8 sm:-right-12 md:-right-16 lg:-right-24 xl:-right-32 bottom-2 sm:bottom-4 lg:bottom-6 xl:bottom-8 w-24 sm:w-32 md:w-40 lg:w-56 xl:w-72 2xl:w-80 rotate-[12deg] z-10"
        />
        {/* Main card on top */}
        <img 
          src="/assets/5Dualite.svg" 
          alt="Dualite Main Card"
          className="w-full h-auto drop-shadow-2xl z-50 relative"
        />
      </div>

      {/* Custom CSS for the fade animation */}
      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          20%, 80% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </section>
  );
};

export default HeroSection;
