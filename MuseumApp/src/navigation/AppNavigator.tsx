import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import type { RootStackParamList, MainTabParamList } from '../types';
import { COLORS } from '../constants/colors';

// 导入屏幕组件
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import CommunityScreen from '../screens/CommunityScreen';
import FootprintScreen from '../screens/FootprintScreen';
import ProfileScreen from '../screens/ProfileScreen';

// 创建导航器
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab图标映射
const TAB_ICONS: { [key: string]: string } = {
  Home: '🏛️',
  Community: '💬',
  Footprint: '👣',
  Profile: '👤',
};

// Tab标签映射
const TAB_LABELS: { [key: string]: string } = {
  Home: '首页',
  Community: '社区',
  Footprint: '足迹',
  Profile: '我的',
};

// Tab图标组件
const TabBarIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
      {TAB_ICONS[name] || '📍'}
    </Text>
  </View>
);

// Tab标签组件
const TabBarLabel = ({ name, focused }: { name: string; focused: boolean }) => (
  <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
    {TAB_LABELS[name] || name}
  </Text>
);

// 底部Tab导航
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }: { focused: boolean }) => (
          <TabBarIcon name={route.name} focused={focused} />
        ),
        tabBarLabel: ({ focused }: { focused: boolean }) => (
          <TabBarLabel name={route.name} focused={focused} />
        ),
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Footprint" component={FootprintScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// 主应用导航器
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E8E4DE',
    paddingTop: 8,
    paddingBottom: 8,
    height: 64,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default AppNavigator;
