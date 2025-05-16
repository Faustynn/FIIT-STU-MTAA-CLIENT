module.exports = {
  preset: 'react-native',
  // Используем node вместо jsdom чтобы избежать проблем с зависимостями
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  // Трансформация нужна только для требуемых файлов
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native)/)'
  ],
  setupFiles: [],
};