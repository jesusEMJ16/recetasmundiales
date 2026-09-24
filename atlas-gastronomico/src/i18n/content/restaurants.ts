import type { Locale } from "../config";
import type { Restaurant } from "../../domain/types";

type TranslatedLocale = Exclude<Locale, "es">;

// Descripciones de restaurantes. El español vive en src/data/restaurants.ts.
const DESCRIPTIONS: Record<string, Record<TranslatedLocale, string>> = {
  "rest-cdmx-001": {
    en: "Contemporary Mexican fine-dining restaurant led by chef Enrique Olvera.",
    zh: "由主厨恩里克·奥尔韦拉主理的当代墨西哥高级料理餐厅。",
    hi: "शेफ़ एनरिके ओल्वेरा के नेतृत्व में समकालीन मैक्सिकन फ़ाइन-डाइनिंग रेस्तरां।",
    fr: "Restaurant gastronomique de cuisine mexicaine contemporaine dirigé par le chef Enrique Olvera.",
    ar: "مطعم راقٍ للمطبخ المكسيكي المعاصر يديره الشيف إنريكي أولفيرا.",
    bn: "শেফ এনরিকে ওলভেরার নেতৃত্বে সমসাময়িক মেক্সিকান ফাইন-ডাইনিং রেস্তোরাঁ।",
    pt: "Restaurante de alta gastronomia mexicana contemporânea comandado pelo chef Enrique Olvera.",
    ru: "Ресторан современной мексиканской высокой кухни под руководством шефа Энрике Ольверы.",
    ur: "شیف اینریکے اولویرا کی قیادت میں جدید میکسیکن فائن ڈائننگ ریستوران۔",
    id: "Restoran fine dining Meksiko kontemporer yang dipimpin chef Enrique Olvera.",
    ja: "シェフ、エンリケ・オルベラが率いる現代メキシコ料理のファインダイニング。",
  },
  "rest-cdmx-002": {
    en: "Famous for its tuna tostadas and fresh fish in a casual, lively setting.",
    zh: "以金枪鱼脆饼和新鲜鱼料理闻名，氛围轻松热闹。",
    hi: "ट्यूना टोस्टाडा और ताज़ी मछली के लिए मशहूर, सहज और जीवंत माहौल में।",
    fr: "Célèbre pour ses tostadas au thon et ses poissons frais, dans une ambiance décontractée et animée.",
    ar: "يشتهر بتوستادا التونة والأسماك الطازجة في أجواء غير رسمية ومفعمة بالحيوية.",
    bn: "টুনা টোস্তাদা আর তাজা মাছের জন্য বিখ্যাত, স্বচ্ছন্দ ও প্রাণবন্ত পরিবেশে।",
    pt: "Famoso por suas tostadas de atum e peixes frescos em um ambiente descontraído e animado.",
    ru: "Славится тостадами с тунцом и свежей рыбой в непринуждённой и оживлённой атмосфере.",
    ur: "ٹونا ٹوسٹاڈا اور تازہ مچھلی کے لیے مشہور، بے تکلف اور پُررونق ماحول میں۔",
    id: "Terkenal dengan tostada tuna dan ikan segar dalam suasana santai dan meriah.",
    ja: "マグロのトスターダと新鮮な魚料理で有名な、気取らず活気ある店。",
  },
  "rest-oax-001": {
    en: "Contemporary Oaxacan cuisine in a beautiful colonial building with a terrace.",
    zh: "在一座带露台的美丽殖民时期建筑中供应当代瓦哈卡菜。",
    hi: "छत वाली एक सुंदर औपनिवेशिक इमारत में समकालीन ओआहाका व्यंजन।",
    fr: "Cuisine oaxaquénienne contemporaine dans un superbe bâtiment colonial avec terrasse.",
    ar: "مطبخ أواكساكي معاصر في مبنى استعماري جميل ذي شرفة.",
    bn: "ছাদ-বারান্দাসহ সুন্দর ঔপনিবেশিক ভবনে সমসাময়িক ওয়াহাকা রান্না।",
    pt: "Cozinha oaxaquenha contemporânea em um belo edifício colonial com terraço.",
    ru: "Современная оахакская кухня в красивом колониальном здании с террасой.",
    ur: "چھت والی ایک خوبصورت نوآبادیاتی عمارت میں جدید اوآخاکا کھانے۔",
    id: "Masakan Oaxaca kontemporer di gedung kolonial yang indah dengan teras.",
    ja: "テラス付きの美しいコロニアル建築で味わう現代オアハカ料理。",
  },
  "rest-oax-002": {
    en: "Iconic restaurant facing the zócalo, known for its mezcal and traditional cuisine.",
    zh: "位于中央广场对面的标志性餐厅，以梅斯卡尔酒和传统菜肴闻名。",
    hi: "ज़ोकालो के सामने एक प्रसिद्ध रेस्तरां, जो अपनी मेस्कल और पारंपरिक व्यंजनों के लिए जाना जाता है।",
    fr: "Restaurant emblématique face au zócalo, réputé pour son mezcal et sa cuisine traditionnelle.",
    ar: "مطعم شهير مطل على الساحة الرئيسية (السوكالو)، معروف بالميزكال والمطبخ التقليدي.",
    bn: "জোকালোর সামনের বিখ্যাত রেস্তোরাঁ, মেসকাল ও ঐতিহ্যবাহী রান্নার জন্য পরিচিত।",
    pt: "Restaurante icônico em frente ao zócalo, conhecido por seu mezcal e sua cozinha tradicional.",
    ru: "Культовый ресторан напротив сокало, известный своим мескалем и традиционной кухней.",
    ur: "زوکالو کے سامنے ایک مشہور ریستوران، جو اپنی میزکال اور روایتی کھانوں کے لیے جانا جاتا ہے۔",
    id: "Restoran ikonis di depan zócalo, dikenal dengan mezcal dan masakan tradisionalnya.",
    ja: "ソカロに面した名店。メスカルと伝統料理で知られています。",
  },
  "rest-son-001": {
    en: "Famous for its handmade flour tortillas and Sonoran carne asada.",
    zh: "以手工面粉玉米饼和索诺拉烤肉闻名。",
    hi: "हाथ से बनी मैदे की टॉर्टिया और सोनोरा की कार्ने असादा के लिए मशहूर।",
    fr: "Célèbre pour ses tortillas de blé faites main et sa carne asada de Sonora.",
    ar: "يشتهر بتورتيا الدقيق المصنوعة يدويًا واللحم المشوي على طريقة سونورا.",
    bn: "হাতে তৈরি ময়দার টর্তিয়া আর সোনোরার কার্নে আসাদার জন্য বিখ্যাত।",
    pt: "Famoso por suas tortilhas de farinha feitas à mão e pela carne asada de Sonora.",
    ru: "Славится пшеничными тортильями ручной работы и сонорской карне асада.",
    ur: "ہاتھ سے بنی میدے کی ٹورتیا اور سونورا کی کارنے آسادا کے لیے مشہور۔",
    id: "Terkenal dengan tortila tepung buatan tangan dan carne asada khas Sonora.",
    ja: "手作りの小麦粉トルティーヤとソノラ風カルネ・アサダで有名。",
  },
  "rest-ny-001": {
    en: "French seafood restaurant with three Michelin stars.",
    zh: "米其林三星法式海鲜餐厅。",
    hi: "तीन मिशलिन स्टार वाला फ़्रांसीसी सीफ़ूड रेस्तरां।",
    fr: "Restaurant français de produits de la mer triplement étoilé au Guide Michelin.",
    ar: "مطعم فرنسي للمأكولات البحرية حاصل على ثلاث نجوم ميشلان.",
    bn: "তিনটি মিশেলিন তারকাপ্রাপ্ত ফরাসি সামুদ্রিক খাবারের রেস্তোরাঁ।",
    pt: "Restaurante francês de frutos do mar com três estrelas Michelin.",
    ru: "Французский ресторан морепродуктов с тремя звёздами Мишлен.",
    ur: "تین مشلن اسٹار والا فرانسیسی سی فوڈ ریستوران۔",
    id: "Restoran makanan laut Prancis berbintang tiga Michelin.",
    ja: "ミシュラン三つ星のフレンチ・シーフードレストラン。",
  },
  "rest-ny-002": {
    en: "Classic New York pizzeria, a favorite of locals and tourists since 1975.",
    zh: "经典纽约披萨店，自 1975 年起深受当地人和游客喜爱。",
    hi: "न्यूयॉर्क का क्लासिक पिज़्ज़ेरिया, 1975 से स्थानीय लोगों और पर्यटकों का पसंदीदा।",
    fr: "Pizzeria new-yorkaise classique, prisée des habitants comme des touristes depuis 1975.",
    ar: "مطعم بيتزا نيويوركي كلاسيكي، مفضّل لدى السكان والسياح منذ عام 1975.",
    bn: "নিউ ইয়র্কের ক্লাসিক পিৎজারিয়া, 1975 সাল থেকে স্থানীয় ও পর্যটকদের প্রিয়।",
    pt: "Pizzaria clássica de Nova York, favorita de moradores e turistas desde 1975.",
    ru: "Классическая нью-йоркская пиццерия, любимая местными жителями и туристами с 1975 года.",
    ur: "نیویارک کا کلاسک پیزا ہاؤس، 1975 سے مقامی لوگوں اور سیاحوں کا پسندیدہ۔",
    id: "Pizzeria klasik New York, favorit warga lokal dan turis sejak 1975.",
    ja: "1975年から地元客にも観光客にも愛される、ニューヨークの定番ピッツェリア。",
  },
  "rest-ca-001": {
    en: "Thomas Keller's iconic restaurant with a 9-course tasting menu.",
    zh: "托马斯·凯勒的标志性餐厅，提供 9 道菜的品鉴菜单。",
    hi: "थॉमस केलर का प्रसिद्ध रेस्तरां, 9 कोर्स वाले टेस्टिंग मेन्यू के साथ।",
    fr: "Restaurant emblématique de Thomas Keller proposant un menu dégustation en 9 services.",
    ar: "مطعم توماس كيلر الشهير بقائمة تذوق من 9 أطباق.",
    bn: "থমাস কেলারের বিখ্যাত রেস্তোরাঁ, 9 কোর্সের টেস্টিং মেনুসহ।",
    pt: "Restaurante icônico de Thomas Keller com menu-degustação de 9 tempos.",
    ru: "Культовый ресторан Томаса Келлера с дегустационным меню из 9 блюд.",
    ur: "تھامس کیلر کا مشہور ریستوران، 9 کورس والے ٹیسٹنگ مینو کے ساتھ۔",
    id: "Restoran ikonis Thomas Keller dengan menu degustasi 9 hidangan.",
    ja: "トーマス・ケラーによる名店。9品のテイスティングメニューを提供。",
  },
};

// Tipos de cocina, etiquetas y ciudades (clave en español, en minúsculas).
const TERMS: Record<string, Record<TranslatedLocale, string>> = {
  "mexicana": { en: "Mexican", zh: "墨西哥菜", hi: "मैक्सिकन", fr: "mexicaine", ar: "مكسيكي", bn: "মেক্সিকান", pt: "mexicana", ru: "мексиканская", ur: "میکسیکن", id: "Meksiko", ja: "メキシコ料理" },
  "contemporánea": { en: "Contemporary", zh: "当代料理", hi: "समकालीन", fr: "contemporaine", ar: "معاصر", bn: "সমসাময়িক", pt: "contemporânea", ru: "современная", ur: "جدید", id: "kontemporer", ja: "コンテンポラリー" },
  "mariscos": { en: "seafood", zh: "海鲜", hi: "सीफ़ूड", fr: "fruits de mer", ar: "مأكولات بحرية", bn: "সামুদ্রিক খাবার", pt: "frutos do mar", ru: "морепродукты", ur: "سی فوڈ", id: "makanan laut", ja: "シーフード" },
  "oaxaqueña": { en: "Oaxacan", zh: "瓦哈卡菜", hi: "ओआहाका", fr: "oaxaquénienne", ar: "أواكساكي", bn: "ওয়াহাকা", pt: "oaxaquenha", ru: "оахакская", ur: "اوآخاکا", id: "Oaxaca", ja: "オアハカ料理" },
  "sonorense": { en: "Sonoran", zh: "索诺拉菜", hi: "सोनोरा", fr: "de Sonora", ar: "سونوري", bn: "সোনোরা", pt: "sonorense", ru: "сонорская", ur: "سونورا", id: "Sonora", ja: "ソノラ料理" },
  "carne asada": { en: "carne asada", zh: "烤肉", hi: "कार्ने असादा", fr: "carne asada", ar: "لحم مشوي", bn: "কার্নে আসাদা", pt: "carne asada", ru: "карне асада", ur: "کارنے آسادا", id: "carne asada", ja: "カルネ・アサダ" },
  "francesa": { en: "French", zh: "法国菜", hi: "फ़्रांसीसी", fr: "française", ar: "فرنسي", bn: "ফরাসি", pt: "francesa", ru: "французская", ur: "فرانسیسی", id: "Prancis", ja: "フランス料理" },
  "pizza": { en: "pizza", zh: "披萨", hi: "पिज़्ज़ा", fr: "pizza", ar: "بيتزا", bn: "পিৎজা", pt: "pizza", ru: "пицца", ur: "پیزا", id: "pizza", ja: "ピザ" },
  "italiana": { en: "Italian", zh: "意大利菜", hi: "इतालवी", fr: "italienne", ar: "إيطالي", bn: "ইতালীয়", pt: "italiana", ru: "итальянская", ur: "اطالوی", id: "Italia", ja: "イタリア料理" },
  "americana": { en: "American", zh: "美式", hi: "अमेरिकी", fr: "américaine", ar: "أمريكي", bn: "আমেরিকান", pt: "americana", ru: "американская", ur: "امریکی", id: "Amerika", ja: "アメリカ料理" },
  "californiana": { en: "Californian", zh: "加州菜", hi: "कैलिफ़ोर्नियाई", fr: "californienne", ar: "كاليفورني", bn: "ক্যালিফোর্নিয়ান", pt: "californiana", ru: "калифорнийская", ur: "کیلیفورنین", id: "California", ja: "カリフォルニア料理" },
  "romántico": { en: "romantic", zh: "浪漫", hi: "रोमांटिक", fr: "romantique", ar: "رومانسي", bn: "রোমান্টিক", pt: "romântico", ru: "романтика", ur: "رومانوی", id: "romantis", ja: "ロマンチック" },
  "alta cocina": { en: "fine dining", zh: "高级料理", hi: "फ़ाइन डाइनिंग", fr: "haute cuisine", ar: "مطبخ راقٍ", bn: "ফাইন ডাইনিং", pt: "alta gastronomia", ru: "высокая кухня", ur: "فائن ڈائننگ", id: "fine dining", ja: "高級料理" },
  "reserva requerida": { en: "reservation required", zh: "需预订", hi: "आरक्षण ज़रूरी", fr: "réservation obligatoire", ar: "الحجز مطلوب", bn: "রিজার্ভেশন আবশ্যক", pt: "reserva obrigatória", ru: "нужна бронь", ur: "بکنگ ضروری", id: "wajib reservasi", ja: "要予約" },
  "popular": { en: "popular", zh: "人气", hi: "लोकप्रिय", fr: "populaire", ar: "رائج", bn: "জনপ্রিয়", pt: "popular", ru: "популярное", ur: "مقبول", id: "populer", ja: "人気" },
  "reserva recomendada": { en: "reservation recommended", zh: "建议预订", hi: "आरक्षण की सलाह", fr: "réservation conseillée", ar: "يُنصح بالحجز", bn: "রিজার্ভেশন বাঞ্ছনীয়", pt: "reserva recomendada", ru: "лучше бронировать", ur: "بکنگ کی سفارش", id: "disarankan reservasi", ja: "予約推奨" },
  "terraza": { en: "terrace", zh: "露台", hi: "छत", fr: "terrasse", ar: "شرفة", bn: "ছাদ-বারান্দা", pt: "terraço", ru: "терраса", ur: "چھت", id: "teras", ja: "テラス" },
  "colonial": { en: "colonial", zh: "殖民风格", hi: "औपनिवेशिक", fr: "colonial", ar: "استعماري", bn: "ঔপনিবেশিক", pt: "colonial", ru: "колониальный стиль", ur: "نوآبادیاتی", id: "kolonial", ja: "コロニアル" },
  "mole": { en: "mole", zh: "莫莱酱", hi: "मोले", fr: "mole", ar: "مولي", bn: "মোলে", pt: "mole", ru: "моле", ur: "مولے", id: "mole", ja: "モレ" },
  "zócalo": { en: "zócalo", zh: "中央广场", hi: "ज़ोकालो", fr: "zócalo", ar: "السوكالو", bn: "জোকালো", pt: "zócalo", ru: "сокало", ur: "زوکالو", id: "zócalo", ja: "ソカロ" },
  "mezcal": { en: "mezcal", zh: "梅斯卡尔酒", hi: "मेस्कल", fr: "mezcal", ar: "ميزكال", bn: "মেসকাল", pt: "mezcal", ru: "мескаль", ur: "میزکال", id: "mezcal", ja: "メスカル" },
  "tradicional": { en: "traditional", zh: "传统", hi: "पारंपरिक", fr: "traditionnel", ar: "تقليدي", bn: "ঐতিহ্যবাহী", pt: "tradicional", ru: "традиционное", ur: "روایتی", id: "tradisional", ja: "伝統的" },
  "tortillas de harina": { en: "flour tortillas", zh: "面粉玉米饼", hi: "मैदे की टॉर्टिया", fr: "tortillas de blé", ar: "تورتيا الدقيق", bn: "ময়দার টর্তিয়া", pt: "tortilhas de farinha", ru: "пшеничные тортильи", ur: "میدے کی ٹورتیا", id: "tortila tepung", ja: "小麦粉トルティーヤ" },
  "familiar": { en: "family-friendly", zh: "适合家庭", hi: "परिवार के लिए", fr: "familial", ar: "مناسب للعائلات", bn: "পরিবারবান্ধব", pt: "familiar", ru: "для всей семьи", ur: "خاندان کے لیے", id: "ramah keluarga", ja: "家族向け" },
  "michelin": { en: "Michelin", zh: "米其林", hi: "मिशलिन", fr: "Michelin", ar: "ميشلان", bn: "মিশেলিন", pt: "Michelin", ru: "Мишлен", ur: "مشلن", id: "Michelin", ja: "ミシュラン" },
  "elegante": { en: "elegant", zh: "优雅", hi: "शानदार", fr: "élégant", ar: "أنيق", bn: "অভিজাত", pt: "elegante", ru: "элегантно", ur: "نفیس", id: "elegan", ja: "エレガント" },
  "económico": { en: "budget-friendly", zh: "实惠", hi: "किफ़ायती", fr: "économique", ar: "اقتصادي", bn: "সাশ্রয়ী", pt: "econômico", ru: "недорого", ur: "کفایتی", id: "hemat", ja: "手頃な価格" },
  "clásico": { en: "classic", zh: "经典", hi: "क्लासिक", fr: "classique", ar: "كلاسيكي", bn: "ক্লাসিক", pt: "clássico", ru: "классика", ur: "کلاسک", id: "klasik", ja: "定番" },
  "degustación": { en: "tasting menu", zh: "品鉴菜单", hi: "टेस्टिंग मेन्यू", fr: "menu dégustation", ar: "قائمة تذوق", bn: "টেস্টিং মেনু", pt: "degustação", ru: "дегустация", ur: "ٹیسٹنگ مینو", id: "menu degustasi", ja: "テイスティング" },
  "reserva anticipada": { en: "book ahead", zh: "需提前预订", hi: "पहले से बुकिंग", fr: "réserver à l’avance", ar: "احجز مسبقًا", bn: "আগে বুকিং", pt: "reserva antecipada", ru: "бронь заранее", ur: "پیشگی بکنگ", id: "pesan jauh hari", ja: "早めの予約" },
  "ciudad de méxico": { en: "Mexico City", zh: "墨西哥城", hi: "मेक्सिको सिटी", fr: "Mexico", ar: "مدينة مكسيكو", bn: "মেক্সিকো সিটি", pt: "Cidade do México", ru: "Мехико", ur: "میکسیکو سٹی", id: "Kota Meksiko", ja: "メキシコシティ" },
  "oaxaca de juárez": { en: "Oaxaca de Juárez", zh: "瓦哈卡", hi: "ओआहाका दे ह्वारेज़", fr: "Oaxaca de Juárez", ar: "واهاكا دي خواريز", bn: "ওয়াহাকা দে হুয়ারেস", pt: "Oaxaca de Juárez", ru: "Оахака-де-Хуарес", ur: "اوآخاکا دے خواریز", id: "Oaxaca de Juárez", ja: "オアハカ・デ・フアレス" },
  "hermosillo": { en: "Hermosillo", zh: "埃莫西约", hi: "एर्मोसियो", fr: "Hermosillo", ar: "إرموسيو", bn: "এরমোসিয়ো", pt: "Hermosillo", ru: "Эрмосильо", ur: "ارموسیو", id: "Hermosillo", ja: "エルモシージョ" },
  "new york": { en: "New York", zh: "纽约", hi: "न्यूयॉर्क", fr: "New York", ar: "نيويورك", bn: "নিউ ইয়র্ক", pt: "Nova York", ru: "Нью-Йорк", ur: "نیویارک", id: "New York", ja: "ニューヨーク" },
  "yountville": { en: "Yountville", zh: "扬特维尔", hi: "यॉन्टविल", fr: "Yountville", ar: "يونتفيل", bn: "ইয়ন্টভিল", pt: "Yountville", ru: "Йонтвилл", ur: "یونٹ ویل", id: "Yountville", ja: "ヨントヴィル" },
};

function term(value: string, locale: Locale): string {
  if (locale === "es") return value;
  const translated = TERMS[value.toLocaleLowerCase("es")]?.[locale];
  if (!translated) return value;
  // Los tipos de cocina van en mayúscula inicial, como en el dato original.
  const capitalized = value[0] !== value[0].toLocaleLowerCase("es");
  return capitalized ? translated[0].toLocaleUpperCase(locale) + translated.slice(1) : translated;
}

export function translateRestaurant(restaurant: Restaurant, locale: Locale): Restaurant {
  if (locale === "es") return restaurant;
  return {
    ...restaurant,
    description: DESCRIPTIONS[restaurant.id]?.[locale] ?? restaurant.description,
    city: term(restaurant.city, locale),
    cuisineType: restaurant.cuisineType.map(value => term(value, locale)),
    tags: restaurant.tags?.map(value => term(value, locale)),
  };
}

export const restaurantTranslationKeys = { descriptions: DESCRIPTIONS, terms: TERMS };
