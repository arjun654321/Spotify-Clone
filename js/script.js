console.log("Spotify Clone Script Loaded");

let currentSong = new Audio();
let songs = [];
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

async function loadSongs(folder) {
    currFolder = folder;
    console.log(`Loading songs from folder: ${folder}`);
    try {
        const response = await fetch(`songs2/${folder}/`);
        if (!response.ok) throw new Error(`Failed to load folder: ${folder}`);

        const text = await response.text();
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = text;
        const anchors = tempDiv.getElementsByTagName("a");

        songs = [];
        for (const anchor of anchors) {
            if (anchor.href.endsWith(".mp3")) {
                songs.push(decodeURIComponent(anchor.href.split(`${folder}/`).pop()));
            }
        }

        displaySongs();
    } catch (error) {
        console.error("Error loading songs:", error);
    }
}

function displaySongs() {
    const songList = document.querySelector(".songList ul");
    songList.innerHTML = "";

    songs.forEach((song, index) => {
        songList.innerHTML += `
            <li>
                <img class="invert" width="34" src="img/music.svg" alt="song icon">
                <div class="info">
                    <div>${song}</div>
                    <div>Songs</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="play button">
                </div>
            </li>
        `;
    });

    Array.from(songList.getElementsByTagName("li")).forEach((li, index) => {
        li.addEventListener("click", () => playMusic(songs[index]));
    });
}



function initializePlaybarControls() {
    const playButton = document.querySelector("#play");
    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playButton.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playButton.src = "img/play.svg";
        }
    });

    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    const volumeControl = document.querySelector("input[name='volume']");
    volumeControl.addEventListener("input", (e) => {
        currentSong.volume = e.target.value / 100;
    });

    currentSong.addEventListener("timeupdate", () => {
        const currentTime = currentSong.currentTime;
        const duration = currentSong.duration;
        
        const percent = (currentTime / duration) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        
        document.querySelector(".songtime").textContent = 
            `${secondsToMinutesSeconds(currentTime)} / ${secondsToMinutesSeconds(duration)}`;
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekbar = e.currentTarget;
        const rect = seekbar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        currentSong.currentTime = percent * currentSong.duration;
    });







    currentSong.addEventListener("timeupdate", () => {
        const currentTime = currentSong.currentTime;
        const duration = currentSong.duration;
        
        const percent = (currentTime / duration) * 100;
        const progress = document.querySelector(".seekbar .progress");
        const circle = document.querySelector(".seekbar .circle");
        
        progress.style.width = percent + "%";
        circle.style.left = percent + "%";
        
        document.querySelector(".songtime").textContent = 
            `${secondsToMinutesSeconds(currentTime)} / ${secondsToMinutesSeconds(duration)}`;
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekbar = e.currentTarget;
        const rect = seekbar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const duration = currentSong.duration;
        
        currentSong.currentTime = percent * duration;
    });

    const seekbar = document.querySelector(".seekbar");
    seekbar.addEventListener("mouseover", () => {
        document.querySelector(".circle").style.display = "block";
    });
    seekbar.addEventListener("mouseout", () => {
        if (!currentSong.paused) {
            document.querySelector(".circle").style.display = "none";
        }
    });
}





function playMusic(song) {
    console.log(`Playing song: ${song}`);
    currentSong.src = `songs2/${currFolder}/${song}`;
    currentSong.play();
    document.querySelector("#play").src = "img/pause.svg";
    document.querySelector(".songinfo").textContent = song;
}

document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
        const folder = card.querySelector("h2").textContent.toLowerCase();
        loadSongs(folder);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    loadSongs("pop"); 
    initializePlaybarControls();
});
