import type { Locale } from "./config";

export const photoUi: Record<Locale, { transformed: string; pending: string; generated: string }> = {
  es: { transformed: "Fotografía redimensionada, convertida a WebP y recortada en pantalla.", pending: "Fotografía del plato pendiente", generated: "Imagen ilustrativa generada digitalmente; la presentación puede variar." },
  en: { transformed: "Photo resized, converted to WebP and cropped for display.", pending: "Dish photograph pending", generated: "Digitally generated illustration; presentation may vary." },
  zh: { transformed: "照片已调整尺寸、转换为 WebP 格式并为显示进行裁剪。", pending: "菜品照片待补充", generated: "数字生成的示意图片；实际摆盘可能不同。" },
  hi: { transformed: "फ़ोटो का आकार बदला गया है, WebP में परिवर्तित किया गया है और प्रदर्शन के लिए काटा गया है।", pending: "व्यंजन की फ़ोटो अभी उपलब्ध नहीं है", generated: "डिजिटल रूप से बनाई गई चित्रात्मक छवि; परोसने का तरीका अलग हो सकता है।" },
  fr: { transformed: "Photo redimensionnée, convertie en WebP et recadrée à l’affichage.", pending: "Photographie du plat à venir", generated: "Illustration générée numériquement ; la présentation peut varier." },
  ar: { transformed: "تم تغيير حجم الصورة وتحويلها إلى WebP واقتصاصها للعرض.", pending: "صورة الطبق قيد الإعداد", generated: "صورة توضيحية مولدة رقمياً؛ قد يختلف شكل التقديم." },
  bn: { transformed: "ছবির আকার বদলে WebP-তে রূপান্তর করা হয়েছে এবং প্রদর্শনের জন্য ছাঁটা হয়েছে।", pending: "পদের ছবি এখনও দেওয়া হয়নি", generated: "ডিজিটালি তৈরি নমুনা ছবি; পরিবেশনা ভিন্ন হতে পারে।" },
  pt: { transformed: "Fotografia redimensionada, convertida para WebP e recortada na apresentação.", pending: "Fotografia do prato pendente", generated: "Imagem ilustrativa gerada digitalmente; a apresentação pode variar." },
  ru: { transformed: "Фотография уменьшена, преобразована в WebP и кадрирована для показа.", pending: "Фотография блюда пока не добавлена", generated: "Иллюстративное изображение создано цифровым способом; подача может отличаться." },
  ur: { transformed: "تصویر کا سائز تبدیل کیا گیا ہے، اسے WebP میں بدلا گیا ہے اور دکھانے کے لیے تراشا گیا ہے۔", pending: "پکوان کی تصویر ابھی دستیاب نہیں", generated: "ڈیجیٹل طور پر بنائی گئی نمائشی تصویر؛ پیشکش مختلف ہو سکتی ہے۔" },
  id: { transformed: "Foto diubah ukurannya, dikonversi ke WebP, dan dipotong untuk tampilan.", pending: "Foto hidangan belum tersedia", generated: "Gambar ilustrasi yang dibuat secara digital; penyajian dapat berbeda." },
  ja: { transformed: "写真はサイズ調整とWebPへの変換を行い、表示用にトリミングしています。", pending: "料理の写真は準備中です", generated: "デジタル生成のイメージ画像です。盛り付けは異なる場合があります。" },
};
