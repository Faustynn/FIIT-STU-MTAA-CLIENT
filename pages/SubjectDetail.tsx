import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import { YStack, H1, Theme, XStack, Text, ScrollView, Spinner, Button } from 'tamagui';

import { useTheme, getFontSizeValue } from '../components/SettingsController';
import { AppStackParamList } from '../navigation/AppNavigator';
import { fetchSubjectDetails, getTeachersForSubject, Teacher, Subject} from '../services/apiService';

type SubjectDetailProps = {
  route: RouteProp<AppStackParamList, 'SubjectSubPage'>;
  navigation: NavigationProp<AppStackParamList>;
};

const SubjectDetail: React.FC<SubjectDetailProps> = ({ route, navigation }) => {
  const { t } = useTranslation();
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

  const [subject, setSubject] = useState<Subject | null>(null);
  const [subjectTeachers, setSubjectTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeacherDetails = async () => {
    try {
      setLoading(true);
      const subjectData = await fetchSubjectDetails(subjectId);
      setSubject(subjectData);

      // Fetch teachers for this subject
      const teachersData = await getTeachersForSubject(subjectData.code);
      setSubjectTeachers(teachersData);

      setError(null);
    } catch (err) {
      console.error('Error loading teacher details:', err);
      setError(t('failed_load_subject_details'));

      // Retry after 15 seconds
      setTimeout(() => loadTeacherDetails(), 15000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSubjectWithTeachers = async () => {
      try {
        setLoading(true);
        const subjectData = await fetchSubjectDetails(subjectId);
        setSubject(subjectData);

        // Take teachers for this subject
        const teachersData = await getTeachersForSubject(subjectData.code);
        setSubjectTeachers(teachersData);

        setError(null);
      } catch (err) {
        console.error('Error loading subject with teachers:', err);
        setError(t('failed_load_subject_details'));

        // Retry after 15 secs
        setTimeout(() => loadTeacherDetails(), 15000);
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      loadSubjectWithTeachers();
    }
  }, [subjectId, t]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const navigateToTeacher = (teacherId: number | string) => {
    navigation.navigate('TeacherSubPage', { teacherId });
  };

  // translate study type
  const translateStudyType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time':
        return t('full_time');
      case 'part-time':
        return t('part_time');
      case 'distance':
        return t('distance');
      case 'online':
        return t('online');
      default:
        return type;
    }
  };

  // translate semester
  const translateSemester = (semester: string) => {
    switch (semester.toLowerCase()) {
      case 'fall':
        return t('fall_semester');
      case 'spring':
        return t('spring_semester');
      case 'summer':
        return t('summer_semester');
      case 'winter':
        return t('winter_semester');
      default:
        return semester;
    }
  };

  // translate end type
  const translateCompletionType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'exam':
        return t('exam');
      case 'credit':
        return t('credit');
      case 'classified credit':
        return t('classified_credit');
      default:
        return type;
    }
  };

  // langs. formatter
  const formatLanguages = (languages: string[] | undefined) => {
    if (!languages || languages.length === 0) return t('not_specified');
    return languages.join(', ');
  };

  // grades view
  const renderGrades = () => {
    if (!subject) return null;

    return (
      <YStack space="$2">
        <Text fontSize={textSize + 4} fontWeight="bold" color={headerTextColor}>
          {t('grading_scale')}
        </Text>
        <YStack backgroundColor={sectionBackgroundColor} borderRadius={8} padding="$3" space="$2">
          <XStack justifyContent="space-between">
            <Text color={headerTextColor} fontSize={textSize}>
              A:
            </Text>
            <Text color={headerTextColor} fontSize={textSize}>
              {subject.ascore ? `${subject.ascore}%` : '—'}
            </Text>
          </XStack>
          <XStack justifyContent="space-between">
            <Text color={headerTextColor} fontSize={textSize}>
              B:
            </Text>
            <Text color={headerTextColor} fontSize={textSize}>
              {subject.bscore ? `${subject.bscore}%` : '—'}
            </Text>
          </XStack>
          <XStack justifyContent="space-between">
            <Text color={headerTextColor} fontSize={textSize}>
              C:
            </Text>
            <Text color={headerTextColor} fontSize={textSize}>
              {subject.cscore ? `${subject.cscore}%` : '—'}
            </Text>
          </XStack>
          <XStack justifyContent="space-between">
            <Text color={headerTextColor} fontSize={textSize}>
              D:
            </Text>
            <Text color={headerTextColor} fontSize={textSize}>
              {subject.dscore ? `${subject.dscore}%` : '—'}
            </Text>
          </XStack>
          <XStack justifyContent="space-between">
            <Text color={headerTextColor} fontSize={textSize}>
              E:
            </Text>
            <Text color={headerTextColor} fontSize={textSize}>
              {subject.escore ? `${subject.escore}%` : '—'}
            </Text>
          </XStack>
          <XStack justifyContent="space-between">
            <Text color={headerTextColor} fontSize={textSize}>
              FX:
            </Text>
            <Text color={headerTextColor} fontSize={textSize}>
              {subject.FXscore ? `${subject.FXscore}%` : '—'}
            </Text>
          </XStack>
        </YStack>
      </YStack>
    );
  };

  // teachers view
  const renderTeachers = () => {
    if (subjectTeachers.length === 0) return null;

    return (
      <YStack space="$2">
        <Text fontSize={textSize + 4} fontWeight="bold" color={headerTextColor}>
          {t('instructors_and_roles')}
        </Text>
        <YStack space="$2">
          {subjectTeachers.map((teacher) => {
            const subjectRoles = teacher.subjects.find((s) => s.subjectCode === subject?.code);
            const roles = subjectRoles?.roles || [];

            return (
              <YStack
                key={teacher.id}
                backgroundColor={sectionBackgroundColor}
                borderRadius={8}
                padding="$3"
                onPress={() => navigateToTeacher(teacher.id)}
                pressStyle={{ opacity: 0.8 }}>
                <XStack justifyContent="space-between">
                  <Text color={headerTextColor} fontSize={textSize} fontWeight="bold">
                    {teacher.name}
                  </Text>
                </XStack>
                {roles.length > 0 && (
                  <Text color={accentColor} fontSize={textSize - 1} marginTop="$1">
                    {roles.map(role => role.replace(/['"{}]+/g, '')).join(', ')}
                  </Text>
                )}
                {teacher.email && (
                  <XStack alignItems="center" space="$1" marginTop="$1">
                    <MaterialIcons name="email" size={textSize - 2} color={subTextColor} />
                    <Text color={subTextColor} fontSize={textSize - 2}>
                      {teacher.email}
                    </Text>
                  </XStack>
                )}
                {teacher.phone && (
                  <XStack alignItems="center" space="$1" marginTop="$1">
                    <MaterialIcons name="phone" size={textSize - 2} color={subTextColor} />
                    <Text color={subTextColor} fontSize={textSize - 2}>
                      {teacher.phone}
                    </Text>
                  </XStack>
                )}
                {teacher.office && (
                  <XStack alignItems="center" space="$1" marginTop="$1">
                    <MaterialIcons name="location-on" size={textSize - 2} color={subTextColor} />
                    <Text color={subTextColor} fontSize={textSize - 2}>
                      {t('office')}: {teacher.office}
                    </Text>
                  </XStack>
                )}
              </YStack>
            );
          })}
        </YStack>
      </YStack>
    );
  };

  const navigateToComments = () => {
    if (subject) {
      const Id = subject.code;
      navigation.navigate('CommentsSubPage', { Id });
    } else {
      console.error('Subject is null, cannot navigate to comments.');
    }
  };

  return (
    <Theme name={isDarkMode ? 'dark' : 'light'}>
      <YStack flex={1} backgroundColor={backgroundColor} padding="$0" alignItems="center">
        <YStack width={isLandscape ? '85%' : '100%'}>
          {/* Header */}
          <XStack padding="$4" paddingTop="$6" alignItems="center" space="$2">
            <Button
              icon={
                <MaterialIcons
                  name="chevron-left"
                  size={24}
                  color={isDarkMode ? 'white' : 'black'}
                />
              }
              onPress={handleGoBack}
              backgroundColor="transparent"
              color={headerTextColor}
            />
            <H1 fontSize={textSize + 6} fontWeight="bold" color={headerTextColor} flex={1}>
              {t('subject_details')}
            </H1>
          </XStack>

          {/* Main Content */}
          {loading ? (
            <YStack justifyContent="center" alignItems="center" flex={1}>
              <Spinner size="large" color={headerTextColor} />
              <Text color={subTextColor} marginTop="$2" fontSize={textSize}>
                {t('loading_subject_details')}
              </Text>
            </YStack>
          ) : error ? (
            <YStack justifyContent="center" alignItems="center" flex={1}>
              <Text color="$red10" fontSize={textSize}>
                {error}
              </Text>
              <Button onPress={handleGoBack} marginTop="$4">
                {t('go_back')}
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
                  <XStack space="$3" flexWrap="wrap">
                    <Text color={headerTextColor} fontSize={textSize} fontWeight="bold">
                      {subject.code}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      {subject.type}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      {translateSemester(subject.semester)}
                    </Text>
                  </XStack>
                  <Text color={accentColor} fontSize={textSize + 2} fontWeight="bold">
                    {subject.credits} {t('credits')}
                  </Text>
                </YStack>

                {/* Basic Information */}
                <YStack space="$2">
                  <Text fontSize={textSize + 4} fontWeight="bold" color={headerTextColor}>
                    {t('basic_information')}
                  </Text>
                  <YStack
                    backgroundColor={sectionBackgroundColor}
                    borderRadius={8}
                    padding="$3"
                    space="$2">

                    <Text color={headerTextColor} fontSize={textSize}>
                      <Text fontWeight="bold" color={accentColor}>{t('study_type')}:</Text>{' '}
                      {translateStudyType(subject.studyType)}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      <Text fontWeight="bold" color={accentColor}>{t('completion_type')}:</Text>{' '}
                      {translateCompletionType(subject.completionType)}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      <Text fontWeight="bold" color={accentColor}>{t('student_count')}:</Text> {subject.studentCount}
                    </Text>
                    <Text color={headerTextColor} fontSize={textSize}>
                      <Text fontWeight="bold" color={accentColor}>{t('languages')}:</Text>{' '}
                      {formatLanguages(subject.languages)}
                    </Text>
                  </YStack>
                </YStack>

                {/* Educational Methods */}
                <YStack space="$2">
                  <Text fontSize={textSize + 4} fontWeight="bold" color={headerTextColor}>
                    {t('educational_methods')}
                  </Text>
                  <YStack
                    backgroundColor={sectionBackgroundColor}
                    borderRadius={8}
                    padding="$3"
                    space="$2">
                    <Text fontSize={textSize}>
                      <Text fontWeight="bold" color={accentColor}>{t('course_contents')}:</Text>{'\n'}
                      {subject.courseContents}
                    </Text>
                    <Text fontSize={textSize}>
                      <Text fontWeight="bold" color={accentColor}>{t('planned_activities')}:</Text>{'\n'}
                      {subject.plannedActivities}
                    </Text>
                    <Text fontSize={textSize}>
                      <Text fontWeight="bold" color={accentColor}>{t('learning_outcomes')}:</Text>{'\n'}
                      {subject.learningOutcomes}
                    </Text>
                  </YStack>
                </YStack>

                {/* Assessment */}
                <YStack space="$2">
                  <Text fontSize={textSize + 4} fontWeight="bold" color={headerTextColor}>
                    {t('assessment_evaluation')}
                  </Text>
                  <YStack
                    backgroundColor={sectionBackgroundColor}
                    borderRadius={8}
                    padding="$3"
                    space="$2">
                    <Text fontSize={textSize}>
                      <Text fontWeight="bold" color={accentColor}>{t('assessment_methods')}:</Text>{'\n'}
                      {subject.assesmentMethods}
                    </Text>
                    <Text fontSize={textSize}>
                      <Text fontWeight="bold" color={accentColor}>{t('evaluation_methods')}:</Text>{'\n'}
                      {subject.evaluationMethods}
                    </Text>
                  </YStack>
                </YStack>


                {/* Grading Scale */}
                {renderGrades()}

                {/* Teachers */}
                {renderTeachers()}
              </YStack>

              {/* Comments button */}
              <YStack paddingHorizontal="$1" marginBottom="$5">
                <Button
                  onPress={navigateToComments}
                  backgroundColor={accentColor}
                  color={isDarkMode ? 'black' : 'white'}>
                  {t('view_comments')}
                </Button>
              </YStack>
            </ScrollView>
          ) : (
            <YStack justifyContent="center" alignItems="center" flex={1}>
              <Text color={subTextColor} fontSize={textSize}>
                {t('subject_not_found')}
              </Text>
              <Button onPress={handleGoBack} marginTop="$4">
                {t('go_back')}
              </Button>
            </YStack>
          )}
        </YStack>
      </YStack>
    </Theme>
  );
};

export default SubjectDetail;