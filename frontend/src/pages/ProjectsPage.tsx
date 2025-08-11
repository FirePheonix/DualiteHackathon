import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Project } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { ThumbsUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TimeFilter = 'all' | 'today' | 'week' | 'month';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Animation variants
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const cardAnimation = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const searchAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 }
    }
  };

  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects_with_votes')
        .select('*')
        .order('vote_count', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserVotes = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('project_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserVotes(new Set(data.map(vote => vote.project_id)));
    } catch (error: any) {
      console.error('Error fetching user votes:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
    if (user) {
      fetchUserVotes();
    }
  }, [user, fetchProjects, fetchUserVotes]);

  // Filter and sort projects based on search query and time filter
  useEffect(() => {
    let filtered = [...projects];

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(project => {
        const projectDate = new Date(project.created_at);
        switch (timeFilter) {
          case 'today':
            return projectDate >= today;
          case 'week':
            return projectDate >= weekAgo;
          case 'month':
            return projectDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.user_email?.toLowerCase().includes(query)
      );
    }

    // Sort by vote count (descending)
    filtered.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));

    setFilteredProjects(filtered);
  }, [projects, searchQuery, timeFilter]);

  const handleVote = async (projectId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const currentlyVoted = userVotes.has(projectId);
    const originalVotes = new Set(userVotes);
    const originalProjects = [...filteredProjects];

    // Optimistic UI update
    const newProjects = filteredProjects.map(p => {
      if (p.id === projectId) {
        return { ...p, vote_count: (p.vote_count || 0) + (currentlyVoted ? -1 : 1) };
      }
      return p;
    });
    setFilteredProjects(newProjects);

    const newVotes = new Set(userVotes);
    if (currentlyVoted) {
      newVotes.delete(projectId);
    } else {
      newVotes.add(projectId);
    }
    setUserVotes(newVotes);

    try {
      if (currentlyVoted) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('project_id', projectId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('votes')
          .insert([{ user_id: user.id, project_id: projectId }]);
        if (error) throw error;
      }
    } catch (error: any) {
      setError('Failed to update vote. Please try again.');
      // Revert UI on error
      setUserVotes(originalVotes);
      setFilteredProjects(originalProjects);
    }
  };

  const getProjectThumbnail = (url: string) => {
    try {
      // Use a reliable free screenshot service
      // This service provides website screenshots without API keys
      const screenshotUrl = `https://api.screenshotone.com/take?url=${encodeURIComponent(url)}&width=800&height=600&format=jpeg&quality=80&block_ads=true&delay=2`;
      return screenshotUrl;
    } catch {
      // Fallback to a placeholder if URL is invalid
      return `https://placehold.co/600x400/F0DFCB/020202?text=Website+Screenshot`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] pt-32">
        <Header />
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-gray mx-auto mb-4"></div>
            <p className="font-poppins text-black">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-32 pb-16">
      <Header />
      <motion.div 
        className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12"
        initial="hidden"
        animate="visible"
        variants={containerAnimation}
      >
        <motion.div 
          className="text-center mb-12"
          variants={itemAnimation}
        >
          <h1 className="font-playfair font-bold text-3xl lg:text-5xl text-dark-gray mb-6">
            Community Showcase
          </h1>
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="h-px bg-black w-12"></div>
            <p className="font-poppins font-medium text-lg text-black">
              PROJECTS BUILT WITH DUALITE
            </p>
            <div className="h-px bg-black w-12"></div>
          </div>
          {user && (
            <motion.button
              onClick={() => navigate('/upload')}
              className="bg-dark-gray shadow-button rounded-xl px-8 py-3 hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-gidugu text-lg text-white font-bold">
                UPLOAD PROJECT
              </span>
            </motion.button>
          )}
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div 
              className="max-w-md mx-auto mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-poppins text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filter Section */}
        <motion.div 
          className="max-w-4xl mx-auto mb-8"
          variants={searchAnimation}
        >
          <div className="bg-white/70 backdrop-blur-sm border border-[#DDDDDD] rounded-2xl p-6 shadow-card">
            {/* Search Bar */}
            <motion.div 
              className="relative mb-6"
              variants={itemAnimation}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search projects by title, description, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl font-poppins focus:outline-none focus:ring-2 focus:ring-dark-gray focus:border-transparent"
              />
            </motion.div>

            {/* Time Filter Buttons */}
            <motion.div 
              className="flex flex-wrap gap-3"
              variants={containerAnimation}
            >
              <motion.button
                onClick={() => setTimeFilter('all')}
                className={`px-4 py-2 rounded-xl font-poppins font-medium transition-colors ${
                  timeFilter === 'all'
                    ? 'bg-dark-gray text-white shadow-button'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
                variants={itemAnimation}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                All Time
              </motion.button>
              <motion.button
                onClick={() => setTimeFilter('today')}
                className={`px-4 py-2 rounded-xl font-poppins font-medium transition-colors ${
                  timeFilter === 'today'
                    ? 'bg-dark-gray text-white shadow-button'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
                variants={itemAnimation}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Today
              </motion.button>
              <motion.button
                onClick={() => setTimeFilter('week')}
                className={`px-4 py-2 rounded-xl font-poppins font-medium transition-colors ${
                  timeFilter === 'week'
                    ? 'bg-dark-gray text-white shadow-button'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
                variants={itemAnimation}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                This Week
              </motion.button>
              <motion.button
                onClick={() => setTimeFilter('month')}
                className={`px-4 py-2 rounded-xl font-poppins font-medium transition-colors ${
                  timeFilter === 'month'
                    ? 'bg-dark-gray text-white shadow-button'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
                variants={itemAnimation}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                This Month
              </motion.button>
            </motion.div>

            {/* Results Count */}
            <motion.div 
              className="mt-4 text-center"
              variants={itemAnimation}
            >
              <p className="font-poppins text-sm text-gray-600">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          variants={containerAnimation}
        >
          {filteredProjects.map((project, index) => {
            const isVoted = userVotes.has(project.id);
            const isOwnProject = user?.id === project.user_id;

            return (
              <motion.div 
                key={project.id} 
                className="bg-white/70 backdrop-blur-sm border border-[#DDDDDD] rounded-2xl p-6 shadow-card flex flex-col"
                variants={cardAnimation}
                custom={index}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="aspect-video mb-4 rounded-xl overflow-hidden bg-gray-200">
                  <img
                    src={getProjectThumbnail(project.vercel_url)}
                    alt={`Screenshot of ${project.title}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if screenshot fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = `https://placehold.co/600x400/F0DFCB/020202?text=${encodeURIComponent(project.title)}`;
                    }}
                    loading="lazy"
                  />
                </div>
                
                <h3 className="font-poppins font-bold text-xl text-black mb-2 truncate" title={project.title}>
                  {project.title}
                </h3>
                
                <p className="font-poppins text-sm text-gray-600 mb-2 truncate" title={project.user_email}>
                  by {project.user_email}
                </p>
                
                <p className="font-poppins text-sm text-black leading-relaxed mb-4 flex-grow">
                  {project.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <a
                    href={project.vercel_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-poppins text-sm text-dark-gray hover:underline"
                  >
                    View Project →
                  </a>
                  
                  <motion.button
                    onClick={() => handleVote(project.id)}
                    disabled={isOwnProject}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-poppins transition-colors ${
                      isOwnProject
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : isVoted
                        ? 'bg-purple-button text-black'
                        : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                    whileHover={!isOwnProject ? { scale: 1.05 } : {}}
                    whileTap={!isOwnProject ? { scale: 0.95 } : {}}
                  >
                    <ThumbsUp size={16} className={isVoted ? 'text-black' : ''} />
                    <span>{project.vote_count || 0}</span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <AnimatePresence>
          {filteredProjects.length === 0 && !loading && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-poppins text-lg text-gray-600 mb-4">
                {searchQuery || timeFilter !== 'all' 
                  ? 'No projects match your current filters.'
                  : 'No projects yet. Be the first to showcase your Dualite creation!'
                }
              </p>
              {user && (
                <motion.button
                  onClick={() => navigate('/upload')}
                  className="bg-dark-gray shadow-button rounded-xl px-8 py-3 hover:bg-gray-800 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-gidugu text-lg text-white font-bold">
                    UPLOAD PROJECT
                  </span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ProjectsPage;
