// 博物馆类型定义
export interface Museum {
  id: string;
  name: string;
  level: string;
  type: string[];
  address: string;
  openTime: string;
  distance?: string;
  status: 'open' | 'closed';
  image: string;
  phone?: string;
  ticketInfo?: string;
  province?: string;
  city?: string;
  description?: string;
  rating?: number;
  visitCount?: number;
  latitude?: number;
  longitude?: number;
}

// 展览类型定义
export interface Exhibition {
  id: string;
  name: string;
  description: string;
  location: string;
  image?: string;
}

// 特展类型定义
export interface SpecialExhibition {
  id: string;
  title: string;
  dateRange: string;
  description: string;
  image?: string;
  status?: 'ongoing' | 'upcoming' | 'ended';
}

// 新闻类型定义
export interface News {
  id: string;
  day: string;
  month: string;
  title: string;
  type: string;
  content?: string;
  publishTime?: string;
}

// 足迹类型定义
export interface Footprint {
  id: string;
  museumName: string;
  day: string;
  month: string;
  image: string;
  museumId?: string;
  checkInTime?: string;
  badge?: string;
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

// API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 筛选选项类型
export interface FilterOptions {
  provinces: string[];
  cities: { [key: string]: string[] };
  levels: string[];
  types: string[];
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

// 加载状态类型
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// 错误类型
export interface ApiError {
  code: number;
  message: string;
  details?: string;
}
