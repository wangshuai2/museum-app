import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import type { RootStackParamList, MainTabParamList } from '../types';

// 导入屏幕组件
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import FootprintScreen from '../screens/FootprintScreen';

// 创建导航器
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 颜色配置
const COLORS = {
  primary: '#2C3E2D',
  accent: '#C9A962',
  textLight: '#8A8A8A',
  bgWarm: '#FAF8F5',
};

// Tab图标组件
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: { [key: string]: string } = {
    Home: '🏛️',
    Community: '💬',
    Footprint: '👣',
    Profile: '👤',
  };
  
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
        {icons[name] || '📍'}
      </Text>
    </View>
  );
};

// Tab标签组件
const TabLabel = ({ name, focused }: { name: string; focused: boolean }) => {
  const labels: { [key: string]: string } = {
    Home: '首页',
    Community: '社区',
    Footprint: '足迹',
    Profile: '我的',
  };
  
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {labels[name] || name}
    </Text>
  );
};

// 社区页面占位
const CommunityScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>社区功能开发中...</Text>
  </View>
);

// 个人中心页面占位
const ProfileScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>个人中心开发中...</Text>
  </View>
);

// 底部Tab导航
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabel: ({ focused }) => <TabLabel name={route.name} focused={focused} />,
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
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgWarm,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
});

export default AppNavigator;
