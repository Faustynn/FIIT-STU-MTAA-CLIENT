import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, ScrollView, Image } from "react-native";
import { useTheme } from '../components/SettingsController';
import { H1, XStack, YStack, Text, View, Spinner } from "tamagui";
import User from "../components/User";
import { NavigationProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import '../utils/i18n';
import { ComboBox } from "../components/ComboBox";

type SettingsPageProps = {
  navigation: NavigationProp<any>;
  onSwipeLockChange: (enabled: boolean) => void;
};

const SettingsPage: React.FC<SettingsPageProps> = ({ navigation, onSwipeLockChange }) => { const { theme, toggleTheme, gestureNavigationEnabled, toggleGestureNavigation, gestureMode, setGestureMode } = useTheme();
  const isDarkMode = theme === 'dark';
  const { t, i18n } = useTranslation();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [fontSize, setFontSize] = useState('12');
  const [contrast, setContrast] = useState('0');
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
        console.error("Error fetching user:", error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndParseUser();
  }, []);

  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const cardColor = isDarkMode ? '#2a2f3b' : '#F0F0F0';
  const labelColor = isDarkMode ? '#A0A7B7' : '#555555';
  const backgroundColor = isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = isDarkMode ? '#A0A7B7' : '$gray800';

  const languages = [
    { label: t('en_lang'), value: 'en' },
    { label: t('sk_lang'), value: 'sk' },
    { label: t('ua_lang'), value: 'ua' }
  ];

  const fontSizes = [
    { label: '8', value: '8' },
    { label: '10', value: '10' },
    { label: '12 (default)', value: '12' },
    { label: '14', value: '14' },
    { label: '16', value: '16' }
  ];

  const contrastOptions = [
    { label: '0% (default)', value: '0' },
    { label: '25%', value: '25' },
    { label: '50%', value: '50' },
    { label: '75%', value: '75' },
    { label: '100%', value: '100' }
  ];

  const gestureModes = [
    { label: t('shake_only'), value: 'shake' },
    { label: t('tilt_only'), value: 'tilt' },
    { label: t('both_gestures'), value: 'both' }
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
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor={backgroundColor}>
        <Spinner size="large" color={headerTextColor} />
      </YStack>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <XStack padding="$4" paddingTop="$6" justifyContent="space-between" alignItems="center">
        <H1 fontSize={24} fontWeight="bold" color={headerTextColor}>UNIMAP</H1>
        <XStack alignItems="center" space="$2">
          <YStack alignItems="flex-end">
            {hasData ? (
              <>
                <Text color={subTextColor} fontSize={10}>@{user?.login}</Text>
                <Text color={headerTextColor} fontWeight="bold">{user?.getFullName()}</Text>
              </>
            ) : (
              <Text color={subTextColor} fontSize={10}>@guest</Text>
            )}
          </YStack>
          <View
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor={isDarkMode ? '#2A2F3B' : '#CCCCCC'}
            alignItems="center"
            justifyContent="center"
          >
            {hasData && user?.getAvatarBase64() ? (
              <Image source={{ uri: `data:image/png;base64,${user.getAvatarBase64()}` }} style={{ width: 40, height: 40, borderRadius: 20 }} />
            ) : (
              <Text>😏</Text>
            )}
          </View>
        </XStack>
      </XStack>

      {!hasData && (
        <YStack alignItems="center" justifyContent="center" flex={1}>
          <Text color={subTextColor} fontSize={16}>{t('no_data_found')}</Text>
        </YStack>
      )}

      <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
        <Text style={[styles.settingTitle, { color: textColor }]}>{t('appearance')}</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>{t('d_mod')}</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#374b6a' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
        <Text style={[styles.settingTitle, { color: textColor }]}>{t('gestureNavigation')}</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>{t('enableGestureNav')}</Text>
          <Switch
            value={gestureNavigationEnabled}
            onValueChange={toggleGestureNavigation}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={gestureNavigationEnabled ? '#374b6a' : '#f4f3f4'}
          />
        </View>

        {gestureNavigationEnabled && (
          <YStack space="$2" marginTop="$2">
            <Text color={labelColor} fontSize={16}>{t('gestureMode')}</Text>
            <ComboBox
              value={gestureMode}
              onValueChange={handleGestureModeChange}
              items={gestureModes}
              placeholder={t('select_gesture_mode')}
              labelColor={labelColor}
              textColor={textColor}
            />
            <Text style={[styles.settingNote, { color: subTextColor }]}>
              {gestureMode === 'shake' ? t('shake_note') :
                gestureMode === 'tilt' ? t('tilt_note') :
                  t('both_note')}
            </Text>
          </YStack>
        )}

        <View style={[styles.settingRow, { marginTop: 12 }]}>
          <Text style={[styles.settingLabel, { color: textColor }]}>{t('disableSwipe')}</Text>
          <Switch
            value={swipeLocked}
            onValueChange={handleSwipeLockChange}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={swipeLocked ? '#374b6a' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
        <Text style={[styles.settingTitle, { color: textColor }]}>{t('notification')}</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>{t('en_not')}</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notifications ? '#374b6a' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>{t('s_not')}</Text>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={soundEnabled ? '#374b6a' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
        <Text style={[styles.settingTitle, { color: textColor }]}>{t('language')}</Text>
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
        <Text style={[styles.settingTitle, { color: textColor }]}>{t('displ_sett')}</Text>
        <YStack space="$4">
          <YStack space="$2">
            <Text color={labelColor} fontSize={16}>{t('font_s')}</Text>
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
            <Text color={labelColor} fontSize={16}>{t('contrast')}</Text>
            <ComboBox
              value={contrast}
              onValueChange={setContrast}
              items={contrastOptions}
              placeholder={t('select_contrast')}
              labelColor={labelColor}
              textColor={textColor}
            />
          </YStack>
        </YStack>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  settingCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  }
});

export default SettingsPage;