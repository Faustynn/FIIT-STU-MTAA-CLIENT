import React, { useState, useEffect } from 'react';
import {TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl, } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, H4, Text, XStack, YStack, Card, Input, Stack, Theme, } from "tamagui";
import { useTheme, getFontSizeValue } from "../components/SettingsController";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { AppStackParamList } from "../navigation/AppNavigator";
import { useTranslation } from 'react-i18next';
import { get_all_teachers_comments, get_all_subjects_comments, fetchTeacherDetails, fetchSubjectDetails, add_new_commet_teachers, add_new_commet_subjects, delete_subject_comment, delete_teacher_comment } from "../services/apiService";
import User from "../components/User";

// Types
type CommentType = {
  comment_id: number;
  description: string;
  levelAccess: number;
  looking_id: string;
  name: string;
  rating: string;
  user_id: number;
  timestamp?: Date;
};

type EntityType = 'teacher' | 'subject';
type UserRole = 'admin' | 'premium' | 'regular';

type CommentsSubPageProps = {
  route: RouteProp<AppStackParamList, 'CommentsSubPage'>;
  navigation: NavigationProp<AppStackParamList>;
};

const CommentsSubPage: React.FC<CommentsSubPageProps> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { theme, fontSize, highContrast } = useTheme();
  const textSize = getFontSizeValue(fontSize);
  const isDarkMode = theme === 'dark';
  const Id = route.params.Id;

  const [entityType, setEntityType] = useState<EntityType>('teacher');
  const [entityName, setEntityName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('regular');
  const [userName, setUserName] = useState<string>(t('profile'));
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const backgroundColor = highContrast ? '#000000' : isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '$gray800';
  const cardBackgroundColor = highContrast ? '#000000' : isDarkMode ? '#1E2129' : '#F5F5F5';
  const starColor = isDarkMode ? "yellow" : "orange";
  const starInactiveColor = isDarkMode ? "gray" : "lightgray";
  const iconColor = isDarkMode ? "green" : "red";

  // Load user data+ set role
  const loadUserData = async () => {
    try {
      const userData = await User.fromStorage();
      setCurrentUser(userData);

      if (userData) {
        if (userData.isAdmin()) {
          setUserRole('admin');
          setUserName(t('admin'));
        } else if (userData.isPremium()) {
          setUserRole('premium');
          setUserName(t('premium'));
        } else {
          setUserRole('regular');
          setUserName(t('regular_user'));
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };


  // Fetch data
  const fetchCommentsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const newEntityType = typeof Id === 'string' && isNaN(Number(Id)) ? 'subject' : 'teacher';
      setEntityType(newEntityType);

      if (newEntityType === 'teacher') {
        const teacherData = await fetchTeacherDetails(Id);
        if (teacherData) {
          setEntityName(teacherData.name);
        }

        const teacherComments = await get_all_teachers_comments(Id);
        if (teacherComments && Array.isArray(teacherComments)) {
          setComments(teacherComments);

          if (teacherComments.length > 0) {
            const sum = teacherComments.reduce((acc, comment) => acc + parseInt(comment.rating), 0);
            setAverageRating(parseFloat((sum / teacherComments.length).toFixed(1)));
          } else {
            setAverageRating(0);
          }
        } else {
          setComments([]);
          setAverageRating(0);
        }
      } else {
        const subjectData = await fetchSubjectDetails(Id);
        if (subjectData) {
          setEntityName(subjectData.name);
        }

        const subjectComments = await get_all_subjects_comments(Id);
        if (subjectComments && Array.isArray(subjectComments)) {
          setComments(subjectComments);

          if (subjectComments.length > 0) {
            const sum = subjectComments.reduce((acc, comment) => acc + parseInt(comment.rating), 0);
            setAverageRating(parseFloat((sum / subjectComments.length).toFixed(1)));
          } else {
            setAverageRating(0);
          }
        } else {
          setComments([]);
          setAverageRating(0);
        }
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(t('failed_load_comments'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };



  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCommentsData();
  };

  // Load data on first render
  useEffect(() => {
    loadUserData();
    fetchCommentsData();
  }, [Id]);

  // Send comment
  const handleSendComment = async () => {
    if (newComment.trim() && rating > 0) {
      try {
        setIsLoading(true);

        let success = false;
        const levelAccess = userRole === 'admin' ? 2 : userRole === 'premium' ? 1 : 0;

        const commentData = {
          code: Id,
          user_id: currentUser?.getId() || 0,
          rating: rating.toString(),
          text: newComment,
          levelAccess: levelAccess
        };

        if (entityType === 'teacher') {
          success = await add_new_commet_teachers(commentData);
        } else {
          success = await add_new_commet_subjects(commentData);
        }

        if (success) {
          await fetchCommentsData();
          setNewComment('');
          setRating(0);
          setShowCommentForm(false);

          Alert.alert(t('success'), t('comment_added'));
        } else {
          Alert.alert(t('error'), t('failed_add_comment'));
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        Alert.alert(t('error'), t('error_adding_comment'));
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert(t('attention'), t('please_fill_comment_rating'));
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: number) => {
    Alert.alert(
      t('confirmation'),
      t('confirm_delete_comment'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          onPress: async () => {
            try {
              setIsLoading(true);
              let success = false;

              if (entityType === 'teacher') {
                success = await delete_teacher_comment(commentId);
              } else {
                success = await delete_subject_comment(commentId);
              }

              if (success) {
                await fetchCommentsData();
                Alert.alert(t('success'), t('comment_deleted'));
              } else {
                Alert.alert(t('error'), t('failed_delete_comment'));
              }
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert(t('error'), t('error_deleting_comment'));
            } finally {
              setIsLoading(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // print comment
  const renderComment = ({ item }: { item: CommentType }) => {
    const canSeeAdminFeatures = userRole === 'admin';
    const isPremiumUser = item.levelAccess === 1 || item.levelAccess === 2;
    const firstLetter = item.name.charAt(0).toUpperCase();
    const commentRating = parseInt(item.rating);

    return (
      <Card
        elevate
        size="$4"
        bordered={false}
        animation="bouncy"
        marginBottom="$2"
        scale={0.98}
        hoverStyle={{ scale: 1 }}
        pressStyle={{ scale: 0.96 }}
        backgroundColor={cardBackgroundColor}
      >
        <Card.Header padded>
          <XStack space="$2" alignItems="center" flex={1}>

            <YStack flex={1}>
              <XStack alignItems="center" space="$1">
                <Text fontWeight="bold" color={isPremiumUser ? "$green9" : headerTextColor} fontSize={textSize}>
                  {item.name}
                </Text>
                {isPremiumUser && (
                  <MaterialIcons name="stars" size={14} color={"yellow"} />
                )}
                {item.levelAccess === 2 && (
                  <MaterialIcons name="admin-panel-settings" size={14} color={"gold"} />
                )}
              </XStack>
            </YStack>

            {canSeeAdminFeatures && (
              <Button
                size="$2"
                fontSize="$1"
                circular
                icon={<MaterialIcons name="delete" size={16} color={iconColor} />}
                backgroundColor="$backgroundTransparent"
                onPress={() => handleDeleteComment(item.comment_id)}
              />
            )}
          </XStack>
        </Card.Header>

        <Card.Footer padded>
          <YStack space="$2" width="100%">
            <Text fontSize={textSize} color={subTextColor}>{item.description}</Text>
            <XStack space="$0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons
                  key={star}
                  name="star"
                  size={16}
                  color={star <= commentRating ? starColor : starInactiveColor}
                />
              ))}
            </XStack>
          </YStack>
        </Card.Footer>
      </Card>
    );
  };

  // Navigation back
  const handleGoBack = () => {
    navigation.goBack();
  };

  // comment form
  const toggleCommentForm = () => {
    setShowCommentForm(!showCommentForm);
  };

  const getRoleBadgeColor = () => {
    if (userRole === 'admin') return "$yellow9";
    if (userRole === 'premium') return "$green9";
    return "$blue9";
  };

  const getRoleName = () => {
    if (userRole === 'admin') return t('admin_role');
    if (userRole === 'premium') return t('premium_role');
    return t('regular_role');
  };




  return (
    <Theme name={isDarkMode ? "dark" : "light"}>
      <Stack flex={1} backgroundColor={backgroundColor}>
        {/* Header */}
        <XStack
          padding="$4"
          paddingTop="$6"
          alignItems="center"
          space="$2"
          backgroundColor="$backgroundStrong"
        >
          <Button
            size="$3"
            fontSize="$1"
            circular
            icon={<MaterialIcons name="arrow-back" size={20} color={iconColor} />}
            onPress={handleGoBack}
            backgroundColor="$backgroundTransparent"
          />
          <Text fontSize={textSize + 4} fontWeight="bold" flex={1} numberOfLines={1} color={headerTextColor}>
            {entityName}
          </Text>
          {/* Display user role based on User class */}
          <Button
            fontSize="$1"
            size="$2"
            backgroundColor={getRoleBadgeColor()}
            color="white"
          >
            {getRoleName()}
          </Button>
          <Button
            fontSize="$1"
            size="$3"
            circular
            icon={<MaterialIcons name="refresh" size={20} color={iconColor} />}
            onPress={handleRefresh}
            backgroundColor="$backgroundTransparent"
            disabled={isLoading || isRefreshing}
          />
        </XStack>

        {isLoading && !isRefreshing ? (
          <YStack flex={1} justifyContent="center" alignItems="center" space="$2">
            <ActivityIndicator size="large" color={iconColor} />
            <Text color={headerTextColor} fontSize={textSize}>{t('loading_comments')}</Text>
          </YStack>
        ) : (
          <YStack flex={1}>
            {/* Rating Card */}
            <Card margin="$4" bordered marginBottom="$2" backgroundColor={cardBackgroundColor}>
              <Card.Header padded>
                <YStack alignItems="center" width="100%" space="$2">
                  <H4 color={headerTextColor}>{entityType === 'teacher' ? t('teacher_rating') : t('subject_rating')}</H4>
                  <XStack space="$1" justifyContent="center" alignItems="center">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <MaterialIcons
                        key={index}
                        name="star"
                        size={24}
                        color={index < Math.round(averageRating) ? starColor : starInactiveColor}
                      />
                    ))}
                    <Text fontSize={textSize + 4} fontWeight="bold" paddingLeft="$2" color={headerTextColor}>
                      {averageRating.toFixed(1)}
                    </Text>
                  </XStack>
                  <Text fontSize={textSize - 2} opacity={0.7} color={subTextColor}>
                    {t('based_on_reviews', { count: comments.length })}
                  </Text>
                </YStack>
              </Card.Header>
            </Card>

            {/* Comments list */}
            <XStack marginHorizontal="$4" marginTop="$2" justifyContent="space-between" alignItems="center">
              <Text fontSize={textSize + 2} fontWeight="bold" color={headerTextColor}>{t('comments')}</Text>
              <Button
                fontSize="$1"
                size="$3"
                backgroundColor="$blue9"
                onPress={toggleCommentForm}
                icon={<MaterialIcons name={showCommentForm ? "close" : "add"} size={18} color="white" />}
              >
                {showCommentForm ? t('cancel') : t('write_review')}
              </Button>
            </XStack>

            {/* Comment form */}
            {showCommentForm && (
              <Card margin="$4" bordered backgroundColor={cardBackgroundColor}>
                <Card.Header padded>
                  <Text fontSize={textSize + 2} fontWeight="bold" color={headerTextColor}>{t('your_review')}</Text>
                </Card.Header>
                <Card.Footer padded>
                  <YStack space="$3" width="100%">
                    <Input
                      placeholder={t('write_comment_placeholder')}
                      value={newComment}
                      onChangeText={setNewComment}
                      multiline
                      numberOfLines={3}
                      minHeight={80}
                      color={subTextColor}
                      fontSize={textSize}
                    />

                    <Text alignSelf="center" color={headerTextColor} fontSize={textSize}>{t('your_rating')}</Text>
                    <XStack justifyContent="center" space="$1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
                          <MaterialIcons
                            name="star"
                            size={32}
                            color={index < rating ? starColor : starInactiveColor}
                          />
                        </TouchableOpacity>
                      ))}
                    </XStack>

                    <Button
                      fontSize="$1"
                      backgroundColor="$blue9"
                      onPress={handleSendComment}
                      disabled={isLoading}
                      icon={
                        isLoading
                          ? <ActivityIndicator size="small" color="white" />
                          : <MaterialIcons name="send" size={18} color="white" />
                      }
                    >
                      {t('send')}
                    </Button>
                  </YStack>
                </Card.Footer>
              </Card>
            )}

            {comments.length > 0 ? (
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.comment_id.toString()}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    colors={[isDarkMode ? "blue" : '#4CAF50']}
                    tintColor={isDarkMode ? 'blue' : '#4CAF50'}
                  />
                }
              />
            ) : (
              <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
                <MaterialIcons name="comment" size={48} color={starInactiveColor}/>
                <Text textAlign="center" marginTop="$2" color={subTextColor} fontSize={textSize}>
                  {t('no_comments_yet')}
                </Text>
              </YStack>
            )}
          </YStack>
        )}
      </Stack>
    </Theme>
  );
};

export default CommentsSubPage;