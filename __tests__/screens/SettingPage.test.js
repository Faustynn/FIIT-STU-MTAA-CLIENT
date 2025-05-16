import { mockUIElements, mockInteractions, mockSettings } from '../../__mocks__/settingMocks';

describe('Settings Page UI Tests', () => {
  test('renders settings sections correctly', () => {
    const { sections } = mockUIElements({
      darkMode: true,
      gestures: true,
      notifications: true,
      language: 'en',
    });

    expect(sections).toEqual([
      'appearance',
      'gestureNavigation',
      'notification',
      'language',
      'displ_sett',
    ]);
  });

  test('toggles dark mode correctly', () => {
    const { theme, toggleResult } = mockInteractions.toggleTheme({
      initialState: false,
      expectedState: true,
    });

    expect(toggleResult.success).toBe(true);
    expect(theme.current).toBe('dark');
  });

  test('changes language setting', () => {
    const { language, changeResult } = mockInteractions.changeLanguage({
      from: 'en',
      to: 'sk',
    });

    expect(changeResult.success).toBe(true);
    expect(language.current).toBe('sk');
  });

  test('updates gesture navigation settings', () => {
    const { gestureSettings } = mockSettings.updateGestures({
      enabled: true,
      mode: 'shake',
    });

    expect(gestureSettings.enabled).toBe(true);
    expect(gestureSettings.mode).toBe('shake');
  });

  test('configures notification preferences', () => {
    const { notifications } = mockSettings.updateNotifications({
      enabled: true,
      sound: false,
    });

    expect(notifications.enabled).toBe(true);
    expect(notifications.sound).toBe(false);
  });
});
