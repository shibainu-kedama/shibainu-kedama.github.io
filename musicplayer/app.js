(function () {
  const audio = document.getElementById("audio");
  const trackTitle = document.getElementById("trackTitle");
  const trackIndex = document.getElementById("trackIndex");
  const seekBar = document.getElementById("seekBar");
  const currentTimeEl = document.getElementById("currentTime");
  const durationEl = document.getElementById("duration");
  const playBtn = document.getElementById("playBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const shuffleBtn = document.getElementById("shuffleBtn");
  const repeatBtn = document.getElementById("repeatBtn");
  const volumeBar = document.getElementById("volumeBar");
  const playlistEl = document.getElementById("playlist");
  const playlistCount = document.getElementById("playlistCount");

  let order = TRACKS.map((_, i) => i); // 再生順(シャッフル時はここを並べ替える)
  let position = -1; // order 内での現在位置
  let isShuffle = false;
  let isRepeat = false; // 1曲リピート
  let isSeeking = false;

  function formatTime(sec) {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderPlaylist() {
    playlistEl.innerHTML = "";
    TRACKS.forEach((track, idx) => {
      const li = document.createElement("li");
      li.className = "playlist-item";
      li.dataset.index = idx;
      li.innerHTML = `<span class="pl-title">${track.title}</span>`;
      li.addEventListener("click", () => playByTrackIndex(idx));
      playlistEl.appendChild(li);
    });
    playlistCount.textContent = `${TRACKS.length}曲`;
    updateActiveItem();
  }

  function updateActiveItem() {
    const items = playlistEl.querySelectorAll(".playlist-item");
    items.forEach((item) => item.classList.remove("active"));
    if (position >= 0) {
      const currentTrackIdx = order[position];
      const active = playlistEl.querySelector(`[data-index="${currentTrackIdx}"]`);
      if (active) {
        active.classList.add("active");
        active.scrollIntoView({ block: "nearest" });
      }
    }
  }

  function playByTrackIndex(trackIdx) {
    const pos = order.indexOf(trackIdx);
    position = pos !== -1 ? pos : 0;
    loadCurrent();
    play();
  }

  function loadCurrent() {
    const trackIdx = order[position];
    const track = TRACKS[trackIdx];
    audio.src = track.file;
    trackTitle.textContent = track.title;
    trackIndex.textContent = `${position + 1} / ${order.length}`;
    updateActiveItem();
  }

  function play() {
    audio.play();
    playBtn.textContent = "⏸";
  }

  function pause() {
    audio.pause();
    playBtn.textContent = "▶";
  }

  function togglePlay() {
    if (position === -1) {
      position = 0;
      loadCurrent();
      play();
      return;
    }
    if (audio.paused) play();
    else pause();
  }

  function playNext() {
    if (order.length === 0) return;
    position = (position + 1) % order.length;
    loadCurrent();
    play();
  }

  function playPrev() {
    if (order.length === 0) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    position = (position - 1 + order.length) % order.length;
    loadCurrent();
    play();
  }

  function toggleShuffle() {
    const currentTrackIdx = position >= 0 ? order[position] : -1;
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
    order = isShuffle ? shuffleArray(TRACKS.map((_, i) => i)) : TRACKS.map((_, i) => i);
    if (currentTrackIdx !== -1) {
      position = order.indexOf(currentTrackIdx);
    }
  }

  function toggleRepeat() {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle("active", isRepeat);
  }

  // --- イベント登録 ---
  playBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", playNext);
  prevBtn.addEventListener("click", playPrev);
  shuffleBtn.addEventListener("click", toggleShuffle);
  repeatBtn.addEventListener("click", toggleRepeat);

  audio.addEventListener("timeupdate", () => {
    if (isSeeking) return;
    if (audio.duration) {
      seekBar.value = (audio.currentTime / audio.duration) * 100;
    }
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("ended", () => {
    if (isRepeat) {
      audio.currentTime = 0;
      play();
    } else {
      playNext(); // 連続再生
    }
  });

  seekBar.addEventListener("input", () => {
    isSeeking = true;
    if (audio.duration) {
      currentTimeEl.textContent = formatTime((seekBar.value / 100) * audio.duration);
    }
  });

  seekBar.addEventListener("change", () => {
    if (audio.duration) {
      audio.currentTime = (seekBar.value / 100) * audio.duration;
    }
    isSeeking = false;
  });

  volumeBar.addEventListener("input", () => {
    audio.volume = volumeBar.value / 100;
  });

  // 初期化
  audio.volume = volumeBar.value / 100;
  renderPlaylist();
})();
