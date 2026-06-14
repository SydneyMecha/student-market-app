export interface WooImage {
  id: number;
  src: string;
  alt: string;
}

export interface WooProduct {
  id: number;
  name: string;
  price: string;
  category: string;
  images: WooImage[];
}