import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import type { Post, Comment } from '../types';
import {
  getCommunityPosts,
  likePost,
  unlikePost,
  addComment,
  getPostComments,
} from '../services/communityApi';
import { COLORS } from '../constants/colors';
import LazyImage from '../components/LazyImage';

// 优化的图片组件 - 使用共享的LazyImage
const OptimizedImage = memo(({ uri, style }: { uri: string; style: any }) => {
  return <LazyImage uri={uri} style={style} resizeMode="cover" />;
});

// 帖子卡片组件 - 使用memo优化渲染
const PostCard = memo(({
  item,
  onLike,
  onComment,
}: {
  item: Post;
  onLike: (post: Post) => void;
  onComment: (post: Post) => void;
}) => {
  return (
    <View style={styles.postCard}>
      {/* 作者信息 */}
      <View style={styles.authorSection}>
        <OptimizedImage uri={item.authorAvatar} style={styles.authorAvatar} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{item.authorName}</Text>
          <Text style={styles.postMeta}>分享了博物馆体验</Text>
        </View>
      </View>

      {/* 帖子内容 */}
      <View style={styles.contentSection}>
        <Text style={styles.postContent}>{item.content}</Text>
        <View style={styles.museumTag}>
          <Text style={styles.museumTagIcon}>🏛️</Text>
          <Text style={styles.museumTagText}>{item.museumName}</Text>
        </View>
      </View>

      {/* 帖子图片 - 懒加载 */}
      <OptimizedImage uri={item.image} style={styles.postImage} />

      {/* 互动按钮 */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onLike(item)}
        >
          <Text
            style={[styles.actionIcon, item.isLiked && styles.actionIconActive]}
          >
            {item.isLiked ? '♥' : '♡'}
          </Text>
          <Text
            style={[styles.actionText, item.isLiked && styles.actionTextActive]}
          >
            {item.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onComment(item)}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>↗</Text>
          <Text style={styles.actionText}>分享</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function CommunityScreen() {
  // 状态管理 - 使用useMemo优化
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // 评论相关状态
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const pageSize = useMemo(() => 10, []);

  // 加载帖子列表 - 使用useCallback优化
  const loadPosts = useCallback(async (isRefresh = false) => {
    if (loading || loadingMore) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }
      setError(null);

      const currentPage = isRefresh ? 1 : page;
      const response = await getCommunityPosts(currentPage, pageSize);

      if (isRefresh || currentPage === 1) {
        setPosts(response.list);
      } else {
        setPosts((prev) => [...prev, ...response.list]);
      }

      setHasMore(response.hasMore);
      setPage(currentPage + 1);
    } catch (err) {
      setError('加载数据失败，请稍后重试');
      console.error('加载社区帖子失败:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, loading, loadingMore, pageSize]);

  // 加载更多 - 使用useCallback优化
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;

    try {
      setLoadingMore(true);
      const response = await getCommunityPosts(page, pageSize);
      setPosts((prev) => [...prev, ...response.list]);
      setHasMore(response.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error('加载更多失败:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loading, loadingMore, pageSize]);

  // 处理点赞 - 使用useCallback优化
  const handleLike = useCallback(async (post: Post) => {
    try {
      if (post.isLiked) {
        await unlikePost(post.id);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? { ...p, isLiked: false, likes: p.likes - 1 }
              : p
          )
        );
      } else {
        await likePost(post.id);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? { ...p, isLiked: true, likes: p.likes + 1 }
              : p
          )
        );
      }
    } catch (err) {
      console.error('点赞操作失败:', err);
      Alert.alert('错误', '操作失败，请稍后重试');
    }
  }, []);

  // 打开评论弹窗 - 使用useCallback优化
  const openComments = useCallback(async (post: Post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
    setCommentLoading(true);
    try {
      const response = await getPostComments(post.id);
      setComments(response.list);
    } catch (err) {
      console.error('获取评论失败:', err);
    } finally {
      setCommentLoading(false);
    }
  }, []);

  // 提交评论 - 使用useCallback优化
  const submitComment = useCallback(async () => {
    if (!selectedPost || !newComment.trim()) return;

    try {
      setCommentLoading(true);
      await addComment(selectedPost.id, newComment.trim());
      setNewComment('');
      // 刷新评论列表
      const response = await getPostComments(selectedPost.id);
      setComments(response.list);
      // 更新帖子评论数
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id ? { ...p, comments: p.comments + 1 } : p
        )
      );
    } catch (err) {
      console.error('发表评论失败:', err);
      Alert.alert('错误', '评论失败，请稍后重试');
    } finally {
      setCommentLoading(false);
    }
  }, [selectedPost, newComment]);

  // 初始加载 - 组件卸载时清理
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      if (isMounted && !loading && !loadingMore) {
        try {
          setRefreshing(true);
          setPage(1);
          setError(null);
          
          const response = await getCommunityPosts(1, pageSize);
          
          if (isMounted) {
            setPosts(response.list);
            setHasMore(response.hasMore);
            setPage(2);
          }
        } catch (err) {
          if (isMounted) {
            setError('加载数据失败，请稍后重试');
            console.error('加载社区帖子失败:', err);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      }
    };
    
    init();
    
    // 清理函数 - 组件卸载时执行
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 渲染帖子卡片 - 使用useCallback优化
  const renderPostCard = useCallback(({ item }: { item: Post }) => (
    <PostCard
      item={item}
      onLike={handleLike}
      onComment={openComments}
    />
  ), [handleLike, openComments]);

  // 渲染底部加载指示器 - 使用useMemo优化
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>加载中...</Text>
      </View>
    );
  }, [loadingMore]);

  // 渲染空状态 - 使用useMemo优化
  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyText}>{error || '暂无社区动态'}</Text>
        {error && (
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadPosts(true)}>
            <Text style={styles.retryText}>重试</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [loading, error, loadPosts]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>社区</Text>
        <Text style={styles.headerSubtitle}>分享博物馆精彩时刻</Text>
      </View>

      {/* Post List - 优化列表渲染 */}
      <FlatList
        data={posts}
        renderItem={renderPostCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPosts(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        // 性能优化配置
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: 400,
          offset: 400 * index,
          index,
        })}
      />

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCommentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>评论 ({comments.length})</Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commentsList}>
              {commentLoading ? (
                <ActivityIndicator style={styles.commentLoading} color={COLORS.primary} />
              ) : comments.length === 0 ? (
                <View style={styles.emptyComments}>
                  <Text style={styles.emptyCommentsText}>暂无评论，快来抢沙发吧~</Text>
                </View>
              ) : (
                comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <OptimizedImage uri={comment.authorAvatar} style={styles.commentAvatar} />
                    <View style={styles.commentContent}>
                      <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                      <Text style={styles.commentText}>{comment.content}</Text>
                      <Text style={styles.commentTime}>{comment.createTime}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.commentInputSection}>
              <TextInput
                style={styles.commentInput}
                placeholder="写下你的评论..."
                placeholderTextColor={COLORS.textLight}
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendBtn, !newComment.trim() && styles.sendBtnDisabled]}
                onPress={submitComment}
                disabled={!newComment.trim() || commentLoading}
              >
                {commentLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.sendBtnText}>发送</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgWarm,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
  },
  authorInfo: {
    marginLeft: 12,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  postMeta: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postContent: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 22,
    marginBottom: 12,
  },
  museumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  museumTagIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  museumTagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  postImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.secondary,
  },
  actionSection: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionIcon: {
    fontSize: 18,
    color: COLORS.textLight,
    marginRight: 6,
  },
  actionIconActive: {
    color: COLORS.error,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  actionTextActive: {
    color: COLORS.error,
    fontWeight: '500',
  },
  footerLoading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  retryText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  modalClose: {
    fontSize: 20,
    color: COLORS.textLight,
    padding: 4,
  },
  commentsList: {
    padding: 16,
    maxHeight: 400,
  },
  commentLoading: {
    marginVertical: 20,
  },
  emptyComments: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  commentInputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    fontSize: 14,
    color: COLORS.textDark,
  },
  sendBtn: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.textLight,
  },
  sendBtnText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
});
