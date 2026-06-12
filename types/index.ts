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

// export const PRODUCTS: WooProduct[] = [
//   {
//     id: 1, name: "Linen Blazer", price: "89.99", category: "Latest", images: [{ id: 10, src: "https://picsum.photos/seed/prod1/200/200", alt: "Linen Blazer" }],
//   },
//   {
//     id: 2, name: "Silk Scarf", price: "34.99", category: "Offers",images: [{ id: 11, src: "https://picsum.photos/seed/prod2/200/200", alt: "Silk Scarf" }],
//   },
//   {
//     id: 3, name: "Canvas Tote", price: "24.99", category: "Latest", images: [{ id: 12, src: "https://picsum.photos/seed/prod3/200/200", alt: "Canvas Tote" }],
//   },
//   {
//     id: 4, name: "Knit Sweater", price: "59.99", category: "Featured", images: [{ id: 13, src: "https://picsum.photos/seed/prod4/200/200", alt: "Knit Sweater" }],
//   },
//   {
//     id: 5, name: "Denim Jacket", price: "119.99", category: "Offers",images: [{ id: 14, src: "https://picsum.photos/seed/prod5/200/200", alt: "Denim Jacket" }],
//   },
//   {
//     id: 6, name: "Floral Dress", price: "74.99", category: "Latest", images: [{ id: 15, src: "https://picsum.photos/seed/prod6/200/200", alt: "Floral Dress" }],
//   },
//   {
//     id: 7, name: "Wool Coat", price: "149.99", category: "Latest", images: [{ id: 16, src: "https://picsum.photos/seed/prod7/200/200", alt: "Wool Coat" }],
//   },
//   {
//     id: 8, name: "Leather Belt", price: "29.99", category: "Latest", images: [{ id: 17, src: "https://picsum.photos/seed/prod8/200/200", alt: "Leather Belt" }],
//   },
//   {
//     id: 9, name: "Satin Blouse", price: "44.99", category: "Featured", images: [{ id: 18, src: "https://picsum.photos/seed/prod9/200/200", alt: "Satin Blouse" }],
//   },
// ];