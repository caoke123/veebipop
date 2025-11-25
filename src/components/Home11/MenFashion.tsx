'use client'

import React from 'react'
import CategoryProducts from './CategoryProducts'

interface MenFashionProps {
    start?: number;
    limit?: number;
    initialData?: any[];
}

const MenFashion: React.FC<MenFashionProps> = ({ start = 0, limit = 3, initialData }) => {
    return (
        <CategoryProducts
            title="Art Toys"
            categorySlug="art-toy"
            parentCategorySlug="art-toys"
            tag="home"
            bannerImage="https://assets.veebipop.com/images/art toy3-optimized.webp"
            bannerTitle="Art Toys Collection"
            bannerLink="/shop"
            defaultTab="Top"
            limit={limit}
            initialData={initialData}
            gridCols={{ lg: 'lg:grid-cols-4', md: 'grid-cols-2', default: 'grid-cols-2' }}
        />
    );
};

export default MenFashion;