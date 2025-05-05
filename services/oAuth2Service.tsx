import { EnvLoader } from '../utils/EnvLoader';

//oAuth2 settings
// Google
const GOOGLE_CLIENT_ID = EnvLoader.getGoogleClientId();
const GOOGLE_CLIENT_SECRET = EnvLoader.getGoogleClientSecret();
const OAUTH2_GOOGLE_REDIR = "http://localhost:3000/api/unimap_pc/oauth2/google";

// Facebook
const FACEBOOK_CLIENT_ID = EnvLoader.getFacebookClientId();
const FACEBOOK_CLIENT_SECRET = EnvLoader.getFacebookClientSecret();
const OAUTH2_FACEBOOK_REDIR = "http://localhost:3000/api/unimap_pc/oauth2/facebook";

// OAuth2 login URL
const OAUTH2_LOGIN_URL = "http://localhost:8080/api/unimap_pc/oauth2/login";
