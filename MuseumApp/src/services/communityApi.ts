import api from './api';
import type { Post, Comment } from '../types';

// API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PostListResponse {
  list: Post[];
  total: number;
  hasMore: boolean;
}

export interface CommentListResponse {
  list: Comment[];
  total: number;
}

/**
 * 获取社区帖子列表
 */
export const getCommunityPosts = async (
  page: number = 1,
  pageSize: number = 10
): Promise<PostListResponse> => {
  try {
    const response = await api.get<ApiResponse<PostListResponse>>('/community/posts', {
      params: { page, pageSize },
    });
    return response.data.data;
  } catch (error) {
    console.error('获取社区帖子失败:', error);
    // 返回模拟数据
    return {
      list: [],
      total: 0,
      hasMore: false,
    };
  }
};

/**
 * 点赞帖子
 */
export const likePost = async (postId: string): Promise<boolean> => {
  try {
    const response = await api.post<ApiResponse<{ success: boolean }>>(`/community/posts/${postId}/like`);
    return response.data.data.success;
  } catch (error) {
    console.error('点赞失败:', error);
    throw error;
  }
};

/**
 * 取消点赞
 */
export const unlikePost = async (postId: string): Promise<boolean> => {
  try {
    const response = await api.delete<ApiResponse<{ success: boolean }>>(`/community/posts/${postId}/like`);
    return response.data.data.success;
  } catch (error) {
    console.error('取消点赞失败:', error);
    throw error;
  }
};

/**
 * 添加评论
 */
export const addComment = async (postId: string, content: string): Promise<boolean> => {
  try {
    const response = await api.post<ApiResponse<{ success: boolean }>>(`/community/posts/${postId}/comments`, {
      content,
    });
    return response.data.data.success;
  } catch (error) {
    console.error('添加评论失败:', error);
    throw error;
  }
};

/**
 * 获取帖子评论
 */
export const getPostComments = async (postId: string): Promise<CommentListResponse> => {
  try {
    const response = await api.get<ApiResponse<CommentListResponse>>(`/community/posts/${postId}/comments`);
    return response.data.data;
  } catch (error) {
    console.error('获取评论失败:', error);
    return {
      list: [],
      total: 0,
    };
  }
};
