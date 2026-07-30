import { useState, useEffect } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setIsLogin(true);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
    }
  }, [isAuthModalOpen]);

  const onClose = () => setIsAuthModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const success = login(email, password);
      if (!success) {
        alert('Invalid email or password.');
      }
    } else {
      signup({ firstName, lastName, email, password });
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Blurred overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#040A11]/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-[#0B151F] border border-[#212A33] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#8F9AA4] hover:text-[#F6F9FC] transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl font-bold text-[#F6F9FC] mb-2">
                  {isLogin ? 'Log in' : 'Create an account'}
                </h2>
                <p className="text-[#8F9AA4] text-sm">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-[#68E371] hover:text-[#52c95b] font-medium transition-colors"
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">First name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Last name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Your email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-[#8F9AA4]">Your password</label>
                    {isLogin && (
                      <a href="#" className="text-xs text-[#8F9AA4] hover:text-[#F6F9FC] transition-colors">
                        Forget your password?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#68E371] hover:bg-[#52c95b] text-[#050C13] font-bold py-3 rounded-xl mt-4 transition-colors shadow-[0_0_20px_rgba(104,227,113,0.15)]"
                >
                  {isLogin ? 'Log in' : 'Sign up'}
                </button>
              </form>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
