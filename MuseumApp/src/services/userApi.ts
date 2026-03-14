import api from './api';
import type { User, Museum, Post } from '../types';

// API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 获取用户资料
 */
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get<ApiResponse<User>>('/user/profile');
    return response.data.data;
  } catch (error) {
    console.error('获取用户资料失败:', error);
    // 返回默认用户数据
    return {
      id: '1',
      name: '博物馆爱好者',
      avatar: 'https://via.placeholder.com/80',
      visitedCount: 0,
      collectionCount: 0,
      postCount: 0,
    };
  }
};

/**
 * 获取用户收藏列表
 */
export const getUserFavorites = async (): Promise<Museum[]> => {
  try {
    const response = await api.get<ApiResponse<{ list: Museum[] }>>('/user/favorites');
    return response.data.data.list;
  } catch (error) {
    console.error('获取用户收藏失败:', error);
    return [];
  }
};

/**
 * 获取用户帖子列表
 */
export const getUserPosts = async (): Promise<Post[]> => {
  try {
    const response = await api.get<ApiResponse<{ list: Post[] }>>('/user/posts');
    return response.data.data.list;
  } catch (error) {
    console.error('获取用户帖子失败:', error);
    return [];
  }
};

/**
 * 更新用户资料
 */
export const updateUserProfile = async (data: Partial<User>): Promise<User> => {
  try {
    const response = await api.patch<ApiResponse<User>>('/user/profile', data);
    return response.data.data;
  } catch (error) {
    console.error('更新用户资料失败:', error);
    throw error;
  }
};

/**
 * 上传用户头像
 */
export const uploadAvatar = async (imageUri: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const response = await api.post<ApiResponse<{ url: string }>>('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.url;
  } catch (error) {
    console.error('上传头像失败:', error);
    throw error;
  }
};
