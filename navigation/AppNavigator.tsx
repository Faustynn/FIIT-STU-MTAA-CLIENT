import { NavigationProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { useTheme, TiltNavigationEvent } from '../components/SettingsController';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '../pages/ProfilePage';
import RegistratePage from '../pages/RegistratePage';
import SettingsPage from '../pages/SettingsPage';
import SubjectDetail from '../pages/SubjectDetail';
import SubjectsPage from '../pages/SubjectsPage';
import TeacherDetail from '../pages/TeacherDetail';
import TeachersPage from '../pages/TeachersPage';

import '../utils/i18n';

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
  setIsAuthenticated?: React.Dispatch<React.SetStateAction<boolean | null>>;
};

export type AuthContextType = {
  logout: () => Promise<void>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
};

// Auto login
export const AuthContext = React.createContext<AuthContextType>({
  logout: async () => {},
  setIsAuthenticated: () => {},
});

const TabContent = ({ navigation, setIsAuthenticated }: TabContentProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [swipingDisabled, setSwipingDisabled] = useState(false);
  const { theme, gestureNavigationEnabled, gestureMode, highContrast } = useTheme();
  const isDarkMode = theme === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  const lastTabChangeTime = useRef(0);
  const { t } = useTranslation();

  // 🧠 Dynamic screen width
  const [currentWidth, setCurrentWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const onChange = ({ window }: { window: any }) => {
      setCurrentWidth(window.width);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ x: currentWidth * activeTab, animated: false });
  }, [currentWidth]);

  const tabs = [
    {
      key: 'home',
      title: t('home'),
      icon: 'home',
      component: () => <HomePage navigation={navigation} />,
    },
    {
      key: 'subjects',
      title: t('subjects'),
      icon: 'book',
      component: () => <SubjectsPage navigation={navigation} />,
    },
    {
      key: 'profile',
      title: t('profile'),
      icon: 'person',
      component: () => <ProfilePage navigation={navigation} />,
    },
    {
      key: 'teachers',
      title: t('teachers'),
      icon: 'school',
      component: () => <TeachersPage navigation={navigation} />,
    },
    {
      key: 'settings',
      title: t('settings'),
      icon: 'settings',
      component: () => (
        <SettingsPage navigation={navigation} onSwipeLockChange={setSwipingDisabled} />
      ),
    },
  ];

  const changeTab = (newIndex: number) => {
    const now = Date.now();
    const TAB_CHANGE_TIMEOUT = 300;
    if (now - lastTabChangeTime.current < TAB_CHANGE_TIMEOUT) return;

    if (newIndex >= 0 && newIndex < tabs.length) {
      setActiveTab(newIndex);
      scrollViewRef.current?.scrollTo({ x: currentWidth * newIndex, animated: true });
      lastTabChangeTime.current = now;
    }
  };

  useEffect(() => {
    const tiltListener = TiltNavigationEvent.addListener((event) => {
      if (
        event.direction !== null &&
        gestureNavigationEnabled &&
        (gestureMode === 'tilt' || gestureMode === 'both')
      ) {
        const nextTab = activeTab + event.direction;
        changeTab(nextTab);
      }
    });

    return () => {
      tiltListener();
    };
  }, [activeTab, gestureNavigationEnabled, gestureMode]);

  const handleScroll = (event: any) => {
    if (!swipingDisabled) {
      const offsetX = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / currentWidth);
      if (newIndex !== activeTab) {
        setActiveTab(newIndex);
        lastTabChangeTime.current = Date.now();
      }
    }
  };

  useEffect(() => {
    if (swipingDisabled && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: currentWidth * activeTab, animated: false });
    }
  }, [swipingDisabled, activeTab]);

  const tabBarBackgroundColor = highContrast ? '#000000' : isDarkMode ? '#1E2129' : '#F5F5F5';

  const activeTabColor = highContrast ? '#FFD700' : isDarkMode ? '#79E3A5' : '#0066CC';

  const inactiveTabColor = highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '#666666';

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={32}
        style={styles.scrollView}
        scrollEnabled={!swipingDisabled}
        overScrollMode="never"
        bounces={false}>
        {tabs.map((tab, index) => (
          <View key={tab.key} style={{ width: currentWidth }}>
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
            activeOpacity={0.7}>
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
                  fontWeight: activeTab === index ? 'bold' : 'normal',
                },
              ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </GestureHandlerRootView>
  );
};

type MainTabNavigatorProps = {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
};

const MainTabNavigator = ({ setIsAuthenticated }: MainTabNavigatorProps) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main">
        {(props) => <TabContent {...props} setIsAuthenticated={setIsAuthenticated} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

type AppNavigatorProps = {
  initialRoute: 'Login' | 'Main';
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
};

const AppNavigator = ({ initialRoute, setIsAuthenticated }: AppNavigatorProps) => {
  // Authentication context value
  const authContextValue = React.useMemo(() => ({
    logout: async () => {
      // Clear auth token
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.removeItem('AUTH_TOKEN');
      setIsAuthenticated(false);
    },
    setIsAuthenticated
  }), [setIsAuthenticated]);


  return (
    <AuthContext.Provider value={authContextValue}>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="ForgotPasswordPage" component={ForgotPasswordPage} />
        <Stack.Screen name="RegistratePage" component={RegistratePage} />
        <Stack.Screen name="Main">
          {() => <MainTabNavigator setIsAuthenticated={setIsAuthenticated} />}
        </Stack.Screen>
        <Stack.Screen name="TeacherSubPage" component={TeacherDetail} />
        <Stack.Screen name="SubjectSubPage" component={SubjectDetail} />
      </Stack.Navigator>
    </AuthContext.Provider>
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


export default AppNavigator;
export { MainTabNavigator };
