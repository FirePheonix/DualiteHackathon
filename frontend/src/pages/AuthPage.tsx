import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MailCheck } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSignUpSuccess(false);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSignUpSuccess(true);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-32 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white/70 backdrop-blur-sm border-2 border-[#DDDDDD] rounded-3xl p-8 shadow-card">
            {signUpSuccess ? (
              <div className="text-center">
                <MailCheck className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h1 className="font-playfair font-bold text-3xl text-dark-gray mb-4">
                  Check Your Inbox
                </h1>
                <p className="font-poppins text-black mb-6">
                  We've sent a verification link to <strong>{email}</strong>. Please click the link to confirm your account.
                </p>
                <p className="font-poppins text-sm text-gray-600 mb-8">
                  Didn't see it? Be sure to check your spam folder.
                </p>
                <button
                  onClick={() => {
                    setSignUpSuccess(false);
                    setIsLogin(true);
                  }}
                  className="w-full bg-dark-gray shadow-button rounded-xl py-4 hover:bg-gray-800 transition-colors"
                >
                  <span className="font-gidugu text-lg text-white font-bold">
                    BACK TO SIGN IN
                  </span>
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-playfair font-bold text-3xl lg:text-4xl text-dark-gray mb-4">
                    {isLogin ? 'Welcome Back' : 'Join Dualite Showcase'}
                  </h1>
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="h-px bg-black w-8"></div>
                    <p className="font-poppins font-medium text-sm text-black">
                      {isLogin ? 'SIGN IN' : 'SIGN UP'}
                    </p>
                    <div className="h-px bg-black w-8"></div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block font-poppins text-sm font-medium text-black mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white border border-[#DDDDDD] rounded-xl font-poppins text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-gray focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block font-poppins text-sm font-medium text-black mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-white border border-[#DDDDDD] rounded-xl font-poppins text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dark-gray focus:border-transparent"
                      placeholder="Enter your password"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                      <p className="font-poppins text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-dark-gray shadow-button rounded-xl py-4 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="font-gidugu text-lg text-white font-bold">
                      {loading ? 'Loading...' : (isLogin ? 'SIGN IN' : 'SIGN UP')}
                    </span>
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <p className="font-poppins text-sm text-black">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="ml-2 font-medium text-dark-gray hover:underline"
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
