import { NavigationProp } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, useWindowDimensions } from 'react-native';
import { YStack, H1, Theme, XStack, Text, View, Input, ScrollView, Spinner, Button } from 'tamagui';

import { ComboBox } from '../components/ComboBox';
import { useTheme, getFontSizeValue } from '../components/SettingsController';
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

  const [user, setUser] = useState<User | null>(null);
  const [hasData, setHasData] = useState(false);

  const [loading, setLoading] = useState(!initialTeachers);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [teachers, setTeachers] = useState<ParsedTeacher[]>(initialTeachers || []);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await User.fromStorage();
      setUser(storedUser || null);
      setHasData(!!storedUser);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!initialTeachers && teachers.length === 0) {
      const loadTeachers = async () => {
        try {
          setLoading(true);
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
            setError(null);
          } else {
            setError(t('invalid_data_format'));
          }
        } catch (err) {
          setError(t('no_data_found'));
          console.error('Error fetching teachers:', err);
        } finally {
          setLoading(false);
        }
      };

      loadTeachers();
    }
  }, [initialTeachers, t]);

  const backgroundColor = highContrast ? '#000000' : isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '$gray800';
  const inputBackgroundColor = highContrast ? '#000000' : isDarkMode ? '#2A2F3B' : '#F5F5F5';
  const itemBackgroundColor = highContrast ? '#000000' : isDarkMode ? '#2A2F3B' : '#F5F5F5';

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.id.includes(searchQuery);

    const matchesRole =
      !selectedRole || teacher.subjects.some((subject) => subject.roles.includes(selectedRole));

    return matchesSearch && matchesRole;
  });

  const handleRetryLoad = () => {
    setError(null);
    setLoading(true);
    setTeachers([]);
  };

  const handleRoleChange = (value: string) => {
    if (value === selectedRole) {
      setSelectedRole('');
    } else {
      setSelectedRole(value);
    }
  };

  if (loading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={backgroundColor}>
        <Spinner size="large" color={headerTextColor} />
        <Text color={subTextColor} marginTop="$4">
          {t('loading_teachers')}
        </Text>
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
            <Text fontSize={textSize + 15} fontWeight="bold" color={headerTextColor}>
              {t('teachers')}
            </Text>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('search_teach')}
              placeholderTextColor={subTextColor}
              backgroundColor={inputBackgroundColor}
              borderRadius={8}
              padding="$3"
              color={headerTextColor}
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
                labelColor={subTextColor}
                textColor={headerTextColor}
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
              <Text color={subTextColor} fontSize={textSize - 1}>
                {t('result')}
              </Text>
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
                  <Text color={subTextColor} fontSize={textSize}>
                    {t('no_teachers_found')}
                  </Text>
                </YStack>
              ) : (
                <YStack space="$2">
                  {filteredTeachers.map((teacher) => (
                    <YStack
                      key={teacher.id}
                      backgroundColor={itemBackgroundColor}
                      borderRadius={8}
                      padding="$3"
                      space="$1"
                      onPress={() =>
                        navigation.navigate('TeacherSubPage', { teacherId: teacher.id })
                      }>
                      <Text color={headerTextColor} fontSize={textSize + 1} fontWeight="bold">
                        {teacher.name}
                      </Text>
                      <XStack justifyContent="space-between">
                        <Text color={subTextColor} fontSize={textSize - 1}>
                          {t('ais_id')}: {teacher.id}
                        </Text>
                      </XStack>
                      {teacher.office && (
                        <Text color={subTextColor} fontSize={textSize - 1}>
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