import { FeatureItem, MilestoneItem, TeamMember, CompanyInfo } from '@/types/aboutTypes';

export const COMPANY_INFO: CompanyInfo = {
  name: "Tianjin Caoke Information Technology Co., Ltd.",
  phone: "+86 13821385220",
  email: "sales@veebipop.com",
  address: "2nd Floor, City Center Building, Xiqing District, Tianjin City, China",
  whatsapp: "https://wa.me/8613821385220", 
  wechat: "+86 13821385220" 
};

export const FEATURES: FeatureItem[] = [
  {
    id: 1,
    title: "Original Manufacturer",
    description: "Direct from our workshop — 100% authentic, no middlemen, best price guaranteed. We control the quality from raw material to final packaging.",
    iconName: "Factory"
  },
  {
    id: 2,
    title: "Trend-Driven Design",
    description: "Our 15-person design team tracks global trends daily. We launch new, market-ready designs every 7-15 days to keep you ahead of the curve.",
    iconName: "PenTool"
  },
  {
    id: 3,
    title: "Premium Quality",
    description: "Hand-stitched details using premium plush materials. All products meet strict CE, ASTM, and CPSIA safety standards for global markets.",
    iconName: "ShieldCheck"
  },
  {
    id: 4,
    title: "Wholesale Pricing",
    description: "Factory-direct pricing that is 30-50% lower than trading companies, maximizing your profit margins without compromising quality.",
    iconName: "CircleDollarSign"
  },
  {
    id: 5,
    title: "Full Customization",
    description: "End-to-end OEM/ODM services. From initial sketch to shelf-ready product, we handle your logo, custom packaging, and IP development.",
    iconName: "Settings2"
  },
  {
    id: 6,
    title: "Global Supply Chain",
    description: "With a capacity of 500,000+ pcs/month and efficient logistics, we offer FOB Shenzhen in 15-25 days and door-to-door delivery to 50+ countries.",
    iconName: "Globe"
  }
];

export const MILESTONES: MilestoneItem[] = [
  {
    year: "2015",
    title: "Inception",
    description: "Founded in TinJin with a dedicated focus on plush manufacturing and trendy accessories."
  },
  {
    year: "2018",
    title: "Global Standards",
    description: "Achieved BSCI and Sedex audits, officially entering the European and North American mainstream supply chain."
  },
  {
    year: "2020",
    title: "Design Expansion",
    description: "Expanded in-house design team to 15 experts; launched our first viral blind box series."
  },
  {
    year: "2022",
    title: "Capacity Surge",
    description: "Monthly production capacity exceeded 500,000 units; became a key supplier for Top Tier brands in Japan and Korea."
  },
  {
    year: "2024-2025",
    title: "Global Reach",
    description: "Dominating the 'Labubu-style' monster trend; successfully penetrated the high-end Middle Eastern market."
  }
];

export const TEAM: TeamMember[] = [
  {
    role: "General Manager",
    name: "Allen",
    bio: "With 20 years in toy manufacturing, David ensures our vision aligns with global market demands and ethical standards.",
    imagePath: "https://assets.veebipop.com/images/allen-optimized.webp"
  },
  {
    role: "Operations Director",
    name: "Hong Li",
    bio: "Sarah orchestrates our 500k/month production line, ensuring precision, efficiency, and on-time delivery for every order.",
    imagePath: "https://assets.veebipop.com/images/hong-optimized.webp"
  },
  {
    role: "Design Director",
    name: "Anie",
    bio: "Leading our creative studio, Michael bridges the gap between artistic trends and manufacturable products.",
    imagePath: "https://assets.veebipop.com/images/anni2-optimized.webp"
  },
  {
    role: "Factory Manager",
    name: "Master Yang",
    bio: "A veteran craftsman who oversees quality control and technical implementation on the factory floor.",
    imagePath: "https://assets.veebipop.com/images/yang1.jpg-optimized.webp"
  }
];