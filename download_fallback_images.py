#!/usr/bin/env python3
"""
Script to download all external fallback images and replace them with local versions.
This script downloads Unsplash images used as fallbacks in the frontend.
"""

import os
import requests
from urllib.parse import urlparse
import sys

# Create directories if they don't exist
def ensure_directory(path):
    os.makedirs(path, exist_ok=True)

# Download image from URL
def download_image(url, local_path):
    try:
        print(f"Downloading: {url}")
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(local_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"✓ Saved to: {local_path}")
        return True
    except Exception as e:
        print(f"✗ Failed to download {url}: {e}")
        return False

def main():
    # Define all the images to download
    images_to_download = [
        {
            'url': 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80',
            'local_path': 'public/images/fallbacks/attraction-fallback.jpg',
            'description': 'Fallback attraction image'
        },
        {
            'url': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80',
            'local_path': 'public/images/fallbacks/city-fallback.jpg',
            'description': 'Fallback city image'
        },
        {
            'url': 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
            'local_path': 'public/images/fallbacks/hero-fallback.jpg',
            'description': 'Fallback hero image'
        },
        {
            'url': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
            'local_path': 'public/images/fallbacks/seo-default.jpg',
            'description': 'SEO default meta image'
        },
        {
            'url': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
            'local_path': 'public/images/fallbacks/about-page.jpg',
            'description': 'About page image'
        }
    ]
    
    # Ensure directories exist
    ensure_directory('public/images/fallbacks')
    
    print("Starting download of fallback images...\n")
    
    success_count = 0
    total_count = len(images_to_download)
    
    for image_info in images_to_download:
        print(f"📥 {image_info['description']}")
        if download_image(image_info['url'], image_info['local_path']):
            success_count += 1
        print()  # Empty line for readability
    
    print(f"Download complete: {success_count}/{total_count} images downloaded successfully")
    
    if success_count == total_count:
        print("✅ All images downloaded successfully!")
        print("\nNext steps:")
        print("1. Update config files to use local image paths")
        print("2. Test the application to ensure images load correctly")
        print("3. Commit changes to git")
    else:
        print("⚠️  Some images failed to download. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()