## 目标
- 在类目列表页面包屑中显示：Homepage > Shop > 当前类目名
- 保持现有样式与结构不变

## 改动文件
- `components/Shop/ShopBreadCrumb1.tsx`
- `components/Shop/ShopSidebarList.tsx`
- `components/Shop/ShopBreadCrumbImg.tsx`
- `components/Shop/ShopFilterOptions.tsx`
- `components/Shop/ShopFilterDropdown.tsx`

## 实施内容
- 在各组件现有“Homepage”与当前标题之间插入：`<Link href="/shop">Shop</Link>` 与分隔图标
- 复用现有 `Icon.CaretRight`、类名与布局，不改变 UI/UX

## 验证
- 访问 `http://localhost:3001/shop?category=art-toys`，面包屑展示为 Homepage > Shop > Art Toys