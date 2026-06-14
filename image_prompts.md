# Tanha Fashion — E-Commerce Image Generation & Cropping Guide

> [!NOTE]
> **Current Status:**
> - **Successfully Generated & Cropped:** All 8 Banners, 4 Cotton products, 4 Georgette products, and Linen Product 1.
> - **Remaining to Generate:** Linen Products 2-4, Casual Abaya Products 1-4, Festive Borka Products 1-4, and Combo Products 1-4. (Currently falling back to multi-cropped group images due to API capacity limits).

This document contains the complete set of exact image generation prompts and file naming conventions for the redesigned **তানহা ফ্যাশন (Tanha Fashion)** landing page. 

To ensure the models' faces and clothes fit perfectly without being cut off, all images should be generated as **1:1 square images** with a **zoomed-out framing (full-body or knee-up)**. They can then be cropped cleanly using the provided PowerShell scripts to the exact ratios required by the website layout.

---

## 1. Hero Slider & Category Banners (16:9 Landscape)
* **Website Layout Dimension:** strictly `1024x576` (or `16:9` aspect ratio)
* **Generation Target:** `1024x1024` (Square, zoomed-out shot, models on the right side)
* **Cropping Instruction:** Crop to `1024x576` using a top-offset of `50px` or `100px`. Because the original image is a zoomed-out head-to-toe or knee-up shot, this crop preserves the head, shoulders, and the design of the clothes.
* **Target Directory:** `src/assets/`

### B-1: Everyday Collection Hero Banner
* **Filename:** `hero_everyday_banner.png`
* **Prompt:**
  > A premium professional studio catalog photograph of two beautiful Bangladeshi female models posing elegantly on the right side of the frame. One is wearing a premium traditional embroidered cotton 3-piece salwar kameez, the other is wearing a sophisticated dark designer casual abaya with matching hijab. Both models are shown in a full-body shot from head to toe, leaving empty cream-colored minimalist plaster wall background on the left half of the image. Soft natural lighting. No text or logos.

### B-2: Combo Deals Hero Banner
* **Filename:** `combo_pack_banner.png`
* **Prompt:**
  > A premium commercial studio catalog photograph. On the right side, two beautiful Bangladeshi female models are posing and displaying premium matching 3-piece salwar kameez suits and luxury Abaya-hijab combo sets. Both models are shown in a full-body shot from head to toe, leaving the left half of the image completely empty with a neutral white background. Clean lifestyle look. No text or logos.

### B-3: Retail Showroom Banner
* **Filename:** `showroom_banner.png`
* **Prompt:**
  > A professional retail showroom catalog photograph. On the right side, sleek clothing racks hold elegant folded textiles and premium garments, highlighted by warm spotlights. The left half of the image is completely empty, showing a clean neutral concrete wall. Elegant boutique vibe. No text.

### B-4: Cotton 3-Piece Category Header
* **Filename:** `cotton_3pc_banner.png`
* **Prompt:**
  > A premium fashion catalog photograph. On the right side, a beautiful Bangladeshi female model is posing gracefully, wearing a premium traditional cotton 3-piece salwar kameez with delicate block printing and light embroidery. She is shown in a full-body shot from head to toe. The left half of the image is completely empty, showing a minimalist studio background with soft warm shadows. No text.

### B-5: Georgette 3-Piece Category Header
* **Filename:** `georgette_3pc_banner.png`
* **Prompt:**
  > A premium fashion catalog photograph. On the right side, an elegant Bangladeshi female model is posing, wearing a premium georgette 3-piece salwar kameez suit with beautiful zari embroidery. She is shown in a full-body shot from head to toe. The left half of the image is completely empty, showing a clean minimalist studio background. No text.

### B-6: Linen 3-Piece Category Header
* **Filename:** `linen_3pc_banner.png`
* **Prompt:**
  > A premium fashion catalog photograph. On the right side, a graceful Bangladeshi female model is posing, wearing a modern designer linen 3-piece salwar kameez. She is shown in a full-body shot from head to toe. The left half of the image is completely empty, showing a neutral minimalist studio wall. No text.

### B-7: Casual Abaya Category Header
* **Filename:** `casual_abaya_banner.png`
* **Prompt:**
  > A premium fashion catalog photograph. On the right side, a Bangladeshi female model is posing, wearing an elegant casual abaya borka with a matching hijab. She is shown in a full-body shot from head to toe. The left half of the image is completely empty, showing a soft-focus clean neutral outdoor background. No text.

### B-8: Festive Borka Category Header
* **Filename:** `festive_borka_banner.png`
* **Prompt:**
  > A premium fashion catalog photograph. On the right side, a premium Bangladeshi female model is posing, wearing a luxurious black Dubai cherry festive borka set with golden borders. She is shown in a full-body shot from head to toe. The left half of the image is completely empty, showing a clean, dark-themed neutral studio wall. No text.

---

## 2. Product Catalog Grid Images (3:4 Portrait)
* **Website Layout Dimension:** strictly `768x1024` (or `3:4` aspect ratio)
* **Generation Target:** `1024x1024` (Square, model centered)
* **Cropping Instruction:** Crop to `768x1024` by center-cropping horizontally (trimming 128px off the left and right). Since the vertical axis is fully preserved, the model's head, body, and the clothes are never cut off.
* **Target Directory:** `src/assets/`

### Category 1: সুতি থ্রি-পিস (Cotton 3-Piece)
* **cotton_1.png (হ্যান্ডলুম পিওর কটন থ্রি-পিস):**
  > A professional catalog studio photograph of a premium traditional handloom pure cotton 3-piece salwar kameez suit. Beautiful Bangladeshi female model posing, shown in a knee-up shot from head to knees, centering the model, minimalist bright indoor studio setting. Elegant cotton texture with delicate block print on fabric. 1:1 square. No text.
* **cotton_2.png (ক্ল্যাসিক ব্লক প্রিন্ট সুতি থ্রি-পিস):**
  > A professional catalog studio photograph of a traditional Bangladeshi cotton 3-piece salwar kameez. Beautiful Bangladeshi model posing gracefully, red and cream floral patterns on fabric, shown in a knee-up shot from head to knees, centering the model, minimalist studio setup. 1:1 square. No text.
* **cotton_3.png (নিপুণ কলার এমব্রয়ডারি সুতি থ্রি-পিস):**
  > A professional catalog studio photograph of a premium cotton salwar kameez suit. Graceful Bangladeshi female model, olive green and beige pastel tones, delicate embroidery details around the collar, shown in a knee-up shot from head to knees, centering the model, clean studio background. 1:1 square. No text.
* **cotton_4.png (এক্সক্লুসিভ জয়পুরি সুতি থ্রি-পিস):**
  > A professional fashion catalog shot of a designer Jaipuri cotton 3-piece suit. Bangladeshi model posing in a modern indoor studio, indigo blue block prints on the kameez, shown in a knee-up shot from head to knees, centering the model, soft studio lighting. 1:1 square. No text.

### Category 2: জর্জেট থ্রি-পিস (Georgette 3-Piece)
* **georgette_1.png (গর্জিয়াস জরি ওয়ার্ক জর্জেট থ্রি-পিস):**
  > A professional catalog studio photograph of a premium georgette 3-piece salwar kameez suit. Beautiful Bangladeshi female model wearing a party wear suit with fine embroidery and zari thread work in deep maroon, shown in a knee-up shot from head to knees, centering the model, clean light grey background. 1:1 square. No text.
* **georgette_2.png (ডিজিটাল প্রিন্ট সিকোয়েন্স জর্জেট থ্রি-পিস):**
  > A professional studio photograph of a luxury georgette salwar kameez. Elegant Bangladeshi model wearing a suit with modern digital print and light sequence work, shown in a knee-up shot from head to knees, centering the model, soft studio lighting. 1:1 square. No text.
* **georgette_3.png (পার্টি ওয়ার্ক এমব্রয়ডারি জর্জেট থ্রি-পিস):**
  > A professional catalog portrait of a Bangladeshi female model wearing a premium georgette party salwar kameez with heavy embroidery. Bright festive colors, shown in a knee-up shot from head to knees, centering the model, elegant studio backdrop. 1:1 square. No text.
* **georgette_4.png (লাক্সারি শিফন জর্জেট থ্রি-পিস সেট):**
  > A professional fashion studio portrait of a Bangladeshi model wearing a luxury chiffon georgette salwar kameez. Soft pastel peach shades, light embroidery work, shown in a knee-up shot from head to knees, centering the model, minimalist background. 1:1 square. No text.

### Category 3: লিলেন থ্রি-পিস (Linen 3-Piece)
* **linen_1.png (ডিজাইনার এম্বোশড লিলেন থ্রি-পিস):**
  > A professional catalog studio photograph of a designer rayon linen 3-piece salwar kameez suit. Beautiful Bangladeshi female model, elegant embossed textures and delicate embroidery, shown in a knee-up shot from head to knees, centering the model, modern bright background. 1:1 square. No text.
* **linen_2.png (ক্যাজুয়াল রেগুলার লিলেন থ্রি-পিস):**
  > A professional catalog portrait of a Bangladeshi female model wearing a casual linen 3-piece suit. Simple elegant earthy tones, suitable for daily wear, shown in a knee-up shot from head to knees, centering the model, soft natural lighting. 1:1 square. No text.
* **linen_3.png (সেমি-ফরমাল রেয়ন লিলেন থ্রি-পিস):**
  > A professional studio photograph of a premium semi-formal rayon linen salwar kameez. Bangladeshi model, contrasting bright dupatta, shown in a knee-up shot from head to knees, centering the model, clean minimalist background. 1:1 square. No text.
* **linen_4.png (আরামদায়ক সামার লিলেন থ্রি-পিস):**
  > A professional catalog fashion shot of a summer linen 3-piece salwar kameez. Bangladeshi model posing in a pastel yellow or mint green floral printed suit, shown in a knee-up shot from head to knees, centering the model, bright airy lighting. 1:1 square. No text.

### Category 4: ক্যাজুয়াল আবায়া (Casual Abaya)
* **casual_abaya_1.png (সামার লিনেন ডেইলি আবায়া সেট):**
  > A professional catalog studio photograph of a daily use summer linen abaya with matching hijab. Beautiful Bangladeshi model posing, front-open button details, elegant lightweight linen fabric, shown in a full-body shot from head to ankles, centering the model, clean studio background. 1:1 square. No text.
* **casual_abaya_2.png (স্লিম-ফিট ক্যাজুয়াল আবায়া):**
  > A professional catalog portrait of a Bangladeshi model wearing a modern slim-fit casual abaya. Solid pastel shade like dusty rose, matching hijab, shown in a full-body shot from head to ankles, centering the model, soft lighting. 1:1 square. No text.
* **casual_abaya_3.png (সফট কটন রেগুলার আবায়া):**
  > A professional catalog studio photograph of a regular soft cotton abaya. Bangladeshi model in dark navy blue color, comfortable daily wear styling, shown in a full-body shot from head to ankles, centering the model, minimalist background. 1:1 square. No text.
* **casual_abaya_4.png (ক্লাসিক পকেট ক্যাজুয়াল আবায়া):**
  > A professional fashion catalog shot of an A-line casual abaya with side pockets. Bangladeshi model, matching hijab, shown in a full-body shot from head to ankles, centering the model, clean studio setting. 1:1 square. No text.

### Category 5: উৎসবের বোরকা (Festive Borka)
* **festive_borka_1.png (দুবাই চেরি এমব্রয়ডারি বোরকা সেট):**
  > A professional catalog studio photograph of a festive Dubai cherry borka set. Beautiful Bangladeshi female model, elegant embroidery work on sleeves and borders, matching belt and black hijab, shown in a full-body shot from head to ankles, centering the model, luxury indoor studio background. 1:1 square. No text.
* **festive_borka_2.png (শিমারিং লাক্সারি পার্টি বোরকা):**
  > A professional fashion catalog portrait of a premium Bangladeshi model wearing a shimmering party borka set. Decorated with fine lace and stone work, shown in a full-body shot from head to ankles, centering the model, elegant studio setting. 1:1 square. No text.
* **festive_borka_3.png (রয়েল জর্জেট কুচি বোরকা সেট):**
  > A professional catalog studio photograph of a royal georgette borka set. Bangladeshi model wearing a dark emerald green borka with pleated design, shown in a full-body shot from head to ankles, centering the model, minimalist indoor foyer background. 1:1 square. No text.
* **festive_borka_4.png (লাক্সারি স্টোন ওয়ার্ক বোরকা সেট):**
  > A professional fashion portrait of a Bangladeshi model wearing a luxury black georgette borka. Detailed stone work on the front and sleeves, shown in a full-body shot from head to ankles, centering the model, elegant warm studio lighting. 1:1 square. No text.

### Category 6: বিশেষ কম্বো সেট (Combo)
* **combo_1.png (থ্রি-পিস ও ম্যাচিং হিজাব কম্বো):**
  > A professional catalog studio photograph of a matching cotton 3-piece salwar kameez and coordinate georgette hijab. Beautiful Bangladeshi model showing both, shown in a knee-up shot from head to knees, centering the model, minimalist studio setup. 1:1 square. No text.
* **combo_2.png (আবায়া ও ম্যাচিং নিকাব লাক্সারি কম্বো):**
  > A professional catalog studio portrait of a matching abaya and double-part niqab combo set. Bangladeshi model posing in matching pastel grey, shown in a full-body shot from head to ankles, centering the model, clean background. 1:1 square. No text.
* **combo_3.png (ডাবল ওয়ান থ্রি-পিস প্যাক কম্বো):**
  > A professional studio flat lay catalog shot. Displays two premium folded salwar kameez suits side-by-side on a light wood surface, showcasing block print textures and embroidery details. Minimalist and clean catalog style. 1:1 square. No text.
* **combo_4.png (উৎসবের বোরকা ও সুতি থ্রি-পিস কম্বো):**
  > A professional studio catalog shot showing a luxurious black Dubai cherry festive borka set and a premium cotton salwar kameez fabric placed side-by-side inside a elegant gift box. Premium catalog styling. 1:1 square. No text.

---

## 3. Cropping Scripts
Once you save the generated images in `src/assets/` with the exact filenames listed above, you can run the following scripts to prepare them.

### To Crop Banners to 16:9 Landscape:
```powershell
. .\crop_assets.ps1
Crop-Image -Path "src/assets/hero_everyday_banner.png" -Type "banner" -yOffset 120
Crop-Image -Path "src/assets/combo_pack_banner.png" -Type "banner" -yOffset 120
Crop-Image -Path "src/assets/showroom_banner.png" -Type "banner" -yOffset 224
Crop-Image -Path "src/assets/cotton_3pc_banner.png" -Type "banner" -yOffset 120
Crop-Image -Path "src/assets/georgette_3pc_banner.png" -Type "banner" -yOffset 120
Crop-Image -Path "src/assets/linen_3pc_banner.png" -Type "banner" -yOffset 120
Crop-Image -Path "src/assets/casual_abaya_banner.png" -Type "banner" -yOffset 120
Crop-Image -Path "src/assets/festive_borka_banner.png" -Type "banner" -yOffset 120
```

### To Crop Product Cards to 3:4 Portrait:
```powershell
. .\crop_assets.ps1
Get-ChildItem "src/assets/*_1.png", "src/assets/*_2.png", "src/assets/*_3.png", "src/assets/*_4.png" | ForEach-Object {
    Crop-Image -Path $_.FullName -Type "product"
}
```
