import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { ComboBox } from 'components/ComboBox';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, useWindowDimensions, AppState, AppStateStatus } from 'react-native';
import { YStack, XStack, H1, Text, Theme, View, Input, ScrollView, Button } from 'tamagui';

import { useTheme, getFontSizeValue } from '../components/SettingsController';
import User from '../components/User';
import { fetchSubjects, Subject } from '../services/apiService';
import SkeletonLoader from '../components/SkeletonLoader';

// Cash all data
const subjectsCache = {
  user: null as User | null,
  subjects: [] as Subject[],
  filteredSubjects: [] as Subject[],
  lastFetched: 0,
  hasData: false,
  searchQuery: '',
  selectedSemester: '',
  selectedType: '',
  selectedLevel: '',
  connectionStatus: 'DISCONNECTED' as 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR',
};

// expr. time 30 min.
const CACHE_EXPIRATION_TIME = 30 * 60 * 1000;

// prevent function recreation
const shouldForceRefresh = () => {
  const now = Date.now();
  return now - subjectsCache.lastFetched > CACHE_EXPIRATION_TIME;
};

const SubjectsPage: React.FC<{ navigation: NavigationProp<any> }> = ({ navigation }) => {
  const { theme, fontSize, highContrast } = useTheme();
  const textSize = getFontSizeValue(fontSize);
  const isDarkMode = theme === 'dark';
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // hooks and states
  const [user, setUser] = useState<User | null>(() => subjectsCache.user);
  const [subjects, setSubjects] = useState<Subject[]>(() => subjectsCache.subjects);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>(() => subjectsCache.filteredSubjects.length > 0 ? subjectsCache.filteredSubjects : subjectsCache.subjects);
  const [searchQuery, setSearchQuery] = useState(() => subjectsCache.searchQuery);
  const [selectedSemester, setSelectedSemester] = useState(() => subjectsCache.selectedSemester);
  const [selectedType, setSelectedType] = useState(() => subjectsCache.selectedType);
  const [selectedLevel, setSelectedLevel] = useState(() => subjectsCache.selectedLevel);
  const [loading, setLoading] = useState(!subjectsCache.hasData);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(subjectsCache.hasData);
  const [connectionStatus, setConnectionStatus] = useState(subjectsCache.connectionStatus);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const initialMount = useRef(true);
  const dataFetchedRef = useRef(false);

  // Memoized styles
  const styles = React.useMemo(() => ({
    headerTextColor: highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '$blue600',
    subTextColor: highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '$gray800',
    inputBackgroundColor: highContrast ? '#000000' : isDarkMode ? '#2A2F3B' : '#F5F5F5',
    itemBackgroundColor: highContrast ? '#000000' : isDarkMode ? '#2A2F3B' : '#F5F5F5',
    backgroundColor: highContrast ? '#000000' : isDarkMode ? '#191C22' : '$gray50',
    statusColors: {
      CONNECTED: '#4CAF50',
      CONNECTING: '#FFC107',
      DISCONNECTED: '#9E9E9E',
      ERROR: '#F44336'
    }
  }), [highContrast, isDarkMode]);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground in SubjectsPage');

      // Check if cache is expired
      if (shouldForceRefresh()) {
        console.log('Cache expired, refreshing subjects data');
        setConnectionStatus('CONNECTING');
        loadSubjects(true);
      }
    }
    appState.current = nextAppState;
  }, []);

  // Optimized subjects data loading
  const loadSubjects = useCallback(async (forceRefresh = false) => {
    // Skip loading if we have cached data
    if (subjectsCache.subjects.length > 0 && !forceRefresh) {
      console.log('Using cached subjects data');
      setSubjects(subjectsCache.subjects);
      setFilteredSubjects(subjectsCache.filteredSubjects.length > 0 ?
        subjectsCache.filteredSubjects : subjectsCache.subjects);
      setConnectionStatus(subjectsCache.connectionStatus);
      setLoading(false);
      return;
    }

    setLoading(true);
    setConnectionStatus('CONNECTING');

    try {
      const data = await fetchSubjects();
      if (data) {
        setSubjects(data);
        // Apply any existing filters
        const filtered = applyFilters(data, searchQuery, selectedSemester, selectedType, selectedLevel);
        setFilteredSubjects(filtered);

        // Update cache
        subjectsCache.subjects = data;
        subjectsCache.filteredSubjects = filtered;
        subjectsCache.lastFetched = Date.now();
        subjectsCache.connectionStatus = 'CONNECTED';

        setConnectionStatus('CONNECTED');
        setError(null);
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
      setError(t('failed_to_load_subjects'));
      setConnectionStatus('ERROR');
      subjectsCache.connectionStatus = 'ERROR';
    } finally {
      setLoading(false);
    }
  }, [t, searchQuery, selectedSemester, selectedType, selectedLevel]);

  // Filter application utility function
  const applyFilters = (subjects: Subject[], query: string, semester: string, type: string, level: string) => {
    return subjects.filter((subject) => {
      const matchesSearch =
        subject.name.toLowerCase().includes(query.toLowerCase()) ||
        subject.code.toLowerCase().includes(query.toLowerCase());

      const matchesSemester = semester ? subject.semester === semester : true;
      const matchesType = type ? subject.type === type : true;
      const matchesLevel = level ? subject.studyType === level : true;

      return matchesSearch && matchesSemester && matchesType && matchesLevel;
    });
  };

  // Fetch user data from storage or cache with improved error handling
  const fetchAndParseUser = useCallback(async () => {
    // If we have cached user - use it
    if (subjectsCache.user) {
      setUser(subjectsCache.user);
      setHasData(true);
      return;
    }

    try {
      const storedUser = await User.fromStorage();
      if (storedUser) {
        setUser(storedUser);
        subjectsCache.user = storedUser;
        subjectsCache.hasData = true;
        setHasData(true);
      }
    } catch (error) {
      console.error('Error loading user in SubjectsPage:', error);
      setHasData(false);
    }
  }, []);

  // setup lazy loading of user data
  useEffect(() => {
    let isMounted = true;
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    if (initialMount.current) {
      console.log('Initial mount of SubjectsPage');
      fetchAndParseUser();
      if (!dataFetchedRef.current) {
        loadSubjects();
        dataFetchedRef.current = true;
      }
      initialMount.current = false;
    }

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [handleAppStateChange, fetchAndParseUser, loadSubjects]);

  useFocusEffect(
    useCallback(() => {
      console.log('SubjectsPage focused');

      if (isInitialMount) {
        setIsInitialMount(false);
        return;
      }

      // Check to refresh data when coming back to screen
      if (shouldForceRefresh()) {
        console.log('Cache expired on focus, refreshing subjects data');
        loadSubjects(true);
      } else {
        console.log('Using cached data on focus');
        // Check that use the latest cached data if not refreshing
        if (subjectsCache.filteredSubjects.length > 0) {
          setFilteredSubjects(subjectsCache.filteredSubjects);
        }
      }

      return () => {
        subjectsCache.searchQuery = searchQuery;
        subjectsCache.selectedSemester = selectedSemester;
        subjectsCache.selectedType = selectedType;
        subjectsCache.selectedLevel = selectedLevel;
      };
    }, [loadSubjects, isInitialMount, searchQuery, selectedSemester, selectedType, selectedLevel])
  );


  // Apply filters when search criteria changes
  useEffect(() => {
    const filtered = applyFilters(subjects, searchQuery, selectedSemester, selectedType, selectedLevel);
    setFilteredSubjects(filtered);

    // Update cache
    subjectsCache.filteredSubjects = filtered;
    subjectsCache.searchQuery = searchQuery;
    subjectsCache.selectedSemester = selectedSemester;
    subjectsCache.selectedType = selectedType;
    subjectsCache.selectedLevel = selectedLevel;
  }, [searchQuery, selectedSemester, selectedType, selectedLevel, subjects]);

  // Handlers for filters
  const handleRetryLoad = () => {
    setError(null);
    loadSubjects(true); // Force refresh
  };

  const handleSemesterChange = (value: string) => {
    if (value === selectedSemester) {
      setSelectedSemester('');
    } else {
      setSelectedSemester(value);
    }
  };

  const handleTypeChange = (value: string) => {
    if (value === selectedType) {
      setSelectedType('');
    } else {
      setSelectedType(value);
    }
  };

  const handleLevelChange = (value: string) => {
    if (value === selectedLevel) {
      setSelectedLevel('');
    } else {
      setSelectedLevel(value);
    }
  };

  // Show skeleton loader on initial loading
  if (loading && !subjectsCache.hasData) {
    return (
      <Theme name={isDarkMode ? 'dark' : 'light'}>
        <SkeletonLoader
          type="subject"
          itemCount={5}
          isLandscape={isLandscape}
          backgroundColor={isDarkMode ? '#2A2F3B' : '#E0E0E0'}
          highlightColor={isDarkMode ? '#3D4452' : '#F0F0F0'}
        />
      </Theme>
    );
  }

  return (
    <Theme name={isDarkMode ? 'dark' : 'light'}>
      <YStack
        flex={1}
        backgroundColor={styles.backgroundColor}
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
              fontSize={isLandscape ? textSize + 18 : textSize + 14}
              fontWeight="bold"
              color={styles.headerTextColor}>
              UNIMAP
            </H1>
            {!isLandscape && (
              <XStack alignItems="center" space="$2">
                <YStack alignItems="flex-end">
                  {hasData ? (
                    <>
                      <Text color={styles.subTextColor} fontSize={textSize - 4}>
                        @{user?.login}
                      </Text>
                      <Text color={styles.headerTextColor} fontWeight="bold">
                        {user?.getFullName()}
                      </Text>
                    </>
                  ) : (
                    <Text color={styles.subTextColor} fontSize={textSize - 4}>
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
            <Text fontSize={textSize + 15} fontWeight="bold" color={styles.headerTextColor}>
              {t('subjects')}
            </Text>

            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('search_subj')}
              placeholderTextColor={styles.subTextColor}
              opacity={0.6}
              backgroundColor={styles.inputBackgroundColor}
              borderRadius={8}
              padding="$3"
              color={styles.headerTextColor}
            />

            <YStack space="$2">
              <Text color={styles.subTextColor} fontSize={textSize}>
                {t('filters')}
              </Text>
              {isLandscape ? (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <XStack space="$4">
                      <ComboBox
                        view={'horizontal'}
                        value={selectedSemester}
                        onValueChange={handleSemesterChange}
                        items={[
                          { label: 'ZS', value: 'ZS' },
                          { label: 'LS', value: 'LS' },
                        ]}
                        placeholder={t('semester')}
                        labelColor={styles.subTextColor}
                        textColor={styles.headerTextColor}
                      />
                      <ComboBox
                        view={'horizontal'}
                        value={selectedType}
                        onValueChange={handleTypeChange}
                        items={[
                          { label: 'Obligatory', value: 'povinný' },
                          { label: 'Optional', value: 'povinné-voliteľný' },
                        ]}
                        placeholder={t('subj_type')}
                        labelColor={styles.subTextColor}
                        textColor={styles.headerTextColor}
                      />
                      <ComboBox
                        view={'horizontal'}
                        value={selectedLevel}
                        onValueChange={handleLevelChange}
                        items={[
                          { label: 'Bachelor', value: 'bakalarský' },
                          { label: 'Engineer', value: 'inženierský' },
                        ]}
                        placeholder={t('study_lvl')}
                        labelColor={styles.subTextColor}
                        textColor={styles.headerTextColor}
                      />
                    </XStack>
                  </ScrollView>
                </>
              ) : (
                <XStack space="$2" alignItems="center">
                  <ComboBox
                    view={"horizontal"}
                    value={selectedSemester}
                    onValueChange={handleSemesterChange}
                    items={[
                      { label: 'ZS', value: 'ZS' },
                      { label: 'LS', value: 'LS' },
                    ]}
                    placeholder={t('semester')}
                    labelColor={styles.subTextColor}
                    textColor={styles.headerTextColor}
                  />
                  <ComboBox
                    view={'horizontal'}
                    value={selectedType}
                    onValueChange={handleTypeChange}
                    items={[
                      { label: 'Obligatory', value: 'povinný' },
                      { label: 'Optional', value: 'povinné-voliteľný' },
                    ]}
                    placeholder={t('subj_type')}
                    labelColor={styles.subTextColor}
                    textColor={styles.headerTextColor}
                  />
                  <ComboBox
                    view={'horizontal'}
                    value={selectedLevel}
                    onValueChange={handleLevelChange}
                    items={[
                      { label: 'Bachelor', value: 'bakalarský' },
                      { label: 'Engineer', value: 'inženierský' },
                    ]}
                    placeholder={t('study_lvl')}
                    labelColor={styles.subTextColor}
                    textColor={styles.headerTextColor}
                  />
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
              <Text color={styles.subTextColor} fontSize={textSize}>
                {t('result')} ({filteredSubjects.length})
              </Text>

              {/* Loading indicator when refresh */}
              {loading && subjectsCache.hasData && (
                <Text color={styles.subTextColor} fontSize={textSize - 2} marginBottom="$2">
                  {t('updating')}...
                </Text>
              )}

              {error ? (
                <YStack justifyContent="center" alignItems="center" paddingVertical="$10">
                  <Text color="$red10" fontSize={textSize}>
                    {error}
                  </Text>
                  <Button onPress={handleRetryLoad} marginTop="$4">
                    {t('retry')}
                  </Button>
                </YStack>
              ) : filteredSubjects.length === 0 ? (
                <YStack justifyContent="center" alignItems="center" paddingVertical="$10">
                  <Text color={styles.subTextColor} fontSize={textSize}>
                    {t('no_subjects_found')}
                  </Text>
                  {searchQuery && (
                    <Text color={styles.subTextColor} marginTop="$2">
                      {t('adjust_search')}
                    </Text>
                  )}
                </YStack>
              ) : (
                <YStack space="$2">
                  {filteredSubjects.map((subject) => (
                    <YStack
                      key={subject.code}
                      backgroundColor={styles.itemBackgroundColor}
                      borderRadius={8}
                      padding="$3"
                      space="$1"
                      onPress={() =>
                        navigation.navigate('SubjectSubPage', { subjectId: subject.code })
                      }>
                      <XStack justifyContent="space-between">
                        <Text color={styles.headerTextColor} fontSize={textSize + 2} fontWeight="bold">
                          {subject.name}
                        </Text>
                        <Text color={styles.subTextColor} fontSize={textSize - 2}>
                          {subject.code}
                        </Text>
                      </XStack>
                      <Text color={styles.subTextColor} fontSize={textSize - 3}>
                        {subject.type}, {subject.semester}, {subject.credits} {t('credits')}
                      </Text>
                      {subject.languages && subject.languages.length > 0 && (
                        <Text color={styles.subTextColor} fontSize={textSize - 3}>
                          {t('languages')}: {subject.languages.join(', ')}
                        </Text>
                      )}
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