import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, useWindowDimensions, Image } from 'react-native';
import { H1, XStack, YStack, Text, View, Spinner, Theme, ScrollView, ZStack } from 'tamagui';

import { useTheme, getFontSizeValue } from '../components/SettingsController';
import User from '../components/User';
import '../utils/i18n';
import { ComboBox } from '../components/ComboBox';

type SettingsPageProps = {
  navigation: NavigationProp<any>;
  onSwipeLockChange: (enabled: boolean) => void;
};

const SettingsPage: React.FC<SettingsPageProps> = ({ navigation, onSwipeLockChange }) => {
  const {
    theme,
    toggleTheme,
    gestureNavigationEnabled,
    toggleGestureNavigation,
    gestureMode,
    setGestureMode,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
  } = useTheme();
  const isDarkMode = theme === 'dark';
  const { t, i18n } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const textSize = getFontSizeValue(fontSize);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [swipeLocked, setSwipeLocked] = useState(false);

  useEffect(() => {
    const fetchAndParseUser = async () => {
      try {
        const storedUser = await User.fromStorage();
        if (storedUser) {
          setUser(storedUser);
          setHasData(true);
        } else {
          setHasData(false);
        }
      } catch (error) {
        console.log('[ERROR] Error fetching user:', error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndParseUser();
  }, []);

  const textColor = highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '#000000';
  const cardColor = highContrast ? '#000000' : isDarkMode ? '#2a2f3b' : '#F0F0F0';
  const labelColor = highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '#555555';
  const backgroundColor = highContrast ? '#000000' : isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '$gray800';

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
        <Spinner size="large" color={headerTextColor} />
      </YStack>
    );
  }

  return (
    <Theme name={isDarkMode ? 'dark' : 'light'}>
      <YStack
        flex={1}
        backgroundColor={backgroundColor}
        flexDirection={isLandscape ? 'row' : 'column'}
        paddingTop="$6"
        paddingBottom="$2"
        paddingLeft={isLandscape ? 45 : '$4'}
        paddingRight={isLandscape ? 24 : '$4'}>
        <YStack flex={isLandscape ? 1 : undefined} marginRight={isLandscape ? '$4' : 0}>
          {isLandscape ? (
            <YStack alignItems="flex-start">
              <H1 fontSize={textSize + 10} fontWeight="bold" color={headerTextColor}>
                UNIMAP
              </H1>
              <YStack alignItems="center" marginTop="$4">
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
                    @guest
                  </Text>
                )}
                <View
                  width={60}
                  height={60}
                  borderRadius={30}
                  backgroundColor={isDarkMode ? '#2A2F3B' : '#CCCCCC'}
                  alignItems="center"
                  justifyContent="center"
                  marginTop="$2">
                  {hasData && user?.getAvatarBase64() ? (
                    <Image
                      source={{ uri: `data:image/png;base64,${user.getAvatarBase64()}` }}
                      style={{ width: 60, height: 60, borderRadius: 30 }}
                    />
                  ) : (
                    <Text>😏</Text>
                  )}
                </View>
              </YStack>
            </YStack>
          ) : (
            <XStack justifyContent="space-between" alignItems="center">
              <H1 fontSize={textSize + 10} fontWeight="bold" color={headerTextColor}>
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
                      @guest
                    </Text>
                  )}
                </YStack>
                <View
                  width={40}
                  height={40}
                  borderRadius={20}
                  backgroundColor={isDarkMode ? '#2A2F3B' : '#CCCCCC'}
                  alignItems="center"
                  justifyContent="center">
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
          )}
        </YStack>

        <YStack flex={isLandscape ? 3 : 1} overflow="visible">
          <ScrollView
            style={[styles.container, { backgroundColor }]}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
              <Text style={[styles.settingTitle, { fontSize: textSize + 2, color: textColor }]}>
                {t('appearance')}
              </Text>
              <View style={styles.settingRow}>
                <Text style={[{ fontSize: textSize, color: textColor }]}>{t('d_mod')}</Text>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={isDarkMode ? '#374b6a' : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
              <Text style={[styles.settingTitle, { fontSize: textSize + 2, color: textColor }]}>
                {t('gestureNavigation')}
              </Text>
              <View style={styles.settingRow}>
                <Text style={[{ fontSize: textSize, color: textColor }]}>
                  {t('enableGestureNav')}
                </Text>
                <Switch
                  value={gestureNavigationEnabled}
                  onValueChange={toggleGestureNavigation}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={gestureNavigationEnabled ? '#374b6a' : '#f4f3f4'}
                />
              </View>

              {gestureNavigationEnabled && (
                <YStack space="$2" marginTop="$2">
                  <Text color={labelColor} fontSize={textSize}>
                    {t('gestureMode')}
                  </Text>
                  <ComboBox
                    value={gestureMode}
                    onValueChange={handleGestureModeChange}
                    items={gestureModes}
                    placeholder={t('select_gesture_mode')}
                    labelColor={labelColor}
                    textColor={textColor}
                  />
                  <Text
                    style={[styles.settingNote, { fontSize: textSize - 2, color: subTextColor }]}>
                    {gestureMode === 'shake'
                      ? t('shake_note')
                      : gestureMode === 'tilt'
                        ? t('tilt_note')
                        : t('both_note')}
                  </Text>
                </YStack>
              )}

              <View style={[styles.settingRow, { marginTop: 12 }]}>
                <Text style={[{ fontSize: textSize, color: textColor }]}>{t('disableSwipe')}</Text>
                <Switch
                  value={swipeLocked}
                  onValueChange={handleSwipeLockChange}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={swipeLocked ? '#374b6a' : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
              <Text style={[styles.settingTitle, { fontSize: textSize + 2, color: textColor }]}>
                {t('notification')}
              </Text>
              <View style={styles.settingRow}>
                <Text style={[{ fontSize: textSize, color: textColor }]}>{t('en_not')}</Text>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={notifications ? '#374b6a' : '#f4f3f4'}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={[{ fontSize: textSize, color: textColor }]}>{t('s_not')}</Text>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={soundEnabled ? '#374b6a' : '#f4f3f4'}
                />
              </View>
            </View>

            <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
              <Text style={[styles.settingTitle, { fontSize: textSize + 2, color: textColor }]}>
                {t('language')}
              </Text>
              <YStack space="$2">
                <ComboBox
                  value={language}
                  onValueChange={handleLanguageChange}
                  items={languages}
                  placeholder={t('select_language')}
                  labelColor={labelColor}
                  textColor={textColor}
                />
              </YStack>
            </View>

            <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
              <Text style={[styles.settingTitle, { fontSize: textSize + 2, color: textColor }]}>
                {t('displ_sett')}
              </Text>
              <YStack space="$4">
                <YStack space="$2">
                  <Text color={labelColor} fontSize={textSize}>
                    {t('font_s')}
                  </Text>
                  <ComboBox
                    value={fontSize}
                    onValueChange={setFontSize}
                    items={fontSizes}
                    placeholder={t('select_font')}
                    labelColor={labelColor}
                    textColor={textColor}
                  />
                </YStack>
                <YStack space="$2">
                  <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
                    <Text
                      style={[styles.settingTitle, { fontSize: textSize + 2, color: textColor }]}>
                      {t('contrast')}
                    </Text>
                    <View style={styles.settingRow}>
                      <Text style={{ fontSize: textSize, color: textColor }}>
                        {t('enable_contrast')}
                      </Text>
                      <Switch
                        value={highContrast}
                        onValueChange={setHighContrast}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={highContrast ? '#374b6a' : '#f4f3f4'}
                      />
                    </View>
                  </View>
                </YStack>
              </YStack>
            </View>
          </ScrollView>
        </YStack>
      </YStack>
    </Theme>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    zIndex: 1,
  },
  settingCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    zIndex: 2,
  },
  settingTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingNote: {
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default SettingsPage;
