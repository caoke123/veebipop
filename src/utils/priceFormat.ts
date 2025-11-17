/**
 * 格式化价格显示
 * @param price 价格数值
 * @returns 格式化后的价格字符串
 */
export function formatPrice(price: number | string): string {
  // 转换为数字
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // 检查是否为整数
  if (Number.isInteger(numPrice)) {
    return `$${numPrice}`;
  } else {
    // 保留两位小数
    return `$${numPrice.toFixed(2)}`;
  }
}

/**
 * 格式化价格显示（不带货币符号）
 * @param price 价格数值
 * @returns 格式化后的价格字符串
 */
export function formatPriceWithoutSymbol(price: number | string): string {
  // 转换为数字
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // 检查是否为整数
  if (Number.isInteger(numPrice)) {
    return `${numPrice}`;
  } else {
    // 保留两位小数
    return `${numPrice.toFixed(2)}`;
  }
}