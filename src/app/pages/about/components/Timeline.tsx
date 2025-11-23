import React from 'react';
import { MILESTONES } from '@/constants/aboutConstants';

const Timeline: React.FC = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="heading2 text-black">Our Journey</h2>
          <p className="text-secondary mt-2 body1">A decade of growth and innovation</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-green/20 -ml-[1px]"></div>

          <div className="space-y-12">
            {MILESTONES.map((item, index) => (
              <div key={index} className={`relative flex flex-col md:flex-row items-start ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Content Side */}
                <div className="ml-12 md:ml-0 md:w-1/2 md:px-12">
                   <div className={`bg-white p-6 rounded-lg border border-line shadow-sm hover:shadow-md transition-shadow ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                      <span className="inline-block py-1 px-2 rounded bg-green/10 text-green text-xs font-bold mb-2">
                        {item.year}
                      </span>
                      <h3 className="heading6 text-black mb-2">{item.title}</h3>
                      <p className="text-secondary text-sm leading-relaxed body1">{item.description}</p>
                   </div>
                </div>

                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 top-6 w-4 h-4 rounded-full bg-green border-4 border-white shadow-sm transform -translate-x-1/2"></div>
                
                {/* Empty Side for layout balance */}
                <div className="hidden md:block md:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;