'use client'

import React from 'react'
import CategoryProducts from './CategoryProducts'

const TechProducts: React.FC = () => {
    return (
        <CategoryProducts
            title="Tech Gadgets"
            categorySlug="electronics"
            tag="featured"
            bannerImage="/images/banner/tech.png"
            bannerTitle="Latest Tech Gadgets"
            bannerLink="/shop?category=electronics"
            defaultTab="smartphones"
            tabs={['smartphones', 'laptops', 'headphones', 'accessories']}
            limit={3}
            gridCols={{ lg: 'lg:grid-cols-4', md: 'grid-cols-2', default: 'grid-cols-2' }}
        />
    );
};

export default TechProducts;