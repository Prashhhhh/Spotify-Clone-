console.log("Welcome to the JavaScript");
let currentsong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
  // Calculate whole minutes and remaining seconds
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = seconds % 60;

  // Formatting the seconds to always have two digits (e.g., 01, 02, ... 59)
  var formattedSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  // Return the formatted time as a string
  return minutes + ":" + formattedSeconds;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  //show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li> <img class="invert" src="img/music.svg" alt="">
                           <div class="info">
                               <div class="name"> ${song
                                 .replaceAll("%20", " ")
                                 .replaceAll("_", " ")}</div>
                               <div class="artist">Prashant</div>
                           </div>
                           <div class="playNow">
                               <span>Play Now</span>
                               <img id="play" class="invert" src="img/play.svg" alt="">
                           </div> </li> `;
  }

  //attach an event listener to each songs

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}



//play music which clicked only
const playMusic = (track, pause = false) => {
  currentsong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentsong.play();
    Play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-1)[0];
      
      //get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        ` <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="45" height="45"
                                fill="none">
                                <circle cx="12" cy="12" r="11" stroke="none" fill="#1ed760" />
                                <path d="M8.5 7.5v9l7-4.5-7-4.5z" fill="black" />
                            </svg>
                        </div>
                        <img class="rounded" src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
    }
  }

  //open the playlist when card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0])
    });
  });
}

//get the list of all the songs
async function main() {
  await getSongs("songs/cs");
  playMusic(songs[0], true);

  //display all the albums on the page
  displayAlbums();

  //attach an event listener to previous, next and play song buttons.
  Play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      Play.src = "img/pause.svg";
    } else {
      currentsong.pause();
      Play.src = "img/play.svg";
    }
  });

  //listen for time update event
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      Math.floor(currentsong.currentTime)
    )} : ${formatTime(Math.floor(currentsong.duration))}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  //addd an event listener to the seek bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  //add event listener to the hamburger

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //add event listener to the close button
  document.querySelector(".closebtn").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //add an event listeners to the previous button
  previous.addEventListener("click", () => {
    console.log("previous is clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  //add an event listeners to the next button
  next.addEventListener("click", () => {
    console.log("next is clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //add an event to the range
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
      console.log("Setting volume to " + e.target.value + "/100");
      currentsong.volume = parseInt(e.target.value) / 100;

      if(e.target.value == 0){
        document.querySelector(".volume img").src = document.querySelector(".volume img").src.replace("img/volume.svg","img/mute.svg");
      }else{
        document.querySelector(".volume img").src = document.querySelector(".volume img").src.replace("img/mute.svg", "img/volume.svg");
      }
    });


    //add event listener to mute the track.
    document.querySelector(".volume img").addEventListener("click", e => {
      if(e.target.src.includes("img/volume.svg")){
        e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg");
        currentsong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
      }else{
        e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
        currentsong.volume = 0.4;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 40;
      }
    })
}
main();
