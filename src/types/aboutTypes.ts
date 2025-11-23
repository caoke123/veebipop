export interface FeatureItem {
  id: number;
  title: string;
  description: string;
  iconName: string;
}

export interface MilestoneItem {
  year: string;
  title: string;
  description: string;
}

export interface TeamMember {
  role: string;
  name: string;
  bio: string;
  imagePath: string;
}

export interface CompanyInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  wechat: string;
}