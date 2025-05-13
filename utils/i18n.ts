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
      change_password: "Press to start change Password",
      change_btn: "Change",
      privacy: "Privacy",
      logout: "Logout",
      d_comm: "Delete comments",
      change_pass_btn: "Change password",

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

      admin: "Admin",
      premium: "Premium user",
      regular_user: "Regular user",
      admin_role: "Admin",
      premium_role: "Premium",
      regular_role: "Regular",
      loading_comments: "Loading comments...",
      teacher_rating: "Teacher Rating",
      subject_rating: "Subject Rating",
      based_on_reviews: "Based on {{count}} reviews",
      comments: "Comments",
      write_review: "Write a review",
      cancel: "Cancel",
      your_review: "Your review",
      write_comment_placeholder: "Write your comment here...",
      your_rating: "Your rating",
      send: "Send",
      no_comments_yet: "No comments yet. Be the first to share your opinion!",
      success: "Success",
      comment_added: "Your comment has been added successfully!",
      error: "Error",
      failed_add_comment: "Failed to add comment. Please try again.",
      error_adding_comment: "An error occurred while adding your comment.",
      attention: "Attention",
      please_fill_comment_rating: "Please provide both comment text and rating.",
      confirmation: "Confirmation",
      confirm_delete_comment: "Are you sure you want to delete this comment?",
      delete: "Delete",
      comment_deleted: "Comment has been deleted successfully!",
      failed_delete_comment: "Failed to delete comment. Please try again.",
      error_deleting_comment: "An error occurred while deleting the comment.",
      failed_load_comments: "Failed to load comments. Please try again.",


      subject_details: "Subject Details",
      full_time: "Full-time",
      part_time: "Part-time",
      distance: "Distance",
      online: "Online",
      fall_semester: "Fall semester",
      spring_semester: "Spring semester",
      summer_semester: "Summer semester",
      winter_semester: "Winter semester",
      exam: "Exam",
      credit: "Credit",
      classified_credit: "Classified Credit",
      not_specified: "Not specified",
      grading_scale: "Grading Scale",
      instructors_and_roles: "Instructors and Roles",
      office: "Office",
      basic_information: "Basic Information",
      study_type: "Study Type",
      completion_type: "Completion Type",
      student_count: "Student Count",
      languages: "Languages",
      educational_methods: "Educational Methods",
      course_contents: "Course Contents",
      planned_activities: "Planned Activities",
      learning_outcomes: "Learning Outcomes",
      assessment_evaluation: "Assessment and Evaluation",
      assessment_methods: "Assessment Methods",
      evaluation_methods: "Evaluation Methods",
      view_comments: "View Comments",
      subject_not_found: "Subject not found",
      go_back: "Go Back",
      loading_subject_details: "Loading subject details...",
      failed_load_subject_details: "Failed to load subject details. Please try again.",
      credits: "credits",

      teacher_details: "Teacher Details",
      loading_teacher_details: "Loading teacher details...",
      failed_load_teacher_details: "Failed to load teacher details. Please try again.",
      contact_information: "Contact Information",
      send_email: "Send Email",
      subjects_taught: "Subjects Taught",
      roles: "Roles",
      teacher: "Teacher",
      id: "ID",
      phone: "Phone",
      teacher_not_found: "Teacher not found",
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
      change_password: "Stlačte pre zmenu hesla",
      change_btn: "Zmeniť",
      privacy: "Súkromie",
      logout: "Odhlásiť sa",
      d_comm: "Vymazať komentáre",
      change_pass_btn: "Zmeniť heslo",

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


      admin: "Admin",
      premium: "Prémiový užívateľ",
      regular_user: "Bežný užívateľ",
      admin_role: "Admin",
      premium_role: "Prémium",
      regular_role: "Bežný",
      loading_comments: "Načítavanie komentárov...",
      teacher_rating: "Hodnotenie učiteľa",
      subject_rating: "Hodnotenie predmetu",
      based_on_reviews: "Založené na {{count}} recenziách",
      comments: "Komentáre",
      write_review: "Napísať recenziu",
      cancel: "Zrušiť",
      your_review: "Vaša recenzia",
      write_comment_placeholder: "Napíšte svoj komentár sem...",
      your_rating: "Vaše hodnotenie",
      send: "Odoslať",
      no_comments_yet: "Zatiaľ žiadne komentáre. Buďte prvý, kto vyjadrí svoj názor!",
      success: "Úspech",
      comment_added: "Váš komentár bol úspešne pridaný!",
      error: "Chyba",
      failed_add_comment: "Nepodarilo sa pridať komentár. Skúste to znova.",
      error_adding_comment: "Pri pridávaní komentára sa vyskytla chyba.",
      attention: "Upozornenie",
      please_fill_comment_rating: "Prosím, zadajte text komentára aj hodnotenie.",
      confirmation: "Potvrdenie",
      confirm_delete_comment: "Naozaj chcete vymazať tento komentár?",
      delete: "Vymazať",
      comment_deleted: "Komentár bol úspešne vymazaný!",
      failed_delete_comment: "Komentár sa nepodarilo vymazať. Skúste to znova.",
      error_deleting_comment: "Pri vymazávaní komentára sa vyskytla chyba.",
      failed_load_comments: "Nepodarilo sa načítať komentáre. Skúste to znova.",


      subject_details: "Detaily predmetu",
      full_time: "Denná forma",
      part_time: "Externá forma",
      distance: "Dištančná forma",
      online: "Online forma",
      fall_semester: "Zimný semester",
      spring_semester: "Letný semester",
      summer_semester: "Letný semester",
      winter_semester: "Zimný semester",
      exam: "Skúška",
      credit: "Zápočet",
      classified_credit: "Klasifikovaný zápočet",
      not_specified: "Nešpecifikované",
      grading_scale: "Klasifikačná stupnica",
      instructors_and_roles: "Vyučujúci a ich úlohy",
      office: "Kancelária",
      basic_information: "Základné informácie",
      study_type: "Typ štúdia",
      completion_type: "Spôsob ukončenia",
      student_count: "Počet študentov",
      languages: "Jazyky",
      educational_methods: "Vzdelávacie metódy",
      course_contents: "Obsah kurzu",
      planned_activities: "Plánované aktivity",
      learning_outcomes: "Výsledky vzdelávania",
      assessment_evaluation: "Hodnotenie a evaluácia",
      assessment_methods: "Metódy hodnotenia",
      evaluation_methods: "Spôsoby evaluácie",
      view_comments: "Zobraziť komentáre",
      subject_not_found: "Predmet nenájdený",
      go_back: "Späť",
      loading_subject_details: "Načítavanie detailov predmetu...",
      failed_load_subject_details: "Nepodarilo sa načítať detaily predmetu. Skúste to znova.",
      credits: "kreditov",


      teacher_details: "Detaily učiteľa",
      loading_teacher_details: "Načítavanie detailov učiteľa...",
      failed_load_teacher_details: "Nepodarilo sa načítať detaily učiteľa. Skúste to znova.",
      contact_information: "Kontaktné informácie",
      send_email: "Poslať email",
      subjects_taught: "Vyučované predmety",
      roles: "Úlohy",
      teacher: "Učiteľ",
      id: "ID",
      phone: "Telefón",
      teacher_not_found: "Učiteľ nenájdený",

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
      change_password: "Натисніть, щоб змінити пароль",
      change_btn: "Змінити",
      privacy: "Конфіденційність",
      logout: "Вийти",
      d_comm: "Видалити коментарі",
      change_pass_btn: "Змінити пароль",

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

      admin: "Адмін",
      premium: "Преміум користувач",
      regular_user: "Звичайний користувач",
      admin_role: "Адмін",
      premium_role: "Преміум",
      regular_role: "Звичайний",
      loading_comments: "Завантаження коментарів...",
      teacher_rating: "Рейтинг викладача",
      subject_rating: "Рейтинг предмета",
      based_on_reviews: "На основі {{count}} відгуків",
      comments: "Коментарі",
      write_review: "Написати відгук",
      cancel: "Скасувати",
      your_review: "Ваш відгук",
      write_comment_placeholder: "Напишіть свій коментар тут...",
      your_rating: "Ваша оцінка",
      send: "Надіслати",
      no_comments_yet: "Поки що немає коментарів. Будьте першим, хто поділиться своєю думкою!",
      success: "Успіх",
      comment_added: "Ваш коментар успішно додано!",
      error: "Помилка",
      failed_add_comment: "Не вдалося додати коментар. Спробуйте знову.",
      error_adding_comment: "Сталася помилка під час додавання коментаря.",
      attention: "Увага",
      please_fill_comment_rating: "Будь ласка, надайте текст коментаря та оцінку.",
      confirmation: "Підтвердження",
      confirm_delete_comment: "Ви впевнені, що хочете видалити цей коментар?",
      delete: "Видалити",
      comment_deleted: "Коментар успішно видалено!",
      failed_delete_comment: "Не вдалося видалити коментар. Спробуйте знову.",
      error_deleting_comment: "Сталася помилка під час видалення коментаря.",
      failed_load_comments: "Не вдалося завантажити коментарі. Спробуйте знову.",

      subject_details: "Деталі предмета",
      full_time: "Денна форма",
      part_time: "Заочна форма",
      distance: "Дистанційна форма",
      online: "Онлайн форма",
      fall_semester: "Осінній семестр",
      spring_semester: "Весняний семестр",
      summer_semester: "Літній семестр",
      winter_semester: "Зимовий семестр",
      exam: "Іспит",
      credit: "Залік",
      classified_credit: "Класифікований залік",
      not_specified: "Не вказано",
      grading_scale: "Шкала оцінювання",
      instructors_and_roles: "Викладачі та їх ролі",
      office: "Кабінет",
      basic_information: "Основна інформація",
      study_type: "Тип навчання",
      completion_type: "Тип завершення",
      student_count: "Кількість студентів",
      languages: "Мови викладання",
      educational_methods: "Освітні методи",
      course_contents: "Зміст курсу",
      planned_activities: "Заплановані активності",
      learning_outcomes: "Результати навчання",
      assessment_evaluation: "Оцінювання та аналіз",
      assessment_methods: "Методи оцінювання",
      evaluation_methods: "Методи аналізу",
      view_comments: "Переглянути коментарі",
      subject_not_found: "Предмет не знайдено",
      go_back: "Назад",
      loading_subject_details: "Завантаження деталей предмета...",
      failed_load_subject_details: "Не вдалося завантажити деталі предмета. Спробуйте знову.",
      credits: "кредитів",

      teacher_details: "Деталі викладача",
      loading_teacher_details: "Завантаження деталей викладача...",
      failed_load_teacher_details: "Не вдалося завантажити деталі викладача. Спробуйте знову.",
      contact_information: "Контактна інформація",
      send_email: "Надіслати електронний лист",
      subjects_taught: "Предмети викладання",
      roles: "Ролі",
      teacher: "Викладач",
      id: "ID",
      phone: "Телефон",
      teacher_not_found: "Викладача не знайдено",
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