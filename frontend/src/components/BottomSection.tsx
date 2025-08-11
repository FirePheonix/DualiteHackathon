import React from 'react';
import { motion } from 'framer-motion';

const BottomSection: React.FC = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6 }
    }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8 }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8 }
    }
  };

  return (
    <>
      {/* About Us Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-[#F2F2F2]">
        <div className="absolute inset-0 bg-gradient-to-br from-cream/20 via-transparent to-cream/30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="font-playfair font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-dark-gray mb-6 sm:mb-8 lg:mb-12"
              variants={fadeInUp}
            >
              ABOUT US
            </motion.h2>
            <motion.div 
              className="flex items-center justify-center space-x-4 sm:space-x-6 mb-8 sm:mb-12"
              variants={fadeInUp}
            >
              <div className="h-px bg-black w-8 sm:w-12"></div>
              <p className="font-poppins font-medium text-sm sm:text-base lg:text-lg text-black">
                TRANSFORMING FRONTEND DEVELOPMENT
              </p>
              <div className="h-px bg-black w-8 sm:w-12"></div>
            </motion.div>
            <motion.p 
              className="font-poppins text-sm sm:text-base lg:text-lg text-black leading-relaxed"
              variants={fadeInUp}
            >
              Dualite is an India-based technology company focused on transforming the way frontend development is done. 
              Their flagship product, Dualite Alpha, is a local-first, AI-powered browser-based builder that converts Figma 
              designs into clean, production-ready code, integrates seamlessly with GitHub repositories, and connects with 
              REST APIs to bring real data into applications. What makes Dualite stand out is its emphasis on privacy and 
              trust — all data, including prompts, designs, and code, stays on the user's device without being stored on 
              external servers. With a mission to make UI development as simple as copy-and-paste, Dualite aims to save 
              developers significant time, improve code quality, and allow them to focus more on creativity and 
              problem-solving rather than repetitive tasks.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-cream">
        <div className="absolute inset-0 bg-gradient-to-br from-light-purple/20 via-transparent to-light-orange/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <motion.div 
            className="text-center mb-12 sm:mb-16 lg:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="font-playfair font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-dark-gray mb-6 sm:mb-8"
              variants={fadeInUp}
            >
              TIMELINE
            </motion.h2>
            <motion.div 
              className="flex items-center justify-center space-x-4 sm:space-x-6"
              variants={fadeInUp}
            >
              <div className="h-px bg-black w-8 sm:w-12"></div>
              <p className="font-poppins font-medium text-sm sm:text-base lg:text-lg text-black">
                BUILD SHIP SCALE
              </p>
              <div className="h-px bg-black w-8 sm:w-12"></div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <div className="space-y-8 sm:space-y-12 lg:space-y-16">
              {/* Timeline Item 1 */}
              <motion.div 
                className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6"
                variants={slideInLeft}
              >
                <div className="bg-dark-gray rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0">
                  <span className="font-gidugu text-white font-bold text-lg sm:text-xl">1</span>
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-lg sm:text-xl lg:text-2xl text-black mb-2">
                    Registration Opens
                  </h3>
                  <p className="font-poppins text-sm sm:text-base text-black">
                    Join the creative coding revolution and secure your spot
                  </p>
                </div>
              </motion.div>

              {/* Timeline Item 2 */}
              <motion.div 
                className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6"
                variants={slideInRight}
              >
                <div className="bg-dark-gray rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0">
                  <span className="font-gidugu text-white font-bold text-lg sm:text-xl">2</span>
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-lg sm:text-xl lg:text-2xl text-black mb-2">
                    Hackathon Begins
                  </h3>
                  <p className="font-poppins text-sm sm:text-base text-black">
                    48 hours of intense building, coding, and shipping
                  </p>
                </div>
              </motion.div>

              {/* Timeline Item 3 */}
              <motion.div 
                className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6"
                variants={slideInLeft}
              >
                <div className="bg-dark-gray rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0">
                  <span className="font-gidugu text-white font-bold text-lg sm:text-xl">3</span>
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-lg sm:text-xl lg:text-2xl text-black mb-2">
                    Project Showcase
                  </h3>
                  <p className="font-poppins text-sm sm:text-base text-black">
                    Present your creations and compete for exciting prizes
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-[#F2F2F2]">
        <div className="absolute inset-0 bg-gradient-to-br from-light-blue/20 via-transparent to-light-purple/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <motion.div 
            className="text-center mb-12 sm:mb-16 lg:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="font-playfair font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-dark-gray mb-6 sm:mb-8"
              variants={fadeInUp}
            >
              FEATURES
            </motion.h2>
            <motion.div 
              className="flex items-center justify-center space-x-4 sm:space-x-6"
              variants={fadeInUp}
            >
              <div className="h-px bg-black w-8 sm:w-12"></div>
              <p className="font-poppins font-medium text-sm sm:text-base lg:text-lg text-black">
                POWERFUL TOOLS
              </p>
              <div className="h-px bg-black w-8 sm:w-12"></div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            {/* Feature 1 */}
            <motion.div 
              className="text-center"
              variants={scaleIn}
            >
              <div className="bg-light-purple rounded-2xl p-6 sm:p-8 lg:p-10 shadow-card mb-6">
                <h3 className="font-poppins font-bold text-lg sm:text-xl lg:text-2xl text-black mb-4">
                  No Code Website Builder
                </h3>
                <p className="font-poppins text-sm sm:text-base text-black leading-relaxed">
                  Build stunning websites without writing a single line of code. Drag, drop, and deploy.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              className="text-center"
              variants={scaleIn}
            >
              <div className="bg-light-orange rounded-2xl p-6 sm:p-8 lg:p-10 shadow-card mb-6">
                <h3 className="font-poppins font-bold text-lg sm:text-xl lg:text-2xl text-black mb-4">
                  Figma to Code
                </h3>
                <p className="font-poppins text-sm sm:text-base text-black leading-relaxed">
                  Transform your Figma designs into clean, production-ready code instantly.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              className="text-center"
              variants={scaleIn}
            >
              <div className="bg-light-blue rounded-2xl p-6 sm:p-8 lg:p-10 shadow-card mb-6">
                <h3 className="font-poppins font-bold text-lg sm:text-xl lg:text-2xl text-black mb-4">
                  Supabase Integration
                </h3>
                <p className="font-poppins text-sm sm:text-base text-black leading-relaxed">
                  Seamlessly connect with Supabase for real-time data and authentication. Now live!
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Products Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-cream">
        <div className="absolute inset-0 bg-gradient-to-br from-light-orange/20 via-transparent to-light-blue/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <motion.div 
            className="text-center mb-12 sm:mb-16 lg:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="font-playfair font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-dark-gray mb-6 sm:mb-8"
              variants={fadeInUp}
            >
              OUR PRODUCTS
            </motion.h2>
            <motion.div 
              className="flex items-center justify-center space-x-4 sm:space-x-6"
              variants={fadeInUp}
            >
              <div className="h-px bg-black w-8 sm:w-12"></div>
              <p className="font-poppins font-medium text-sm sm:text-base lg:text-lg text-black">
                INNOVATION AT ITS FINEST
              </p>
              <div className="h-px bg-black w-8 sm:w-12"></div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scaleIn}
          >
            <div className="bg-white/50 backdrop-blur-sm border-2 border-[#DDDDDD] rounded-3xl p-8 sm:p-12 lg:p-16 shadow-card">
              <h3 className="font-playfair font-bold text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-dark-gray mb-6 sm:mb-8">
                DUALITE ALPHA
              </h3>
              <p className="font-poppins text-sm sm:text-base lg:text-lg text-black leading-relaxed mb-8 sm:mb-10">
                Our flagship AI-powered browser-based builder that converts Figma designs into clean, 
                production-ready code. Privacy-first, local-first, and developer-friendly.
              </p>
              <button className="bg-dark-gray shadow-button rounded-xl px-8 sm:px-12 py-3 sm:py-4 hover:bg-gray-800 transition-colors">
                <span className="font-gidugu text-sm sm:text-base lg:text-lg text-white font-bold">
                  LEARN MORE
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 bg-[#F2F2F2]">
        <div className="absolute inset-0 bg-gradient-to-br from-light-purple/20 via-transparent to-cream/30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <motion.div 
            className="text-center mb-12 sm:mb-16 lg:mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="font-playfair font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-dark-gray mb-6 sm:mb-8"
              variants={fadeInUp}
            >
              TESTIMONIALS
            </motion.h2>
            <motion.div 
              className="flex items-center justify-center space-x-4 sm:space-x-6"
              variants={fadeInUp}
            >
              <div className="h-px bg-black w-8 sm:w-12"></div>
              <p className="font-poppins font-medium text-sm sm:text-base lg:text-lg text-black">
                WHAT DEVELOPERS SAY
              </p>
              <div className="h-px bg-black w-8 sm:w-12"></div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 max-w-7xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            {/* Testimonial 1 */}
            <motion.div 
              className="bg-white/70 backdrop-blur-sm border border-[#DDDDDD] rounded-2xl p-6 sm:p-8 shadow-card"
              variants={fadeInUp}
            >
              <p className="font-poppins text-sm sm:text-base text-black leading-relaxed mb-6">
                "Dualite Alpha completely transformed my workflow. What used to take hours now takes minutes!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-light-purple rounded-full flex items-center justify-center mr-4">
                  <span className="font-gidugu font-bold text-black">A</span>
                </div>
                <div>
                  <h4 className="font-poppins font-semibold text-sm sm:text-base text-black">Alex Chen</h4>
                  <p className="font-poppins sm:text-sm text-gray-600">Frontend Developer</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              className="bg-white/70 backdrop-blur-sm border border-[#DDDDDD] rounded-2xl p-6 sm:p-8 shadow-card"
              variants={fadeInUp}
            >
              <p className="font-poppins text-sm sm:text-base text-black leading-relaxed mb-6">
                "The Figma integration is seamless. It's like magic watching designs become real code!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-light-orange rounded-full flex items-center justify-center mr-4">
                  <span className="font-gidugu font-bold text-black">S</span>
                </div>
                <div>
                  <h4 className="font-poppins font-semibold text-sm sm:text-base text-black">Sarah Kumar</h4>
                  <p className="font-poppins sm:text-sm text-gray-600">UI/UX Designer</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              className="bg-white/70 backdrop-blur-sm border border-[#DDDDDD] rounded-2xl p-6 sm:p-8 shadow-card md:col-span-2 lg:col-span-1"
              variants={fadeInUp}
            >
              <p className="font-poppins text-sm sm:text-base text-black leading-relaxed mb-6">
                "Privacy-first approach gives me confidence. My code stays on my device, exactly how it should be."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-light-blue rounded-full flex items-center justify-center mr-4">
                  <span className="font-gidugu font-bold text-black">M</span>
                </div>
                <div>
                  <h4 className="font-poppins font-semibold text-sm sm:text-base text-black">Mike Johnson</h4>
                  <p className="font-poppins sm:text-sm text-gray-600">Full Stack Developer</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-24 lg:py-32 bg-dark-gray">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="font-playfair font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white mb-6 sm:mb-8 lg:mb-12"
              variants={fadeInUp}
            >
              READY TO BUILD?
            </motion.h2>
            <motion.div 
              className="flex items-center justify-center space-x-4 sm:space-x-6 mb-8 sm:mb-12 lg:mb-16"
              variants={fadeInUp}
            >
              <div className="h-px bg-white w-12 sm:w-16"></div>
              <p className="font-poppins font-medium text-base sm:text-lg lg:text-xl text-white">
                JOIN THE REVOLUTION
              </p>
              <div className="h-px bg-white w-12 sm:w-16"></div>
            </motion.div>
            <motion.p 
              className="font-poppins text-base sm:text-lg lg:text-xl text-white/80 leading-relaxed mb-10 sm:mb-12 lg:mb-16"
              variants={fadeInUp}
            >
              Don't miss out on this creative vibe-coding hackathon. Build, ship, and scale your ideas with the best developers in the community.
            </motion.p>
            <motion.button 
              className="bg-white shadow-button rounded-xl px-10 sm:px-16 lg:px-20 py-4 sm:py-5 lg:py-6 hover:bg-gray-100 transition-colors"
              variants={scaleIn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-gidugu text-lg sm:text-xl lg:text-2xl text-dark-gray font-bold">
                REGISTER NOW
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default BottomSection;
