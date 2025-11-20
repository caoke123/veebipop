import 'server-only'
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api'
import * as https from 'https'
import * as http from 'http'
import axios from 'axios'

function firstEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const v = process.env[name]
    if (v) return v
    const pv = process.env[`NEXT_PUBLIC_${name}`]
    if (pv) return pv
  }
  return undefined
}

export async function getWcApiWithRetry(): Promise<WooCommerceRestApi | null> {
  const wcApi = getWcApi();
  if (!wcApi) return null;
  
  // Add retry wrapper around the API methods
  const originalGet = wcApi.get.bind(wcApi);
  wcApi.get = async (endpoint: string, params?: any) => {
    let retries = 5; // Increased from 3 to 5 retries
    let lastError: any;
    
    while (retries > 0) {
      try {
        console.log(`API request attempt ${6 - retries}/5 to ${endpoint}`);
        return await originalGet(endpoint, params);
      } catch (error: any) {
        lastError = error;
        retries--;
        
        if (retries > 0) {
          const delay = Math.pow(2, 5 - retries) * 1000; // Exponential backoff: 2s, 4s, 8s, 16s, 32s
          console.log(`API request failed, retrying in ${delay}ms... (${5 - retries}/5 retries)`);
          console.log(`Error details: ${error.message || error}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  };
  
  return wcApi;
}

export function getWcApi(): WooCommerceRestApi | null {
  const url = firstEnv('WOOCOMMERCE_URL', 'WC_API_BASE')
  const consumerKey = firstEnv('WOOCOMMERCE_CONSUMER_KEY', 'WC_CONSUMER_KEY')
  const consumerSecret = firstEnv('WOOCOMMERCE_CONSUMER_SECRET', 'WC_CONSUMER_SECRET')

  // 检查是否为示例/无效配置
  const isDemoConfig = url?.includes('example.com') ||
                      url?.includes('demo.woocommerce.com') ||
                      consumerKey?.includes('example') ||
                      consumerKey?.includes('demo') ||
                      consumerSecret?.includes('example') ||
                      consumerSecret?.includes('demo')

  if (!url || !consumerKey || !consumerSecret || isDemoConfig) {
    console.log('WooCommerce API not configured or using demo config, returning null')
    return null
  }

  const httpsAgent = new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false, // Disable SSL certificate validation for development
    secureOptions: require('crypto').constants.SSL_OP_LEGACY_SERVER_CONNECT, // Support legacy servers
  })
  const httpAgent = new http.Agent({
    keepAlive: true,
  })

  return new WooCommerceRestApi({
    url,
    consumerKey,
    consumerSecret,
    version: 'wc/v3',
    axiosConfig: {
      timeout: 30000, // Increased to 30 seconds for slow connections
      // Agents for connection reuse
      httpsAgent,
      httpAgent,
      // Add retry configuration
      maxRedirects: 3,
      // Add retry delay with exponential backoff
      retryDelay: (retryCount: number) => Math.pow(2, retryCount) * 1000,
      // Add request validation
      validateStatus: (status: number) => status >= 200 && status < 300,
    },
  })
}