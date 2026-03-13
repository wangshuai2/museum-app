import api from './api';
import type { Museum, Exhibition, SpecialExhibition, News } from '../types';

// API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface MuseumListResponse {
  list: Museum[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface MuseumDetailResponse {
  museum: Museum;
  exhibitions: Exhibition[];
  specialExhibitions: SpecialExhibition[];
  news: News[];
}

// 筛选参数类型
export interface MuseumFilterParams {
  province?: string;
  city?: string;
  level?: string;
  type?: string;
  keyword?: string;
  sortBy?: 'distance' | 'rating' | 'visitCount';
  latitude?: number;
  longitude?: number;
}

// 分页参数类型
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 获取博物馆列表
 */
export const getMuseumList = async (
  filters: MuseumFilterParams = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 }
): Promise<MuseumListResponse> => {
  try {
    const params = {
      ...filters,
      ...pagination,
    };
    
    const response = await api.get<ApiResponse<MuseumListResponse>>('/museums', { params });
    return response.data.data;
  } catch (error) {
    console.error('获取博物馆列表失败:', error);
    throw error;
  }
};

/**
 * 获取博物馆详情
 */
export const getMuseumDetail = async (museumId: string): Promise<MuseumDetailResponse> => {
  try {
    const response = await api.get<ApiResponse<MuseumDetailResponse>>(`/museums/${museumId}`);
    return response.data.data;
  } catch (error) {
    console.error('获取博物馆详情失败:', error);
    throw error;
  }
};

/**
 * 搜索博物馆
 */
export const searchMuseums = async (
  keyword: string,
  pagination: PaginationParams = { page: 1, pageSize: 10 }
): Promise<MuseumListResponse> => {
  try {
    const response = await api.get<ApiResponse<MuseumListResponse>>('/museums/search', {
      params: {
        keyword,
        ...pagination,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('搜索博物馆失败:', error);
    throw error;
  }
};

/**
 * 获取筛选选项
 */
export const getFilterOptions = async (): Promise<{
  provinces: string[];
  cities: { [key: string]: string[] };
  levels: string[];
  types: string[];
}> => {
  try {
    const response = await api.get<ApiResponse<{
      provinces: string[];
      cities: { [key: string]: string[] };
      levels: string[];
      types: string[];
    }>>('/museums/filters');
    return response.data.data;
  } catch (error) {
    console.error('获取筛选选项失败:', error);
    throw error;
  }
};

/**
 * 收藏博物馆
 */
export const favoriteMuseum = async (museumId: string): Promise<boolean> => {
  try {
    const response = await api.post<ApiResponse<{ success: boolean }>>(`/museums/${museumId}/favorite`);
    return response.data.data.success;
  } catch (error) {
    console.error('收藏博物馆失败:', error);
    throw error;
  }
};

/**
 * 取消收藏博物馆
 */
export const unfavoriteMuseum = async (museumId: string): Promise<boolean> => {
  try {
    const response = await api.delete<ApiResponse<{ success: boolean }>>(`/museums/${museumId}/favorite`);
    return response.data.data.success;
  } catch (error) {
    console.error('取消收藏博物馆失败:', error);
    throw error;
  }
};

/**
 * 检查是否已收藏
 */
export const checkFavoriteStatus = async (museumId: string): Promise<boolean> => {
  try {
    const response = await api.get<ApiResponse<{ isFavorite: boolean }>>(`/museums/${museumId}/favorite/status`);
    return response.data.data.isFavorite;
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    throw error;
  }
};

/**
 * 获取博物馆展览列表
 */
export const getMuseumExhibitions = async (museumId: string): Promise<Exhibition[]> => {
  try {
    const response = await api.get<ApiResponse<{ exhibitions: Exhibition[] }>>(`/museums/${museumId}/exhibitions`);
    return response.data.data.exhibitions;
  } catch (error) {
    console.error('获取展览列表失败:', error);
    throw error;
  }
};

/**
 * 获取博物馆特展列表
 */
export const getMuseumSpecialExhibitions = async (museumId: string): Promise<SpecialExhibition[]> => {
  try {
    const response = await api.get<ApiResponse<{ specialExhibitions: SpecialExhibition[] }>>(`/museums/${museumId}/special-exhibitions`);
    return response.data.data.specialExhibitions;
  } catch (error) {
    console.error('获取特展列表失败:', error);
    throw error;
  }
};

/**
 * 获取博物馆新闻列表
 */
export const getMuseumNews = async (museumId: string): Promise<News[]> => {
  try {
    const response = await api.get<ApiResponse<{ news: News[] }>>(`/museums/${museumId}/news`);
    return response.data.data.news;
  } catch (error) {
    console.error('获取新闻列表失败:', error);
    throw error;
  }
};

/**
 * 记录打卡
 */
export const checkInMuseum = async (museumId: string, latitude?: number, longitude?: number): Promise<{
  success: boolean;
  badge?: string;
  message: string;
}> => {
  try {
    const response = await api.post<ApiResponse<{
      success: boolean;
      badge?: string;
      message: string;
    }>>(`/museums/${museumId}/checkin`, {
      latitude,
      longitude,
    });
    return response.data.data;
  } catch (error) {
    console.error('打卡失败:', error);
    throw error;
  }
};
