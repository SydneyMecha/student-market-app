const API_URL = process.env.EXPO_PUBLIC_WC_URL || 'https://studentmarket.co.ke';
const CK = process.env.EXPO_PUBLIC_WC_KEY || '';
const CS = process.env.EXPO_PUBLIC_WC_SECRET || '';

export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://studentmarket.co.ke';

// A secure token of your choice to authenticate your app with your server
const APP_SECRET_TOKEN = 'SM_App_Secure_Token_2026'; 

/**
 * Helper function to talk to the WooCommerce backend
 */
export const fetchWooCommerce = async (endpoint: string, options: RequestInit = {}) => {
  const method = options.method ? options.method.toUpperCase() : 'GET';
  const isWriteOperation = method === 'POST' || method === 'PUT' || method === 'DELETE';
  
  let url = '';
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  } as Record<string, string>;

  // 1. Route sensitive write operations to your secure, custom WordPress endpoints
  if (isWriteOperation && (endpoint.startsWith('orders') || endpoint.startsWith('customers'))) {
    url = `${BASE_URL}/wp-json/studentmarket/v1/${endpoint}`;
    
    // Attach our custom App Secret Token to verify this request comes from your mobile app
    headers['X-SM-App-Token'] = APP_SECRET_TOKEN;
  } else {
    // 2. Read-only operations can continue using the standard WooCommerce REST API keys
    const separator = endpoint.includes('?') ? '&' : '?';
    url = `${API_URL}/wp-json/wc/v3/${endpoint}${separator}consumer_key=${CK}&consumer_secret=${CS}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    const rawText = await response.text();
    
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
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