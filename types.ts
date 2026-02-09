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
}

export interface ForumPost {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile; // Joined data
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  size?: string;
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
  PROFILE = "PROFILE",
}
