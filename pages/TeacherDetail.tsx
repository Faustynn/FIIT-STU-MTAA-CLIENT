import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Linking, useWindowDimensions } from "react-native";
import { YStack, H1, Theme, XStack, Text, View, ScrollView, Spinner, Button } from 'tamagui';
import { useTranslation } from 'react-i18next';
import { useTheme, getFontSizeValue } from '../components/SettingsController';
import { AppStackParamList } from '../navigation/AppNavigator';
import { fetchTeacherDetails, fetchSubjectDetails, getSubjectsForTeacher, Teacher as ApiTeacher, Subject } from '../services/apiService';

type TeacherDetailProps = {
  route: RouteProp<AppStackParamList, 'TeacherSubPage'>;
  navigation: NavigationProp<AppStackParamList>;
};

interface TeacherSubject {
  subject: Subject;
  roles: string[];
}

export interface ParsedTeacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  office: string | null;
  subjects: TeacherSubject[];
}

const TeacherDetail: React.FC<TeacherDetailProps> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { theme, fontSize, highContrast } = useTheme();
  const textSize = getFontSizeValue(fontSize);
  const isDarkMode = theme === 'dark';
  const teacherId = route.params.teacherId;
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const backgroundColor = highContrast ? '#000000' : isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '$gray800';
  const cardBackgroundColor = highContrast ? '#000000' : isDarkMode ? '#2A2F3B' : '#F5F5F5';
  const sectionBackgroundColor = highContrast ? '#000000' : isDarkMode ? '#2A2F3B' : '#F5F5F5';

  const [teacher, setTeacher] = useState<ParsedTeacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacherId) {
      const loadTeacherDetails = async () => {
        try {
          setLoading(true);

          const teacherData = await fetchTeacherDetails(teacherId);
          const subjectsWithRoles = await getSubjectsForTeacher(teacherId);

          const parsedTeacher: ParsedTeacher = {
            id: teacherData.id,
            name: teacherData.name,
            email: teacherData.email,
            phone: teacherData.phone,
            office: teacherData.office,
            subjects: subjectsWithRoles,
          };

          setTeacher(parsedTeacher);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching teacher details:', err);
          setError(t('failed_load_teacher_details'));

          // Retry after 15 secs
          setTimeout(() => loadTeacherDetails(), 15000);
        }
      };

      loadTeacherDetails();
    }
  }, [teacherId, t]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const navigateToSubject = (subjectId: string) => {
    navigation.navigate('SubjectSubPage', { subjectId });
  };

  const getRolesBadges = (roles: string[]) => {
    return (
      <XStack flexWrap="wrap" gap="$1" marginTop="$1">
        {roles.map((role, index) => (
          <View
            key={`${role}-${index}`}
            backgroundColor={isDarkMode ? '#343B4A' : '#E1E8F0'}
            borderRadius={6}
            paddingHorizontal="$2"
            paddingVertical="$1"
            marginBottom="$1">
            <Text fontSize={textSize - 2} color={headerTextColor}>{role}</Text>
          </View>
        ))}
      </XStack>
    );
  };

  const accentColor = highContrast ? '#FFD700' : isDarkMode ? '#79E3A5' : '$blue500';

  const navigateToComments = () => {
    if (teacher) {
      const Id = teacher.id;
      navigation.navigate('CommentsSubPage', { Id });
    } else {
      console.error('Teacher is null, cannot navigate to comments.');
    }
  };

  const translateStudyType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time': return t('full_time');
      case 'part-time': return t('part_time');
      case 'distance': return t('distance');
      case 'online': return t('online');
      default: return type;
    }
  };

  const translateSemester = (semester: string) => {
    switch (semester.toLowerCase()) {
      case 'fall': return t('fall_semester');
      case 'spring': return t('spring_semester');
      case 'summer': return t('summer_semester');
      case 'winter': return t('winter_semester');
      default: return semester;
    }
  };

  return (
    <Theme name={isDarkMode ? 'dark' : 'light'}>
      <YStack flex={1} backgroundColor={backgroundColor} padding="$0" alignItems="center">
        <YStack width={isLandscape ? '85%' : '100%'}>
          {/* Header with back button */}
          <XStack padding="$4" paddingTop="$6" alignItems="center" space="$2">
            <Button
              icon={<MaterialIcons name="chevron-left" size={24} color={isDarkMode ? 'white' : 'black'} />}
              onPress={handleGoBack}
              backgroundColor="transparent"
              color={headerTextColor}
            />
            <H1 fontSize={textSize + 5} fontWeight="bold" color={headerTextColor} flex={1}>
              {t('teacher_details')}
            </H1>
          </XStack>

          {/* Main Content */}
          {loading ? (
            <YStack justifyContent="center" alignItems="center" flex={1}>
              <Spinner size="large" color={headerTextColor} />
              <Text color={subTextColor} marginTop="$2">
                {t('loading_teacher_details')}
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
          ) : teacher ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack marginBottom="150" paddingHorizontal="$4" space="$4" paddingBottom="$8">
                {/* Teacher Header */}
                <YStack
                  backgroundColor={cardBackgroundColor}
                  borderRadius={12}
                  padding="$4"
                  space="$3"
                  marginTop="$2">
                  <Text fontSize={textSize + 10} fontWeight="bold" color={headerTextColor}>
                    {teacher.name}
                  </Text>
                  <XStack space="$2">
                    <View
                      backgroundColor={isDarkMode ? '#343B4A' : '#E1E8F0'}
                      borderRadius={6}
                      paddingHorizontal="$2"
                      paddingVertical="$1">
                      <Text color={headerTextColor}>{t('teacher')}</Text>
                    </View>
                  </XStack>
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text color={subTextColor} fontSize={textSize - 1}>
                      {t('id')}: {teacher.id}
                    </Text>
                  </XStack>
                </YStack>

                {/* Contact Information */}
                <YStack space="$2">
                  <Text fontSize={textSize + 1} fontWeight="bold" color={headerTextColor}>
                    {t('contact_information')}
                  </Text>
                  <YStack
                    backgroundColor={sectionBackgroundColor}
                    borderRadius={8}
                    padding="$3"
                    space="$2">
                    {teacher.email && (
                      <XStack space="$2" alignItems="center">
                        <Text color={subTextColor} fontSize={textSize - 1} width={80}>
                          {t('email')}:
                        </Text>
                        <Text
                          color={headerTextColor}
                          fontSize={textSize - 1}
                          flex={1}>
                          {teacher.email}
                        </Text>
                        <Button
                          onPress={() => Linking.openURL(`mailto:${teacher.email}`)}
                          backgroundColor={accentColor}
                          paddingHorizontal="$3"
                          paddingVertical="$1">
                          <Text color={isDarkMode ? 'black' : 'white'} fontSize={textSize - 1}>
                            {t('send_email')}
                          </Text>
                        </Button>
                      </XStack>
                    )}
                    {teacher.phone && (
                      <XStack space="$2">
                        <Text color={subTextColor} fontSize={textSize - 1} width={80}>
                          {t('phone')}:
                        </Text>
                        <Text color={headerTextColor} fontSize={textSize - 1} flex={1}>
                          {teacher.phone}
                        </Text>
                      </XStack>
                    )}
                    {teacher.office && (
                      <XStack space="$2">
                        <Text color={subTextColor} fontSize={textSize - 1} width={80}>
                          {t('office')}:
                        </Text>
                        <Text color={headerTextColor} fontSize={textSize - 1} flex={1}>
                          {teacher.office}
                        </Text>
                      </XStack>
                    )}
                  </YStack>
                </YStack>

                {/* Subjects Taught */}
                {teacher.subjects && teacher.subjects.length > 0 && (
                  <YStack space="$2">
                    <Text fontSize={textSize + 1} fontWeight="bold" color={headerTextColor}>
                      {t('subjects_taught')}
                    </Text>
                    <YStack space="$2">
                      {teacher.subjects.map((item, index) => (
                        <YStack
                          key={`${item.subject.code}-${index}`}
                          backgroundColor={sectionBackgroundColor}
                          borderRadius={8}
                          padding="$3"
                          onPress={() => navigateToSubject(item.subject.code)}
                          pressStyle={{ opacity: 0.8 }}>
                          <XStack justifyContent="space-between">
                            <Text color={headerTextColor} fontSize={textSize} fontWeight="bold">
                              {item.subject.name}
                            </Text>
                            <Text color={subTextColor} fontSize={textSize - 2}>
                              {item.subject.code}
                            </Text>
                          </XStack>

                          {/* Subject details */}
                          <YStack marginTop="$1">
                            <XStack flexWrap="wrap" space="$1">
                              <Text color={subTextColor} fontSize={textSize - 2}>
                                {item.subject.credits} {t('credits')} • {translateSemester(item.subject.semester)} • {translateStudyType(item.subject.studyType)}
                              </Text>
                            </XStack>
                          </YStack>

                          {/* Teacher roles */}
                          {item.roles.length > 0 && (
                            <YStack marginTop="$1">
                              <Text color={subTextColor} fontSize={textSize - 2} marginBottom="$1">
                                {t('roles')}:
                              </Text>
                              {getRolesBadges(item.roles)}
                            </YStack>
                          )}
                        </YStack>
                      ))}
                    </YStack>
                  </YStack>
                )}
              </YStack>

              {/* Comments button */}
              <YStack paddingHorizontal="$1" marginTop="$5">
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
                {t('teacher_not_found')}
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

export default TeacherDetail;