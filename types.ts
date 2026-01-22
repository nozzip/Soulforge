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
  scale: string;
  price: number;
  image: string;
  badge?: string;
  description?: string;
  subItems?: SubItem[];
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
  ORDERS = 'ORDERS'
}