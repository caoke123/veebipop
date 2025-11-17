## 范围与目标

* 环境：开发模式（`next dev`）、生产模式（`next build && next start`/线上CDN）

* 业务流程：主页→登录→注册→我的账户→商品详情→购物车→结账（端到端）

* 指标：FCP/LCP/TTFB/CLS/INP、API P95/P99、Bundle大小与缓存命中率、内存与GC、关键交互延迟

## 现状梳理（结合 AUTH\_SYSTEM\_DOCUMENTATION.md）

* 文档未提供量化基准数据；仅列出待优化方向（令牌缓存、API响应缓存、懒加载）。

* 代码现状：

  * 认证上下文在挂载即校验令牌（`src/contexts/AuthContext.tsx:50-77`、`79-107`），登录/注册走本地API（`109-139`、`142-175`）。

  * `next.config.js:4-23` 设置 `images.unoptimized: true`；已允许远端域名，安装了 `sharp`。

  * 未集成 Web Vitals/Lighthouse/上报管道；`@next/bundle-analyzer` 已安装但未启用。

  * 存在服务端/路由级缓存与 Memcached 抽象（`memjs`），部分接口已设置 `Cache-Control` 与 `stale-while-revalidate`。

## 测试方法与工具

* 页面性能

  * 本地：Chrome DevTools Performance、Coverage、Network；采集 Web Vitals（LCP/CLS/INP/TTFB）。

  * 生产：Lighthouse（桌面/移动）、WebPageTest（可选）与 RUM（真实用户指标）。

* API性能

  * 在所有 API 路由注入 `Server-Timing` 与结构化日志，收集时长并生成 P95/P99（含 `auth/login`、`auth/register`、`auth/verify`）。

  * 客户端 fetch 包装采集请求耗时与错误率（端到端视角）。

* 资源与缓存

  * 启用 Bundle Analyzer 生成构建体积报告；对关键页面执行 Coverage 与懒加载核验。

  * 检查响应头与 CDN 命中率，统计 `stale-while-revalidate` 生效情况。

* 内存与GC

  * 页面交互录制（登录/购物流程），采集内存曲线（Performance面板）与强制GC，分析泄漏与抖动。

  * 服务器侧通过采样日志观察内存峰值与GC频次（生产仅观测，不启用侵入式标志）。

## 底稿与数据采集落地

* Web Vitals（客户端）

  * 新增采集模块并在根客户端入口初始化，上报至 `/api/analytics`：

    ```ts
    import { onLCP,onFID,onCLS,onINP,onTTFB } from 'web-vitals'
    const send = (name,value,meta)=>navigator.sendBeacon('/api/analytics',JSON.stringify({name,value,meta}))
    onLCP(m=>send('LCP',m.value,{path:location.pathname}))
    onCLS(m=>send('CLS',m.value,{path:location.pathname}))
    onINP(m=>send('INP',m.value,{path:location.pathname}))
    onTTFB(m=>send('TTFB',m.value,{path:location.pathname}))
    ```

* API `Server-Timing` 与结构化日志（服务端）

  * 在路由统一包装：

    ```ts
    const t=process.hrtime.bigint()
    const res=NextResponse.json(data)
    const d=Number(process.hrtime.bigint()-t)/1e6
    res.headers.set('Server-Timing',`total;dur=${d.toFixed(2)}`)
    return res
    ```

* Bundle Analyzer（构建）

  * 以条件包裹启用：

    ```js
    const withBundleAnalyzer=require('@next/bundle-analyzer')({enabled:process.env.ANALYZE==='true'})
    module.exports=withBundleAnalyzer(nextConfig)
    ```

* 报告出品

  * 脚本化采集 Lighthouse JSON（移动/桌面），汇总 Web Vitals/API统计为 CSV/JSON；以折线/柱状图呈现开发 vs 生产对比。

## 测试场景与采样规划

* 首屏与关键页面：`/`、`/shop`、`/product/[slug]`、`/cart`、`/checkout`、`/login`、`/register`、`/my-account`。

* 交互：导航菜单展开（`MenuEleven.tsx`）、搜索、加车、结账提交。

* 认证流程：登录→验证→登出循环，覆盖令牌过期/失效。

* 采样：每页面 10 次本地（冷/热）、生产按时间窗口分层采样；API每路由≥200次采样统计 P95/P99。

## 优化建议（开发 vs 生产）

* 开发（短期）

  * 启用 `@next/bundle-analyzer` 与 Coverage，梳理大体积依赖与未用代码；预期首屏 LCP 降低 10-20%，复杂度低。

  * 使用 Turbopack（Next14）加速 HMR 与增量构建；预期开发构建时间降低 30-50%，复杂度中。

* 开发（中长期）

  * 拆分大型客户端组件，按路由/交互懒加载；预期交互延迟降低 20-40%，复杂度中。

* 生产（短期）

  * 图片优化：在生产启用 Next Image 优化（已安装 `sharp`），为首屏图片设置 `priority` 与尺寸；预期 LCP 降低 20-40%，复杂度中。

  * 认证校验去抖与缓存：对 `verify` 结果做短TTL缓存与请求去重；预期 `auth/verify` P95 降低 30-60%，复杂度中。

  * 统一 `Cache-Control`/`CDN-Cache-Control` 并提高 `s-maxage`，关键列表接口采用 SWR；预期 API 命中率提升，TTFB 降低 15-30%，复杂度中。

* 生产（中长期）

  * RUM 全量接入与异常样本采集，建立基线与告警；预期用户体验波动可控，复杂度中高。

  * 认证系统上游复用连接与 Memcached 二级缓存（见下文示例）；预期 P99 明显改善，复杂度中。

  * 采用 `revalidateTag` 管理分类/商品数据失效，减少全局重算；预期后端负载下降 20-30%，复杂度中。

## 认证系统专项优化

* 问题定位

  * 初始挂载即触发校验（`AuthContext.tsx:50-77`），对慢速上游会造成首屏阻塞与额外网络压力。

  * 频繁验证未做去重/缓存；本地仅使用 `localStorage` 持久化，没有网络层缓存。

* 快速修复

  * 校验节流：启动后延迟校验并在路由切换前校验；若 token 未临近过期则跳过一次。

  * 请求去重：对同一 token 校验并发合并。

* 架构优化（结合 Memcached）

  * 在 `/api/auth/verify` 实施二级缓存与上游连接复用：

    ```ts
    const key=`verify:${token}`
    const hit=await cache.get(key)
    if(hit)return ok(hit)
    const data=await wpValidate(token)
    await cache.set(key,data,{expires:300})
    return ok(data)
    ```

  * 客户端维持本地软TTL，过TTL但用户活跃时后台刷新。

## 代码与配置修改示例

* 启用图片优化（生产）：

  ```js
  images:{unoptimized:false,formats:['image/avif','image/webp'],remotePatterns:[...]}
  ```

* 关键图片：

  ```tsx
  <Image src={src} width={w} height={h} priority alt="" />
  ```

* 客户端 fetch 计时：

  ```ts
  const timed=async(url,init)=>{const s=performance.now();const r=await fetch(url,init);const d=performance.now()-s;report(url,d);return r}
  ```

## 交付物与里程碑

* 交付物

  * 完整测试报告（原始数据JSON/CSV、图表、结论）。

  * 优化建议清单（按影响×复杂度排序，含代码示例与预计提升）。

  * 开发 vs 生产基准对比图（Web Vitals、API P95/P99、bundle大小、缓存命中率）。

  * 用户体验改善量化预测（LCP、INP、TTFB 等）。

* 里程碑

  * M1：一周内完成仪表与首轮基线采集。

  * M2：两周内交付短期修复并复测报告。

  * M3：四周内完成中长期改造方案验证与路线图。

## 成功标准

* 首屏 LCP ≤ 2.5s（移动），CLS ≤ 0.1，INP ≤ 200ms。

* 核心 API P95 ≤ 500ms，P99 ≤ 1s（生产）。

* 主页与商品页 JS 总体积下降 ≥ 20%，图片字节下降 ≥

