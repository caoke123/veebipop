import React from 'react';

export enum ChannelType {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms'
}

export interface ChannelConfig {
  id: string;
  type: ChannelType;
  value: string; // Phone number, email address, or username
  label: string; // Tooltip text
  message?: string; // Pre-filled message for WhatsApp/Email
  customIcon?: React.ReactNode; // Optional custom icon override
  color?: string; // Override default brand color
}

export interface WidgetPosition {
  side: 'left' | 'right';
  bottom: number; // pixels
  sideSpacing: number; // pixels
}