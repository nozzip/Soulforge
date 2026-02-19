export interface SubItem {
  id: string;
  name: string;
  image?: string;
  description?: string;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  faction?: string;
  title?: string;
  frame_id?: string;
  xp: number;
  level: number;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
}

export interface ForumThread {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile; // Joined data
  likes_count?: number;
  replies_count?: number;
  is_edited?: boolean;
}

export interface ForumPost {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  is_pinned?: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile; // Joined data
  likes_count?: number;
  is_edited?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  size?: string;
  scale?: string;
  badge?: string;
  description?: string;
  subItems?: SubItem[];
  // New fields from CSV/Supabase
  designer?: string;
  set_name?: string;
  creature_type?: string;
  weapon?: string;
  title?: string;
  grade?: string;
  image_url?: string;
  gallery_images?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export enum ViewState {
  HOME = "HOME",
  CATALOG = "CATALOG",
  CART = "CART",
  CHECKOUT = "CHECKOUT",
  PRODUCT_DETAIL = "PRODUCT_DETAIL",
  LOGIN = "LOGIN",
  SIGNUP = "SIGNUP",
  WISHLIST = "WISHLIST",
  ADMIN = "ADMIN",
  ORDERS = "ORDERS",
  FEEDBACK = "FEEDBACK",
  HOW_TO_BUY = "HOW_TO_BUY",
  NEW_ADVENTURER = "NEW_ADVENTURER",
  FORUM_HOME = "FORUM_HOME",
  FORUM_CATEGORY = "FORUM_CATEGORY",
  FORUM_CREATE_THREAD = "FORUM_CREATE_THREAD",
  FORUM_THREAD = "FORUM_THREAD",
  FORUM_LFG = "FORUM_LFG",
  PROFILE = "PROFILE",
  EDITOR_TEST = "EDITOR_TEST",
}

export interface LFGPost {
  id: string;
  created_at: string;
  gm_id: string;
  game_name: string;
  system: string;
  modality: string;
  date: string;
  time: string;
  synopsis?: string;
  tags?: string[];
  slots_total: number;
  slots_taken: number;
  platform?: string;
  image_url?: string;
  gm_profile?: Profile; // Joined from profiles
}

export interface LFGApplication {
  id: string;
  created_at: string;
  post_id: string;
  applicant_id: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  message?: string;
  applicant_profile?: Profile; // Joined from profiles
  post?: LFGPost;
}

export interface LFGChatMessage {
  id: string;
  created_at: string;
  application_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  sender_profile?: Profile; // Joined from profiles
}

export interface GuideStep {
  title: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  tip?: string;
}

export interface Guild {
  id: string;
  name: string;
  description?: string;
  leader_id: string;
  image_url?: string;
  created_at: string;
  leader?: Profile;
  members_count?: number; // Aggregated
}

export interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  role: "leader" | "officer" | "member";
  status: "pending" | "accepted" | "rejected";
  joined_at: string;
  profile?: Profile; // Joined
  guild?: Guild; // Joined
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  quantity: number;
  price_gp: number;
  image?: string;
  total_price?: number;
}

export interface Order {
  id: string;
  created_at: string;
  user_id?: string;
  status: string;
  total_gp: number;
  shipping_address: string;
  contact_email: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_dni?: string;
  contract_number?: string;
  admin_notes?: string;
  order_items: OrderItem[];
  phone?: string;
}
