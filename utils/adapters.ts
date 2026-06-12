import { decodeHTMLEntities } from './stringUtils'; // Adjust path if needed

export const adaptWooProductToUI = (raw: any) => ({
  id:            raw.id,
  name:          decodeHTMLEntities(raw.name), // Decodes the product name automatically
  price:         raw.price || "0.00",
  regular_price: raw.regular_price || raw.price || "0.00",
  on_sale:       raw.on_sale === true,
  categories:    raw.categories?.map((c: any) => decodeHTMLEntities(c.name)) || [], // Decodes categories
  tags:          raw.tags?.map((t: any) => decodeHTMLEntities(t.name)) || [],
  images:        raw.images?.map((img: any) => ({
    id:  img.id,
    src: img.src,
    alt: img.alt || raw.name,
  })) || [],
});