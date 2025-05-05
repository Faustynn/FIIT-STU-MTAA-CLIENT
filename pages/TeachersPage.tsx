import React, { useState, useEffect } from 'react';
import { YStack, H1, Theme, XStack, Text, View, Input, ScrollView, Spinner } from "tamagui";
import { useTheme } from '../components/SettingsController';
import { NavigationProp } from "@react-navigation/native";
import { fetchTeachers } from '../services/apiService';

export interface Teacher {
  id: number | string;
  name: string;
  aisId: string;
  rating: string;
  role?: string;
  department?: string;
}

type TeachersPageProps = {
  navigation: NavigationProp<any>;
  initialTeachers?: Teacher[];
};

const TeachersPage: React.FC<TeachersPageProps> = ({ navigation, initialTeachers }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const backgroundColor = isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = isDarkMode ? '#A0A7B7' : '$gray800';
  const inputBackgroundColor = isDarkMode ? '#2A2F3B' : '#F5F5F5';
  const itemBackgroundColor = isDarkMode ? '#2A2F3B' : '#F5F5F5';

  const [searchQuery, setSearchQuery] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers || []);
  const [loading, setLoading] = useState(!initialTeachers);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole] = useState<string | null>(null);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.aisId.includes(searchQuery);

    const matchesRole = !selectedRole || (teacher.role && teacher.role === selectedRole);

    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    if (!initialTeachers) {
      const loadTeachers = async () => {
        try {
          setLoading(true);
          const data = await fetchTeachers();
          setTeachers(data);
          setError(null);
        } catch (err) {
          setError('Failed to load teachers. Please try again later.');
          console.error('Error fetching teachers:', err);
        } finally {
          setLoading(false);
        }
      };

      loadTeachers();
    }
  }, [initialTeachers]);

  return (
    <Theme name={isDarkMode ? 'dark' : 'light'}>
      <YStack flex={1} backgroundColor={backgroundColor} padding="$0">
        {/* Header */}
        <XStack padding="$4" paddingTop="$6" justifyContent="space-between" alignItems="center">
          <H1 fontSize={24} fontWeight="bold" color={headerTextColor}>
            UNIMAP
          </H1>
          <XStack alignItems="center" space="$2">
            <YStack alignItems="flex-end">
              <Text color={subTextColor} fontSize={10}>@nmeredov</Text>
              <Text color={headerTextColor} fontWeight="bold">Nazar Meredov</Text>
            </YStack>
            <View
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={isDarkMode ? '#2A2F3B' : '#CCCCCC'}
              alignItems="center"
              justifyContent="center"
            >
              <Text>😏</Text>
            </View>
          </XStack>
        </XStack>

        {/* Main Content */}
        <YStack flex={1} paddingHorizontal="$4" space="$4">
          {/* Title */}
          <Text fontSize={32} fontWeight="bold" color={headerTextColor}>
            Teachers
          </Text>

          {/* Search Bar */}
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for a teacher"
            placeholderTextColor={subTextColor}
            backgroundColor={inputBackgroundColor}
            borderRadius={8}
            padding="$3"
            color={headerTextColor}
          />

          {/* Filters */}
          <YStack space="$2">
            <Text color={subTextColor} fontSize={14}>Filters</Text>
            <XStack space="$2">
              <View
                backgroundColor={itemBackgroundColor}
                borderRadius={8}
                paddingHorizontal="$3"
                paddingVertical="$2"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                width="$12"
                flex={1}
              >
                <Text color={headerTextColor}>Role</Text>
                <Text color={headerTextColor}>▼</Text>
              </View>
            </XStack>
          </YStack>

          {/* Results */}
          <YStack space="$2" flex={1}>
            <Text color={subTextColor} fontSize={14}>Results</Text>

            {loading ? (
              <YStack justifyContent="center" alignItems="center" paddingVertical="$10">
                <Spinner size="large" color={headerTextColor} />
                <Text color={subTextColor} marginTop="$2">Loading teachers...</Text>
              </YStack>
            ) : error ? (
              <YStack justifyContent="center" alignItems="center" paddingVertical="$10">
                <Text color="$red10" fontSize={16}>{error}</Text>
                <Text color={subTextColor} marginTop="$2">Pull down to refresh</Text>
              </YStack>
            ) : filteredTeachers.length === 0 ? (
              <YStack justifyContent="center" alignItems="center" paddingVertical="$10">
                <Text color={subTextColor} fontSize={16}>No teachers found</Text>
                {searchQuery && (
                  <Text color={subTextColor} marginTop="$2">Try adjusting your search</Text>
                )}
              </YStack>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <YStack space="$2">
                  {filteredTeachers.map((teacher) => (
                    <YStack
                      key={teacher.id}
                      backgroundColor={itemBackgroundColor}
                      borderRadius={8}
                      padding="$3"
                      space="$1"
                      onPress={() => navigation.navigate('TeacherSubPage', { teacherId: teacher.id })}
                    >
                      <Text color={headerTextColor} fontSize={18} fontWeight="bold">
                        {teacher.name}
                      </Text>
                      <XStack justifyContent="space-between">
                        <Text color={subTextColor} fontSize={14}>
                          AIS ID: {teacher.aisId}
                        </Text>
                        <Text color={subTextColor} fontSize={14}>
                          {teacher.rating}
                        </Text>
                      </XStack>
                      {teacher.department && (
                        <Text color={subTextColor} fontSize={14}>
                          Department: {teacher.department}
                        </Text>
                      )}
                    </YStack>
                  ))}
                </YStack>
              </ScrollView>
            )}
          </YStack>
        </YStack>
      </YStack>
    </Theme>
  );
};

export default TeachersPage;