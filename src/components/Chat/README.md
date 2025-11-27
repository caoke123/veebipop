# 聊天组件 (FloatingChatWidget)

这是一个多渠道浮动聊天组件，支持WhatsApp、邮件、电话、短信和Facebook Messenger等多种联系方式。

## 功能特性

- 🎯 多渠道支持：WhatsApp、Email、Phone、SMS、Messenger
- 🎨 可自定义样式和颜色
- 📱 响应式设计，适配移动端
- ✨ 流畅的动画效果
- 🔧 灵活的位置配置
- 💬 自定义提示文本

## 使用方法

### 基本用法

```tsx
import FloatingChatWidget from '@/components/Chat/FloatingChatWidget';
import { CHAT_CHANNELS } from '@/constants/chatChannels';

<FloatingChatWidget 
  channels={CHAT_CHANNELS} 
  position={{ side: 'right', bottom: 30, sideSpacing: 30 }}
  ctaText="需要帮助？立即聊天！"
/>
```

### 配置渠道

在 `src/constants/chatChannels.ts` 中修改渠道配置：

```typescript
export const CHAT_CHANNELS: ChannelConfig[] = [
  {
    id: '1',
    type: ChannelType.WHATSAPP,
    value: '15550001234', // WhatsApp号码
    label: 'WhatsApp Support',
    message: 'Hello! I have a question about your products.',
    color: '#25D366' // 可选：自定义颜色
  },
  {
    id: '2',
    type: ChannelType.EMAIL,
    value: 'support@yourcompany.com', // 邮箱地址
    label: 'Email Us',
    message: 'Product Inquiry',
  },
  // ... 更多渠道
];
```

## API 参考

### FloatingChatWidget Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| channels | `ChannelConfig[]` | - | **必需**。聊天渠道配置数组 |
| position | `WidgetPosition` | `{ side: 'right', bottom: 24, sideSpacing: 24 }` | 组件位置配置 |
| ctaText | `string` | `"Chat with us"` | 悬停提示文本 |

### ChannelConfig

| 属性 | 类型 | 描述 |
|------|------|------|
| id | `string` | 唯一标识符 |
| type | `ChannelType` | 渠道类型 |
| value | `string` | 联系方式值（电话号码、邮箱等） |
| label | `string` | 工具提示文本 |
| message | `string` | 预填充消息（可选） |
| customIcon | `ReactNode` | 自定义图标（可选） |
| color | `string` | 自定义颜色（可选） |

### ChannelType

```typescript
enum ChannelType {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  MESSENGER = 'messenger'
}
```

### WidgetPosition

| 属性 | 类型 | 描述 |
|------|------|------|
| side | `'left' \| 'right'` | 显示在左侧还是右侧 |
| bottom | `number` | 距离底部的像素值 |
| sideSpacing | `number` | 距离侧边的像素值 |

## 自定义样式

组件使用 Tailwind CSS，可以通过以下方式自定义：

1. 修改 `src/styles/globals.scss` 中的动画
2. 在组件中覆盖 Tailwind 类名
3. 使用 `color` 属性自定义每个渠道的颜色

## 注意事项

- 确保已安装 `lucide-react` 依赖
- 组件使用 `'use client'` 指令，仅在客户端渲染
- 点击外部区域会自动关闭聊天选项
- 所有链接都会在新标签页中打开

## 示例配置

### 仅显示WhatsApp和邮件

```typescript
const limitedChannels = CHAT_CHANNELS.filter(
  channel => channel.type === ChannelType.WHATSAPP || channel.type === ChannelType.EMAIL
);
```

### 自定义位置

```typescript
<FloatingChatWidget 
  channels={CHAT_CHANNELS}
  position={{ side: 'left', bottom: 50, sideSpacing: 20 }}
  ctaText="联系我们"
/>