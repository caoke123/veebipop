import React, { useEffect, useState } from 'react';
import { fetchProductById } from '@/utils/productService';

interface ProductDebugProps {
  productId: number;
}

// Function to get ACF fields from product object
const getAcfFields = (product: any) => {
  // If the product has already been converted by wcToProductType, ACF fields are in product.acf
  if (product.acf) {
    return product.acf;
  }
  
  // Otherwise, extract ACF fields from meta_data (for raw WooCommerce data)
  if (!product.meta_data || !Array.isArray(product.meta_data)) {
    return {};
  }
  
  const acfFields: any = {};
  product.meta_data.forEach((item: any) => {
    if (item.key === 'groser_product_meta' && item.value) {
      // groser_product_meta contains the ACF fields
      Object.assign(acfFields, item.value);
    }
  });
  
  return acfFields;
};

const ProductDebug: React.FC<ProductDebugProps> = ({ productId }) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(productId);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>No product found</div>;

  // Get ACF fields from product object
  const acfFields = getAcfFields(product);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Product Debug Information</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Basic Product Info</h3>
        <pre>{JSON.stringify({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
        }, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>ACF Fields</h3>
        <pre>{JSON.stringify(acfFields, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Markdown Content</h3>
        <p>Content exists: {!!acfFields.product_markdown_description}</p>
        <p>Content length: {acfFields.product_markdown_description?.length || 0}</p>
        <div style={{ 
          border: '1px solid #ccc', 
          padding: '10px', 
          maxHeight: '200px', 
          overflow: 'auto',
          whiteSpace: 'pre-wrap'
        }}>
          {acfFields.product_markdown_description || 'No markdown content'}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Image Gallery</h3>
        <p>Gallery exists: {!!acfFields.product_image_gallery}</p>
        <p>Gallery length: {acfFields.product_image_gallery?.length || 0}</p>
        <pre>{JSON.stringify(acfFields.product_image_gallery, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Full Product Object</h3>
        <details>
          <summary>Click to expand</summary>
          <pre>{JSON.stringify(product, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default ProductDebug;