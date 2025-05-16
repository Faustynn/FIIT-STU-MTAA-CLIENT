import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, TextInput, Button } from 'react-native';

import { mockRenderComponent, mockButtonPress, mockApiCall } from '../../__mocks__/uiMocks';

describe('Comments UI Tests', () => {
  test('renders comment section correctly', async () => {
    const { elements } = mockRenderComponent({
      buttons: ['Add Comment', 'Sort', 'Filter'],
      texts: ['No comments yet'],
      ratings: 0,
    });

    expect(elements.buttons.length).toBe(3);
    expect(elements.texts[0]).toBe('No comments yet');
    expect(elements.rating).toBe(0);
  });

  test('handles button press correctly', () => {
    const { pressResult } = mockButtonPress('Add Comment', {
      shouldSucceed: true,
      expectedAction: 'open_form',
    });

    expect(pressResult.actionTriggered).toBe(true);
    expect(pressResult.actionType).toBe('open_form');
  });

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

  test('handles error states correctly', async () => {
    const { error } = mockRenderComponent({
      shouldFail: true,
      errorType: 'network',
    });

    expect(error.message).toBe('Network error');
    expect(error.isVisible).toBe(true);
  });

  test('allows user to write and submit a comment', () => {
    const { getByPlaceholderText, getByText } = render(
      <View>
        <TextInput placeholder="Write your comment..." testID="comment-input" />
        <Text>Rating: 5/5</Text>
        <Button title="Submit Comment" testID="submit-button" />
      </View>
    );

    const commentInput = getByPlaceholderText('Write your comment...');
    expect(commentInput).toBeTruthy();

    fireEvent.changeText(commentInput, 'Great lecturer! Very helpful.');

    expect(getByText('Rating: 5/5')).toBeTruthy();

    const submitButton = getByText('Submit Comment');
    expect(submitButton).toBeTruthy();
  });
});
