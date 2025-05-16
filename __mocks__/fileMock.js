module.exports = 'test-file-stub';

export const createMockState = () => ({
  entityType: 'teacher',
  entityName: '',
  isLoading: true,
  isRefreshing: false,
  userRole: 'regular',
  userName: 'profile',
  error: null,
  comments: [],
  averageRating: 0,
  newComment: '',
  rating: 0,
  showCommentForm: false,
  currentUser: null,
});

export const mockApiResponse = () => ({
  data: {
    type: 'teacher',
    role: 'regular',
    rating: 0,
    comments: [],
  },
});

export const mockAuth = {
  login: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: false,
};

export const mockTheme = {
  colors: {
    primary: '#007bff',
    background: '#ffffff',
    text: '#000000',
    tertiary: '#999999',
  },
};
