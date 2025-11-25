import React from 'react';
import Image from 'next/image';

const AboutStory: React.FC = () => {
  return (
    <section id="story" className="py-20 bg-white">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 relative">
           {/* Decorative visual elements */}
           <div className="absolute -top-4 -left-4 w-24 h-24 bg-green/10 rounded-full z-0"></div>
           <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-surface rounded-full z-0"></div>
           
           <div className="relative z-10 max-w-sm mx-auto md:mx-0 lg:max-w-md">
                <Image
                  src="https://assets.veebipop.com/images/team-optimized.webp"
                  alt="Design Studio"
                  width={400}
                  height={300}
                  className="w-full rounded-2xl shadow-xl transform transition-transform hover:scale-[1.01]" 
                />
              </div>
           <div className="absolute bottom-8 left-8 z-20 bg-white p-6 rounded-lg shadow-lg max-w-xs hidden lg:block">
             <p className="text-4xl font-bold text-green mb-1">10+</p>
             <p className="text-sm text-secondary font-medium">Years of Manufacturing Excellence</p>
           </div>
        </div>

        <div className="order-1 md:order-2">
          <h2 className="heading3 text-black mb-6">
            Crafting Trends Since 2015
          </h2>
          <div className="space-y-4 text-secondary leading-relaxed body1">
            <p>
              Founded in 2015 and headquartered in Dongguan — the world's toy manufacturing capital — we are a leading original manufacturer specializing in trendy collectible dolls, plush doll clothing, fashion bag charms, phone straps, car rearview mirror hangings, and blind box series.
            </p>
            <p>
              With over a decade of deep expertise, we proudly serve wholesalers, brands, and retailers across Europe, North America, Japan, Korea, and the Middle East. From viral monster-style plushies to kawaii car charms that dominate social media feeds, our products define the trends you see worldwide.
            </p>
            <p>
              As a true source factory with 200+ skilled workers, a dedicated 15-person design team, and a monthly capacity exceeding 500,000 pieces, we guarantee authenticity, rapid trend response, and competitive factory-direct pricing.
            </p>
            <p className="font-semibold text-black pt-2">
              We hold BSCI, Sedex, CE, ASTM, and CPSIA certifications, ensuring every piece meets the strictest global safety standards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStory;