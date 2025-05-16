export const mockRenderComponent = (config: any) => {
  return {
    component: 'MockedComponent',
    elements: {
      buttons: config.buttons || [],
      texts: config.texts || [],
      rating: config.ratings || 0,
    },
    error: config.shouldFail
      ? {
          message: 'Network error',
          isVisible: true,
        }
      : null,
  };
};

export const mockButtonPress = (buttonId: string, config: any) => {
  return {
    pressResult: {
      actionTriggered: config.shouldSucceed,
      actionType: config.expectedAction,
    },
  };
};

export const mockApiCall = async (action: string, data: any) => {
  return Promise.resolve({
    success: true,
    data: {
      comment: data,
    },
  });
};
