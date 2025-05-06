import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      home: "Home",
      profile: "Profile",
      settings: "Settings",
      subjects: "Subjects",
      teachers: "Teachers",

      // Home Page
      news_upd: "Latest News and Updates",
      utils: "Useful Utilities",

      fiit_dis: "FIIT Discord",
      fiit_dis_desc: "Official Discord of STU FIIT, provided by teachers and enthusiastic students",

      fx_com: "Fx - com",
      fx_com_desc: "Notion page created by a few students to help others. Here, you can read and download materials for various subjects",

      mladost: "Mladost Guide",
      mladost_desc: "Notion page for students who want to move into or already live in the Mladost dormitory, where you can find many useful tips",

      fiit_tg: "FIIT Telegram",
      fiit_tg_desc: "Telegram channel for foreign students, provided by enthusiastic students",

      // Profile Page
      change_pic: "Change pic",
      b_premium: "Become Premium",
      email: "Email",
      password: "Password (Hold the field to see)",
      change_btn: "Change",
      privacy: "Privacy",
      logout: "Logout",
      d_comm: "Delete comments",

      // Settings Page
      appearance: "Appearance",
      d_mod: "Dark Mode",

      notification: "Notification",
      en_not: "Enable Notification",
      s_not: "Sound Enabled",

      language: "Language",
      en_lang: "English",
      sk_lang: "Slovak",
      ua_lang: "Ukrainian",

      displ_sett: "Display Settings",
      font_s: "Font Size",
      contrast: "Contrast",

      select_language: "Select language",
      select_font: "Select font size",
      select_contrast: "Select contrast level",
      no_data_found: "No data found. Showing default content",

    },
  },
  sk: {
    translation: {
      // Navigation
      home: "Domov",
      profile: "Profil",
      settings: "Nastavenia",
      subjects: "Predmety",
      teachers: "Učitelia",

      // Home Page
      news_upd: "Najnovšie správy a aktualizácie",
      utils: "Užitočné nástroje",

      fiit_dis: "FIIT Discord",
      fiit_dis_desc: "Oficiálny Discord STU FIIT, spravovaný učiteľmi a nadšenými študentmi",

      fx_com: "Fx - com",
      fx_com_desc: "Notion stránka vytvorená niekoľkými študentmi na pomoc ostatným. Môžete si tu prečítať a stiahnuť materiály k rôznym predmetom",

      mladost: "Sprievodca Mladosťou",
      mladost_desc: "Notion stránka pre študentov, ktorí sa chcú nasťahovať alebo už bývajú na internáte Mladosť, kde nájdete mnoho užitočných rád",

      fiit_tg: "FIIT Telegram",
      fiit_tg_desc: "Telegram kanál pre zahraničných študentov, spravovaný nadšenými študentmi",

      // Profile Page
      change_pic: "Zmeniť obrázok",
      b_premium: "Stať sa prémiovým",
      email: "Email",
      password: "Heslo (Podržte pole na zobrazenie)",
      change_btn: "Zmeniť",
      privacy: "Súkromie",
      logout: "Odhlásiť sa",
      d_comm: "Vymazať komentáre",

      // Settings Page
      appearance: "Vzhľad",
      d_mod: "Tmavý režim",

      notification: "Upozornenia",
      en_not: "Povoliť upozornenia",
      s_not: "Zvuk zapnutý",

      language: "Jazyk",
      en_lang: "Angličtina",
      sk_lang: "Slovenčina",
      ua_lang: "Ukrajinčina",

      displ_sett: "Nastavenia zobrazenia",
      font_s: "Veľkosť písma",
      contrast: "Kontrast",

      select_language: "Vyberte jazyk",
      select_font: "Vyberte veľkosť písma",
      select_contrast: "Vyberte úroveň kontrastu",
      no_data_found: "Načítanie zlyhalo. Zobrazujú sa predvolené údaje",

    },
  },
  ua: {
    translation: {
      // Navigation
      home: "Головна",
      profile: "Профіль",
      settings: "Налаштуваня",
      subjects: "Предмети",
      teachers: "Викладачі",

      // Home Page
      news_upd: "Останні новини та оновлення",
      utils: "Корисні інструменти",

      fiit_dis: "FIIT Discord",
      fiit_dis_desc: "Офіційний Discord STU FIIT, створений викладачами та активними студентами",

      fx_com: "Fx - com",
      fx_com_desc: "Сторінка в Notion, створена студентами для допомоги іншим. Тут можна читати та завантажувати матеріали з різних предметів",

      mladost: "Гід по Mladost",
      mladost_desc: "Сторінка в Notion для студентів, які хочуть поселитися або вже живуть у гуртожитку Mladost. Тут є багато корисних порад",

      fiit_tg: "FIIT Telegram",
      fiit_tg_desc: "Телеграм-канал для іноземних студентів, створений активними студентами",

      // Profile Page
      change_pic: "Змінити фото",
      b_premium: "Стати преміум",
      email: "Електронна пошта",
      password: "Пароль (Утримуйте поле для перегляду)",
      change_btn: "Змінити",
      privacy: "Конфіденційність",
      logout: "Вийти",
      d_comm: "Видалити коментарі",

      // Settings Page
      appearance: "Зовнішній вигляд",
      d_mod: "Темна тема",

      notification: "Сповіщення",
      en_not: "Увімкнути сповіщення",
      s_not: "Звук увімкнено",

      language: "Мова",
      en_lang: "Англійська",
      sk_lang: "Словацька",
      ua_lang: "Українська",

      displ_sett: "Налаштування дисплея",
      font_s: "Розмір шрифту",
      contrast: "Контрастність",

      select_language: "Виберіть мову",
      select_font: "Виберіть розмір шрифту",
      select_contrast: "Виберіть контраст",
      no_data_found: "Немає даних. Показано стандартний контент",

    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // deflt lang.
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;