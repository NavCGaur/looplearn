from PIL import Image
import sys

def check_transparency(image_path):
    try:
        img = Image.open(image_path)
        if img.mode != 'RGBA':
            print(f"Image mode is {img.mode}, convert to RGBA to check transparency.")
            img = img.convert('RGBA')
        
        datas = img.getdata()
        
        has_transparency = False
        transparent_pixels = 0
        total_pixels = len(datas)

        for item in datas:
            if item[3] < 255:  # Check alpha channel
                has_transparency = True
                transparent_pixels += 1
        
        if has_transparency:
            print(f"result: TRANSPARENT ({transparent_pixels}/{total_pixels} pixels)")
        else:
            print("result: OPAQUE (No transparent pixels found)")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        check_transparency(sys.argv[1])
    else:
        print("Please provide an image path")
