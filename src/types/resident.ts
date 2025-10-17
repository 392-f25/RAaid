export type Channel = 'email' | 'sms' | 'groupme';

export interface Resident {
  id: string;
  name: string;
  room: string;
  preferredChannel: Channel;
  email: string | null;
  phone: string | null;
}

export interface SendResult {
  channel: Channel;
  success: boolean;
  recipientCount: number;
}

export interface ChannelOption {
  value: Channel;
  label: string;
  icon: string;
}
