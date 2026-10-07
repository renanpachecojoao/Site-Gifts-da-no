/**
 * Tipos TypeScript que espelham os modelos do backend (backend/models/shop.py).
 * Ao mudar um modelo no Python, atualize o tipo correspondente aqui.
 */
// Espelhos escritos à mão de backend/models/shop.py — mantenha sincronizado.

export interface Category {
  slug: string;
  name: string;
  tag: string;
  image: string;
  order: number;
}

export interface OptionGroup {
  name: string;
  values: string[];
}

export interface Personalization {
  options: OptionGroup[];
  allow_name: boolean;
  allow_message: boolean;
  allow_upload: boolean;
  name_max: number;
  message_max: number;
}

export type Badge = "Mais vendido" | "Novo" | "Oferta";

export interface Product {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  price: number;
  promo_price: number | null;
  categories: string[];
  images: string[];
  stock: number;
  sku: string;
  badge: Badge | null;
  rating: number;
  reviews_count: number;
  personalization: Personalization;
  materials: string;
  dimensions: string;
  care: string;
  production_time: string;
  sold: number;
  created_at: string;
}

export interface ReviewCreate {
  author: string;
  rating: number;
  comment: string;
}

export interface Review extends ReviewCreate {
  id: string;
  product_id: string;
  verified: boolean;
  created_at: string;
}

export interface CartLine {
  product_id: string;
  quantity: number;
}

export interface QuoteRequest {
  items: CartLine[];
  coupon?: string | null;
  cep?: string | null;
  shipping_method?: string | null;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: string;
}

export interface Quote {
  subtotal: number;
  discount: number;
  coupon: string | null;
  coupon_valid: boolean;
  coupon_message: string;
  shipping_options: ShippingOption[];
  shipping: number;
  shipping_method: string | null;
  total: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

export interface OrderLineIn extends CartLine {
  options: Record<string, string>;
  personalization_name: string;
  personalization_message: string;
  upload_url: string;
}

export type PaymentMethod = "pix" | "credit" | "debit";

export interface OrderCreate {
  customer: Customer;
  address: Address;
  items: OrderLineIn[];
  coupon: string | null;
  shipping_method: string;
  payment_method: PaymentMethod;
  installments: number;
}

export interface OrderLine extends OrderLineIn {
  name: string;
  image: string;
  unit_price: number;
}

export interface Order {
  id: string;
  number: string;
  user_id: string | null;
  customer: Customer;
  address: Address;
  items: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon: string | null;
  shipping_method: string;
  payment_method: string;
  installments: number;
  status: string;
  pix_code: string | null;
  created_at: string;
}

export interface Message {
  message: string;
}

export interface UploadOut {
  id: string;
  url: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
}
