import { createAnimations } from '@tamagui/animations-react-native';
import { createInterFont } from '@tamagui/font-inter';
import { createMedia } from '@tamagui/react-native-media-driver';
import { shorthands } from '@tamagui/shorthands';
import { themes, tokens } from '@tamagui/themes';
import { createTamagui, styled, SizableText, H1, YStack, Button as ButtonTamagui } from 'tamagui';

const animations = createAnimations({
  bouncy: {
    damping: 10,
    mass: 0.9,
    stiffness: 100,
    type: 'spring',
  },
  lazy: {
    damping: 20,
    type: 'spring',
    stiffness: 60,
  },
  quick: {
    damping: 20,
    mass: 1.2,
    stiffness: 250,
    type: 'spring',
  },
});

const headingFont = createInterFont();
const bodyFont = createInterFont();

// Custom colors for light and dark themes
const customColors = {
  light: {
    background: '#F5F5F5',
    foreground: '#000000',
    primary: '#3B82F6',  // blue600
    secondary: '#79E3A5', // green for accent
    gray50: '#FAFAFA',
    gray100: '#F5F5F5',
    gray200: '#E5E5E5',
    gray300: '#D4D4D4',
    gray400: '#A3A3A3',
    gray500: '#737373',
    gray600: '#525252',
    gray700: '#404040',
    gray800: '#262626',
    gray900: '#171717',
    blue500: '#3B82F6',
    blue600: '#2563EB',
    blue800: '#1E40AF',
    green500: '#79E3A5',
    green600: '#66D294',
  },
  dark: {
    background: '#191C22',
    foreground: '#FFFFFF',
    primary: '#79E3A5',
    secondary: '#2563EB',
    gray50: '#FAFAFA',
    gray100: '#262A35',
    gray200: '#2a2f3b',
    gray300: '#3A3F4C',
    gray400: '#4D5364',
    gray500: '#646B81',
    gray600: '#777E96',
    gray700: '#A0A7B7',
    gray800: '#BBC0CC',
    gray900: '#DCDFE6',
    blue500: '#3B82F6',
    blue600: '#2563EB',
    blue800: '#1E40AF',
    green500: '#79E3A5',
    green600: '#66D294',
  }
};

// Custom theme tokens
const customTokens = {
  ...tokens,
  color: {
    ...tokens.color,
    ...customColors.light,
  }
};

// Custom themes
const customThemes = {
  ...themes,
  light: {
    ...themes.light,
    ...customColors.light,
  },
  dark: {
    ...themes.dark,
    ...customColors.dark,
  }
};

export const Container = styled(YStack, {
  flex: 1,
  padding: 24,
});

export const Main = styled(YStack, {
  flex: 1,
  justifyContent: 'space-between',
  maxWidth: 960,
});

export const Title = styled(H1, {
  color: '#000',
  size: '$12',
});

export const Subtitle = styled(SizableText, {
  color: '#38434D',
  size: '$9',
});

export const Button = styled(ButtonTamagui, {
  backgroundColor: '#6366F1',
  borderRadius: 28,
  hoverStyle: {
    backgroundColor: '#5a5fcf',
  },
  pressStyle: {
    backgroundColor: '#5a5fcf',
  },
  maxWidth: 500,

  // Shadows
  shadowColor: '#000',
  shadowOffset: {
    height: 2,
    width: 0,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,

  // Button text
  color: '#FFFFFF',
  fontWeight: '600',
  fontSize: 16,
});

const config = createTamagui({
  defaultFont: 'body',
  animations,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    body: bodyFont,
    heading: headingFont,
  },
  themes: customThemes,
  tokens: customTokens,
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  }),
});

type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;