## 目标与范围
- 保持现有 UI/UX：布局、样式、交互、动画完全一致。
- 仅改动 Shop 与类目列表页所用的组件与数据获取；不改首页、不改产品详情页。
- 优化目标：更快显示真实图片、减少可见占位/模糊时间、首屏更快可视。

## 必须保持的一致性
- 网格布局与列数、间距（如 `grid-cols-*`、`gap-*`）不变。
- 产品卡宽高比与样式（`aspect-*`、圆角、阴影、边框）不变。
- 悬停第二张图、点击跳详情、过滤/排序/分页交互不变。
- 加载过渡/淡入动画保持。

## 可实施的优化（在不改变 UI/UX 前提下）
1. Shop 场景禁用模糊占位
   - 在 `Product` 组件新增可选 Prop（`disableBlur?: boolean`）。
   - 各 Shop 组件渲染 `Product` 时传入 `disableBlur=true`；外层容器尺寸与样式不变。
2. 首屏分批优先加载
   - Shop 组件侧按设备自适应计算首屏 N（桌面≈8、移动≈6）。
   - 对前 N 张图片传 `imagePriority=true`（Next/Image 首屏预取），其他继续 `loading='lazy'`。
3. 虚拟化首屏豁免
   - 为 `VirtualizedProductList` 增加 `startIndex`（或 `initialRenderCount`）。
   - 索引 < `startIndex` 的项直接渲染，滚动后仍用虚拟化；视觉与交互不变。
4. 仅返回有图产品（调用端参数）
   - 在 `app/shop/page.tsx` 与相关 Hook 的请求参数加 `require_images=true`。
   - 不改 API 路由的外部契约与默认行为，避免影响其他页面。

## 涉及文件
- `d:/site119/frontend/src/app/shop/page.tsx`：请求参数追加 `require_images=true`。
- `d:/site119/frontend/src/components/Shop/ShopBreadCrumb1.tsx`：计算首屏 N，向 `Product` 传 `disableBlur` 与前 N 项 `imagePriority`；向虚拟化传 `startIndex`。
- `d:/site119/frontend/src/components/Shop/ShopSidebarList.tsx`：列表样式同样传入上述 Prop。
- `d:/site119/frontend/src/components/Shop/ShopBreadCrumb2.tsx`, `ShopBreadCrumbImg.tsx`, `ShopFilterOptions.tsx`, `ShopFilterDropdown.tsx`, `ShopFilterCanvas.tsx`：统一调用约定，确保不同 Shop 布局一致。
- `d:/site119/frontend/src/components/Shop/VirtualizedProductList.tsx`：新增 `startIndex`/`initialRenderCount` 支持。
- `d:/site119/frontend/src/components/Product/Product.tsx`：新增可选 Prop 并仅影响图片加载策略；渲染结构与样式不变。

## 验证
- 首屏图片更快可视，无模糊闪烁；滚动加载平滑。
- 悬停、快速查看、加入购物车、心愿单、对比、价格与标签、分页/无限滚动均保持一致。
- 首页与详情页零改动、零影响。

## 实施顺序
1. 扩展 `Product.tsx` 接口并打通到图片渲染层。
2. 在各 Shop 组件传入 `disableBlur` 与前 N 项的 `imagePriority`。
3. 增强虚拟化列表的首屏豁免。
4. 在 Shop 页面请求参数加 `require_images=true`。
5. 验证与调整阈值 N，确保兼顾性能与稳定显示。

## 备注：关于“更广泛的全站优化”
- 你提出的全站改动（全局 `BlurImage` 默认、`layout.tsx` 资源提示、`next.config.js` 图片格式与缓存、抽公共 Hook 与监控、API 路由内部缓存与无图过滤）属于良好实践，且不改变 UI/UX。
- 根据当前指示“仅修改 Shop 与类目页”，本次实施暂不涉及上述全站改动；如后续需要，我可在完成 Shop 优化后按你的建议逐项扩展到全站。