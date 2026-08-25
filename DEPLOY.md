# Guía de deploy — Atlas Gastronómico → Vercel

El sitio es una app **Next.js** que vive en la subcarpeta `atlas-gastronomico/`.
Vercel corre Next.js de forma nativa (no hay que configurar nada raro).

## Antes de empezar (lo que tú necesitas)
1. Una cuenta de **GitHub** (gratis): https://github.com
2. Una cuenta de **Vercel** (gratis): https://vercel.com — inicia sesión **con GitHub** (un clic).

---

## Paso 1 — Subir el código a GitHub

1. En GitHub, crea un repositorio nuevo **vacío** (botón **New**). Ponle un nombre, p. ej. `atlas-gastronomico`.
   - **No** marques "Add README/.gitignore/license" (déjalo vacío).
2. Copia la URL que te da (algo como `https://github.com/TU_USUARIO/atlas-gastronomico.git`).
3. En tu computadora, dentro de la carpeta del proyecto, ejecuta (reemplaza la URL):

```bash
cd "C:\Users\jesus\OneDrive\Escritorio\recetas"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/atlas-gastronomico.git
git push -u origin main
```

> Git te pedirá iniciar sesión en GitHub la primera vez (se abre una ventana del navegador).

Con eso, todo el código queda en GitHub.

---

## Paso 2 — Importar en Vercel

1. Entra a https://vercel.com/new
2. Elige **Import Git Repository** y selecciona tu repo `atlas-gastronomico`.
3. **MUY IMPORTANTE — Root Directory:** haz clic en **Edit** y selecciona la carpeta **`atlas-gastronomico`**.
   (El código de la app está en esa subcarpeta; si no lo cambias, el deploy falla.)
4. **Framework Preset:** Vercel detectará **Next.js** solo. Deja Build Command y Output Directory en automático.
5. Haz clic en **Deploy**.

En ~1-2 minutos tendrás una URL pública tipo `https://atlas-gastronomico-xxxx.vercel.app`.
Abre `…/es` (español) o `…/en` (inglés). La raíz `/` redirige a `/es`.

---

## Paso 3 — (Opcional) Dominio propio

1. En el proyecto de Vercel → **Settings → Domains** → agrega tu dominio (Hostinger, GoDaddy, etc.) y sigue las instrucciones de DNS.
2. Para que el SEO (`hreflang`, enlaces canónicos) use tu dominio real, en **Settings → Environment Variables** agrega:
   - `NEXT_PUBLIC_SITE_URL` = `https://tudominio.com`
   - Vuelve a desplegar (Deployments → Redeploy).

> Si no pones dominio propio, el sitio usa automáticamente la URL de Vercel — funciona igual.

---

## Después: actualizaciones automáticas
Cada vez que subas cambios a GitHub (`git push`), Vercel **redepliega solo**. No tienes que hacer nada más.

## Notas
- Plan **Hobby (gratis)** de Vercel es suficiente para empezar. Para uso comercial intenso, más adelante evalúa el plan Pro.
- Node.js: Vercel usa una versión compatible automáticamente.
- Las imágenes viven en `atlas-gastronomico/public/images/` y se publican como parte del sitio.
