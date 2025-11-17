## 总体目标
- 保留 Next Image 内置优化并确保 Cloudflare R2（image.nv315.top）远程图片无损显示与布局稳定
- 引入 React Query 作为标准客户端数据层，先从产品列表/详情与认证模块接入
- WooCommerce 请求全面启用 `_fields` 字段裁剪；为首屏定义必要字段，其余延迟加载
- 统一缓存、并发与失败策略，建立端到端可观测性并交付对比报告

## 阶段实施
### Phase 0：准备
- 清点与规范化图片 URL（移除空格/非法字符），校验远程域清单
- 加入开关：`ENABLE_IMAGE_OPTIMIZATION`、`ENABLE_AUTH_CACHE`、`ENABLE_REACT_QUERY`
- 制定回滚预案与灰度策略

### Phase 1：可观测性落地
- 在客户端入口接入 Web Vitals（LCP/CLS/INP/TTFB）并上报 `/api/analytics`
- 路由响应统一添加 `Server-Timing`，聚合 API P95/P99
- 启用 Bundle Analyzer 分析构建

### Phase 2：基线采样
- 开发/生产分别采样：页面（冷/热各10次）、API（每路由≥200次），生成对比图表与结论

### Phase 3：快速修复（不破坏 UI/UX）
- 图片与占位：关键图设置 `priority/sizes` 与固定容器或 `fill`；为远程图生成 `blurDataURL`（plaiceholder）
- 认证优化：`/api/auth/verify` 二级缓存与并发去重；客户端软TTL与延迟校验避免首屏阻塞
- React Query 接入（第一批）：
  - 产品列表与详情：统一 `staleTime 5m/cacheTime 30m/dedup`，错误重试指数回退
  - 认证接口：`retry: false`，与现有 `AuthContext` 协同
- WooCommerce `_fields` 字段裁剪：定义首页与详情首屏必要字段，其他字段二次请求或懒加载；保留前端组合价格（`price/sale_price`）的渲染路径

### Phase 4：复测与校验
- 第二轮采样与对比：确认图片 200 加载、无丢图/无抖动；React Query 接入后交互与失败处理更稳

### Phase 5：生产灰度
- 生产启用图片优化与缓存策略；按流量比例灰度 React Query 模块，监控异常率与性能走向

### Phase 6：中长期优化
- 标签化失效（`revalidateTag`）管理商品/分类数据，降低重算与后端压力
- 协商缓存：`ETag/Last-Modified` 为私有数据降无效响应
- 字体策略：`next/font` 子集化与统一使用，避免 FOIT/FOUT

## 图片与资源策略
- 默认使用 Next Image 内置优化，避免与 CDN 变体二次转码
- 远程域清单维护：确认除 `image.nv315.top` 外的供应商/作者域并统一加入 `remotePatterns`
- URL 合法性校验：构建前检查空格/特殊字符；页面使用编码后的 URL

## 客户端数据层（React Query）
- 全局 `QueryClient` 配置：`staleTime`、`cacheTime`、`dedupingInterval`、`retry/backoff`
- 模块接入顺序：产品列表→商品详情→认证→其他页面数据
- 数据层扩展优先：新增字段先在数据层兼容，再下沉到 UI，避免破坏现有组件

## WooCommerce 字段裁剪
- 首屏必要字段示例：`id,name,images,price,sale_price,regular_price,permalink,short_description`
- 版本差异处理：开发环境打印完整响应，逐项删减验证
- `price_html` 过大时改用前端组合价格渲染，保留 fallback

## 缓存、并发与失败策略
- 客户端：React Query 并发去重、重试回退（认证 `retry: false`，产品列表指数回退）
- 服务端：公共数据 `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`；私有数据加 `ETag/Last-Modified`
- 统一错误分类与日志：上报 `/api/analytics` 聚合

## 里程碑与验收
- M1（1周）：Phase 1–3 完成与首轮报告
- M2（2周）：二轮复测、图表与优化清单交付
- M3（4周）：中长期优化验证与路线图
- 验收目标：
  - LCP ≤ 2.5s（移动）、CLS ≤ 0.1、INP ≤ 200ms
  - 核心 API P95 ≤ 500ms、P99 ≤ 1000ms
  - 首页/商品页 JS 体积下降 ≥ 20%，图片字节下降 ≥ 20%

## 下一步
- 按 Phase 0→Phase 1→Phase 3 顺序执行：先首页与商品详情的 React Query 接入、图片占位与 `_fields` 裁剪；随后认证优化与缓存策略统一。