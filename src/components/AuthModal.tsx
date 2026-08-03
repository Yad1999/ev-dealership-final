import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, MapPin, Building2, Map, Globe, Hash, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setIsLogin(true);
      setUsername('');
      setEmail('');
      setPassword('');
      setFname('');
      setLname('');
      setStreet('');
      setCity('');
      setProvince('');
      setCountry('');
      setZip('');
      setPhone('');
      setError('');
    }
  }, [isAuthModalOpen]);

  const onClose = () => setIsAuthModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid username or password.');
      } else {
        setError('');
      }
    } else {
      const hasAddress = street || city || province || country || zip || phone;
      const success = await signup({
        username,
        email,
        password,
        fname: fname.trim() || undefined,
        lname: lname.trim() || undefined,
        address: hasAddress ? {
          street: street.trim(),
          city: city.trim(),
          province: province.trim(),
          country: country.trim(),
          zip: zip.trim(),
          phone: phone.trim()
        } : undefined
      });
      if (!success) {
        setError('Failed to create account.');
      } else {
        setError('');
      }
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
            className={`relative w-full ${isLogin ? 'max-w-md' : 'max-w-lg'} max-h-[90vh] bg-[#0B151F] border border-[#212A33] rounded-3xl shadow-2xl overflow-y-auto flex flex-col`}
          >

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#8F9AA4] hover:text-[#F6F9FC] transition-colors p-1 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold text-[#F6F9FC] mb-2">
                  {isLogin ? 'Log in' : 'Create an account'}
                </h2>
                <p className="text-[#8F9AA4] text-sm">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="text-[#68E371] hover:text-[#52c95b] font-medium transition-colors"
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. janedoe"
                      className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">First Name</label>
                        <input
                          type="text"
                          value={fname}
                          onChange={(e) => setFname(e.target.value)}
                          placeholder="Jane"
                          className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Last Name</label>
                        <input
                          type="text"
                          value={lname}
                          onChange={(e) => setLname(e.target.value)}
                          placeholder="Doe"
                          className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Your email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jane@email.com"
                          className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

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
                      placeholder="••••••••"
                      className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="pt-3 border-t border-[#212A33] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#68E371] uppercase tracking-wider">
                        Address Details
                      </span>
                      <span className="text-[11px] text-[#5A6E85]">Used for faster checkout</span>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Street Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="40 Bay Street"
                          className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">City</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Toronto"
                            className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Province / State</label>
                        <div className="relative">
                          <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                          <input
                            type="text"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            placeholder="Ontario"
                            className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Country</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                          <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Canada"
                            className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">ZIP / Postal Code</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                          <input
                            type="text"
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            placeholder="M5J 3A5"
                            className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#8F9AA4] mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6E85]" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="416-555-5555"
                          className="w-full bg-[#14202D] border border-[#212A33] text-[#F6F9FC] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#68E371] transition-colors placeholder-[#304050]"
                        />
                      </div>
                    </div>
                  </div>
                )}

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
