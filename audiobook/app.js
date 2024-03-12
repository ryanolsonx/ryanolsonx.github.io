'use strict';

// -- GLOBALS

const StorageKey = 'state';

let chapterIndex = 0;
let loaded = false;
/** @type {number|null} */
let queuedChapterIndex = null; // keeps track of chapter change for next render.
/** @type {number|null} */
let queuedCurrentTime = null;
/** @type {number|undefined} */
let saverInterval;

// -- DATA

const baseurl =
  'https://archive.org/download/the-fellowship-of-the-ring_soundscape-by-phil-dragash/';

/**
 * @typedef Chapter
 * @prop {string} name The chapter name
 * @prop {string} src The href to the mp3 of the audio source.
 *
 * @type {Chapter[]}
 */
const chapters = [
  {
    name: 'A Long-Expected Party',
    src: `${baseurl}01%20-%20A%20Long-Expected%20Party%20%282014%29.mp3`,
  },
  {
    name: 'The Shadow of the Past',
    src: `${baseurl}02%20-%20The%20Shadow%20of%20the%20Past%20%282014%29.mp3`,
  },
  {
    name: 'Three Is Company',
    src: `${baseurl}03%20-%20Three%20Is%20Company%20%282014%29.mp3`,
  },
  {
    name: 'A Shortcut to Mushrooms',
    src: `${baseurl}04%20-%20A%20Shortcut%20to%20Mushrooms.mp3`,
  },
  {
    name: 'A Conspiracy Unmasked',
    src: `${baseurl}05%20-%20A%20Conspiracy%20Unmasked.mp3`,
  },
  {
    name: 'The Old Forest',
    src: `${baseurl}06%20-%20The%20Old%20Forest.mp3`,
  },
  {
    name: 'In The House of Tom Bombadil',
    src: `${baseurl}07%20-%20In%20The%20House%20of%20Tom%20Bombadil.mp3`,
  },
  {
    name: 'Fog on the Barrow Downs',
    src: `${baseurl}08%20-%20Fog%20on%20the%20Barrow%20Downs.mp3`,
  },
  {
    name: 'At the Sign of the Prancing Pony',
    src: `${baseurl}09%20-%20At%20the%20Sign%20of%20the%20Prancing%20Pony.mp3`,
  },
  { name: 'Strider', src: `${baseurl}10%20-%20Strider.mp3` },
  {
    name: 'A Knife in the Dark',
    src: `${baseurl}11%20-%20A%20Knife%20in%20the%20Dark.mp3`,
  },
  {
    name: 'Flight to the Ford',
    src: `${baseurl}12%20-%20Flight%20to%20the%20Ford.mp3`,
  },
  {
    name: 'Many Meetings',
    src: `${baseurl}13%20-%20Many%20Meetings.mp3`,
  },
  {
    name: 'The Council of Elrond',
    src: `${baseurl}14%20-%20The%20Council%20of%20Elrond%20256.mp3`,
  },
  {
    name: 'The Ring Goes South',
    src: `${baseurl}15%20-%20The%20Ring%20Goes%20South.mp3`,
  },
  {
    name: 'A Journey In The Dark',
    src: `${baseurl}16%20-%20A%20Journey%20In%20The%20Dark.mp3`,
  },
  {
    name: 'The Bridge of Khazad-Dum',
    src: `${baseurl}17%20-%20The%20Bridge%20of%20Khazad-Dum.mp3`,
  },
  {
    name: 'Lothlorien',
    src: `${baseurl}18%20-%20Lothlorien%20%282013%29.mp3`,
  },
  {
    name: 'Mirror of Galadriel',
    src: `${baseurl}19%20-%20Mirror%20of%20Galadriel.mp3`,
  },
  {
    name: 'Farewell to Lorien',
    src: `${baseurl}20%20-%20Farewell%20to%20Lorien.mp3`,
  },
  {
    name: 'The Great River',
    src: `${baseurl}21%20-%20The%20Great%20River%20%282013%29.mp3`,
  },
  {
    name: 'The Breaking of the Fellowship',
    src: `${baseurl}22%20-%20The%20Breaking%20of%20the%20Fellowship.mp3`,
  },
];

// -- DOM

/** @type {HTMLAudioElement} */
const $audio = document.querySelector('audio');
/** @type {HTMLButtonElement} */
const $previousChapterBtn = document.querySelector('button#previous-chapter');
/** @type {HTMLButtonElement} */
const $goBack30SecondsBtn = document.querySelector('button#back-30');
/** @type {HTMLButtonElement} */
const $playPauseBtn = document.querySelector('button#play-pause');
/** @type {HTMLButtonElement} */
const $playPauseBtnIcon = $playPauseBtn.querySelector('i');
const $playPauseBtnSrText = $playPauseBtn.querySelector('.sr-only');
/** @type {HTMLButtonElement} */
const $skipForward30SecondsBtn = document.querySelector('button#forward-30');
/** @type {HTMLButtonElement} */
const $nextChapterBtn = document.querySelector('button#next-chapter');

/** @type {HTMLHeadingElement} */
const $chapter = document.querySelector('h1');
/** @type {HTMLTimeElement} */
const $currentTime = document.querySelector('time#current-time');
/** @type {HTMLTimeElement} */
const $duration = document.querySelector('time#duration');
/** @type {HTMLProgressElement} */
const $progress = document.querySelector('progress');

// -- EVENT HANDLERS

/**
 * Switch chapters to the next one. If on the last chapter, don't change chapters.
 */
const nextChapterBtnClicked = () => {
  let nextChapterIndex =
    chapterIndex < chapters.length - 1 ? chapterIndex + 1 : chapterIndex;
  if (nextChapterIndex !== chapterIndex) {
    queuedChapterIndex = nextChapterIndex;
  }
};

/**
 * Change the currentTime within the current chapter. This allows you to skip around
 * and find a specific spot in the chapter.
 *
 * @param {MouseEvent} event
 */
const progressClicked = (event) => {
  const x = event.x - 20;
  const width = window.innerWidth - 40; // main
  const percent = x / width;
  $audio.currentTime = Math.floor($audio.duration * percent);
};

/**
 * Skip forward 30 seconds in the chapter.
 */
const skipForward30SecondsBtnClicked = () => {
  $audio.currentTime += 30;
  $audio.play();
};

/**
 * Toggle play/pause of the current chapter.
 */
const playPauseBtnClicked = () => {
  if ($audio.paused) {
    $audio.play();
    startSaving();
  } else {
    $audio.pause();
    clearInterval(saverInterval);
  }
};

/**
 * Go back 30 seconds in the current chapter.
 */
const goBack30SecondsBtnClicked = () => {
  $audio.currentTime -= 30;
  $audio.play();
};

/**
 * Go to the previous chapter. If already on chapter 1, remain there.
 */
const previousChapterBtnClicked = () => {
  let previousChapterIndex = chapterIndex > 0 ? chapterIndex - 1 : 0;
  if (previousChapterIndex !== chapterIndex) {
    queuedChapterIndex = previousChapterIndex;
  }
};

/**
 * Once the current chapter has loaded, switch a loaded variable that
 * render uses.
 */
const audioLoadedMetadata = () => {
  loaded = true;
};

const connectEventHandlers = () => {
  $audio.addEventListener('loadedmetadata', audioLoadedMetadata);
  $previousChapterBtn.addEventListener('click', previousChapterBtnClicked);
  $goBack30SecondsBtn.addEventListener('click', goBack30SecondsBtnClicked);
  $playPauseBtn.addEventListener('click', playPauseBtnClicked);
  $skipForward30SecondsBtn.addEventListener(
    'click',
    skipForward30SecondsBtnClicked,
  );
  $nextChapterBtn.addEventListener('click', nextChapterBtnClicked);
  $progress.addEventListener('click', progressClicked);
};

// -- HELPERS

/**
 * @typedef State
 * @prop {number} chapterIndex
 * @prop {number} currentTime
 */

/**
 * Get the starting chapter and location within the chapter.
 * @returns {State}
 */
const getStartingState = () => {
  let state = localStorage.getItem(StorageKey);
  if (!state) {
    return { chapterIndex: 0, currentTime: 0 };
  }

  return JSON.parse(state);
};

/**
 * Save current audio state every 500 ms.
 */
const startSaving = () => {
  saverInterval = setInterval(saveState, 500);
};

/**
 * Save current audio state.
 */
const saveState = () => {
  if (!loaded) return;
  localStorage.setItem(
    StorageKey,
    JSON.stringify({ chapterIndex, currentTime: $audio.currentTime }),
  );
};

/**
 * Switch to a different chapter. This handles switching the audio and updating the chapter text on screen.
 * @param {Chapter} chapter
 * @param {number} chapterIndex
 */
const changeChapter = (chapter, chapterIndex) => {
  $audio.src = chapter.src;
  $chapter.textContent = `Chapter ${chapterIndex + 1}: ${chapter.name}`;
};

// -- RENDER

/**
 * Pad so number is formatted as NN
 * @param {number} n
 * @returns {string}
 */
const pad = (n) => {
  return n.toString().padStart(2, '0');
};

/**
 * Take a total amount of seconds and break it into a string of HH:MM:SS format.
 * @param {number} totalSeconds
 * @returns {string} Formatted as HH:MM:SS
 */
const formatTimeSpan = (totalSeconds) => {
  let seconds = Math.floor(totalSeconds % 60);
  let minutes = Math.floor((totalSeconds / 60) % 60);
  let hours = Math.floor(totalSeconds / 3600);

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
};

const render = () => {
  // Play / Pause icon
  if ($audio.paused) {
    $playPauseBtnIcon.textContent = 'play_arrow';
    $playPauseBtnSrText.textContent = 'Play';
  } else {
    $playPauseBtnIcon.textContent = 'pause';
    $playPauseBtnSrText.textContent = 'Pause';
  }

  // changing chapter
  if (queuedChapterIndex !== null) {
    chapterIndex = queuedChapterIndex;

    const chapter = chapters[chapterIndex];
    changeChapter(chapter, chapterIndex);

    loaded = false; // Reset so that certain things don't render until next audio is loaded.

    // dequeue
    queuedChapterIndex = null;
  }

  // Only render these things once the audio has loaded.
  if (loaded) {
    $currentTime.dateTime = formatTimeSpan($audio.currentTime);
    $currentTime.textContent = formatTimeSpan($audio.currentTime);
    $duration.dateTime = formatTimeSpan($audio.duration);
    $duration.textContent = formatTimeSpan($audio.duration);
    $progress.value = $audio.currentTime;
    $progress.max = $audio.duration;

    // changing time within chapter
    if (queuedCurrentTime !== null) {
      $audio.currentTime = queuedCurrentTime;
      queuedCurrentTime = null;
    }
  }
};

// -- MAIN

(() => {
  if ($audio === null) return;
  const startingState = getStartingState();

  // These are queued so they can be applied on the next render.
  queuedChapterIndex = startingState.chapterIndex;
  queuedCurrentTime = startingState.currentTime;

  connectEventHandlers();

  // Updating every 200ms is enough.
  setInterval(render, 200);
  render();
})();
