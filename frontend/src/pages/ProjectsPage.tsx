import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Project } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { ThumbsUp } from 'lucide-react';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const handleVote = async (projectId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const currentlyVoted = userVotes.has(projectId);
    const originalVotes = new Set(userVotes);
    const originalProjects = [...projects];

    // Optimistic UI update
    const newProjects = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, vote_count: (p.vote_count || 0) + (currentlyVoted ? -1 : 1) };
      }
      return p;
    });
    setProjects(newProjects);

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
      setProjects(originalProjects);
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-12">
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
            <button
              onClick={() => navigate('/upload')}
              className="bg-dark-gray shadow-button rounded-xl px-8 py-3 hover:bg-gray-800 transition-colors"
            >
              <span className="font-gidugu text-lg text-white font-bold">
                UPLOAD PROJECT
              </span>
            </button>
          )}
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
            <p className="font-poppins text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {projects.map((project) => {
            const isVoted = userVotes.has(project.id);
            const isOwnProject = user?.id === project.user_id;

            return (
              <div key={project.id} className="bg-white/70 backdrop-blur-sm border border-[#DDDDDD] rounded-2xl p-6 shadow-card flex flex-col">
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
                  
                  <button
                    onClick={() => handleVote(project.id)}
                    disabled={isOwnProject}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-poppins transition-colors ${
                      isOwnProject
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : isVoted
                        ? 'bg-purple-button text-black'
                        : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                  >
                    <ThumbsUp size={16} className={isVoted ? 'text-black' : ''} />
                    <span>{project.vote_count || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {projects.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="font-poppins text-lg text-gray-600 mb-4">
              No projects yet. Be the first to showcase your Dualite creation!
            </p>
            {user && (
              <button
                onClick={() => navigate('/upload')}
                className="bg-dark-gray shadow-button rounded-xl px-8 py-3 hover:bg-gray-800 transition-colors"
              >
                <span className="font-gidugu text-lg text-white font-bold">
                  UPLOAD PROJECT
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
