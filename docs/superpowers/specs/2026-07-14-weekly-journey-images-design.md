# Weekly Journey Images Design

## Goal

Add the two approved lesson images to the existing Ongoing Lessons journey without changing the page structure, copy, palette, footer, or horizontal interaction.

## Approved composition

- Keep the text-only entrance unchanged.
- Add `aaron-weekly-1.jpg` to Step 01, “Start where you are.” Its outdoor one-on-one lesson makes the first step feel personal and approachable.
- Add `aaron-teaching-2.jpg` to Step 02, “Find your rhythm.” Its group lesson expands the story from an individual start into a recurring learning community.
- Keep Step 03, “Hear it add up,” image-free. The quieter final panel provides visual release before the closing section.

## Media treatment

- Images are editorial frames inside the existing horizontal panels, not cards, backgrounds, or a gallery.
- Preserve each image’s natural subject hierarchy with portrait/square crops and `object-fit: cover`.
- Use the existing sage palette as the frame edge and shadow color; do not tint the photographs.
- On motion-enabled screens, reveal each image with its panel and apply a restrained vertical parallax/scale shift tied to the existing horizontal scroll progress.
- On reduced-motion screens, images remain fully visible in normal document flow with no transform animation.
- On mobile, retain the same horizontal story and keep each image compact enough that the title and body remain readable in the same viewport.

## Accessibility and performance

- Use descriptive `alt` text for both photographs.
- Set explicit dimensions/aspect ratios to prevent layout shift.
- Mark the first image eager/high priority and the second image lazy-loaded.
- Preserve `prefers-reduced-motion` behavior.

## Constraints

- No new copy.
- No entrance, footer, navigation, or color changes.
- No new image assets and no image generation.
- No Git commit, push, or deployment unless the user explicitly requests it.
