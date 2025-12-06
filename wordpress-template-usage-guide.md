# WordPress About Us模板使用指南

## 快速开始

### 1. 准备工作

在开始之前，请确保：
- 您的WordPress网站已安装并激活了Gutenberg编辑器（WordPress 5.0+默认包含）
- 您有管理员权限来创建/编辑页面
- 您已准备好要使用的图片资源

### 2. 导入模板

#### 方法一：直接复制粘贴（推荐）

1. 登录WordPress后台
2. 导航到"页面" > "新建页面"
3. 在页面编辑器中，点击右上角的三个点（⋮）
4. 选择"代码编辑器"
5. 将[`wordpress-about-us-template.md`](wordpress-about-us-template.md)中的完整JSON代码复制并粘贴到编辑器中
6. 点击右上角的"切换到可视化编辑器"
7. 保存页面并预览

#### 方法二：使用页面模板插件

1. 安装如"Reusable Blocks"或"Page Template"插件
2. 创建新的可重用块或页面模板
3. 粘贴JSON代码
4. 保存并在新页面中使用

### 3. 自定义内容

#### 更换图片

在JSON中查找所有图片URL并替换为您自己的：

```json
"url": "https://assets.veebipop.com/2149686863.jpg"
```

替换为：

```json
"url": "https://yoursite.com/wp-content/uploads/your-image.jpg"
```

#### 修改公司信息

找到以下部分并更新为您的信息：

```json
"content": "Tianjin Caoke Information Technology Co., Ltd.",
"content": "+86 13821385220",
"content": "sales@veebipop.com",
"content": "2nd Floor, City Center Building, Xiqing District, Tianjin City, China"
```

#### 调整颜色

在样式定义中找到颜色变量：

```css
:root {
  --green: #D2EF9A;  /* 主色调 */
  --black: #1F1F1F;  /* 文字颜色 */
  --surface: #F7F7F7; /* 背景色 */
}
```

### 4. 表单集成

联系表单需要额外的配置：

#### 使用Contact Form 7

1. 安装并激活Contact Form 7插件
2. 创建新表单，使用以下HTML结构：

```html
<div class="form-row">
  <div class="form-group">
    <label>First Name</label>
    [text* first-name class:form-input]
  </div>
  <div class="form-group">
    <label>Last Name</label>
    [text* last-name class:form-input]
  </div>
</div>
<div class="form-group">
  <label>Email Address</label>
  [email* email class:form-input]
</div>
<div class="form-group">
  <label>Message</label>
  [textarea* message class:form-textarea]
</div>
[submit class:form-submit-button "Send Message"]
```

3. 在JSON中替换表单部分为Contact Form 7短代码：

```json
{
  "blockName": "core/html",
  "attrs": {
    "content": "[contact-form-7 id=\"123\" title=\"Contact Form\"]"
  }
}
```

### 5. 响应式调整

模板已包含响应式设计，但如果需要调整：

- 修改媒体查询断点
- 调整网格列数
- 更改字体大小

### 6. 性能优化

#### 图片优化

1. 使用WordPress的图片压缩插件（如Smush或EWWW Image Optimizer）
2. 确保所有图片都是WebP格式
3. 设置适当的图片尺寸

#### CSS优化

1. 将内联CSS移到主题的样式表中
2. 使用CSS压缩插件
3. 启用Gzip压缩

### 7. 常见问题解决

#### 样式不生效

1. 检查主题是否有冲突的CSS
2. 清除缓存
3. 尝试在自定义CSS中添加`!important`

#### 布局错乱

1. 确保容器类名正确
2. 检查网格布局设置
3. 验证HTML结构完整性

#### 表单不工作

1. 确认表单插件已正确安装
2. 检查短代码语法
3. 验证邮件设置

### 8. 高级自定义

#### 添加动画

在JSON中添加CSS动画类：

```json
"className": "animate-fade-in-up"
```

#### 集成Google Fonts

在主题的functions.php中添加：

```php
function add_custom_fonts() {
    wp_enqueue_style('google-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
}
add_action('wp_enqueue_scripts', 'add_custom_fonts');
```

#### 添加自定义JavaScript

创建自定义JS文件并引入：

```php
function add_custom_scripts() {
    wp_enqueue_script('custom-script', get_template_directory_uri() . '/js/custom.js', array('jquery'), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'add_custom_scripts');
```

### 9. SEO优化

1. 设置适当的页面标题和描述
2. 添加结构化数据（Schema.org）
3. 优化图片alt属性
4. 确保页面加载速度

### 10. 维护和更新

定期检查：
- 外部链接是否有效
- 图片是否需要更新
- 表单是否正常工作
- 样式是否与主题更新兼容

## 技术支持

如果您在使用过程中遇到问题：

1. 检查WordPress版本兼容性
2. 确认所有插件都是最新版本
3. 查看浏览器控制台错误
4. 临时切换到默认主题测试

## 备份建议

在进行任何修改之前：
1. 备份整个网站
2. 备份数据库
3. 创建页面副本进行测试

这个模板设计为即插即用，但根据您的具体需求可能需要一些调整。建议先在测试环境中进行所有自定义，然后再应用到生产环境。