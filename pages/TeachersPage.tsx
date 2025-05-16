import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, useWindowDimensions, AppState, AppStateStatus } from 'react-native';
import { YStack, H1, Theme, XStack, Text, View, Input, ScrollView, Button } from 'tamagui';

import { ComboBox } from '../components/ComboBox';
import { useTheme, getFontSizeValue } from '../components/SettingsController';
import SkeletonLoader from '../components/SkeletonLoader';
import User from '../components/User';
import { fetchTeachers, parseTeachers } from '../services/apiService';

export interface TeacherSubject {
  subjectName: string;
  roles: string[];
}
export interface ParsedTeacher {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  office: string | null;
  subjects: TeacherSubject[];
}

// Cash all data
const teachersCache = {
  user: null as User | null,
  teachers: [] as ParsedTeacher[],
  filteredTeachers: [] as ParsedTeacher[],
  lastFetched: 0,
  hasData: false,
  searchQuery: '',
  selectedRole: '',
  connectionStatus: 'DISCONNECTED' as 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR',
};

// expr. time 30 min.
const CACHE_EXPIRATION_TIME = 30 * 60 * 1000;

// prevent function recreation
const shouldForceRefresh = () => {
  const now = Date.now();
  return now - teachersCache.lastFetched > CACHE_EXPIRATION_TIME;
};

type TeachersPageProps = {
  navigation: NavigationProp<any>;
  initialTeachers?: ParsedTeacher[];
};

const TeachersPage: React.FC<TeachersPageProps> = ({ navigation, initialTeachers }) => {
  const { theme, fontSize, highContrast } = useTheme();
  const textSize = getFontSizeValue(fontSize);
  const isDarkMode = theme === 'dark';
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // hooks and states
  const [user, setUser] = useState<User | null>(() => teachersCache.user);
  const [teachers, setTeachers] = useState<ParsedTeacher[]>(() => initialTeachers || teachersCache.teachers);
  const [filteredTeachers, setFilteredTeachers] = useState<ParsedTeacher[]>(() => teachersCache.filteredTeachers.length > 0 ? teachersCache.filteredTeachers : (initialTeachers || teachersCache.teachers));
  const [searchQuery, setSearchQuery] = useState(() => teachersCache.searchQuery);
  const [selectedRole, setSelectedRole] = useState<string>(() => teachersCache.selectedRole);
  const [loading, setLoading] = useState(() => !initialTeachers && teachersCache.teachers.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(() => teachersCache.hasData);
  const [connectionStatus, setConnectionStatus] = useState(() => teachersCache.connectionStatus);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const initialMount = useRef(true);
  const dataFetchedRef = useRef(false);

  // Memoized styles
  const styles = React.useMemo(() => ({
    backgroundColor: highContrast ? '#000000' : isDarkMode ? '#191C22' : '$gray50',
    headerTextColor: highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '$blue600',
    subTextColor: highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '$gray800',
    inputBackgroundColor: highContrast ? '#000000' : isDarkMode ? '#2A2F3B' : '#F5F5F5',
    itemBackgroundColor: highContrast ? '#000000' : isDarkMode ? '#2A2F3B' : '#F5F5F5',
    highlightColor: isDarkMode ? '#3D4452' : '#E0E0E0',
    statusColors: {
      CONNECTED: '#4CAF50',
      CONNECTING: '#FFC107',
      DISCONNECTED: '#9E9E9E',
      ERROR: '#F44336'
    }
  }), [highContrast, isDarkMode]);


  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground in TeachersPage');

      // Check if cache is expired
      if (shouldForceRefresh()) {
        console.log('Cache expired, refreshing teachers data');
        setConnectionStatus('CONNECTING');
        loadTeachers(true);
      }
    }
    appState.current = nextAppState;
  }, []);

  // Apply filters function
  const applyFilters = useCallback((teachersList: ParsedTeacher[], query: string, role: string) => {
    return teachersList.filter((teacher) => {
      const matchesSearch =
        teacher.name.toLowerCase().includes(query.toLowerCase()) ||
        teacher.id.includes(query);

      const matchesRole =
        !role || teacher.subjects.some((subject) => subject.roles.includes(role));

      return matchesSearch && matchesRole;
    });
  }, []);

  // Optimized subjects data loading
  const loadTeachers = useCallback(async (forceRefresh = false) => {
    // Use cached data if available
    if (teachersCache.teachers.length > 0 && !forceRefresh) {
      console.log('Using cached teachers data');
      setTeachers(teachersCache.teachers);
      setFilteredTeachers(teachersCache.filteredTeachers.length > 0 ?
        teachersCache.filteredTeachers : teachersCache.teachers);
      setConnectionStatus(teachersCache.connectionStatus);
      setLoading(false);
      return;
    }

    setLoading(true);
    setConnectionStatus('CONNECTING');

    try {
      const data = await fetchTeachers();
      if (data && Array.isArray(data)) {
        const parsed = parseTeachers(data).map((teacher) => ({
          ...teacher,
          id: teacher.id.toString(),
          subjects: teacher.subjects.map((subject) => ({
            subjectName: subject.subjectCode || '',
            roles: subject.roles || [],
          })),
        }));

        setTeachers(parsed);

        // Apply any existing filters
        const filtered = applyFilters(parsed, searchQuery, selectedRole);
        setFilteredTeachers(filtered);

        // Update cache
        teachersCache.teachers = parsed;
        teachersCache.filteredTeachers = filtered;
        teachersCache.lastFetched = Date.now();
        teachersCache.connectionStatus = 'CONNECTED';

        setConnectionStatus('CONNECTED');
        setError(null);
      } else {
        setError(t('invalid_data_format'));
        setConnectionStatus('ERROR');
        teachersCache.connectionStatus = 'ERROR';
      }
    } catch (err) {
      console.error('Error loading teachers:', err);
      setError(t('no_data_found'));
      setConnectionStatus('ERROR');
      teachersCache.connectionStatus = 'ERROR';
    } finally {
      setLoading(false);
    }
  }, [t, searchQuery, selectedRole, applyFilters]);

  // Fetch user data from storage or cache with improved error handling
  const fetchAndParseUser = useCallback(async () => {
    // If we have cached user - use it
    if (teachersCache.user) {
      setUser(teachersCache.user);
      setHasData(true);
      return;
    }

    try {
      const storedUser = await User.fromStorage();
      if (storedUser) {
        setUser(storedUser);
        teachersCache.user = storedUser;
        teachersCache.hasData = true;
        setHasData(true);
      }
    } catch (error) {
      console.error('Error loading user in TeachersPage:', error);
      setHasData(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    if (initialMount.current) {
      console.log('Initial mount of TeachersPage');
      fetchAndParseUser();
      if (!dataFetchedRef.current && !initialTeachers) {
        loadTeachers();
        dataFetchedRef.current = true;
      }
      initialMount.current = false;
    }

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [handleAppStateChange, fetchAndParseUser, loadTeachers, initialTeachers]);

  useFocusEffect(
    useCallback(() => {
      console.log('TeachersPage focused');

      if (isInitialMount) {
        setIsInitialMount(false);
        return;
      }

      // Check to refresh data when coming back to screen
      if (shouldForceRefresh()) {
        console.log('Cache expired on focus, refreshing teachers data');
        loadTeachers(true);
      } else {
        console.log('Using cached data on focus');
        // Check that use the latest cached data if not refreshing
        if (teachersCache.filteredTeachers.length > 0) {
          setFilteredTeachers(teachersCache.filteredTeachers);
        }
      }

      return () => {
        teachersCache.searchQuery = searchQuery;
        teachersCache.selectedRole = selectedRole;
      };
    }, [loadTeachers, isInitialMount, searchQuery, selectedRole])
  );

  // Apply filters for search criteria changes
  useEffect(() => {
    const filtered = applyFilters(teachers, searchQuery, selectedRole);
    setFilteredTeachers(filtered);

    // Update cache
    teachersCache.filteredTeachers = filtered;
    teachersCache.searchQuery = searchQuery;
    teachersCache.selectedRole = selectedRole;
  }, [searchQuery, selectedRole, teachers, applyFilters]);

  // Handlers for filters
  const handleRetryLoad = () => {
    setError(null);
    loadTeachers(true); // Force refresh
  };

  const handleRoleChange = (value: string) => {
    if (value === selectedRole) {
      setSelectedRole('');
    } else {
      setSelectedRole(value);
    }
  };

  // Show skeleton loader on initial loading
  if (loading && !teachersCache.hasData) {
    return (
      <Theme name={isDarkMode ? 'dark' : 'light'}>
        <SkeletonLoader
          type="teachers"
          itemCount={8}
          isLandscape={isLandscape}
          backgroundColor={isDarkMode ? '#2A2F3B' : '#E0E0E0'}
          highlightColor={styles.highlightColor}
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
        {/* Header */}
        <YStack flex={0}>
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
            )}
          </XStack>

          {/* Filters and Search */}
          <YStack marginTop="$4" space="$4" marginBottom={isLandscape ? 48 : 8}>
            <Text fontSize={textSize + 15} fontWeight="bold" color={styles.headerTextColor}>
              {t('teachers')}
            </Text>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('search_teach')}
              placeholderTextColor={styles.subTextColor}
              backgroundColor={styles.inputBackgroundColor}
              borderRadius={8}
              padding="$3"
              color={styles.headerTextColor}
            />
            <XStack alignItems="center" space="$2">
              <ComboBox
                view={"horizontal"}
                value={selectedRole}
                onValueChange={handleRoleChange}
                items={[
                  { label: 'Practitioners', value: 'cvičiaci' },
                  { label: 'Lecturer', value: 'prednášajúci' },
                  { label: 'Examiner', value: 'skúšajúci' },
                  { label: 'Guarantor', value: 'zodpovedný za predmet' },
                  { label: 'Tutor', value: 'tútor' },
                ]}
                placeholder={t('role')}
                labelColor={styles.subTextColor}
                textColor={styles.headerTextColor}
              />
            </XStack>
          </YStack>
        </YStack>

        {/* Results */}
        <YStack flex={isLandscape ? 3 : 2}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 25,
              paddingBottom: 24,
              paddingLeft: isLandscape ? 19 : 0,
            }}>
            <YStack space="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text color={styles.subTextColor} fontSize={textSize - 1}>
                  {t('result')} ({filteredTeachers.length})
                </Text>

                {/* Loading indicator during refresh */}
                {loading && teachersCache.hasData && (
                  <Text color={styles.subTextColor} fontSize={textSize - 2}>
                    {t('updating')}...
                  </Text>
                )}
              </XStack>

              {error ? (
                <YStack justifyContent="center" alignItems="center" paddingVertical="$10">
                  <Text color="$red10" fontSize={textSize}>
                    {error}
                  </Text>
                  <Button onPress={handleRetryLoad} marginTop="$4">
                    {t('retry')}
                  </Button>
                </YStack>
              ) : filteredTeachers.length === 0 ? (
                <YStack justifyContent="center" alignItems="center" paddingVertical="$10">
                  <Text color={styles.subTextColor} fontSize={textSize}>
                    {t('no_teachers_found')}
                  </Text>
                  {searchQuery && (
                    <Text color={styles.subTextColor} marginTop="$2">
                      {t('adjust_search')}
                    </Text>
                  )}
                </YStack>
              ) : (
                <YStack space="$2">
                  {filteredTeachers.map((teacher) => (
                    <YStack
                      key={teacher.id}
                      backgroundColor={styles.itemBackgroundColor}
                      borderRadius={8}
                      padding="$3"
                      space="$1"
                      onPress={() =>
                        navigation.navigate('TeacherSubPage', { teacherId: teacher.id })
                      }>
                      <Text color={styles.headerTextColor} fontSize={textSize + 1} fontWeight="bold">
                        {teacher.name}
                      </Text>
                      <XStack justifyContent="space-between">
                        <Text color={styles.subTextColor} fontSize={textSize - 1}>
                          {t('ais_id')}: {teacher.id}
                        </Text>
                      </XStack>
                      {teacher.office && (
                        <Text color={styles.subTextColor} fontSize={textSize - 1}>
                          {t('office')}: {teacher.office}
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

export default TeachersPage;