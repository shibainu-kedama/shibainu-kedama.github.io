const track = document.getElementById('scroll-track');

function cloneImages() {
  const items = [...track.querySelectorAll('.scroll-item')];
  const minWidth = window.innerWidth * 2;
  let totalWidth = track.scrollWidth;

  while (totalWidth < minWidth) {
    for (const item of items) {
      const clone = item.cloneNode(true);
      track.appendChild(clone);
      totalWidth += item.offsetWidth || 500;
    }
  }
}

let scrollPos = 0;
let lastTime = performance.now();
const speed = 50; // px/s

function animateScroll(time) {
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;
  scrollPos += speed * deltaTime;

  const first = track.children[0];
  const firstWidth = first.offsetWidth;

  if (first.getBoundingClientRect().right < 0) {
    track.appendChild(first); // DOM変更
    scrollPos -= firstWidth; // 座標だけ調整（ちらつき軽減）
  }

  // transform を最後に実行
  track.style.transform = `translateX(-${scrollPos}px)`;

  requestAnimationFrame(animateScroll);
}

cloneImages();
requestAnimationFrame(animateScroll);
