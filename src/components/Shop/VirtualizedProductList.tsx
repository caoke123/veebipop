'use client'

import React, { useEffect, useRef, useState } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import Product from '../Product/Product';
import { ProductType } from '@/type/ProductType';

interface VirtualizedProductListProps {
  products: ProductType[];
  type: string;
  style?: string;
  columnCount?: number;
  rowHeight?: number;
  gap?: number;
  disableBlur?: boolean;
  disablePrefetchDetail?: boolean;
  startIndex?: number;
}

const VirtualizedProductList: React.FC<VirtualizedProductListProps> = ({
  products,
  type,
  style = 'style-1',
  columnCount = 4,
  rowHeight = 500,
  gap = 20,
  disableBlur = false,
  disablePrefetchDetail = true,
  startIndex = 0
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 监听容器宽度变化
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    
    // 只有在浏览器环境中才添加事件监听器
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, []);

  // 计算内部单元宽度（去除间隙），以及网格列宽（包含间隙）
  const innerColumnWidth = Math.floor((containerWidth - gap * (columnCount - 1)) / columnCount);
  const columnWidth = innerColumnWidth + gap;

  // 计算行数
  const rowCount = Math.ceil(products.length / columnCount);

  // 渲染每个单元格
  const Cell = ({ columnIndex, rowIndex, style: cellStyle }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const productIndex = rowIndex * columnCount + columnIndex;
    const product = products[productIndex];

    if (!product) {
      return <div style={cellStyle} />;
    }

    // 在绝对定位容器内使用内部包裹元素，通过缩小宽高制造间隙效果
    return (
      <div style={cellStyle}>
        <div style={{ width: innerColumnWidth, height: rowHeight, boxSizing: 'border-box' }}>
          <Product
            data={product}
            type={type}
            style={style}
            disableBlur={disableBlur}
            disablePrefetchDetail={disablePrefetchDetail}
            priority={productIndex < startIndex}
          />
        </div>
      </div>
    );
  };

  // 如果容器宽度为0，返回空容器
  if (containerWidth === 0) {
    return <div ref={containerRef} className="w-full" />;
  }

  return (
    <div ref={containerRef} className="w-full">
      <Grid
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={rowCount * (rowHeight + gap)} // 自适应高度
        rowCount={rowCount}
        rowHeight={rowHeight + gap}
        width={containerWidth}
        style={{ overflow: 'hidden' }} // 隐藏滚动条
      >
        {Cell}
      </Grid>
    </div>
  );
};

export default VirtualizedProductList;
