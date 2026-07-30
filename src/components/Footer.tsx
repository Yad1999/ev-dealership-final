export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#040A11] border-t border-[#1a2634] py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

        {/* Brand & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <span className="font-bold text-base text-[#F6F9FC] font-['Space_Grotesk'] tracking-tight">
            VoltMarket
          </span>
          <span className="hidden sm:inline text-[#1a2634]">|</span>
          <p className="text-sm text-[#8D9CAE]">
            &copy; {currentYear} VoltMarket
          </p>
        </div>

        {/* Legal Links */}
        <div className="flex items-center gap-6 text-sm text-[#8D9CAE]">
          <a href="#privacy" className="hover:text-[#F6F9FC] transition-colors">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-[#F6F9FC] transition-colors">
            Terms of Service
          </a>
          <a href="#contact" className="hover:text-[#F6F9FC] transition-colors">
            Contact
          </a>
        </div>

      </div>
    </footer>
  );
}
