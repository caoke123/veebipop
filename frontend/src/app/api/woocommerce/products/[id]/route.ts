import { getWcApi } from '@/utils/woocommerce'
import { json, error, notFound } from '@/utils/apiResponse'
import { wcToProductType } from '@/utils/wcAdapter'

async function getWordPressACFData(productId: string): Promise<any | null> {
  try {
    // Get WordPress REST API URL from WooCommerce URL
    const wcUrl = process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || process.env.WC_API_BASE || process.env.NEXT_PUBLIC_WC_API_BASE;
    if (!wcUrl) {
      console.log('No WooCommerce URL found for WordPress API base');
      return null;
    }
    
    // Extract base URL and construct WordPress REST API URL
    const baseUrl = new URL(wcUrl);
    const wpApiUrl = `${baseUrl.protocol}//${baseUrl.hostname}/wp-json/wp/v2/product/${productId}`;
    
    console.log('Fetching WordPress ACF data from:', wpApiUrl);
    
    const response = await fetch(wpApiUrl);
    if (!response.ok) {
      console.log('WordPress API response not OK:', response.status);
      return null;
    }
    
    const wpData = await response.json();
    console.log('WordPress API data keys:', Object.keys(wpData));
    
    // Check for ACF data
    if (wpData.acf) {
      console.log('WordPress ACF object keys:', Object.keys(wpData.acf));
      console.log('WordPress ACF data:', JSON.stringify(wpData.acf, null, 2));
    }
    
    // Return the WordPress product data which should contain ACF fields
    return wpData;
  } catch (err) {
    console.error('Error fetching WordPress ACF data:', err);
    return null;
  }
}

export async function GET(request: Request, context: { params: { id: string } }) {
  const id = context?.params?.id
  if (!id) return notFound('Product id is required')
  try {
    const wcApi = getWcApi()
    if (!wcApi) {
      return error(500, 'WooCommerce environment variables are not configured')
    }
    const { searchParams } = new URL(request.url)
    // Define comprehensive default fields to ensure all necessary product data is included
    const defaultFields = 'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,images.src,short_description,description,categories,attributes,tags,date_created,meta_data'
    
    // Use provided fields or default to all necessary fields
    const fieldsParam = searchParams.get('_fields')
    const finalFields = fieldsParam 
      ? `${fieldsParam},meta_data` // Always include meta_data when custom fields are provided
      : defaultFields // Use comprehensive default fields
    const res = await wcApi.get(`products/${encodeURIComponent(id)}`, { _fields: finalFields })
    
    // Log the raw WooCommerce data for debugging
    console.log('Raw WooCommerce product data:', JSON.stringify(res.data, null, 2))
    console.log('Meta data fields:', res.data.meta_data)
    console.log('Meta data length:', res.data.meta_data ? res.data.meta_data.length : 'undefined')
    
    // Also fetch WordPress ACF data
    const wpData = await getWordPressACFData(id);
    if (wpData) {
      console.log('WordPress ACF data keys:', Object.keys(wpData));
      if (wpData.acf) {
        console.log('WordPress ACF fields:', Object.keys(wpData.acf));
        console.log('WordPress product_markdown_description in ACF:', wpData.acf.product_markdown_description ? 
          `length: ${wpData.acf.product_markdown_description.length}` : 'not found in ACF');
      } else {
        console.log('No ACF object found in WordPress data');
      }
    }
    
    // Convert WooCommerce product to our ProductType format, but inject WordPress ACF data if available
    let convertedProduct = await wcToProductType(res.data)
    
    // If we have WordPress data with ACF, inject the ACF fields into the converted product
    if (wpData && wpData.acf && wpData.acf.product_markdown_description) {
      convertedProduct = {
        ...convertedProduct,
        acf: {
          ...convertedProduct.acf,
          product_markdown_description: wpData.acf.product_markdown_description
        }
      };
      console.log('Added WordPress ACF data to converted product');
    }
    
    // Log the converted product for debugging
    console.log('Final converted product data:', JSON.stringify(convertedProduct, null, 2))
    
    return json(convertedProduct)
  } catch (err: any) {
    const status = err?.response?.status ?? 500
    const details = err?.response?.data ?? { message: String(err?.message ?? 'Unknown error') }
    return error(status, 'Failed to load product', details)
  }
}