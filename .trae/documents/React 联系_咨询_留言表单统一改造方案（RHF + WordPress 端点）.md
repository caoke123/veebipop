## 全局定位结果
- 目标表单（仅联系/咨询/留言相关）：
  - `src/components/forms/ContactForm.tsx`（表单主体，现已使用 RHF，提交到 `/api/contact`；中文标签与提示）
  - `src/app/pages/contact/page.tsx` 右侧“Send us a message”原生 `<form>`（无提交逻辑）
  - `src/app/pages/about/components/ContactSection.tsx` 右侧“Send us a Message”原生 `<form>`（无提交逻辑，按钮文字为“Send Inquiry”）
- 关键词覆盖说明：未发现 `LeaveMessage` 组件/文件；`getInTouch` 作为文案存在于 `ContactSection.tsx:13`，不属于组件名/文件名；Newsletter/登录/注册/地址/结账类表单不在本次改造范围。

## 改造原则
- 仅修改“表单功能逻辑”，不改动任何样式、className、Tailwind 类、DOM 结构、占位符、按钮位置与布局。
- 全部改造为 `react-hook-form` 的 `register`（uncontrolled）模式；不使用 `Controller`。
- 字段与校验统一：
  - 必填：`name`、`email`、`message`
  - 可选：`phone`
  - 统一错误文案：必填 `This field is required`；邮箱格式 `Please enter a valid email address`
- 提交按钮文字状态统一：默认 `Send Message` → 提交中 `Sending...` → 成功后恢复 `Send Message`。
- 成功/失败统一提示：
  - 成功：`Thank you! Your message has been sent successfully.`（成功后 `reset()` 清空表单）
  - 失败：`Sorry, something went wrong. Please try again later.`
- 统一提交接口（前端仅 POST 数据，不处理 SMTP）：
  ```ts
  await fetch('https://veebipop.com/wp-json/custom/v1/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      message: data.message,
      page_url: window.location.href
    })
  })
  ```
- 安全与后端说明：您提供的 Brevo SMTP 配置应放置在后端 `.env` 或 WordPress 配置中，由后端处理邮件发送；前端不会存储或暴露这些敏感信息。

## 文件级实施方案
### 1) `src/components/forms/ContactForm.tsx`
- 保留所有现有 UI 结构与样式；仅替换逻辑：
  - 移除 `zodResolver(contactSchema)`，改用 `useForm` + `register` 的必填/格式校验（邮箱 `pattern`）。
  - 统一标签与占位符为英文：将中文“姓名/邮箱地址/电话号码/公司名称/咨询类型/留言内容/提交中/提交留言”等改为 `Name/Email/Phone (optional)/Company (optional)/Subject/Message/Sending.../Send Message`。
  - `onSubmit` 改为调用 WordPress 端点（如上所示）；仅发送 `name/email/phone/message/page_url`。
  - 成功后 `reset()` 并将成功视图文案改为英文（保留现有成功视图结构与按钮位置）：`Thank you! Your message has been sent successfully.`；按钮文本统一为 `Send Message`。
  - 失败：统一失败文案；如需确保可见性，可使用 `alert()` 呈现，不改结构与样式。
  - 保留 `subject/company/priority` 等 UI，但不设为必填。

### 2) `src/app/pages/contact/page.tsx`
- 将右侧原生 `<form>` 接入 RHF：
  - `useForm` + `register`（uncontrolled），必填 `name/email/message`；将 `Project Details` 作为 `message`；`Company` 不参与提交；可选 `phone`（若保留该字段）。
  - 提交按钮文案状态：`Send Message` → `Sending...` → 恢复 `Send Message`。
  - 统一端点提交；成功后 `reset()`；提示文案统一英文。为避免结构变动，使用 `alert()` 呈现成功/失败信息。
  - 不改动任何 className、Tailwind 类、布局与顺序。

### 3) `src/app/pages/about/components/ContactSection.tsx`
- 将右侧原生 `<form>` 接入 RHF：
  - `useForm` + `register`（uncontrolled）；必填 `First Name + Last Name` 合并为 `name`（提交时合并为 `"First Last"`），必填 `email` 与 `message`；`Project Type` 仅界面字段，不参与提交。
  - 按钮文本由 `Send Inquiry` 统一改为 `Send Message`，并加 `Sending...` 状态。
  - 统一端点提交；成功后 `reset()`；提示文案统一英文（用 `alert()` 呈现，不改结构）。
  - 保持原 className、Tailwind 类、布局与顺序不变。

## 验证与影响范围
- 仅触达 3 个文件的表单逻辑；不修改登录/注册/地址/结账/Newsletter 等其它表单。
- 自测：在 `pages/contact` 与 `pages/about` 填写表单，观察按钮文字状态、接口调用与成功后清空；`ContactForm.tsx` 成功视图与按钮位置保持原样，仅文本改为英文；错误提示统一英文。

## 后端 SMTP 配置
- 您提供的配置：
  - `SMTP_HOST=smtp-relay.brevo.com`
  - `SMTP_PORT=587`
  - `SMTP_SECURE=false`
  - `SMTP_USER=9c5898001@smtp-brevo.com`
  - `SMTP_PASS=...`（敏感）
  - `MAIL_FROM=info@veebipop.com`
  - `MAIL_TO_ADMIN=info@veebipop.com`
- 处理方式：仅由后端 `.env`/WordPress 提取并使用；前端不读写这些变量，不在仓库中存储或暴露。

## 交付
- 如确认方案，我将立即对上述 3 个文件进行改造与自测，确保零样式/布局变更并符合所有统一规则。