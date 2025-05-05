import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, ScrollView, Image } from "react-native";
import { useTheme } from '../components/SettingsController';
import { H1, XStack, YStack, Text, View, Select, Adapt, Sheet, Spinner } from "tamagui";
import { ChevronDown, Check } from '@tamagui/lucide-icons';
import User from "../components/User";


type ComboBoxProps = {
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  placeholder: string;
  labelColor: string;
  textColor: string;
};

const ComboBox = ({
                    value,
                    onValueChange,
                    items,
                    placeholder,
                    labelColor,
                    textColor,
                  }: ComboBoxProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disablePreventBodyScroll
    >
      <Select.Trigger
        iconAfter={ChevronDown}
        borderColor={labelColor}
        backgroundColor="transparent"
        padding="$2"
        borderRadius="$2"
        borderWidth={1}
      >
        <Select.Value color={textColor} placeholder={placeholder} />
      </Select.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet modal dismissOnSnapToBottom>
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay />
        </Sheet>
      </Adapt>

      <YStack
        style={{
          maxHeight: 0,
          position: 'static',
          top: '100%',
          marginTop: 10,
          backgroundColor: isDarkMode ? '#262A35' : '#FFFFFF',
          borderColor: isDarkMode ? '#3A3F4B' : '#CCCCCC',
          borderWidth: 1,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <Select.Content>
          <Select.ScrollUpButton
            alignItems="center"
            justifyContent="center"
            position="relative"
            width="100%"
            height="$3"
          >
            <YStack zIndex={10} />
          </Select.ScrollUpButton>

          <Select.Viewport minWidth={200}>
            <Select.Group>
              {items.map((item, i) => (
                <Select.Item
                  index={i}
                  key={item.value}
                  value={item.value}
                  style={{
                    backgroundColor: isDarkMode ? '#191c22' : '#FFFFFF',
                    color: isDarkMode ? '#FFFFFF' : '#000000',
                  }}
                >
                  <Select.ItemText color={textColor}>{item.label}</Select.ItemText>
                  <Select.ItemIndicator marginLeft="auto">
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>

          <Select.ScrollDownButton
            alignItems="center"
            justifyContent="center"
            position="relative"
            width="100%"
            height="$3"
          >
            <YStack zIndex={10} />
          </Select.ScrollDownButton>
        </Select.Content>
      </YStack>
    </Select>
  );
};




const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

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

  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  const [fontSize, setFontSize] = useState('12');
  const [contrast, setContrast] = useState('0');


  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const cardColor = isDarkMode ? '#2a2f3b' : '#F0F0F0';
  const labelColor = isDarkMode ? '#A0A7B7' : '#555555';
  const backgroundColor = isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = isDarkMode ? '#A0A7B7' : '$gray800';

  const languages = [
    { label: 'English', value: 'en' },
    { label: 'Slovak', value: 'sk' },
    { label: 'Ukrainian', value: 'uk' }
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

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor={backgroundColor}>
        <Spinner size="large" color={headerTextColor} />
      </YStack>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <XStack padding="$4" paddingTop="$6" justifyContent="space-between" alignItems="center">
        <H1 fontSize={24} fontWeight="bold" color={headerTextColor}>
          UNIMAP
        </H1>
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
      {!hasData && (
        <YStack alignItems="center" justifyContent="center" flex={1}>
          <Text color={subTextColor} fontSize={16}>
            No data found. Showing default content.
          </Text>
        </YStack>
      )}



      <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
        <Text style={[styles.settingTitle, { color: textColor }]}>Appearance</Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#374b6a' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
        <Text style={[styles.settingTitle, { color: textColor }]}>Notifications</Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>Enable Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notifications ? '#374b6a' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: textColor }]}>Sound Enabled</Text>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={soundEnabled ? '#374b6a' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
        <Text style={[styles.settingTitle, { color: textColor }]}>Language</Text>
        <YStack space="$2">
          <Text color={labelColor} fontSize={16}>Language</Text>
          <ComboBox
            value={language}
            onValueChange={setLanguage}
            items={languages}
            placeholder="Select language"
            labelColor={labelColor}
            textColor={textColor}
          />
        </YStack>
      </View>

      <View style={[styles.settingCard, { backgroundColor: cardColor }]}>
        <Text style={[styles.settingTitle, { color: textColor }]}>Display Settings</Text>

        <YStack space="$4">
          <YStack space="$2">
            <Text color={labelColor} fontSize={16}>Font Size</Text>
            <ComboBox
              value={fontSize}
              onValueChange={setFontSize}
              items={fontSizes}
              placeholder="Select font size"
              labelColor={labelColor}
              textColor={textColor}
            />
          </YStack>

          <YStack space="$2">
            <Text color={labelColor} fontSize={16}>Contrast</Text>
            <ComboBox
              value={contrast}
              onValueChange={setContrast}
              items={contrastOptions}
              placeholder="Select contrast level"
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
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
  settingDescription: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  }
});

export default SettingsPage;