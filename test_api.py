#!/usr/bin/env python3
import requests
import json

def test_api():
    # Test the specific product API
    url = "http://localhost:3001/api/woocommerce/products"
    params = {
        'slug': 'smorfit-smart-watch-for-men-women-fitness-tracker-for-andriod',
        'per_page': '1',
        '_fields': 'id,name,slug,price,regular_price,sale_price,average_rating,stock_quantity,manage_stock,images,images.src,short_description,description,categories,attributes,tags,date_created,meta_data'
    }
    
    try:
        print(f"Testing API: {url}")
        print(f"Params: {params}")
        response = requests.get(url, params=params, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Type: {type(data)}")
            if isinstance(data, list) and len(data) > 0:
                print(f"Product Found: {data[0].get('name', 'N/A')}")
                print(f"Product ID: {data[0].get('id', 'N/A')}")
            else:
                print(f"Response Data: {data}")
        else:
            print(f"Error Response: {response.text[:500]}")
            
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_api()