"use client";
import { useState } from "react";
import type { RecipeIngredient } from "../domain/types";
import type { Locale } from "../i18n/config";
import { getDictionary } from "../i18n/dictionaries";
import { localeDirection } from "../i18n/config";
import { scaleIngredient } from "../domain/portions";

const copy: Record<Locale, [string, string, string]> = {
  es: ["Porciones", "Ajustar cantidades", "Solo se ajustan cantidades numéricas al inicio del ingrediente. Las cantidades descriptivas, al gusto y los tiempos permanecen iguales; revísalas al cambiar las porciones."],
  en: ["Servings", "Adjust quantities", "Only numeric quantities at the start of an ingredient are adjusted. Descriptive quantities, seasoning to taste and timings remain unchanged; check them when changing servings."],
  zh: ["份数", "调整用量", "仅调整食材开头的数字用量。描述性用量、按口味添加的调味料和时间不变；更改份数时请检查。"],
  hi: ["परोसने की संख्या", "मात्रा समायोजित करें", "केवल सामग्री की शुरुआत में दी गई संख्यात्मक मात्रा बदलती है। वर्णनात्मक मात्रा, स्वादानुसार मसाले और समय नहीं बदलते; परोसने की संख्या बदलते समय इन्हें जाँचें।"],
  fr: ["Portions", "Ajuster les quantités", "Seules les quantités numériques au début des ingrédients sont ajustées. Les quantités descriptives, l'assaisonnement selon le goût et les temps restent inchangés ; vérifiez-les lorsque vous changez les portions."],
  ar: ["الحصص", "تعديل الكميات", "تُعدَّل الكميات الرقمية في بداية المكونات فقط. لا تتغير الكميات الوصفية والتتبيل حسب الذوق والأوقات؛ راجعها عند تغيير عدد الحصص."],
  bn: ["পরিবেশনের সংখ্যা", "পরিমাণ বদলান", "উপকরণের শুরুতে থাকা সংখ্যাগত পরিমাণই বদলায়। বর্ণনামূলক পরিমাণ, স্বাদমতো মসলা ও সময় অপরিবর্তিত থাকে; পরিবেশনের সংখ্যা বদলালে এগুলো যাচাই করুন।"],
  pt: ["Porções", "Ajustar quantidades", "Só se ajustam quantidades numéricas no início dos ingredientes. Quantidades descritivas, tempero a gosto e tempos não mudam; verifique-os ao alterar as porções."],
  ru: ["Порции", "Изменить количества", "Меняются только числовые количества в начале ингредиента. Описательные количества, приправы по вкусу и время остаются прежними; проверьте их при изменении порций."],
  ur: ["حصے", "مقدار بدلیں", "صرف اجزاء کے شروع میں عددی مقدار بدلی جاتی ہے۔ وضاحتی مقدار، حسب ذائقہ مصالحے اور وقت وہی رہتے ہیں؛ حصے بدلتے وقت انہیں دیکھ لیں۔"],
  id: ["Porsi", "Sesuaikan jumlah", "Hanya jumlah angka di awal bahan yang disesuaikan. Jumlah deskriptif, bumbu sesuai selera dan waktu tetap sama; periksa saat mengubah porsi."],
  ja: ["人数", "分量を調整", "材料の先頭にある数値のみ調整されます。説明による量、好みで加える調味料、調理時間は変わりません。人数を変更した際は確認してください。"],
};

export function RecipeIngredients({ ingredients, servings, locale, contentLocale }: { ingredients: RecipeIngredient[]; servings: number; locale: Locale; contentLocale: Locale }) {
  const [portions, setPortions] = useState(servings);
  const [checked, setChecked] = useState<Set<number>>(() => new Set());
  const t = getDictionary(locale);
  const [label, title, hint] = copy[locale];
  return <div className="rounded-[var(--radius-xl2)] border border-line bg-card p-5 shadow-[var(--shadow-card)] md:sticky md:top-28 md:self-start">
    <h2 className="font-display text-xl text-ink">{t.recipe.ingredients}</h2>
    <fieldset className="my-4 rounded-xl border border-line p-3">
      <legend className="px-1 text-sm text-ink-soft">{title}</legend>
      <label className="flex items-center gap-3 text-sm">{label}
        <input type="number" min="1" max="100" step="1" value={portions} aria-describedby="portion-hint"
          onChange={event => { const value = Number(event.target.value); if (Number.isInteger(value) && value >= 1 && value <= 100) setPortions(value); }}
          className="w-20 rounded-lg border border-line bg-paper px-3 py-2 text-ink" />
      </label>
      <p id="portion-hint" className="mt-2 text-xs leading-relaxed text-ink-soft">{hint}</p>
    </fieldset>
    <ul className="space-y-3">
      {ingredients.map((ingredient, index) => <li key={index}>
        <label className="flex cursor-pointer items-start gap-3 text-base text-ink-soft">
          <input type="checkbox" checked={checked.has(index)} className="mt-1 shrink-0"
            onChange={() => setChecked(previous => { const next = new Set(previous); if (next.has(index)) next.delete(index); else next.add(index); return next; })} />
          <span lang={contentLocale} dir={localeDirection(contentLocale)} className={checked.has(index) ? "line-through opacity-60" : undefined}>
            {scaleIngredient(ingredient.text, portions / servings, contentLocale)}{ingredient.optional && <em> ({t.recipe.optional})</em>}
          </span>
        </label>
      </li>)}
    </ul>
  </div>;
}
