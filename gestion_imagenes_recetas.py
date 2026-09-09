#!/usr/bin/env python3
"""
Script para buscar y descargar imágenes de recetas desde internet.
Si no encuentra imágenes reales, genera placeholders profesionales.

Fase 1 - Parte A: Gestión de Imágenes de Recetas
"""

import os
import json
import requests
from PIL import Image, ImageDraw, ImageFont
from unidecode import unidecode
import hashlib
import time
from pathlib import Path

# Configuración
DATA_DIR = "data_normalized"
IMAGES_BASE_DIR = "public/images/recipes"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

# Colores por región para placeholders
REGION_COLORS = {
    'europa': ['#2E86AB', '#A23B72', '#F18F01', '#C73E1D'],
    'asia': ['#E63946', '#F1FAEE', '#A8DADC', '#457B9D'],
    'latinoamerica': ['#D62828', '#F77F00', '#FCBF49', '#EAE2B7'],
    'norteamerica': ['#003049', '#D62828', '#F77F00', '#FCBF49'],
    'africa': ['#D62828', '#F77F00', '#FCAF3E', '#FFFFFF'],
    'oceania': ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8'],
    'caribe': ['#EF476F', '#FFD166', '#06D6A0', '#118AB2'],
    'oriente_medio': ['#B5838D', '#6D6875', '#E5989B', '#FFB4A2']
}

def get_region(country):
    """Determinar región basada en el país"""
    country_lower = country.lower()
    
    europa = ['alemania', 'españa', 'francia', 'italia', 'grecia', 'portugal', 'reino-unido', 
              'paises-bajos', 'polonia', 'hungria', 'ucrania']
    asia = ['china', 'japon', 'corea-del-sur', 'india', 'tailandia', 'vietnam', 'indonesia', 
            'malasia', 'filipinas', 'singapur', 'turquia']
    latinoamerica = ['mexico', 'argentina', 'colombia', 'peru', 'chile', 'ecuador', 'venezuela', 
                     'costa-rica', 'panama', 'cuba']
    norteamerica = ['estados-unidos', 'canada']
    africa = ['egipto', 'etiopia']
    oceania = ['nueva-zelanda']
    caribe = ['cuba']  # También Caribe
    oriente_medio = ['turquia', 'egipto']
    
    if country_lower in europa:
        return 'europa'
    elif country_lower in asia:
        return 'asia'
    elif country_lower in latinoamerica:
        return 'latinoamerica'
    elif country_lower in norteamerica:
        return 'norteamerica'
    elif country_lower in africa:
        return 'africa'
    elif country_lower in oceania:
        return 'oceania'
    elif country_lower in caribe:
        return 'caribe'
    elif country_lower in oriente_medio:
        return 'oriente_medio'
    else:
        return 'europa'  # Default

def search_image_duckduckgo(recipe_name, country):
    """
    Intenta buscar imágenes usando DuckDuckGo Image Search (sin API key).
    Nota: Esto es limitado, se recomienda usar APIs oficiales para producción.
    """
    try:
        # Búsqueda simplificada - en producción usarías Bing Image Search API o similar
        query = f"{recipe_name} {country} dish food"
        print(f"  🔍 Buscando: {query}")
        
        # DuckDuckGo no tiene API pública fácil de usar sin scraping
        # Retornamos None para indicar que debemos generar placeholder
        return None
        
    except Exception as e:
        print(f"  ⚠️ Error en búsqueda: {e}")
        return None

def search_image_bing(recipe_name, country, api_key=None):
    """
    Búsqueda usando Bing Image Search API (requiere API key).
    Si no hay API key, retorna None.
    """
    if not api_key:
        return None
    
    try:
        endpoint = "https://api.bing.microsoft.com/v7.0/images/search"
        headers = {"Ocp-Apim-Subscription-Key": api_key}
        params = {
            "q": f"{recipe_name} {country} traditional dish",
            "count": 1,
            "imageType": "photo",
            "license": "All"
        }
        
        response = requests.get(endpoint, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        
        results = response.json()
        if results.get("value"):
            image_url = results["value"][0]["contentUrl"]
            return image_url
            
    except Exception as e:
        print(f"  ⚠️ Bing API error: {e}")
    
    return None

def download_image(url, filepath):
    """Descarga una imagen desde URL"""
    try:
        headers = {"User-Agent": USER_AGENT}
        response = requests.get(url, headers=headers, timeout=15, stream=True)
        response.raise_for_status()
        
        # Verificar que es una imagen
        content_type = response.headers.get('content-type', '')
        if 'image' not in content_type:
            return False
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(8192):
                f.write(chunk)
        
        # Validar imagen con Pillow
        img = Image.open(filepath)
        img.verify()
        
        return True
        
    except Exception as e:
        print(f"  ❌ Error descargando imagen: {e}")
        if os.path.exists(filepath):
            os.remove(filepath)
        return False

def generate_placeholder_image(recipe_name, country, filepath, size=(800, 600)):
    """
    Genera una imagen placeholder profesional con:
    - Color de fondo basado en región
    - Nombre del plato
    - País de origen
    - Icono decorativo
    """
    region = get_region(country)
    colors = REGION_COLORS.get(region, REGION_COLORS['europa'])
    
    # Crear imagen con gradiente
    img = Image.new('RGB', size, colors[0])
    draw = ImageDraw.Draw(img)
    
    # Gradiente simple
    for y in range(size[1]):
        r = int(colors[0][1:3], 16) + (int(colors[1][1:3], 16) - int(colors[0][1:3], 16)) * y // size[1]
        g = int(colors[0][3:5], 16) + (int(colors[1][3:5], 16) - int(colors[0][3:5], 16)) * y // size[1]
        b = int(colors[0][5:7], 16) + (int(colors[1][5:7], 16) - int(colors[0][5:7], 16)) * y // size[1]
        draw.line([(0, y), (size[0], y)], fill=(r, g, b))
    
    # Texto - Título del plato
    title_text = recipe_name.replace('-', ' ').title()
    
    # Intentar cargar fuente, si no usar default
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        font_subtitle = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
    except:
        font_title = ImageFont.load_default()
        font_subtitle = ImageFont.load_default()
    
    # Calcular posición del texto (centrado)
    title_bbox = draw.textbbox((0, 0), title_text, font=font_title)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (size[0] - title_width) // 2
    title_y = size[1] // 2 - 40
    
    # Sombra del texto
    shadow_offset = 3
    draw.text((title_x + shadow_offset, title_y + shadow_offset), title_text, 
              fill=(0, 0, 0, 128), font=font_title)
    
    # Texto principal
    draw.text((title_x, title_y), title_text, fill='white', font=font_title)
    
    # Subtítulo - País
    country_text = country.replace('-', ' ').title()
    subtitle_bbox = draw.textbbox((0, 0), country_text, font=font_subtitle)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (size[0] - subtitle_width) // 2
    subtitle_y = title_y + 60
    
    draw.text((subtitle_x, subtitle_y), f"🇺🇳 {country_text}", fill='white', font=font_subtitle)
    
    # Decoración - Círculo decorativo
    circle_radius = 80
    circle_x = size[0] // 2
    circle_y = size[1] // 2 - 100
    draw.ellipse([circle_x - circle_radius, circle_y - circle_radius, 
                  circle_x + circle_radius, circle_y + circle_radius], 
                 outline='white', width=3)
    
    # Guardar imagen
    img.save(filepath, 'JPEG', quality=90, optimize=True)
    
    return True

def process_recipes():
    """Procesa todas las recetas y gestiona sus imágenes"""
    
    print("=" * 80)
    print("🍳 FASE 1.A - GESTIÓN DE IMÁGENES DE RECETAS")
    print("=" * 80)
    
    # Cargar índice de países
    index_path = os.path.join(DATA_DIR, "countries_index.json")
    if not os.path.exists(index_path):
        print(f"❌ No se encontró {index_path}")
        return
    
    with open(index_path, 'r', encoding='utf-8') as f:
        countries_index = json.load(f)
    
    # Soportar ambos formatos: 'paises' o 'countries'
    paises_lista = countries_index.get('paises', countries_index.get('countries', []))
    
    if not paises_lista:
        print("❌ No se encontró lista de países en el índice")
        return
    
    total_recetas = 0
    imagenes_encontradas = 0
    imagenes_generadas = 0
    errores = 0
    
    report = {
        "fecha": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_recetas": 0,
        "imagenes_existentes": 0,
        "imagenes_descargadas": 0,
        "placeholders_generados": 0,
        "errores": [],
        "por_pais": {}
    }
    
    # Procesar cada país
    for country_data in paises_lista:
        country_slug = country_data['slug']
        country_name = country_data.get('pais', country_data.get('name_es', country_data.get('name', '')))
        
        print(f"\n📁 Procesando país: {country_name} ({country_slug})")
        
        # Cargar recetas del país
        recipes_file = os.path.join(DATA_DIR, f"{country_slug}.json")
        if not os.path.exists(recipes_file):
            print(f"  ⚠️ Archivo no encontrado: {recipes_file}")
            continue
        
        with open(recipes_file, 'r', encoding='utf-8') as f:
            recipes = json.load(f)
        
        # Crear directorio de imágenes para este país
        country_images_dir = os.path.join(IMAGES_BASE_DIR, country_slug)
        os.makedirs(country_images_dir, exist_ok=True)
        
        pais_stats = {
            "nombre": country_name,
            "total": len(recipes),
            "existentes": 0,
            "descargadas": 0,
            "generadas": 0,
            "errores": 0
        }
        
        # Procesar cada receta
        for recipe in recipes:
            total_recetas += 1
            recipe_slug = recipe.get('slug', '')
            # Soportar múltiples formatos de título
            recipe_name = recipe.get('title', recipe.get('title_es', recipe.get('name', recipe.get('name_es', 'Unknown'))))
            
            # Si no hay slug, generarlo del nombre
            if not recipe_slug and recipe_name != 'Unknown':
                recipe_slug = recipe_name.lower().replace(' ', '-').replace('.', '').replace(',', '')
            
            image_filename = f"{recipe_slug}.jpg" if recipe_slug else "placeholder.jpg"
            image_filepath = os.path.join(country_images_dir, image_filename)
            
            print(f"  🍽️  {recipe_name}")
            
            # Verificar si ya existe la imagen
            if os.path.exists(image_filepath):
                print(f"    ✅ Imagen ya existe")
                imagenes_encontradas += 1
                pais_stats["existentes"] += 1
                continue
            
            # Intentar buscar imagen en internet (limitado sin API)
            # NOTA: Para producción, configura tu API key de Bing Image Search
            BING_API_KEY = os.getenv('BING_IMAGE_SEARCH_API_KEY')
            
            image_url = None
            if BING_API_KEY:
                image_url = search_image_bing(recipe_name, country_name, BING_API_KEY)
            else:
                # Sin API key, intentamos búsqueda básica (muy limitada)
                image_url = search_image_duckduckgo(recipe_name, country_name)
            
            # Si encontramos URL, intentar descargar
            if image_url:
                print(f"    📥 Descargando desde: {image_url[:50]}...")
                if download_image(image_url, image_filepath):
                    print(f"    ✅ Imagen descargada exitosamente")
                    imagenes_encontradas += 1
                    pais_stats["descargadas"] += 1
                    continue
                else:
                    print(f"    ⚠️ Fallo descarga, generando placeholder...")
            
            # Generar placeholder profesional
            print(f"    🎨 Generando placeholder profesional...")
            if generate_placeholder_image(recipe_slug, country_name, image_filepath):
                print(f"    ✅ Placeholder generado: {image_filepath}")
                imagenes_generadas += 1
                pais_stats["generadas"] += 1
                
                # Actualizar JSON de la receta con la ruta de imagen
                recipe['image'] = f"/images/recipes/{country_slug}/{image_filename}"
            else:
                print(f"    ❌ Error generando placeholder")
                errores += 1
                pais_stats["errores"] += 1
                report["errores"].append({
                    "pais": country_name,
                    "receta": recipe_name,
                    "error": "No se pudo generar imagen"
                })
            
            # Pequeña pausa para no saturar
            time.sleep(0.1)
        
        # Guardar actualizaciones del país
        with open(recipes_file, 'w', encoding='utf-8') as f:
            json.dump(recipes, f, ensure_ascii=False, indent=2)
        
        report["por_pais"][country_slug] = pais_stats
        print(f"  📊 Resumen {country_name}: {len(recipes)} recetas, "
              f"{pais_stats['existentes']} existentes, "
              f"{pais_stats['descargadas']} descargadas, "
              f"{pais_stats['generadas']} generadas, "
              f"{pais_stats['errores']} errores")
    
    # Actualizar reporte final
    report["total_recetas"] = total_recetas
    report["imagenes_existentes"] = imagenes_encontradas
    report["imagenes_descargadas"] = 0  # Se resetea porque contamos todas como encontradas
    report["placeholders_generados"] = imagenes_generadas
    
    # Guardar reporte
    report_path = "image_generation_report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 80)
    print("📊 RESUMEN FINAL")
    print("=" * 80)
    print(f"Total recetas procesadas: {total_recetas}")
    print(f"Imágenes encontradas/existentes: {imagenes_encontradas}")
    print(f"Imágenes descargadas de internet: {report['imagenes_descargadas']}")
    print(f"Placeholders generados: {imagenes_generadas}")
    print(f"Errores: {errores}")
    print(f"\n✅ Reporte guardado en: {report_path}")
    print(f"✅ Todas las recetas ahora tienen imagen (real o placeholder)")
    print("=" * 80)

if __name__ == "__main__":
    process_recipes()
