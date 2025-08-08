import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Project } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { Edit, Trash2, Save, X, ThumbsUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [votedProjects, setVotedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  
  const { user } = useAuth();
  const navigate = useNavigate();

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

      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('projects_with_votes!inner(*)')
        .eq('user_id', user.id);
      if (votesError) throw votesError;

      setUserProjects(projects || []);
      setVotedProjects(votes?.map(v => v.projects_with_votes) || []);
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center mb-12">
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
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
            <p className="font-poppins text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-playfair font-bold text-2xl text-dark-gray">Your Projects ({userProjects.length})</h2>
              <button onClick={() => navigate('/upload')} className="bg-dark-gray shadow-button rounded-xl px-6 py-2 hover:bg-gray-800 transition-colors">
                <span className="font-gidugu text-sm text-white font-bold">ADD PROJECT</span>
              </button>
            </div>
            <div className="space-y-6">
              {userProjects.map((project) => (
                <div key={project.id} className="bg-white/70 backdrop-blur-sm border border-[#DDDDDD] rounded-2xl p-6 shadow-card">
                  {editingProject === project.id ? (
                    <div className="space-y-4">
                      <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-poppins" />
                      <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-poppins resize-none" />
                      <div className="flex space-x-2">
                        <button onClick={() => handleSaveEdit(project.id)} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Save size={16} /></button>
                        <button onClick={() => setEditingProject(null)} className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"><X size={16} /></button>
                      </div>
                    </div>
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
                          <button onClick={() => handleEdit(project)} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(project.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {userProjects.length === 0 && !loading && (
                <div className="text-center py-8 bg-white/50 rounded-2xl">
                  <p className="font-poppins text-gray-600 mb-4">You haven't uploaded any projects yet.</p>
                  <button onClick={() => navigate('/upload')} className="bg-dark-gray shadow-button rounded-xl px-6 py-3 hover:bg-gray-800 transition-colors"><span className="font-gidugu text-lg text-white font-bold">UPLOAD FIRST PROJECT</span></button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-playfair font-bold text-2xl text-dark-gray mb-6">Projects You Voted For ({votedProjects.length})</h2>
            <div className="space-y-6">
              {votedProjects.map((project) => (
                <div key={project.id} className="bg-white/70 backdrop-blur-sm border border-[#DDDDDD] rounded-2xl p-6 shadow-card">
                  <h3 className="font-poppins font-bold text-xl text-black mb-2">{project.title}</h3>
                  <p className="font-poppins text-sm text-gray-600 mb-2">by {project.user_email}</p>
                  <p className="font-poppins text-sm text-black leading-relaxed mb-4">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <a href={project.vercel_url} target="_blank" rel="noopener noreferrer" className="font-poppins text-sm text-dark-gray hover:underline">View Project →</a>
                    <button onClick={() => handleRemoveVote(project.id)} className="flex items-center px-3 py-1 bg-red-500 text-white rounded-lg font-poppins text-xs hover:bg-red-600">
                      <Trash2 size={12} className="mr-1" /> Remove Vote
                    </button>
                  </div>
                </div>
              ))}
              {votedProjects.length === 0 && !loading && (
                <div className="text-center py-8 bg-white/50 rounded-2xl">
                  <p className="font-poppins text-gray-600 mb-4">You haven't voted for any projects yet.</p>
                  <button onClick={() => navigate('/projects')} className="bg-dark-gray shadow-button rounded-xl px-6 py-3 hover:bg-gray-800 transition-colors"><span className="font-gidugu text-lg text-white font-bold">BROWSE PROJECTS</span></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
