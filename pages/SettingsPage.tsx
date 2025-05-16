import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, useWindowDimensions, Image, Pressable } from 'react-native';
import { H1, XStack, YStack, Text, View, Spinner, Theme, ScrollView, Card } from 'tamagui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useTheme, getFontSizeValue } from '../components/SettingsController';
import User from '../components/User';
import '../utils/i18n';
import { ComboBox } from '../components/ComboBox';

// Cash all data
const cache = {
  user: null as User | null,
  hasCheckedStorage: false as boolean,
};

type SettingsPageProps = {
  navigation: NavigationProp<any>;
  onSwipeLockChange: (enabled: boolean) => void;
};

const SettingsPage: React.FC<SettingsPageProps> = ({ navigation, onSwipeLockChange }) => {

  // states and hooks
  const { theme, toggleTheme, gestureNavigationEnabled, toggleGestureNavigation, gestureMode, setGestureMode, fontSize, setFontSize, highContrast, setHighContrast, } = useTheme();
  const isDarkMode = theme === 'dark';
  const { t, i18n } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const textSize = getFontSizeValue(fontSize);
  const [user, setUser] = useState<User | null>(() => cache.user);
  const [isLoading, setIsLoading] = useState(!cache.hasCheckedStorage);
  const [hasData, setHasData] = useState(!!cache.user);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [swipeLocked, setSwipeLocked] = useState(false);
  const isMounted = useRef(true);

  // Memoized styles
  const accentColor = isDarkMode ? '#4A88F0' : '#3378E8';
  const textColor = highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '#333333';
  const cardColor = highContrast ? '#000000' : isDarkMode ? '#222831' : '#FFFFFF';
  const labelColor = highContrast ? '#FFFFFF' : isDarkMode ? '#B8C1D1' : '#6E7582';
  const backgroundColor = highContrast ? '#000000' : isDarkMode ? '#121720' : '#F5F7FA';
  const headerTextColor = highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : accentColor;
  const subTextColor = highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '#6E7582';
  const cardShadow = isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.08)';
  const dividerColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  const switchTrackColor = { false: isDarkMode ? '#3A3F4B' : '#D1D5DB', true: accentColor };
  const switchThumbColor = isDarkMode ? '#FFFFFF' : '#FFFFFF';

  useEffect(() => {
    const fetchAndParseUser = async () => {
      // Only fetch if dont checked storage yet or it not in cache
      if (cache.hasCheckedStorage && cache.user) {
        return;
      }

      try {
        const storedUser = await User.fromStorage();
        if (storedUser) {
          setUser(storedUser);
          cache.user = storedUser; // Save to cache
          setHasData(true);
        } else {
          setHasData(false);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setHasData(false);
      } finally {
        setIsLoading(false);
        cache.hasCheckedStorage = true; // Mark as checked
      }
    };

    if (isMounted.current) {
      fetchAndParseUser();
      isMounted.current = false;
    }
  }, []);

  const languages = [
    { label: t('en_lang'), value: 'en' },
    { label: t('sk_lang'), value: 'sk' },
    { label: t('ua_lang'), value: 'ua' },
  ];

  const fontSizes = [
    { label: '8', value: '8' },
    { label: '10', value: '10' },
    { label: '12 (default)', value: '12' },
    { label: '14', value: '14' },
    { label: '16', value: '16' },
  ];

  const gestureModes = [
    { label: t('shake_only'), value: 'shake' },
    { label: t('tilt_only'), value: 'tilt' },
    { label: t('both_gestures'), value: 'both' },
  ];

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  const handleSwipeLockChange = (value: boolean) => {
    setSwipeLocked(value);
    onSwipeLockChange(value);
  };

  const handleGestureModeChange = (value: string) => {
    if (value === 'shake' || value === 'tilt' || value === 'both') {
      setGestureMode(value);
    }
  };

  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={backgroundColor}>
        <Spinner size="large" color={accentColor} />
      </YStack>
    );
  }

  const SectionHeader = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <XStack alignItems="center" space="$2" paddingVertical="$2" marginBottom="$2">
      {icon}
      <Text color={headerTextColor} fontSize={textSize + 2} fontWeight="bold">
        {title}
      </Text>
    </XStack>
  );

  const SettingItem = ({ label, icon, control, onPress, showDivider = true }: {
    label: string;
    icon: React.ReactNode;
    control: React.ReactNode;
    onPress?: () => void;
    showDivider?: boolean;
  }) => (
    <Pressable onPress={onPress}>
      <YStack>
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingVertical="$3"
        >
          <XStack alignItems="center" space="$3">
            {icon}
            <Text fontSize={textSize} color={textColor}>
              {label}
            </Text>
          </XStack>
          {control}
        </XStack>
        {showDivider && (
          <View height={1} backgroundColor={dividerColor} />
        )}
      </YStack>
    </Pressable>
  );

  return (
    <Theme name={isDarkMode ? 'dark' : 'light'}>
      {/* Header */}
      <XStack backgroundColor={backgroundColor} padding="$4" paddingTop="$6" justifyContent="space-between" alignItems="center">
        <H1 fontSize={textSize + 14} fontWeight="bold" color={headerTextColor}>
          UNIMAP
        </H1>
        <XStack alignItems="center" space="$2">
          <YStack alignItems="flex-end">
            {hasData ? (
              <>
                <Text color={subTextColor} fontSize={textSize - 4}>
                  @{user?.login}
                </Text>
                <Text color={headerTextColor} fontWeight="bold">
                  {user?.getFullName()}
                </Text>
              </>
            ) : (
              <Text color={subTextColor} fontSize={textSize - 4}>
                @{t('guest')}
              </Text>
            )}
          </YStack>
          <View
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor={isDarkMode ? '#2A2F3B' : '#CCCCCC'}
            alignItems="center"
            justifyContent="center"
            overflow="hidden">
            {hasData && user?.getAvatarBase64() ? (
              <Image
                source={{ uri: `data:image/png;base64,${user.getAvatarBase64()}` }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            ) : (
              <Text>😏</Text>
            )}
          </View>
        </XStack>
      </XStack>

      <YStack
        flex={1}
        backgroundColor={backgroundColor}
        paddingBottom="$2">

        {/* Settings content */}
        <ScrollView
          paddingTop={"$4"}
          style={[styles.container]}
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Appearance */}
          <Card
            elevate
            bordered
            animation="bouncy"
            scale={0.99}
            marginTop="$-4"
            marginHorizontal="$4"
            backgroundColor={cardColor}
            borderRadius={16}
            shadowColor={cardShadow}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.1}
            shadowRadius={12}
            paddingHorizontal="$4"
            paddingVertical="$3">

            <SectionHeader
              title={t('appearance')}
              icon={<MaterialIcons name="dark-mode" size={20} color={accentColor} />}
            />

            <SettingItem
              label={t('d_mod')}
              icon={<View width={20} />}
              control={
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={switchTrackColor}
                  thumbColor={switchThumbColor}
                  ios_backgroundColor={isDarkMode ? '#3A3F4B' : '#D1D5DB'}
                />
              }
              showDivider={false}
            />
          </Card>

          {/* Gesture Navigation */}
          <Card
            elevate
            bordered
            animation="bouncy"
            scale={0.99}
            marginTop="$4"
            marginHorizontal="$4"
            backgroundColor={cardColor}
            borderRadius={16}
            shadowColor={cardShadow}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.1}
            shadowRadius={12}
            paddingHorizontal="$4"
            paddingVertical="$3">

            <SectionHeader
              title={t('gestureNavigation')}
              icon={<MaterialIcons name="gesture" size={20} color={accentColor} />}
            />

            <SettingItem
              label={t('enableGestureNav')}
              icon={<View width={20} />}
              control={
                <Switch
                  value={gestureNavigationEnabled}
                  onValueChange={toggleGestureNavigation}
                  trackColor={switchTrackColor}
                  thumbColor={switchThumbColor}
                  ios_backgroundColor={isDarkMode ? '#3A3F4B' : '#D1D5DB'}
                />
              }
            />

            {gestureNavigationEnabled && (
              <YStack paddingVertical="$2" marginBottom="$2">
                <ComboBox
                  view={"horizontal"}
                  value={gestureMode}
                  onValueChange={handleGestureModeChange}
                  items={gestureModes}
                  placeholder={''}
                  labelColor={labelColor}
                  textColor={textColor}
                />
              </YStack>
            )}

            <SettingItem
              label={t('disableSwipe')}
              icon={<View width={20} />}
              control={
                <Switch
                  value={swipeLocked}
                  onValueChange={handleSwipeLockChange}
                  trackColor={switchTrackColor}
                  thumbColor={switchThumbColor}
                  ios_backgroundColor={isDarkMode ? '#3A3F4B' : '#D1D5DB'}
                />
              }
              showDivider={false}
            />
          </Card>

          {/* Notifications */}
          <Card
            elevate
            bordered
            animation="bouncy"
            scale={0.99}
            marginTop="$4"
            marginHorizontal="$4"
            backgroundColor={cardColor}
            borderRadius={16}
            shadowColor={cardShadow}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.1}
            shadowRadius={12}
            paddingHorizontal="$4"
            paddingVertical="$3">

            <SectionHeader
              title={t('notification')}
              icon={<MaterialIcons name="notifications" size={20} color={accentColor} />}
            />

            <SettingItem
              label={t('en_not')}
              icon={<View width={20} />}
              control={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={switchTrackColor}
                  thumbColor={switchThumbColor}
                  ios_backgroundColor={isDarkMode ? '#3A3F4B' : '#D1D5DB'}
                />
              }
            />

            <SettingItem
              label={t('s_not')}
              icon={<View width={20} />}
              control={
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={switchTrackColor}
                  thumbColor={switchThumbColor}
                  ios_backgroundColor={isDarkMode ? '#3A3F4B' : '#D1D5DB'}
                />
              }
              showDivider={false}
            />
          </Card>

          {/* Language */}
          <Card
            elevate
            bordered
            animation="bouncy"
            scale={0.99}
            marginTop="$4"
            marginHorizontal="$4"
            backgroundColor={cardColor}
            borderRadius={16}
            shadowColor={cardShadow}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.1}
            shadowRadius={12}
            paddingHorizontal="$4"
            paddingVertical="$3">

            <SectionHeader
              title={t('language')}
              icon={<MaterialIcons name="language" size={20} color={accentColor} />}
            />

            <YStack paddingVertical="$2">
              <ComboBox
                view={"horizontal"}
                value={language}
                onValueChange={handleLanguageChange}
                items={languages}
                placeholder={t('select_language')}
                labelColor={labelColor}
                textColor={textColor}
              />
            </YStack>
          </Card>

          {/* Display Settings */}
          <Card
            elevate
            bordered
            animation="bouncy"
            scale={0.99}
            marginTop="$4"
            marginHorizontal="$4"
            backgroundColor={cardColor}
            borderRadius={16}
            shadowColor={cardShadow}
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.1}
            shadowRadius={12}
            paddingHorizontal="$4"
            paddingVertical="$3">

            <SectionHeader
              title={t('displ_sett')}
              icon={<MaterialIcons name="format-size" size={20} color={accentColor} />}
            />

            <YStack space="$4" paddingBottom="$2">
              <YStack space="$2">
                <Text color={labelColor} fontSize={textSize - 1}>
                  {t('font_s')}
                </Text>
                <ComboBox
                  view={"horizontal"}
                  value={fontSize}
                  onValueChange={setFontSize}
                  items={fontSizes}
                  placeholder={t('select_font')}
                  labelColor={labelColor}
                  textColor={textColor}
                />
              </YStack>

              <View height={1} backgroundColor={dividerColor} marginVertical="$2" />

              <SectionHeader
                title={t('contrast')}
                icon={<MaterialIcons name="visibility" size={20} color={accentColor} />}
              />

              <SettingItem
                label={t('enable_contrast')}
                icon={<View width={20} />}
                control={
                  <Switch
                    value={highContrast}
                    onValueChange={setHighContrast}
                    trackColor={switchTrackColor}
                    thumbColor={switchThumbColor}
                    ios_backgroundColor={isDarkMode ? '#3A3F4B' : '#D1D5DB'}
                  />
                }
                showDivider={false}
              />
            </YStack>
          </Card>

          {/* Version info */}
          <XStack justifyContent="center" marginTop="$6">
            <Text color={subTextColor} fontSize={textSize - 2}>
              UNIMAP v0.0.1-Betta_build
            </Text>
          </XStack>
        </ScrollView>
      </YStack>
    </Theme>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SettingsPage;