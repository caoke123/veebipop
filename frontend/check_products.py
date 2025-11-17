import json
import os

try:
    with open('api_products.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f'Total products from API: {len(data)}')
    
    # Check if smorfit product exists
    smorfit_products = [p for p in data if 'smorfit' in p.get('slug', '').lower()]
    print(f'Found {len(smorfit_products)} smorfit products:')
    for p in smorfit_products:
        print(f'  - {p["name"]} (slug: {p["slug"]})')
        
    # Check first few products
    print('\nFirst 3 products:')
    for i, p in enumerate(data[:3]):
        print(f'  {i+1}. {p["name"]} (slug: {p["slug"]})')
        
    # Check specific smorfit slug
    target_slug = 'smorfit-smart-watch-for-men-women-fitness-tracker-for-andriod'
    target_product = [p for p in data if p.get('slug') == target_slug]
    if target_product:
        print(f'\nFound target product: {target_product[0]["name"]}')
        print(f'Product ID: {target_product[0]["id"]}')
        print(f'Product category: {target_product[0].get("category", "N/A")}')
    else:
        print(f'\nTarget product with slug "{target_slug}" not found')
        
except Exception as e:
    print(f'Error: {e}')