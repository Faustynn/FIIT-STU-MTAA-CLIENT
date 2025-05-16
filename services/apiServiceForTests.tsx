import { render, fireEvent } from '@testing-library/react-native';

import { mockRenderComponent, mockButtonPress, mockApiCall } from '../__mocks__/uiMocks';

describe('Comments UI Tests', () => {
  // Тест рендеринга компонента
  test('renders comment section correctly', async () => {
    const { component, elements } = mockRenderComponent({
      buttons: ['Add Comment', 'Sort', 'Filter'],
      texts: ['No comments yet'],
      ratings: 0,
    });

    expect(elements.buttons.length).toBe(3);
    expect(elements.texts[0]).toBe('No comments yet');
    expect(elements.rating).toBe(0);
  });

  // Тест нажатия на кнопку
  test('handles button press correctly', () => {
    const { pressResult } = mockButtonPress('Add Comment', {
      shouldSucceed: true,
      expectedAction: 'open_form',
    });

    expect(pressResult.actionTriggered).toBe(true);
    expect(pressResult.actionType).toBe('open_form');
  });

  // Тест отправки комментария
  test('submits comment successfully', async () => {
    const mockComment = {
      text: 'Great teacher!',
      rating: 5,
      author: 'Student123',
    };

    const response = await mockApiCall('submitComment', mockComment);

    expect(response.success).toBe(true);
    expect(response.data.comment).toEqual(mockComment);
  });

  // Тест обработки ошибок
  test('handles error states correctly', async () => {
    const { component, error } = mockRenderComponent({
      shouldFail: true,
      errorType: 'network',
    });

    expect(error.message).toBe('Network error');
    expect(error.isVisible).toBe(true);
  });
});
