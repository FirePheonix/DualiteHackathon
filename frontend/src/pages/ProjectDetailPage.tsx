import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Project, Comment } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { ThumbsUp, MessageCircle, ExternalLink, ArrowLeft, Edit3, Trash2, Reply, Send } from 'lucide-react';
import MediaCarousel from '../components/MediaCarousel';
import { getGoogleDriveImageUrl, isGoogleDriveUrl, isImgBbUrl } from '../lib/mediaUtils';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userVoted, setUserVoted] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
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

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('projects_with_votes')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      setError('Project not found');
    }
  }, [projectId]);

  const fetchComments = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users!comments_user_id_fkey(email)
        `)
        .eq('project_id', projectId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include user_email and fetch replies
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from('comments')
            .select(`
              *,
              users!comments_user_id_fkey(email)
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          return {
            ...comment,
            user_email: comment.users?.email,
            replies: replies?.map(reply => ({
              ...reply,
              user_email: reply.users?.email
            })) || []
          };
        })
      );
      
      setComments(commentsWithReplies);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    }
  }, [projectId]);

  const checkUserVote = useCallback(async () => {
    if (!user || !projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('id')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .single();

      if (!error && data) {
        setUserVoted(true);
      }
    } catch (error: any) {
      // User hasn't voted
      setUserVoted(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    fetchProject();
    fetchComments();
    checkUserVote();
    setLoading(false);
  }, [fetchProject, fetchComments, checkUserVote]);

  const handleVote = async () => {
    if (!user || !projectId) {
      navigate('/auth');
      return;
    }

    const isOwnProject = user.id === project?.user_id;
    if (isOwnProject) return;

    const originalVoted = userVoted;
    const originalVoteCount = project?.vote_count || 0;

    // Optimistic update
    setUserVoted(!userVoted);
    setProject(prev => prev ? {
      ...prev,
      vote_count: (prev.vote_count || 0) + (userVoted ? -1 : 1)
    } : null);

    try {
      if (userVoted) {
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
      // Revert on error
      setUserVoted(originalVoted);
      setProject(prev => prev ? {
        ...prev,
        vote_count: originalVoteCount
      } : null);
      setError('Failed to update vote. Please try again.');
    }
  };

  const handleAddComment = async () => {
    if (!user || !projectId || !newComment.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          user_id: user.id,
          project_id: projectId,
          content: newComment.trim()
        }])
        .select(`
          *,
          users!comments_user_id_fkey(email)
        `)
        .single();

      if (error) throw error;

      const newCommentWithUser = {
        ...data,
        user_email: data.users?.email,
        replies: []
      };

      setComments(prev => [newCommentWithUser, ...prev]);
      setNewComment('');
    } catch (error: any) {
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          user_id: user.id,
          project_id: projectId!,
          parent_id: parentId,
          content: replyContent.trim()
        }])
        .select(`
          *,
          users!comments_user_id_fkey(email)
        `)
        .single();

      if (error) throw error;

      const newReply = {
        ...data,
        user_email: data.users?.email
      };

      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...comment.replies || [], newReply] }
          : comment
      ));
      
      setReplyContent('');
      setReplyingTo(null);
    } catch (error: any) {
      setError('Failed to add reply. Please try again.');
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: editContent.trim() }
          : comment
      ));
      
      setEditContent('');
      setEditingComment(null);
    } catch (error: any) {
      setError('Failed to edit comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error: any) {
      setError('Failed to delete comment. Please try again.');
    }
  };

  const getProjectThumbnail = (project: Project) => {
    // If project has a custom thumbnail (Google Drive or IMG BB), use it
    if (project.thumbnail_url && (isGoogleDriveUrl(project.thumbnail_url) || isImgBbUrl(project.thumbnail_url))) {
      if (isGoogleDriveUrl(project.thumbnail_url)) {
        return getGoogleDriveImageUrl(project.thumbnail_url);
      }
      return project.thumbnail_url; // IMG BB URLs are already direct
    }
    
    // Fallback to screenshot service
    try {
      const screenshotUrl = `https://api.screenshotone.com/take?url=${encodeURIComponent(project.vercel_url)}&width=800&height=600&format=jpeg&quality=80&block_ads=true&delay=2`;
      return screenshotUrl;
    } catch {
      // Fallback to a placeholder with project name
      return `https://placehold.co/600x400/F0DFCB/020202?text=${encodeURIComponent(project.title)}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] pt-32">
        <Header />
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-gray mx-auto mb-4"></div>
            <p className="font-poppins text-black">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] pt-32">
        <Header />
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="font-poppins text-black text-xl">Project not found</p>
            <button
              onClick={() => navigate('/projects')}
              className="mt-4 bg-dark-gray text-white px-6 py-2 rounded-xl font-poppins"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProject = user?.id === project.user_id;

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-32 pb-16">
      <Header />
      <motion.div 
        className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12"
        initial="hidden"
        animate="visible"
        variants={containerAnimation}
      >
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/projects')}
          className="flex items-center space-x-2 text-dark-gray hover:text-gray-700 mb-8 font-poppins"
          variants={itemAnimation}
          whileHover={{ x: -5 }}
        >
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </motion.button>

        {/* Project Header */}
        <motion.div 
          className="bg-white/70 backdrop-blur-sm border border-[#DDDDDD] rounded-2xl p-8 mb-8 shadow-card"
          variants={itemAnimation}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project Media */}
            <div className="lg:col-span-2">
              {project.media_urls && project.media_urls.length > 0 ? (
                <MediaCarousel 
                  mediaUrls={project.media_urls} 
                  projectTitle={project.title} 
                />
              ) : (
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-200">
                  <img
                    src={getProjectThumbnail(project)}
                    alt={`Screenshot of ${project.title}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://placehold.co/600x400/F0DFCB/020202?text=${encodeURIComponent(project.title)}`;
                    }}
                  />
                </div>
              )}
            </div>

            {/* Project Info */}
            <div className="space-y-6">
              <div>
                <h1 className="font-playfair font-bold text-3xl lg:text-4xl text-dark-gray mb-2">
                  {project.title}
                </h1>
                <p className="font-poppins text-sm text-gray-600 mb-4">
                  by {project.user_email} • {formatDate(project.created_at)}
                </p>
                <p className="font-poppins text-black leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  onClick={handleVote}
                  disabled={isOwnProject}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-poppins font-medium transition-colors ${
                    isOwnProject
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : userVoted
                      ? 'bg-purple-button text-black'
                      : 'bg-dark-gray text-white hover:bg-gray-800'
                  }`}
                  whileHover={!isOwnProject ? { scale: 1.02 } : {}}
                  whileTap={!isOwnProject ? { scale: 0.98 } : {}}
                >
                  <ThumbsUp size={20} />
                  <span>{userVoted ? 'Upvoted' : 'Upvote'} • {project.vote_count || 0}</span>
                </motion.button>

                <a
                  href={project.vercel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-dark-gray text-dark-gray rounded-xl font-poppins font-medium hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink size={20} />
                  <span>Visit Site</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div 
          className="bg-white/70 backdrop-blur-sm border border-[#DDDDDD] rounded-2xl p-8 shadow-card"
          variants={itemAnimation}
        >
          <div className="flex items-center space-x-2 mb-6">
            <MessageCircle size={24} className="text-dark-gray" />
            <h2 className="font-playfair font-bold text-2xl text-dark-gray">
              Comments ({comments.length})
            </h2>
          </div>

          {/* Add Comment */}
          {user && (
            <motion.div className="mb-8" variants={itemAnimation}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this project..."
                className="w-full p-4 border border-gray-300 rounded-xl font-poppins focus:outline-none focus:ring-2 focus:ring-dark-gray focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <motion.button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-dark-gray text-white rounded-lg font-poppins font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={16} />
                  <span>Comment</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <motion.div 
                key={comment.id}
                className="border-b border-gray-200 pb-6 last:border-b-0"
                variants={itemAnimation}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-poppins font-medium text-black">
                        {comment.user_email}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    
                    {editingComment === comment.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg font-poppins focus:outline-none focus:ring-2 focus:ring-dark-gray focus:border-transparent resize-none"
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="px-3 py-1 bg-dark-gray text-white rounded-lg font-poppins text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setEditContent('');
                            }}
                            className="px-3 py-1 bg-gray-300 text-black rounded-lg font-poppins text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="font-poppins text-black leading-relaxed mb-3">
                        {comment.content}
                      </p>
                    )}

                    {/* Comment Actions */}
                    <div className="flex items-center space-x-4">
                      {user && (
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="flex items-center space-x-1 text-gray-600 hover:text-dark-gray font-poppins text-sm"
                        >
                          <Reply size={14} />
                          <span>Reply</span>
                        </button>
                      )}
                      
                      {user?.id === comment.user_id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingComment(comment.id);
                              setEditContent(comment.content);
                            }}
                            className="flex items-center space-x-1 text-gray-600 hover:text-dark-gray font-poppins text-sm"
                          >
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-poppins text-sm"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <motion.div 
                        className="mt-4 ml-6"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full p-3 border border-gray-300 rounded-lg font-poppins focus:outline-none focus:ring-2 focus:ring-dark-gray focus:border-transparent resize-none"
                          rows={2}
                        />
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleAddReply(comment.id)}
                            disabled={!replyContent.trim()}
                            className="px-3 py-1 bg-dark-gray text-white rounded-lg font-poppins text-sm disabled:opacity-50"
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                            className="px-3 py-1 bg-gray-300 text-black rounded-lg font-poppins text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-6 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-poppins font-medium text-black">
                                {reply.user_email}
                              </span>
                              <span className="text-gray-500 text-sm">
                                {formatDate(reply.created_at)}
                              </span>
                            </div>
                            <p className="font-poppins text-black leading-relaxed mb-2">
                              {reply.content}
                            </p>
                            {user?.id === reply.user_id && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="text-red-600 hover:text-red-700 font-poppins text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {comments.length === 0 && (
            <motion.div 
              className="text-center py-8"
              variants={itemAnimation}
            >
              <p className="font-poppins text-gray-600">
                No comments yet. Be the first to share your thoughts!
              </p>
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div 
              className="fixed top-20 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl z-50"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-poppins text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ProjectDetailPage;
