'use client'

import React from 'react'
import CategoryProducts from './CategoryProducts'

interface WomenFashionProps {
    start?: number;
    limit?: number;
    initialData?: any[];
}

const WomenFashion: React.FC<WomenFashionProps> = ({ start = 0, limit = 3, initialData }) => {
    return (
        <CategoryProducts
            title="Charms"
            categorySlug="charms"
            parentCategorySlug="charms"
            tag="home"
            bannerImage="https://assets.veebipop.com/images/banner-charm-optimized.webp"
            bannerTitle="Fashion For Women"
            bannerLink="/shop"
            defaultTab="Top"
            tabs={["Top"]}
            limit={limit}
            initialData={initialData}
            gridCols={{ lg: 'lg:grid-cols-4', md: 'grid-cols-2', default: 'grid-cols-2' }}
            disableAnimations
            disableBlur
        />
    );
};

export default WomenFashion;