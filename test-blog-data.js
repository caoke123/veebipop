// 简单的博客数据测试
const testPosts = [
  {
    id: "1",
    title: "Fashion Trends 2024: What's Hot This Season",
    slug: "fashion-trends-2024-whats-hot-this-season"
  },
  {
    id: "2", 
    title: "Organic Skincare: Benefits and Best Products",
    slug: "organic-skincare-benefits-and-best-products"
  },
  {
    id: "3",
    title: "Educational Toys: Making Learning Fun", 
    slug: "educational-toys-making-learning-fun"
  }
];

function getTestBlogPostBySlug(slug) {
  return testPosts.find(post => post.slug === slug) || null;
}

// 测试slug匹配
const testSlug = "fashion-trends-2024-whats-hot-this-season";
const result = getTestBlogPostBySlug(testSlug);

console.log('测试slug:', testSlug);
console.log('匹配结果:', result);
console.log('是否找到:', result !== null);