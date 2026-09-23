import type { Locale } from "./config";

export const photoUi: Record<Locale, { transformed: string; pending: string }> = {
  es: { transformed: "Fotografía redimensionada, convertida a WebP y recortada en pantalla.", pending: "Fotografía del plato pendiente" },
  en: { transformed: "Photo resized, converted to WebP and cropped for display.", pending: "Dish photograph pending" },
  zh: { transformed: "照片已调整尺寸、转换为 WebP 格式并为显示进行裁剪。", pending: "菜品照片待补充" },
  hi: { transformed: "फ़ोटो का आकार बदला गया है, WebP में परिवर्तित किया गया है और प्रदर्शन के लिए काटा गया है।", pending: "व्यंजन की फ़ोटो अभी उपलब्ध नहीं है" },
  fr: { transformed: "Photo redimensionnée, convertie en WebP et recadrée à l’affichage.", pending: "Photographie du plat à venir" },
  ar: { transformed: "تم تغيير حجم الصورة وتحويلها إلى WebP واقتصاصها للعرض.", pending: "صورة الطبق قيد الإعداد" },
  bn: { transformed: "ছবির আকার বদলে WebP-তে রূপান্তর করা হয়েছে এবং প্রদর্শনের জন্য ছাঁটা হয়েছে।", pending: "পদের ছবি এখনও দেওয়া হয়নি" },
  pt: { transformed: "Fotografia redimensionada, convertida para WebP e recortada na apresentação.", pending: "Fotografia do prato pendente" },
  ru: { transformed: "Фотография уменьшена, преобразована в WebP и кадрирована для показа.", pending: "Фотография блюда пока не добавлена" },
  ur: { transformed: "تصویر کا سائز تبدیل کیا گیا ہے، اسے WebP میں بدلا گیا ہے اور دکھانے کے لیے تراشا گیا ہے۔", pending: "پکوان کی تصویر ابھی دستیاب نہیں" },
  id: { transformed: "Foto diubah ukurannya, dikonversi ke WebP, dan dipotong untuk tampilan.", pending: "Foto hidangan belum tersedia" },
  ja: { transformed: "写真はサイズ調整とWebPへの変換を行い、表示用にトリミングしています。", pending: "料理の写真は準備中です" },
};
