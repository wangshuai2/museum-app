import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { Footprint } from '../types';
import { COLORS } from '../constants/colors';
import LazyImage from '../components/LazyImage';

const mockStats = {
  visited: 12,
  provinces: 8,
  cities: 15,
};

const mockFootprints: Footprint[] = [
  {
    id: '1',
    museumName: '故宫博物院',
    day: '15',
    month: '3月',
    image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    museumName: '中国国家博物馆',
    day: '10',
    month: '2月',
    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    museumName: '上海博物馆',
    day: '28',
    month: '1月',
    image: 'https://images.unsplash.com/photo-1564399580075-5dfe19c205f3?w=400&h=300&fit=crop',
  },
];

const visitedProvinces = ['北京', '上海', '江苏', '浙江', '陕西', '四川', '广东', '河南'];

export default function FootprintScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>我的足迹</Text>
          <TouchableOpacity style={styles.shareBtn}>
            <Text style={styles.shareIcon}>↗</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockStats.visited}</Text>
            <Text style={styles.statLabel}>已打卡</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockStats.provinces}</Text>
            <Text style={styles.statLabel}>省份</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockStats.cities}</Text>
            <Text style={styles.statLabel}>城市</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map Section */}
        <View style={styles.mapSection}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>🗺️ 打卡地图</Text>
            <View style={styles.mapLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotVisited]} />
                <Text style={styles.legendText}>已打卡</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotUnvisited]} />
                <Text style={styles.legendText}>未打卡</Text>
              </View>
            </View>
          </View>
          <View style={styles.mapContainer}>
            <View style={styles.provinceGrid}>
              {visitedProvinces.map((province) => (
                <View key={province} style={styles.provinceTag}>
                  <Text style={styles.provinceText}>{province}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.timelineSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>打卡记录</Text>
            <TouchableOpacity style={styles.filterBtn}>
              <Text style={styles.filterText}>筛选</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timeline}>
            {mockFootprints.map((item) => (
              <TouchableOpacity key={item.id} style={styles.timelineItem}>
                <View style={styles.timelineDate}>
                  <Text style={styles.dateDay}>{item.day}</Text>
                  <Text style={styles.dateMonth}>{item.month}</Text>
                </View>
                <LazyImage uri={item.image} style={styles.timelineImage} resizeMode="cover" />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineMuseum}>{item.museumName}</Text>
                  <Text style={styles.timelineMeta}>已打卡 · 获得徽章</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  shareBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 18,
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.accent,
    lineHeight: 36,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  mapSection: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  mapLegend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotVisited: {
    backgroundColor: COLORS.accent,
  },
  legendDotUnvisited: {
    backgroundColor: COLORS.border,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textMedium,
  },
  mapContainer: {
    height: 200,
    backgroundColor: COLORS.secondary,
    padding: 16,
  },
  provinceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  provinceTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  provinceText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  timelineSection: {
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.textMedium,
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  timelineDate: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    lineHeight: 28,
  },
  dateMonth: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  timelineImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  timelineContent: {
    flex: 1,
  },
  timelineMuseum: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  timelineMeta: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  bottomSpacing: {
    height: 100,
  },
});
