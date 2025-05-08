import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accelerometer } from 'expo-sensors';

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  gestureNavigationEnabled: boolean;
  toggleGestureNavigation: () => void;
  currentTiltDirection: number | null;
  gestureMode: 'shake' | 'tilt' | 'both';
  setGestureMode: (mode: 'shake' | 'tilt' | 'both') => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const GESTURE_NAVIGATION_KEY = '@app_gesture_navigation_enabled';
const THEME_STORAGE_KEY = '@app_theme';
const GESTURE_MODE_KEY = '@app_gesture_mode';

type TiltNavigationEventType = { direction: number | null; };
export const TiltNavigationEvent = {
  listeners: new Set<(event: TiltNavigationEventType) => void>(),

  emit(event: TiltNavigationEventType) {
    this.listeners.forEach(listener => listener(event));
  },

  addListener(listener: (event: TiltNavigationEventType) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
};


export const ThemeProvider: React.FC<React.PropsWithChildren<object>> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [gestureNavigationEnabled, setGestureNavigationEnabled] = useState<boolean>(false);
  const [gestureMode, setGestureMode] = useState<'shake' | 'tilt' | 'both'>('both');
  const [currentTiltDirection, setCurrentTiltDirection] = useState<number | null>(null);

  // gesture detection
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const lastShakeTime = useRef(0);
  const lastTiltTime = useRef(0);
  const tiltDeadzone = useRef(false);
  const accelerometerSubscription = useRef<any>(null);

  // init theme and settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme) {
          setTheme(storedTheme as 'light' | 'dark');
        }

        const storedGestureNavigation = await AsyncStorage.getItem(GESTURE_NAVIGATION_KEY);
        if (storedGestureNavigation !== null) {
          setGestureNavigationEnabled(storedGestureNavigation === 'true');
        }

        const storedGestureMode = await AsyncStorage.getItem(GESTURE_MODE_KEY);
        if (storedGestureMode !== null &&
          (storedGestureMode === 'shake' ||
            storedGestureMode === 'tilt' ||
            storedGestureMode === 'both')) {
          setGestureMode(storedGestureMode as 'shake' | 'tilt' | 'both');
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  // Save theme preference
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      } catch (error) {
        console.error("Error saving theme setting:", error);
      }
    };

    saveTheme();
  }, [theme]);

  // Save gesture preference
  useEffect(() => {
    const saveGestureNavigation = async () => {
      try {
        await AsyncStorage.setItem(GESTURE_NAVIGATION_KEY, gestureNavigationEnabled.toString());
      } catch (error) {
        console.error("Error saving gesture navigation setting:", error);
      }
    };

    saveGestureNavigation();
  }, [gestureNavigationEnabled]);

  // Save gesture mode preference
  useEffect(() => {
    const saveGestureMode = async () => {
      try {
        await AsyncStorage.setItem(GESTURE_MODE_KEY, gestureMode);
      } catch (error) {
        console.error("Error saving gesture mode setting:", error);
      }
    };

    saveGestureMode();
  }, [gestureMode]);

  // Start &stop accelerometer
  useEffect(() => {
    const startAccelerometer = async () => {
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
        accelerometerSubscription.current = null;
      }

      if (gestureNavigationEnabled) {
        await Accelerometer.setUpdateInterval(100);

        accelerometerSubscription.current = Accelerometer.addListener(handleAccelerometerData);
      }
    };

    startAccelerometer();

    return () => {
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
        accelerometerSubscription.current = null;
      }
    };
  }, [gestureNavigationEnabled, gestureMode]);

  const handleAccelerometerData = (accelerometerData: { x: number; y: number; z: number }) => {
    const { x, y, z } = accelerometerData;
    const now = Date.now();

    if (gestureNavigationEnabled && (gestureMode === 'shake' || gestureMode === 'both')) {
      const SHAKE_TIMEOUT = 2000; // 2sec cooldown
      const SHAKE_THRESHOLD = 1.8; // add  threshold

      const deltaX = Math.abs(x - lastAcceleration.current.x);
      const deltaY = Math.abs(y - lastAcceleration.current.y);
      const deltaZ = Math.abs(z - lastAcceleration.current.z);

      const timeDifference = now - lastShakeTime.current;

      if (timeDifference > SHAKE_TIMEOUT && deltaY > SHAKE_THRESHOLD && deltaX < SHAKE_THRESHOLD && deltaZ < SHAKE_THRESHOLD) { // check shake in y axis
        toggleTheme();
        lastShakeTime.current = now;
      }
    }

    if (gestureNavigationEnabled && (gestureMode === 'tilt' || gestureMode === 'both')) {
      const TILT_TIMEOUT = 700;
      const TILT_THRESHOLD = 0.65;
      const TILT_RETURN_THRESHOLD = 0.3;

      const tiltTimeDifference = now - lastTiltTime.current;

      if (tiltTimeDifference > TILT_TIMEOUT) {
        if (x < -TILT_THRESHOLD && !tiltDeadzone.current) {
          setCurrentTiltDirection(1);
          TiltNavigationEvent.emit({ direction: 1 });
          lastTiltTime.current = now;
          tiltDeadzone.current = true;
        } else if (x > TILT_THRESHOLD && !tiltDeadzone.current) {
          setCurrentTiltDirection(-1);
          TiltNavigationEvent.emit({ direction: -1 });
          lastTiltTime.current = now;
          tiltDeadzone.current = true;
        } else if (Math.abs(x) < TILT_RETURN_THRESHOLD) {
          setCurrentTiltDirection(null);
          tiltDeadzone.current = false;
        }
      }
    }

    lastAcceleration.current = { x, y, z };
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleGestureNavigation = () => {
    setGestureNavigationEnabled(prev => !prev);
  };

  return (<ThemeContext.Provider value={{ theme, toggleTheme, gestureNavigationEnabled, toggleGestureNavigation, currentTiltDirection, gestureMode, setGestureMode }}>{children}</ThemeContext.Provider>);
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};