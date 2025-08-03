# Manual TGA to PNG Conversion Guide

This guide will help you convert your WoW spec icon TGA files to PNG format for use in your React app.

## Option 1: Online Converters

You can use these online tools to convert your TGA files:

1. **Convertio** (https://convertio.co/tga-png/)
2. **CloudConvert** (https://cloudconvert.com/tga-to-png)
3. **Online-Convert** (https://image.online-convert.com/convert-to-png)

## Option 2: Desktop Software

### GIMP (Free)
1. Download GIMP from https://www.gimp.org/
2. Open each .tga file
3. Export as PNG with 64x64 size

### Photoshop
1. Open each .tga file
2. Resize to 64x64 pixels
3. Save as PNG with transparency

### Paint.NET (Free for Windows)
1. Download Paint.NET
2. Open .tga files
3. Resize to 64x64
4. Save as PNG

## Files to Convert

You have 39 TGA files that need to be converted:

1. `102.tga` (Spec ID: 102)
2. `103.tga` (Spec ID: 103)
3. `104.tga` (Spec ID: 104)
4. `105.tga` (Spec ID: 105)
5. `1467.tga` (Spec ID: 1467)
6. `1468.tga` (Spec ID: 1468)
7. `1473.tga` (Spec ID: 1473)
8. `250.tga` (Spec ID: 250)
9. `251.tga` (Spec ID: 251)
10. `252.tga` (Spec ID: 252)
11. `253.tga` (Spec ID: 253)
12. `254.tga` (Spec ID: 254)
13. `255.tga` (Spec ID: 255)
14. `256.tga` (Spec ID: 256)
15. `257.tga` (Spec ID: 257)
16. `258.tga` (Spec ID: 258)
17. `259.tga` (Spec ID: 259)
18. `260.tga` (Spec ID: 260)
19. `261.tga` (Spec ID: 261)
20. `262.tga` (Spec ID: 262)
21. `263.tga` (Spec ID: 263)
22. `264.tga` (Spec ID: 264)
23. `265.tga` (Spec ID: 265)
24. `266.tga` (Spec ID: 266)
25. `267.tga` (Spec ID: 267)
26. `268.tga` (Spec ID: 268)
27. `269.tga` (Spec ID: 269)
28. `270.tga` (Spec ID: 270)
29. `577.tga` (Spec ID: 577)
30. `581.tga` (Spec ID: 581)
31. `62.tga` (Spec ID: 62)
32. `63.tga` (Spec ID: 63)
33. `64.tga` (Spec ID: 64)
34. `65.tga` (Spec ID: 65)
35. `66.tga` (Spec ID: 66)
36. `70.tga` (Spec ID: 70)
37. `71.tga` (Spec ID: 71)
38. `72.tga` (Spec ID: 72)
39. `73.tga` (Spec ID: 73)


## Conversion Settings

For each file, use these settings:
- **Size**: 64x64 pixels
- **Format**: PNG
- **Background**: Transparent
- **Quality**: High

## Output Directory

After conversion, place all PNG files in:
```
C:\Users\frama\OneDrive\Documents\repos\wow-project\wow-leaderboard-frontend\public\spec-icons-png
```

## File Naming

Keep the same filenames but change extension from .tga to .png:
- `71.tga` → `71.png`
- `102.tga` → `102.png`
- etc.

## Next Steps

After converting all files:

1. Update your `spec-icons.ts` file to use PNG images instead of emojis
2. Import the images in your React components
3. Replace emoji icons with actual WoW spec icons

## Spec ID to Name Mapping

- `62.tga` → Arcane
- `63.tga` → Fire
- `64.tga` → Frost
- `65.tga` → Holy
- `66.tga` → Protection
- `70.tga` → Retribution
- `71.tga` → Arms
- `72.tga` → Fury
- `73.tga` → Protection
- `102.tga` → Balance
- `103.tga` → Feral
- `104.tga` → Guardian
- `105.tga` → Restoration
- `250.tga` → Blood
- `251.tga` → Frost
- `252.tga` → Unholy
- `253.tga` → Beast Mastery
- `254.tga` → Marksmanship
- `255.tga` → Survival
- `256.tga` → Discipline
- `257.tga` → Holy
- `258.tga` → Shadow
- `259.tga` → Assassination
- `260.tga` → Outlaw
- `261.tga` → Subtlety
- `262.tga` → Elemental
- `263.tga` → Enhancement
- `264.tga` → Restoration
- `265.tga` → Affliction
- `266.tga` → Demonology
- `267.tga` → Destruction
- `268.tga` → Brewmaster
- `269.tga` → Windwalker
- `270.tga` → Mistweaver
- `577.tga` → Havoc
- `581.tga` → Vengeance
- `1467.tga` → Devastation
- `1468.tga` → Preservation
- `1473.tga` → Augmentation


## Quick Batch Conversion

If you have ImageMagick installed, you can run the generated batch file:
```bash
cd scripts
convert-tga-to-png.bat
```

## Need Help?

If you encounter any issues:
1. Make sure the output directory exists
2. Check that PNG files are 64x64 pixels
3. Verify that transparency is preserved
4. Ensure filenames match the original TGA files
