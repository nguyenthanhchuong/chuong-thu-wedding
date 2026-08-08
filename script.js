// Form xác nhận tham dự gửi thẳng vào Google Form (dữ liệu về Google Sheet
// đã liên kết với form). Mã entry.* lấy từ chính form nên khớp đúng cột.
const GOOGLE_FORM_ID = "1FAIpQLScqLaXIro9dKbSSDraaNrq91BGDldB-FvCBVZL8wqvZakyaNg";
const GOOGLE_FORM_ACTION =
  `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/formResponse`;
const GOOGLE_FORM_FIELDS = {
  name:     "entry.1158457171", // Tên của bạn là?
  relation: "entry.1931329361", // Bạn là gì của Dâu Rể nhỉ?
  wish:     "entry.46441727",   // Gửi lời chúc đến Dâu Rể nhé!
  attend:   "entry.1289465958", // Bạn có tham dự không?
  phone:    "entry.1096943310", // Số điện thoại của bạn là?
  area:     "entry.553226459"   // Bạn ở quận mấy nhỉ?
};

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

function initRsvpForm() {
  const form = document.getElementById("rsvp-form");
  const done = document.getElementById("rsvp-done");
  const errorEl = document.getElementById("rsvp-error");
  const submitBtn = document.getElementById("rsvp-submit");
  if (!form || !done || !errorEl || !submitBtn) return;

  const showError = message => {
    errorEl.textContent = message;
    errorEl.hidden = false;
  };

  form.addEventListener("submit", async event => {
    event.preventDefault();
    errorEl.hidden = true;

    const data = new FormData(form);
    const values = {
      name: (data.get("name") || "").trim(),
      relation: (data.get("relation") || "").trim(),
      wish: (data.get("wish") || "").trim(),
      attend: data.get("attend") || "",
      phone: (data.get("phone") || "").trim(),
      area: (data.get("area") || "").trim()
    };

    if (!values.name)     return showError("Bạn cho tụi mình xin tên với nhé.");
    if (!values.relation) return showError("Bạn là gì của Dâu Rể nhỉ?");
    if (!values.wish)     return showError("Gửi Dâu Rể một lời chúc nha.");
    if (!values.attend)   return showError("Bạn chọn giúp có tham dự được không nhé.");
    if (!values.phone)    return showError("Bạn để lại số điện thoại giúp tụi mình nhé.");
    if (!values.area)     return showError("Bạn đang ở khu vực nào vậy?");

    const payload = new FormData();
    Object.keys(GOOGLE_FORM_FIELDS).forEach(key => {
      payload.append(GOOGLE_FORM_FIELDS[key], values[key]);
    });

    submitBtn.disabled = true;
    submitBtn.textContent = "Đang gửi...";

    try {
      // Google chặn đọc phản hồi từ tên miền khác nên dùng no-cors:
      // yêu cầu vẫn được ghi nhận, chỉ là không đọc được nội dung trả về.
      await fetch(GOOGLE_FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        body: payload
      });
      form.hidden = true;
      done.hidden = false;
      done.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Gửi Ngay";
      showError("Gửi chưa được, bạn kiểm tra mạng rồi thử lại giúp nhé.");
    }
  });
}

// Thứ tự xếp xen kẽ: cặp ảnh dọc - ảnh ngang - cặp ảnh dọc ...
// để mọi hàng ra chiều cao xấp xỉ nhau. Ảnh dọc lẻ cuối cùng đứng
// một mình thành ảnh lớn khép lại album.
const GALLERY_IMAGES = [
  "images/photo05.jpg",   // dọc ─┐ cặp
  "images/photo08.jpg",   // dọc ─┘
  "images/photo06.jpg",   // ngang
  "images/photo09.jpg",   // dọc ─┐ cặp
  "images/photo11.jpg",   // dọc ─┘
  "images/photo07.jpg",   // ngang
  "images/photo10.jpg",   // ngang
  "images/photo12.webp",  // dọc ─┐ cặp
  "images/photo13.webp",  // dọc ─┘
  "images/photo15.jpg",   // ngang
  "images/photo14.jpg",   // dọc ─┐ cặp
  "images/photo16.jpg",   // dọc ─┘
  "images/photo18.jpg",   // ngang
  "images/photo19.jpg",   // ngang
  "images/photo17.webp"   // dọc - ảnh lớn khép album
];

const GALLERY_GAP = 6;          // khớp với gap trong style.css
const GALLERY_TARGET_ROW_H = 300; // chiều cao mong muốn mỗi hàng (px)
const GALLERY_NOMINAL_W = 372;    // bề ngang vùng ảnh ở khổ mặc định (px)

function loadImageInfo(src) {
  return new Promise(resolve => {
    const img = new Image();
    // ar = rộng / cao. Ảnh dọc ar < 1, ảnh ngang ar > 1.
    img.onload = () => resolve({ src, ar: (img.naturalWidth / img.naturalHeight) || 1 });
    img.onerror = () => resolve({ src, ar: 1 });
    img.src = src;
  });
}

// Gom ảnh thành từng hàng: cộng dồn ảnh cho tới khi chiều cao hàng
// tụt xuống dưới mức mong muốn thì chốt hàng đó.
function buildRows(items) {
  const rows = [];
  let current = [];
  let arSum = 0;

  items.forEach(item => {
    current.push(item);
    arSum += item.ar;
    const gaps = (current.length - 1) * GALLERY_GAP;
    const rowHeight = (GALLERY_NOMINAL_W - gaps) / arSum;
    if (rowHeight <= GALLERY_TARGET_ROW_H) {
      rows.push(current);
      current = [];
      arSum = 0;
    }
  });

  if (current.length) rows.push(current);
  return rows;
}

// Mỗi ảnh nhận flex-grow tỉ lệ với ar, flex-basis 0 => bề ngang chia đúng
// theo tỉ lệ ar, nên mọi ảnh trong hàng có cùng chiều cao và hàng lấp trọn
// bề ngang. Không thể dư khoảng trống, đồng thời tự co giãn theo màn hình.
// Nhân 10: khi tổng flex-grow của hàng nhỏ hơn 1 (vd hàng chỉ có 1 ảnh dọc,
// ar ~0.67) thì CSS chỉ cho giãn theo đúng phần đó và ảnh không lấp hết
// bề ngang. Nhân lên giữ nguyên tỉ lệ nhưng đảm bảo tổng luôn lớn hơn 1.
function renderRow(container, items) {
  const row = document.createElement("div");
  row.className = "gallery-row";

  items.forEach(item => {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = "";
    img.className = "reveal";
    img.style.flex = `${item.ar * 10} 1 0`;
    row.appendChild(img);
  });

  container.appendChild(row);
}

async function renderGallery() {
  const container = document.getElementById("gallery-grid");
  if (!container) return;

  const items = await Promise.all(GALLERY_IMAGES.map(loadImageInfo));
  buildRows(items).forEach(row => renderRow(container, row));

  initScrollReveal();
}

renderCalendar();
initRsvpForm();
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
