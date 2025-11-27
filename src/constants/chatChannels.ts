import { ChannelConfig, ChannelType } from '@/types/chat';

export const CHAT_CHANNELS: ChannelConfig[] = [
  {
    id: '1',
    type: ChannelType.WHATSAPP,
    value: '+86 13821385220', // Updated WhatsApp number
    label: 'WhatsApp',
    message: 'Hello! I\'m interested in your products.',
    color: '#25D366'
  },
  {
    id: '2',
    type: ChannelType.EMAIL,
    value: 'sales@veebipop.com', // Updated email address
    label: 'sales@veebipop.com',
    message: 'Product Inquiry from VeebiPop Website',
    color: '#DB4444'
  },
  {
    id: '3',
    type: ChannelType.PHONE,
    value: '+86 13821385220', // Updated phone number
    label: '+86 13821385220',
    color: '#3DAB25'
  },
];