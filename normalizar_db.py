#!/usr/bin/env python3
"""
Script para normalizar la base de datos de World Bites
- Elimina archivos duplicados (europe_all, europe_part1, europe_part2)
- Consolida todas las recetas por país
- Elimina duplicados por ID
- Estandariza estructura de datos
- Genera índice maestro de países
"""

import json
import os
from pathlib import Path
from collections import defaultdict

# Configuración
DATA_DIR = Path("./data/recipes")
OUTPUT_DIR = Path("./data_normalized")
ARCHIVOS_ELIMINAR = ["europe_all.json", "europe_part1.json", "europe_part2.json"]

def cargar_recetas_archivo(ruta):
    """Carga recetas desde un archivo JSON"""
    try:
        with open(ruta, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception as e:
        print(f"❌ Error cargando {ruta}: {e}")
        return []

def normalizar_receta(receta, nombre_pais=None):
    """Estandariza la estructura de una receta - soporta campos en ES y EN"""
    
    # Mapeo de campos en español a inglés
    mapeo_campos = {
        'id': 'id',
        'nombre': 'name',
        'name': 'name',
        'pais': 'country',
        'country': 'country',
        'region': 'region',
        'ciudad': 'city',
        'coordenadas': 'coordinates',
        'lat': 'latitude',
        'lng': 'longitude',
        'descripcion': 'description',
        'description': 'description',
        'historia': 'history',
        'history': 'history',
        'ingredientes': 'ingredients',
        'ingredients': 'ingredients',
        'instrucciones': 'instructions',
        'instructions': 'instructions',
        'tiempo_preparacion': 'prepTime',
        'prepTime': 'prepTime',
        'tiempo_coccion': 'cookTime',
        'cookTime': 'cookTime',
        'porciones': 'servings',
        'servings': 'servings',
        'dificultad': 'difficulty',
        'difficulty': 'difficulty',
        'tags': 'tags',
        'imagen': 'image',
        'image': 'image'
    }
    
    # Convertir todos los campos al formato estándar en inglés
    receta_std = {}
    for key_es_en, key_en in mapeo_campos.items():
        if key_es_en in receta:
            receta_std[key_en] = receta[key_es_en]
    
    # Si no tiene país, usar el del archivo o región
    if not receta_std.get('country'):
        receta_std['country'] = nombre_pais or 'Unknown'
    
    # Manejar coordenadas especiales (objeto vs lista)
    coords = receta_std.get('coordinates', [0, 0])
    if isinstance(coords, dict):
        # Convertir objeto {lat, lng} a lista [lat, lon]
        coords = [coords.get('lat', 0), coords.get('lng', 0)]
    elif isinstance(coords, str):
        try:
            coords = json.loads(coords)
        except:
            coords = [0, 0]
    
    # Asegurar campos requeridos con valores por defecto
    campos_requeridos = {
        'id': receta_std.get('id', '').lower().replace(' ', '-'),
        'name': receta_std.get('name', 'Sin título'),
        'country': receta_std.get('country', 'Unknown'),
        'description': receta_std.get('description', ''),
        'ingredients': receta_std.get('ingredients', []),
        'instructions': receta_std.get('instructions', []),
        'prepTime': receta_std.get('prepTime', 0),
        'servings': receta_std.get('servings', 4),
        'difficulty': receta_std.get('difficulty', 'Medium'),
        'tags': receta_std.get('tags', []),
        'image': receta_std.get('image', ''),
        'region': receta_std.get('region', ''),
        'city': receta_std.get('city', ''),
        'coordinates': coords,
        'history': receta_std.get('history', '')
    }
    
    return campos_requeridos

def procesar_todos_los_archivos():
    """Procesa todos los archivos JSON y consolida por país"""
    recetas_por_pais = defaultdict(list)
    ids_vistos = set()
    total_duplicados = 0
    archivos_procesados = []
    
    # Recorrer todas las carpetas de regiones
    for region_dir in DATA_DIR.iterdir():
        if not region_dir.is_dir():
            continue
            
        print(f"\n📁 Procesando región: {region_dir.name}")
        
        for archivo_json in region_dir.glob("*.json"):
            # Saltar archivos duplicados
            if archivo_json.name in ARCHIVOS_ELIMINAR:
                print(f"  ⚠️  Saltando archivo duplicado: {archivo_json.name}")
                continue
            
            print(f"  📄 Procesando: {archivo_json.name}")
            archivos_procesados.append(str(archivo_json))
            
            recetas = cargar_recetas_archivo(archivo_json)
            
            # Extraer nombre del país del archivo (ej: spain.json -> Spain)
            nombre_pais = archivo_json.stem.replace('-', ' ').title()
            # Mapeo especial de nombres
            mapeo_paises = {
                'Usa': 'United States',
                'Uk': 'United Kingdom',
                'Netherlands': 'Netherlands'
            }
            nombre_pais = mapeo_paises.get(nombre_pais, nombre_pais)
            
            for receta in recetas:
                # Normalizar receta
                receta_norm = normalizar_receta(receta, nombre_pais)
                recipe_id = receta_norm['id']
                
                # Verificar duplicados por ID
                if recipe_id in ids_vistos:
                    print(f"    ⚠️  Duplicado encontrado: {recipe_id}")
                    total_duplicados += 1
                    continue
                
                ids_vistos.add(recipe_id)
                
                # Determinar país real de la receta
                pais_real = receta_norm['country']
                
                # Agregar a la colección del país
                recetas_por_pais[pais_real].append(receta_norm)
    
    return recetas_por_pais, total_duplicados, archivos_procesados

def guardar_datos_normalizados(recetas_por_pais):
    """Guarda los datos normalizados en archivos separados por país"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    paises_guardados = []
    
    for pais, recetas in sorted(recetas_por_pais.items()):
        if not recetas:
            continue
            
        # Nombre del archivo slugified
        slug_pais = pais.lower().replace(' ', '-').replace('.', '')
        archivo_salida = OUTPUT_DIR / f"{slug_pais}.json"
        
        # Guardar recetas del país
        with open(archivo_salida, 'w', encoding='utf-8') as f:
            json.dump(recetas, f, indent=2, ensure_ascii=False)
        
        paises_guardados.append({
            'pais': pais,
            'slug': slug_pais,
            'recetas_count': len(recetas),
            'archivo': str(archivo_salida)
        })
        
        print(f"✅ {pais}: {len(recetas)} recetas guardadas en {archivo_salida.name}")
    
    return paises_guardados

def generar_indice_maestro(paises_guardados):
    """Genera un índice maestro de todos los países y recetas"""
    indice = {
        'metadata': {
            'total_paises': len(paises_guardados),
            'total_recetas': sum(p['recetas_count'] for p in paises_guardados),
            'fecha_generacion': '2025-01-09'
        },
        'paises': sorted(paises_guardados, key=lambda x: x['pais'])
    }
    
    archivo_indice = OUTPUT_DIR / "countries_index.json"
    with open(archivo_indice, 'w', encoding='utf-8') as f:
        json.dump(indice, f, indent=2, ensure_ascii=False)
    
    print(f"\n📊 Índice maestro generado: {archivo_indice}")
    print(f"   Total países: {indice['metadata']['total_paises']}")
    print(f"   Total recetas: {indice['metadata']['total_recetas']}")
    
    return indice

def main():
    print("="*60)
    print("🍳 NORMALIZACIÓN DE BASE DE DATOS - WORLD BITES")
    print("="*60)
    
    # Procesar todos los archivos
    recetas_por_pais, total_duplicados, archivos_procesados = procesar_todos_los_archivos()
    
    print("\n" + "="*60)
    print("💾 GUARDANDO DATOS NORMALIZADOS")
    print("="*60)
    
    # Guardar datos normalizados
    paises_guardados = guardar_datos_normalizados(recetas_por_pais)
    
    # Generar índice maestro
    indice = generar_indice_maestro(paises_guardados)
    
    # Resumen final
    print("\n" + "="*60)
    print("📈 RESUMEN FINAL")
    print("="*60)
    print(f"Archivos originales procesados: {len(archivos_procesados)}")
    print(f"Archivos duplicados eliminados: {len(ARCHIVOS_ELIMINAR)}")
    print(f"Recetas duplicadas eliminadas: {total_duplicados}")
    print(f"Países únicos: {len(paises_guardados)}")
    print(f"Total recetas únicas: {indice['metadata']['total_recetas']}")
    print(f"Directorio de salida: {OUTPUT_DIR.absolute()}")
    
    print("\n✅ ¡Normalización completada!")
    print("\n⚠️  ARCHIVOS A ELIMINAR MANUALMENTE:")
    for arch in ARCHIVOS_ELIMINAR:
        print(f"   - ./data/recipes/europe/{arch}")

if __name__ == "__main__":
    main()
