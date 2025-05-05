import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { TamaguiProvider } from 'tamagui';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-match-media-polyfill';

// components
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './components/SettingsController';
import config from './tamagui.config';

SplashScreen.preventAutoHideAsync();

const App = () => {
  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    OutfitBlack: require('./assets/fonts/Outfit-Black.ttf'),
    OutfitBold: require('./assets/fonts/Outfit-Bold.ttf'),
    OutfitExtraBold: require('./assets/fonts/Outfit-ExtraBold.ttf'),
    OutfitExtraLight: require('./assets/fonts/Outfit-ExtraLight.ttf'),
    OutfitLight: require('./assets/fonts/Outfit-Light.ttf'),
    OutfitMedium: require('./assets/fonts/Outfit-Medium.ttf'),
    OutfitRegular: require('./assets/fonts/Outfit-Regular.ttf'),
    OutfitSemiBold: require('./assets/fonts/Outfit-SemiBold.ttf'),
    OutfitThin: require('./assets/fonts/Outfit-Thin.ttf'),
  });


  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [fontsLoaded]);

  if (!appReady) {
    return null;
  }

  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <ThemeProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </TamaguiProvider>
  );
};

export default App;