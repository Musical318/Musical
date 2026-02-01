const songs = [
  {
    id: 1,
    title: "Mangu",
    artist: "Fourtwenty",
    album: "Indie",
    cover: "mangu gambo.png",
    file: "mangu.mp3"
  },
  {
    id: 2,
    title: "Igauan Malam",
    artist: "Insomniacks",
    album: "Indie",
    cover: "Igauan Malam gambo.png",
    file: "Igauan Malam.mp3"
  },
  {
    id: 3,
    title: "Hitam Putih",
    artist: "Fourtwenty",
    album: "Indie",
    cover: "Hitam Putih gambo.png",
    file: "Hitam Putih.mp3"
  },
  {
    id: 4,
    title: "Untungnya, Hidup Harus Tetap Berjalan",
    artist: "Bernadya",
    album: "Indie",
    cover: "Untungnya gambo.png",
    file: "Untungnya.mp3"
  },
  {
    id: 5,
    title: "Kembali Pulang",
    artist: "Suara Kayu, Feby Putri",
    album: "Indie",
    cover: "Kembali Pulang gambo.png",
    file: "Kembali Pulang.mp3"
  }
];

let liked = JSON.parse(localStorage.getItem("liked")) || [];
let audio = new Audio();
let currentSongIndex = -1;
let isPlaying = false;

// --- RENDERING FUNCTIONS ---
function renderSongs(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  list.forEach(song => {
    container.innerHTML += `
      <div class="song-card" onclick="playSong(${song.id})">
        <div class="card-image-container">
          <img src="${song.cover}" alt="${song.title}">
          <div class="play-button">
            <i data-lucide="play" class="play-icon-fill"></i>
          </div>
        </div>
        <div style="font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.title}</div>
        <div style="color: #b3b3b3; font-size: 0.85em;">${song.artist}</div>
      </div>
    `;
  });
  if (window.lucide) lucide.createIcons();
}

function renderLikedTable() {
  const list = getLikedSongs();
  const container = document.getElementById("likedSongsList");
  const countSpan = document.getElementById("songCount");
  if (!container) return;
  
  countSpan.textContent = list.length;
  container.innerHTML = "";

  list.forEach((song, index) => {
    container.innerHTML += `
      <tr onclick="playSong(${song.id})">
        <td>${index + 1}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${song.cover}" width="40" height="40">
            <div>
              <div style="color: white; font-weight: 500;">${song.title}</div>
              <div>${song.artist}</div>
            </div>
          </div>
        </td>
        <td>${song.album}</td>
        <td>${song.dateAdded}</td>
      </tr>`;
  });
}

function getLikedSongs() {
  return liked.map(likeItem => {
    const id = typeof likeItem === 'object' ? likeItem.id : likeItem;
    const date = typeof likeItem === 'object' ? likeItem.dateAdded : "Unknown Date";
    const song = songs.find(s => s.id === id);
    return { ...song, dateAdded: date };
  }).filter(s => s.id);
}

// --- PLAYER LOGIC ---
function playSong(id) {
    const index = songs.findIndex(s => s.id === id);
    if (index === -1) return;
    
    const song = songs[index];
    currentSongIndex = index;
    audio.src = song.file;
    audio.play();
    isPlaying = true;
    updatePlayerUI(song);
}

function updatePlayerUI(song) {
    // 1. Update the BOTTOM player (mini version)
    const miniCover = document.getElementById("playerCover");
    const miniTitle = document.getElementById("playerTitle");
    const miniArtist = document.getElementById("playerArtist");

    if (miniCover) miniCover.src = song.cover;
    if (miniTitle) miniTitle.textContent = song.title;
    if (miniArtist) miniArtist.textContent = song.artist;

    // 2. Update the RIGHT panel (large version)
    const largeCover = document.getElementById("largeCover");
    const largeTitle = document.getElementById("largeTitle");
    const largeArtist = document.getElementById("largeArtist");

    if (largeCover) largeCover.src = song.cover;
    if (largeTitle) largeTitle.textContent = song.title;
    if (largeArtist) largeArtist.textContent = song.artist;
    
    // 3. Update the Play/Pause icon
    const playIcon = document.querySelector('.play-circle i');
    if (playIcon) {
        playIcon.setAttribute('data-lucide', 'pause');
        if (window.lucide) lucide.createIcons(); // Refresh icons
    }
}

function togglePlay() {
    if (!audio.src) return;
    const playIcon = document.querySelector('.play-circle i');
    if (audio.paused) {
        audio.play();
        playIcon.setAttribute('data-lucide', 'pause');
    } else {
        audio.pause();
        playIcon.setAttribute('data-lucide', 'play');
    }
    if (window.lucide) lucide.createIcons();
}

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(songs[currentSongIndex].id);
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(songs[currentSongIndex].id);
}

// --- INITIALIZE INTERACTIVE PARTS ---
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    // Progress Bar
    audio.addEventListener('timeupdate', () => {
        const progressFill = document.querySelector('.progress-fill');
        const times = document.querySelectorAll('.time');
        if (audio.duration && progressFill) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = percent + "%";
            times[0].textContent = formatTime(audio.currentTime);
            times[1].textContent = formatTime(audio.duration);
        }
    });

    document.querySelector('.progress-bar').addEventListener('click', (e) => {
        const clickPos = e.offsetX / e.currentTarget.offsetWidth;
        audio.currentTime = clickPos * audio.duration;
    });

    // Volume
    document.querySelector('.volume-bar').addEventListener('click', (e) => {
        const clickPos = e.offsetX / e.currentTarget.offsetWidth;
        audio.volume = clickPos;
        document.querySelector('.volume-fill').style.width = (clickPos * 100) + "%";
    });
});

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

