# WordPress About Us页面JSON模板

## 概述

本文档提供了将Veebipop项目的About Us页面转换为WordPress Gutenberg兼容的JSON模板的完整方案。该模板包含完整的内联CSS样式，确保在任何WordPress主题中都能保持一致的外观和布局。

## 模板结构

### 1. 页面元数据

```json
{
  "title": "About Veebipop - Leading Factory-Direct Plush Toys & Fashion Accessories Manufacturer",
  "description": "Learn about Veebipop, a premier factory-direct manufacturer of trendy plush toys, doll clothes, fashion keychains, and car accessories. 10+ years OEM/ODM experience serving global B2B wholesalers.",
  "slug": "about-us",
  "status": "publish",
  "type": "page",
  "template": ""
}
```

### 2. 全局样式定义

```css
:root {
  --green: #D2EF9A;
  --black: #1F1F1F;
  --secondary: #696C70;
  --secondary2: #A0A0A0;
  --white: #ffffff;
  --surface: #F7F7F7;
  --red: #DB4444;
  --purple: #8684D4;
  --success: #3DAB25;
  --yellow: #ECB018;
  --pink: #F4407D;
  --line: #E9E9E9;
  --outline: rgba(0, 0, 0, 0.15);
  --surface1: rgba(255, 255, 255, 0.1);
  --surface2: rgba(255, 255, 255, 0.2);
}

.container {
  max-width: 1322px !important;
  width: 100%;
  padding-right: 16px;
  padding-left: 16px;
  margin: 0 auto;
}

.heading1 { font-size: 56px; line-height: 68px; font-weight: 500; }
.heading2 { font-size: 44px; line-height: 50px; font-weight: 600; }
.heading3 { font-size: 36px; line-height: 40px; font-weight: 600; }
.heading4 { font-size: 30px; line-height: 42px; font-weight: 600; }
.heading5 { font-size: 24px; line-height: 30px; font-weight: 600; }
.heading6 { font-size: 20px; line-height: 28px; font-weight: 600; }
.body1 { font-size: 18px; line-height: 28px; font-weight: 400; }
.caption1 { font-size: 14px; line-height: 22px; font-weight: 400; }

@media (max-width: 1023.99px) {
  .heading1 { font-size: 36px; line-height: 48px; }
  .heading2 { font-size: 32px; line-height: 40px; }
  .heading3 { font-size: 30px; line-height: 38px; }
  .heading4 { font-size: 26px; line-height: 32px; }
  .heading5 { font-size: 22px; line-height: 28px; }
  .heading6 { font-size: 18px; line-height: 26px; }
  .body1 { font-size: 16px; line-height: 26px; }
}

@media (max-width: 767.98px) {
  .heading1 { font-size: 24px; line-height: 32px; }
  .heading2 { font-size: 22px; line-height: 30px; }
  .heading3 { font-size: 20px; line-height: 28px; }
  .heading4 { font-size: 18px; line-height: 28px; }
  .heading5 { font-size: 16px; line-height: 26px; }
  .heading6 { font-size: 16px; line-height: 24px; }
  .body1 { font-size: 16px; line-height: 26px; }
}
```

## 页面组件JSON结构

### 1. Hero Section

```json
{
  "blockName": "core/group",
  "attrs": {
    "tagName": "section",
    "className": "hero-section",
    "style": {
      "color": {
        "text": "#ffffff"
      },
      "spacing": {
        "padding": {
          "top": "0",
          "bottom": "0"
        }
      },
      "background": {
        "backgroundImage": {
          "url": "https://assets.veebipop.com/2149686863.jpg",
          "id": null,
          "source": "url"
        },
        "backgroundPosition": "center center",
        "backgroundRepeat": "no-repeat",
        "backgroundSize": "cover"
      }
    },
    "layout": {
      "type": "constrained"
    }
  },
  "innerBlocks": [
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "div",
        "className": "hero-overlay",
        "style": {
          "background": "linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.6))",
          "spacing": {
            "padding": {
              "top": "120px",
              "bottom": "120px"
            }
          },
          "minHeight": "85vh",
          "display": "flex",
          "alignItems": "center",
          "justifyContent": "center"
        }
      },
      "innerBlocks": [
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "hero-content",
            "style": {
              "textAlign": "center",
              "maxWidth": "1000px",
              "margin": "0 auto"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/paragraph",
              "attrs": {
                "className": "hero-badge",
                "content": "EST. 2015 — CHINA",
                "style": {
                  "backgroundColor": "rgba(210, 239, 154, 0.2)",
                  "color": "#D2EF9A",
                  "padding": "8px 16px",
                  "borderRadius": "9999px",
                  "fontSize": "14px",
                  "fontWeight": "600",
                  "letterSpacing": "1px",
                  "textTransform": "uppercase",
                  "display": "inline-block",
                  "marginBottom": "24px",
                  "border": "1px solid #D2EF9A"
                }
              }
            },
            {
              "blockName": "core/heading",
              "attrs": {
                "level": 1,
                "content": "Trendy Collectibles<br/><span style=\"background: linear-gradient(to right, #D2EF9A, rgba(210, 239, 154, 0.7)); -webkit-background-clip: text; background-clip: text; color: transparent;\">Direct from the Source</span>",
                "className": "hero-title",
                "style": {
                  "fontSize": "clamp(36px, 7vw, 70px)",
                  "fontWeight": "700",
                  "lineHeight": "1.1",
                  "marginBottom": "24px"
                }
              }
            },
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "Your trusted original manufacturer of Pop Toys, Plush Keychains, and Car Accessories. Serving global brands with speed, quality, and innovation.",
                "className": "hero-description",
                "style": {
                  "fontSize": "clamp(18px, 2vw, 20px)",
                  "lineHeight": "1.6",
                  "marginBottom": "40px",
                  "opacity": "0.8"
                }
              }
            },
            {
              "blockName": "core/buttons",
              "attrs": {
                "className": "hero-buttons",
                "layout": {
                  "type": "flex",
                  "justifyContent": "center",
                  "orientation": "horizontal"
                },
                "style": {
                  "spacing": {
                    "blockGap": "16px"
                  }
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/button",
                  "attrs": {
                    "text": "Start Your Project →",
                    "url": "#contact",
                    "className": "hero-button-primary",
                    "style": {
                      "backgroundColor": "#D2EF9A",
                      "color": "#1F1F1F",
                      "padding": "16px 32px",
                      "borderRadius": "8px",
                      "fontWeight": "600",
                      "border": "none",
                      "fontSize": "16px"
                    }
                  }
                },
                {
                  "blockName": "core/button",
                  "attrs": {
                    "text": "Our Story",
                    "url": "#story",
                    "className": "hero-button-secondary",
                    "style": {
                      "backgroundColor": "transparent",
                      "color": "#ffffff",
                      "border": "1px solid #ffffff",
                      "padding": "16px 32px",
                      "borderRadius": "8px",
                      "fontWeight": "600",
                      "fontSize": "16px"
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 2. About Story Section

```json
{
  "blockName": "core/group",
  "attrs": {
    "tagName": "section",
    "id": "story",
    "className": "about-story-section",
    "style": {
      "backgroundColor": "#ffffff",
      "spacing": {
        "padding": {
          "top": "80px",
          "bottom": "80px"
        }
      }
    },
    "layout": {
      "type": "constrained"
    }
  },
  "innerBlocks": [
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "div",
        "className": "container",
        "layout": {
          "type": "grid",
          "columnCount": 2
        },
        "style": {
          "spacing": {
            "blockGap": "48px"
          }
        }
      },
      "innerBlocks": [
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "story-image-container",
            "style": {
              "position": "relative"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/image",
              "attrs": {
                "url": "https://assets.veebipop.com/images/team-optimized.webp",
                "alt": "Design Studio",
                "className": "story-image",
                "style": {
                  "width": "100%",
                  "borderRadius": "16px",
                  "boxShadow": "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }
              }
            },
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "story-badge",
                "style": {
                  "position": "absolute",
                  "bottom": "32px",
                  "left": "32px",
                  "backgroundColor": "#ffffff",
                  "padding": "24px",
                  "borderRadius": "8px",
                  "boxShadow": "0 10px 25px rgba(0, 0, 0, 0.1)",
                  "maxWidth": "200px"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/heading",
                  "attrs": {
                    "level": 3,
                    "content": "10+",
                    "className": "badge-number",
                    "style": {
                      "color": "#D2EF9A",
                      "fontSize": "36px",
                      "fontWeight": "700",
                      "marginBottom": "4px"
                    }
                  }
                },
                {
                  "blockName": "core/paragraph",
                  "attrs": {
                    "content": "Years of Manufacturing Excellence",
                    "className": "badge-text",
                    "style": {
                      "color": "#696C70",
                      "fontSize": "14px",
                      "fontWeight": "500"
                    }
                  }
                }
              ]
            }
          ]
        },
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "story-content",
            "style": {
              "display": "flex",
              "flexDirection": "column",
              "justifyContent": "center"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/heading",
              "attrs": {
                "level": 2,
                "content": "Crafting Trends Since 2015",
                "className": "story-title",
                "style": {
                  "color": "#1F1F1F",
                  "fontSize": "36px",
                  "fontWeight": "600",
                  "marginBottom": "24px"
                }
              }
            },
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "Founded in 2015 and headquartered in TanJin — the world's toy manufacturing capital — we are a leading original manufacturer specializing in trendy collectible dolls, plush doll clothing, fashion bag charms, phone straps, car rearview mirror hangings, and blind box series.",
                "className": "story-text",
                "style": {
                  "color": "#696C70",
                  "fontSize": "18px",
                  "lineHeight": "1.6",
                  "marginBottom": "16px"
                }
              }
            },
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "With over a decade of deep expertise, we proudly serve wholesalers, brands, and retailers across Europe, North America, Japan, Korea, and the Middle East. From viral monster-style plushies to kawaii car charms that dominate social media feeds, our products define the trends you see worldwide.",
                "className": "story-text",
                "style": {
                  "color": "#696C70",
                  "fontSize": "18px",
                  "lineHeight": "1.6",
                  "marginBottom": "16px"
                }
              }
            },
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "As a true source factory with 200+ skilled workers, a dedicated 15-person design team, and a monthly capacity exceeding 500,000 pieces, we guarantee authenticity, rapid trend response, and competitive factory-direct pricing.",
                "className": "story-text",
                "style": {
                  "color": "#696C70",
                  "fontSize": "18px",
                  "lineHeight": "1.6",
                  "marginBottom": "16px"
                }
              }
            },
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "We hold BSCI, Sedex, CE, ASTM, and CPSIA certifications, ensuring every piece meets the strictest global safety standards.",
                "className": "story-text-highlight",
                "style": {
                  "color": "#1F1F1F",
                  "fontSize": "18px",
                  "lineHeight": "1.6",
                  "fontWeight": "600",
                  "marginTop": "8px"
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

### 3. Features Grid Section

```json
{
  "blockName": "core/group",
  "attrs": {
    "tagName": "section",
    "className": "features-section",
    "style": {
      "backgroundColor": "#F7F7F7",
      "spacing": {
        "padding": {
          "top": "96px",
          "bottom": "96px"
        }
      }
    },
    "layout": {
      "type": "constrained"
    }
  },
  "innerBlocks": [
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "div",
        "className": "container features-header",
        "style": {
          "textAlign": "center",
          "marginBottom": "64px"
        }
      },
      "innerBlocks": [
        {
          "blockName": "core/heading",
          "attrs": {
            "level": 2,
            "content": "Why Choose Us",
            "className": "features-title",
            "style": {
              "color": "#1F1F1F",
              "fontSize": "44px",
              "fontWeight": "600",
              "marginBottom": "16px"
            }
          }
        },
        {
          "blockName": "core/paragraph",
          "attrs": {
            "content": "We combine reliability of a large-scale manufacturer with agility of a design studio.",
            "className": "features-subtitle",
            "style": {
              "color": "#696C70",
              "fontSize": "18px",
              "maxWidth": "600px",
              "margin": "0 auto"
            }
          }
        }
      ]
    },
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "div",
        "className": "container features-grid",
        "layout": {
          "type": "grid",
          "columnCount": 3
        },
        "style": {
          "spacing": {
            "blockGap": "32px"
          }
        }
      },
      "innerBlocks": [
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "feature-card",
            "style": {
              "backgroundColor": "#ffffff",
              "padding": "32px",
              "borderRadius": "12px",
              "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
              "border": "1px solid #E9E9E9",
              "transition": "all 0.3s ease"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "feature-icon",
                "style": {
                  "width": "56px",
                  "height": "56px",
                  "backgroundColor": "rgba(210, 239, 154, 0.1)",
                  "borderRadius": "8px",
                  "display": "flex",
                  "alignItems": "center",
                  "justifyContent": "center",
                  "marginBottom": "24px"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/spacer",
                  "attrs": {
                    "height": "28px",
                    "width": "28px",
                    "style": {
                      "backgroundColor": "#D2EF9A",
                      "borderRadius": "50%"
                    }
                  }
                }
              ]
            },
            {
              "blockName": "core/heading",
              "attrs": {
                "level": 3,
                "content": "Original Manufacturer",
                "className": "feature-title",
                "style": {
                  "color": "#1F1F1F",
                  "fontSize": "24px",
                  "fontWeight": "600",
                  "marginBottom": "12px"
                }
              }
            },
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "Direct from our workshop — 100% authentic, no middlemen, best price guaranteed. We control quality from raw material to final packaging.",
                "className": "feature-description",
                "style": {
                  "color": "#696C70",
                  "fontSize": "18px",
                  "lineHeight": "1.6"
                }
              }
            }
          ]
        },
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "feature-card",
            "style": {
              "backgroundColor": "#ffffff",
              "padding": "32px",
              "borderRadius": "12px",
              "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
              "border": "1px solid #E9E9E9",
              "transition": "all 0.3s ease"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "feature-icon",
                "style": {
                  "width": "56px",
                  "height": "56px",
                  "backgroundColor": "rgba(210, 239, 154, 0.1)",
                  "borderRadius": "8px",
                  "display": "flex",
                  "alignItems": "center",
                  "justifyContent": "center",
                  "marginBottom": "24px"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/spacer",
                  "attrs": {
                    "height": "28px",
                    "width": "28px",
                    "style": {
                      "backgroundColor": "#D2EF9A",
                      "borderRadius": "50%"
                    }
                  }
                }
              ]
            },
            {
              "blockName": "core/heading",
              "attrs": {
                "level": 3,
                "content": "Trend-Driven Design",
                "className": "feature-title",
                "style": {
                  "color": "#1F1F1F",
                  "fontSize": "24px",
                  "fontWeight": "600",
                  "marginBottom": "12px"
                }
              }
            },
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "Our 15-person design team tracks global trends daily. We launch new, market-ready designs every 7-15 days to keep you ahead of the curve.",
                "className": "feature-description",
                "style": {
                  "color": "#696C70",
                  "fontSize": "18px",
                  "lineHeight": "1.6"
                }
              }
            }
          ]
        },
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "feature-card",
            "style": {
              "backgroundColor": "#ffffff",
              "padding": "32px",
              "borderRadius": "12px",
              "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
              "border": "1px solid #E9E9E9",
              "transition": "all 0.3s ease"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "feature-icon",
                "style": {
                  "width": "56px",
                  "height": "56px",
                  "backgroundColor": "rgba(210, 239, 154, 0.1)",
                  "borderRadius": "8px",
                  "display": "flex",
                  "alignItems": "center",
                  "justifyContent": "center",
                  "marginBottom": "24px"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/spacer",
                  "attrs": {
                    "height": "28px",
                    "width": "28px",
                    "style": {
                      "backgroundColor": "#D2EF9A",
                      "borderRadius": "50%"
                    }
                  }
                }
              ]
            },
            {
              "blockName": "core/heading",
              "attrs": {
                "level": 3,
                "content": "Premium Quality",
                "className": "feature-title",
                "style": {
                  "color": "#1F1F1F",
                  "fontSize": "24px",
                  "fontWeight": "600",
                  "marginBottom": "12px"
                }
              }
            },
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "Hand-stitched details using premium plush materials. All products meet strict CE, ASTM, and CPSIA safety standards for global markets.",
                "className": "feature-description",
                "style": {
                  "color": "#696C70",
                  "fontSize": "18px",
                  "lineHeight": "1.6"
                }
              }
            }
          ]
        },
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "feature-card",
            "style": {
              "backgroundColor": "#ffffff",
              "padding": "32px",
              "borderRadius": "12px",
              "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
              "border": "1px solid #E9E9E9",
              "transition": "all 0.3s ease"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "feature-icon",
                "style": {
                  "width": "56px",
                  "height": "56px",
                  "backgroundColor": "rgba(210, 239, 154, 0.1)",
                  "borderRadius": "8px",
                  "display": "flex",
                  "alignItems": "center",
                  "justifyContent": "center",
                  "marginBottom": "24px"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/spacer",
                  "attrs": {
                    "height": "28px",
                    "width": "28px",
                    "style": {
                      "backgroundColor": "#D2EF9A",
                      "borderRadius": "50%"
                    }
                  }
                }
              ]
            },
            {
              "blockName": "core/heading",
              "attrs": {
                "level": 3,
                "content": "Wholesale Pricing",
                "className": "feature-title",
                "style": {
                  "color": "#1F1F1F",
                  "fontSize": "24px",
                  "fontWeight": "600",
                  "marginBottom": "12px"
                }
              }
            },
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "Factory-direct pricing that is 30-50% lower than trading companies, maximizing your profit margins without compromising quality.",
                "className": "feature-description",
                "style": {
                  "color": "#696C70",
                  "fontSize": "18px",
                  "lineHeight": "1.6"
                }
              }
            }
          ]
        },
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "feature-card",
            "style": {
              "backgroundColor": "#ffffff",
              "padding": "32px",
              "borderRadius": "12px",
              "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
              "border": "1px solid #E9E9E9",
              "transition": "all 0.3s ease"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "feature-icon",
                "style": {
                  "width": "56px",
                  "height": "56px",
                  "backgroundColor": "rgba(210, 239, 154, 0.1)",
                  "borderRadius": "8px",
                  "display": "flex",
                  "alignItems": "center",
                  "justifyContent": "center",
                  "marginBottom": "24px"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/spacer",
                  "attrs": {
                    "height": "28px",
                    "width": "28px",
                    "style": {
                      "backgroundColor": "#D2EF9A",
                      "borderRadius": "50%"
                    }
                  }
                }
              ]
            },
            {
              "blockName": "core/heading",
              "attrs": {
                "level": 3,
                "content": "Full Customization",
                "className": "feature-title",
                "style": {
                  "color": "#1F1F1F",
                  "fontSize": "24px",
                  "fontWeight": "600",
                  "marginBottom": "12px"
                }
              }
            },
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "End-to-end OEM/ODM services. From initial sketch to shelf-ready product, we handle your logo, custom packaging, and IP development.",
                "className": "feature-description",
                "style": {
                  "color": "#696C70",
                  "fontSize": "18px",
                  "lineHeight": "1.6"
                }
              }
            }
          ]
        },
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "feature-card",
            "style": {
              "backgroundColor": "#ffffff",
              "padding": "32px",
              "borderRadius": "12px",
              "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
              "border": "1px solid #E9E9E9",
              "transition": "all 0.3s ease"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "feature-icon",
                "style": {
                  "width": "56px",
                  "height": "56px",
                  "backgroundColor": "rgba(210, 239, 154, 0.1)",
                  "borderRadius": "8px",
                  "display": "flex",
                  "alignItems": "center",
                  "justifyContent": "center",
                  "marginBottom": "24px"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/spacer",
                  "attrs": {
                    "height": "28px",
                    "width": "28px",
                    "style": {
                      "backgroundColor": "#D2EF9A",
                      "borderRadius": "50%"
                    }
                  }
                }
              ]
            },
            {
              "blockName": "core/heading",
              "attrs": {
                "level": 3,
                "content": "Global Supply Chain",
                "className": "feature-title",
                "style": {
                  "color": "#1F1F1F",
                  "fontSize": "24px",
                  "fontWeight": "600",
                  "marginBottom": "12px"
                }
              }
            },
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "With a capacity of 500,000+ pcs/month and efficient logistics, we offer FOB Shenzhen in 15-25 days and door-to-door delivery to 50+ countries.",
                "className": "feature-description",
                "style": {
                  "color": "#696C70",
                  "fontSize": "18px",
                  "lineHeight": "1.6"
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

### 4. Timeline Section

```json
{
  "blockName": "core/group",
  "attrs": {
    "tagName": "section",
    "className": "timeline-section",
    "style": {
      "backgroundColor": "#ffffff",
      "spacing": {
        "padding": {
          "top": "96px",
          "bottom": "96px"
        }
      },
      "overflow": "hidden"
    },
    "layout": {
      "type": "constrained"
    }
  },
  "innerBlocks": [
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "div",
        "className": "container timeline-header",
        "style": {
          "textAlign": "center",
          "marginBottom": "64px",
          "maxWidth": "800px",
          "margin": "0 auto 64px"
        }
      },
      "innerBlocks": [
        {
          "blockName": "core/heading",
          "attrs": {
            "level": 2,
            "content": "Our Journey",
            "className": "timeline-title",
            "style": {
              "color": "#1F1F1F",
              "fontSize": "44px",
              "fontWeight": "600",
              "marginBottom": "8px"
            }
          }
        },
        {
          "blockName": "core/paragraph",
          "attrs": {
            "content": "A decade of growth and innovation",
            "className": "timeline-subtitle",
            "style": {
              "color": "#696C70",
              "fontSize": "18px"
            }
          }
        }
      ]
    },
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "div",
        "className": "timeline-container",
        "style": {
          "position": "relative",
          "maxWidth": "800px",
          "margin": "0 auto"
        }
      },
      "innerBlocks": [
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "timeline-line",
            "style": {
              "position": "absolute",
              "left": "16px",
              "top": "0",
              "bottom": "0",
              "width": "2px",
              "backgroundColor": "rgba(210, 239, 154, 0.2)"
            }
          }
        },
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "timeline-items",
            "style": {
              "position": "relative"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "timeline-item",
                "style": {
                  "marginBottom": "48px",
                  "position": "relative"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "timeline-dot",
                    "style": {
                      "position": "absolute",
                      "left": "16px",
                      "top": "24px",
                      "width": "16px",
                      "height": "16px",
                      "borderRadius": "50%",
                      "backgroundColor": "#D2EF9A",
                      "border": "4px solid #ffffff",
                      "boxShadow": "0 1px 3px rgba(0, 0, 0, 0.1)",
                      "transform": "translateX(-50%)"
                    }
                  }
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "timeline-content",
                    "style": {
                      "marginLeft": "48px",
                      "backgroundColor": "#ffffff",
                      "padding": "24px",
                      "borderRadius": "8px",
                      "border": "1px solid #E9E9E9",
                      "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)"
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "2015",
                        "className": "timeline-year",
                        "style": {
                          "backgroundColor": "rgba(210, 239, 154, 0.1)",
                          "color": "#D2EF9A",
                          "fontSize": "12px",
                          "fontWeight": "700",
                          "padding": "4px 8px",
                          "borderRadius": "4px",
                          "display": "inline-block",
                          "marginBottom": "8px"
                        }
                      }
                    },
                    {
                      "blockName": "core/heading",
                      "attrs": {
                        "level": 3,
                        "content": "Inception",
                        "className": "timeline-item-title",
                        "style": {
                          "color": "#1F1F1F",
                          "fontSize": "20px",
                          "fontWeight": "600",
                          "marginBottom": "8px"
                        }
                      }
                    },
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "Founded in TinJin with a dedicated focus on plush manufacturing and trendy accessories.",
                        "className": "timeline-item-description",
                        "style": {
                          "color": "#696C70",
                          "fontSize": "14px",
                          "lineHeight": "1.6"
                        }
                      }
                    }
                  ]
                }
              ]
            },
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "timeline-item",
                "style": {
                  "marginBottom": "48px",
                  "position": "relative"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "timeline-dot",
                    "style": {
                      "position": "absolute",
                      "left": "16px",
                      "top": "24px",
                      "width": "16px",
                      "height": "16px",
                      "borderRadius": "50%",
                      "backgroundColor": "#D2EF9A",
                      "border": "4px solid #ffffff",
                      "boxShadow": "0 1px 3px rgba(0, 0, 0, 0.1)",
                      "transform": "translateX(-50%)"
                    }
                  }
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "timeline-content",
                    "style": {
                      "marginLeft": "48px",
                      "backgroundColor": "#ffffff",
                      "padding": "24px",
                      "borderRadius": "8px",
                      "border": "1px solid #E9E9E9",
                      "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)"
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "2018",
                        "className": "timeline-year",
                        "style": {
                          "backgroundColor": "rgba(210, 239, 154, 0.1)",
                          "color": "#D2EF9A",
                          "fontSize": "12px",
                          "fontWeight": "700",
                          "padding": "4px 8px",
                          "borderRadius": "4px",
                          "display": "inline-block",
                          "marginBottom": "8px"
                        }
                      }
                    },
                    {
                      "blockName": "core/heading",
                      "attrs": {
                        "level": 3,
                        "content": "Global Standards",
                        "className": "timeline-item-title",
                        "style": {
                          "color": "#1F1F1F",
                          "fontSize": "20px",
                          "fontWeight": "600",
                          "marginBottom": "8px"
                        }
                      }
                    },
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "Achieved BSCI and Sedex audits, officially entering the European and North American mainstream supply chain.",
                        "className": "timeline-item-description",
                        "style": {
                          "color": "#696C70",
                          "fontSize": "14px",
                          "lineHeight": "1.6"
                        }
                      }
                    }
                  ]
                }
              ]
            },
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "timeline-item",
                "style": {
                  "marginBottom": "48px",
                  "position": "relative"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "timeline-dot",
                    "style": {
                      "position": "absolute",
                      "left": "16px",
                      "top": "24px",
                      "width": "16px",
                      "height": "16px",
                      "borderRadius": "50%",
                      "backgroundColor": "#D2EF9A",
                      "border": "4px solid #ffffff",
                      "boxShadow": "0 1px 3px rgba(0, 0, 0, 0.1)",
                      "transform": "translateX(-50%)"
                    }
                  }
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "timeline-content",
                    "style": {
                      "marginLeft": "48px",
                      "backgroundColor": "#ffffff",
                      "padding": "24px",
                      "borderRadius": "8px",
                      "border": "1px solid #E9E9E9",
                      "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)"
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "2020",
                        "className": "timeline-year",
                        "style": {
                          "backgroundColor": "rgba(210, 239, 154, 0.1)",
                          "color": "#D2EF9A",
                          "fontSize": "12px",
                          "fontWeight": "700",
                          "padding": "4px 8px",
                          "borderRadius": "4px",
                          "display": "inline-block",
                          "marginBottom": "8px"
                        }
                      }
                    },
                    {
                      "blockName": "core/heading",
                      "attrs": {
                        "level": 3,
                        "content": "Design Expansion",
                        "className": "timeline-item-title",
                        "style": {
                          "color": "#1F1F1F",
                          "fontSize": "20px",
                          "fontWeight": "600",
                          "marginBottom": "8px"
                        }
                      }
                    },
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "Expanded in-house design team to 15 experts; launched our first viral blind box series.",
                        "className": "timeline-item-description",
                        "style": {
                          "color": "#696C70",
                          "fontSize": "14px",
                          "lineHeight": "1.6"
                        }
                      }
                    }
                  ]
                }
              ]
            },
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "timeline-item",
                "style": {
                  "marginBottom": "48px",
                  "position": "relative"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "timeline-dot",
                    "style": {
                      "position": "absolute",
                      "left": "16px",
                      "top": "24px",
                      "width": "16px",
                      "height": "16px",
                      "borderRadius": "50%",
                      "backgroundColor": "#D2EF9A",
                      "border": "4px solid #ffffff",
                      "boxShadow": "0 1px 3px rgba(0, 0, 0, 0.1)",
                      "transform": "translateX(-50%)"
                    }
                  }
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "timeline-content",
                    "style": {
                      "marginLeft": "48px",
                      "backgroundColor": "#ffffff",
                      "padding": "24px",
                      "borderRadius": "8px",
                      "border": "1px solid #E9E9E9",
                      "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)"
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "2022",
                        "className": "timeline-year",
                        "style": {
                          "backgroundColor": "rgba(210, 239, 154, 0.1)",
                          "color": "#D2EF9A",
                          "fontSize": "12px",
                          "fontWeight": "700",
                          "padding": "4px 8px",
                          "borderRadius": "4px",
                          "display": "inline-block",
                          "marginBottom": "8px"
                        }
                      }
                    },
                    {
                      "blockName": "core/heading",
                      "attrs": {
                        "level": 3,
                        "content": "Capacity Surge",
                        "className": "timeline-item-title",
                        "style": {
                          "color": "#1F1F1F",
                          "fontSize": "20px",
                          "fontWeight": "600",
                          "marginBottom": "8px"
                        }
                      }
                    },
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "Monthly production capacity exceeded 500,000 units; became a key supplier for Top Tier brands in Japan and Korea.",
                        "className": "timeline-item-description",
                        "style": {
                          "color": "#696C70",
                          "fontSize": "14px",
                          "lineHeight": "1.6"
                        }
                      }
                    }
                  ]
                }
              ]
            },
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "timeline-item",
                "style": {
                  "marginBottom": "0",
                  "position": "relative"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "timeline-dot",
                    "style": {
                      "position": "absolute",
                      "left": "16px",
                      "top": "24px",
                      "width": "16px",
                      "height": "16px",
                      "borderRadius": "50%",
                      "backgroundColor": "#D2EF9A",
                      "border": "4px solid #ffffff",
                      "boxShadow": "0 1px 3px rgba(0, 0, 0, 0.1)",
                      "transform": "translateX(-50%)"
                    }
                  }
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "timeline-content",
                    "style": {
                      "marginLeft": "48px",
                      "backgroundColor": "#ffffff",
                      "padding": "24px",
                      "borderRadius": "8px",
                      "border": "1px solid #E9E9E9",
                      "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)"
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "2024-2025",
                        "className": "timeline-year",
                        "style": {
                          "backgroundColor": "rgba(210, 239, 154, 0.1)",
                          "color": "#D2EF9A",
                          "fontSize": "12px",
                          "fontWeight": "700",
                          "padding": "4px 8px",
                          "borderRadius": "4px",
                          "display": "inline-block",
                          "marginBottom": "8px"
                        }
                      }
                    },
                    {
                      "blockName": "core/heading",
                      "attrs": {
                        "level": 3,
                        "content": "Global Reach",
                        "className": "timeline-item-title",
                        "style": {
                          "color": "#1F1F1F",
                          "fontSize": "20px",
                          "fontWeight": "600",
                          "marginBottom": "8px"
                        }
                      }
                    },
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "Dominating the 'Labubu-style' monster trend; successfully penetrated the high-end Middle Eastern market.",
                        "className": "timeline-item-description",
                        "style": {
                          "color": "#696C70",
                          "fontSize": "14px",
                          "lineHeight": "1.6"
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 5. Team Section

```json
{
  "blockName": "core/group",
  "attrs": {
    "tagName": "section",
    "className": "team-section",
    "style": {
      "backgroundColor": "#F7F7F7",
      "spacing": {
        "padding": {
          "top": "96px",
          "bottom": "96px"
        }
      }
    },
    "layout": {
      "type": "constrained"
    }
  },
  "innerBlocks": [
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "div",
        "className": "container team-header",
        "style": {
          "textAlign": "center",
          "marginBottom": "64px"
        }
      },
      "innerBlocks": [
        {
          "blockName": "core/heading",
          "attrs": {
            "level": 2,
            "content": "Meet The Team",
            "className": "team-title",
            "style": {
              "color": "#1F1F1F",
              "fontSize": "44px",
              "fontWeight": "600",
              "marginBottom": "16px"
            }
          }
        },
        {
          "blockName": "core/paragraph",
          "attrs": {
            "content": "The experts behind your products, dedicated to excellence in every stitch.",
            "className": "team-subtitle",
            "style": {
              "color": "#696C70",
              "fontSize": "18px",
              "maxWidth": "600px",
              "margin": "0 auto"
            }
          }
        }
      ]
    },
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "div",
        "className": "container team-grid",
        "layout": {
          "type": "grid",
          "columnCount": 4
        },
        "style": {
          "spacing": {
            "blockGap": "32px"
          }
        }
      },
      "innerBlocks": [
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "team-card",
            "style": {
              "backgroundColor": "#ffffff",
              "borderRadius": "12px",
              "overflow": "hidden",
              "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
              "transition": "all 0.3s ease"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "team-image-container",
                "style": {
                  "height": "256px",
                  "overflow": "hidden",
                  "position": "relative"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/image",
                  "attrs": {
                    "url": "https://assets.veebipop.com/images/allen-optimized.webp",
                    "alt": "General Manager",
                    "className": "team-image",
                    "style": {
                      "width": "100%",
                      "height": "100%",
                      "objectFit": "cover",
                      "objectPosition": "top",
                      "transition": "transform 0.5s ease"
                    }
                  }
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "team-overlay",
                    "style": {
                      "position": "absolute",
                      "inset": "0",
                      "background": "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                      "opacity": "0",
                      "transition": "opacity 0.3s ease",
                      "display": "flex",
                      "alignItems": "flex-end",
                      "padding": "24px"
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "With 20 years in toy manufacturing, David ensures our vision aligns with global market demands and ethical standards.",
                        "className": "team-bio",
                        "style": {
                          "color": "#ffffff",
                          "fontSize": "14px",
                          "lineHeight": "1.6",
                          "opacity": "0.9"
                        }
                      }
                    }
                  ]
                }
              ]
            },
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "team-info",
                "style": {
                  "padding": "24px",
                  "textAlign": "center",
                  "borderTop": "1px solid #E9E9E9"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/heading",
                  "attrs": {
                    "level": 3,
                    "content": "Allen",
                    "className": "team-name",
                    "style": {
                      "color": "#1F1F1F",
                      "fontSize": "20px",
                      "fontWeight": "600",
                      "marginBottom": "4px"
                    }
                  }
                },
                {
                  "blockName": "core/paragraph",
                  "attrs": {
                    "content": "General Manager",
                    "className": "team-role",
                    "style": {
                      "color": "#D2EF9A",
                      "fontSize": "14px",
                      "fontWeight": "500",
                      "textTransform": "uppercase",
                      "letterSpacing": "1px"
                    }
                  }
                }
              ]
            }
          ]
        },
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "team-card",
            "style": {
              "backgroundColor": "#ffffff",
              "borderRadius": "12px",
              "overflow": "hidden",
              "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
              "transition": "all 0.3s ease"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "team-image-container",
                "style": {
                  "height": "256px",
                  "overflow": "hidden",
                  "position": "relative"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/image",
                  "attrs": {
                    "url": "https://assets.veebipop.com/images/hong-optimized.webp",
                    "alt": "Operations Director",
                    "className": "team-image",
                    "style": {
                      "width": "100%",
                      "height": "100%",
                      "objectFit": "cover",
                      "objectPosition": "top",
                      "transition": "transform 0.5s ease"
                    }
                  }
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "team-overlay",
                    "style": {
                      "position": "absolute",
                      "inset": "0",
                      "background": "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                      "opacity": "0",
                      "transition": "opacity 0.3s ease",
                      "display": "flex",
                      "alignItems": "flex-end",
                      "padding": "24px"
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "Sarah orchestrates our 500k/month production line, ensuring precision, efficiency, and on-time delivery for every order.",
                        "className": "team-bio",
                        "style": {
                          "color": "#ffffff",
                          "fontSize": "14px",
                          "lineHeight": "1.6",
                          "opacity": "0.9"
                        }
                      }
                    }
                  ]
                }
              ]
            },
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "team-info",
                "style": {
                  "padding": "24px",
                  "textAlign": "center",
                  "borderTop": "1px solid #E9E9E9"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/heading",
                  "attrs": {
                    "level": 3,
                    "content": "Hong Li",
                    "className": "team-name",
                    "style": {
                      "color": "#1F1F1F",
                      "fontSize": "20px",
                      "fontWeight": "600",
                      "marginBottom": "4px"
                    }
                  }
                },
                {
                  "blockName": "core/paragraph",
                  "attrs": {
                    "content": "Operations Director",
                    "className": "team-role",
                    "style": {
                      "color": "#D2EF9A",
                      "fontSize": "14px",
                      "fontWeight": "500",
                      "textTransform": "uppercase",
                      "letterSpacing": "1px"
                    }
                  }
                }
              ]
            }
          ]
        },
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "team-card",
            "style": {
              "backgroundColor": "#ffffff",
              "borderRadius": "12px",
              "overflow": "hidden",
              "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
              "transition": "all 0.3s ease"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "team-image-container",
                "style": {
                  "height": "256px",
                  "overflow": "hidden",
                  "position": "relative"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/image",
                  "attrs": {
                    "url": "https://assets.veebipop.com/images/anni2-optimized.webp",
                    "alt": "Design Director",
                    "className": "team-image",
                    "style": {
                      "width": "100%",
                      "height": "100%",
                      "objectFit": "cover",
                      "objectPosition": "top",
                      "transition": "transform 0.5s ease"
                    }
                  }
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "team-overlay",
                    "style": {
                      "position": "absolute",
                      "inset": "0",
                      "background": "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                      "opacity": "0",
                      "transition": "opacity 0.3s ease",
                      "display": "flex",
                      "alignItems": "flex-end",
                      "padding": "24px"
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "Leading our creative studio, Michael bridges the gap between artistic trends and manufacturable products.",
                        "className": "team-bio",
                        "style": {
                          "color": "#ffffff",
                          "fontSize": "14px",
                          "lineHeight": "1.6",
                          "opacity": "0.9"
                        }
                      }
                    }
                  ]
                }
              ]
            },
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "team-info",
                "style": {
                  "padding": "24px",
                  "textAlign": "center",
                  "borderTop": "1px solid #E9E9E9"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/heading",
                  "attrs": {
                    "level": 3,
                    "content": "Anie",
                    "className": "team-name",
                    "style": {
                      "color": "#1F1F1F",
                      "fontSize": "20px",
                      "fontWeight": "600",
                      "marginBottom": "4px"
                    }
                  }
                },
                {
                  "blockName": "core/paragraph",
                  "attrs": {
                    "content": "Design Director",
                    "className": "team-role",
                    "style": {
                      "color": "#D2EF9A",
                      "fontSize": "14px",
                      "fontWeight": "500",
                      "textTransform": "uppercase",
                      "letterSpacing": "1px"
                    }
                  }
                }
              ]
            }
          ]
        },
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "team-card",
            "style": {
              "backgroundColor": "#ffffff",
              "borderRadius": "12px",
              "overflow": "hidden",
              "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
              "transition": "all 0.3s ease"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "team-image-container",
                "style": {
                  "height": "256px",
                  "overflow": "hidden",
                  "position": "relative"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/image",
                  "attrs": {
                    "url": "https://assets.veebipop.com/images/yang1.jpg-optimized.webp",
                    "alt": "Factory Manager",
                    "className": "team-image",
                    "style": {
                      "width": "100%",
                      "height": "100%",
                      "objectFit": "cover",
                      "objectPosition": "top",
                      "transition": "transform 0.5s ease"
                    }
                  }
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "team-overlay",
                    "style": {
                      "position": "absolute",
                      "inset": "0",
                      "background": "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                      "opacity": "0",
                      "transition": "opacity 0.3s ease",
                      "display": "flex",
                      "alignItems": "flex-end",
                      "padding": "24px"
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/paragraph",
                      "attrs": {
                        "content": "A veteran craftsman who oversees quality control and technical implementation on the factory floor.",
                        "className": "team-bio",
                        "style": {
                          "color": "#ffffff",
                          "fontSize": "14px",
                          "lineHeight": "1.6",
                          "opacity": "0.9"
                        }
                      }
                    }
                  ]
                }
              ]
            },
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "team-info",
                "style": {
                  "padding": "24px",
                  "textAlign": "center",
                  "borderTop": "1px solid #E9E9E9"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/heading",
                  "attrs": {
                    "level": 3,
                    "content": "Master Yang",
                    "className": "team-name",
                    "style": {
                      "color": "#1F1F1F",
                      "fontSize": "20px",
                      "fontWeight": "600",
                      "marginBottom": "4px"
                    }
                  }
                },
                {
                  "blockName": "core/paragraph",
                  "attrs": {
                    "content": "Factory Manager",
                    "className": "team-role",
                    "style": {
                      "color": "#D2EF9A",
                      "fontSize": "14px",
                      "fontWeight": "500",
                      "textTransform": "uppercase",
                      "letterSpacing": "1px"
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 6. Video Section

```json
{
  "blockName": "core/group",
  "attrs": {
    "tagName": "section",
    "className": "video-section",
    "style": {
      "backgroundColor": "#ffffff",
      "spacing": {
        "padding": {
          "top": "80px",
          "bottom": "80px"
        }
      },
      "textAlign": "center"
    },
    "layout": {
      "type": "constrained"
    }
  },
  "innerBlocks": [
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "div",
        "className": "container video-header",
        "style": {
          "maxWidth": "800px",
          "margin": "0 auto 48px"
        }
      },
      "innerBlocks": [
        {
          "blockName": "core/heading",
          "attrs": {
            "level": 2,
            "content": "See Our Factory in Action",
            "className": "video-title",
            "style": {
              "color": "#1F1F1F",
              "fontSize": "36px",
              "fontWeight": "600",
              "marginBottom": "32px"
            }
          }
        }
      ]
    },
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "div",
        "className": "video-container",
        "style": {
          "position": "relative",
          "width": "100%",
          "maxWidth": "384px",
          "margin": "0 auto",
          "aspectRatio": "9/16",
          "backgroundColor": "#F7F7F7",
          "borderRadius": "16px",
          "overflow": "hidden",
          "boxShadow": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          "border": "1px solid #E9E9E9"
        }
      },
      "innerBlocks": [
        {
          "blockName": "core/image",
          "attrs": {
            "url": "https://assets.veebipop.com/images/image (1)-optimized.webp",
            "alt": "Video Thumbnail",
            "className": "video-thumbnail",
            "style": {
              "position": "absolute",
              "inset": "0",
              "width": "100%",
              "height": "100%",
              "objectFit": "cover",
              "opacity": "0.6"
            }
          }
        },
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "video-play-button",
            "style": {
              "position": "absolute",
              "top": "50%",
              "left": "50%",
              "transform": "translate(-50%, -50%)",
              "width": "80px",
              "height": "80px",
              "backgroundColor": "rgba(210, 239, 154, 0.8)",
              "backdropFilter": "blur(4px)",
              "borderRadius": "50%",
              "display": "flex",
              "alignItems": "center",
              "justifyContent": "center",
              "cursor": "pointer",
              "transition": "transform 0.3s ease",
              "border": "1px solid rgba(210, 239, 154, 0.4)"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "▶",
                "className": "play-icon",
                "style": {
                  "color": "#ffffff",
                  "fontSize": "32px",
                  "marginLeft": "8px"
                }
              }
            }
          ]
        },
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "video-info",
            "style": {
              "position": "absolute",
              "bottom": "24px",
              "left": "24px",
              "right": "24px",
              "textAlign": "left"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/heading",
              "attrs": {
                "level": 3,
                "content": "Inside Veebipop",
                "className": "video-subtitle",
                "style": {
                  "color": "#D2EF9A",
                  "fontSize": "18px",
                  "fontWeight": "500",
                  "marginBottom": "4px"
                }
              }
            },
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "Take a virtual tour of our production line",
                "className": "video-description",
                "style": {
                  "color": "#D2EF9A",
                  "fontSize": "14px"
                }
              }
            }
          ]
        },
        {
          "blockName": "core/html",
          "attrs": {
            "content": "<script>document.addEventListener('click', function(e) { if (e.target.closest('.video-play-button') || e.target.closest('.video-thumbnail')) { const container = document.querySelector('.video-container'); container.innerHTML = '<video style=\"width: 100%; height: 100%; object-fit: contain;\" controls autoplay src=\"https://assets.veebipop.com/veebipop-aboutus.mp4\">Your browser does not support video playback.</video><button onclick=\"location.reload()\" style=\"position: absolute; top: 16px; right: 16px; color: white; background: rgba(0,0,0,0.5); padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; z-index: 10;\">Close</button>'; } });</script>"
          }
        }
      ]
    }
  ]
}
```

### 7. Contact Section

```json
{
  "blockName": "core/group",
  "attrs": {
    "tagName": "section",
    "id": "contact",
    "className": "contact-section",
    "style": {
      "backgroundColor": "#F7F7F7",
      "spacing": {
        "padding": {
          "top": "96px",
          "bottom": "96px"
        }
      }
    },
    "layout": {
      "type": "constrained"
    }
  },
  "innerBlocks": [
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "div",
        "className": "container contact-grid",
        "layout": {
          "type": "grid",
          "columnCount": 2
        },
        "style": {
          "spacing": {
            "blockGap": "64px"
          }
        }
      },
      "innerBlocks": [
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "contact-info"
          },
          "innerBlocks": [
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "Get In Touch",
                "className": "contact-badge",
                "style": {
                  "color": "#D2EF9A",
                  "fontSize": "14px",
                  "fontWeight": "700",
                  "letterSpacing": "1px",
                  "textTransform": "uppercase",
                  "marginBottom": "8px"
                }
              }
            },
            {
              "blockName": "core/heading",
              "attrs": {
                "level": 2,
                "content": "Let's Create Your Next Bestseller",
                "className": "contact-title",
                "style": {
                  "color": "#1F1F1F",
                  "fontSize": "44px",
                  "fontWeight": "600",
                  "marginBottom": "24px"
                }
              }
            },
            {
              "blockName": "core/paragraph",
              "attrs": {
                "content": "Ready to start your custom project? Our team is ready to provide quotes, samples, and design consultations within 24 hours.",
                "className": "contact-description",
                "style": {
                  "color": "#696C70",
                  "fontSize": "18px",
                  "lineHeight": "1.6",
                  "marginBottom": "40px"
                }
              }
            },
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "contact-items",
                "style": {
                  "display": "flex",
                  "flexDirection": "column",
                  "gap": "32px"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "contact-item",
                    "style": {
                      "display": "flex",
                      "alignItems": "flex-start",
                      "gap": "16px"
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/group",
                      "attrs": {
                        "tagName": "div",
                        "className": "contact-icon",
                        "style": {
                          "width": "48px",
                          "height": "48px",
                          "backgroundColor": "#ffffff",
                          "borderRadius": "50%",
                          "display": "flex",
                          "alignItems": "center",
                          "justifyContent": "center",
                          "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
                          "flexShrink": "0"
                        }
                      },
                      "innerBlocks": [
                        {
                          "blockName": "core/paragraph",
                          "attrs": {
                            "content": "🏢",
                            "className": "icon-building",
                            "style": {
                              "fontSize": "20px"
                            }
                          }
                        }
                      ]
                    },
                    {
                      "blockName": "core/group",
                      "attrs": {
                        "tagName": "div",
                        "className": "contact-text"
                      },
                      "innerBlocks": [
                        {
                          "blockName": "core/heading",
                          "attrs": {
                            "level": 4,
                            "content": "Company",
                            "className": "contact-item-title",
                            "style": {
                              "color": "#1F1F1F",
                              "fontSize": "16px",
                              "fontWeight": "700",
                              "marginBottom": "4px"
                            }
                          }
                        },
                        {
                          "blockName": "core/paragraph",
                          "attrs": {
                            "content": "Tianjin Caoke Information Technology Co., Ltd.",
                            "className": "contact-item-value",
                            "style": {
                              "color": "#696C70",
                              "fontSize": "16px"
                            }
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "contact-item",
                    "style": {
                      "display": "flex",
                      "alignItems": "flex-start",
                      "gap": "16px"
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/group",
                      "attrs": {
                        "tagName": "div",
                        "className": "contact-icon",
                        "style": {
                          "width": "48px",
                          "height": "48px",
                          "backgroundColor": "#ffffff",
                          "borderRadius": "50%",
                          "display": "flex",
                          "alignItems": "center",
                          "justifyContent": "center",
                          "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
                          "flexShrink": "0"
                        }
                      },
                      "innerBlocks": [
                        {
                          "blockName": "core/paragraph",
                          "attrs": {
                            "content": "📞",
                            "className": "icon-phone",
                            "style": {
                              "fontSize": "20px"
                            }
                          }
                        }
                      ]
                    },
                    {
                      "blockName": "core/group",
                      "attrs": {
                        "tagName": "div",
                        "className": "contact-text"
                      },
                      "innerBlocks": [
                        {
                          "blockName": "core/heading",
                          "attrs": {
                            "level": 4,
                            "content": "Phone / WhatsApp / WeChat",
                            "className": "contact-item-title",
                            "style": {
                              "color": "#1F1F1F",
                              "fontSize": "16px",
                              "fontWeight": "700",
                              "marginBottom": "4px"
                            }
                          }
                        },
                        {
                          "blockName": "core/paragraph",
                          "attrs": {
                            "content": "+86 13821385220",
                            "className": "contact-item-value",
                            "style": {
                              "color": "#696C70",
                              "fontSize": "16px"
                            }
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "contact-item",
                    "style": {
                      "display": "flex",
                      "alignItems": "flex-start",
                      "gap": "16px"
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/group",
                      "attrs": {
                        "tagName": "div",
                        "className": "contact-icon",
                        "style": {
                          "width": "48px",
                          "height": "48px",
                          "backgroundColor": "#ffffff",
                          "borderRadius": "50%",
                          "display": "flex",
                          "alignItems": "center",
                          "justifyContent": "center",
                          "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
                          "flexShrink": "0"
                        }
                      },
                      "innerBlocks": [
                        {
                          "blockName": "core/paragraph",
                          "attrs": {
                            "content": "✉️",
                            "className": "icon-email",
                            "style": {
                              "fontSize": "20px"
                            }
                          }
                        }
                      ]
                    },
                    {
                      "blockName": "core/group",
                      "attrs": {
                        "tagName": "div",
                        "className": "contact-text"
                      },
                      "innerBlocks": [
                        {
                          "blockName": "core/heading",
                          "attrs": {
                            "level": 4,
                            "content": "Email",
                            "className": "contact-item-title",
                            "style": {
                              "color": "#1F1F1F",
                              "fontSize": "16px",
                              "fontWeight": "700",
                              "marginBottom": "4px"
                            }
                          }
                        },
                        {
                          "blockName": "core/paragraph",
                          "attrs": {
                            "content": "sales@veebipop.com",
                            "className": "contact-item-value",
                            "style": {
                              "color": "#696C70",
                              "fontSize": "16px"
                            }
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "contact-item",
                    "style": {
                      "display": "flex",
                      "alignItems": "flex-start",
                      "gap": "16px"
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/group",
                      "attrs": {
                        "tagName": "div",
                        "className": "contact-icon",
                        "style": {
                          "width": "48px",
                          "height": "48px",
                          "backgroundColor": "#ffffff",
                          "borderRadius": "50%",
                          "display": "flex",
                          "alignItems": "center",
                          "justifyContent": "center",
                          "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
                          "flexShrink": "0"
                        }
                      },
                      "innerBlocks": [
                        {
                          "blockName": "core/paragraph",
                          "attrs": {
                            "content": "📍",
                            "className": "icon-location",
                            "style": {
                              "fontSize": "20px"
                            }
                          }
                        }
                      ]
                    },
                    {
                      "blockName": "core/group",
                      "attrs": {
                        "tagName": "div",
                        "className": "contact-text"
                      },
                      "innerBlocks": [
                        {
                          "blockName": "core/heading",
                          "attrs": {
                            "level": 4,
                            "content": "Office Address",
                            "className": "contact-item-title",
                            "style": {
                              "color": "#1F1F1F",
                              "fontSize": "16px",
                              "fontWeight": "700",
                              "marginBottom": "4px"
                            }
                          }
                        },
                        {
                          "blockName": "core/paragraph",
                          "attrs": {
                            "content": "2nd Floor, City Center Building, Xiqing District, Tianjin City, China",
                            "className": "contact-item-value",
                            "style": {
                              "color": "#696C70",
                              "fontSize": "16px",
                              "maxWidth": "256px"
                            }
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "div",
                "className": "working-hours",
                "style": {
                  "marginTop": "40px",
                  "padding": "24px",
                  "backgroundColor": "#ffffff",
                  "borderRadius": "12px",
                  "borderLeft": "4px solid #D2EF9A",
                  "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/heading",
                  "attrs": {
                    "level": 4,
                    "content": "Working Hours",
                    "className": "working-hours-title",
                    "style": {
                      "color": "#1F1F1F",
                      "fontSize": "16px",
                      "fontWeight": "700",
                      "marginBottom": "4px"
                    }
                  }
                },
                {
                  "blockName": "core/paragraph",
                  "attrs": {
                    "content": "Mon-Fri 9:00 - 18:30 (Beijing Time, GMT+8)",
                    "className": "working-hours-time",
                    "style": {
                      "color": "#696C70",
                      "fontSize": "14px"
                    }
                  }
                }
              ]
            },
            {
              "blockName": "core/button",
              "attrs": {
                "text": "Chat on WhatsApp",
                "url": "https://wa.me/8613821385220",
                "className": "whatsapp-button",
                "style": {
                  "backgroundColor": "#D2EF9A",
                  "color": "#1F1F1F",
                  "padding": "12px 24px",
                  "borderRadius": "8px",
                  "fontWeight": "600",
                  "border": "none",
                  "fontSize": "16px",
                  "marginTop": "24px",
                  "display": "inline-flex",
                  "alignItems": "center",
                  "gap": "8px"
                }
              }
            }
          ]
        },
        {
          "blockName": "core/group",
          "attrs": {
            "tagName": "div",
            "className": "contact-form-container",
            "style": {
              "backgroundColor": "#ffffff",
              "padding": "32px 40px",
              "borderRadius": "16px",
              "boxShadow": "0 10px 25px rgba(0, 0, 0, 0.1)",
              "border": "1px solid #E9E9E9"
            }
          },
          "innerBlocks": [
            {
              "blockName": "core/heading",
              "attrs": {
                "level": 3,
                "content": "Send us a Message",
                "className": "form-title",
                "style": {
                  "color": "#1F1F1F",
                  "fontSize": "30px",
                  "fontWeight": "600",
                  "marginBottom": "24px"
                }
              }
            },
            {
              "blockName": "core/group",
              "attrs": {
                "tagName": "form",
                "className": "contact-form",
                "style": {
                  "display": "flex",
                  "flexDirection": "column",
                  "gap": "24px"
                }
              },
              "innerBlocks": [
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "form-row",
                    "layout": {
                      "type": "grid",
                      "columnCount": 2
                    },
                    "style": {
                      "spacing": {
                        "blockGap": "24px"
                      }
                    }
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/group",
                      "attrs": {
                        "tagName": "div",
                        "className": "form-group"
                      },
                      "innerBlocks": [
                        {
                          "blockName": "core/label",
                          "attrs": {
                            "content": "First Name",
                            "className": "form-label",
                            "style": {
                              "display": "block",
                              "fontSize": "14px",
                              "fontWeight": "500",
                              "color": "#1F1F1F",
                              "marginBottom": "8px"
                            }
                          }
                        },
                        {
                          "blockName": "core/input",
                          "attrs": {
                            "type": "text",
                            "placeholder": "John",
                            "className": "form-input",
                            "style": {
                              "width": "100%",
                              "padding": "12px 16px",
                              "borderRadius": "8px",
                              "border": "1px solid #E9E9E9",
                              "fontSize": "16px",
                              "transition": "all 0.3s ease"
                            }
                          }
                        }
                      ]
                    },
                    {
                      "blockName": "core/group",
                      "attrs": {
                        "tagName": "div",
                        "className": "form-group"
                      },
                      "innerBlocks": [
                        {
                          "blockName": "core/label",
                          "attrs": {
                            "content": "Last Name",
                            "className": "form-label",
                            "style": {
                              "display": "block",
                              "fontSize": "14px",
                              "fontWeight": "500",
                              "color": "#1F1F1F",
                              "marginBottom": "8px"
                            }
                          }
                        },
                        {
                          "blockName": "core/input",
                          "attrs": {
                            "type": "text",
                            "placeholder": "Doe",
                            "className": "form-input",
                            "style": {
                              "width": "100%",
                              "padding": "12px 16px",
                              "borderRadius": "8px",
                              "border": "1px solid #E9E9E9",
                              "fontSize": "16px",
                              "transition": "all 0.3s ease"
                            }
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "form-group"
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/label",
                      "attrs": {
                        "content": "Email Address",
                        "className": "form-label",
                        "style": {
                          "display": "block",
                          "fontSize": "14px",
                          "fontWeight": "500",
                          "color": "#1F1F1F",
                          "marginBottom": "8px"
                        }
                      }
                    },
                    {
                      "blockName": "core/input",
                      "attrs": {
                        "type": "email",
                        "placeholder": "john@company.com",
                        "className": "form-input",
                        "style": {
                          "width": "100%",
                          "padding": "12px 16px",
                          "borderRadius": "8px",
                          "border": "1px solid #E9E9E9",
                          "fontSize": "16px",
                          "transition": "all 0.3s ease"
                        }
                      }
                    }
                  ]
                },
                {
                  "blockName": "core/group",
                  "attrs": {
                    "tagName": "div",
                    "className": "form-group"
                  },
                  "innerBlocks": [
                    {
                      "blockName": "core/label",
                      "attrs": {
                        "content": "Message",
                        "className": "form-label",
                        "style": {
                          "display": "block",
                          "fontSize": "14px",
                          "fontWeight": "500",
                          "color": "#1F1F1F",
                          "marginBottom": "8px"
                        }
                      }
                    },
                    {
                      "blockName": "core/textarea",
                      "attrs": {
                        "placeholder": "Tell us about your project requirements, estimated quantity, etc.",
                        "rows": 4,
                        "className": "form-textarea",
                        "style": {
                          "width": "100%",
                          "padding": "12px 16px",
                          "borderRadius": "8px",
                          "border": "1px solid #E9E9E9",
                          "fontSize": "16px",
                          "resize": "vertical",
                          "transition": "all 0.3s ease"
                        }
                      }
                    }
                  ]
                },
                {
                  "blockName": "core/button",
                  "attrs": {
                    "text": "Send Message",
                    "className": "form-submit-button",
                    "style": {
                      "width": "100%",
                      "padding": "16px",
                      "backgroundColor": "#1F1F1F",
                      "color": "#ffffff",
                      "borderRadius": "8px",
                      "fontWeight": "700",
                      "border": "none",
                      "fontSize": "16px",
                      "cursor": "pointer",
                      "transition": "all 0.3s ease",
                      "display": "flex",
                      "alignItems": "center",
                      "justifyContent": "center",
                      "gap": "8px"
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## 完整的WordPress Gutenberg JSON模板

将以上所有部分组合在一起，形成完整的WordPress页面JSON模板：

```json
{
  "version": "2",
  "content": [
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "section",
        "className": "hero-section",
        "style": {
          "color": {
            "text": "#ffffff"
          },
          "spacing": {
            "padding": {
              "top": "0",
              "bottom": "0"
            }
          },
          "background": {
            "backgroundImage": {
              "url": "https://assets.veebipop.com/2149686863.jpg",
              "id": null,
              "source": "url"
            },
            "backgroundPosition": "center center",
            "backgroundRepeat": "no-repeat",
            "backgroundSize": "cover"
          }
        },
        "layout": {
          "type": "constrained"
        }
      },
      "innerBlocks": [
        // Hero Section内容如上所示
      ]
    },
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "section",
        "id": "story",
        "className": "about-story-section",
        "style": {
          "backgroundColor": "#ffffff",
          "spacing": {
            "padding": {
              "top": "80px",
              "bottom": "80px"
            }
          }
        },
        "layout": {
          "type": "constrained"
        }
      },
      "innerBlocks": [
        // About Story Section内容如上所示
      ]
    },
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "section",
        "className": "features-section",
        "style": {
          "backgroundColor": "#F7F7F7",
          "spacing": {
            "padding": {
              "top": "96px",
              "bottom": "96px"
            }
          }
        },
        "layout": {
          "type": "constrained"
        }
      },
      "innerBlocks": [
        // Features Grid Section内容如上所示
      ]
    },
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "section",
        "className": "timeline-section",
        "style": {
          "backgroundColor": "#ffffff",
          "spacing": {
            "padding": {
              "top": "96px",
              "bottom": "96px"
            }
          },
          "overflow": "hidden"
        },
        "layout": {
          "type": "constrained"
        }
      },
      "innerBlocks": [
        // Timeline Section内容如上所示
      ]
    },
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "section",
        "className": "team-section",
        "style": {
          "backgroundColor": "#F7F7F7",
          "spacing": {
            "padding": {
              "top": "96px",
              "bottom": "96px"
            }
          }
        },
        "layout": {
          "type": "constrained"
        }
      },
      "innerBlocks": [
        // Team Section内容如上所示
      ]
    },
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "section",
        "className": "video-section",
        "style": {
          "backgroundColor": "#ffffff",
          "spacing": {
            "padding": {
              "top": "80px",
              "bottom": "80px"
            }
          },
          "textAlign": "center"
        },
        "layout": {
          "type": "constrained"
        }
      },
      "innerBlocks": [
        // Video Section内容如上所示
      ]
    },
    {
      "blockName": "core/group",
      "attrs": {
        "tagName": "section",
        "id": "contact",
        "className": "contact-section",
        "style": {
          "backgroundColor": "#F7F7F7",
          "spacing": {
            "padding": {
              "top": "96px",
              "bottom": "96px"
            }
          }
        },
        "layout": {
          "type": "constrained"
        }
      },
      "innerBlocks": [
        // Contact Section内容如上所示
      ]
    }
  ]
}
```

## 使用说明

### 1. 导入到WordPress

1. 在WordPress后台中，创建新页面或编辑现有页面
2. 点击右上角的三个点，选择"代码编辑器"
3. 将完整的JSON模板粘贴到编辑器中
4. 切换回可视化编辑器查看效果

### 2. 自定义内容

- 替换所有图片URL为您自己的图片链接
- 修改联系信息为您公司的实际信息
- 调整颜色变量以匹配您的品牌色彩
- 根据需要修改文本内容

### 3. 响应式设计

模板已包含完整的响应式设计，在不同设备上都能良好显示：
- 桌面端：完整布局
- 平板端：调整网格布局
- 移动端：单列布局

### 4. 表单处理

联系表单需要额外的WordPress插件来处理提交，推荐使用：
- Contact Form 7
- WPForms
- Gravity Forms

### 5. 性能优化

- 所有图片都使用了优化后的WebP格式
- CSS样式已内联，减少HTTP请求
- 使用了现代CSS特性如Grid和Flexbox

## 注意事项

1. 确保您的WordPress主题支持Gutenberg编辑器
2. 某些高级样式可能需要额外的CSS支持
3. 视频播放功能需要JavaScript支持
4. 表单功能需要安装相应的WordPress插件

这个模板完整保留了原始About Us页面的所有内容、布局和样式，可以直接在WordPress中使用。