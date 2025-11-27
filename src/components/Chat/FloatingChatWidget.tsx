'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircleMore, X } from 'lucide-react';
import { ChannelConfig, WidgetPosition } from '@/types/chat';
import ChatOption from './ChatOption';

interface FloatingChatWidgetProps {
  channels: ChannelConfig[];
  position?: WidgetPosition;
  ctaText?: string;
}

const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ 
  channels, 
  position = { side: 'right', bottom: 24, sideSpacing: 24 },
  ctaText = "Need help? Chat with us!"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="fixed z-50 flex flex-col items-end"
      style={{
        bottom: `${position.bottom}px`,
        [position.side]: `${position.sideSpacing}px`,
      }}
    >
      {/* Channel List - Expands Upwards */}
      <div className={`flex flex-col items-end transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-10 invisible pointer-events-none'}`}>
        {channels.map((channel, index) => (
          <ChatOption 
            key={channel.id} 
            config={channel} 
            index={channels.length - 1 - index} 
          />
        ))}
      </div>

      {/* Main Toggle Button */}
      <div className="relative group">
        
        {/* CTA Tooltip */}
        {!isOpen && (
          <div
            className="absolute right-full mr-4 top-1/2 -translate-y-1/2 text-gray-800 text-sm font-medium px-4 py-2 rounded-lg shadow-lg whitespace-nowrap transition-all duration-300 opacity-0 group-hover:opacity-100 border border-gray-100"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {ctaText}
            {/* Arrow */}
            <div
              className="absolute top-1/2 -right-2 -mt-1.5 border-8 border-transparent"
              style={{ borderLeftColor: '#FFFFFF' }}
            ></div>
          </div>
        )}

        <button
          onClick={toggleOpen}
          className={`
            relative flex items-center justify-center w-14 h-14 rounded-2xl 
            transition-all duration-300 transform shadow-2xl
            focus:outline-none focus:ring-4 focus:ring-opacity-30
            ${isOpen 
              ? 'bg-gray-800 rotate-90 scale-100' 
              : 'bg-green hover:scale-110 hover:shadow-3xl animate-bounce-subtle'
            }
          `}
          style={{
            backgroundColor: isOpen ? 'var(--black)' : 'var(--green)'
          }}
          aria-label="Toggle chat options"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white transition-transform duration-300" />
          ) : (
            <MessageCircleMore className="w-8 h-8 text-black" aria-hidden="true" />
          )}
          
        </button>
      </div>
    </div>
  );
};

export default FloatingChatWidget;