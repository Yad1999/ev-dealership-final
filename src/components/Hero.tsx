import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import evHeroGif from '../assets/ev-hero-image.gif';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background GIF Image */}
      <img
        src={evHeroGif}
        alt="Electric Vehicle"
        className="absolute inset-0 w-full h-full object-cover object-right-center opacity-70 pointer-events-none"
      />

      {/* Vignette Overlay Stack for High Contrast & Text Readability */}
      {/* Horizontal Gradient: solid dark on left for text, fading right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#040A11] via-[#040A11]/85 to-transparent/30 pointer-events-none" />

      {/* Vertical Bottom Gradient: smooth fade to page canvas */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#040A11] via-transparent to-black/40 pointer-events-none" />

      {/* Subtle Electric Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,194,206,0.15),transparent_60%)] pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-2xl space-y-8">
          {/* H1 Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#F6F9FC] leading-[1.08]">
            The future of driving is{' '}
            <span className="text-gradient">
              current.
            </span>
          </h1>

          {/* Lead Paragraph */}
          <p className="text-base sm:text-lg text-[#8F9AA4] max-w-xl leading-relaxed">
            Discover, compare, and order high-performance electric vehicles with nationwide charging access, instant delivery, and zero emissions.
          </p>

          {/* CTA Buttons Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {/* Primary CTA */}
            <Link
              to="/shop?condition=new"
              className="group inline-flex items-center gap-2 bg-electric-gradient text-[#050C13] font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-glow hover:opacity-95 transition-all duration-200"
            >
              Shop New EVs
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            {/* Secondary CTA */}
            <Link
              to="/shop?condition=used"
              className="group inline-flex items-center gap-2 bg-[#0B151F]/40 border border-[#212A33] text-[#F6F9FC] font-medium text-sm sm:text-base px-6 py-3.5 rounded-xl backdrop-blur-md hover:border-[#68E371] hover:bg-[#0B151F]/70 transition-all duration-200"
            >
              Shop Used EVs
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
