import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { User, Museum, Post } from '../types';
import { getUserProfile, getUserFavorites, getUserPosts } from '../services/userApi';
import { COLORS } from '../constants/colors';
import LazyImage from '../components/LazyImage';

type TabType = 'profile' | 'favorites' | 'posts';

// 优化的图片组件
const MemoizedLazyImage = memo(({ uri, style }: { uri: string; style: any }) => {
  return <LazyImage uri={uri} style={style} resizeMode="cover" />;
});

// 收藏卡片组件 - 使用memo优化
const FavoriteCard = memo(({ item }: { item: Museum }) => (
  <TouchableOpacity style={styles.favoriteCard}>
    <MemoizedLazyImage uri={item.image} style={styles.favoriteImage} />
    <View style={styles.favoriteContent}>
      <Text style={styles.favoriteName}>{item.name}</Text>
      <Text style={styles.favoriteAddress}>{item.address}</Text>
      <View style={styles.favoriteTags}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{item.level}</Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'open' ? styles.statusOpen : styles.statusClosed]}>
          <Text style={[styles.statusText, item.status === 'open' ? styles.statusOpenText : styles.statusClosedText]}>
            {item.status === 'open' ? '开放中' : '已闭馆'}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
));

// 帖子卡片组件 - 使用memo优化
const PostCard = memo(({ item }: { item: Post }) => (
  <View style={styles.postCard}>
    <View style={styles.postHeader}>
      <MemoizedLazyImage uri={item.authorAvatar} style={styles.postAvatar} />
      <View style={styles.postHeaderInfo}>
        <Text style={styles.postAuthor}>{item.authorName}</Text>
        <Text style={styles.postMeta}>分享了博物馆体验</Text>
      </View>
    </View>
    <Text style={styles.postContent}>{item.content}</Text>
    <View style={styles.postMuseumTag}>
      <Text style={styles.museumTagIcon}>🏛️</Text>
      <Text style={styles.museumTagText}>{item.museumName}</Text>
    </View>
    <MemoizedLazyImage uri={item.image} style={styles.postImage} />
    <View style={styles.postActions}>
      <View style={styles.actionItem}>
        <Text style={styles.actionIcon}>♥</Text>
        <Text style={styles.actionText}>{item.likes}</Text>
      </View>
      <View style={styles.actionItem}>
        <Text style={styles.actionIcon}>💬</Text>
        <Text style={styles.actionText}>{item.comments}</Text>
      </View>
    </View>
  </View>
));

export default function ProfileScreen() {
  // 状态管理
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Museum[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // 加载用户数据 - 使用useCallback优化
  const loadUserData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // 并行加载数据以提高性能
      const [userData, favoritesData, postsData] = await Promise.all([
        getUserProfile(),
        getUserFavorites(),
        getUserPosts(),
      ]);

      setUser(userData);
      setFavorites(favoritesData);
      setPosts(postsData);
    } catch (err) {
      setError('加载数据失败，请稍后重试');
      console.error('加载用户数据失败:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 初始加载 - 组件卸载时清理
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const [userData, favoritesData, postsData] = await Promise.all([
          getUserProfile(),
          getUserFavorites(),
          getUserPosts(),
        ]);
        
        if (isMounted) {
          setUser(userData);
          setFavorites(favoritesData);
          setPosts(postsData);
        }
      } catch (err) {
        if (isMounted) {
          setError('加载数据失败，请稍后重试');
        }
        console.error('加载用户数据失败:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // 处理设置 - 使用useCallback优化
  const handleSettings = useCallback(() => {
    Alert.alert('提示', '设置功能开发中');
  }, []);

  // 处理编辑资料 - 使用useCallback优化
  const handleEditProfile = useCallback(() => {
    Alert.alert('提示', '编辑资料功能开发中');
  }, []);

  // 渲染个人信息页
  const renderProfileTab = useCallback(() => (
    <View style={styles.tabContent}>
      {/* 统计卡片 */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.visitedCount || 0}</Text>
          <Text style={styles.statLabel}>已打卡</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.collectionCount || 0}</Text>
          <Text style={styles.statLabel}>收藏</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.postCount || 0}</Text>
          <Text style={styles.statLabel}>分享</Text>
        </View>
      </View>

      {/* 功能菜单 */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveTab('favorites')}>
          <Text style={styles.menuIcon}>⭐</Text>
          <Text style={styles.menuText}>我的收藏</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveTab('posts')}>
          <Text style={styles.menuIcon}>📝</Text>
          <Text style={styles.menuText}>我的分享</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🏅</Text>
          <Text style={styles.menuText}>我的徽章</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📍</Text>
          <Text style={styles.menuText}>打卡记录</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 设置菜单 */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>设置</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>❓</Text>
          <Text style={styles.menuText}>帮助与反馈</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📢</Text>
          <Text style={styles.menuText}>关于我们</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [user, handleSettings]);

  // 渲染收藏列表
  const renderFavoritesTab = useCallback(() => (
    <View style={styles.tabContent}>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyText}>暂无收藏</Text>
          <Text style={styles.emptySubtext}>去首页发现感兴趣的博物馆吧</Text>
        </View>
      ) : (
        favorites.map((item) => <FavoriteCard key={item.id} item={item} />)
      )}
    </View>
  ), [favorites]);

  // 渲染我的分享
  const renderPostsTab = useCallback(() => (
    <View style={styles.tabContent}>
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>暂无分享</Text>
          <Text style={styles.emptySubtext}>去社区分享你的博物馆体验吧</Text>
        </View>
      ) : (
        posts.map((item) => <PostCard key={item.id} item={item} />)
      )}
    </View>
  ), [posts]);

  // 渲染加载状态
  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  // 渲染错误状态
  if (error && !user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadUserData(true)}>
          <Text style={styles.retryText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>我的</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={handleSettings}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.userInfo}>
          <MemoizedLazyImage
            uri={user?.avatar || 'https://via.placeholder.com/80'}
            style={styles.avatar}
          />
          <View style={styles.userMeta}>
            <Text style={styles.userName}>{user?.name || '用户'}</Text>
            <Text style={styles.userBio}>博物馆爱好者</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile}>
            <Text style={styles.editText}>编辑资料</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNav}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'profile' && styles.tabBtnActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'profile' && styles.tabBtnTextActive]}>
            主页
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'favorites' && styles.tabBtnActive]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'favorites' && styles.tabBtnTextActive]}>
            收藏
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'posts' && styles.tabBtnActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'posts' && styles.tabBtnTextActive]}>
            分享
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadUserData(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'favorites' && renderFavoritesTab()}
        {activeTab === 'posts' && renderPostsTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgWarm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgWarm,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgWarm,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: 16,
    textAlign: 'center',
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
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.secondary,
  },
  userMeta: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editText: {
    fontSize: 13,
    color: 'white',
  },
  tabNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: -12,
    padding: 4,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMedium,
  },
  tabBtnTextActive: {
    color: 'white',
  },
  tabContent: {
    padding: 16,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  menuSection: {
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
  },
  menuArrow: {
    fontSize: 20,
    color: COLORS.textLight,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  favoriteCard: {
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
  favoriteImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.secondary,
  },
  favoriteContent: {
    padding: 16,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  favoriteAddress: {
    fontSize: 13,
    color: COLORS.textMedium,
    marginBottom: 12,
  },
  favoriteTags: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusOpen: {
    backgroundColor: '#E8F5E9',
  },
  statusClosed: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusOpenText: {
    color: '#2E7D32',
  },
  statusClosedText: {
    color: '#C62828',
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
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  postHeaderInfo: {
    marginLeft: 12,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  postMeta: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postMuseumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
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
  postActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionIcon: {
    fontSize: 18,
    color: COLORS.textLight,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});
