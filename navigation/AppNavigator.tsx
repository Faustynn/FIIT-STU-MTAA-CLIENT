import React, { useState, useRef, useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../components/SettingsController';
import HomePage from '../pages/HomePage';
import SubjectsPage from '../pages/SubjectsPage';
import ProfilePage from '../pages/ProfilePage';
import TeachersPage from '../pages/TeachersPage';
import SettingsPage from '../pages/SettingsPage';
import SubjectDetail from '../pages/SubjectDetail';
import TeacherDetail from '../pages/TeacherDetail';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationProp } from '@react-navigation/native';
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import RegistratePage from '../pages/RegistratePage';

const { width: screenWidth } = Dimensions.get('window');

export type AppStackParamList = {
  Login: undefined;
  Main: undefined;
  TeacherSubPage: { teacherId: string | number };
  SubjectSubPage: { subjectId: string | number };
  ForgotPasswordPage: undefined;
  RegistratePage: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

type TabContentProps = {
  navigation: NavigationProp<AppStackParamList>;
};

const TabContent = ({ navigation }: TabContentProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [swipingDisabled, setSwipingDisabled] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);

  const tabs = [
    { key: 'home', title: 'Home', icon: 'home', component: () => <HomePage navigation={navigation} /> },
    { key: 'subjects', title: 'Subjects', icon: 'book', component: () => <SubjectsPage navigation={navigation} /> },
    { key: 'profile', title: 'Profile', icon: 'person', component: () => <ProfilePage navigation={navigation} /> },
    { key: 'teachers', title: 'Teachers', icon: 'school', component: () => <TeachersPage navigation={navigation} /> },
    { key: 'settings', title: 'Settings', icon: 'settings', component: () => <SettingsPage navigation={navigation} onSwipeLockChange={setSwipingDisabled} /> },
  ];

  const changeTab = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < tabs.length) {
      setActiveTab(newIndex);
      scrollViewRef.current?.scrollTo({ x: screenWidth * newIndex, animated: true });
    }
  };

  const handleScroll = (event: any) => {
    if (!swipingDisabled) {
      const offsetX = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / screenWidth);

      if (newIndex !== activeTab) {
        setActiveTab(newIndex);
      }
    }
  };

  useEffect(() => {
    if (swipingDisabled && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: screenWidth * activeTab, animated: false });
    }
  }, [swipingDisabled, activeTab]);

  const tabBarBackgroundColor = isDarkMode ? '#1E2129' : '#F5F5F5';
  const activeTabColor = isDarkMode ? '#79E3A5' : '#0066CC';
  const inactiveTabColor = isDarkMode ? '#A0A7B7' : '#666666';

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        scrollEnabled={!swipingDisabled}
      >
        {tabs.map((tab, index) => (
          <View key={tab.key} style={{ width: screenWidth }}>
            <tab.component />
          </View>
        ))}
      </ScrollView>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: tabBarBackgroundColor }]}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => changeTab(index)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={tab.icon}
              size={24}
              color={activeTab === index ? activeTabColor : inactiveTabColor}
            />
            <Text
              style={[
                styles.tabItem,
                {
                  color: activeTab === index ? activeTabColor : inactiveTabColor,
                  fontWeight: activeTab === index ? 'bold' : 'normal'
                }
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </GestureHandlerRootView>
  );
};

const MainTabNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabContent} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  tabItem: {
    fontSize: 12,
    marginTop: 2,
  },
});

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="ForgotPasswordPage" component={ForgotPasswordPage} />
      <Stack.Screen name="RegistratePage" component={RegistratePage} />

      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="TeacherSubPage" component={TeacherDetail} />
      <Stack.Screen name="SubjectSubPage" component={SubjectDetail} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
export { MainTabNavigator };