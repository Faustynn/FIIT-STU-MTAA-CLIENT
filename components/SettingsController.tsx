import AsyncStorage from '@react-native-async-storage/async-storage';
import { Accelerometer } from 'expo-sensors';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  gestureNavigationEnabled: boolean;
  toggleGestureNavigation: () => void;
  currentTiltDirection: number | null;
  gestureMode: 'shake' | 'tilt' | 'both';
  setGestureMode: (mode: 'shake' | 'tilt' | 'both') => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const GESTURE_NAVIGATION_KEY = '@app_gesture_navigation_enabled';
const THEME_STORAGE_KEY = '@app_theme';
const GESTURE_MODE_KEY = '@app_gesture_mode';
const FONT_SIZE_KEY = '@app_font_size';
const HIGH_CONTRAST_KEY = '@app_high_contrast';

type TiltNavigationEventType = { direction: number | null };
export const TiltNavigationEvent = {
  listeners: new Set<(event: TiltNavigationEventType) => void>(),

  emit(event: TiltNavigationEventType) {
    this.listeners.forEach((listener) => listener(event));
  },

  addListener(listener: (event: TiltNavigationEventType) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
};

export const ThemeProvider: React.FC<React.PropsWithChildren<object>> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [gestureNavigationEnabled, setGestureNavigationEnabled] = useState<boolean>(false);
  const [gestureMode, setGestureMode] = useState<'shake' | 'tilt' | 'both'>('both');
  const [currentTiltDirection, setCurrentTiltDirection] = useState<number | null>(null);
  const [fontSize, setFontSizeState] = useState<string>('12');
  const [highContrast, setHighContrastState] = useState<boolean>(false);

  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const lastShakeTime = useRef(0);
  const lastTiltTime = useRef(0);
  const tiltDeadzone = useRef(false);
  const accelerometerSubscription = useRef<any>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme) setTheme(storedTheme as 'light' | 'dark');

        const storedGestureNavigation = await AsyncStorage.getItem(GESTURE_NAVIGATION_KEY);
        if (storedGestureNavigation !== null) {
          setGestureNavigationEnabled(storedGestureNavigation === 'true');
        }

        const storedGestureMode = await AsyncStorage.getItem(GESTURE_MODE_KEY);
        if (
          storedGestureMode === 'shake' ||
          storedGestureMode === 'tilt' ||
          storedGestureMode === 'both'
        ) {
          setGestureMode(storedGestureMode);
        }

        const storedFontSize = await AsyncStorage.getItem(FONT_SIZE_KEY);
        if (storedFontSize) setFontSizeState(storedFontSize);

        const storedHighContrast = await AsyncStorage.getItem(HIGH_CONTRAST_KEY);
        if (storedHighContrast !== null) setHighContrastState(storedHighContrast === 'true');
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(THEME_STORAGE_KEY, theme).catch(console.error);
  }, [theme]);

  useEffect(() => {
    AsyncStorage.setItem(GESTURE_NAVIGATION_KEY, gestureNavigationEnabled.toString()).catch(
      console.error
    );
  }, [gestureNavigationEnabled]);

  useEffect(() => {
    AsyncStorage.setItem(GESTURE_MODE_KEY, gestureMode).catch(console.error);
  }, [gestureMode]);

  useEffect(() => {
    AsyncStorage.setItem(FONT_SIZE_KEY, fontSize).catch(console.error);
  }, [fontSize]);

  useEffect(() => {
    AsyncStorage.setItem(HIGH_CONTRAST_KEY, highContrast.toString()).catch(console.error);
  }, [highContrast]);

  const handleAccelerometerData = (accelerometerData: { x: number; y: number; z: number }) => {
    const { x, y, z } = accelerometerData;
    const now = Date.now();

    if (gestureNavigationEnabled && (gestureMode === 'shake' || gestureMode === 'both')) {
      const SHAKE_TIMEOUT = 2000;
      const SHAKE_THRESHOLD = 1.8;

      const deltaX = Math.abs(x - lastAcceleration.current.x);
      const deltaY = Math.abs(y - lastAcceleration.current.y);
      const deltaZ = Math.abs(z - lastAcceleration.current.z);

      const timeDifference = now - lastShakeTime.current;

      if (
        timeDifference > SHAKE_TIMEOUT &&
        deltaY > SHAKE_THRESHOLD &&
        deltaX < SHAKE_THRESHOLD &&
        deltaZ < SHAKE_THRESHOLD
      ) {
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

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleGestureNavigation = () => {
    setGestureNavigationEnabled((prev) => !prev);
  };

  const setFontSize = (size: string) => {
    setFontSizeState(size);
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        gestureNavigationEnabled,
        toggleGestureNavigation,
        currentTiltDirection,
        gestureMode,
        setGestureMode,
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const getFontSizeValue = (size: string, options?: { min?: number; max?: number }) => {
  const parsed = parseInt(size || '12', 10);
  const clamp = (val: number) => {
    if (options?.min && val < options.min) return options.min;
    if (options?.max && val > options.max) return options.max;
    return val;
  };
  return clamp(parsed);
};
