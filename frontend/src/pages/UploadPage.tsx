import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

const UploadPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log('UploadPage - Component mounted, user:', user);

  // Animation variants
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const formAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8 }
    }
  };

  const isValidUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error('No user found');
      setError('You must be logged in to upload a project');
      return;
    }

    setLoading(true);
    setError('');

    // Validate URL
    if (!isValidUrl(vercelUrl)) {
      setError('Please enter a valid URL');
      setLoading(false);
      return;
    }

    console.log('Attempting to upload project:', {
      user_id: user.id,
      title: title.trim(),
      vercel_url: vercelUrl.trim(),
      description: description.trim(),
    });

    try {
      // First, ensure the user exists in the users table
      const { error: userError } = await supabase
        .from('users')
        .upsert([
          {
            id: user.id,
            email: user.email
          }
        ], { onConflict: 'id' });

      if (userError) {
        console.error('Error ensuring user exists:', userError);
        // Continue anyway, the trigger might handle it
      }

      // Now insert the project
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            vercel_url: vercelUrl.trim(),
            description: description.trim(),
          }
        ])
        .select();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Database error:', error);
        if (error.code === '23505') {
          throw new Error('This URL has already been uploaded');
        }
        if (error.code === '23503') {
          throw new Error('User not found in database. Please try logging out and back in.');
        }
        throw error;
      }

      console.log('Project uploaded successfully:', data);
      navigate('/projects');
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    console.log('UploadPage - No user, returning null');
    return null;
  }

  console.log('UploadPage - Rendering upload form');

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-32 pb-16">
      <Header />
      <motion.div 
        className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12"
        initial="hidden"
        animate="visible"
        variants={containerAnimation}
      >
        <div className="max-w-2xl mx-auto">
          <motion.div 
            className="bg-white/70 backdrop-blur-sm border-2 border-[#DDDDDD] rounded-3xl p-8 shadow-card"
            variants={formAnimation}
          >
            <motion.div 
              className="text-center mb-8"
              variants={itemAnimation}
            >
              <h1 className="font-playfair font-bold text-3xl lg:text-4xl text-dark-gray mb-4">
                Upload Your Project
              </h1>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="h-px bg-black w-8"></div>
                <p className="font-poppins font-medium text-sm text-black">
                  SHOWCASE YOUR CREATION
                </p>
                <div className="h-px bg-black w-8"></div>
              </div>
            </motion.div>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              variants={containerAnimation}
            >
              <motion.div variants={itemAnimation}>
                <label className="block font-poppins text-sm font-medium text-black mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 bg-white border border-[#DDDDDD] rounded-xl font-poppins text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-gray focus:border-transparent"
                  placeholder="Enter your project title"
                />
              </motion.div>

              <motion.div variants={itemAnimation}>
                <label className="block font-poppins text-sm font-medium text-black mb-2">
                  Deployed URL
                </label>
                <input
                  type="url"
                  value={vercelUrl}
                  onChange={(e) => setVercelUrl(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-[#DDDDDD] rounded-xl font-poppins text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-gray focus:border-transparent"
                  placeholder="https://your-project.vercel.app"
                />
                <p className="font-poppins text-gray-500 mt-1">
                  Vercel, Netlify, or any deployed URL
                </p>
              </motion.div>

              <motion.div variants={itemAnimation}>
                <label className="block font-poppins text-sm font-medium text-black mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-[#DDDDDD] rounded-xl font-poppins text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-gray focus:border-transparent resize-none"
                  placeholder="Describe your project, what it does, and how you built it with Dualite..."
                />
                <p className="font-poppins text-gray-500 mt-1">
                  {description.length}/500 characters
                </p>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="font-poppins text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                className="flex space-x-4"
                variants={itemAnimation}
              >
                <motion.button
                  type="button"
                  onClick={() => navigate('/projects')}
                  className="flex-1 bg-gray-200 rounded-xl py-4 hover:bg-gray-300 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="font-gidugu text-lg text-black font-bold">
                    CANCEL
                  </span>
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-dark-gray shadow-button rounded-xl py-4 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="font-gidugu text-lg text-white font-bold">
                    {loading ? 'UPLOADING...' : 'UPLOAD PROJECT'}
                  </span>
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadPage;
