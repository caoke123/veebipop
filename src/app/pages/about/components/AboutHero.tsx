import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AboutHero: React.FC = () => {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://assets.veebipop.com/2149686863.jpg"
          alt="Factory Workshop"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/60 mix-blend-multiply"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <span className="inline-block py-1 px-3 rounded-full bg-green/20 border border-green text-green text-sm font-semibold tracking-wider mb-6 backdrop-blur-sm">
          EST. 2015 — CHINA
        </span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          Trendy Collectibles <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green to-green/70">
            Direct from the Source
          </span>
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 font-light">
          Your trusted original manufacturer of Pop Toys, Plush Keychains, and Car Accessories. 
          Serving global brands with speed, quality, and innovation.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="#contact" 
            className="px-8 py-4 bg-green hover:bg-green/80 text-black rounded-lg font-semibold transition-all transform hover:-translate-y-1 shadow-lg flex items-center gap-2"
          >
            Start Your Project →
          </Link>
          <Link 
            href="#story" 
            className="px-8 py-4 bg-transparent border border-white text-white rounded-lg font-semibold hover:bg-white hover:text-black transition-all"
          >
            Our Story
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;