import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Museum, RootStackParamList, FilterOptions } from '../types';
import { getMuseumList, getFilterOptions, searchMuseums } from '../services/museumApi';

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
};

// 筛选标签配置
const FILTER_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'level', label: '等级' },
  { key: 'type', label: '类型' },
  { key: 'province', label: '省市' },
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // 状态管理
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  // 搜索和筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeFilterCategory, setActiveFilterCategory] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    level?: string;
    type?: string;
    province?: string;
    city?: string;
  }>({});
  
  // 筛选选项
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    provinces: [],
    cities: {},
    levels: [],
    types: [],
  });

  const pageSize = 10;

  // 获取筛选选项
  const loadFilterOptions = useCallback(async () => {
    try {
      const options = await getFilterOptions();
      setFilterOptions(options);
    } catch (err) {
      console.error('获取筛选选项失败:', err);
    }
  }, []);

  // 加载博物馆列表
  const loadMuseums = useCallback(async (isRefresh = false) => {
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
      
      const response = await getMuseumList(
        {
          ...selectedFilters,
          keyword: searchKeyword || undefined,
        },
        { page: currentPage, pageSize }
      );
      
      if (isRefresh || currentPage === 1) {
        setMuseums(response.list);
      } else {
        setMuseums(prev => [...prev, ...response.list]);
      }
      
      setHasMore(response.hasMore);
      setPage(currentPage + 1);
    } catch (err) {
      setError('加载数据失败，请稍后重试');
      console.error('加载博物馆列表失败:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, selectedFilters, searchKeyword, loading, loadingMore]);

  // 加载更多
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    
    try {
      setLoadingMore(true);
      
      const response = await getMuseumList(
        {
          ...selectedFilters,
          keyword: searchKeyword || undefined,
        },
        { page, pageSize }
      );
      
      setMuseums(prev => [...prev, ...response.list]);
      setHasMore(response.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error('加载更多失败:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, selectedFilters, searchKeyword, hasMore, loading, loadingMore]);

  // 搜索处理
  const handleSearch = useCallback(async () => {
    if (!searchKeyword.trim()) {
      loadMuseums(true);
      return;
    }
    
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await searchMuseums(searchKeyword, { page: 1, pageSize });
      setMuseums(response.list);
      setHasMore(response.hasMore);
      setPage(2);
    } catch (err) {
      setError('搜索失败，请稍后重试');
      console.error('搜索失败:', err);
    } finally {
      setRefreshing(false);
    }
  }, [searchKeyword, loadMuseums]);

  // 筛选处理
  const applyFilter = useCallback((key: string, value: string | undefined) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      if (value === undefined || prev[key as keyof typeof prev] === value) {
        delete newFilters[key as keyof typeof newFilters];
      } else {
        (newFilters as any)[key] = value;
      }
      return newFilters;
    });
    // 重置页码并重新加载
    setPage(1);
    setTimeout(() => loadMuseums(true), 0);
  }, [loadMuseums]);

  // 清除所有筛选
  const clearFilters = useCallback(() => {
    setSelectedFilters({});
    setSearchKeyword('');
    setPage(1);
    setTimeout(() => loadMuseums(true), 0);
  }, [loadMuseums]);

  // 初始加载
  useEffect(() => {
    loadFilterOptions();
    loadMuseums(true);
  }, []);

  // 渲染博物馆卡片
  const renderMuseumCard = ({ item }: { item: Museum }) => (
    <TouchableOpacity
      style={styles.museumCard}
      onPress={() => navigation.navigate('Detail', { museumId: item.id })}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.museumImage}
      />
      <View style={styles.museumContent}>
        <View style={styles.museumHeader}>
          <Text style={styles.museumName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>
        <View style={styles.museumInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <Text style={styles.infoText} numberOfLines={1}>{item.openTime}</Text>
          </View>
        </View>
        <View style={styles.museumFooter}>
          {item.distance && (
            <Text style={styles.distance}>📍 距您 {item.distance}</Text>
          )}
          <View style={[styles.statusBadge, item.status === 'open' ? styles.statusOpen : styles.statusClosed]}>
            <Text style={[styles.statusText, item.status === 'open' ? styles.statusOpenText : styles.statusClosedText]}>
              {item.status === 'open' ? '开放中' : '已闭馆'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 渲染底部加载指示器
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>加载中...</Text>
      </View>
    );
  };

  // 渲染空状态
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {error || '暂无博物馆数据'}
        </Text>
        {error && (
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadMuseums(true)}>
            <Text style={styles.retryText}>重试</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // 渲染筛选弹窗
  const renderFilterModal = () => {
    let options: string[] = [];
    let currentValue: string | undefined;
    
    switch (activeFilterCategory) {
      case 'level':
        options = filterOptions.levels;
        currentValue = selectedFilters.level;
        break;
      case 'type':
        options = filterOptions.types;
        currentValue = selectedFilters.type;
        break;
      case 'province':
        options = filterOptions.provinces;
        currentValue = selectedFilters.province;
        break;
    }

    return (
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {FILTER_CATEGORIES.find(c => c.key === activeFilterCategory)?.label}
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={[styles.modalItem, !currentValue && styles.modalItemActive]}
                onPress={() => {
                  applyFilter(activeFilterCategory, undefined);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[styles.modalItemText, !currentValue && styles.modalItemTextActive]}>
                  全部
                </Text>
              </TouchableOpacity>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.modalItem, currentValue === option && styles.modalItemActive]}
                  onPress={() => {
                    applyFilter(activeFilterCategory, option);
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, currentValue === option && styles.modalItemTextActive]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>文博通</Text>
          <TouchableOpacity style={styles.locationBtn}>
            <Text style={styles.locationText}>📍 北京市</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchBar}
            placeholder="搜索博物馆、展览、藏品..."
            placeholderTextColor={COLORS.textLight}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchKeyword && (
            <TouchableOpacity onPress={() => { setSearchKeyword(''); handleSearch(); }}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tags */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterSection}
      >
        {FILTER_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.filterTag,
              activeFilterCategory === category.key && styles.filterTagActive,
            ]}
            onPress={() => {
              if (category.key === 'all') {
                clearFilters();
                setActiveFilterCategory('all');
              } else {
                setActiveFilterCategory(category.key);
                setShowFilterModal(true);
              }
            }}
          >
            <Text style={[
              styles.filterTagText,
              activeFilterCategory === category.key && styles.filterTagTextActive,
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected Filters */}
      {(selectedFilters.level || selectedFilters.type || selectedFilters.province) && (
        <View style={styles.selectedFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedFilters.level && (
              <TouchableOpacity
                style={styles.selectedFilterTag}
                onPress={() => applyFilter('level', undefined)}
              >
                <Text style={styles.selectedFilterText}>等级: {selectedFilters.level} ✕</Text>
              </TouchableOpacity>
            )}
            {selectedFilters.type && (
              <TouchableOpacity
                style={styles.selectedFilterTag}
                onPress={() => applyFilter('type', undefined)}
              >
                <Text style={styles.selectedFilterText}>类型: {selectedFilters.type} ✕</Text>
              </TouchableOpacity>
            )}
            {selectedFilters.province && (
              <TouchableOpacity
                style={styles.selectedFilterTag}
                onPress={() => applyFilter('province', undefined)}
              >
                <Text style={styles.selectedFilterText}>省市: {selectedFilters.province} ✕</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {/* Museum List */}
      <FlatList
        data={museums}
        renderItem={renderMuseumCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadMuseums(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />

      {/* Filter Modal */}
      {renderFilterModal()}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 2,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 28,
    paddingHorizontal: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textDark,
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.textLight,
    padding: 4,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.bgWarm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    marginRight: 8,
  },
  filterTagActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTagText: {
    fontSize: 13,
    color: COLORS.textMedium,
  },
  filterTagTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  selectedFilters: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectedFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedFilterText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  museumCard: {
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
  museumImage: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.secondary,
  },
  museumContent: {
    padding: 16,
  },
  museumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  museumName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginRight: 8,
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
  museumInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMedium,
  },
  museumFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  distance: {
    fontSize: 13,
    color: COLORS.textLight,
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
    maxHeight: '70%',
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
  modalList: {
    paddingVertical: 8,
  },
  modalItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemActive: {
    backgroundColor: COLORS.secondary,
  },
  modalItemText: {
    fontSize: 15,
    color: COLORS.textDark,
  },
  modalItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
