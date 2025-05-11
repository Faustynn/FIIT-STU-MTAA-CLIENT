import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Alert } from 'react-native';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
}

class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  private constructor() {
    // Initialize auth listener
    auth().onAuthStateChanged(this.handleAuthStateChange);
  }

  public static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  private handleAuthStateChange = (firebaseUser: FirebaseAuthTypes.User | null) => {
    if (firebaseUser) {
      this.currentUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        isAnonymous: firebaseUser.isAnonymous,
      };
    } else {
      this.currentUser = null;
    }

    // Notify listeners
    this.notifyAuthStateListeners();
  };

  private notifyAuthStateListeners(): void {
    this.authStateListeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.error('Error notifying auth state listener:', e);
      }
    });
  }

  public addAuthStateListener(listener: (user: User | null) => void): void {
    this.authStateListeners.push(listener);
    // Immediately notify with current state
    listener(this.currentUser);
  }

  public removeAuthStateListener(listener: (user: User | null) => void): void {
    const index = this.authStateListeners.indexOf(listener);
    if (index !== -1) {
      this.authStateListeners.splice(index, 1);
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  public async signInAnonymously(): Promise<User | null> {
    try {
      const userCredential = await auth().signInAnonymously();
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        isAnonymous: userCredential.user.isAnonymous,
      };
    } catch (error) {
      console.error('Anonymous sign-in error:', error);
      Alert.alert('Sign In Error', 'Failed to sign in anonymously.');
      return null;
    }
  }

  public async signInWithEmailAndPassword(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        isAnonymous: userCredential.user.isAnonymous,
      };
    } catch (error) {
      console.error('Email/password sign-in error:', error);
      Alert.alert('Sign In Error', 'Invalid email or password.');
      return null;
    }
  }

  public async createUserWithEmailAndPassword(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        isAnonymous: userCredential.user.isAnonymous,
      };
    } catch (error) {
      console.error('User creation error:', error);
      Alert.alert('Registration Error', 'Failed to create account. The email may already be in use.');
      return null;
    }
  }

  public async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Sign Out Error', 'Failed to sign out.');
    }
  }

  public async updateProfile(displayName: string): Promise<void> {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await currentUser.updateProfile({ displayName });
        // Update local user info
        this.handleAuthStateChange(auth().currentUser);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Update Error', 'Failed to update profile.');
    }
  }

  public getAuthToken(): Promise<string | null> {
    return new Promise(async (resolve) => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          resolve(null);
          return;
        }

        const token = await currentUser.getIdToken();
        resolve(token);
      } catch (error) {
        console.error('Error getting auth token:', error);
        resolve(null);
      }
    });
  }
}

export default FirebaseAuthService.getInstance();