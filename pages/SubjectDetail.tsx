import React, { useState, useEffect } from 'react';
import { YStack, H1, Theme, XStack, Text, View, ScrollView, Spinner, Button } from "tamagui";
import { useTheme } from '../components/SettingsController';
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { fetchSubjectDetails } from '../services/apiService';
import { Subject } from './SubjectsPage';
import { AppStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons } from '@expo/vector-icons';

type SubjectDetailProps = {
  route: RouteProp<AppStackParamList, 'SubjectSubPage'>;
  navigation: NavigationProp<AppStackParamList>;
};

export interface ExtendedSubject extends Subject {
  description?: string;
  credits?: number;
  language?: string;
  prerequisites?: string[];
  objectives?: string;
  syllabus?: string[];
  instructors?: { id: number | string; name: string; role?: string }[];
}

const SubjectDetail: React.FC<SubjectDetailProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const subjectId = route.params.subjectId;

  const backgroundColor = isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = isDarkMode ? '#A0A7B7' : '$gray800';
  const cardBackgroundColor = isDarkMode ? '#2A2F3B' : '#F5F5F5';
  const sectionBackgroundColor = isDarkMode ? '#2A2F3B' : '#F5F5F5';
  const accentColor = isDarkMode ? '#79E3A5' : '$blue500';

  const [subject, setSubject] = useState<ExtendedSubject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subjectId) {
      const loadSubjectDetails = async () => {
        try {
          setLoading(true);
          const data = await fetchSubjectDetails(subjectId);
          setSubject(data as ExtendedSubject);
          setError(null);
        } catch (err) {
          setError('Failed to load subject details. Please try again later.');
          console.error('Error fetching subject details:', err);
        } finally {
          setLoading(false);
        }
      };

      loadSubjectDetails();
    }
  }, [subjectId]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const navigateToTeacher = (teacherId: number | string) => {
    navigation.navigate('TeacherSubPage', { teacherId });
  };

  return (
    <Theme name={isDarkMode ? 'dark' : 'light'}>
      <YStack flex={1} backgroundColor={backgroundColor} padding="$0">
        {/* Header with back button */}
        <XStack padding="$4" paddingTop="$6" alignItems="center" space="$2">
          <Button
            icon={<MaterialIcons name="chevron-left" size={24} color="black" />}
            onPress={handleGoBack}
            backgroundColor="transparent"
            color={headerTextColor}
          />
          <H1 fontSize={24} fontWeight="bold" color={headerTextColor} flex={1}>
            Subject Details
          </H1>
        </XStack>

        {/* Main Content */}
        {loading ? (
          <YStack justifyContent="center" alignItems="center" flex={1}>
            <Spinner size="large" color={headerTextColor} />
            <Text color={subTextColor} marginTop="$2">Loading subject details...</Text>
          </YStack>
        ) : error ? (
          <YStack justifyContent="center" alignItems="center" flex={1}>
            <Text color="$red10" fontSize={16}>{error}</Text>
            <Button onPress={handleGoBack} marginTop="$4">Go Back</Button>
          </YStack>
        ) : subject ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack paddingHorizontal="$4" space="$4" paddingBottom="$8">
              {/* Subject Header */}
              <YStack
                backgroundColor={cardBackgroundColor}
                borderRadius={12}
                padding="$4"
                space="$3"
                marginTop="$2"
              >
                <Text fontSize={28} fontWeight="bold" color={headerTextColor}>
                  {subject.name}
                </Text>
                <XStack space="$2">
                  <View
                    backgroundColor={isDarkMode ? '#343B4A' : '#E1E8F0'}
                    borderRadius={6}
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                  >
                    <Text color={headerTextColor}>{subject.code}</Text>
                  </View>
                  <View
                    backgroundColor={isDarkMode ? '#343B4A' : '#E1E8F0'}
                    borderRadius={6}
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                  >
                    <Text color={headerTextColor}>{subject.type}</Text>
                  </View>
                  <View
                    backgroundColor={isDarkMode ? '#343B4A' : '#E1E8F0'}
                    borderRadius={6}
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                  >
                    <Text color={headerTextColor}>{subject.semester}</Text>
                  </View>
                </XStack>
                <Text color={subTextColor} fontSize={14}>
                  Guarantor: {subject.guarantor}
                </Text>
                {subject.credits && (
                  <Text color={accentColor} fontSize={16} fontWeight="bold">
                    {subject.credits} credits
                  </Text>
                )}
              </YStack>

              {/* Description */}
              {subject.description && (
                <YStack space="$2">
                  <Text fontSize={18} fontWeight="bold" color={headerTextColor}>
                    Description
                  </Text>
                  <YStack
                    backgroundColor={sectionBackgroundColor}
                    borderRadius={8}
                    padding="$3"
                  >
                    <Text color={headerTextColor} fontSize={14}>
                      {subject.description}
                    </Text>
                  </YStack>
                </YStack>
              )}

              {/* Basic Information */}
              <YStack space="$2">
                <Text fontSize={18} fontWeight="bold" color={headerTextColor}>
                  Subject Information
                </Text>
                <YStack
                  backgroundColor={sectionBackgroundColor}
                  borderRadius={8}
                  padding="$3"
                  space="$2"
                >
                  {subject.language && (
                    <XStack space="$2">
                      <Text color={subTextColor} fontSize={14} width={100}>
                        Language:
                      </Text>
                      <Text color={headerTextColor} fontSize={14} flex={1}>
                        {subject.language}
                      </Text>
                    </XStack>
                  )}
                  {subject.prerequisites && subject.prerequisites.length > 0 && (
                    <XStack space="$2" alignItems="flex-start">
                      <Text color={subTextColor} fontSize={14} width={100}>
                        Prerequisites:
                      </Text>
                      <YStack flex={1}>
                        {subject.prerequisites.map((prereq, index) => (
                          <Text key={index} color={headerTextColor} fontSize={14}>
                            • {prereq}
                          </Text>
                        ))}
                      </YStack>
                    </XStack>
                  )}
                </YStack>
              </YStack>

              {/* Learning Objectives */}
              {subject.objectives && (
                <YStack space="$2">
                  <Text fontSize={18} fontWeight="bold" color={headerTextColor}>
                    Learning Objectives
                  </Text>
                  <YStack
                    backgroundColor={sectionBackgroundColor}
                    borderRadius={8}
                    padding="$3"
                  >
                    <Text color={headerTextColor} fontSize={14}>
                      {subject.objectives}
                    </Text>
                  </YStack>
                </YStack>
              )}

              {/* Syllabus */}
              {subject.syllabus && subject.syllabus.length > 0 && (
                <YStack space="$2">
                  <Text fontSize={18} fontWeight="bold" color={headerTextColor}>
                    Syllabus
                  </Text>
                  <YStack
                    backgroundColor={sectionBackgroundColor}
                    borderRadius={8}
                    padding="$3"
                    space="$2"
                  >
                    {subject.syllabus.map((item, index) => (
                      <Text key={index} color={headerTextColor} fontSize={14}>
                        {index + 1}. {item}
                      </Text>
                    ))}
                  </YStack>
                </YStack>
              )}

              {/* Instructors */}
              {subject.instructors && subject.instructors.length > 0 && (
                <YStack space="$2">
                  <Text fontSize={18} fontWeight="bold" color={headerTextColor}>
                    Instructors
                  </Text>
                  <YStack space="$2">
                    {subject.instructors.map(instructor => (
                      <YStack
                        key={instructor.id}
                        backgroundColor={sectionBackgroundColor}
                        borderRadius={8}
                        padding="$3"
                        onPress={() => navigateToTeacher(instructor.id)}
                        pressStyle={{ opacity: 0.8 }}
                      >
                        <XStack justifyContent="space-between">
                          <Text color={headerTextColor} fontSize={16}>
                            {instructor.name}
                          </Text>
                          {instructor.role && (
                            <Text color={subTextColor} fontSize={12}>
                              {instructor.role}
                            </Text>
                          )}
                        </XStack>
                      </YStack>
                    ))}
                  </YStack>
                </YStack>
              )}
            </YStack>
          </ScrollView>
        ) : (
          <YStack justifyContent="center" alignItems="center" flex={1}>
            <Text color={subTextColor} fontSize={16}>Subject not found</Text>
            <Button onPress={handleGoBack} marginTop="$4">Go Back</Button>
          </YStack>
        )}
      </YStack>
    </Theme>
  );
};

export default SubjectDetail;