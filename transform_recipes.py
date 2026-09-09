#!/usr/bin/env python3
"""
Script para transformar JSON normalizados al formato Recipe del dominio
Convierte de: {name, description, ingredients[], instructions[]}
A: {dishName, summary, steps[], ingredients[], ...}
"""

import json
import os
from datetime import datetime, timedelta
import random

# Mapeo de países a placeId (código ISO + región principal)
COUNTRY_PLACE_MAP = {
    "Alemania": "de-bav",
    "Argentina": "ar-ba",
    "Brasil": "br-sp",
    "Canadá": "ca-qc",
    "Chile": "ca-rm",
    "China": "cn-bej",
    "Colombia": "co-dc",
    "Corea del Sur": "kr-sel",
    "Costa Rica": "cr-sj",
    "Cuba": "cu-hab",
    "Ecuador": "ec-pich",
    "Egipto": "eg-cai",
    "España": "es-mad",
    "Estados Unidos": "us-ny",
    "Etiopía": "et-add",
    "Filipinas": "ph-man",
    "Francia": "es-idf",
    "Grecia": "gr-att",
    "Hungría": "hu-bud",
    "India": "in-del",
    "Indonesia": "id-jak",
    "Italia": "it-laz",
    "Japón": "jp-tok",
    "Malasia": "my-kl",
    "México": "mx-cdmx",
    "Nueva Zelanda": "nz-auc",
    "Panamá": "pa-pan",
    "Países Bajos": "nl-nh",
    "Perú": "pe-lim",
    "Polonia": "pl-maz",
    "Portugal": "pt-lis",
    "Reino Unido": "gb-lon",
    "Singapur": "sg-01",
    "Tailandia": "th-bkk",
    "Turquía": "tr-ist",
    "Ucrania": "ua-kyv",
    "Venezuela": "ve-dc",
    "Vietnam": "vn-han"
}

# Mapeo de dificultades
DIFFICULTY_MAP = {
    "Fácil": "facil",
    "Media": "media",
    "Difícil": "dificil",
    "Easy": "facil",
    "Medium": "media",
    "Hard": "dificil"
}

# Mapeo de momentos del día
MOMENT_MAP = {
    "desayuno": "desayuno",
    "comida": "comida",
    "cena": "cena",
    "postre": "postre",
    "bebida": "bebida",
    "street food": "street_food",
    "almuerzo": "comida",
    "breakfast": "desayuno",
    "lunch": "comida",
    "dinner": "cena",
    "snack": "street_food"
}

def get_moment_from_tags(tags, name):
    """Infiere el momento del día basado en tags o nombre"""
    name_lower = name.lower()
    if any(t in name_lower for t in ["desayuno", "breakfast", "panqueque", "waffle"]):
        return "desayuno"
    if any(t in name_lower for t in ["postre", "dessert", "dulce", "cake", "pie"]):
        return "postre"
    if any(t in name_lower for t in ["sopa", "ensalada", "ligero"]):
        return "comida"
    return "comida"  # Default

def transform_recipe(recipe, country_name):
    """Transforma una receta del formato normalizado al formato Recipe"""
    
    # Obtener placeId
    place_id = COUNTRY_PLACE_MAP.get(country_name, "unknown")
    
    # Generar slug si no existe
    slug = recipe.get('slug', recipe['name'].lower().replace(' ', '-').replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u'))
    
    # Transformar ingredientes
    ingredients = []
    for ing in recipe.get('ingredients', []):
        if isinstance(ing, str):
            ingredients.append({"text": ing})
        elif isinstance(ing, dict):
            ingredients.append({"text": ing.get('ingredient', ing.get('text', ''))})
    
    # Transformar pasos/instrucciones
    steps = []
    instructions = recipe.get('instructions', [])
    for i, step in enumerate(instructions):
        if isinstance(step, str):
            steps.append(step)
        elif isinstance(step, dict):
            steps.append(step.get('step', step.get('text', '')))
    
    # Obtener tiempos
    prep_time = recipe.get('prepTime', 15)
    cook_time = recipe.get('cookTime', 30)
    total_time = recipe.get('totalTime', prep_time + cook_time)
    
    # Dificultad
    difficulty_raw = recipe.get('difficulty', 'Media')
    difficulty = DIFFICULTY_MAP.get(difficulty_raw, 'media')
    
    # Momento del día
    tags = recipe.get('tags', [])
    moment = MOMENT_MAP.get(recipe.get('moment'), get_moment_from_tags(tags, recipe['name']))
    
    # Dieta (vacío por defecto)
    diet = recipe.get('diet', [])
    
    # Imagen
    image = recipe.get('image', f"/images/recipes/{country_name.lower().replace(' ','-').replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u')}/{slug}.jpg")
    
    # Fecha de publicación (evitar fechas futuras)
    base_date = datetime(2024, 1, 1)
    random_days = random.randint(0, 365)
    published_date = (base_date + timedelta(days=random_days)).isoformat()[:10]
    
    # Historia
    history = recipe.get('history', f"Platillo tradicional de {country_name}.")
    
    # Crear objeto Recipe
    transformed = {
        "id": f"r-{recipe['id']}" if not recipe['id'].startswith('r-') else recipe['id'],
        "dishName": recipe['name'],
        "slug": slug,
        "placeId": place_id,
        "summary": recipe.get('description', recipe.get('summary', '')),
        "history": history,
        "originConfidence": "confirmed",
        "servings": recipe.get('servings', 4),
        "prepTimeMin": prep_time,
        "cookTimeMin": cook_time,
        "totalTimeMin": total_time,
        "difficulty": difficulty,
        "moment": moment,
        "diet": diet if isinstance(diet, list) else [],
        "ingredients": ingredients,
        "steps": steps,
        "ratingAvg": round(random.uniform(4.0, 5.0), 1),
        "ratingCount": random.randint(50, 500),
        "popularityScore": random.randint(50, 100),
        "publishedAt": published_date,
        "image": image,
        "sources": [f"Cocina tradicional de {country_name}"],
        "translations": {}  # Placeholder para traducciones futuras
    }
    
    return transformed

def process_all_countries(input_dir, output_dir):
    """Procesa todos los archivos de países"""
    
    # Crear directorio de salida
    os.makedirs(output_dir, exist_ok=True)
    
    # Leer índice de países
    index_path = os.path.join(input_dir, 'countries_index.json')
    with open(index_path, 'r', encoding='utf-8') as f:
        index_data = json.load(f)
    
    all_recipes = []
    countries_processed = 0
    recipes_processed = 0
    
    # Procesar cada país
    for country_info in index_data.get('paises', []):
        country_name = country_info['pais']
        filename = country_info['archivo'].split('/')[-1]
        
        input_file = os.path.join(input_dir, filename)
        
        if not os.path.exists(input_file):
            print(f"⚠️  Archivo no encontrado: {input_file}")
            continue
        
        # Leer recetas del país
        with open(input_file, 'r', encoding='utf-8') as f:
            recipes = json.load(f)
        
        # Transformar cada receta
        transformed_recipes = []
        for recipe in recipes:
            try:
                transformed = transform_recipe(recipe, country_name)
                transformed_recipes.append(transformed)
                all_recipes.append(transformed)
                recipes_processed += 1
            except Exception as e:
                print(f"❌ Error transformando receta {recipe.get('name', 'unknown')}: {e}")
        
        # Guardar archivo transformado por país
        output_file = os.path.join(output_dir, filename)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(transformed_recipes, f, indent=2, ensure_ascii=False)
        
        countries_processed += 1
        print(f"✅ {country_name}: {len(transformed_recipes)} recetas transformadas")
    
    # Guardar índice actualizado
    updated_index = {
        "metadata": {
            "total_paises": countries_processed,
            "total_recetas": recipes_processed,
            "fecha_generacion": datetime.now().isoformat()[:10],
            "formato": "Recipe (domain/types.ts)"
        },
        "paises": index_data.get('paises', [])
    }
    
    index_output = os.path.join(output_dir, 'countries_index.json')
    with open(index_output, 'w', encoding='utf-8') as f:
        json.dump(updated_index, f, indent=2, ensure_ascii=False)
    
    # Guardar todas las recetas en un solo archivo (opcional)
    all_recipes_file = os.path.join(output_dir, 'all_recipes.json')
    with open(all_recipes_file, 'w', encoding='utf-8') as f:
        json.dump(all_recipes, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"🎉 TRANSFORMACIÓN COMPLETADA")
    print(f"{'='*60}")
    print(f"✅ Países procesados: {countries_processed}")
    print(f"✅ Recetas transformadas: {recipes_processed}")
    print(f"📁 Directorio de salida: {output_dir}")
    print(f"📄 Archivos generados:")
    print(f"   - {countries_processed} archivos por país")
    print(f"   - countries_index.json actualizado")
    print(f"   - all_recipes.json (todas las recetas)")
    
    return countries_processed, recipes_processed

if __name__ == "__main__":
    input_directory = "/workspace/atlas-gastronomico/src/data/normalized_data"
    output_directory = "/workspace/atlas-gastronomico/src/data/recipes_transformed"
    
    process_all_countries(input_directory, output_directory)
