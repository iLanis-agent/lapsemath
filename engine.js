// Lapsemath engine - timelapse planning math.
// Exact: frames = clip seconds x fps; interval = event seconds / frames;
// storage = frames x MB per frame; playback = frames / fps.
// Labeled guidance: the camera needs about 1 second beyond the shutter time per
// frame (write + overhead); a natural-looking shutter is about half the interval
// (the "180-degree" timelapse rule); shots per battery is a user-supplied estimate.
const BUFFER_S = 1; // labeled

// Plan: event duration + wanted clip + fps -> frames, interval, storage, verdicts.
function plan(eventMin, clipSec, fps, mbPerFrame){
  if (!(eventMin > 0)) throw new Error('event duration must be positive');
  if (!(clipSec > 0)) throw new Error('clip length must be positive');
  if (!(fps > 0)) throw new Error('frame rate must be positive');
  if (!(mbPerFrame > 0)) throw new Error('MB per frame must be positive');
  const frames = Math.round(clipSec * fps);
  const eventSec = eventMin * 60;
  const interval = eventSec / frames;
  const storageMb = frames * mbPerFrame;
  return { eventMin, clipSec, fps, frames, interval, eventSec,
    storageMb, storageGb: storageMb / 1024, playbackSec: frames / fps };
}

// Shutter verdict: the shutter must fit inside the interval with ~1s to spare (labeled).
function shutterCheck(interval, shutterSec){
  if (!(interval > 0)) throw new Error('interval must be positive');
  if (!(shutterSec > 0)) throw new Error('shutter time must be positive');
  const fits = shutterSec + BUFFER_S <= interval;
  const naturalShutter = interval / 2;
  const verdict = fits
    ? 'fits with ' + (interval - shutterSec).toFixed(1) + 's to spare (1s buffer rule)'
    : 'too long for the interval - dropped frames or hitches (1s buffer rule)';
  return { interval, shutterSec, fits, naturalShutter, verdict };
}

// Reverse: shots already taken at an interval -> event covered and clip length.
function coverage(shots, intervalSec, fps){
  if (!(shots >= 1)) throw new Error('need at least one shot');
  if (!(intervalSec > 0)) throw new Error('interval must be positive');
  if (!(fps > 0)) throw new Error('frame rate must be positive');
  const eventSec = shots * intervalSec;
  return { shots, intervalSec, fps, eventSec, eventMin: eventSec / 60,
    clipSec: shots / fps };
}

// Batteries: labeled estimate against a user-supplied shots-per-battery figure.
function batteries(frames, shotsPerBattery){
  if (!(frames >= 1)) throw new Error('need at least one frame');
  if (!(shotsPerBattery > 0)) throw new Error('shots per battery must be positive');
  const count = Math.ceil(frames / shotsPerBattery);
  return { frames, shotsPerBattery, count,
    verdict: count <= 1 ? 'one battery covers it (labeled estimate)'
      : count + ' batteries (labeled estimate - cold and live view eat shots)' };
}

// Slider: total travel across frames -> mm per shot and apparent speed.
function slider(travelMm, frames, clipFps){
  if (!(travelMm > 0)) throw new Error('slider travel must be positive');
  if (!(frames >= 1)) throw new Error('need at least one frame');
  if (!(clipFps > 0)) throw new Error('frame rate must be positive');
  const mmPerShot = travelMm / frames;
  const clipSec = frames / clipFps;
  const apparentMmPerClipSec = travelMm / clipSec;
  return { travelMm, frames, clipFps, mmPerShot, clipSec, apparentMmPerClipSec };
}

const API = { BUFFER_S, plan, shutterCheck, coverage, batteries, slider };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
if (typeof window !== 'undefined') window.Lapsemath = API;
