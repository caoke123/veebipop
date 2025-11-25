import { ProductType, ProductACF } from '@/type/ProductType'
import { getWcApiWithRetry } from './woocommerce'

// WcImage can be either a string (URL) or an object with src property
type WcImage = string | { src?: string; id?: number; alt?: string; name?: string };
type WcCategory = { id?: number; name?: string; slug?: string };
type WcAttribute = { name?: string; options?: string[] };
type WcTag = { id?: number; name?: string; slug?: string };
type WcMeta = { key?: string; value?: any };

export type WcProduct = {
  id?: number;
  name?: string;
  slug?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  average_rating?: string;
  stock_quantity?: number | null;
  manage_stock?: boolean;
  images?: WcImage[];
  short_description?: string;
  description?: string;
  categories?: WcCategory[];
  attributes?: WcAttribute[];
  tags?: WcTag[];
  date_created?: string;
  meta_data?: WcMeta[];
  related_ids?: number[];
};

const toNumber = (val: string | number | undefined | null): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string' && val.trim() !== '') return Number(val);
  return 0;
};

const stripHtml = (input?: string): string => {
  if (!input) return '';
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&/g, '&')
    .trim();
};

// Function to decode HTML entities
const decodeHtmlEntities = (input?: string): string => {
  if (!input) return '';
  
  // Create a temporary DOM element to decode HTML entities
  if (typeof window !== 'undefined') {
    const txt = document.createElement('textarea');
    txt.innerHTML = input;
    return txt.value;
  }
  
  // Fallback for server-side rendering
  return input
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&/g, '&');
};

// Function to replace old image domains with new one
const replaceImageDomain = (url: string): string => {
  if (typeof url !== 'string') return url;
  return url
    .replace(/https?:\/\/image\.nv315\.top/g, 'https://assets.veebipop.com')
    .replace(/https?:\/\/image\.selmi\.cc/g, 'https://assets.veebipop.com');
};

const isNew = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const created = new Date(dateStr).getTime();
  if (isNaN(created)) return false;
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - created < THIRTY_DAYS;
};

// Function to extract product type from product name or attributes
const extractProductType = (p: WcProduct): string => {
  const name = (p.name ?? '').toLowerCase();
  
  // Check if there's a product type attribute
  const typeAttr = (p.attributes ?? []).find(a => 
    (a.name ?? '').toLowerCase() === 'product type' || 
    (a.name ?? '').toLowerCase() === 'type'
  );
  
  if (typeAttr && typeAttr.options && typeAttr.options.length > 0) {
    return typeAttr.options[0].toLowerCase();
  }
  
  // Extract type from name based on common patterns
  if (name.includes('t-shirt') || name.includes('tee')) return 't-shirt';
  if (name.includes('dress')) return 'dress';
  if (name.includes('jacket') || name.includes('coat')) return 'jacket';
  if (name.includes('pants') || name.includes('trousers')) return 'pants';
  if (name.includes('shoes') || name.includes('sneakers')) return 'shoes';
  if (name.includes('bag')) return 'bag';
  if (name.includes('hat') || name.includes('cap')) return 'hat';
  if (name.includes('toy') || name.includes('figure')) return 'toy';
  if (name.includes('art toy')) return 'art-toy';
  
  // Default to category if no specific type found
  const categories = p.categories ?? [];
  const firstCategory = categories[0];
  return (firstCategory?.slug ?? firstCategory?.name ?? 'general').toLowerCase();
};


const defaultImageByCategory: Record<string, string> = {
  'art-toys': 'https://pixypic.net/wp-content/uploads/2023/09/shop-9.png',
  'bag': 'https://pixypic.net/wp-content/uploads/2023/09/shop-3.png',
  'in-car-accessories': 'https://pixypic.net/wp-content/uploads/2023/09/shop-2.png',
  'home': 'https://pixypic.net/wp-content/uploads/2023/09/shop-10.png',
  'general': 'https://pixypic.net/wp-content/uploads/2023/09/shop-14.png',
}

const getDefaultImageForCategory = (categorySlug?: string): string | undefined => {
  const key = String(categorySlug || 'general').toLowerCase()
  return defaultImageByCategory[key] || defaultImageByCategory['general']
}

// Function to extract ACF fields from WooCommerce meta_data
const extractACFFields = (p: WcProduct): ProductACF | undefined => {
  const metas = p.meta_data ?? [];
  if (!metas.length) return undefined;
  
  const acf: ProductACF = {};
  
  // Extract common ACF fields
  for (const meta of metas) {
    if (!meta || typeof meta.key !== 'string') continue;
    
    // Handle groser_product_meta which contains the actual ACF fields
    if (meta.key === 'groser_product_meta' && meta.value && typeof meta.value === 'object') {
      // Extract all fields from groser_product_meta
      Object.assign(acf, meta.value);
    }
    
    // Handle product_markdown_content
    if (meta.key === 'product_markdown_content') {
      acf.product_markdown_content = typeof meta.value === 'string' ? replaceImageDomain(meta.value) : undefined;
    }
    
    // Handle product_markdown_description
    if (meta.key === 'product_markdown_description') {
      acf.product_markdown_description = typeof meta.value === 'string' ? replaceImageDomain(meta.value) : undefined;
    }
    
    // Handle product_image_gallery (ACF gallery field)
    if (meta.key === 'product_image_gallery' && Array.isArray(meta.value)) {
      acf.product_image_gallery = meta.value.map((item: any) => {
        if (typeof item === 'object' && item !== null) {
          // Handle case where subfields are named image_url and image_alt
          if (item.image_url !== undefined) {
            return {
              id: item.id,
              url: replaceImageDomain(item.image_url),
              alt: item.image_alt || '',
              caption: item.caption || ''
            };
          }
          // Handle case where subfields are named url and alt
          else if (item.url !== undefined) {
            return {
              id: item.id,
              url: replaceImageDomain(item.url),
              alt: item.alt || '',
              caption: item.caption || ''
            };
          }
        }
        // Handle case where gallery is just an array of URLs
        if (typeof item === 'string') {
          return {
            url: replaceImageDomain(item),
            alt: '',
            caption: ''
          };
        }
        return null;
      }).filter(Boolean) as ProductACF['product_image_gallery'];
    }
    
    // Handle other potential ACF fields
    if (meta.key.startsWith('_') || meta.key.startsWith('acf_') || !meta.key.includes('_')) {
      acf[meta.key] = meta.value;
    }
  }
  
  // Return undefined if no ACF fields were found
  return Object.keys(acf).length > 0 ? acf : undefined;
};

export async function wcToProductType(p: WcProduct): Promise<ProductType> {
  // Handle images array - now contains full image objects instead of just URLs
  const imagesRaw = (p.images ?? []).map(img => {
    // If image is a string (URL), use it directly
    if (typeof img === 'string') return img;
    // If image is an object with src property, use src
    if (typeof img === 'object' && img !== null && img.src) return img.src;
    // Otherwise return empty string
    return '';
  }).filter(Boolean);
  
  // Fixed regex pattern for URL validation
  const imagesFiltered = imagesRaw.filter((u) => u.startsWith('http'))
  let images = Array.from(new Set(imagesFiltered))
  let imageStatus: 'mapped' | 'fallback' | 'empty' = 'mapped'
  let diagnostics: { srcCount?: number; metaCount?: number } = { srcCount: imagesRaw.length }
  if (images.length === 0) {
    const metaImgs = extractMetaImages(p)
    diagnostics.metaCount = metaImgs.length
    if (metaImgs.length > 0) {
      images = metaImgs
      imageStatus = 'fallback'
    } else {
      // Category default image fallback
      const categories = p.categories ?? []
      const firstCategory = categories[0]
      const defImg = getDefaultImageForCategory(firstCategory?.slug ?? firstCategory?.name ?? 'general')
      if (defImg) {
        images = [defImg]
        imageStatus = 'fallback'
        ;(diagnostics as any).defaultApplied = String(firstCategory?.slug ?? firstCategory?.name ?? 'general')
      } else {
        imageStatus = 'empty'
      }
    }
  }
  let categories = p.categories ?? [];
  const firstCategory = categories[0];

  const sizeAttr = (p.attributes ?? []).find(a => (a.name ?? '').toLowerCase() === 'size');
  const sizes = sizeAttr?.options ?? [];

  const price = toNumber(p.price ?? p.sale_price ?? p.regular_price);
  const originPrice = toNumber(p.regular_price ?? p.price);
  const sale = toNumber(p.sale_price) > 0 && originPrice > price;

  const quantity = typeof p.stock_quantity === 'number' && p.stock_quantity >= 0 ? p.stock_quantity : 100;

  // Skip enriching categories to avoid extra SSR round-trips

  // Extract category and type separately
  const category = (firstCategory?.slug ?? firstCategory?.name ?? 'general').toLowerCase();
  const type = extractProductType(p);
  
  // Extract ACF fields
  const acf = extractACFFields(p);

  return {
    id: String(p.id ?? ''),
    category,
    type,
    name: p.name ?? 'Unnamed Product',
    gender: 'unisex',
    new: isNew(p.date_created),
    sale,
    rate: toNumber(p.average_rating),
    price,
    originPrice: originPrice || price,
    brand: 'woocommerce',
    sold: 0,
    quantity,
    quantityPurchase: 1,
    sizes,
    variation: [],
    thumbImage: images.length ? [images[0]] : [],
    images,
    imageStatus,
    imageDiagnostics: diagnostics,
    // Preserve original HTML to allow rich text rendering on the page
    // Use full description instead of short description
    // Decode HTML entities to fix rendering issues and replace image domains
    description: replaceImageDomain(decodeHtmlEntities(p.description ?? p.short_description ?? '')),
    action: 'quick shop',
    slug: p.slug ?? String(p.id ?? ''),
    // Include tags if available
    tags: p.tags ? p.tags.map((tag: WcTag) => ({
      id: tag.id || 0,
      name: tag.name || '',
      slug: tag.slug || ''
    })) : undefined,
    // Include categories for filtering
    categories: categories.map((cat: WcCategory) => ({
      id: cat.id || 0,
      name: cat.name || '',
      slug: cat.slug || ''
    })),
    // Include ACF fields
    acf,
    // Preserve original meta_data
    meta_data: p.meta_data,
    // Include related_ids if available
    related_ids: p.related_ids || []
  };
};

export async function wcArrayToProductTypes(products: WcProduct[]): Promise<ProductType[]> {
  if (!products || products.length === 0) return [];
  
  // Process all products in parallel to improve performance
  const productPromises = products.map(p => wcToProductType(p));
  return Promise.all(productPromises);
}

const extractMetaImages = (p: WcProduct): string[] => {
  const metas = p.meta_data ?? []
  const urls: string[] = []
  for (const m of metas) {
    if (!m || typeof m.key !== 'string') continue
    if (m.key === 'groser_product_meta') {
      const v = m.value || {}
      const featured = v?.prod_featured_img || {}
      const deal = v?.prod_deal_img || {}
      const maybeUrls = [featured?.url, featured?.thumbnail, deal?.url, deal?.thumbnail]
      for (const u of maybeUrls) {
        if (typeof u === 'string' && u) urls.push(replaceImageDomain(u))
      }
      const gallery = v?.['product-gallery']
      if (typeof gallery === 'string' && gallery.trim()) {
        const parts = gallery.split(/[,\s]+/).filter(Boolean)
        urls.push(...parts.map(replaceImageDomain))
      }
    }
  }
  // Fixed regex pattern for URL validation
  return Array.from(new Set(urls.filter((u: string) => u.startsWith('http'))))
}