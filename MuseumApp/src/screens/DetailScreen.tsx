import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Exhibition, News, SpecialExhibition } from '../types';

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

type TabType = 'exhibits' | 'special' | 'news';

const mockExhibitions: Exhibition[] = [
  {
    id: '1',
    name: '紫禁城建筑艺术展',
    description: '展示故宫建筑的历史沿革、建筑特色和修缮保护，包括太和殿、乾清宫等重要建筑的结构与装饰。',
    location: '午门展厅',
  },
  {
    id: '2',
    name: '明清宫廷文物展',
    description: '展出明清两代宫廷生活用品、礼仪用具、文玩字画等珍贵文物，展现皇家生活风貌。',
    location: '乾清宫东庑',
  },
  {
    id: '3',
    name: '陶瓷馆',
    description: '汇集历代陶瓷精品，从原始青瓷到明清官窑，系统展示中国陶瓷艺术的发展历程。',
    location: '文华殿',
  },
];

const mockSpecialExhibition: SpecialExhibition = {
  id: '1',
  title: '「千古风流」苏东坡主题特展',
  dateRange: '2026.01.15 - 2026.04.15',
  description: '汇集故宫博物院、上海博物馆、辽宁省博物馆等单位收藏的苏东坡相关文物，包括书法、绘画、碑帖、瓷器等，全方位展现苏东坡的艺术成就与人生境界。',
};

const mockNews: News[] = [
  { id: '1', day: '15', month: '3月', title: '关于清明假期开放时间的公告', type: '官方公告' },
  { id: '2', day: '10', month: '3月', title: '「紫禁城上元之夜」文化活动报名开启', type: '活动通知' },
  { id: '3', day: '05', month: '3月', title: '陶瓷馆部分展厅临时关闭维护通知', type: '闭馆通知' },
];

export default function DetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState<TabType>('exhibits');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'exhibits':
        return (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📋</Text>
              <Text style={styles.sectionTitle}>基本陈列</Text>
            </View>
            <View style={styles.exhibitList}>
              {mockExhibitions.map((item) => (
                <View key={item.id} style={styles.exhibitItem}>
                  <Text style={styles.exhibitName}>{item.name}</Text>
                  <Text style={styles.exhibitDesc}>{item.description}</Text>
                  <View style={styles.exhibitLocation}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.locationText}>{item.location}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      case 'special':
        return (
          <View style={styles.specialCard}>
            <View style={styles.specialBadge}>
              <Text style={styles.badgeIcon}>⭐</Text>
              <Text style={styles.badgeText}>当前特展</Text>
            </View>
            <Text style={styles.specialTitle}>{mockSpecialExhibition.title}</Text>
            <Text style={styles.specialDate}>{mockSpecialExhibition.dateRange}</Text>
            <Text style={styles.specialDesc}>{mockSpecialExhibition.description}</Text>
          </View>
        );
      case 'news':
        return (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🔔</Text>
              <Text style={styles.sectionTitle}>最新消息</Text>
            </View>
            <View style={styles.newsList}>
              {mockNews.map((item) => (
                <TouchableOpacity key={item.id} style={styles.newsItem}>
                  <View style={styles.newsDate}>
                    <Text style={styles.newsDay}>{item.day}</Text>
                    <Text style={styles.newsMonth}>{item.month}</Text>
                  </View>
                  <View style={styles.newsContent}>
                    <Text style={styles.newsTitle}>{item.title}</Text>
                    <Text style={styles.newsType}>{item.type}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.headerImage}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800&h=600&fit=crop' }}
            style={styles.headerImg}
          />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionIcon}>♡</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionIcon}>↗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.museumTitle}>故宫博物院</Text>
          <View style={styles.museumTags}>
            <View style={styles.tagLevel}>
              <Text style={styles.tagLevelText}>国家一级</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>综合类</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>历史类</Text>
            </View>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>地址</Text>
                <Text style={styles.infoValue}>北京市东城区景山前街4号</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🕐</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>开放时间</Text>
                <Text style={styles.infoValue}>08:30-17:00（周一闭馆，法定节假日除外）</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🎫</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>门票信息</Text>
                <Text style={styles.infoValue}>旺季60元/人，淡季40元/人（需提前预约）</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📞</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>联系电话</Text>
                <Text style={styles.infoValue}>010-85007424</Text>
              </View>
            </View>
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
        <TouchableOpacity style={styles.actionBtnSecondary}>
          <Text style={styles.actionBtnIcon}>📍</Text>
          <Text style={styles.actionBtnText}>导航</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnPrimary}>
          <Text style={styles.actionBtnIcon}>✓</Text>
          <Text style={styles.actionBtnPrimaryText}>打卡记录</Text>
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
    padding: 16,
    backgroundColor: COLORS.bgWarm,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  exhibitName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  exhibitDesc: {
    fontSize: 13,
    color: COLORS.textMedium,
    lineHeight: 20,
  },
  exhibitLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'white',
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
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark,
    marginBottom: 4,
    lineHeight: 20,
  },
  newsType: {
    fontSize: 12,
    color: COLORS.accent,
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
