export const mockUIElements = (config) => ({
  sections: ['appearance', 'gestureNavigation', 'notification', 'language', 'displ_sett'],
});

export const mockInteractions = {
  toggleTheme: (config) => ({
    theme: {
      current: config.expectedState ? 'dark' : 'light',
    },
    toggleResult: {
      success: true,
    },
  }),

  changeLanguage: (config) => ({
    language: {
      current: config.to,
    },
    changeResult: {
      success: true,
    },
  }),
};

export const mockSettings = {
  updateGestures: (config) => ({
    gestureSettings: {
      enabled: config.enabled,
      mode: config.mode,
    },
  }),

  updateNotifications: (config) => ({
    notifications: {
      enabled: config.enabled,
      sound: config.sound,
    },
  }),
};
