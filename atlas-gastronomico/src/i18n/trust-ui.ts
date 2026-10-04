import type { Locale } from "./config";

type TrustUi = {
  about: string; contact: string; editorial: string; privacy: string;
  preferences: string; analyticsNotice: string; accept: string; decline: string;
  publishedCountries: string; showEmpty: string; editor: string;
};

const copy: Record<Locale, string[]> = {
  es: ["Acerca de WorldBites", "Contacto", "Política editorial", "Privacidad", "Preferencias de privacidad", "Usamos almacenamiento local para recordar el tema y tu elección de privacidad. Google Analytics solo se carga si aceptas las estadísticas opcionales. Puedes cambiar tu elección aquí en cualquier momento.", "Aceptar estadísticas", "Solo lo necesario", "Destinos con recetas", "Mostrar también países sin recetas", "Contenido editorial de WorldBites"],
  en: ["About WorldBites", "Contact", "Editorial policy", "Privacy", "Privacy preferences", "We use local storage to remember your theme and privacy choice. Google Analytics loads only if you accept optional statistics. You can change your choice here at any time.", "Accept statistics", "Necessary only", "Destinations with recipes", "Also show countries without recipes", "Editorial content by WorldBites"],
  zh: ["关于 WorldBites", "联系我们", "编辑政策", "隐私", "隐私偏好", "我们使用本地存储记住主题和隐私选择。只有您同意可选统计时才会加载 Google Analytics。您可随时在此更改选择。", "接受统计", "仅必要功能", "有食谱的目的地", "同时显示没有食谱的国家", "WorldBites 编辑内容"],
  hi: ["WorldBites के बारे में", "संपर्क", "संपादकीय नीति", "गोपनीयता", "गोपनीयता प्राथमिकताएँ", "हम थीम और गोपनीयता विकल्प याद रखने के लिए स्थानीय संग्रहण का उपयोग करते हैं। Google Analytics केवल वैकल्पिक आँकड़ों की अनुमति देने पर लोड होता है। आप यहाँ अपना विकल्प कभी भी बदल सकते हैं।", "आँकड़ों की अनुमति दें", "केवल आवश्यक", "व्यंजनों वाले गंतव्य", "बिना व्यंजनों वाले देश भी दिखाएँ", "WorldBites की संपादकीय सामग्री"],
  fr: ["À propos de WorldBites", "Contact", "Politique éditoriale", "Confidentialité", "Préférences de confidentialité", "Le stockage local mémorise votre thème et votre choix de confidentialité. Google Analytics ne se charge que si vous acceptez les statistiques facultatives. Vous pouvez modifier votre choix ici à tout moment.", "Accepter les statistiques", "Nécessaire uniquement", "Destinations avec recettes", "Afficher aussi les pays sans recettes", "Contenu éditorial de WorldBites"],
  ar: ["عن WorldBites", "التواصل", "السياسة التحريرية", "الخصوصية", "تفضيلات الخصوصية", "نستخدم التخزين المحلي لتذكر المظهر واختيار الخصوصية. لا يتم تحميل Google Analytics إلا إذا وافقت على الإحصاءات الاختيارية. يمكنك تغيير اختيارك هنا في أي وقت.", "قبول الإحصاءات", "الضروري فقط", "وجهات بها وصفات", "إظهار الدول التي لا تحتوي على وصفات أيضًا", "محتوى تحريري من WorldBites"],
  bn: ["WorldBites সম্পর্কে", "যোগাযোগ", "সম্পাদনা নীতি", "গোপনীয়তা", "গোপনীয়তার পছন্দ", "থিম ও গোপনীয়তার পছন্দ মনে রাখতে আমরা স্থানীয় স্টোরেজ ব্যবহার করি। ঐচ্ছিক পরিসংখ্যানে সম্মতি দিলেই Google Analytics লোড হয়। আপনি এখানে যেকোনো সময় পছন্দ পরিবর্তন করতে পারেন।", "পরিসংখ্যানে সম্মতি দিন", "শুধু প্রয়োজনীয়", "রেসিপিসহ গন্তব্য", "রেসিপি নেই এমন দেশও দেখান", "WorldBites-এর সম্পাদিত বিষয়বস্তু"],
  pt: ["Sobre o WorldBites", "Contacto", "Política editorial", "Privacidade", "Preferências de privacidade", "Usamos armazenamento local para recordar o tema e a escolha de privacidade. O Google Analytics só é carregado se aceitar as estatísticas opcionais. Pode alterar a escolha aqui a qualquer momento.", "Aceitar estatísticas", "Apenas o necessário", "Destinos com receitas", "Mostrar também países sem receitas", "Conteúdo editorial do WorldBites"],
  ru: ["О WorldBites", "Контакты", "Редакционная политика", "Конфиденциальность", "Настройки конфиденциальности", "Локальное хранилище запоминает тему и ваш выбор конфиденциальности. Google Analytics загружается только с вашего согласия на необязательную статистику. Здесь можно изменить выбор в любое время.", "Разрешить статистику", "Только необходимое", "Страны с рецептами", "Показать также страны без рецептов", "Редакционные материалы WorldBites"],
  ur: ["WorldBites کے بارے میں", "رابطہ", "ادارتی پالیسی", "رازداری", "رازداری کی ترجیحات", "ہم تھیم اور رازداری کا انتخاب یاد رکھنے کے لیے مقامی اسٹوریج استعمال کرتے ہیں۔ Google Analytics صرف اختیاری اعداد و شمار کی اجازت دینے پر لوڈ ہوتا ہے۔ آپ یہاں کسی بھی وقت اپنا انتخاب بدل سکتے ہیں۔", "اعداد و شمار کی اجازت دیں", "صرف ضروری", "ترکیبوں والے مقامات", "بغیر ترکیبوں والے ممالک بھی دکھائیں", "WorldBites کا ادارتی مواد"],
  id: ["Tentang WorldBites", "Kontak", "Kebijakan editorial", "Privasi", "Preferensi privasi", "Penyimpanan lokal mengingat tema dan pilihan privasi Anda. Google Analytics hanya dimuat jika Anda menyetujui statistik opsional. Anda dapat mengubah pilihan di sini kapan saja.", "Izinkan statistik", "Hanya yang diperlukan", "Destinasi dengan resep", "Tampilkan juga negara tanpa resep", "Konten editorial oleh WorldBites"],
  ja: ["WorldBites について", "お問い合わせ", "編集方針", "プライバシー", "プライバシー設定", "テーマとプライバシーの選択を記憶するためにローカルストレージを使用します。Google Analytics は任意の統計に同意した場合のみ読み込まれます。ここでいつでも選択を変更できます。", "統計を許可", "必要な機能のみ", "レシピのある国", "レシピのない国も表示", "WorldBites の編集コンテンツ"],
};

export const trustUi = Object.fromEntries(Object.entries(copy).map(([locale, values]) => {
  const [about, contact, editorial, privacy, preferences, analyticsNotice, accept, decline, publishedCountries, showEmpty, editor] = values;
  return [locale, { about, contact, editorial, privacy, preferences, analyticsNotice, accept, decline, publishedCountries, showEmpty, editor }];
})) as Record<Locale, TrustUi>;

// Full site information is published in Spanish and English, without duplicate fallback pages.
export function informationLocale(locale: Locale): "es" | "en" { return locale === "es" ? "es" : "en"; }
export function informationHref(locale: Locale, slug: string) { return `/${informationLocale(locale)}/informacion/${slug}`; }
