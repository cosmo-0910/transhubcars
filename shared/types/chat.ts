// Shared types for the messaging system (used by web client & chat service)

export interface ConversationParticipant {
  id: string;
  full_name?: string;
  avatar_url?: string;
  business_name?: string;
}

export interface ConversationCar {
  id: string;
  make: string;
  model: string;
  year: number;
  image_url?: string;
}

export interface Conversation {
  id: string;
  car_id?: string;
  buyer_id: string;
  vendor_id?: string;
  last_message?: string;
  updated_at: string;
  // Joined relations
  buyer?: ConversationParticipant;
  vendor?: ConversationParticipant;
  car?: ConversationCar;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text?: string;
  image_url?: string;
  is_read: boolean;
  created_at: string;
}
