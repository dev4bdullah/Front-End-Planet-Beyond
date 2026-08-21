# Task 2 — Image Picker / Camera

> Sheet description: Use an image picker or camera module to select a profile image from device media

## The result shape

```js
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ["images"],   // an ARRAY now — MediaTypeOptions is deprecated
  allowsEditing: true,
  aspect: [1, 1],           // Android only; iOS always crops square
  quality: 0.8
});

if (result.canceled) return;      // ← not an error
const asset = result.assets[0];   // ALWAYS an array, even for one image
```

Two things that catch people: `assets` is an array even when you asked for one image, and
`canceled` is spelled with one L.

## Cancel is not an error

The single most common mistake in this API. A user changing their mind is the normal path.

```js
// ❌ an error toast every time someone backs out
try { const result = await launch(); use(result.assets[0]); }
catch { toast.error("Failed to pick image"); }

// ✅
if (result.canceled) return;
```

## Request the permission for the source being used

Camera and library are **separate permissions**. Asking for the camera when the user tapped "choose
from library" burns the one prompt iOS gives you, on a permission they didn't need.

## Compress before you upload

A modern phone camera produces a 4–12MB JPEG. Uploading that as a 96px avatar wastes the user's data.

```js
const context = ImageManipulator.ImageManipulator.manipulate(uri);
context.resize({ width: 512 });
const rendered = await context.renderAsync();
const output = await rendered.saveAsync({ compress: 0.6, format: SaveFormat.JPEG });
```

`quality: 0.8` in the picker is a first pass but it doesn't **resize** — a 4032×3024 image at
quality 0.8 is still enormous. The API changed in SDK 54; `manipulateAsync` is deprecated in favour
of this context form.

## image-picker or camera

| `expo-image-picker` | `expo-camera` |
|---------------------|---------------|
| the **system** picker and camera UI | a camera **view** you embed |
| familiar, accessible, free crop UI | you build the whole UI |
| use it unless you have a reason not to | barcode scanning, custom overlays |

A profile picture wants the system picker. Rebuilding a camera UI to take one photo is weeks of work
to arrive somewhere worse than what the OS already gives you.
