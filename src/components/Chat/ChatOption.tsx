import React from 'react';
import { ChannelConfig, ChannelType } from '@/types/chat';
import { Phone, Mail, MessageCircle, MessageSquare } from 'lucide-react';

interface ChatOptionProps {
  config: ChannelConfig;
  index: number;
}

const ChatOption: React.FC<ChatOptionProps> = ({ config, index }) => {
  const getHref = (): string => {
    switch (config.type) {
      case ChannelType.WHATSAPP:
        const cleanNumber = config.value.replace(/[^\w]/g, '');
        const text = config.message ? `?text=${encodeURIComponent(config.message)}` : '';
        return `https://wa.me/${cleanNumber}${text}`;
      
      case ChannelType.EMAIL:
        const subject = config.message ? `?subject=${encodeURIComponent(config.message)}` : '';
        return `mailto:${config.value}${subject}`;
      
      case ChannelType.PHONE:
        return `tel:${config.value}`;
      
      case ChannelType.SMS:
        return `sms:${config.value}`;

      default:
        return '#';
    }
  };

  const getIcon = () => {
    if (config.customIcon) return config.customIcon;

    switch (config.type) {
      case ChannelType.WHATSAPP:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" aria-label="WhatsApp" role="img" viewBox="0 0 512 512" className="w-8 h-8">
            <rect width="512" height="512" rx="15%" fill="#25d366"/>
            <path fill="#25d366" stroke="#ffffff" strokeWidth="26" d="M123 393l14-65a138 138 0 1150 47z"/>
            <path fill="#ffffff" d="M308 273c-3-2-6-3-9 1l-12 16c-3 2-5 3-9 1-15-8-36-17-54-47-1-4 1-6 3-8l9-14c2-2 1-4 0-6l-12-29c-3-8-6-7-9-7h-8c-2 0-6 1-10 5-22 22-13 53 3 73 3 4 23 40 66 59 32 14 39 12 48 10 11-1 22-10 27-19 1-3 6-16 2-18"/>
          </svg>
        );
      case ChannelType.EMAIL:
        return <Mail className="w-5 h-5 text-white" />;
      case ChannelType.PHONE:
        return <Phone className="w-5 h-5 text-white" />;
      case ChannelType.SMS:
        return <MessageSquare className="w-5 h-5 text-white" />;
      default:
        return <MessageCircle className="w-5 h-5 text-white" />;
    }
  };

  const getBgColor = () => {
    // 不直接使用config.color，而是映射到Tailwind CSS类
    switch (config.type) {
      case ChannelType.WHATSAPP:
        return 'bg-green-600 hover:bg-green-700';
      case ChannelType.EMAIL:
        return 'bg-red-500 hover:bg-red-600';
      case ChannelType.PHONE:
        return 'bg-green-600 hover:bg-green-700';
      case ChannelType.SMS:
        return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Stagger animation delay based on index
  const style = {
    animationDelay: `${index * 50}ms`
  };

  return (
    <a
      href={getHref()}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg
        transform transition-all duration-200 hover:scale-110 mb-3
        animate-fade-in-up hover:shadow-xl ${getBgColor()}
      `}
      style={{
        ...style,
        backgroundColor: config.color
      }}
      aria-label={config.label}
    >
      {getIcon()}
      
      {/* Tooltip Label - Appears on Hover */}
      <span
        className="absolute right-14 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-lg border border-gray-600"
        style={{ backgroundColor: '#1F2937' }}
      >
        {config.label}
        {/* Little arrow for tooltip */}
        <span
          className="absolute top-1/2 -right-1.5 -mt-1 border-4 border-transparent"
          style={{ borderLeftColor: '#1F2937' }}
        ></span>
      </span>
    </a>
  );
};

export default ChatOption;