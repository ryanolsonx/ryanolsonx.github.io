"use strict";

//#region Data
let baseurl =
  "https://archive.org/download/the-fellowship-of-the-ring_soundscape-by-phil-dragash/";

let chapters = [
  {
    name: "A Long-Expected Party",
    src: `${baseurl}01%20-%20A%20Long-Expected%20Party%20%282014%29.mp3`,
  },
  {
    name: "The Shadow of the Past",
    src: `${baseurl}02%20-%20The%20Shadow%20of%20the%20Past%20%282014%29.mp3`,
  },
  {
    name: "Three Is Company",
    src: `${baseurl}03%20-%20Three%20Is%20Company%20%282014%29.mp3`,
  },
  {
    name: "A Shortcut to Mushrooms",
    src: `${baseurl}04%20-%20A%20Shortcut%20to%20Mushrooms.mp3`,
  },
  {
    name: "A Conspiracy Unmasked",
    src: `${baseurl}05%20-%20A%20Conspiracy%20Unmasked.mp3`,
  },
  {
    name: "The Old Forest",
    src: `${baseurl}06%20-%20The%20Old%20Forest.mp3`,
  },
  {
    name: "In The House of Tom Bombadil",
    src: `${baseurl}07%20-%20In%20The%20House%20of%20Tom%20Bombadil.mp3`,
  },
  {
    name: "Fog on the Barrow Downs",
    src: `${baseurl}08%20-%20Fog%20on%20the%20Barrow%20Downs.mp3`,
  },
  {
    name: "At the Sign of the Prancing Pony",
    src: `${baseurl}09%20-%20At%20the%20Sign%20of%20the%20Prancing%20Pony.mp3`,
  },
  { name: "Strider", src: `${baseurl}10%20-%20Strider.mp3` },
  {
    name: "A Knife in the Dark",
    src: `${baseurl}11%20-%20A%20Knife%20in%20the%20Dark.mp3`,
  },
  {
    name: "Flight to the Ford",
    src: `${baseurl}12%20-%20Flight%20to%20the%20Ford.mp3`,
  },
  {
    name: "Many Meetings",
    src: `${baseurl}13%20-%20Many%20Meetings.mp3`,
  },
  {
    name: "The Council of Elrond",
    src: `${baseurl}14%20-%20The%20Council%20of%20Elrond%20256.mp3`,
  },
  {
    name: "The Ring Goes South",
    src: `${baseurl}15%20-%20The%20Ring%20Goes%20South.mp3`,
  },
  {
    name: "A Journey In The Dark",
    src: `${baseurl}16%20-%20A%20Journey%20In%20The%20Dark.mp3`,
  },
  {
    name: "The Bridge of Khazad-Dum",
    src: `${baseurl}17%20-%20The%20Bridge%20of%20Khazad-Dum.mp3`,
  },
  {
    name: "Lothlorien",
    src: `${baseurl}18%20-%20Lothlorien%20%282013%29.mp3`,
  },
  {
    name: "Mirror of Galadriel",
    src: `${baseurl}19%20-%20Mirror%20of%20Galadriel.mp3`,
  },
  {
    name: "Farewell to Lorien",
    src: `${baseurl}20%20-%20Farewell%20to%20Lorien.mp3`,
  },
  {
    name: "The Great River",
    src: `${baseurl}21%20-%20The%20Great%20River%20%282013%29.mp3`,
  },
  {
    name: "The Breaking of the Fellowship",
    src: `${baseurl}22%20-%20The%20Breaking%20of%20the%20Fellowship.mp3`,
  },
];
//#endregion Data

//#region DOM
let $audio = document.querySelector("audio");
let $previousChapterBtn = document.getElementById("previous-chapter-btn");
let $goBack30SecondsBtn = document.getElementById("go-back-30-seconds-btn");
let $playPauseBtn = document.getElementById("play-pause-btn");
let $playPauseBtnIcon = document.getElementById("play-pause-btn-icon");
let $skipForward30SecondsBtn = document.getElementById(
  "skip-forward-30-seconds-btn"
);
let $nextChapterBtn = document.getElementById("next-chapter-btn");

let $chapterNumber = document.querySelector("h1");
let $chapterTitle = document.getElementById("chapter-title-text");
let $currentTime = document.getElementById("current-time");
let $duration = document.getElementById("duration");
let $meter = document.querySelector("meter");
//#endregion DOM

let chapterIndex = 0;
let loaded = false;
let queuedChapterIndex = null; // keeps track of chapter change for next render.
let saverInterval = null;

function main() {
  const startingState = getStartingState();
  chapterIndex = startingState.chapterIndex;
  let chapter = chapters[chapterIndex];
  changeChapter(chapter, chapterIndex, startingState.currentTime);
  connectEventHandlers();
  setInterval(render, 500);
}

function connectEventHandlers() {
  $audio.addEventListener("loadedmetadata", audioLoadedMetadata);
  $previousChapterBtn.addEventListener("click", previousChapterBtnClicked);
  $goBack30SecondsBtn.addEventListener("click", goBack30SecondsBtnClicked);
  $playPauseBtn.addEventListener("click", playPauseBtnClicked);
  $skipForward30SecondsBtn.addEventListener(
    "click",
    skipForward30SecondsBtnClicked
  );
  $nextChapterBtn.addEventListener("click", nextChapterBtnClicked);
  $meter.addEventListener("click", meterClicked);
}

function audioLoadedMetadata() {
  loaded = true;
  render();
}

function previousChapterBtnClicked() {
  let previousChapterIndex = chapterIndex > 0 ? chapterIndex - 1 : 0;
  if (previousChapterIndex !== chapterIndex) {
    queuedChapterIndex = previousChapterIndex;
  }
  render();
}

function goBack30SecondsBtnClicked() {
  $audio.currentTime -= 30;
  $audio.play();
  render();
}

function playPauseBtnClicked() {
  if ($audio.paused) {
    $audio.play();
    startSaving();
  } else {
    $audio.pause();
    clearInterval(saverInterval);
  }
  render();
}

function skipForward30SecondsBtnClicked() {
  $audio.currentTime += 30;
  $audio.play();
  render();
}

function nextChapterBtnClicked() {
  let nextChapterIndex =
    chapterIndex < chapters.length - 1 ? chapterIndex + 1 : chapterIndex;
  if (nextChapterIndex !== chapterIndex) {
    queuedChapterIndex = nextChapterIndex;
  }
  render();
}

function meterClicked(event) {
  const percent = getPercentToChange(event);
  $audio.currentTime = Math.floor($audio.duration * percent);
}

function getPercentToChange(event) {
  const x = event.x - 20;
  const width = window.innerWidth - 40; /* main */

  return x / width;
}

function getStartingState() {
  let state = localStorage.getItem("state");
  if (!state) {
    return { chapterIndex: 0, currentTime: 0 };
  }

  return JSON.parse(state);
}

function startSaving() {
  saverInterval = setInterval(saveState, 500);
}

function saveState() {
  if (!loaded) return;
  localStorage.setItem(
    "state",
    JSON.stringify({ chapterIndex, currentTime: $audio.currentTime })
  );
}

function changeChapter(chapter, chapterIndex, atTime) {
  $chapterNumber.textContent = `Chapter ${chapterIndex + 1}`;
  $chapterTitle.textContent = chapter.name;
  $audio.src = chapter.src;
  $audio.currentTime = atTime;
}

function render() {
  if ($audio.paused) {
    $playPauseBtnIcon.textContent = "play_arrow";
  } else {
    $playPauseBtnIcon.textContent = "pause";
  }

  if (queuedChapterIndex) {
    chapterIndex = queuedChapterIndex;

    let chapter = chapters[chapterIndex];
    changeChapter(chapter, chapterIndex, 0);
    loaded = false;

    queuedChapterIndex = null;
  }

  if (loaded) {
    $currentTime.textContent = formatTimeSpan($audio.currentTime);
    $duration.textContent = formatTimeSpan($audio.duration);
    $meter.value = $audio.currentTime;
    $meter.max = $audio.duration;
  }
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

function formatTimeSpan(totalSeconds) {
  let seconds = Math.floor(totalSeconds % 60);
  let minutes = Math.floor((totalSeconds / 60) % 60);
  let hours = Math.floor(totalSeconds / 3600);

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
}

main();
