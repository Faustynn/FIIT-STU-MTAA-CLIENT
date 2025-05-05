export class User {
  id: number;
  username: string;
  login: string;
  email: string;
  admin: boolean;
  premium: boolean;
  avatar: string;
  avatar_name: string;

  constructor(data?: any) {
    this.id = data?.id || 0;
    this.username = data?.username || '';
    this.login = data?.login || '';
    this.email = data?.email || '';
    this.admin = data?.admin || false;
    this.premium = data?.premium || false;
    this.avatar = data?.avatar || '';
    this.avatar_name = data?.avatarFileName || '';
  }

  // Static method to create a User from AsyncStorage data
  static async fromStorage(): Promise<User | null> {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const userData = await AsyncStorage.getItem('USER_DATA');

      if (userData) {
        const parsedData = JSON.parse(userData);
        return new User(parsedData);
      }
      return null;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }

  // Helper method to save user data to AsyncStorage
  async saveToStorage(): Promise<boolean> {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const userData = {
        id: this.id,
        username: this.username,
        login: this.login,
        email: this.email,
        admin: this.admin,
        premium: this.premium,
        avatar: this.avatar,
        avatarFileName: this.avatar_name
      };

      await AsyncStorage.setItem('USER_DATA', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

  // Example methods to get specific data
  getFullName(): string {
    return this.username;
  }

  isAdmin(): boolean {
    return this.admin;
  }

  isPremium(): boolean {
    return this.premium;
  }

  getEmail(): string {
    return this.email;
  }

  getAvatarBase64(): string {
    return this.avatar;
  }
}

export default User;