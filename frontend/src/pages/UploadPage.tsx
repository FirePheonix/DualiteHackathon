import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';

const UploadPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log('UploadPage - Component mounted, user:', user);

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm border-2 border-[#DDDDDD] rounded-3xl p-8 shadow-card">
            <div className="text-center mb-8">
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
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
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
              </div>

              <div>
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
                <p className="font-poppins text-xs text-gray-500 mt-1">
                  Vercel, Netlify, or any deployed URL
                </p>
              </div>

              <div>
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
                <p className="font-poppins text-xs text-gray-500 mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                  <p className="font-poppins text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/projects')}
                  className="flex-1 bg-gray-200 rounded-xl py-4 hover:bg-gray-300 transition-colors"
                >
                  <span className="font-gidugu text-lg text-black font-bold">
                    CANCEL
                  </span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-dark-gray shadow-button rounded-xl py-4 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-gidugu text-lg text-white font-bold">
                    {loading ? 'UPLOADING...' : 'UPLOAD PROJECT'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
