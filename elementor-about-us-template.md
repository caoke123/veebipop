
# Elementor About Us页面模板

## 概述

本文档提供了将Veebipop项目的About Us页面转换为Elementor页面构建器兼容模板的完整方案。该模板包含完整的样式配置，确保在Elementor中完美重现原始设计。

## 导入模板

### 方法一：直接在Elementor中构建

1. 在WordPress后台创建新页面
2. 点击"使用Elementor编辑"
3. 按照以下结构逐个添加小部件

### 方法二：导入JSON模板文件

1. 下载本指南底部的完整JSON文件
2. 在WordPress中导航到"模板" > "导入模板"
3. 上传JSON文件
4. 在新页面中使用导入的模板

## 页面结构设计

### 1. Hero Section（英雄区域）

**小部件组合：**
- Section (全宽)
  - Inner Section
    - Heading (主标题)
    - Text (副标题)
    - Button (主要按钮)
    - Button (次要按钮)
  - Image (背景图片)

**详细配置：**

```json
{
  "id": "hero-section",
  "elType": "section",
  "settings": {
    "structure": "20",
    "background_background": "classic",
    "background_image": {
      "url": "https://assets.veebipop.com/2149686863.jpg",
      "id": null
    },
    "background_position": "center center",
    "background_repeat": "no-repeat",
    "background_size": "cover",
    "padding": {
      "unit": "px",
      "top": "120",
      "right": "0",
      "bottom": "120",
      "left": "0",
      "isLinked": false
    },
    "min_height": {
      "unit": "vh",
      "size": 85
    },
    "content_position": "middle",
    "align": "center",
    "background_overlay_background": "classic",
    "background_overlay_color": "#000000",
    "background_overlay_opacity": {
      "unit": "px",
      "size": 0.75
    },
    "css_classes": "hero-section"
  },
  "elements": [
    {
      "id": "inner-section",
      "elType": "section",
      "settings": {
        "structure": "10",
        "content_width": "full"
      },
      "elements": [
        {
          "id": "badge",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<p>EST. 2015 — CHINA</p>",
            "text_color": "#D2EF9A",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 14
            },
            "typography_font_weight": "600",
            "typography_letter_spacing": {
              "unit": "px",
              "size": 1
            },
            "typography_text_transform": "uppercase",
            "background_background": "classic",
            "background_color": "rgba(210, 239, 154, 0.2)",
            "border_border": "solid",
            "border_width": {
              "unit": "px",
              "top": "1",
              "right": "1",
              "bottom": "1",
              "left": "1",
              "isLinked": true
            },
            "border_color": "#D2EF9A",
            "border_radius": {
              "unit": "px",
              "top": "9999",
              "right": "9999",
              "bottom": "9999",
              "left": "9999",
              "isLinked": true
            },
            "padding": {
              "unit": "px",
              "top": "8",
              "right": "16",
              "bottom": "8",
              "left": "16",
              "isLinked": false
            },
            "align": "center",
            "margin": {
              "unit": "px",
              "top": "0",
              "right": "0",
              "bottom": "24",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "hero-title",
          "elType": "widget",
          "widgetType": "heading",
          "settings": {
            "title": "Trendy Collectibles<br><span style=\"background: linear-gradient(to right, #D2EF9A, rgba(210, 239, 154, 0.7)); -webkit-background-clip: text; background-clip: text; color: transparent;\">Direct from the Source</span>",
            "header_size": "h1",
            "align": "center",
            "title_color": "#FFFFFF",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 70
            },
            "typography_font_weight": "700",
            "typography_line_height": {
              "unit": "em",
              "size": 1.1
            },
            "margin": {
              "unit": "px",
              "top": "0",
              "right": "0",
              "bottom": "24",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "hero-description",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<p>Your trusted original manufacturer of Pop Toys, Plush Keychains, and Car Accessories. Serving global brands with speed, quality, and innovation.</p>",
            "text_color": "#FFFFFF",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 20
            },
            "typography_line_height": {
              "unit": "em",
              "size": 1.6
            },
            "align": "center",
            "margin": {
              "unit": "px",
              "top": "0",
              "right": "0",
              "bottom": "40",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "button-group",
          "elType": "section",
          "settings": {
            "structure": "20",
            "gap": "16",
            "content_position": "middle",
            "align": "center"
          },
          "elements": [
            {
              "id": "primary-button",
              "elType": "widget",
              "widgetType": "button",
              "settings": {
                "text": "Start Your Project →",
                "link": {
                  "url": "#contact",
                  "is_external": false,
                  "nofollow": false
                },
                "background_background": "classic",
                "background_color": "#D2EF9A",
                "button_text_color": "#1F1F1F",
                "border_radius": {
                  "unit": "px",
                  "top": "8",
                  "right": "8",
                  "bottom": "8",
                  "left": "8",
                  "isLinked": true
                },
                "padding": {
                  "unit": "px",
                  "top": "16",
                  "right": "32",
                  "bottom": "16",
                  "left": "32",
                  "isLinked": false
                },
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 16
                },
                "typography_font_weight": "600"
              }
            },
            {
              "id": "secondary-button",
              "elType": "widget",
              "widgetType": "button",
              "settings": {
                "text": "Our Story",
                "link": {
                  "url": "#story",
                  "is_external": false,
                  "nofollow": false
                },
                "background_background": "classic",
                "background_color": "transparent",
                "button_text_color": "#FFFFFF",
                "border_border": "solid",
                "border_width": {
                  "unit": "px",
                  "top": "1",
                  "right": "1",
                  "bottom": "1",
                  "left": "1",
                  "isLinked": true
                },
                "border_color": "#FFFFFF",
                "border_radius": {
                  "unit": "px",
                  "top": "8",
                  "right": "8",
                  "bottom": "8",
                  "left": "8",
                  "isLinked": true
                },
                "padding": {
                  "unit": "px",
                  "top": "16",
                  "right": "32",
                  "bottom": "16",
                  "left": "32",
                  "isLinked": false
                },
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 16
                },
                "typography_font_weight": "600"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### 2. About Story Section（关于故事）

**小部件组合：**
- Section (两列布局)
  - Column 1: Image + Badge
  - Column 2: Heading + Text

**详细配置：**

```json
{
  "id": "about-story-section",
  "elType": "section",
  "settings": {
    "structure": "20",
    "background_background": "classic",
    "background_color": "#FFFFFF",
    "padding": {
      "unit": "px",
      "top": "80",
      "right": "0",
      "bottom": "80",
      "left": "0",
      "isLinked": false
    },
    "css_classes": "about-story-section"
  },
  "elements": [
    {
      "id": "image-column",
      "elType": "column",
      "settings": {
        "_column_size": 50,
        "_inline_size": null
      },
      "elements": [
        {
          "id": "story-image-wrapper",
          "elType": "widget",
          "widgetType": "image",
          "settings": {
            "image": {
              "url": "https://assets.veebipop.com/images/team-optimized.webp",
              "id": null
            },
            "image_size": "full",
            "align": "center",
            "border_radius": {
              "unit": "px",
              "top": "16",
              "right": "16",
              "bottom": "16",
              "left": "16",
              "isLinked": true
            },
            "box_shadow_box_shadow_type": "yes",
            "box_shadow_box_shadow": {
              "horizontal": 0,
              "vertical": 25,
              "blur": 50,
              "spread": -12,
              "color": "rgba(0,0,0,0.25)"
            }
          }
        },
        {
          "id": "story-badge",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<h3>10+</h3><p>Years of Manufacturing Excellence</p>",
            "background_background": "classic",
            "background_color": "#FFFFFF",
            "border_radius": {
              "unit": "px",
              "top": "8",
              "right": "8",
              "bottom": "8",
              "left": "8",
              "isLinked": true
            },
            "box_shadow_box_shadow_type": "yes",
            "box_shadow_box_shadow": {
              "horizontal": 0,
              "vertical": 10,
              "blur": 25,
              "spread": 0,
              "color": "rgba(0,0,0,0.1)"
            },
            "padding": {
              "unit": "px",
              "top": "24",
              "right": "24",
              "bottom": "24",
              "left": "24",
              "isLinked": true
            },
            "position": "absolute",
            "size": {
              "unit": "%",
              "width": "auto",
              "max_width": "200"
            },
            "_position": {
              "unit": "px",
              "top": "auto",
              "right": "auto",
              "bottom": "32",
              "left": "32"
            },
            "_z_index": 10
          }
        }
      ]
    },
    {
      "id": "content-column",
      "elType": "column",
      "settings": {
        "_column_size": 50,
        "_inline_size": null,
        "content_position": "center"
      },
      "elements": [
        {
          "id": "story-title",
          "elType": "widget",
          "widgetType": "heading",
          "settings": {
            "title": "Crafting Trends Since 2015",
            "header_size": "h2",
            "title_color": "#1F1F1F",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 36
            },
            "typography_font_weight": "600",
            "margin": {
              "unit": "px",
              "top": "0",
              "right": "0",
              "bottom": "24",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "story-text-1",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<p>Founded in 2015 and headquartered in TanJin — world's toy manufacturing capital — we are a leading original manufacturer specializing in trendy collectible dolls, plush doll clothing, fashion bag charms, phone straps, car rearview mirror hangings, and blind box series.</p>",
            "text_color": "#696C70",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 18
            },
            "typography_line_height": {
              "unit": "em",
              "size": 1.6
            },
            "margin": {
              "unit": "px",
              "top": "0",
              "right": "0",
              "bottom": "16",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "story-text-2",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<p>With over a decade of deep expertise, we proudly serve wholesalers, brands, and retailers across Europe, North America, Japan, Korea, and Middle East. From viral monster-style plushies to kawaii car charms that dominate social media feeds, our products define trends you see worldwide.</p>",
            "text_color": "#696C70",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 18
            },
            "typography_line_height": {
              "unit": "em",
              "size": 1.6
            },
            "margin": {
              "unit": "px",
              "top": "0",
              "right": "0",
              "bottom": "16",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "story-text-3",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<p>As a true source factory with 200+ skilled workers, a dedicated 15-person design team, and a monthly capacity exceeding 500,000 pieces, we guarantee authenticity, rapid trend response, and competitive factory-direct pricing.</p>",
            "text_color": "#696C70",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 18
            },
            "typography_line_height": {
              "unit": "em",
              "size": 1.6
            },
            "margin": {
              "unit": "px",
              "top": "0",
              "right": "0",
              "bottom": "16",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "story-text-highlight",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<p>We hold BSCI, Sedex, CE, ASTM, and CPSIA certifications, ensuring every piece meets the strictest global safety standards.</p>",
            "text_color": "#1F1F1F",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 18
            },
            "typography_line_height": {
              "unit": "em",
              "size": 1.6
            },
            "typography_font_weight": "600",
            "margin": {
              "unit": "px",
              "top": "8",
              "right": "0",
              "bottom": "0",
              "left": "0",
              "isLinked": false
            }
          }
        }
      ]
    }
  ]
}
```

### 3. Features Grid Section（特性网格）

**小部件组合：**
- Section (单列)
  - Heading + Subtitle
  - Section (3列网格)
    - Column: Icon + Heading + Text (重复6次)

**详细配置：**

```json
{
  "id": "features-section",
  "elType": "section",
  "settings": {
    "structure": "10",
    "background_background": "classic",
    "background_color": "#F7F7F7",
    "padding": {
      "unit": "px",
      "top": "96",
      "right": "0",
      "bottom": "96",
      "left": "0",
      "isLinked": false
    },
    "css_classes": "features-section"
  },
  "elements": [
    {
      "id": "features-header",
      "elType": "section",
      "settings": {
        "structure": "10",
        "content_position": "middle",
        "align": "center"
      },
      "elements": [
        {
          "id": "features-title",
          "elType": "widget",
          "widgetType": "heading",
          "settings": {
            "title": "Why Choose Us",
            "header_size": "h2",
            "align": "center",
            "title_color": "#1F1F1F",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 44
            },
            "typography_font_weight": "600",
            "margin": {
              "unit": "px",
              "top": "0",
              "right": "0",
              "bottom": "16",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "features-subtitle",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<p>We combine reliability of a large-scale manufacturer with agility of a design studio.</p>",
            "text_color": "#696C70",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 18
            },
            "align": "center",
            "width": {
              "unit": "%",
              "size": 75
            }
          }
        }
      ]
    },
    {
      "id": "features-grid",
      "elType": "section",
      "settings": {
        "structure": "30",
        "gap": "32",
        "margin": {
          "unit": "px",
          "top": "64",
          "right": "0",
          "bottom": "0",
          "left": "0",
          "isLinked": false
        }
      },
      "elements": [
        {
          "id": "feature-1",
          "elType": "column",
          "settings": {
            "_column_size": 33,
            "_inline_size": null
          },
          "elements": [
            {
              "id": "feature-1-icon",
              "elType": "widget",
              "widgetType": "icon",
              "settings": {
                "icon": "fas fa-industry",
                "primary_color": "#D2EF9A",
                "background_background": "classic",
                "background_color": "rgba(210, 239, 154, 0.1)",
                "border_radius": {
                  "unit": "px",
                  "top": "8",
                  "right": "8",
                  "bottom": "8",
                  "left": "8",
                  "isLinked": true
                },
                "padding": {
                  "unit": "px",
                  "top": "20",
                  "right": "20",
                  "bottom": "20",
                  "left": "20",
                  "isLinked": true
                },
                "icon_size": {
                  "unit": "px",
                  "size": 28
                },
                "align": "center",
                "margin": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "24",
                  "left": "0",
                  "isLinked": false
                }
              }
            },
            {
              "id": "feature-1-title",
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "Original Manufacturer",
                "header_size": "h3",
                "title_color": "#1F1F1F",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 24
                },
                "typography_font_weight": "600",
                "margin": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "12",
                  "left": "0",
                  "isLinked": false
                }
              }
            },
            {
              "id": "feature-1-description",
              "elType": "widget",
              "widgetType": "text-editor",
              "settings": {
                "editor": "<p>Direct from our workshop — 100% authentic, no middlemen, best price guaranteed. We control quality from raw material to final packaging.</p>",
                "text_color": "#696C70",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 18
                },
                "typography_line_height": {
                  "unit": "em",
                  "size": 1.6
                }
              }
            }
          ]
        },
        {
          "id": "feature-2",
          "elType": "column",
          "settings": {
            "_column_size": 33,
            "_inline_size": null
          },
          "elements": [
            {
              "id": "feature-2-icon",
              "elType": "widget",
              "widgetType": "icon",
              "settings": {
                "icon": "fas fa-palette",
                "primary_color": "#D2EF9A",
                "background_background": "classic",
                "background_color": "rgba(210, 239, 154, 0.1)",
                "border_radius": {
                  "unit": "px",
                  "top": "8",
                  "right": "8",
                  "bottom": "8",
                  "left": "8",
                  "isLinked": true
                },
                "padding": {
                  "unit": "px",
                  "top": "20",
                  "right": "20",
                  "bottom": "20",
                  "left": "20",
                  "isLinked": true
                },
                "icon_size": {
                  "unit": "px",
                  "size": 28
                },
                "align": "center",
                "margin": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "24",
                  "left": "0",
                  "isLinked": false
                }
              }
            },
            {
              "id": "feature-2-title",
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "Trend-Driven Design",
                "header_size": "h3",
                "title_color": "#1F1F1F",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 24
                },
                "typography_font_weight": "600",
                "margin": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "12",
                  "left": "0",
                  "isLinked": false
                }
              }
            },
            {
              "id": "feature-2-description",
              "elType": "widget",
              "widgetType": "text-editor",
              "settings": {
                "editor": "<p>Our 15-person design team tracks global trends daily. We launch new, market-ready designs every 7-15 days to keep you ahead of the curve.</p>",
                "text_color": "#696C70",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 18
                },
                "typography_line_height": {
                  "unit": "em",
                  "size": 1.6
                }
              }
            }
          ]
        },
        {
          "id": "feature-3",
          "elType": "column",
          "settings": {
            "_column_size": 33,
            "_inline_size": null
          },
          "elements": [
            {
              "id": "feature-3-icon",
              "elType": "widget",
              "widgetType": "icon",
              "settings": {
                "icon": "fas fa-shield-alt",
                "primary_color": "#D2EF9A",
                "background_background": "classic",
                "background_color": "rgba(210, 239, 154, 0.1)",
                "border_radius": {
                  "unit": "px",
                  "top": "8",
                  "right": "8",
                  "bottom": "8",
                  "left": "8",
                  "isLinked": true
                },
                "padding": {
                  "unit": "px",
                  "top": "20",
                  "right": "20",
                  "bottom": "20",
                  "left": "20",
                  "isLinked": true
                },
                "icon_size": {
                  "unit": "px",
                  "size": 28
                },
                "align": "center",
                "margin": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "24",
                  "left": "0",
                  "isLinked": false
                }
              }
            },
            {
              "id": "feature-3-title",
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "Premium Quality",
                "header_size": "h3",
                "title_color": "#1F1F1F",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 24
                },
                "typography_font_weight": "600",
                "margin": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "12",
                  "left": "0",
                  "isLinked": false
                }
              }
            },
            {
              "id": "feature-3-description",
              "elType": "widget",
              "widgetType": "text-editor",
              "settings": {
                "editor": "<p>Hand-stitched details using premium plush materials. All products meet strict CE, ASTM, and CPSIA safety standards for global markets.</p>",
                "text_color": "#696C70",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 18
                },
                "typography_line_height": {
                  "unit": "em",
                  "size": 1.6
                }
              }
            }
          ]
        },
        {
          "id": "feature-4",
          "elType": "column",
          "settings": {
            "_column_size": 33,
            "_inline_size": null
          },
          "elements": [
            {
              "id": "feature-4-icon",
              "elType": "widget",
              "widgetType": "icon",
              "settings": {
                "icon": "fas fa-dollar-sign",
                "primary_color": "#D2EF9A",
                "background_background": "classic",
                "background_color": "rgba(210, 239, 154, 0.1)",
                "border_radius": {
                  "unit": "px",
                  "top": "8",
                  "right": "8",
                  "bottom": "8",
                  "left": "8",
                  "isLinked": true
                },
                "padding": {
                  "unit": "px",
                  "top": "20",
                  "right": "20",
                  "bottom": "20",
                  "left": "20",
                  "isLinked": true
                },
                "icon_size": {
                  "unit": "px",
                  "size": 28
                },
                "align": "center",
                "margin": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "24",
                  "left": "0",
                  "isLinked": false
                }
              }
            },
            {
              "id": "feature-4-title",
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "Wholesale Pricing",
                "header_size": "h3",
                "title_color": "#1F1F1F",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 24
                },
                "typography_font_weight": "600",
                "margin": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "12",
                  "left": "0",
                  "isLinked": false
                }
              }
            },
            {
              "id": "feature-4-description",
              "elType": "widget",
              "widgetType": "text-editor",
              "settings": {
                "editor": "<p>Factory-direct pricing that is 30-50% lower than trading companies, maximizing your profit margins without compromising quality.</p>",
                "text_color": "#696C70",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 18
                },
                "typography_line_height": {
                  "unit": "em",
                  "size": 1.6
                }
              }
            }
          ]
        },
        {
          "id": "feature-5",
          "elType": "column",
          "settings": {
            "_column_size": 33,
            "_inline_size": null
          },
          "elements": [
            {
              "id": "feature-5-icon",
              "elType": "widget",
              "widgetType": "icon",
              "settings": {
                "icon": "fas fa-cogs",
                "primary_color": "#D2EF9A",
                "background_background": "classic",
                "background_color": "rgba(210, 239, 154, 0.1)",
                "border_radius": {
                  "unit": "px",
                  "top": "8",
                  "right": "8",
                  "bottom": "8",
                  "left": "8",
                  "isLinked": true
                },
                "padding": {
                  "unit": "px",
                  "top": "20",
                  "right": "20",
                  "bottom": "20",
                  "left": "20",
                  "isLinked": true
                },
                "icon_size": {
                  "unit": "px",
                  "size": 28
                },
                "align": "center",
                "margin": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "24",
                  "left": "0",
                  "isLinked": false
                }
              }
            },
            {
              "id": "feature-5-title",
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "Full Customization",
                "header_size": "h3",
                "title_color": "#1F1F1F",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 24
                },
                "typography_font_weight": "600",
                "margin": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "12",
                  "left": "0",
                  "isLinked": false
                }
              }
            },
            {
              "id": "feature-5-description",
              "elType": "widget",
              "widgetType": "text-editor",
              "settings": {
                "editor": "<p>End-to-end OEM/ODM services. From initial sketch to shelf-ready product, we handle your logo, custom packaging, and IP development.</p>",
                "text_color": "#696C70",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 18
                },
                "typography_line_height": {
                  "unit": "em",
                  "size": 1.6
                }
              }
            }
          ]
        },
        {
          "id": "feature-6",
          "elType": "column",
          "settings": {
            "_column_size": 33,
            "_inline_size": null
          },
          "elements": [
            {
              "id": "feature-6-icon",
              "elType": "widget",
              "widgetType": "icon",
              "settings": {
                "icon": "fas fa-globe",
                "primary_color": "#D2EF9A",
                "background_background": "classic",
                "background_color": "rgba(210, 239, 154, 0.1)",
                "border_radius": {
                  "unit": "px",
                  "top": "8",
                  "right": "8",
                  "bottom": "8",
                  "left": "8",
                  "isLinked": true
                },
                "padding": {
                  "unit": "px",
                  "top": "20",
                  "right": "20",
                  "bottom": "20",
                  "left": "20",
                  "isLinked": true
                },
                "icon_size": {
                  "unit": "px",
                  "size": 28
                },
                "align": "center",
                "margin": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "24",
                  "left": "0",
                  "isLinked": false
                }
              }
            },
            {
              "id": "feature-6-title",
              "elType": "widget",
              "widgetType": "heading",
              "settings": {
                "title": "Global Supply Chain",
                "header_size": "h3",
                "title_color": "#1F1F1F",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 24
                },
                "typography_font_weight": "600",
                "margin": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "12",
                  "left": "0",
                  "isLinked": false
                }
              }
            },
            {
              "id": "feature-6-description",
              "elType": "widget",
              "widgetType": "text-editor",
              "settings": {
                "editor": "<p>With a capacity of 500,000+ pcs/month and efficient logistics, we offer FOB Shenzhen in 15-25 days and door-to-door delivery to 50+ countries.</p>",
                "text_color": "#696C70",
                "typography_typography": "custom",
                "typography_font_size": {
                  "unit": "px",
                  "size": 18
                },
                "typography_line_height": {
                  "unit": "em",
                  "size": 1.6
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### 4. Timeline Section（时间线）

**小部件组合：**
- Section (单列)
  - Heading + Subtitle
  - Section (时间线容器)
    - Icon + Text (重复5次)

**详细配置：**

```json
{
  "id": "timeline-section",
  "elType": "section",
  "settings": {
    "structure": "10",
    "background_background": "classic",
    "background_color": "#FFFFFF",
    "padding": {
      "unit": "px",
      "top": "96",
      "right": "0",
      "bottom": "96",
      "left": "0",
      "isLinked": false
    },
    "css_classes": "timeline-section"
  },
  "elements": [
    {
      "id": "timeline-header",
      "elType": "section",
      "settings": {
        "structure": "10",
        "content_position": "middle",
        "align": "center",
        "margin": {
          "unit": "px",
          "top": "0",
          "right": "0",
          "bottom": "64",
          "left": "0",
          "isLinked": false
        }
      },
      "elements": [
        {
          "id": "timeline-title",
          "elType": "widget",
          "widgetType": "heading",
          "settings": {
            "title": "Our Journey",
            "header_size": "h2",
            "align": "center",
            "title_color": "#1F1F1F",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 44
            },
            "typography_font_weight": "600",
            "margin": {
              "unit": "px",
              "top": "0",
              "right": "0",
              "bottom": "8",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "timeline-subtitle",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<p>A decade of growth and innovation</p>",
            "text_color": "#696C70",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 18
            },
            "align": "center"
          }
        }
      ]
    },
    {
      "id": "timeline-items",
      "elType": "section",
      "settings": {
        "structure": "10",
        "content_position": "top",
        "css_classes": "timeline-container"
      },
      "elements": [
        {
          "id": "timeline-item-1",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<div class=\"timeline-item\"><div class=\"timeline-dot\"></div><div class=\"timeline-content\"><span class=\"timeline-year\">2015</span><h3>Inception</h3><p>Founded in TinJin with a dedicated focus on plush manufacturing and trendy accessories.</p></div></div>",
            "css_classes": "timeline-item-wrapper"
          }
        },
        {
          "id": "timeline-item-2",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<div class=\"timeline-item\"><div class=\"timeline-dot\"></div><div class=\"timeline-content\"><span class=\"timeline-year\">2018</span><h3>Global Standards</h3><p>Achieved BSCI and Sedex audits, officially entering European and North American mainstream supply chain.</p></div></div>",
            "css_classes": "timeline-item-wrapper"
          }
        },
        {
          "id": "timeline-item-3",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<div class=\"timeline-item\"><div class=\"timeline-dot\"></div><div class=\"timeline-content\"><span class=\"timeline-year\">2020</span><h3>Design Expansion</h3><p>Expanded in-house design team to 15 experts; launched our first viral blind box series.</p></div></div>",
            "css_classes": "timeline-item-wrapper"
          }
        },
        {
          "id": "timeline-item-4",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<div class=\"timeline-item\"><div class=\"timeline-dot\"></div><div class=\"timeline-content\"><span class=\"timeline-year\">2022</span><h3>Capacity Surge</h3><p>Monthly production capacity exceeded 500,000 units; became a key supplier for Top Tier brands in Japan and Korea.</p></div></div>",
            "css_classes": "timeline-item-wrapper"
          }
        },
        {
          "id": "timeline-item-5",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<div class=\"timeline-item\"><div class=\"timeline-dot\"></div><div class=\"timeline-content\"><span class=\"timeline-year\">2024-2025</span><h3>Global Reach</h3><p>Dominating the 'Labubu-style' monster trend; successfully penetrated the high-end Middle Eastern market.</p></div></div>",
            "css_classes": "timeline-item-wrapper"
          }
        }
      ]
    }
  ]
}
```

### 5. Team Section（团队介绍）

**小部件组合：**
- Section (单列)
  - Heading + Subtitle
  - Section (4列网格)
    - Column: Image + Name + Role (重复4次)

**详细配置：**

```json
{
  "id": "team-section",
  "elType": "section",
  "settings": {
    "structure": "10",
    "background_background": "classic",
    "background_color": "#F7F7F7",
    "padding": {
      "unit": "px",
      "top": "96",
      "right": "0",
      "bottom": "96",
      "left": "0",
      "isLinked": false
    },
    "css_classes": "team-section"
  },
  "elements": [
    {
      "id": "team-header",
      "elType": "section",
      "settings": {
        "structure": "10",
        "content_position": "middle",
        "align": "center",
        "margin": {
          "unit": "px",
          "top": "0",
          "right": "0",
          "bottom": "64",
          "left": "0",
          "isLinked": false
        }
      },
      "elements": [
        {
          "id": "team-title",
          "elType": "widget",
          "widgetType": "heading",
          "settings": {
            "title": "Meet The Team",
            "header_size": "h2",
            "align": "center",
            "title_color": "#1F1F1F",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 44
            },
            "typography_font_weight": "600",
            "margin": {
              "unit": "px",
              "top": "0",
              "right": "0",
              "bottom": "16",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "team-subtitle",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<p>The experts behind your products, dedicated to excellence in every stitch.</p>",
            "text_color": "#696C70",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 18
            },
            "align": "center",
            "width": {
              "unit": "%",
              "size": 75
            }
          }
        }
      ]
    },
    {
      "id": "team-grid",
      "elType": "section",
      "settings": {
        "structure": "40",
        "gap": "32"
      },
      "elements": [
        {
          "id": "team-member-1",
          "elType": "column",
          "settings": {
            "_column_size": 25,
            "_inline_size": null
          },
          "elements": [
            {
              "id": "team-image-1",
              "elType": "widget",
              "widgetType": "image",
              "settings": {
                "image": {
                  "url": "https://assets.veebipop.com/images/allen-optimized.webp",
                  "id": null
                },
                "image_size": "full",
                "align": "center",
                "border_radius": {
                  "unit": "px",
                  "top": "12",
                  "right": "12",
                  "bottom": "0",
                  "left": "12",
                  "isLinked": false
                },
                "hover_animation": "zoom-in",
                "image_border_border": "solid",
                "image_border_width": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "1",
                  "left": "0",
                  "isLinked": false
                },
                "image_border_color": "#E9E9E9",
                "box_shadow_box_shadow_type": "yes",
                "box_shadow_box_shadow": {
                  "horizontal": 0,
                  "vertical": 4,
                  "blur": 6,
                  "spread": 0,
                  "color": "rgba(0,0,0,0.05)"
                }
              }
            },
            {
              "id": "team-info-1",
              "elType": "widget",
              "widgetType": "text-editor",
              "settings": {
                "editor": "<h3 style=\"color: #1F1F1F; font-size: 20px; font-weight: 600; margin-bottom: 4px;\">Allen</h3><p style=\"color: #D2EF9A; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin: 0;\">General Manager</p>",
                "align": "center",
                "padding": {
                  "unit": "px",
                  "top": "24",
                  "right": "24",
                  "bottom": "24",
                  "left": "24",
                  "isLinked": true
                }
              }
            }
          ]
        },
        {
          "id": "team-member-2",
          "elType": "column",
          "settings": {
            "_column_size": 25,
            "_inline_size": null
          },
          "elements": [
            {
              "id": "team-image-2",
              "elType": "widget",
              "widgetType": "image",
              "settings": {
                "image": {
                  "url": "https://assets.veebipop.com/images/hong-optimized.webp",
                  "id": null
                },
                "image_size": "full",
                "align": "center",
                "border_radius": {
                  "unit": "px",
                  "top": "12",
                  "right": "12",
                  "bottom": "0",
                  "left": "12",
                  "isLinked": false
                },
                "hover_animation": "zoom-in",
                "image_border_border": "solid",
                "image_border_width": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "1",
                  "left": "0",
                  "isLinked": false
                },
                "image_border_color": "#E9E9E9",
                "box_shadow_box_shadow_type": "yes",
                "box_shadow_box_shadow": {
                  "horizontal": 0,
                  "vertical": 4,
                  "blur": 6,
                  "spread": 0,
                  "color": "rgba(0,0,0,0.05)"
                }
              }
            },
            {
              "id": "team-info-2",
              "elType": "widget",
              "widgetType": "text-editor",
              "settings": {
                "editor": "<h3 style=\"color: #1F1F1F; font-size: 20px; font-weight: 600; margin-bottom: 4px;\">Hong Li</h3><p style=\"color: #D2EF9A; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin: 0;\">Operations Director</p>",
                "align": "center",
                "padding": {
                  "unit": "px",
                  "top": "24",
                  "right": "24",
                  "bottom": "24",
                  "left": "24",
                  "isLinked": true
                }
              }
            }
          ]
        },
        {
          "id": "team-member-3",
          "elType": "column",
          "settings": {
            "_column_size": 25,
            "_inline_size": null
          },
          "elements": [
            {
              "id": "team-image-3",
              "elType": "widget",
              "widgetType": "image",
              "settings": {
                "image": {
                  "url": "https://assets.veebipop.com/images/anni2-optimized.webp",
                  "id": null
                },
                "image_size": "full",
                "align": "center",
                "border_radius": {
                  "unit": "px",
                  "top": "12",
                  "right": "12",
                  "bottom": "0",
                  "left": "12",
                  "isLinked": false
                },
                "hover_animation": "zoom-in",
                "image_border_border": "solid",
                "image_border_width": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "1",
                  "left": "0",
                  "isLinked": false
                },
                "image_border_color": "#E9E9E9",
                "box_shadow_box_shadow_type": "yes",
                "box_shadow_box_shadow": {
                  "horizontal": 0,
                  "vertical": 4,
                  "blur": 6,
                  "spread": 0,
                  "color": "rgba(0,0,0,0.05)"
                }
              }
            },
            {
              "id": "team-info-3",
              "elType": "widget",
              "widgetType": "text-editor",
              "settings": {
                "editor": "<h3 style=\"color: #1F1F1F; font-size: 20px; font-weight: 600; margin-bottom: 4px;\">Anie</h3><p style=\"color: #D2EF9A; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin: 0;\">Design Director</p>",
                "align": "center",
                "padding": {
                  "unit": "px",
                  "top": "24",
                  "right": "24",
                  "bottom": "24",
                  "left": "24",
                  "isLinked": true
                }
              }
            }
          ]
        },
        {
          "id": "team-member-4",
          "elType": "column",
          "settings": {
            "_column_size": 25,
            "_inline_size": null
          },
          "elements": [
            {
              "id": "team-image-4",
              "elType": "widget",
              "widgetType": "image",
              "settings": {
                "image": {
                  "url": "https://assets.veebipop.com/images/yang1.jpg-optimized.webp",
                  "id": null
                },
                "image_size": "full",
                "align": "center",
                "border_radius": {
                  "unit": "px",
                  "top": "12",
                  "right": "12",
                  "bottom": "0",
                  "left": "12",
                  "isLinked": false
                },
                "hover_animation": "zoom-in",
                "image_border_border": "solid",
                "image_border_width": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "1",
                  "left": "0",
                  "isLinked": false
                },
                "image_border_color": "#E9E9E9",
                "box_shadow_box_shadow_type": "yes",
                "box_shadow_box_shadow": {
                  "horizontal": 0,
                  "vertical": 4,
                  "blur": 6,
                  "spread": 0,
                  "color": "rgba(0,0,0,0.05)"
                }
              }
            },
            {
              "id": "team-info-4",
              "elType": "widget",
              "widgetType": "text-editor",
              "settings": {
                "editor": "<h3 style=\"color: #1F1F1F; font-size: 20px; font-weight: 600; margin-bottom: 4px;\">Master Yang</h3><p style=\"color: #D2EF9A; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin: 0;\">Factory Manager</p>",
                "align": "center",
                "padding": {
                  "unit": "px",
                  "top": "24",
                  "right": "24",
                  "bottom": "24",
                  "left": "24",
                  "isLinked": true
                }
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### 6. Video Section（视频展示）

**小部件组合：**
- Section (单列)
  - Heading
  - Video Widget

**详细配置：**

```json
{
  "id": "video-section",
  "elType": "section",
  "settings": {
    "structure": "10",
    "background_background": "classic",
    "background_color": "#FFFFFF",
    "padding": {
      "unit": "px",
      "top": "80",
      "right": "0",
      "bottom": "80",
      "left": "0",
      "isLinked": false
    },
    "content_position": "middle",
    "align": "center",
    "css_classes": "video-section"
  },
  "elements": [
    {
      "id": "video-title",
      "elType": "widget",
      "widgetType": "heading",
      "settings": {
        "title": "See Our Factory in Action",
        "header_size": "h2",
        "align": "center",
        "title_color": "#1F1F1F",
        "typography_typography": "custom",
        "typography_font_size": {
          "unit": "px",
          "size": 36
        },
        "typography_font_weight": "600",
        "margin": {
          "unit": "px",
          "top": "0",
          "right": "0",
          "bottom": "32",
          "left": "0",
          "isLinked": false
        }
      }
    },
    {
      "id": "video-widget",
      "elType": "widget",
      "widgetType": "video",
      "settings": {
        "video_type": "hosted",
        "hosted_url": {
          "url": "https://assets.veebipop.com/veebipop-aboutus.mp4",
          "id": null
        },
        "image_overlay": {
          "url": "https://assets.veebipop.com/images/image (1)-optimized.webp",
          "id": null
        },
        "aspect_ratio": "916",
        "show_image_overlay": "yes",
        "lightbox": "yes",
        "align": "center",
        "width": {
          "unit": "%",
          "size": 50
        },
        "border_radius": {
          "unit": "px",
          "top": "16",
          "right": "16",
          "bottom": "16",
          "left": "16",
          "isLinked": true
        },
        "box_shadow_box_shadow_type": "yes",
        "box_shadow_box_shadow": {
          "horizontal": 0,
          "vertical": 25,
          "blur": 50,
          "spread": -12,
          "color": "rgba(0,0,0,0.25)"
        },
        "margin": {
          "unit": "px",
          "top": "0",
          "right": "auto",
          "bottom": "0",
          "left": "auto",
          "isLinked": false
        }
      }
    }
  ]
}
```

### 7. Contact Section（联系表单）

**小部件组合：**
- Section (两列布局)
  - Column 1: Heading + Text + Contact Info + Button
  - Column 2: Form

**详细配置：**

```json
{
  "id": "contact-section",
  "elType": "section",
  "settings": {
    "structure": "20",
    "background_background": "classic",
    "background_color": "#F7F7F7",
    "padding": {
      "unit": "px",
      "top": "96",
      "right": "0",
      "bottom": "96",
      "left": "0",
      "isLinked": false
    },
    "css_classes": "contact-section"
  },
  "elements": [
    {
      "id": "contact-info-column",
      "elType": "column",
      "settings": {
        "_column_size": 50,
        "_inline_size": null
      },
      "elements": [
        {
          "id": "contact-badge",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<p>Get In Touch</p>",
            "text_color": "#D2EF9A",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 14
            },
            "typography_font_weight": "700",
            "typography_letter_spacing": {
              "unit": "px",
              "size": 1
            },
            "typography_text_transform": "uppercase",
            "margin": {
              "unit": "px",
              "top": "0",
              "right": "0",
              "bottom": "8",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "contact-title",
          "elType": "widget",
          "widgetType": "heading",
          "settings": {
            "title": "Let's Create Your Next Bestseller",
            "header_size": "h2",
            "title_color": "#1F1F1F",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 44
            },
            "typography_font_weight": "600",
            "margin": {
              "unit": "px",
              "top": "0",
              "right": "0",
              "bottom": "24",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "contact-description",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<p>Ready to start your custom project? Our team is ready to provide quotes, samples, and design consultations within 24 hours.</p>",
            "text_color": "#696C70",
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 18
            },
            "typography_line_height": {
              "unit": "em",
              "size": 1.6
            },
            "margin": {
              "unit": "px",
              "top": "0",
              "right": "0",
              "bottom": "40",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "contact-items",
          "elType": "section",
          "settings": {
            "structure": "10",
            "gap": "32"
          },
          "elements": [
            {
              "id": "contact-item-1",
              "elType": "widget",
              "widgetType": "icon-box",
              "settings": {
                "icon": "fas fa-building",
                "title_text": "Company",
                "description_text": "Tianjin Caoke Information Technology Co., Ltd.",
                "icon_primary_color": "#D2EF9A",
                "icon_background_background": "classic",
                "icon_background_color": "#FFFFFF",
                "icon_border_border": "solid",
                "icon_border_width": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "0",
                  "left": "0",
                  "isLinked": true
                },
                "icon_border_color": "transparent",
                "icon_border_radius": {
                  "unit": "px",
                  "top": "50",
                  "right": "50",
                  "bottom": "50",
                  "left": "50",
                  "isLinked": true
                },
                "icon_padding": {
                  "unit": "px",
                  "top": "16",
                  "right": "16",
                  "bottom": "16",
                  "left": "16",
                  "isLinked": true
                },
                "icon_size": {
                  "unit": "px",
                  "size": 20
                },
                "title_color": "#1F1F1F",
                "description_color": "#696C70",
                "title_typography_typography": "custom",
                "title_typography_font_size": {
                  "unit": "px",
                  "size": 16
                },
                "title_typography_font_weight": "700",
                "description_typography_typography": "custom",
                "description_typography_font_size": {
                  "unit": "px",
                  "size": 16
                }
              }
            },
            {
              "id": "contact-item-2",
              "elType": "widget",
              "widgetType": "icon-box",
              "settings": {
                "icon": "fas fa-phone",
                "title_text": "Phone / WhatsApp / WeChat",
                "description_text": "+86 13821385220",
                "icon_primary_color": "#D2EF9A",
                "icon_background_background": "classic",
                "icon_background_color": "#FFFFFF",
                "icon_border_border": "solid",
                "icon_border_width": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "0",
                  "left": "0",
                  "isLinked": true
                },
                "icon_border_color": "transparent",
                "icon_border_radius": {
                  "unit": "px",
                  "top": "50",
                  "right": "50",
                  "bottom": "50",
                  "left": "50",
                  "isLinked": true
                },
                "icon_padding": {
                  "unit": "px",
                  "top": "16",
                  "right": "16",
                  "bottom": "16",
                  "left": "16",
                  "isLinked": true
                },
                "icon_size": {
                  "unit": "px",
                  "size": 20
                },
                "title_color": "#1F1F1F",
                "description_color": "#696C70",
                "title_typography_typography": "custom",
                "title_typography_font_size": {
                  "unit": "px",
                  "size": 16
                },
                "title_typography_font_weight": "700",
                "description_typography_typography": "custom",
                "description_typography_font_size": {
                  "unit": "px",
                  "size": 16
                }
              }
            },
            {
              "id": "contact-item-3",
              "elType": "widget",
              "widgetType": "icon-box",
              "settings": {
                "icon": "fas fa-envelope",
                "title_text": "Email",
                "description_text": "sales@veebipop.com",
                "icon_primary_color": "#D2EF9A",
                "icon_background_background": "classic",
                "icon_background_color": "#FFFFFF",
                "icon_border_border": "solid",
                "icon_border_width": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "0",
                  "left": "0",
                  "isLinked": true
                },
                "icon_border_color": "transparent",
                "icon_border_radius": {
                  "unit": "px",
                  "top": "50",
                  "right": "50",
                  "bottom": "50",
                  "left": "50",
                  "isLinked": true
                },
                "icon_padding": {
                  "unit": "px",
                  "top": "16",
                  "right": "16",
                  "bottom": "16",
                  "left": "16",
                  "isLinked": true
                },
                "icon_size": {
                  "unit": "px",
                  "size": 20
                },
                "title_color": "#1F1F1F",
                "description_color": "#696C70",
                "title_typography_typography": "custom",
                "title_typography_font_size": {
                  "unit": "px",
                  "size": 16
                },
                "title_typography_font_weight": "700",
                "description_typography_typography": "custom",
                "description_typography_font_size": {
                  "unit": "px",
                  "size": 16
                }
              }
            },
            {
              "id": "contact-item-4",
              "elType": "widget",
              "widgetType": "icon-box",
              "settings": {
                "icon": "fas fa-map-marker-alt",
                "title_text": "Office Address",
                "description_text": "2nd Floor, City Center Building, Xiqing District, Tianjin City, China",
                "icon_primary_color": "#D2EF9A",
                "icon_background_background": "classic",
                "icon_background_color": "#FFFFFF",
                "icon_border_border": "solid",
                "icon_border_width": {
                  "unit": "px",
                  "top": "0",
                  "right": "0",
                  "bottom": "0",
                  "left": "0",
                  "isLinked": true
                },
                "icon_border_color": "transparent",
                "icon_border_radius": {
                  "unit": "px",
                  "top": "50",
                  "right": "50",
                  "bottom": "50",
                  "left": "50",
                  "isLinked": true
                },
                "icon_padding": {
                  "unit": "px",
                  "top": "16",
                  "right": "16",
                  "bottom": "16",
                  "left": "16",
                  "isLinked": true
                },
                "icon_size": {
                  "unit": "px",
                  "size": 20
                },
                "title_color": "#1F1F1F",
                "description_color": "#696C70",
                "title_typography_typography": "custom",
                "title_typography_font_size": {
                  "unit": "px",
                  "size": 16
                },
                "title_typography_font_weight": "700",
                "description_typography_typography": "custom",
                "description_typography_font_size": {
                  "unit": "px",
                  "size": 16
                }
              }
            }
          ]
        },
        {
          "id": "working-hours",
          "elType": "widget",
          "widgetType": "text-editor",
          "settings": {
            "editor": "<div style=\"background-color: #FFFFFF; padding: 24px; border-radius: 12px; border-left: 4px solid #D2EF9A; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); margin-top: 40px;\"><h4 style=\"color: #1F1F1F; font-size: 16px; font-weight: 700; margin-bottom: 4px;\">Working Hours</h4><p style=\"color: #696C70; font-size: 14px; margin: 0;\">Mon-Fri 9:00 - 18:30 (Beijing Time, GMT+8)</p></div>",
            "margin": {
              "unit": "px",
              "top": "40",
              "right": "0",
              "bottom": "0",
              "left": "0",
              "isLinked": false
            }
          }
        },
        {
          "id": "whatsapp-button",
          "elType": "widget",
          "widgetType": "button",
          "settings": {
            "text": "Chat on WhatsApp",
            "link": {
              "url": "https://wa.me/8613821385220",
              "is_external": true,
              "nofollow": false
            },
            "background_background": "classic",
            "background_color": "#D2EF9A",
            "button_text_color": "#1F1F1F",
            "border_radius": {
              "unit": "px",
              "top": "8",
              "right": "8",
              "bottom": "8",
              "left": "8",
              "isLinked": true
            },
            "padding": {
              "unit": "px",
              "top": "12",
              "right": "24",
              "bottom": "12",
              "left": "24",
              "isLinked": false
            },
            "typography_typography": "custom",
            "typography_font_size": {
              "unit": "px",
              "size": 16
            },
            "typography_font_weight": "600",
            "align": "left",
            "icon": "fab fa-whatsapp",
            "icon_indent": {
              "unit": "px",
              "size": 8
            },
            "margin":