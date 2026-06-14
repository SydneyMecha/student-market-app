import { decodeHTMLEntities } from './stringUtils';

export const adaptWooProductToUI = (raw: any) => {
  const whatsappMeta = raw.meta_data?.find((m: any) => 
    m.key === '_ht_order_whatsapp_number' || 
    m.key === '_oneclick_whatsapp_number' ||
    m.key === '_whatsapp_phone' ||
    m.key.toLowerCase().includes('whatsapp_number') ||
    m.key.toLowerCase().includes('whatsapp_phone')
  );
  const productWhatsappNumber = whatsappMeta ? whatsappMeta.value : null;

  const storePhone = raw.store?.phone || raw.store?.vendor_profile?.settings?.store?.phone || null;

  return {
    id:            raw.id,
    name:          decodeHTMLEntities(raw.name),
    slug:          raw.slug || "",
    price:         raw.price || "0.00",
    regular_price: raw.regular_price || raw.price || "0.00",
    on_sale:       raw.on_sale === true,
    description:   raw.description || raw.short_description || "",
    related_ids:   raw.related_ids || [],
    
    cross_sell_ids: raw.cross_sell_ids || [],
    upsell_ids:     raw.upsell_ids || [],
    
    whatsapp_number:  raw.whatsapp_number_resolved || null,
    whatsapp_message: raw.whatsapp_message_resolved || null,

    store: raw.store ? { 
      id: raw.store.id, 
      name: decodeHTMLEntities(raw.store.vendor_shop_name || raw.store.name),
      address: raw.store.address?.street_1 || "",
      city: raw.store.address?.city || "",
      phone: storePhone || "", 
      banner: raw.store.banner || null,
      gravatar: raw.store.gravatar || null
    } : null, 

    categories:    raw.categories?.map((c: any) => ({ id: c.id, name: decodeHTMLEntities(c.name) })) || [],
    tags:          raw.tags?.map((t: any) => ({ id: t.id, name: decodeHTMLEntities(t.name) })) || [],
    categories_string: raw.categories?.map((c: any) => decodeHTMLEntities(c.name)).join(', ') || "",
    tags_string:       raw.tags?.map((t: any) => decodeHTMLEntities(t.name)).join(', ') || "",

    attributes:    raw.attributes?.map((attr: any) => ({
      name: decodeHTMLEntities(attr.name),
      options: attr.options?.map((opt: string) => decodeHTMLEntities(opt)) || []
    })) || [],

    images:        raw.images?.map((img: any) => ({
      id:  img.id,
      src: img.src,
      alt: img.alt || raw.name,
    })) || [],
  };
};