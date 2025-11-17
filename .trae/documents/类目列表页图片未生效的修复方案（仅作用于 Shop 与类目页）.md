## 范围与目标
- 仅修改 `app/shop/*` 与 `components/Shop/*`、相关 API 路由与工具函数；不改首页、详情页
- 保持 UI/UX 与样式不变；确保带 `category` 的列表始终显示真实图片且首屏更快

## 实施项
1) 客户端增量加载（useInfiniteQuery）
- 文件：`frontend/src/components/Shop/ShopBreadCrumb1.tsx`
- 改动：
  - 扩充 `queryKey` 包含：`category,on_sale,price_min,price_max,type,gender,brand,per_page`
  - `buildProductParams` 固定携带：`require_images=true`、`no304=true`
  - `timedFetch` 透传 `{ cache: 'no-store' }`
  - 输出调试日志：queryString、页码、返回数量
  - 本地兜底：在数据管线对 `mergedSource` 做“有图过滤”（`images/thumbImage` 非空）后再进入分页与排序

2) SSR 首次加载
- 文件：`frontend/src/app/shop/page.tsx`
- 改动：
  - `buildProductParams` 添加：`require_images=true`、`no304=true`
  - 请求使用 `{ cache: 'no-store' }`（禁用 304 与层级缓存）
  - 输出日志：`SSR Query`、加载产品数

3) API 路由强化
- 文件：`frontend/src/app/api/woocommerce/products/route.ts`
- 改动：
  - 记录 `searchParams` 与 Woo 参数（日志）
  - 分类：slug→ID 并递归子类目，传入多 ID 的 `category`
  - 过滤：返回前严格过滤无图产品（`images.length>0 || thumbImage.length>0`，兼容 `imageStatus==='mapped'`）
  - 304 控制：若 `no304=true`，命中 `ETag` 时仍返回 200，避免 304 干扰
  - 头部：保留 `X-WC-Total/X-WC-TotalPages`；输出过滤前后计数日志

4) 首屏优先数量一致性
- PC 固定三列页：SSR 初始化优先数量为 9，客户端按屏幕与布局动态校准
- 动态列布局页：桌面端按 `layoutCol × 3`，移动端按 `2 × 3`

5) 调试与验证
- 浏览器 Network 检查：`/api/woocommerce/products?...&require_images=true&no304=true`
- 响应产品均有图片；`X-WC-TotalPages` 合理
- 控制台日志：`SSR Query`、`Fetching products`、API 参数与过滤统计
- 实测类目：`http://localhost:3001/shop?category=art-toys`

## 交付顺序
1. 先修客户端与 SSR 参数与缓存策略
2. 强化 API 路由分类解析、图片过滤与 304 控制
3. 本地兜底过滤与日志完善
4. 按类目场景联调验证，并根据列数微调首屏优先数量 N

## 备注
- 完整遵循“图片真实显示、更快可视、UI/UX 不变”的约束
- 若某些类目返回仍存在无图项，兜底过滤保证页面稳定性

确认后我将按上述步骤逐项修改并验证，随后提交具体代码补丁。