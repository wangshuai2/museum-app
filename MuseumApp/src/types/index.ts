// 博物馆类型定义
export interface Museum {
  id: string;
  name: string;
  level: string;
  type: string[];
  address: string;
  openTime: string;
  distance: string;
  status: 'open' | 'closed';
  image: string;
  phone?: string;
  ticketInfo?: string;
}

// 展览类型定义
export interface Exhibition {
  id: string;
  name: string;
  description: string;
  location: string;
}

// 特展类型定义
export interface SpecialExhibition {
  id: string;
  title: string;
  dateRange: string;
  description: string;
}

// 新闻类型定义
export interface News {
  id: string;
  day: string;
  month: string;
  title: string;
  type: string;
}

// 足迹类型定义
export interface Footprint {
  id: string;
  museumName: string;
  day: string;
  month: string;
  image: string;
}

// 社区帖子类型定义
export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  museumName: string;
  image: string;
  likes: number;
  comments: number;
}

// 用户类型定义
export interface User {
  id: string;
  name: string;
  avatar: string;
  visitedCount: number;
  collectionCount: number;
  postCount: number;
}

// 导航参数类型
export type RootStackParamList = {
  Main: undefined;
  Detail: { museumId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Community: undefined;
  Footprint: undefined;
  Profile: undefined;
};
