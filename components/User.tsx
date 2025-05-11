import AsyncStorage from '@react-native-async-storage/async-storage';

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

  static async fromStorage(): Promise<User | null> {
    try {
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

  async saveToStorage(): Promise<boolean> {
    try {
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

  async setAvatarName(fileName: string): Promise<boolean> {
    try {
      this.avatar_name = fileName;
      return await this.saveToStorage();
    } catch (error) {
      console.error('Error setting avatar name:', error);
      return false;
    }
  }

  async setName(name: string): Promise<boolean> {
    try {
      this.username = name;
      return await this.saveToStorage();
    } catch (error) {
      console.error('Error setting name:', error);
      return false;
    }
  }

  async setEmail(email: string): Promise<boolean> {
    try {
      this.email = email;
      return await this.saveToStorage();
    } catch (error) {
      console.error('Error setting email:', error);
      return false;
    }
  }

  async setAvatarBase64(base64: string): Promise<boolean> {
    try {
      this.avatar = base64;
      return await this.saveToStorage();
    } catch (error) {
      console.error('Error setting avatar base64:', error);
      return false;
    }
  }

  static async setName(name: string): Promise<boolean> {
    try {
      const user = await User.fromStorage();
      if (!user) {
        console.error('No user data found in storage');
        return false;
      }
      return await user.setName(name);
    } catch (error) {
      console.error('Error in static setName:', error);
      return false;
    }
  }

  static async setEmail(email: string): Promise<boolean> {
    try {
      const user = await User.fromStorage();
      if (!user) {
        console.error('No user data found in storage');
        return false;
      }
      return await user.setEmail(email);
    } catch (error) {
      console.error('Error in static setEmail:', error);
      return false;
    }
  }

  static async setAvatarBase64(base64: string): Promise<boolean> {
    try {
      const user = await User.fromStorage();
      if (!user) {
        console.error('No user data found in storage');
        return false;
      }
      return await user.setAvatarBase64(base64);
    } catch (error) {
      console.error('Error in static setAvatarBase64:', error);
      return false;
    }
  }

  static async setAvatarName(fileName: string): Promise<boolean> {
    try {
      const user = await User.fromStorage();
      if (!user) {
        console.error('No user data found in storage');
        return false;
      }
      return await user.setAvatarName(fileName);
    } catch (error) {
      console.error('Error in static setAvatarName:', error);
      return false;
    }
  }

  static async isPremium(): Promise<boolean> {
    const user = await User.fromStorage();
    return user?.premium || false;
  }

  static async isAdmin(): Promise<boolean> {
    const user = await User.fromStorage();
    return user?.admin || false;
  }

  // For backwards compatibility (can be removed if not used)
  static async getName(name: string): Promise<boolean> {
    return User.setName(name);
  }

  static async getEmail(email: string): Promise<boolean> {
    return User.setEmail(email);
  }

  static async getAvatarBase64(base64: string): Promise<boolean> {
    return User.setAvatarBase64(base64);
  }

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