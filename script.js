// Dán link nhúng Google Form vào đây (Form > Gửi > biểu tượng </> > copy URL trong thuộc tính src)
const GOOGLE_FORM_EMBED_URL = "https://docs.google.com/forms/d/e/1FAIpQLScqLaXIro9dKbSSDraaNrq91BGDldB-FvCBVZL8wqvZakyaNg/viewform?embedded=true";

function renderCalendar() {
  const year = 2025;
  const month = 0; // Tháng 1 (0-indexed)
  const markedDay = 19;
  const dows = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const el = document.getElementById("calendar");
  if (!el) return;

  let html = `
    <div class="cal-header">
      <span class="cal-month">Tháng 1</span>
      <span class="cal-year">${year}</span>
    </div>
    <div class="cal-grid">
  `;

  dows.forEach(d => { html += `<div class="dow">${d}</div>`; });

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="day empty">-</div>`;
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const cls = day === markedDay ? "day marked" : "day";
    html += `<div class="${cls}">${day}</div>`;
  }

  html += `</div>`;
  el.innerHTML = html;
}

function renderRsvpForm() {
  const container = document.getElementById("rsvp-form-container");
  if (!container) return;

  if (!GOOGLE_FORM_EMBED_URL) {
    return; // giữ nguyên placeholder trong index.html
  }

  container.innerHTML = `<iframe src="${GOOGLE_FORM_EMBED_URL}" loading="lazy">Đang tải…</iframe>`;
}

// Album: masonry thật - xếp từng ảnh vào cột đang thấp hơn dựa theo tỉ lệ ảnh thật
const GALLERY_IMAGES = [
  "images/photo05.jpg",
  "images/photo06.jpg",
  "images/photo07.jpg",
  "images/photo08.jpg",
  "images/photo09.jpg",
  "images/photo10.jpg",
  "images/photo13.webp",
  "images/photo14.jpg",
  "images/photo11.jpg",
  "images/photo12.webp",
  "images/photo15.jpg",
  "images/photo18.jpg",
  "images/photo16.jpg",
  "images/photo19.jpg",
  "images/photo17.webp"
];

function loadImageRatio(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img.naturalHeight / img.naturalWidth || 1);
    img.onerror = () => resolve(1);
    img.src = src;
  });
}

async function renderGallery() {
  const cols = [document.getElementById("gallery-col-0"), document.getElementById("gallery-col-1")];
  if (!cols[0] || !cols[1]) return;

  const ratios = await Promise.all(GALLERY_IMAGES.map(loadImageRatio));
  const colHeights = [0, 0];

  GALLERY_IMAGES.forEach((src, i) => {
    const target = colHeights[0] <= colHeights[1] ? 0 : 1;
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.className = "reveal";
    cols[target].appendChild(img);
    colHeights[target] += ratios[i];
  });

  initScrollReveal();
}

renderCalendar();
renderRsvpForm();
renderGallery();

// Hiệu ứng: ảnh mờ dần + trượt lên khi cuộn tới
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal:not(.reveal-observed)");
  if (!("IntersectionObserver" in window)) {
    targets.forEach(t => t.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  targets.forEach(t => {
    t.classList.add("reveal-observed");
    observer.observe(t);
  });
}
initScrollReveal();

// Nhạc nền: Đức Phúc - Ngày Đầu Tiên (phát qua YouTube, không lưu file nhạc)
const BACKGROUND_SONG_VIDEO_ID = "AfNbehFKJ7o";
let ytPlayer = null;
let musicPlaying = false;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player("yt-player", {
    height: "1",
    width: "1",
    videoId: BACKGROUND_SONG_VIDEO_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      loop: 1,
      playlist: BACKGROUND_SONG_VIDEO_ID
    },
    events: {
      onReady: () => {
        const btn = document.getElementById("music-toggle");
        if (btn) btn.disabled = false;
      }
    }
  });
}

const musicBtn = document.getElementById("music-toggle");
if (musicBtn) {
  musicBtn.addEventListener("click", () => {
    if (!ytPlayer) return;
    if (musicPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
    musicPlaying = !musicPlaying;
    musicBtn.classList.toggle("playing", musicPlaying);
  });
}
