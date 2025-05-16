import { mockProfile, mockActions, mockModals } from '../../__mocks__/profileMocks';

describe('Profile Page UI Tests', () => {
  test('renders profile elements correctly', () => {
    const { elements } = mockProfile.render({
      username: 'TestUser',
      email: 'test@example.com',
      isPremium: false,
      theme: 'light',
    });

    expect(elements.avatar).toBeTruthy();
    expect(elements.username).toBe('TestUser');
    expect(elements.email).toBe('test@example.com');
    expect(elements.premiumButton).toBeTruthy();
  });

  test('handles username change correctly', async () => {
    const { result } = await mockActions.changeUsername({
      oldUsername: 'TestUser',
      newUsername: 'NewTestUser',
    });

    expect(result.success).toBe(true);
    expect(result.updatedUsername).toBe('NewTestUser');
    expect(result.modalClosed).toBe(true);
  });

  test('opens avatar selection modal', () => {
    const { modal } = mockModals.openAvatarSelection({
      avatars: ['avatar1.png', 'avatar2.png'],
      canSelectPremium: false,
    });

    expect(modal.isVisible).toBe(true);
    expect(modal.avatarCount).toBe(2);
    expect(modal.buttons).toContain('Take Photo');
  });

  test('handles premium purchase flow', async () => {
    const { purchase } = await mockActions.buyPremium({
      userId: '123',
      currentStatus: false,
    });

    expect(purchase.success).toBe(true);
    expect(purchase.newStatus).toBe('premium');
    expect(purchase.updatedUI).toBe(true);
  });

  test('handles user deletion flow', async () => {
    const { deletion } = await mockActions.deleteUser({
      userId: '123',
      showConfirmation: true,
    });

    expect(deletion.confirmed).toBe(true);
    expect(deletion.accountRemoved).toBe(true);
    expect(deletion.navigatedToLogin).toBe(true);
  });
});
