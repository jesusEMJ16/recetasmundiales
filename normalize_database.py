#!/usr/bin/env python3
"""
Script de normalización de base de datos de recetas World Bites
Autor: Auditor Senior SEO/UX/i18n
Propósito: Eliminar duplicados, normalizar estructura, identificar problemas
"""

import json
import os
from pathlib import Path
from collections import defaultdict
import hashlib

# Configuración
WORKSPACE = Path("/workspace")
DATA_DIRS = [
    WORKSPACE / "data" / "recipes",
    WORKSPACE / "atlas-gastronomico" / "data" / "recipes",
    WORKSPACE / "atlas-gastronomico" / "src" / "data" / "recipes",
]

OUTPUT_DIR = WORKSPACE / "data_normalized"
OUTPUT_DIR.mkdir(exist_ok=True)

# Archivos a ignorar (archivos combinados/partes)
IGNORE_FILES = {
    "europe_all.json",
    "europe_part1.json",
    "europe_part2.json",
}

def get_file_hash(content):
    """Generar hash único para detectar duplicados exactos"""
    return hashlib.md5(json.dumps(content, sort_keys=True).encode()).hexdigest()

def normalize_recipe(recipe, source_file):
    """Normalizar estructura de receta a formato estándar"""
    # Mapeo de campos en español a inglés
    field_mapping = {
        "nombre": "name",
        "pais": "country",
        "region": "region",
        "ciudad": "city",
        "coordenadas": "coordinates",
        "descripcion": "description",
        "historia": "history",
        "ingredientes": "ingredients",
        "instrucciones": "instructions",
        "tiempo_preparacion": "prepTime",
        "tiempo_coccion": "cookTime",
        "porciones": "servings",
        "dificultad": "difficulty",
        "tags": "tags",
        "imagen": "image",
    }
    
    normalized = {}
    
    for key, value in recipe.items():
        # Convertir campo al nombre estándar
        new_key = field_mapping.get(key, key)
        
        # Normalizar coordenadas a array [lat, lng]
        if key == "coordenadas" or new_key == "coordinates":
            if isinstance(value, dict):
                lat = value.get("lat", value.get("latitude", 0))
                lng = value.get("lng", value.get("longitude", 0))
                value = [lat, lng]
            elif isinstance(value, list) and len(value) == 2:
                value = value
        
        # Normalizar tiempos (sumar prep + cook si existe totalTime)
        if key == "tiempo_preparacion" or new_key == "prepTime":
            normalized["prepTime"] = int(value) if value else 0
        
        if key == "tiempo_coccion" or new_key == "cookTime":
            normalized["cookTime"] = int(value) if value else 0
            # Calcular tiempo total
            prep = normalized.get("prepTime", 0)
            normalized["totalTime"] = prep + int(value) if value else prep
        
        # Normalizar dificultad
        if key == "dificultad" or new_key == "difficulty":
            difficulty_map = {
                "fácil": "Easy", "facil": "Easy", "easy": "Easy",
                "media": "Medium", "medio": "Medium", "medium": "Medium",
                "difícil": "Hard", "dificil": "Hard", "hard": "Hard", "alta": "Hard"
            }
            value = difficulty_map.get(str(value).lower(), value)
        
        # Asegurar que ID exista
        if key == "id" or new_key == "id":
            normalized["id"] = value
        
        normalized[new_key] = value
    
    # Agregar metadatos de origen
    normalized["_source_file"] = str(source_file)
    normalized["_normalized"] = True
    
    return normalized

def extract_country_from_path(path):
    """Extraer país del path del archivo"""
    parts = path.parts
    # Buscar el nombre del archivo sin extensión
    filename = path.stem
    
    # El país está generalmente en el nombre del archivo
    return filename.replace("_", "-").lower()

def load_all_recipes():
    """Cargar todas las recetas de todos los directorios"""
    all_recipes = []
    files_processed = []
    
    for data_dir in DATA_DIRS:
        if not data_dir.exists():
            continue
            
        for json_file in data_dir.rglob("*.json"):
            if json_file.name in IGNORE_FILES:
                print(f"⚠️  Ignorando archivo combinado: {json_file.name}")
                continue
            
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    content = json.load(f)
                
                # Asegurar que es una lista
                if isinstance(content, dict):
                    content = [content]
                
                for recipe in content:
                    normalized = normalize_recipe(recipe, json_file)
                    normalized["_original_file"] = str(json_file)
                    all_recipes.append(normalized)
                
                files_processed.append(str(json_file))
                
            except Exception as e:
                print(f"❌ Error leyendo {json_file}: {e}")
    
    return all_recipes, files_processed

def detect_duplicates(recipes):
    """Detectar duplicados por ID, nombre+país, y contenido"""
    by_id = defaultdict(list)
    by_name_country = defaultdict(list)
    by_hash = defaultdict(list)
    
    for recipe in recipes:
        # Por ID
        recipe_id = recipe.get("id", "").lower().strip()
        if recipe_id:
            by_id[recipe_id].append(recipe)
        
        # Por nombre + país
        name = recipe.get("name", "").lower().strip()
        country = recipe.get("country", "").lower().strip()
        if name and country:
            key = f"{name}|{country}"
            by_name_country[key].append(recipe)
        
        # Por hash de contenido (excluyendo metadatos)
        content_for_hash = {k: v for k, v in recipe.items() if not k.startswith("_")}
        recipe_hash = get_file_hash(content_for_hash)
        by_hash[recipe_hash].append(recipe)
    
    return by_id, by_name_country, by_hash

def analyze_data_quality(recipes):
    """Analizar calidad de datos"""
    issues = {
        "missing_fields": [],
        "empty_fields": [],
        "invalid_coordinates": [],
        "missing_images": [],
        "short_descriptions": [],
        "missing_history": [],
        "inconsistent_difficulty": [],
    }
    
    required_fields = ["id", "name", "country", "description", "ingredients", "instructions"]
    
    for recipe in recipes:
        # Campos requeridos faltantes
        for field in required_fields:
            if field not in recipe or not recipe[field]:
                issues["missing_fields"].append({
                    "recipe_id": recipe.get("id", "unknown"),
                    "field": field,
                    "file": recipe.get("_source_file", "unknown")
                })
        
        # Campos vacíos
        for field in ["description", "history", "image"]:
            if field in recipe and (not recipe[field] or recipe[field] == ""):
                issues["empty_fields"].append({
                    "recipe_id": recipe.get("id", "unknown"),
                    "field": field
                })
        
        # Coordenadas inválidas
        coords = recipe.get("coordinates", [])
        if coords:
            if not isinstance(coords, list) or len(coords) != 2:
                issues["invalid_coordinates"].append({
                    "recipe_id": recipe.get("id"),
                    "coords": coords
                })
            else:
                lat, lng = coords
                if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
                    issues["invalid_coordinates"].append({
                        "recipe_id": recipe.get("id"),
                        "coords": coords
                    })
        
        # Imágenes faltantes
        if not recipe.get("image"):
            issues["missing_images"].append(recipe.get("id", "unknown"))
        
        # Descripciones muy cortas
        desc = recipe.get("description", "")
        if len(desc) < 50:
            issues["short_descriptions"].append({
                "recipe_id": recipe.get("id"),
                "length": len(desc)
            })
        
        # Historia faltante
        if not recipe.get("history"):
            issues["missing_history"].append(recipe.get("id", "unknown"))
    
    return issues

def deduplicate_recipes(recipes, by_id, by_name_country):
    """Eliminar duplicados manteniendo la versión más completa"""
    seen_ids = set()
    unique_recipes = []
    duplicates_removed = []
    
    for recipe in recipes:
        recipe_id = recipe.get("id", "").lower().strip()
        
        if recipe_id in seen_ids:
            duplicates_removed.append({
                "id": recipe_id,
                "reason": "duplicate_id",
                "file": recipe.get("_source_file")
            })
            continue
        
        # Verificar duplicado por nombre+país
        name = recipe.get("name", "").lower().strip()
        country = recipe.get("country", "").lower().strip()
        name_country_key = f"{name}|{country}"
        
        # Si hay múltiples versiones, elegir la más completa
        candidates = by_name_country.get(name_country_key, [])
        if len(candidates) > 1:
            # Ordenar por completitud (más campos = mejor)
            best = max(candidates, key=lambda r: len([v for v in r.values() if v]))
            if recipe != best:
                duplicates_removed.append({
                    "id": recipe_id,
                    "reason": "duplicate_name_country",
                    "kept_file": best.get("_source_file"),
                    "removed_file": recipe.get("_source_file")
                })
                continue
        
        seen_ids.add(recipe_id)
        unique_recipes.append(recipe)
    
    return unique_recipes, duplicates_removed

def organize_by_country(recipes):
    """Organizar recetas por país"""
    by_country = defaultdict(list)
    
    for recipe in recipes:
        country = recipe.get("country", "Unknown").lower().replace(" ", "-")
        by_country[country].append(recipe)
    
    return by_country

def save_normalized_data(recipes, by_country):
    """Guardar datos normalizados"""
    # Guardar todo en un solo archivo maestro
    master_file = OUTPUT_DIR / "all_recipes.json"
    with open(master_file, 'w', encoding='utf-8') as f:
        json.dump(recipes, f, indent=2, ensure_ascii=False)
    print(f"✅ Guardado {len(recipes)} recetas en {master_file}")
    
    # Guardar por país
    countries_dir = OUTPUT_DIR / "by_country"
    countries_dir.mkdir(exist_ok=True)
    
    for country, country_recipes in by_country.items():
        country_file = countries_dir / f"{country}.json"
        with open(country_file, 'w', encoding='utf-8') as f:
            json.dump(country_recipes, f, indent=2, ensure_ascii=False)
    
    # Guardar índice de países
    index_file = OUTPUT_DIR / "countries_index.json"
    countries_index = {
        country: {
            "count": len(recipes),
            "recipe_ids": [r.get("id") for r in recipes]
        }
        for country, recipes in by_country.items()
    }
    
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(countries_index, f, indent=2, ensure_ascii=False)
    
    return countries_index

def generate_report(files_processed, recipes, duplicates, issues, countries_index):
    """Generar reporte detallado"""
    report = []
    report.append("# 📊 Reporte de Normalización de Base de Datos World Bites")
    report.append("")
    report.append("## Resumen Ejecutivo")
    report.append("")
    report.append(f"- **Archivos procesados:** {len(files_processed)}")
    report.append(f"- **Recetas totales encontradas:** {len(recipes) + len(duplicates)}")
    report.append(f"- **Duplicados eliminados:** {len(duplicates)}")
    report.append(f"- **Recetas únicas finales:** {len(recipes)}")
    report.append(f"- **Países únicos:** {len(countries_index)}")
    report.append("")
    
    report.append("## Archivos Procesados")
    report.append("")
    for f in sorted(files_processed):
        report.append(f"- `{f}`")
    report.append("")
    
    report.append("## Duplicados Eliminados")
    report.append("")
    if duplicates:
        report.append("| ID | Razón | Archivo Original | Archivo Mantenido |")
        report.append("|-----|-------|------------------|-------------------|")
        for dup in duplicates[:20]:  # Mostrar primeros 20
            report.append(f"| {dup.get('id', 'N/A')} | {dup.get('reason', 'N/A')} | {dup.get('removed_file', 'N/A')} | {dup.get('kept_file', 'N/A')} |")
        if len(duplicates) > 20:
            report.append(f"\n*... y {len(duplicates) - 20} más*")
    else:
        report.append("✅ No se encontraron duplicados")
    report.append("")
    
    report.append("## Problemas de Calidad de Datos")
    report.append("")
    
    report.append(f"### Campos Requeridos Faltantes: {len(issues['missing_fields'])}")
    if issues['missing_fields']:
        for issue in issues['missing_fields'][:10]:
            report.append(f"- Receta `{issue['recipe_id']}`: falta `{issue['field']}`")
        if len(issues['missing_fields']) > 10:
            report.append(f"*... y {len(issues['missing_fields']) - 10} más*")
    else:
        report.append("✅ Todos los campos requeridos presentes")
    report.append("")
    
    report.append(f"### Campos Vacíos: {len(issues['empty_fields'])}")
    if issues['empty_fields']:
        for issue in issues['empty_fields'][:10]:
            report.append(f"- Receta `{issue['recipe_id']}`: campo `{issue['field']}` vacío")
    else:
        report.append("✅ No hay campos vacíos")
    report.append("")
    
    report.append(f"### Imágenes Faltantes: {len(issues['missing_images'])}")
    if issues['missing_images']:
        report.append(", ".join(issues['missing_images'][:20]))
        if len(issues['missing_images']) > 20:
            report.append(f"*... y {len(issues['missing_images']) - 20} más*")
    else:
        report.append("✅ Todas las recetas tienen imagen")
    report.append("")
    
    report.append(f"### Historias Faltantes: {len(issues['missing_history'])}")
    if issues['missing_history']:
        report.append(", ".join(issues['missing_history'][:20]))
        if len(issues['missing_history']) > 20:
            report.append(f"*... y {len(issues['missing_history']) - 20} más*")
    else:
        report.append("✅ Todas las recetas tienen historia")
    report.append("")
    
    report.append("## Distribución por País")
    report.append("")
    report.append("| País | Recetas | IDs de Recetas |")
    report.append("|------|---------|----------------|")
    for country, data in sorted(countries_index.items(), key=lambda x: -x[1]['count']):
        ids_preview = ", ".join(data['recipe_ids'][:3])
        if len(data['recipe_ids']) > 3:
            ids_preview += f"... ({data['count']} total)"
        report.append(f"| {country} | {data['count']} | {ids_preview} |")
    report.append("")
    
    report.append("## Recomendaciones Prioritarias")
    report.append("")
    report.append("### 🔴 Críticas")
    report.append("1. Eliminar archivos duplicados del código fuente")
    report.append("2. Agregar imágenes a todas las recetas")
    report.append("3. Completar campo `history` en todas las recetas")
    report.append("")
    report.append("### 🟡 Altas")
    report.append("1. Estandarizar todos los nombres de campos en inglés")
    report.append("2. Validar coordenadas geográficas")
    report.append("3. Expandir descripciones a mínimo 150 caracteres")
    report.append("")
    report.append("### 🟢 Medias")
    report.append("1. Agregar schema.org Recipe completo")
    report.append("2. Implementar sistema de traducciones i18n")
    report.append("3. Crear slugs amigables para URLs")
    report.append("")
    
    return "\n".join(report)

def main():
    print("🚀 Iniciando normalización de base de datos World Bites...")
    print("")
    
    # Cargar todas las recetas
    print("📂 Cargando recetas de todos los directorios...")
    recipes, files_processed = load_all_recipes()
    print(f"   ✅ {len(recipes)} recetas cargadas de {len(files_processed)} archivos")
    print("")
    
    # Detectar duplicados
    print("🔍 Detectando duplicados...")
    by_id, by_name_country, by_hash = detect_duplicates(recipes)
    
    dup_ids = sum(1 for v in by_id.values() if len(v) > 1)
    dup_name_country = sum(1 for v in by_name_country.values() if len(v) > 1)
    dup_hash = sum(1 for v in by_hash.values() if len(v) > 1)
    
    print(f"   ⚠️  {dup_ids} IDs duplicados")
    print(f"   ⚠️  {dup_name_country} duplicados por nombre+país")
    print(f"   ⚠️  {dup_hash} duplicados exactos por contenido")
    print("")
    
    # Analizar calidad
    print("📊 Analizando calidad de datos...")
    issues = analyze_data_quality(recipes)
    print(f"   ❌ {len(issues['missing_fields'])} campos requeridos faltantes")
    print(f"   ❌ {len(issues['empty_fields'])} campos vacíos")
    print(f"   ❌ {len(issues['missing_images'])} imágenes faltantes")
    print(f"   ❌ {len(issues['missing_history'])} historias faltantes")
    print("")
    
    # Eliminar duplicados
    print("🗑️  Eliminando duplicados...")
    unique_recipes, duplicates_removed = deduplicate_recipes(recipes, by_id, by_name_country)
    print(f"   ✅ {len(duplicates_removed)} duplicados eliminados")
    print(f"   ✅ {len(unique_recipes)} recetas únicas restantes")
    print("")
    
    # Organizar por país
    print("🌍 Organizando por país...")
    by_country = organize_by_country(unique_recipes)
    print(f"   ✅ {len(by_country)} países identificados")
    print("")
    
    # Guardar datos normalizados
    print("💾 Guardando datos normalizados...")
    countries_index = save_normalized_data(unique_recipes, by_country)
    print("")
    
    # Generar reporte
    print("📝 Generando reporte...")
    report = generate_report(files_processed, unique_recipes, duplicates_removed, issues, countries_index)
    
    report_file = OUTPUT_DIR / "normalization_report.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"   ✅ Reporte guardado en {report_file}")
    print("")
    
    print("=" * 60)
    print("✅ NORMALIZACIÓN COMPLETADA")
    print("=" * 60)
    print(f"📁 Datos normalizados en: {OUTPUT_DIR}")
    print(f"📊 Recetas únicas: {len(unique_recipes)}")
    print(f"🌍 Países: {len(countries_index)}")
    print(f"🗑️  Duplicados eliminados: {len(duplicates_removed)}")
    print(f"📋 Reporte: {report_file}")
    print("")
    print("👉 Próximo paso: Revisar el reporte y aplicar recomendaciones")

if __name__ == "__main__":
    main()
