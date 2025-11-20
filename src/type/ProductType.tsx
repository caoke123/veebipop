interface Variation {
    color: string;
    colorCode: string;
    colorImage: string;
    image: string;
}

// ACF fields interface for WordPress custom fields
export interface ProductACF {
    product_markdown_description?: string;
    product_image_gallery?: Array<{
        id?: number;
        url?: string;
        alt?: string;
        caption?: string;
    }>;
    [key: string]: any; // Allow for additional ACF fields
}

export interface ProductType {
    id: string,
    category: string,
    type: string,
    name: string,
    gender: string,
    new: boolean,
    sale: boolean,
    rate: number,
    price: number,
    originPrice: number,
    brand: string,
    sold: number,
    quantity: number,
    quantityPurchase: number,
    sizes: Array<string>,
    variation: Variation[],
    thumbImage: Array<string>,
    images: Array<string>,
    imageStatus?: 'mapped' | 'fallback' | 'empty',
    imageDiagnostics?: { srcCount?: number; metaCount?: number; defaultApplied?: string },
    selectedSize?: string,
    selectedColor?: string,
    description: string,
    action: string,
    slug: string,
    tags?: Array<{id: number, name: string, slug: string}>,
    categories?: Array<{id: number, name: string, slug: string}>,
    acf?: ProductACF,
    meta_data?: Array<{key?: string, value?: any}>,
    related_ids?: Array<number>
}