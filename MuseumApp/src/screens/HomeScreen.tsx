import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Museum, RootStackParamList } from '../types';

const filterTags = ['全部', '国家一级', '综合类', '历史类', '艺术类', '自然类', '距离最近'];

const mockMuseums: Museum[] = [
  {
    id: '1',
    name: '故宫博物院',
    level: '一级',
    type: ['综合类', '历史类'],
    address: '北京市东城区景山前街4号',
    openTime: '08:30-17:00（周一闭馆）',
    distance: '2.3km',
    status: 'open',
    image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&h=400&fit=crop',
  },
  {
    id: '2',
    name: '中国国家博物馆',
    level: '一级',
    type: ['综合类', '历史类'],
    address: '北京市东城区东长安街16号',
    openTime: '09:00-17:00（周一闭馆）',
    distance: '3.8km',
    status: 'open',
    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=400&fit=crop',
  },
  {
    id: '3',
    name: '首都博物馆',
    level: '一级',
    type: ['综合类'],
    address: '北京市西城区复兴门外大街16号',
    openTime: '09:00-17:00（周一闭馆）',
    distance: '8.5km',
    status: 'closed',
    image: 'https://images.unsplash.com/photo-1564399580075-5dfe19c205f3?w=800&h=400&fit=crop',
  },
];

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
};

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTag, setActiveTag] = useState('全部');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const renderMuseumCard = ({ item }: { item: Museum }) => (
    <TouchableOpacity
      style={styles.museumCard}
      onPress={() => navigation.navigate('Detail', { museumId: item.id })}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.museumImage} />
      <View style={styles.museumContent}>
        <View style={styles.museumHeader}>
          <Text style={styles.museumName}>{item.name}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>
        <View style={styles.museumInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>{item.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🕐</Text>
            <Text style={styles.infoText}>{item.openTime}</Text>
          </View>
        </View>
        <View style={styles.museumFooter}>
          <Text style={styles.distance}>📍 距您 {item.distance}</Text>
          <View style={[styles.statusBadge, item.status === 'open' ? styles.statusOpen : styles.statusClosed]}>
            <Text style={[styles.statusText, item.status === 'open' ? styles.statusOpenText : styles.statusClosedText]}>
              {item.status === 'open' ? '开放中' : '已闭馆'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.viewBtnText, viewMode === 'list' && styles.viewBtnTextActive]}>列表</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewBtn, viewMode === 'map' && styles.viewBtnActive]}
            onPress={() => setViewMode('map')}
          >
            <Text style={[styles.viewBtnText, viewMode === 'map' && styles.viewBtnTextActive]}>地图</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterSection}
        >
          {filterTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.filterTag, activeTag === tag && styles.filterTagActive]}
              onPress={() => setActiveTag(tag)}
            >
              <Text style={[styles.filterTagText, activeTag === tag && styles.filterTagTextActive]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Museum List */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>附近博物馆</Text>
          <FlatList
            data={mockMuseums}
            renderItem={renderMuseumCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </ScrollView>
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
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    margin: 16,
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  viewBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewBtnActive: {
    backgroundColor: 'white',
  },
  viewBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMedium,
  },
  viewBtnTextActive: {
    color: COLORS.primary,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
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