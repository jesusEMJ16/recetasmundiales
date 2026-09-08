import { PLACES } from './src/data/places';
import { RECIPES } from './src/data/recipes';

function getDescendantIds(parentId: string): Set<string> {
  const ids = new Set<string>([parentId]);
  for (const p of PLACES) {
    if (p.parentId === parentId) {
      for (const childId of getDescendantIds(p.id)) {
        ids.add(childId);
      }
    }
  }
  return ids;
}

const europeanCountries = ['it', 'fr', 'es', 'de', 'gr', 'pt'];

console.log('=== VERIFICACIÓN DE RECETAS EUROPEAS ===\n');

for (const countryId of europeanCountries) {
  const country = PLACES.find(p => p.id === countryId);
  if (!country) {
    console.log(`País ${countryId} no encontrado`);
    continue;
  }
  
  const descendantIds = getDescendantIds(countryId);
  const recipes = RECIPES.filter(r => descendantIds.has(r.placeId));
  
  console.log(`${country.name}: ${recipes.length} recetas`);
  recipes.forEach(r => console.log(`  - ${r.dishName} (${r.placeId})`));
  console.log('');
}
