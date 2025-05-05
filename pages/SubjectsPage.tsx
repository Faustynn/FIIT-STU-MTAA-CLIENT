import React, { useState, useEffect } from 'react';
import { YStack, H1, Theme, XStack, Text, View, Input, ScrollView, Spinner } from "tamagui";
import { useTheme } from '../components/SettingsController';
import { NavigationProp } from "@react-navigation/native";
import { fetchSubjects } from '../services/apiService';

export interface Subject {
  id: number | string;
  name: string;
  code: string;
  guarantor: string;
  type: string;
  semester: string;
}

type SubjectsPageProps = {
  navigation: NavigationProp<any>;
  initialSubjects?: Subject[];
};

const SubjectsPage: React.FC<SubjectsPageProps> = ({ navigation, initialSubjects }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const backgroundColor = isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = isDarkMode ? '#A0A7B7' : '$gray800';
  const inputBackgroundColor = isDarkMode ? '#2A2F3B' : '#F5F5F5';
  const itemBackgroundColor = isDarkMode ? '#2A2F3B' : '#F5F5F5';

  const [searchQuery, setSearchQuery] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects || []);
  const [loading, setLoading] = useState(!initialSubjects);
  const [error, setError] = useState<string | null>(null);

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.guarantor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!initialSubjects) {
      const loadSubjects = async () => {
        try {
          setLoading(true);
          const data = await fetchSubjects();
          setSubjects(data);
          setError(null);
        } catch (err) {
          setError('Failed to load subjects. Please try again later.');
          console.error('Error fetching subjects:', err);
        } finally {
          setLoading(false);
        }
      };

      loadSubjects();
    }
  }, [initialSubjects]);


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
            Subjects
          </Text>

          {/* Search Bar */}
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for a subject"
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
                width="$10"
              >
                <Text color={headerTextColor}>Semester</Text>
                <Text color={headerTextColor}>▼</Text>
              </View>
              <View
                backgroundColor={itemBackgroundColor}
                borderRadius={8}
                paddingHorizontal="$3"
                paddingVertical="$2"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                width="$12"
              >
                <Text color={headerTextColor}>Subject Type</Text>
                <Text color={headerTextColor}>▼</Text>
              </View>
              <View
                backgroundColor={itemBackgroundColor}
                borderRadius={8}
                paddingHorizontal="$3"
                paddingVertical="$2"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                width="$10"
              >
                <Text color={headerTextColor}>Study Level</Text>
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
                <Text color={subTextColor} marginTop="$2">Loading subjects...</Text>
              </YStack>
            ) : error ? (
              <YStack justifyContent="center" alignItems="center" paddingVertical="$10">
                <Text color="$red10" fontSize={16}>{error}</Text>
                <Text color={subTextColor} marginTop="$2">Pull down to refresh</Text>
              </YStack>
            ) : filteredSubjects.length === 0 ? (
              <YStack justifyContent="center" alignItems="center" paddingVertical="$10">
                <Text color={subTextColor} fontSize={16}>No subjects found</Text>
                {searchQuery && (
                  <Text color={subTextColor} marginTop="$2">Try adjusting your search</Text>
                )}
              </YStack>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <YStack space="$2">
                  {filteredSubjects.map((subject) => (
                    <YStack
                      key={subject.id}
                      backgroundColor={itemBackgroundColor}
                      borderRadius={8}
                      padding="$3"
                      space="$1"
                      onPress={() => navigation.navigate('SubjectSubPage', { subjectId: subject.id })}
                    >
                      <XStack justifyContent="space-between">
                        <Text color={headerTextColor} fontSize={18} fontWeight="bold">
                          {subject.name}
                        </Text>
                        <Text color={subTextColor} fontSize={14}>
                          {subject.code}
                        </Text>
                      </XStack>
                      <Text color={subTextColor} fontSize={14}>
                        Guarantee: {subject.guarantor}
                      </Text>
                      <Text color={subTextColor} fontSize={14}>
                        {subject.type}, {subject.semester}
                      </Text>
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

export default SubjectsPage;