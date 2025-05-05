import dotenv from 'dotenv';

// Инициализация dotenv для загрузки переменных окружения
dotenv.config();

export class EnvLoader {
  static getGoogleClientId(): string {
    return process.env.GOOGLE_CLIENT_ID || '';
  }

  static getGoogleClientSecret(): string {
    return process.env.GOOGLE_CLIENT_SECRET || '';
  }

  static getFacebookClientId(): string {
    return process.env.FACEBOOK_CLIENT_ID || '';
  }

  static getFacebookClientSecret(): string {
    return process.env.FACEBOOK_CLIENT_SECRET || '';
  }
}