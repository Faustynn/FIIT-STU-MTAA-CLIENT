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

      // Subjects Page
      search_subj: "Search for a subject",
      filters: "Filters",
      result: "Results",

      semester: "Semester",
      subj_type: "Subject Type",
      p: "compulsory",
      pv: "semi-compulsory",
      v: "optional",
      study_lvl: "Study Level",
      bc: "Bachelor",
      ing: "Ingenier",

      // Subjects details

      // Teachers Page
      search_teach: "Search for a teacher",
      role: "Roles",
      garant: "Garant",
      cvik: "Instructor",
      predn: "Lecturer",

      // Teachers details

      // Login Page
      login: "Login",
      email_field: "Write your email or login",
      pass_field: "Wrire your password",
      fgt_pass: "Forgot password?",
      dnt_hv_acc: "Don't have an account?",
      reg: "Register!",

      // Register Page
      registration: "Registration",
      name: "Username",
      pass: "Password",
      conf_pass: "Confirm password",

      // Change Password Page
      entr_email: "Enter your Email",
      entr_code: "Enter verification code",
      verif_code_field: "Verification code",
      next: "Next",
      set_new_pass: "Set new Password",
      new_pass: "New Password",
      conf_new_pass: "Confirm new Password",
      rst_pass_btn: "Reset Password",
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
      b_premium: "Kupiť prémium",
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

      // Subjects Page
      search_subj: "Hľadať predmet",
      filters: "Filtre",
      result: "Výsledky",

      semester: "Semester",
      subj_type: "Typ predmetu",
      p: "povinný",
      pv: "povinne voliteľný",
      v: "voliteľný",
      study_lvl: "Stupeň štúdia",
      bc: "Bakalár",
      ing: "Inžinier",

      // Subjects details

      // Teachers Page
      search_teach: "Hľadať učiteľa",
      role: "Funkcie",
      garant: "Garant",
      cvik: "Cvičiaci",
      predn: "Prednášajúci",

      // Teachers details

      // Login Page
      login: "Prihlásenie",
      email_field: "Zadajte váš email alebo username",
      pass_field: "Zadajte vaše heslo",
      fgt_pass: "Zabudli ste heslo?",
      dnt_hv_acc: "Nemáte účet?",
      reg: "Registrujte sa!",

      // Register Page
      registration: "Registrácia",
      name: "Používateľské meno",
      pass: "Heslo",
      conf_pass: "Potvrďte heslo",

      // Change Password Page
      entr_email: "Zadajte váš Email",
      entr_code: "Zadajte verifikačný kód",
      verif_code_field: "Verifikačný kód",
      next: "Ďalej",
      set_new_pass: "Nastavte nové heslo",
      new_pass: "Nové heslo",
      conf_new_pass: "Potvrďte nové heslo",
      rst_pass_btn: "Obnoviť heslo",
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
      b_premium: "Купити преміум",
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

      // Subjects Page
      search_subj: "Пошук предмета",
      filters: "Фільтри",
      result: "Результати",

      semester: "Семестр",
      subj_type: "Тип предмета",
      p: "обов'язковий",
      pv: "частково обов'язковий",
      v: "вибірковий",
      study_lvl: "Рівень навчання",
      bc: "Бакалавр",
      ing: "Інженер",

      // Subjects details

      // Teachers Page
      search_teach: "Пошук викладача",
      role: "Посади",
      garant: "Гарант",
      cvik: "Інструктор",
      predn: "Лектор",

      // Teachers details

      // Login Page
      login: "Вхід",
      email_field: "Введіть вашу пошту або логін",
      pass_field: "Введіть ваш пароль",
      fgt_pass: "Забули пароль?",
      dnt_hv_acc: "Немає запису?",
      reg: "Зареєструватися!",

      // Register Page
      registration: "Реєстрація",
      name: "Ім'я користувача",
      pass: "Пароль",
      conf_pass: "Підтвердіть пароль",

      // Change Password Page
      entr_email: "Введіть вашу електронну пошту",
      entr_code: "Введіть код підтвердження",
      verif_code_field: "Код підтвердження",
      next: "Далі",
      set_new_pass: "Встановіть новий пароль",
      new_pass: "Новий пароль",
      conf_new_pass: "Підтвердіть новий пароль",
      rst_pass_btn: "Скинути пароль",
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