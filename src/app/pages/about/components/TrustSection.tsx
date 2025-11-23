import React from 'react';
import { Medal, CheckCircle } from '@phosphor-icons/react';

const TrustSection: React.FC = () => {
  const certs = ["BSCI", "Sedex", "ISO 9001", "CE", "ASTM F963", "CPSIA"];

  return (
    <section className="py-20 bg-white border-t border-line">
      <div className="container mx-auto px-6">
        
        {/* Certificates Grid */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-16">
          {certs.map((cert, i) => (
            <div key={i} className="flex items-center gap-2 px-6 py-3 bg-surface rounded-full border border-line">
              <Medal className="w-5 h-5 text-green" />
              <span className="font-semibold text-black">{cert}</span>
            </div>
          ))}
        </div>

        {/* Trust Statement */}
        <div className="bg-black rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="heading4 mb-4">Trusted by Global Partners</h3>
              <p className="text-white/80 leading-relaxed body1">
                From boutique brand launches in Tokyo to major retail chains in New York and Paris, 
                we are the silent engine behind successful plush and collectible brands worldwide.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green w-5 h-5" />
                <span className="font-medium">100% IP Protection</span>
              </div>
               <div className="flex items-center gap-3">
                <CheckCircle className="text-green w-5 h-5" />
                <span className="font-medium">Confidentiality Agreements (NDA)</span>
              </div>
               <div className="flex items-center gap-3">
                <CheckCircle className="text-green w-5 h-5" />
                <span className="font-medium">Ethical Labor Practices</span>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;