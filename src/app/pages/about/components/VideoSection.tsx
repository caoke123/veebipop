'use client';

import React, { useState } from 'react';
import { Play } from '@phosphor-icons/react';
import Image from 'next/image';

const VideoSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="bg-white py-20 text-secondary text-center">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2 className="heading3 mb-8">See Our Factory in Action</h2>
        
        {/* Video Container: 9:16 aspect ratio, restricted width for vertical video */}
        <div className="relative w-full max-w-sm mx-auto aspect-[9/16] bg-surface rounded-2xl overflow-hidden shadow-2xl border border-line group">
          {!isPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={() => setIsPlaying(true)}>
              {/* Thumbnail Placeholder - using vertical dimensions */}
              <Image 
                src="https://image.nv315.top/images/image (1)-optimized.webp" 
                alt="Video Thumbnail" 
                fill
                className="object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-300"
              />
              {/* Play Button */}
              <div className="relative z-10 w-20 h-20 bg-green/80 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-green/40">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              <div className="absolute bottom-6 left-6 text-left right-6">
                <p className="text-lg font-medium" style={{color: '#D2EF9A'}}>Inside Veebipop</p>
                <p className="text-sm" style={{color: '#D2EF9A'}}>Take a virtual tour of our production line</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative bg-black">
              <video
                className="w-full h-full object-contain"
                controls
                autoPlay
                src="https://image.nv315.top/veebipop-aboutus.mp4"
                onEnded={() => setIsPlaying(false)}
              >
                您的浏览器不支持视频播放。
              </video>
              <button
                onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}
                className="absolute top-4 right-4 text-white bg-black/50 px-3 py-1 rounded hover:bg-black/70 z-20"
              >
                关闭
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;