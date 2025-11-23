import React from 'react';
import Image from 'next/image';
import { TEAM } from '@/constants/aboutConstants';

const TeamSection: React.FC = () => {
  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="heading2 text-black mb-4">Meet The Team</h2>
          <p className="body1 text-secondary max-w-2xl mx-auto">
            The experts behind your products, dedicated to excellence in every stitch.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEAM.map((member, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="h-64 overflow-hidden relative">
                <Image 
                  src={member.imagePath}
                  alt={member.role}
                  width={400}
                  height={500}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-white text-xs leading-relaxed opacity-90 caption1">
                    {member.bio}
                  </p>
                </div>
              </div>
              <div className="p-6 text-center border-t border-line">
                <h3 className="heading6 text-black">{member.name}</h3>
                <p className="text-green font-medium text-sm uppercase tracking-wide mt-1 caption1">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;