// Dán link nhúng Google Form vào đây (Form > Gửi > biểu tượng </> > copy URL trong thuộc tính src)
const GOOGLE_FORM_EMBED_URL = "";

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

renderCalendar();
renderRsvpForm();
