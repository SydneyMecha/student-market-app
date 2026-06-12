import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { fetchWooCommerce } from "../services/wooApi";
import { adaptWooProductToUI } from "../utils/adapters";
import ProductSection from "./ProductSection";

interface DynamicProductSectionProps  {
  type: string;
  title: string;
  id?: number | null;
}

export default function DynamicProductSection({ type, title, id }: DynamicProductSectionProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety check: if the section requires an ID but it is missing, don't query
    if ((type === "product-category" || type === "product-tag") && !id) {
      setLoading(false);
      return;
    }

    const endpoint = buildEndpoint(type, id);
    console.log(`[${title}] fetching:`, endpoint);
    
    fetchWooCommerce(endpoint)
      .then((raw) => {
        console.log(`[${title}] got ${raw.length} products`);
        setProducts(raw.map(adaptWooProductToUI));
      })
      .catch((err) => {
        console.error(`[${title}] fetch error:`, err);
      })
      .finally(() => setLoading(false));
  }, [type, id]);

  if (loading) return <View style={{ height: 180 }}><ActivityIndicator /></View>;
  if (!products.length) return null; // hides sections with 0 products safely

  return <ProductSection title={title} products={products} />;
}

function buildEndpoint(type: string, id: number | null | undefined): string {
  const cacheBuster = `cb=${Date.now()}`;
  
  switch (type) {
    case "product-category": 
      return `products?category=${id}&per_page=10`;
    case "product-tag":      
      return `products?tag=${id}&per_page=10`;
    case "on_sale":  
      // return `products?on_sale=true&per_page=10`;
      return `products?on_sale=true&per_page=12&random=true`;
    case "featured": 
      // return `products?featured=true&per_page=10`;
      return `products?featured=true&per_page=12&random=true`;
    default:         
      return `products?per_page=10`;
  }
}