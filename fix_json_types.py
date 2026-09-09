#!/usr/bin/env python3
"""
Script para corregir el campo originConfidence en los JSON transformados
Cambia de string genérico a tipo específico: "confirmed" | "commonly_associated" | "disputed" | "modern_variant"
"""

import json
import os
from pathlib import Path

def fix_origin_confidence(input_dir):
    """Corrige el campo originConfidence en todos los archivos JSON"""
    
    files_fixed = 0
    recipes_fixed = 0
    
    # Obtener todos los archivos JSON excepto countries_index.json y all_recipes.json
    json_files = [f for f in Path(input_dir).glob("*.json") 
                  if f.name not in ['countries_index.json', 'all_recipes.json']]
    
    for json_file in json_files:
        with open(json_file, 'r', encoding='utf-8') as f:
            recipes = json.load(f)
        
        updated = False
        for recipe in recipes:
            old_value = recipe.get('originConfidence', 'confirmed')
            # Asegurar que sea uno de los valores válidos
            valid_values = ['confirmed', 'commonly_associated', 'disputed', 'modern_variant']
            if old_value not in valid_values:
                recipe['originConfidence'] = 'confirmed'
                updated = True
                recipes_fixed += 1
        
        if updated:
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(recipes, f, indent=2, ensure_ascii=False)
            files_fixed += 1
            print(f"✅ {json_file.name}: Corregido")
        else:
            print(f"✓ {json_file.name}: OK (sin cambios)")
    
    # También corregir all_recipes.json si existe
    all_recipes_file = Path(input_dir) / 'all_recipes.json'
    if all_recipes_file.exists():
        with open(all_recipes_file, 'r', encoding='utf-8') as f:
            recipes = json.load(f)
        
        for recipe in recipes:
            if recipe.get('originConfidence') not in ['confirmed', 'commonly_associated', 'disputed', 'modern_variant']:
                recipe['originConfidence'] = 'confirmed'
        
        with open(all_recipes_file, 'w', encoding='utf-8') as f:
            json.dump(recipes, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"🔧 CORRECCIÓN COMPLETADA")
    print(f"{'='*60}")
    print(f"📁 Archivos procesados: {len(json_files)}")
    print(f"✅ Archivos corregidos: {files_fixed}")
    print(f"📝 Recetas corregidas: {recipes_fixed}")
    
    return files_fixed, recipes_fixed

if __name__ == "__main__":
    input_directory = "/workspace/atlas-gastronomico/src/data/recipes_transformed"
    fix_origin_confidence(input_directory)
