import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Museum, Exhibition, SpecialExhibition, News } from '../types';
import {
  getMuseumDetail,
  favoriteMuseum,
  unfavoriteMuseum,
  checkFavoriteStatus,
  checkInMuseum,
} from '../services/museumApi';

const COLORS = {
  primary: '#2C3E2D',
  primaryLight: '#3D4F3E',
  secondary: '#F5F1EB',
  accent: '#C9A962',
  accentLight: '#D4B978',
  textDark: '#1A1A1A',
  textMedium: '#4A4A4A',
  textLight: '#8A8A8A',
  bgWarm: '#FAF8F5',
  border: '#E8E4DE',
  error: '#E74C3C',
  success: '#4CAF50',
};

type TabType = 'exhibits' | 'special' | 'news';
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

export default function DetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<DetailScreenRouteProp>();
  const { museumId } = route.params;
  
  // 状态管理
  const [museum, setMuseum] = useState<Museum | null>(null);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [specialExhibitions, setSpecialExhibitions] = useState<SpecialExhibition[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('exhibits');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  // 加载博物馆详情
  const loadMuseumDetail = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await getMuseumDetail(museumId);
      setMuseum(response.museum);
      setExhibitions(response.exhibitions);
      setSpecialExhibitions(response.specialExhibitions);
      setNews(response.news);
      
      // 检查收藏状态
      try {
        const favoriteStatus = await checkFavoriteStatus(museumId);
        setIsFavorite(favoriteStatus);
      } catch (err) {
        console.error('检查收藏状态失败:', err);
      }
    } catch (err) {
      setError('加载数据失败，请稍后重试');
      console.error('加载博物馆详情失败:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [museumId]);

  // 初始加载
  useEffect(() => {
    loadMuseumDetail();
  }, [loadMuseumDetail]);

  // 处理收藏
  const handleFavorite = useCallback(async () => {
    if (favoriteLoading) return;
    
    try {
      setFavoriteLoading(true);
      if (isFavorite) {
        await unfavoriteMuseum(museumId);
        setIsFavorite(false);
        Alert.alert('提示', '已取消收藏');
      } else {
        await favoriteMuseum(museumId);
        setIsFavorite(true);
        Alert.alert('提示', '收藏成功');
      }
    } catch (err) {
      Alert.alert('错误', '操作失败，请稍后重试');
      console.error('收藏操作失败:', err);
    } finally {
      setFavoriteLoading(false);
    }
  }, [isFavorite, museumId, favoriteLoading]);

  // 处理分享
  const handleShare = useCallback(async () => {
    if (!museum) return;
    
    try {
      const shareContent = {
        title: museum.name,
        message: `推荐你去参观${museum.name}！\n地址：${museum.address}\n开放时间：${museum.openTime}`,
        url: `museumapp://museum/${museumId}`,
      };
      
      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        console.log('分享成功');
      }
    } catch (err) {
      console.error('分享失败:', err);
    }
  }, [museum, museumId]);

  // 处理导航
  const handleNavigate = useCallback(() => {
    if (!museum?.address) return;
    
    // 使用地图应用导航
    const encodedAddress = encodeURIComponent(museum.address);
    const url = `geo:0,0?q=${encodedAddress}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // 回退到网页版地图
          const webUrl = `https://maps.google.com/?q=${encodedAddress}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => {
        console.error('打开地图失败:', err);
        Alert.alert('错误', '无法打开地图应用');
      });
  }, [museum]);

  // 处理打卡
  const handleCheckIn = useCallback(async () => {
    if (checkInLoading || !museum) return;
    
    try {
      setCheckInLoading(true);
      const result = await checkInMuseum(museumId);
      
      if (result.success) {
        Alert.alert(
          '打卡成功',
          result.badge ? `恭喜获得徽章：${result.badge}` : '感谢您的参观！',
          [{ text: '确定' }]
        );
      } else {
        Alert.alert('提示', result.message || '打卡失败');
      }
    } catch (err) {
      Alert.alert('错误', '打卡失败，请稍后重试');
      console.error('打卡失败:', err);
    } finally {
      setCheckInLoading(false);
    }
  }, [museumId, museum, checkInLoading]);

  // 渲染Tab内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'exhibits':
        return (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📋</Text>
              <Text style={styles.sectionTitle}>基本陈列</Text>
            </View>
            {exhibitions.length > 0 ? (
              <View style={styles.exhibitList}>
                {exhibitions.map((item, index) => (
                  <View key={item.id} style={styles.exhibitItem}>
                    <View style={styles.exhibitNumber}>
                      <Text style={styles.exhibitNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.exhibitContent}>
                      <Text style={styles.exhibitName}>{item.name}</Text>
                      <Text style={styles.exhibitDesc}>{item.description}</Text>
                      <View style={styles.exhibitLocation}>
                        <Text style={styles.locationIcon}>📍</Text>
                        <Text style={styles.locationText}>{item.location}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>暂无展览信息</Text>
            )}
          </View>
        );
      case 'special':
        return (
          <View style={styles.specialSection}>
            {specialExhibitions.length > 0 ? (
              specialExhibitions.map((item) => (
                <View key={item.id} style={styles.specialCard}>
                  <View style={styles.specialBadge}>
                    <Text style={styles.badgeIcon}>⭐</Text>
                    <Text style={styles.badgeText}>
                      {item.status === 'ongoing' ? '当前特展' : 
                       item.status === 'upcoming' ? '即将开展' : '已结束'}
                    </Text>
                  </View>
                  <Text style={styles.specialTitle}>{item.title}</Text>
                  <Text style={styles.specialDate}>{item.dateRange}</Text>
                  <Text style={styles.specialDesc}>{item.description}</Text>
                </View>
              ))
            ) : (
              <View style={styles.contentSection}>
                <Text style={styles.emptyText}>暂无特展信息</Text>
              </View>
            )}
          </View>
        );
      case 'news':
        return (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🔔</Text>
              <Text style={styles.sectionTitle}>最新消息</Text>
            </View>
            {news.length > 0 ? (
              <View style={styles.newsList}>
                {news.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.newsItem}>
                    <View style={styles.newsDate}>
                      <Text style={styles.newsDay}>{item.day}</Text>
                      <Text style={styles.newsMonth}>{item.month}</Text>
                    </View>
                    <View style={styles.newsContent}>
                      <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                      <View style={styles.newsTypeBadge}>
                        <Text style={styles.newsType}>{item.type}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>暂无消息</Text>
            )}
          </View>
        );
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  // 渲染错误状态
  if (error || !museum) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || '加载失败'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadMuseumDetail(true)}>
          <Text style={styles.retryText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadMuseumDetail(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header Image */}
        <View style={styles.headerImage}>
          <Image
            source={{ uri: museum.image }}
            style={styles.headerImg}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={handleFavorite}
              disabled={favoriteLoading}
            >
              <Text style={[styles.actionIcon, isFavorite && styles.actionIconActive]}>
                {isFavorite ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={handleShare}
            >
              <Text style={styles.actionIcon}>↗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.museumTitle}>{museum.name}</Text>
          <View style={styles.museumTags}>
            <View style={styles.tagLevel}>
              <Text style={styles.tagLevelText}>{museum.level}</Text>
            </View>
            {museum.type?.map((type, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{type}</Text>
              </View>
            ))}
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>地址</Text>
                <Text style={styles.infoValue}>{museum.address}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🕐</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>开放时间</Text>
                <Text style={styles.infoValue}>{museum.openTime}</Text>
              </View>
            </View>
            {museum.ticketInfo && (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🎫</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>门票信息</Text>
                  <Text style={styles.infoValue}>{museum.ticketInfo}</Text>
                </View>
              </View>
            )}
            {museum.phone && (
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📞</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>联系电话</Text>
                  <Text style={styles.infoValue}>{museum.phone}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNav}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'exhibits' && styles.tabBtnActive]}
            onPress={() => setActiveTab('exhibits')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'exhibits' && styles.tabBtnTextActive]}>
              基本陈列
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'special' && styles.tabBtnActive]}
            onPress={() => setActiveTab('special')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'special' && styles.tabBtnTextActive]}>
              特展信息
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'news' && styles.tabBtnActive]}
            onPress={() => setActiveTab('news')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'news' && styles.tabBtnTextActive]}>
              最新消息
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.actionBtnSecondary}
          onPress={handleNavigate}
        >
          <Text style={styles.actionBtnIcon}>📍</Text>
          <Text style={styles.actionBtnText}>导航</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtnPrimary, checkInLoading && styles.actionBtnDisabled]}
          onPress={handleCheckIn}
          disabled={checkInLoading}
        >
          {checkInLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Text style={styles.actionBtnIcon}>✓</Text>
              <Text style={styles.actionBtnPrimaryText}>打卡记录</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  headerImage: {
    position: 'relative',
    width: '100%',
    height: 280,
  },
  headerImg: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: COLORS.textDark,
  },
  headerActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 18,
    color: COLORS.textDark,
  },
  actionIconActive: {
    color: COLORS.error,
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 20,
    padding: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  museumTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  museumTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagLevel: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
  },
  tagLevelText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textMedium,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
    lineHeight: 20,
  },
  tabNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
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
    marginHorizontal: 16,
    marginTop: 16,
  },
  contentSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  exhibitList: {
    gap: 16,
  },
  exhibitItem: {
    flexDirection: 'row',
    gap: 12,
  },
  exhibitNumber: {
    width: 28,
    height: 28,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exhibitNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  exhibitContent: {
    flex: 1,
  },
  exhibitName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  exhibitDesc: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 20,
    marginBottom: 8,
  },
  exhibitLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.bgWarm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  locationIcon: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  specialSection: {
    gap: 16,
  },
  specialCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  specialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  specialTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  specialDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  specialDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  newsList: {
    gap: 12,
  },
  newsItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.bgWarm,
    borderRadius: 12,
  },
  newsDate: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  newsDay: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  newsMonth: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  newsContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark,
    marginBottom: 4,
    lineHeight: 20,
  },
  newsTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  newsType: {
    fontSize: 11,
    color: 'white',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: 20,
  },
  bottomSpacing: {
    height: 100,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  actionBtnDisabled: {
    opacity: 0.7,
  },
  actionBtnIcon: {
    fontSize: 16,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});
