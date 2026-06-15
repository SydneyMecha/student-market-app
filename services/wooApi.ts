const API_URL = process.env.EXPO_PUBLIC_WC_URL;
const CK = process.env.EXPO_PUBLIC_WC_KEY;
const CS = process.env.EXPO_PUBLIC_WC_SECRET;

/**
 * Helper function to talk to the WooCommerce backend
 * @param endpoint The WooCommerce route (e.g., 'products' or 'customers')
 * @param options Standard fetch options (method, body, headers)
 */

export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://studentmarket.co.ke';

export const fetchWooCommerce = async (endpoint: string, options: RequestInit = {}) => {
  // Check if the endpoint string already contains a question mark
  const separator = endpoint.includes('?') ? '&' : '?';
  
  // Use the dynamic separator before attaching the keys
  const url = `${API_URL}/wp-json/wc/v3/${endpoint}${separator}consumer_key=${CK}&consumer_secret=${CS}`;
  
  try {
    const response = await fetch(url, options);
    const rawText = await response.text();
    
    // Try to parse it as JSON safely
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      // If parsing fails, the server sent back HTML. Log the entire HTML payload!
      console.error(`[WooCommerce API HTML CRASH - ${endpoint}]:`, rawText);
      throw new Error("Server returned HTML error. Check your Expo terminal logs.");
    }
    
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch data from Student Market");
    }
    
    return data;
  } catch (error) {
    console.error(`[WooCommerce API Error - ${endpoint}]:`, error);
    throw error;
  }
};