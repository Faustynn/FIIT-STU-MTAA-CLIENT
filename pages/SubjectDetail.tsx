import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { YStack, H1, Theme, XStack, Text, View, ScrollView, Spinner, Button } from 'tamagui';

import { useTheme, getFontSizeValue } from '../components/SettingsController';
import { AppStackParamList } from '../navigation/AppNavigator';
import { fetchSubjectDetails } from '../services/apiService';

type SubjectDetailProps = {
  route: RouteProp<AppStackParamList, 'SubjectSubPage'>;
  navigation: NavigationProp<AppStackParamList>;
};

export interface Instructor {
  id: number | string;
  name: string;
  role?: string;
}

export interface SubjectDetails {
  code: string;
  name: string;
  type: string;
  credits: number;
  studyType: string;
  semester: string;
  languages: string[];
  completionType: string;
  studentCount: number;
  assesmentMethods: string;
  learningOutcomes: string;
  courseContents: string;
  plannedActivities: string;
  evaluationMethods: string;
  guarantor: string;
  a_score: string;
  b_score: string;
  c_score: string;
  d_score: string;
  e_score: string;
  fx_score: string;
  description: string;
  objectives: string;
  prerequisites: string[];
  syllabus: string[];
  instructors: Instructor[];
}

const SubjectDetail: React.FC<SubjectDetailProps> = ({ route, navigation }) => {
  const { theme, fontSize, highContrast } = useTheme();
  const textSize = getFontSizeValue(fontSize);

  const isDarkMode = theme === 'dark';
  const subjectId = route.params.subjectId;
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const backgroundColor = highContrast ? '#000000' : isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '$gray800';
  const cardBackgroundColor = highContrast ? '#000000' : isDarkMode ? '#2A2F3B' : '#F5F5F5';
  const sectionBackgroundColor = highContrast ? '#000000' : isDarkMode ? '#2A2F3B' : '#F5F5F5';
  const accentColor = highContrast ? '#FFD700' : isDarkMode ? '#79E3A5' : '$blue500';

  const [subject, setSubject] = useState<SubjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subjectId) {
      const loadSubjectDetails = async () => {
        try {
          setLoading(true);
          const data = await fetchSubjectDetails(subjectId);
          setSubject(data as SubjectDetails);
          setError(null);
          setLoading(false);
        } catch (err) {
          setError('Failed to load subject details. Please try again later.');
          console.error('Error fetching subject details:', err);
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
      <YStack flex={1} backgroundColor={backgroundColor} padding="$0" alignItems="center">
        <YStack width={isLandscape ? '85%' : '100%'}>
          {/* Header */}
          <XStack padding="$4" paddingTop="$6" alignItems="center" space="$2">
            <Button
              icon={<MaterialIcons name="chevron-left" size={24} color="white" />}
              onPress={handleGoBack}
              backgroundColor="transparent"
              color={headerTextColor}
            />
            <H1 fontSize={textSize + 6} fontWeight="bold" color={headerTextColor} flex={1}>
              Subject Details
            </H1>
          </XStack>

          {/* Main Content */}
          {loading ? (
            <YStack justifyContent="center" alignItems="center" flex={1}>
              <Spinner size="large" color={headerTextColor} />
              <Text color={subTextColor} marginTop="$2" fontSize={textSize}>
                Loading subject details...
              </Text>
            </YStack>
          ) : error ? (
            <YStack justifyContent="center" alignItems="center" flex={1}>
              <Text color="$red10" fontSize={textSize}>
                {error}
              </Text>
              <Button onPress={handleGoBack} marginTop="$4">
                Go Back
              </Button>
            </YStack>
          ) : subject ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 90 }}>
              <YStack paddingHorizontal="$4" space="$4" paddingBottom="$8">
                {/* Subject Header */}
                <YStack
                  backgroundColor={cardBackgroundColor}
                  borderRadius={12}
                  padding="$4"
                  space="$3"
                  marginTop="$2">
                  <Text fontSize={textSize + 6} fontWeight="bold" color={headerTextColor}>
                    {subject.name}
                  </Text>
                  <XStack space="$2">
                    <Text color={headerTextColor} fontSize={textSize}>
                      {subject.code}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      {subject.type}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      {subject.semester}
                    </Text>
                  </XStack>
                  <Text color={accentColor} fontSize={textSize + 2} fontWeight="bold">
                    {subject.credits} credits
                  </Text>
                </YStack>

                {/* Description */}
                {subject.description && (
                  <YStack space="$2">
                    <Text fontSize={textSize + 4} fontWeight="bold" color={headerTextColor}>
                      Description
                    </Text>
                    <YStack backgroundColor={sectionBackgroundColor} borderRadius={8} padding="$3">
                      <Text color={headerTextColor} fontSize={textSize}>
                        {subject.description}
                      </Text>
                    </YStack>
                  </YStack>
                )}

                {/* Subject Info */}
                <YStack space="$2">
                  <Text fontSize={textSize + 4} fontWeight="bold" color={headerTextColor}>
                    Subject Information
                  </Text>
                  <YStack
                    backgroundColor={sectionBackgroundColor}
                    borderRadius={8}
                    padding="$3"
                    space="$2">
                    <Text color={headerTextColor} fontSize={textSize}>
                      Study Type: {subject.studyType}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      Completion Type: {subject.completionType}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      Student Count: {subject.studentCount}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      Assessment: {subject.assesmentMethods}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      Evaluation: {subject.evaluationMethods}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      Course Contents: {subject.courseContents}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      Planned Activities: {subject.plannedActivities}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      Learning Outcomes: {subject.learningOutcomes}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      Grades: A {subject.a_score || '—'}, B {subject.b_score || '—'}, C{' '}
                      {subject.c_score || '—'}, D {subject.d_score || '—'}, E{' '}
                      {subject.e_score || '—'}, Fx {subject.fx_score || '—'}
                    </Text>
                    {subject.languages?.length > 0 && (
                      <Text color={headerTextColor} fontSize={textSize}>
                        Languages: {subject.languages.join(', ')}
                      </Text>
                    )}
                    {subject.prerequisites?.length > 0 && (
                      <YStack>
                        <Text color={headerTextColor} fontSize={textSize}>
                          Prerequisites:
                        </Text>
                        {subject.prerequisites.map((p, i) => (
                          <Text key={i} color={headerTextColor} fontSize={textSize}>
                            • {p}
                          </Text>
                        ))}
                      </YStack>
                    )}
                  </YStack>
                </YStack>

                {/* Objectives */}
                {subject.objectives && (
                  <YStack space="$2">
                    <Text fontSize={textSize + 4} fontWeight="bold" color={headerTextColor}>
                      Objectives
                    </Text>
                    <YStack backgroundColor={sectionBackgroundColor} borderRadius={8} padding="$3">
                      <Text color={headerTextColor} fontSize={textSize}>
                        {subject.objectives}
                      </Text>
                    </YStack>
                  </YStack>
                )}

                {/* Syllabus */}
                {subject.syllabus?.length > 0 && (
                  <YStack space="$2">
                    <Text fontSize={textSize + 4} fontWeight="bold" color={headerTextColor}>
                      Syllabus
                    </Text>
                    <YStack
                      backgroundColor={sectionBackgroundColor}
                      borderRadius={8}
                      padding="$3"
                      space="$2">
                      {subject.syllabus.map((s, i) => (
                        <Text key={i} color={headerTextColor} fontSize={textSize}>
                          {i + 1}. {s}
                        </Text>
                      ))}
                    </YStack>
                  </YStack>
                )}

                {/* Instructors */}
                {subject.instructors?.length > 0 && (
                  <YStack space="$2">
                    <Text fontSize={textSize + 4} fontWeight="bold" color={headerTextColor}>
                      Instructors
                    </Text>
                    <YStack space="$2">
                      {subject.instructors.map((instructor) => (
                        <YStack
                          key={instructor.id}
                          backgroundColor={sectionBackgroundColor}
                          borderRadius={8}
                          padding="$3"
                          onPress={() => navigateToTeacher(instructor.id)}
                          pressStyle={{ opacity: 0.8 }}>
                          <XStack justifyContent="space-between">
                            <Text color={headerTextColor} fontSize={textSize}>
                              {instructor.name}
                            </Text>
                            {instructor.role && (
                              <Text color={subTextColor} fontSize={textSize - 2}>
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
              <Text color={subTextColor} fontSize={textSize}>
                Subject not found
              </Text>
              <Button onPress={handleGoBack} marginTop="$4">
                Go Back
              </Button>
            </YStack>
          )}
        </YStack>
      </YStack>
    </Theme>
  );
};

export default SubjectDetail;
