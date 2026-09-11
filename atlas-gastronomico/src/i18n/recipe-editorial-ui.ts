import type { Locale } from "./config";

type EditorialUi = { tips: string; prep: string; cook: string; rest: string; fallback: string; difficulty: Record<"facil" | "media" | "dificil", string> };
export const recipeEditorialUi: Record<Locale, EditorialUi> = {
  es: { tips: "Consejos de cocina", prep: "Preparación", cook: "Cocción", rest: "Espera y reposo", fallback: "Esta receta está disponible en español e inglés.", difficulty: { facil: "Fácil", media: "Media", dificil: "Difícil" } },
  en: { tips: "Cooking tips", prep: "Preparation", cook: "Cooking", rest: "Waiting and resting", fallback: "This recipe is available in Spanish and English.", difficulty: { facil: "Easy", media: "Intermediate", dificil: "Difficult" } },
  zh: { tips: "烹饪技巧", prep: "准备", cook: "烹饪", rest: "等待与静置", fallback: "此食谱目前提供西班牙语和英语版本。", difficulty: { facil: "简单", media: "中等", dificil: "困难" } },
  hi: { tips: "खाना पकाने के सुझाव", prep: "तैयारी", cook: "पकाना", rest: "प्रतीक्षा और विश्राम", fallback: "यह रेसिपी अभी स्पेनिश और अंग्रेज़ी में उपलब्ध है।", difficulty: { facil: "आसान", media: "मध्यम", dificil: "कठिन" } },
  fr: { tips: "Conseils de cuisine", prep: "Préparation", cook: "Cuisson", rest: "Attente et repos", fallback: "Cette recette est disponible en espagnol et en anglais.", difficulty: { facil: "Facile", media: "Intermédiaire", dificil: "Difficile" } },
  ar: { tips: "نصائح الطبخ", prep: "التحضير", cook: "الطهي", rest: "الانتظار والإراحة", fallback: "هذه الوصفة متاحة حاليًا بالإسبانية والإنجليزية.", difficulty: { facil: "سهل", media: "متوسط", dificil: "صعب" } },
  bn: { tips: "রান্নার পরামর্শ", prep: "প্রস্তুতি", cook: "রান্না", rest: "অপেক্ষা ও বিশ্রাম", fallback: "এই রেসিপিটি বর্তমানে স্প্যানিশ ও ইংরেজিতে উপলব্ধ।", difficulty: { facil: "সহজ", media: "মাঝারি", dificil: "কঠিন" } },
  pt: { tips: "Dicas de cozinha", prep: "Preparação", cook: "Cozimento", rest: "Espera e descanso", fallback: "Esta receita está disponível em espanhol e inglês.", difficulty: { facil: "Fácil", media: "Intermediária", dificil: "Difícil" } },
  ru: { tips: "Кулинарные советы", prep: "Подготовка", cook: "Приготовление", rest: "Ожидание и отдых", fallback: "Этот рецепт пока доступен на испанском и английском языках.", difficulty: { facil: "Легко", media: "Средне", dificil: "Сложно" } },
  ur: { tips: "کھانا پکانے کے مشورے", prep: "تیاری", cook: "پکانا", rest: "انتظار اور آرام", fallback: "یہ ترکیب فی الحال ہسپانوی اور انگریزی میں دستیاب ہے۔", difficulty: { facil: "آسان", media: "درمیانہ", dificil: "مشکل" } },
  id: { tips: "Tips memasak", prep: "Persiapan", cook: "Memasak", rest: "Waktu tunggu dan istirahat", fallback: "Resep ini tersedia dalam bahasa Spanyol dan Inggris.", difficulty: { facil: "Mudah", media: "Sedang", dificil: "Sulit" } },
  ja: { tips: "調理のコツ", prep: "準備", cook: "調理", rest: "待ち時間・休ませる時間", fallback: "このレシピは現在スペイン語と英語でご覧いただけます。", difficulty: { facil: "簡単", media: "中級", dificil: "難しい" } },
};

export const nutritionLabels: Record<Locale, Record<"calories" | "protein" | "carbohydrates" | "fat" | "fiber" | "sodium", string>> = {
  "es": {
    "calories": "Calorías",
    "protein": "Proteínas",
    "carbohydrates": "Carbohidratos",
    "fat": "Grasas",
    "fiber": "Fibra",
    "sodium": "Sodio"
  },
  "en": {
    "calories": "Calories",
    "protein": "Protein",
    "carbohydrates": "Carbohydrates",
    "fat": "Fat",
    "fiber": "Fiber",
    "sodium": "Sodium"
  },
  "zh": {
    "calories": "热量",
    "protein": "蛋白质",
    "carbohydrates": "碳水化合物",
    "fat": "脂肪",
    "fiber": "膳食纤维",
    "sodium": "钠"
  },
  "hi": {
    "calories": "कैलोरी",
    "protein": "प्रोटीन",
    "carbohydrates": "कार्बोहाइड्रेट",
    "fat": "वसा",
    "fiber": "फाइबर",
    "sodium": "सोडियम"
  },
  "fr": {
    "calories": "Calories",
    "protein": "Protéines",
    "carbohydrates": "Glucides",
    "fat": "Lipides",
    "fiber": "Fibres",
    "sodium": "Sodium"
  },
  "ar": {
    "calories": "السعرات الحرارية",
    "protein": "البروتين",
    "carbohydrates": "الكربوهيدرات",
    "fat": "الدهون",
    "fiber": "الألياف",
    "sodium": "الصوديوم"
  },
  "bn": {
    "calories": "ক্যালোরি",
    "protein": "প্রোটিন",
    "carbohydrates": "শর্করা",
    "fat": "চর্বি",
    "fiber": "আঁশ",
    "sodium": "সোডিয়াম"
  },
  "pt": {
    "calories": "Calorias",
    "protein": "Proteínas",
    "carbohydrates": "Carboidratos",
    "fat": "Gorduras",
    "fiber": "Fibras",
    "sodium": "Sódio"
  },
  "ru": {
    "calories": "Калории",
    "protein": "Белки",
    "carbohydrates": "Углеводы",
    "fat": "Жиры",
    "fiber": "Клетчатка",
    "sodium": "Натрий"
  },
  "ur": {
    "calories": "کیلوریز",
    "protein": "پروٹین",
    "carbohydrates": "کاربوہائیڈریٹس",
    "fat": "چکنائی",
    "fiber": "فائبر",
    "sodium": "سوڈیم"
  },
  "id": {
    "calories": "Kalori",
    "protein": "Protein",
    "carbohydrates": "Karbohidrat",
    "fat": "Lemak",
    "fiber": "Serat",
    "sodium": "Natrium"
  },
  "ja": {
    "calories": "カロリー",
    "protein": "たんぱく質",
    "carbohydrates": "炭水化物",
    "fat": "脂質",
    "fiber": "食物繊維",
    "sodium": "ナトリウム"
  }
};
