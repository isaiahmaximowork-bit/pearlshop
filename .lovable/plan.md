

## Plan: Update Card 1 visual — photo left, video right

The user uploaded a photo (`Gemini_Generated_Image_avgr1navgr.png`) and a video (`ssstik.io_1775334813812_2.mp4`) to use in the Step 1 card of the Avatar section.

### Changes

**1. Copy uploaded assets to `src/assets/`**
- Copy the uploaded photo to `src/assets/avatar-input-photo.png`
- Copy the uploaded video to `src/assets/avatar-output-video.mp4`

**2. Update `src/components/AvatarSection.tsx` — Card 1 visual (lines 86-106)**
- **Left side**: Replace the current Unsplash image with the uploaded photo (`avatar-input-photo.png`), imported as an ES6 module. Keep the same styling (aspect-square, rounded-3xl, border, "Foto de Entrada" label).
- **Right side**: Replace the current Unsplash image with a `<video>` element playing the uploaded MP4 (`avatar-output-video.mp4`), autoplay, muted, loop, playsInline. Keep the same container styling (aspect-square, rounded-3xl, border-2 border-purple-500, "Avatar IA" label). Use `object-cover` on the video.
- Add ES6 imports at the top for both assets.

No other sections or cards are changed.

