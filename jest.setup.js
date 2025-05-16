jest.mock('react-native', () => ({
  Platform: { select: jest.fn() },
  StyleSheet: { create: jest.fn() },
  Text: 'Text',
  View: 'View',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
}));

jest.mock('./src/context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
  }),
}));

jest.mock('./src/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007bff',
      background: '#ffffff',
      text: '#000000',
      tertiary: '#999999',
    },
  }),
}));
