import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Project } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { Edit, Trash2, Save, X, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'projects' | 'upvotes';

const Dashboard: React.FC = () => {
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [votedProjects, setVotedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  
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

  const tabAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 }
    }
  };

  const fetchUserData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: projects, error: projectsError } = await supabase
        .from('projects_with_votes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (projectsError) throw projectsError;

      // Fetch voted projects using two separate queries
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('project_id')
        .eq('user_id', user.id);
      if (votesError) throw votesError;

      // Get the project IDs that the user has voted for
      const votedProjectIds = votes?.map(v => v.project_id) || [];
      console.log('Voted project IDs:', votedProjectIds);
      
      // Fetch the actual project data for voted projects
      let votedProjectsData: Project[] = [];
      if (votedProjectIds.length > 0) {
        const { data: votedProjects, error: votedProjectsError } = await supabase
          .from('projects_with_votes')
          .select('*')
          .in('id', votedProjectIds);
        if (votedProjectsError) throw votedProjectsError;
        votedProjectsData = votedProjects || [];
        console.log('Voted projects data:', votedProjectsData);
      }

      console.log('Setting voted projects:', votedProjectsData);
      setUserProjects(projects || []);
      setVotedProjects(votedProjectsData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  const handleEdit = (project: Project) => {
    setEditingProject(project.id);
    setEditForm({ title: project.title, description: project.description });
  };

  const handleSaveEdit = async (projectId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('projects')
        .update({ title: editForm.title.trim(), description: editForm.description.trim() })
        .eq('id', projectId)
        .eq('user_id', user.id);
      if (error) throw error;
      setEditingProject(null);
      fetchUserData();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!user || !confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId).eq('user_id', user.id);
      if (error) throw error;
      fetchUserData();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleRemoveVote = async (projectId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('votes').delete().eq('user_id', user.id).eq('project_id', projectId);
      if (error) throw error;
      fetchUserData();
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Debug logging
  console.log('Dashboard render - activeTab:', activeTab, 'votedProjects:', votedProjects, 'userProjects:', userProjects);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] pt-32">
        <Header />
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-gray mx-auto mb-4"></div>
            <p className="font-poppins text-black">Loading dashboard...</p>
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
            Your Dashboard
          </h1>
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="h-px bg-black w-12"></div>
            <p className="font-poppins font-medium text-lg text-black truncate max-w-full">
              WELCOME, {user?.email}
            </p>
            <div className="h-px bg-black w-12"></div>
          </div>
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

        {/* Tab Navigation */}
        <motion.div 
          className="flex justify-center mb-8"
          variants={tabAnimation}
        >
          <div className="bg-white/70 backdrop-blur-sm border border-[#DDDDDD] rounded-2xl p-1 shadow-card">
            <motion.button
              onClick={() => setActiveTab('projects')}
              className={`px-8 py-3 rounded-xl font-poppins font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-dark-gray text-white shadow-button'
                  : 'text-black hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Your Projects ({userProjects.length})
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('upvotes')}
              className={`px-8 py-3 rounded-xl font-poppins font-medium transition-colors ${
                activeTab === 'upvotes'
                  ? 'bg-dark-gray text-white shadow-button'
                  : 'text-black hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Upvotes ({votedProjects.length})
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          className="max-w-4xl mx-auto"
          variants={containerAnimation}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="flex items-center justify-between mb-6"
                  variants={itemAnimation}
                >
                  <h2 className="font-playfair font-bold text-2xl text-dark-gray">Your Projects</h2>
                  <motion.button 
                    onClick={() => navigate('/upload')} 
                    className="bg-dark-gray shadow-button rounded-xl px-6 py-2 hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="font-gidugu text-sm text-white font-bold">ADD PROJECT</span>
                  </motion.button>
                </motion.div>
                <motion.div 
                  className="space-y-6"
                  variants={containerAnimation}
                >
                  {userProjects.map((project, index) => (
                    <motion.div 
                      key={project.id} 
                      className="bg-white/70 backdrop-blur-sm border border-[#DDDDDD] rounded-2xl p-6 shadow-card"
                      variants={cardAnimation}
                      custom={index}
                    >
                      {editingProject === project.id ? (
                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-poppins" />
                          <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-poppins resize-none" />
                          <div className="flex space-x-2">
                            <motion.button 
                              onClick={() => handleSaveEdit(project.id)} 
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Save size={16} />
                            </motion.button>
                            <motion.button 
                              onClick={() => setEditingProject(null)} 
                              className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X size={16} />
                            </motion.button>
                          </div>
                        </motion.div>
                      ) : (
                        <>
                          <h3 className="font-poppins font-bold text-xl text-black mb-2">{project.title}</h3>
                          <p className="font-poppins text-sm text-black leading-relaxed mb-4">{project.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <a href={project.vercel_url} target="_blank" rel="noopener noreferrer" className="font-poppins text-sm text-dark-gray hover:underline">View Project →</a>
                              <span className="flex items-center font-poppins text-sm text-gray-600"><ThumbsUp size={14} className="mr-1" /> {project.vote_count || 0}</span>
                            </div>
                            <div className="flex space-x-2">
                              <motion.button 
                                onClick={() => handleEdit(project)} 
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Edit size={14} />
                              </motion.button>
                              <motion.button 
                                onClick={() => handleDelete(project.id)} 
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Trash2 size={14} />
                              </motion.button>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                  {userProjects.length === 0 && !loading && (
                    <motion.div 
                      className="text-center py-8 bg-white/50 rounded-2xl"
                      variants={itemAnimation}
                    >
                      <p className="font-poppins text-gray-600 mb-4">You haven't uploaded any projects yet.</p>
                      <motion.button 
                        onClick={() => navigate('/upload')} 
                        className="bg-dark-gray shadow-button rounded-xl px-6 py-3 hover:bg-gray-800 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="font-gidugu text-lg text-white font-bold">UPLOAD FIRST PROJECT</span>
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'upvotes' && (
              <div key="upvotes">
                <h2 className="font-playfair font-bold text-2xl text-dark-gray mb-6">
                  Projects You Voted For ({votedProjects.length})
                </h2>
                <div className="space-y-6">
                  {votedProjects.map((project, index) => (
                    <div 
                      key={project.id} 
                      className="bg-white/70 backdrop-blur-sm border border-[#DDDDDD] rounded-2xl p-6 shadow-card"
                    >
                      <h3 className="font-poppins font-bold text-xl text-black mb-2">{project.title}</h3>
                      <p className="font-poppins text-sm text-gray-600 mb-2">by {project.user_email}</p>
                      <p className="font-poppins text-sm text-black leading-relaxed mb-4">{project.description}</p>
                      <div className="flex items-center justify-between">
                        <a href={project.vercel_url} target="_blank" rel="noopener noreferrer" className="font-poppins text-sm text-dark-gray hover:underline">View Project →</a>
                        <button 
                          onClick={() => handleRemoveVote(project.id)} 
                          className="flex items-center px-3 py-1 bg-red-500 text-white rounded-lg font-poppins  hover:bg-red-600"
                        >
                          <Trash2 size={12} className="mr-1" /> Remove Vote
                        </button>
                      </div>
                    </div>
                  ))}
                  {votedProjects.length === 0 && !loading && (
                    <div className="text-center py-8 bg-white/50 rounded-2xl">
                      <p className="font-poppins text-gray-600 mb-4">You haven't voted for any projects yet.</p>
                      <button 
                        onClick={() => navigate('/projects')} 
                        className="bg-dark-gray shadow-button rounded-xl px-6 py-3 hover:bg-gray-800 transition-colors"
                      >
                        <span className="font-gidugu text-lg text-white font-bold">BROWSE PROJECTS</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
