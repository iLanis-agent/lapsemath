# Lapsemath

Timelapse planning arithmetic: the exact interval for your event and wanted clip, frame count and card space, the shutter ceiling, battery count, and slider travel per frame.

## What it computes
- **Interval planner**: frames = clip seconds x fps; interval = event seconds / frames; storage = frames x MB per frame. Exact.
- **Shutter ceiling**: shutter + 1s buffer must fit the interval (labeled buffer rule); natural-looking shutter is about half the interval (labeled guidance).
- **Coverage and batteries**: shots x interval = event covered; frames / fps = clip; batteries = ceil(frames / your shots-per-battery) (labeled estimate).
- **Slider**: travel / frames = mm per shot; apparent speed = travel / clip seconds. Exact.

## Anchors
- All frame, time and storage relations are exact arithmetic.
- The 1-second shutter buffer and half-interval shutter are labeled rules of thumb; battery figures are user-supplied estimates.

## Files
- `index.html` - landing page
- `app.html` - four chained calculators
- `engine.js` - pure planning engine (node + browser global)
- `test.js` + `expected.json` - 226 checks against an independent Python oracle, anchors and round-trip properties

## Run tests
```
node test.js
```
