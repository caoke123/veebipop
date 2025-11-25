'use client'

import React from 'react'
import CategoryProducts from './CategoryProducts'

const InCarAccessories: React.FC<{ initialData?: any[] }> = ({ initialData }) => {
    return (
        <CategoryProducts
            title="In-Car Accessories"
            categorySlug="in-car-accessories"
            parentCategorySlug="in-car-accessories"
            tag="home"
            bannerImage="https://assets.veebipop.com/images/seatbelt1-optimized.webp"
            bannerTitle="In-Car Accessories Collection"
            bannerLink="/shop"
            defaultTab="Top"
            limit={3}
            initialData={initialData}
            gridCols={{ lg: 'lg:grid-cols-4', md: 'grid-cols-2', default: 'grid-cols-2' }}
            disableAnimations
            disableBlur
        />
    );
};

export default InCarAccessories;