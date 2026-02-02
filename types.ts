export interface SubItem {
  id: string;
  name: string;
  image?: string;
  description?: string;
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
}

export interface CartItem extends Product {
  quantity: number;
}

export enum ViewState {
  HOME = 'HOME',
  CATALOG = 'CATALOG',
  CART = 'CART',
  CHECKOUT = 'CHECKOUT',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  WISHLIST = 'WISHLIST',
  ADMIN = 'ADMIN',
  ORDERS = 'ORDERS',
  FEEDBACK = 'FEEDBACK',
  HOW_TO_BUY = 'HOW_TO_BUY'
}