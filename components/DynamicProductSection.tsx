import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { fetchWooCommerce } from "../services/wooApi";
import { adaptWooProductToUI } from "../utils/adapters";
import ProductSection from "./ProductSection";

interface DynamicProductSectionProps  {
  type: string;
  title: string;
  id?: number | null;
  onPressProduct: (product: any) => void;
  onPressCategory: (archiveParam: any) => void;
}

export default function DynamicProductSection({ 
  type, 
  title, 
  id, 
  onPressProduct,
  onPressCategory
}: DynamicProductSectionProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Endpoint helper
  const buildEndpoint = (type: string, id: number | null | undefined): string => {
    const cacheBuster = `cb=${Date.now()}`;
    switch (type) {
      case "product-category": 
        return `products?category=${id}&per_page=10&stock_status=instock`; // Appended instock filter
      case "product-tag":      
        return `products?tag=${id}&per_page=10&stock_status=instock`;      // Appended instock filter
      case "on_sale":  
        return `products?on_sale=true&per_page=12&random=true&stock_status=instock&${cacheBuster}`;
      case "featured": 
        return `products?featured=true&per_page=12&random=true&stock_status=instock&${cacheBuster}`;
      default:         
        return `products?per_page=10&stock_status=instock`;
    }
  };

  useEffect(() => {
    if ((type === "product-category" || type === "product-tag") && !id) {
      setLoading(false);
      return;
    }

    const endpoint = buildEndpoint(type, id);
    
    fetchWooCommerce(endpoint)
      .then((raw) => {
        setProducts(raw.map(adaptWooProductToUI));
      })
      .catch((err) => {
        console.error(`[${title}] fetch error:`, err);
      })
      .finally(() => setLoading(false));
  }, [type, id]);

  if (loading) return <View style={{ height: 180 }}><ActivityIndicator /></View>;
  if (!products.length) return null; 

  let resolvedArchiveType: 'category' | 'tag' | 'on_sale' = 'category';

  if (type === 'product-tag') {
    resolvedArchiveType = 'tag';
  } else if (type === 'on_sale') {
    resolvedArchiveType = 'on_sale';
  }

  return (
    <ProductSection 
      title={title} 
      products={products} 
      showViewMore={true}
      onPressProduct={onPressProduct}
      onViewMore={() => {
        onPressCategory({
          type: resolvedArchiveType,
          id: id || 0,
          name: title,
        });
      }}
    />
  );
}

function buildEndpoint(type: string, id: number | null | undefined): string {
  const cacheBuster = `cb=${Date.now()}`;
  
  switch (type) {
    case "product-category": 
      return `products?category=${id}&per_page=10`;
    case "product-tag":      
      return `products?tag=${id}&per_page=10`;
    case "on_sale":  
      return `products?on_sale=true&per_page=12&random=true`;
    case "featured": 
      return `products?featured=true&per_page=12&random=true`;
    default:         
      return `products?per_page=10`;
  }
}