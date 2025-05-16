export const mockProfile = {
  render: (config) => ({
    elements: {
      avatar: true,
      username: config.username,
      email: config.email,
      premiumButton: !config.isPremium,
    },
  }),
};

export const mockActions = {
  changeUsername: async (config) => ({
    result: {
      success: true,
      updatedUsername: config.newUsername,
      modalClosed: true,
    },
  }),

  buyPremium: async (config) => ({
    purchase: {
      success: true,
      newStatus: 'premium',
      updatedUI: true,
    },
  }),

  deleteUser: async (config) => ({
    deletion: {
      confirmed: true,
      accountRemoved: true,
      navigatedToLogin: true,
    },
  }),
};

export const mockModals = {
  openAvatarSelection: (config) => ({
    modal: {
      isVisible: true,
      avatarCount: config.avatars.length,
      buttons: ['Take Photo', 'Choose from Gallery', 'Cancel'],
    },
  }),
};
