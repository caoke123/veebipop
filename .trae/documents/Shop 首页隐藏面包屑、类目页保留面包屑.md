## 目标
- Shop 首页不显示面包屑导航
- 仅在带有 `category` 参数的类目列表页显示面包屑
- 保持现有样式结构与图标

## 改动文件
- `components/Shop/ShopBreadCrumb1.tsx`
- `components/Shop/ShopSidebarList.tsx`
- `components/Shop/ShopBreadCrumbImg.tsx`
- `components/Shop/ShopFilterOptions.tsx`
- `components/Shop/ShopFilterDropdown.tsx`

## 实施内容
- 统一使用 `useSearchParams` 读取 `category` 参数
- 将现有面包屑 `<div class="link ...">...</div>` 包裹为条件渲染：仅当 `currentCategorySlug` 存在时显示
- 其余标题与布局不变

## 验证
- 访问 `/shop`：不显示面包屑
- 访问 `/shop?category=art-toys`：显示 Homepage > Shop > Art Toys