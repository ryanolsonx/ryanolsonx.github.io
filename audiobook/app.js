"use strict";

// -- DATA

let baseurl =
  "https://archive.org/download/the-fellowship-of-the-ring_soundscape-by-phil-dragash/";

let chapters = [
  {
    n: 1,
    name: "A Long-Expected Party",
    src: `${baseurl}01%20-%20A%20Long-Expected%20Party%20%282014%29.mp3`,
  },
  {
    n: 2,
    name: "The Shadow of the Past",
    src: `${baseurl}02%20-%20The%20Shadow%20of%20the%20Past%20%282014%29.mp3`,
  },
  {
    n: 3,
    name: "Three Is Company",
    src: `${baseurl}03%20-%20Three%20Is%20Company%20%282014%29.mp3`,
  },
  {
    n: 4,
    name: "A Shortcut to Mushrooms",
    src: `${baseurl}04%20-%20A%20Shortcut%20to%20Mushrooms.mp3`,
  },
  {
    n: 5,
    name: "A Conspiracy Unmasked",
    src: `${baseurl}05%20-%20A%20Conspiracy%20Unmasked.mp3`,
  },
  {
    n: 6,
    name: "The Old Forest",
    src: `${baseurl}06%20-%20The%20Old%20Forest.mp3`,
  },
  {
    n: 7,
    name: "In The House of Tom Bombadil",
    src: `${baseurl}07%20-%20In%20The%20House%20of%20Tom%20Bombadil.mp3`,
  },
  {
    n: 8,
    name: "Fog on the Barrow Downs",
    src: `${baseurl}08%20-%20Fog%20on%20the%20Barrow%20Downs.mp3`,
  },
  {
    n: 9,
    name: "At the Sign of the Prancing Pony",
    src: `${baseurl}09%20-%20At%20the%20Sign%20of%20the%20Prancing%20Pony.mp3`,
  },
  { n: 10, name: "Strider", src: `${baseurl}10%20-%20Strider.mp3` },
  {
    n: 11,
    name: "A Knife in the Dark",
    src: `${baseurl}11%20-%20A%20Knife%20in%20the%20Dark.mp3`,
  },
  {
    n: 12,
    name: "Flight to the Ford",
    src: `${baseurl}12%20-%20Flight%20to%20the%20Ford.mp3`,
  },
  {
    n: 13,
    name: "Many Meetings",
    src: `${baseurl}13%20-%20Many%20Meetings.mp3`,
  },
  {
    n: 14,
    name: "The Council of Elrond",
    src: `${baseurl}14%20-%20The%20Council%20of%20Elrond%20256.mp3`,
  },
  {
    n: 15,
    name: "The Ring Goes South",
    src: `${baseurl}15%20-%20The%20Ring%20Goes%20South.mp3`,
  },
  {
    n: 16,
    name: "A Journey In The Dark",
    src: `${baseurl}16%20-%20A%20Journey%20In%20The%20Dark.mp3`,
  },
  {
    n: 17,
    name: "The Bridge of Khazad-Dum",
    src: `${baseurl}17%20-%20The%20Bridge%20of%20Khazad-Dum.mp3`,
  },
  {
    n: 18,
    name: "Lothlorien",
    src: `${baseurl}18%20-%20Lothlorien%20%282013%29.mp3`,
  },
  {
    n: 19,
    name: "Mirror of Galadriel",
    src: `${baseurl}19%20-%20Mirror%20of%20Galadriel.mp3`,
  },
  {
    n: 20,
    name: "Farewell to Lorien",
    src: `${baseurl}20%20-%20Farewell%20to%20Lorien.mp3`,
  },
  {
    n: 21,
    name: "The Great River",
    src: `${baseurl}21%20-%20The%20Great%20River%20%282013%29.mp3`,
  },
  {
    n: 22,
    name: "The Breaking of the Fellowship",
    src: `${baseurl}22%20-%20The%20Breaking%20of%20the%20Fellowship.mp3`,
  },
];

// -- DOM

let $ = {
  audio: document.querySelector("audio"),
  backChapterBtn: document.getElementById("back-chapter"),
  back30Btn: document.getElementById("back-30"),
  playPauseBtn: document.getElementById("play-pause"),
  next30Btn: document.getElementById("next-30"),
  nextChapterBtn: document.getElementById("next-chapter"),
  chapterNumber: document.getElementById("chapter"),
  chapterName: document.getElementById("chapterName"),
  nextChapter: document.getElementById("nextChapter"),
};

// -- STATE
let state = {
  chapter: chapters[0],
};

// -- RENDER

function render() {
  $.playPauseBtn.textContent = $.audio.paused ? "Play" : "Pause";
  $.chapterNumber.textContent = `Chapter ${state.chapter.n}`;
  $.chapterName.textContent = state.chapter.name;
  $.nextChapter.textContent =
    state.chapter.n >= chapters.length ? "" : chapters[state.chapter.n].name;
}

// -- MAIN

function savePlace() {
  localStorage.setItem(
    "place",
    JSON.stringify({ chapter: state.chapter, time: $.audio.currentTime })
  );
}

function getStartingPlace() {
  let place = localStorage.getItem("place");
  if (!place) {
    return { chapter: chapters[0], time: 0 };
  }

  return JSON.parse(place);
}

function main() {
  let place = getStartingPlace();
  state.chapter = place.chapter;

  $.audio.setAttribute("src", state.chapter.src);

  let set = false;
  $.audio.addEventListener("loadeddata", () => {
    if (!set) {
      $.audio.currentTime = place.time;
      set = true;
    }
  });

  $.playPauseBtn.addEventListener("click", () => {
    if ($.audio.paused) {
      $.audio.play();
    } else {
      $.audio.pause();
    }
    render();
  });

  $.backChapterBtn.addEventListener("click", () => {
    state.chapter = chapters[state.chapter.n - 2];
    $.audio.src = state.chapter.src;
    render();
  });

  $.back30Btn.addEventListener("click", () => {
    let curr = $.audio.currentTime;
    $.audio.currentTime -= curr < 30 ? curr : 30;
  });

  $.next30Btn.addEventListener("click", () => {
    $.audio.currentTime += 30;
  });

  $.nextChapterBtn.addEventListener("click", () => {
    state.chapter = chapters[state.chapter.n];
    $.audio.src = state.chapter.src;
    render();
  });

  render();

  setInterval(savePlace, 500);
}

main();
