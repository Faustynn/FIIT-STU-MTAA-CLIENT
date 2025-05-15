import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, TextInput, FlatList, TouchableOpacity, ScrollView, useWindowDimensions, } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { YStack, H1, Theme, XStack, Text, View, Button, Input, Spinner } from 'tamagui';

import ConfirmationModal from '../components/ConfirmationModal';
import { useTheme, getFontSizeValue } from '../components/SettingsController';
import User from '../components/User';
import {
  buyPremium,
  changeUserEmail,
  changeUserName,
  deleteComments,
  deleteUser,
  updateUserAvatar,
} from '../services/apiService';

type AvatarSelectionModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSelectAvatar: (avatarId: string) => void;
  onTakePhoto: () => void;
  onChooseFromGallery: () => void;
  isDarkMode: boolean;
  textSize: number;
  highContrast: boolean;
};

const standardAvatars = [
  { id: '0', source: require('../assets/avatars/0.png'), role: 'premium' }, // only premium user
  { id: '1', source: require('../assets/avatars/1.png'), role: 'premium' }, // only premium user
  { id: '2', source: require('../assets/avatars/2.png'), role: 'admin' }, // only admin users
  { id: '3', source: require('../assets/avatars/3.png'), role: 'all' },
  { id: '4', source: require('../assets/avatars/4.png'), role: 'all' },
  { id: '5', source: require('../assets/avatars/5.png'), role: 'all' },
  { id: '6', source: require('../assets/avatars/6.png'), role: 'all' },
  { id: '7', source: require('../assets/avatars/7.png'), role: 'all' },
  { id: '8', source: require('../assets/avatars/8.png'), role: 'all' },
  { id: '9', source: require('../assets/avatars/9.png'), role: 'all' },
];

const buttontextSize = 12;

type ProfilePageProps = {
  navigation: NavigationProp<any>;
};

// Изменения в компоненте AvatarSelectionModal
const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ isVisible, onClose, onSelectAvatar, onTakePhoto, onChooseFromGallery, isDarkMode, textSize, highContrast, }) => {
  const { t } = useTranslation();
  const [isPremium, setIsPremium] = useState(false);
  const [filteredAvatars, setFilteredAvatars] = useState<typeof standardAvatars>([]);
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (isVisible) {
        const premiumStatus = await User.isPremium();
        setIsPremium(premiumStatus);
      }
    };

    checkPremiumStatus();
  }, [isVisible]);

  useEffect(() => {
    const filterAvatars = async () => {
      if (isVisible) {
        const isAdmin = await User.isAdmin();

        const filtered = await Promise.all(
          standardAvatars.map(async (avatar) => {
            if (avatar.role === 'all') return true;
            if (avatar.role === 'premium' && isPremium) return true;
            if (avatar.role === 'admin' && isAdmin) return true;
            return false;
          })
        );

        setFilteredAvatars(standardAvatars.filter((_, index) => filtered[index]));
      }
    };

    filterAvatars();
  }, [isPremium, isVisible]);

  const headerTextColor = highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '$blue600';
  const buttonTextColor = highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '#FFFFFF';
  const secondaryButtonColor = highContrast ? '#FFA500' : isDarkMode ? '#79E3A5' : '#4A86E8';

  return (
    <ConfirmationModal
      isVisible={isVisible}
      onClose={onClose}
      title={t('choose_avatar')}
      confirmText=""
      cancelText={t('cancel')}
      isDarkMode={isDarkMode}
      hideConfirmButton>
      <YStack space="$4" width="100%">
        <Text color={headerTextColor} textAlign="center" fontSize={textSize} fontWeight="600">
          {t('standard_avatars')}
        </Text>

        {/* Grid filtered avatars */}
        <FlatList
          data={filteredAvatars}
          numColumns={5}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelectAvatar(item.id)}
              style={{
                width: '20%',
                aspectRatio: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 8,
              }}>
              <View
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={isDarkMode ? '#3D4049' : '#F5F5F5'}
                alignItems="center"
                justifyContent="center"
                borderWidth={1}
                borderColor="#DDDDDD"
                overflow="hidden">
                <Image source={item.source} style={{ width: 40, height: 40 }} resizeMode="cover" />
              </View>
            </TouchableOpacity>
          )}
          style={{ maxHeight: 180 }}
        />

        <XStack space="$2" paddingBottom={"$3"} justifyContent="space-between">
          <Button
            flex={1}
            backgroundColor={secondaryButtonColor}
            color={buttonTextColor}
            fontSize={textSize}
            fontWeight="bold"
            paddingVertical="$0"
            borderRadius="$0"
            onPress={onChooseFromGallery}>
            <Icon
              name="photo-library"
              size={textSize}
              color={buttonTextColor}
              style={{ marginRight: 8 }}
            />
            {t('from_gallery')}
          </Button>

          <Button
            flex={1}
            backgroundColor={secondaryButtonColor}
            color={buttonTextColor}
            fontSize={textSize}
            fontWeight="bold"
            paddingVertical="$0"
            borderRadius="$0"
            onPress={onTakePhoto}>
            <Icon
              name="camera-alt"
              size={textSize}
              color={buttonTextColor}
              style={{ marginRight: 8 }}
            />
            {t('take_photo')}
          </Button>
        </XStack>
      </YStack>
    </ConfirmationModal>
  );
};

const ProfilePage: React.FC<ProfilePageProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, fontSize, highContrast } = useTheme();
  const textSize = getFontSizeValue(fontSize);
  const isDarkMode = theme === 'dark';

  // Modal visibility states
  const [isUsernameModalVisible, setIsUsernameModalVisible] = useState(false);
  const [isDeleteUserModalVisible, setIsDeleteUserModalVisible] = useState(false);
  const [isDeleteCommentsModalVisible, setIsDeleteCommentsModalVisible] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);

  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [email, setEmail] = useState('');

  // App states
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Theme colors
  const backgroundColor = highContrast ? '#000000' : isDarkMode ? '#191C22' : '$gray50';
  const headerTextColor = highContrast ? '#FFD700' : isDarkMode ? '#FFFFFF' : '$blue600';
  const subTextColor = highContrast ? '#FFFFFF' : isDarkMode ? '#A0A7B7' : '$gray800';
  const inputBackgroundColor = highContrast ? '#000000' : isDarkMode ? '#2A2F3B' : '#F5F5F5';
  const primaryButtonColor = highContrast ? '#FFD700' : isDarkMode ? '#79E3A5' : '#4A86E8';
  const secondaryButtonColor = highContrast ? '#FFA500' : isDarkMode ? '#79E3A5' : '#4A86E8';
  const dangerButtonColor = highContrast ? '#FF4444' : '#FF617D';

  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      const premiumStatus = await User.isPremium();
      setIsPremium(premiumStatus);
    };

    checkPremiumStatus();
  }, []);

  useEffect(() => {
    const fetchAndParseUser = async () => {
      try {
        const storedUser = await User.fromStorage();
        if (storedUser) {
          setUser(storedUser);
          setNewUsername(storedUser.username);
          setHasData(true);
        } else {
          setHasData(false);
        }
      } catch (error) {
        console.error(t('error_fetching_user'), error);
        setHasData(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndParseUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setUser(null);
    setHasData(false);
    navigation.navigate('Login');
  };

  const handleSaveUsername = async () => {
    if (!newUsername || !newUsername.trim()) {
      setError(t('username_cannot_be_empty'));
      return;
    }

    try {
      const isChanged = await changeUserName(user?.email || '', newUsername.trim());

      if (isChanged) {
        setSuccessMessage(t('change_username_success'));
        setError(null);

        if (user) {
          const updatedUser = new User({ ...user, username: newUsername.trim() });
          await updatedUser.saveToStorage();
          setUser(updatedUser);
        }
      } else {
        setError(t('change_username_failed'));
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error(err);
      setError(t('change_username_failed'));
    } finally {
      setIsUsernameModalVisible(false);
    }
  };

  const handlePremium = async () => {
    if (!user) return;

    try {
      const isChanged = await buyPremium(user.login || 'none');

      if (isChanged) {
        setSuccessMessage(t('buy_prem_success'));
        setError(null);

        // Update user with premium
        const updatedUser = new User({ ...user, premium: true });
        await updatedUser.saveToStorage();
        setUser(updatedUser);

        setIsPremium(true);
      } else {
        setError(t('buy_prem_failed'));
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error(err);
      setError(t('buy_prem_failed'));
    }
  };

  const handleDeleteUser = async () => {
    try {
      const isChanged = await deleteUser(user?.id);

      if (isChanged) {
        setSuccessMessage(t('delete_user_success'));
        setError(null);
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        setError(t('delete_user_failed'));
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error(err);
      setError(t('delete_user_failed'));
    } finally {
      setIsDeleteUserModalVisible(false);
    }
  };

  const handleEmailChange = async () => {
    if (!email || !email.trim()) {
      setError(t('email_cannot_be_empty'));
      return;
    }

    try {
      const isChanged = await changeUserEmail(user?.login || '', email.trim());

      if (isChanged && user) {
        setSuccessMessage(t('email_changed_success'));
        setError(null);

        // Update user with new email
        const updatedUser = new User({ ...user, email: email.trim() });
        await updatedUser.saveToStorage();
        setUser(updatedUser);
        setEmail('');
      } else {
        setError(t('email_changed_failed'));
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error(err);
      setError(t('email_changed_failed'));
    }
  };

  const handleDeleteComments = async () => {
    try {
      const isChanged = await deleteComments(user?.id);

      if (isChanged) {
        setSuccessMessage(t('delete_comments_success'));
        setError(null);
      } else {
        setError(t('delete_comments_failed'));
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error(err);
      setError(t('delete_comments_failed'));
    } finally {
      setIsDeleteCommentsModalVisible(false);
    }
  };

  const handlePicture = async () => {
    setIsAvatarModalVisible(true);
  };

  const handleSelectStandardAvatar = async (avatarId: string) => {
    try {
      setIsLoading(true);
      const avatarAsset = standardAvatars.find((avatar) => avatar.id === avatarId)?.source;

      if (!avatarAsset || !user) {
        throw new Error('Avatar or user not found');
      }

      const asset = Asset.fromModule(avatarAsset);
      await asset.downloadAsync();
      const assetUri = asset.localUri || asset.uri;

      const base64Data = await FileSystem.readAsStringAsync(assetUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileName = `${avatarId}`;

      const isUpdated = await updateUserAvatar(user.id, base64Data, fileName);

      if (isUpdated) {
        const updatedUser = new User({ ...user, avatar: base64Data, avatar_name: fileName });
        await updatedUser.saveToStorage();
        setUser(updatedUser);
        setSuccessMessage(t('avatar_updated_success'));
        setError(null);
      } else {
        setError(t('avatar_update_failed'));
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError(t('avatar_update_failed'));
    } finally {
      setIsLoading(false);
      setIsAvatarModalVisible(false);
    }
  };

  const processAndUploadImage = async (imageUri: string) => {
    try {
      setIsLoading(true);

      if (!user) {
        throw new Error('User not found');
      }

      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error("Image file doesn't exist");
      }

      let base64Data;
      try {
        base64Data = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (err) {
        console.error('Error reading file as base64:', err);
        throw new Error('Could not read image file');
      }

      const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `avatar_custom_${Date.now()}.${fileExtension}`;

      const isUpdated = await updateUserAvatar(user.id, base64Data, fileName);
      if (isUpdated) {
        const updatedUser = new User({ ...user, avatar: base64Data, avatar_name: fileName });
        await updatedUser.saveToStorage();
        setUser(updatedUser);

        setSuccessMessage(t('avatar_updated_success'));
        setError(null);

        setUser(null);
        setTimeout(() => setUser(updatedUser), 0);
      } else {
        setError(t('avatar_update_failed'));
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error('Error processing and uploading image:', err);
      setError(t('avatar_update_failed'));
    } finally {
      setIsLoading(false);
      setIsAvatarModalVisible(false);
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); // ask permissions

      if (status !== 'granted') {
        setError(t('gallery_permission_denied'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        await processAndUploadImage(selectedImage.uri);
      }
    } catch (err) {
      console.error('Error choosing from gallery:', err);
      setError(t('image_selection_failed'));
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync(); // ask camera permission

      if (status !== 'granted') {
        setError(t('camera_permission_denied'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const takenPhoto = result.assets[0];
        await processAndUploadImage(takenPhoto.uri);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      setError(t('photo_capture_failed'));
    }
  };

  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={backgroundColor}>
        <Spinner size="large" color={headerTextColor} />
      </YStack>
    );
  }

  const inputStyle = {
    borderWidth: 1,
    borderColor: isDarkMode ? '#3D4049' : '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: isDarkMode ? '#191C22' : '#F5F5F5',
    color: isDarkMode ? '#FFFFFF' : '#000000',
  };

  return (
    <Theme name={isDarkMode ? 'dark' : 'light'}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: 32,
          paddingHorizontal: 16,
          alignItems: 'center',
        }}
        style={{ flex: 1, backgroundColor }}>
        <YStack width={isLandscape ? '85%' : '100%'}>
          {/* Header */}
          <XStack padding="$4" paddingTop="$6" justifyContent="space-between" alignItems="center">
            <H1 fontSize={textSize + 14} fontWeight="bold" color={headerTextColor}>
              UNIMAP
            </H1>
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
                    @{t('guest')}
                  </Text>
                )}
              </YStack>
              <View
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={isDarkMode ? '#2A2F3B' : '#CCCCCC'}
                alignItems="center"
                justifyContent="center"
                overflow="hidden">
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
          </XStack>

          {!hasData && (
            <YStack alignItems="center" justifyContent="center" flex={1}>
              <Text color={subTextColor} fontSize={textSize}>
                {t('no_data_found')}
              </Text>
            </YStack>
          )}

          {/* Username Change Modal */}
          <ConfirmationModal
            isVisible={isUsernameModalVisible}
            onClose={() => setIsUsernameModalVisible(false)}
            onConfirm={handleSaveUsername}
            title={t('enter_new_username')}
            confirmText={t('save')}
            cancelText={t('cancel')}
            confirmButtonColor={secondaryButtonColor}
            isDarkMode={isDarkMode}>
            <TextInput
              style={inputStyle}
              placeholder={t('new_username')}
              maxFontSizeMultiplier={textSize}
              placeholderTextColor={isDarkMode ? '#A0A7B7' : '#757575'}
              value={newUsername}
              onChangeText={setNewUsername}
            />
          </ConfirmationModal>

          {/* Delete User Confirmation Modal */}
          <ConfirmationModal
            isVisible={isDeleteUserModalVisible}
            onClose={() => setIsDeleteUserModalVisible(false)}
            onConfirm={handleDeleteUser}
            title={t('confirm_delete_user')}
            message={t('delete_user_warning')}
            confirmText={t('delete')}
            cancelText={t('cancel')}
            confirmButtonColor={dangerButtonColor}
            isDarkMode={isDarkMode}
          />

          {/* Delete Comments Confirmation Modal */}
          <ConfirmationModal
            isVisible={isDeleteCommentsModalVisible}
            onClose={() => setIsDeleteCommentsModalVisible(false)}
            onConfirm={handleDeleteComments}
            title={t('confirm_delete_comments')}
            message={t('delete_comments_warning')}
            confirmText={t('delete')}
            cancelText={t('cancel')}
            confirmButtonColor={dangerButtonColor}
            isDarkMode={isDarkMode}
          />

          {/* Avatar Selection Modal */}
          <AvatarSelectionModal
            isVisible={isAvatarModalVisible}
            onClose={() => setIsAvatarModalVisible(false)}
            onSelectAvatar={handleSelectStandardAvatar}
            onTakePhoto={handleTakePhoto}
            onChooseFromGallery={handleChooseFromGallery}
            isDarkMode={isDarkMode}
            textSize={textSize}
            highContrast={highContrast}
          />

          {/* Main Content */}
          <YStack flex={1} paddingHorizontal="$4" space="$5">
            {/* Error and Success Messages */}
            {error && (
              <Text color={dangerButtonColor} fontSize={textSize} textAlign="center">
                {error}
              </Text>
            )}
            {successMessage && (
              <Text color={primaryButtonColor} fontSize={textSize} textAlign="center">
                {successMessage}
              </Text>
            )}

            {/* Profile Title */}
            <Text fontSize={textSize + 12} fontWeight="bold" color={headerTextColor}>
              {t('profile')}
            </Text>

            {/* Profile Info */}
            <XStack space="$4" alignItems="flex-start">
              <YStack alignItems="center" space="$2">
                <View
                  width={100}
                  height={100}
                  borderRadius={50}
                  backgroundColor="#FFFFFF"
                  alignItems="center"
                  justifyContent="center"
                  overflow="hidden"
                  borderWidth={1}
                  borderColor="#DDDDDD">
                  {hasData && user?.getAvatarBase64() ? (
                    <Image
                      source={{ uri: `data:image/png;base64,${user.getAvatarBase64()}` }}
                      style={{ width: 100, height: 100, borderRadius: 50 }}
                    />
                  ) : (
                    <Text>😏</Text>
                  )}
                </View>

                {/* Change Pic Button */}
                <Button
                  size="$2"
                  fontSize={textSize - 2}
                  paddingHorizontal="$2"
                  backgroundColor="#3D4049"
                  color="#FFFFFF"
                  onPress={handlePicture}>
                  {t('change_pic')}
                </Button>
              </YStack>

              {/* User Info */}
              <YStack flex={1} space="$4">
                <YStack>
                  {hasData ? (
                    <>
                      <View style={{ position: 'relative' }}>
                        <Text color={headerTextColor} fontSize={textSize + 6} fontWeight="bold">
                          {user?.getFullName()}
                        </Text>
                        <Button
                          onPress={() => setIsUsernameModalVisible(true)}
                          backgroundColor="transparent"
                          padding="$0"
                          style={{
                            position: 'absolute',
                            top: -20,
                            right: 120,
                            zIndex: 1,
                          }}>
                          <Icon
                            name="edit"
                            size={18}
                            color={isDarkMode ? '#FFFFFF' : '#000000'}
                          />
                        </Button>
                      </View>
                      <Text color={subTextColor} fontSize={textSize - 4}>
                        @{user?.login}
                      </Text>
                    </>
                  ) : (
                    <Text color={subTextColor} fontSize={textSize - 4}>
                      @{t('guest')}
                    </Text>
                  )}
                </YStack>

                {/* Premium Button */}
                {!isPremium && (
                  <Button
                    backgroundColor={primaryButtonColor}
                    fontSize={textSize}
                    color="#FFFFFF"
                    fontWeight="bold"
                    paddingVertical="$2"
                    onPress={handlePremium}>
                    {t('b_premium')}
                  </Button>
                )}
              </YStack>
            </XStack>

            {/* Email Section */}
            <YStack space="$2" marginTop="$2">
              <Text color={subTextColor} fontSize={textSize}>
                {t('email')}
              </Text>
              <XStack space="$2" alignItems="center">
                <Input
                  flex={1}
                  value={email}
                  maxFontSizeMultiplier={textSize}
                  onChangeText={setEmail}
                  backgroundColor={inputBackgroundColor}
                  borderRadius={8}
                  padding="$3"
                  color={headerTextColor}
                  placeholder={user?.email || ''}
                />
                <Button
                  backgroundColor={secondaryButtonColor}
                  color="#FFFFFF"
                  fontSize={buttontextSize}
                  fontWeight="bold"
                  onPress={handleEmailChange}>
                  {t('change_btn')}
                </Button>
              </XStack>
            </YStack>

            {/* Password Section */}
            <YStack space="$2">
              <Text color={subTextColor} fontSize={textSize}>
                {t('change_password')}
              </Text>
              <Button
                backgroundColor={secondaryButtonColor}
                color="#FFFFFF"
                fontSize={buttontextSize}
                fontWeight="bold"
                onPress={() => navigation.navigate('ForgotPasswordPage')}>
                {t('change_pass_btn')}
              </Button>
            </YStack>

            {/* Privacy Section */}
            <YStack space="$3" marginTop="$2">
              <Text color={subTextColor} fontSize={textSize}>
                {t('privacy')}
              </Text>
              <XStack space="$3">
                <Button
                  flex={1}
                  fontSize={buttontextSize}
                  backgroundColor={secondaryButtonColor}
                  color="#FFFFFF"
                  fontWeight="bold"
                  onPress={() => setIsDeleteUserModalVisible(true)}>
                  {t('d_user')}
                </Button>
                <Button
                  flex={1}
                  backgroundColor={secondaryButtonColor}
                  color="#FFFFFF"
                  fontSize={buttontextSize}
                  fontWeight="bold"
                  onPress={() => setIsDeleteCommentsModalVisible(true)}>
                  {t('d_comm')}
                </Button>
              </XStack>
            </YStack>

            {/* Logout */}
            <Button
              fontSize={buttontextSize}
              backgroundColor={dangerButtonColor}
              color="#FFFFFF"
              fontWeight="bold"
              onPress={handleLogout}
              marginTop="$2">
              {t('logout')}
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </Theme>
  );
};

export default ProfilePage;
