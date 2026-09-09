const fs = require('fs');
const path = require('path');

// Configuración de rutas
const INPUT_DIR = path.join(__dirname, '../data_normalized');
const OUTPUT_DIR = path.join(__dirname, '../src/data/recipes');
const INDEX_OUTPUT = path.join(__dirname, '../src/data/countries_index.json');
const IMAGES_BASE = '/images/recipes';

// Asegurar directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Función para normalizar slug
const toSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Leer todos los archivos JSON del directorio normalizado
const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.json') && f !== 'countries_index.json' && f !== 'missing_fields_report.json');

let allCountries = [];
let totalRecipes = 0;

console.log('🔄 Iniciando transformación de datos...');

files.forEach(file => {
  const filePath = path.join(INPUT_DIR, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Determinar país basado en el nombre del archivo o propiedad
  const countryKey = file.replace('.json', '');
  const recipes = Array.isArray(content) ? content : [content];
  
  const transformedRecipes = recipes.map((recipe, index) => {
    // Mapeo de campos (soporta variaciones en inglés/español)
    const title = recipe.dishName || recipe.name || recipe.title || 'Sin título';
    const slug = recipe.slug || toSlug(title);
    const description = recipe.summary || recipe.description || recipe.intro || '';
    
    // Normalizar ingredientes (asegurar que sea array de strings)
    let ingredients = recipe.ingredients || [];
    if (typeof ingredients === 'string') {
      ingredients = ingredients.split(',').map(i => i.trim());
    }
    
    // Normalizar instrucciones
    let instructions = recipe.instructions || recipe.steps || recipe.method || [];
    if (typeof instructions === 'string') {
      instructions = instructions.split('\n').map(i => i.trim()).filter(i => i.length > 0);
    }

    // Construir receta en formato final
    return {
      id: recipe.id || `${countryKey}-${index}`,
      slug: slug,
      dishName: title,
      summary: description,
      country: recipe.country || countryKey, // Usar nombre del archivo si falta
      cuisine: recipe.cuisine || countryKey,
      prepTimeMin: recipe.prepTimeMin || recipe.prepTime || 15,
      cookTimeMin: recipe.cookTimeMin || recipe.cookTime || 30,
      totalTimeMin: recipe.totalTimeMin || recipe.totalTime || 45,
      servings: recipe.servings || recipe.yield || 4,
      calories: recipe.calories || 0,
      ingredients: ingredients,
      instructions: instructions,
      imagePath: `${IMAGES_BASE}/${countryKey}/${slug}.jpg`, // Ruta dinámica de imagen
      difficulty: recipe.difficulty || 'medium',
      tags: recipe.tags || [],
      // Metadatos SEO
      seoTitle: `${title} - Receta Auténtica de ${countryKey.charAt(0).toUpperCase() + countryKey.slice(1)}`,
      seoDescription: `Aprende a cocinar ${title.toLowerCase()}, un plato tradicional de ${countryKey}. ${description.substring(0, 100)}...`
    };
  });

  // Guardar archivo individual del país
  const outputFilePath = path.join(OUTPUT_DIR, `${countryKey}.json`);
  fs.writeFileSync(outputFilePath, JSON.stringify(transformedRecipes, null, 2));
  
  // Agregar al índice maestro
  allCountries.push({
    id: countryKey,
    name: {
      es: recipes[0]?.countryNameEs || countryKey.charAt(0).toUpperCase() + countryKey.slice(1),
      en: recipes[0]?.countryNameEn || countryKey.charAt(0).toUpperCase() + countryKey.slice(1),
    },
    slug: countryKey,
    flag: `https://flagcdn.com/w40/${getCountryCode(countryKey)}.png`, // Placeholder de bandera
    recipeCount: transformedRecipes.length,
    recipes: transformedRecipes.map(r => ({ slug: r.slug, title: r.dishName }))
  });

  totalRecipes += transformedRecipes.length;
  console.log(`✅ Procesado: ${countryKey} (${transformedRecipes.length} recetas)`);
});

// Función auxiliar para código de país (simplificada)
function getCountryCode(name) {
  const map = {
    'argentina': 'ar', 'brasil': 'br', 'chile': 'cl', 'colombia': 'co', 'mexico': 'mx', 'peru': 'pe',
    'espana': 'es', 'francia': 'fr', 'italia': 'it', 'alemania': 'de', 'reino-unido': 'gb',
    'estados-unidos': 'us', 'canada': 'ca', 'japon': 'jp', 'china': 'cn', 'india': 'in',
    'tailandia': 'th', 'vietnam': 'vn', 'corea-del-sur': 'kr', 'filipinas': 'ph', 'indonesia': 'id',
    'malasia': 'my', 'singapur': 'sg', 'turquia': 'tr', 'egipto': 'eg', 'etiopia': 'et',
    'grecia': 'gr', 'polonia': 'pl', 'ucrania': 'ua', 'hungria': 'hu', 'paises-bajos': 'nl',
    'portugal': 'pt', 'nueva-zelanda': 'nz', 'australia': 'au', 'costa-rica': 'cr', 'panama': 'pa',
    'cuba': 'cu', 'venezuela': 've', 'ecuador': 'ec'
  };
  return map[name.toLowerCase()] || 'xx';
}

// Guardar índice maestro
fs.writeFileSync(INDEX_OUTPUT, JSON.stringify(allCountries, null, 2));

console.log('\n🎉 Transformación completada!');
console.log(`📂 Archivos generados: ${files.length}`);
console.log(`📝 Total recetas: ${totalRecipes}`);
console.log(`📋 Índice maestro: ${INDEX_OUTPUT}`);
