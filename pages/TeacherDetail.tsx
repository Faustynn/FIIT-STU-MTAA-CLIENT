import { MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { YStack, H1, Theme, XStack, Text, View, ScrollView, Spinner, Button } from 'tamagui';

import { useTheme, getFontSizeValue } from '../components/SettingsController';
import { AppStackParamList } from '../navigation/AppNavigator';
import { fetchTeacherDetails } from '../services/apiService';

type TeacherDetailProps = {
  route: RouteProp<AppStackParamList, 'TeacherSubPage'>;
  navigation: NavigationProp<AppStackParamList>;
};

export interface ParsedTeacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  office: string;
  aisId: string;
  roles: string[];
  rating: number;
  department: string;
  consultationHours: string;
  bio: string;
  subjects: { id: string | number; name: string; code: string }[];
}

const TeacherDetail: React.FC<TeacherDetailProps> = ({ route, navigation }) => {
  const { theme, fontSize } = useTheme();
  const textSize = getFontSizeValue(fontSize);
  const isDarkMode = theme === 'dark';
  const teacherId = route.params.teacherId;
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const backgroundColor = isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = isDarkMode ? '#A0A7B7' : '$gray800';
  const cardBackgroundColor = isDarkMode ? '#2A2F3B' : '#F5F5F5';
  const sectionBackgroundColor = isDarkMode ? '#2A2F3B' : '#F5F5F5';

  const [teacher, setTeacher] = useState<ParsedTeacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacherId) {
      const loadTeacherDetails = async () => {
        while (true) {
          try {
            setLoading(true);
            const data = await fetchTeacherDetails(teacherId);
            console.log('Fetched teacher:', data);
            setTeacher(data as ParsedTeacher);
            setError(null);
            setLoading(false); // ✅ только если всё ок — выходим
            break;
          } catch (err) {
            console.error('Error fetching teacher details:', err);
            setError('Failed to load teacher details. Retrying...');
            await new Promise((res) => setTimeout(res, 15000)); // 🔁 подождать 15 сек
          }
        }
      };

      loadTeacherDetails();
    }
  }, [teacherId]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const navigateToSubject = (subjectId: number | string) => {
    navigation.navigate('SubjectSubPage', { subjectId });
  };

  return (
    <Theme name={isDarkMode ? 'dark' : 'light'}>
      <YStack flex={1} backgroundColor={backgroundColor} padding="$0" alignItems="center">
        <YStack width={isLandscape ? '85%' : '100%'}>
          {/* Header with back button */}
          <XStack padding="$4" paddingTop="$6" alignItems="center" space="$2">
            <Button
              icon={<MaterialIcons name="chevron-left" size={24} color="white" />}
              onPress={handleGoBack}
              backgroundColor="transparent"
              color={headerTextColor}
            />
            <H1 fontSize={textSize + 5} fontWeight="bold" color={headerTextColor} flex={1}>
              Teacher Details
            </H1>
          </XStack>

          {/* Main Content */}
          {loading ? (
            <YStack justifyContent="center" alignItems="center" flex={1}>
              <Spinner size="large" color={headerTextColor} />
              <Text color={subTextColor} marginTop="$2">
                Loading teacher details...
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
                    {teacher.roles?.length > 0 && (
                      <View
                        backgroundColor={isDarkMode ? '#343B4A' : '#E1E8F0'}
                        borderRadius={6}
                        paddingHorizontal="$2"
                        paddingVertical="$1">
                        <Text color={headerTextColor}>{teacher.roles.join(', ')}</Text>
                      </View>
                    )}
                    {teacher.department && (
                      <View
                        backgroundColor={isDarkMode ? '#343B4A' : '#E1E8F0'}
                        borderRadius={6}
                        paddingHorizontal="$2"
                        paddingVertical="$1">
                        <Text color={headerTextColor}>{teacher.department}</Text>
                      </View>
                    )}
                  </XStack>
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text color={subTextColor} fontSize={textSize - 1}>
                      AIS ID: {teacher.aisId}
                    </Text>
                    <View
                      backgroundColor={isDarkMode ? '#343B4A' : '#E1E8F0'}
                      borderRadius={6}
                      paddingHorizontal="$2"
                      paddingVertical="$1">
                      <Text color={headerTextColor}>Rating: {teacher.rating}</Text>
                    </View>
                  </XStack>
                </YStack>

                {/* Contact Information */}
                <YStack space="$2">
                  <Text fontSize={textSize + 1} fontWeight="bold" color={headerTextColor}>
                    Contact Information
                  </Text>
                  <YStack
                    backgroundColor={sectionBackgroundColor}
                    borderRadius={8}
                    padding="$3"
                    space="$2">
                    {teacher.email && (
                      <XStack space="$2">
                        <Text color={subTextColor} fontSize={textSize - 1} width={80}>
                          Email:
                        </Text>
                        <Text color={headerTextColor} fontSize={textSize - 1} flex={1}>
                          {teacher.email}
                        </Text>
                      </XStack>
                    )}
                    {teacher.phone && (
                      <XStack space="$2">
                        <Text color={subTextColor} fontSize={textSize - 1} width={80}>
                          Phone:
                        </Text>
                        <Text color={headerTextColor} fontSize={textSize - 1} flex={1}>
                          {teacher.phone}
                        </Text>
                      </XStack>
                    )}
                    {teacher.office && (
                      <XStack space="$2">
                        <Text color={subTextColor} fontSize={textSize - 1} width={80}>
                          Office:
                        </Text>
                        <Text color={headerTextColor} fontSize={textSize - 1} flex={1}>
                          {teacher.office}
                        </Text>
                      </XStack>
                    )}
                    {teacher.consultationHours && (
                      <XStack space="$2" alignItems="flex-start">
                        <Text color={subTextColor} fontSize={textSize - 1} width={80}>
                          Consultation:
                        </Text>
                        <Text color={headerTextColor} fontSize={textSize - 1} flex={1}>
                          {teacher.consultationHours}
                        </Text>
                      </XStack>
                    )}
                  </YStack>
                </YStack>

                {/* Bio/About */}
                {teacher.bio && (
                  <YStack space="$2">
                    <Text fontSize={textSize + 1} fontWeight="bold" color={headerTextColor}>
                      About
                    </Text>
                    <YStack backgroundColor={sectionBackgroundColor} borderRadius={8} padding="$3">
                      <Text color={headerTextColor} fontSize={textSize - 1}>
                        {teacher.bio}
                      </Text>
                    </YStack>
                  </YStack>
                )}

                {/* Subjects Taught */}
                {teacher.subjects && teacher.subjects.length > 0 && (
                  <YStack space="$2">
                    <Text fontSize={textSize + 1} fontWeight="bold" color={headerTextColor}>
                      Subjects Taught
                    </Text>
                    <YStack space="$2">
                      {teacher.subjects.map((subject, index) => (
                        <YStack
                          key={`${subject.id}-${index}`}
                          backgroundColor={sectionBackgroundColor}
                          borderRadius={8}
                          padding="$3"
                          onPress={() => navigateToSubject(subject.id)}
                          pressStyle={{ opacity: 0.8 }}>
                          <XStack justifyContent="space-between">
                            <Text color={headerTextColor} fontSize={textSize}>
                              {subject.name}
                            </Text>
                            <Text color={subTextColor} fontSize={textSize - 2}>
                              {subject.code}
                            </Text>
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
                Teacher not found
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

export default TeacherDetail;
