import { NavigationProp } from '@react-navigation/native';
import { ComboBox } from 'components/ComboBox';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, useWindowDimensions } from 'react-native';
import { YStack, XStack, H1, Text, Theme, View, Input, ScrollView, Spinner, Button } from 'tamagui';

import { useTheme, getFontSizeValue } from '../components/SettingsController';
import User from '../components/User';
import { fetchSubjects, Subject } from '../services/apiService';

const SubjectsPage: React.FC<{ navigation: NavigationProp<any> }> = ({ navigation }) => {
  const { theme, fontSize, highContrast } = useTheme();
  const textSize = getFontSizeValue(fontSize);
  const isDarkMode = theme === 'dark';
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  const headerTextColor = highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '$gray800';
  const inputBackgroundColor = highContrast ? '#000000' : isDarkMode ? '#2A2F3B' : '#F5F5F5';
  const itemBackgroundColor = highContrast ? '#000000' : isDarkMode ? '#2A2F3B' : '#F5F5F5';
  const backgroundColor = highContrast ? '#000000' : isDarkMode ? '#191C22' : '$gray50';

  useEffect(() => {
    let isMounted = true;

    const fetchAndParseUser = async () => {
      try {
        const storedUser = await User.fromStorage();
        if (isMounted) {
          setUser(storedUser ?? null);
          setHasData(!!storedUser);
        }
      } catch {
        if (isMounted) setHasData(false);
      }
    };

    const loadSubjects = async () => {
      setLoading(true);

      while (isMounted) {
        try {
          const data = await fetchSubjects();
          if (isMounted) {
            setSubjects(data);
            setLoading(false);
            break; // ⬅️ Важно: прерываем цикл, если всё ок
          }
        } catch (err) {
          console.error('❌ fetchSubjects failed, retrying in 15s...');
          await new Promise((res) => setTimeout(res, 15000)); // подождать 15 секунд
        }
      }
    };

    fetchAndParseUser();
    loadSubjects();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const filtered = subjects.filter((subject) => {
      const matchesSearch =
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSemester = selectedSemester ? subject.semester === selectedSemester : true;
      const matchesType = selectedType ? subject.type === selectedType : true;
      const matchesLevel = selectedLevel ? subject.studyType === selectedLevel : true;

      return matchesSearch && matchesSemester && matchesType && matchesLevel;
    });

    setFilteredSubjects(filtered);
  }, [searchQuery, selectedSemester, selectedType, selectedLevel, subjects]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSemester('');
    setSelectedType('');
    setSelectedLevel('');
  };

  if (loading) {
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
        paddingTop="$6"
        paddingBottom="$2"
        paddingLeft={isLandscape ? 45 : '$4'}
        paddingRight={isLandscape ? 24 : '$4'}
        flexDirection={isLandscape ? 'row' : 'column'}>
        {/* Left panel */}
        <YStack>
          <XStack
            justifyContent="space-between"
            alignItems={isLandscape ? 'flex-start' : 'center'}
            flexDirection={isLandscape ? 'column' : 'row'}
            gap="$4">
            <H1
              fontSize={isLandscape ? textSize + 12 : textSize + 10}
              fontWeight="bold"
              color={headerTextColor}>
              UNIMAP
            </H1>
            {!isLandscape && (
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
                  borderRadius={30}
                  backgroundColor={isDarkMode ? '#2A2F3B' : '#CCCCCC'}
                  alignItems="center"
                  justifyContent="center">
                  {hasData && user?.getAvatarBase64() ? (
                    <Image
                      source={{ uri: `data:image/png;base64,${user.getAvatarBase64()}` }}
                      style={{ width: 40, height: 40, borderRadius: 30 }}
                    />
                  ) : (
                    <Text>😏</Text>
                  )}
                </View>
              </XStack>
            )}
          </XStack>

          {/* Search & Filters */}
          <YStack marginTop="$4" space="$4" marginBottom={isLandscape ? 48 : 8}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('search_subj')}
              placeholderTextColor={subTextColor}
              backgroundColor={inputBackgroundColor}
              borderRadius={8}
              padding="$3"
              color={headerTextColor}
            />

            <YStack space="$2">
              <Text color={subTextColor} fontSize={textSize}>
                {t('filters')}
              </Text>
              {isLandscape ? (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <XStack space="$4">
                      <ComboBox
                        value={selectedSemester}
                        onValueChange={setSelectedSemester}
                        items={[
                          { label: 'ZS', value: 'ZS' },
                          { label: 'LS', value: 'LS' },
                        ]}
                        placeholder={t('semester')}
                        labelColor={subTextColor}
                        textColor={headerTextColor}
                      />
                      <ComboBox
                        value={selectedType}
                        onValueChange={setSelectedType}
                        items={[
                          { label: 'Obligatory', value: 'Obligatory' },
                          { label: 'Optional', value: 'Optional' },
                        ]}
                        placeholder={t('subj_type')}
                        labelColor={subTextColor}
                        textColor={headerTextColor}
                      />
                      <ComboBox
                        value={selectedLevel}
                        onValueChange={setSelectedLevel}
                        items={[
                          { label: 'Bachelor', value: 'Bachelor' },
                          { label: 'Engineer', value: 'Engineer' },
                        ]}
                        placeholder={t('study_lvl')}
                        labelColor={subTextColor}
                        textColor={headerTextColor}
                      />
                    </XStack>
                  </ScrollView>
                  <Button onPress={handleClearFilters} alignSelf="flex-start" marginTop="$2">
                    {t('reset')}
                  </Button>
                </>
              ) : (
                <XStack space="$2" alignItems="center">
                  <ComboBox
                    value={selectedSemester}
                    onValueChange={setSelectedSemester}
                    items={[
                      { label: 'ZS', value: 'ZS' },
                      { label: 'LS', value: 'LS' },
                    ]}
                    placeholder={t('semester')}
                    labelColor={subTextColor}
                    textColor={headerTextColor}
                  />
                  <ComboBox
                    value={selectedType}
                    onValueChange={setSelectedType}
                    items={[
                      { label: 'Obligatory', value: 'Obligatory' },
                      { label: 'Optional', value: 'Optional' },
                    ]}
                    placeholder={t('subj_type')}
                    labelColor={subTextColor}
                    textColor={headerTextColor}
                  />
                  <ComboBox
                    value={selectedLevel}
                    onValueChange={setSelectedLevel}
                    items={[
                      { label: 'Bachelor', value: 'Bachelor' },
                      { label: 'Engineer', value: 'Engineer' },
                    ]}
                    placeholder={t('study_lvl')}
                    labelColor={subTextColor}
                    textColor={headerTextColor}
                  />
                  <Button onPress={handleClearFilters} marginLeft="$2">
                    {t('reset')}
                  </Button>
                </XStack>
              )}
            </YStack>
          </YStack>
        </YStack>

        {/* Right panel: Results */}
        <YStack flex={isLandscape ? 3 : 2}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 0,
              paddingBottom: 24,
              paddingLeft: isLandscape ? 19 : 0,
            }}>
            <YStack space="$2">
              <Text color={subTextColor} fontSize={textSize}>
                {t('result')}
              </Text>
              {loading ? (
                <YStack justifyContent="center" alignItems="center" paddingVertical="$10">
                  <Spinner size="large" color={headerTextColor} />
                  <Text color={subTextColor} marginTop="$2">
                    {t('loading')}
                  </Text>
                </YStack>
              ) : error ? (
                <YStack justifyContent="center" alignItems="center" paddingVertical="$10">
                  <Text color="$red10" fontSize={textSize}>
                    {error}
                  </Text>
                  <Text color={subTextColor} marginTop="$2">
                    {t('pull_to_refresh')}
                  </Text>
                </YStack>
              ) : filteredSubjects.length === 0 ? (
                <YStack justifyContent="center" alignItems="center" paddingVertical="$10">
                  <Text color={subTextColor} fontSize={textSize}>
                    {t('no_subjects_found')}
                  </Text>
                  {searchQuery && (
                    <Text color={subTextColor} marginTop="$2">
                      {t('adjust_search')}
                    </Text>
                  )}
                </YStack>
              ) : (
                <YStack space="$2">
                  {filteredSubjects.map((subject) => (
                    <YStack
                      key={subject.code}
                      backgroundColor={itemBackgroundColor}
                      borderRadius={8}
                      padding="$3"
                      space="$1"
                      onPress={() =>
                        navigation.navigate('SubjectSubPage', { subjectId: subject.code })
                      }>
                      <XStack justifyContent="space-between">
                        <Text color={headerTextColor} fontSize={textSize + 2} fontWeight="bold">
                          {subject.name}
                        </Text>
                        <Text color={subTextColor} fontSize={textSize - 2}>
                          {subject.code}
                        </Text>
                      </XStack>
                      <Text color={subTextColor} fontSize={textSize - 3}>
                        {subject.type}, {subject.semester}
                      </Text>
                    </YStack>
                  ))}
                </YStack>
              )}
            </YStack>
          </ScrollView>
        </YStack>
      </YStack>
    </Theme>
  );
};

export default SubjectsPage;
