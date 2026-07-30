import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Calculator, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoanCalculatorModal } from './LoanCalculatorModal';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoanCalcOpen, setIsLoanCalcOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { currentUser, logout, setIsAuthModalOpen } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Chargers', href: '/#chargers' },
    { name: 'About', href: '/#about' },
  ];

  if (currentUser) {
    navLinks.push({ name: 'Order History', href: '/order-history' });
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      
      if (location.pathname === '/') {
        // If already on Home page, prevent default and manually scroll
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', href);
        }
      }
      // If not on Home page, let the Link do its job and navigate to /#hash
      // The Home component's useEffect will catch the hash on mount.
    }
    setMobileMenuOpen(false);
  };

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#040A11]/85 backdrop-blur-xl border-b border-white/10 py-3.5 shadow-lg'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Brand Title */}
          <Link to="/" onClick={handleBrandClick} className="flex items-center gap-2 group mr-auto md:mr-0 z-[110]">
            <span className="text-xl font-bold font-['Space_Grotesk'] text-[#F6F9FC] tracking-tight group-hover:text-white transition-colors">
            BatteriVolt
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-white/75 hover:text-white transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right CTA Buttons & Mobile Toggle */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Loan Calculator Button */}
            <button
              onClick={() => setIsLoanCalcOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all duration-200 shadow-sm flex items-center justify-center group"
              aria-label="Open Loan Calculator"
              title="Loan Calculator"
            >
              <Calculator className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all duration-200 shadow-sm flex items-center justify-center group"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#68E371] text-[#050C13] font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#040A11] animate-in zoom-in-50 duration-200">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Sign in Button */}
            <button
              onClick={() => currentUser ? logout() : setIsAuthModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4.5 py-2 rounded-full border border-white/20 backdrop-blur-md transition-all duration-200 shadow-sm"
            >
              {currentUser ? 'Sign out' : 'Sign in'}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white/80 hover:text-white p-1.5 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B151F]/95 backdrop-blur-xl border-b border-[#212A33] px-6 py-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200 mt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-base font-medium text-white/80 hover:text-white py-1"
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (currentUser) {
                  logout();
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="text-left text-base font-medium text-[#68E371] hover:text-[#52c95b] py-1 mt-2 border-t border-[#212A33] pt-3"
            >
              {currentUser ? 'Sign out' : 'Sign in'}
            </button>
          </div>
        )}
      </header>

      {/* Loan Calculator Modal */}
      <LoanCalculatorModal
        isOpen={isLoanCalcOpen}
        onClose={() => setIsLoanCalcOpen(false)}
      />
    </>
  );
};
