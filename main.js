// =========
// Helpers
// =========
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatMonthShort(date) {
  return date.toLocaleString(undefined, { month: "short" });
}

// =========
// Mobile nav
// =========
const navToggle = $(".nav-toggle");
const nav = $(".nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when clicking a link (mobile)
  $$("#primary-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close menu on outside click (mobile)
  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("open")) return;
    const within = nav.contains(e.target) || navToggle.contains(e.target);
    if (!within) {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// =========
// Footer year
// =========
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =========
// Demo Events Data (replace with real events or load from JSON)
// =========
const events = [
  {
    title: "Community Dinner Night",
    date: "2026-02-01",
    time: "6:00 PM",
    location: "Fellowship Hall",
    category: "community",
    tags: ["All Welcome", "Food", "Community"]
  },
  {
    title: "Youth Night",
    date: "2026-01-23",
    time: "7:00 PM",
    location: "Youth Room",
    category: "youth",
    tags: ["Students", "Games", "Discussion"]
  },
  {
    title: "Neighborhood Outreach",
    date: "2026-01-31",
    time: "9:30 AM",
    location: "Meet in Lobby",
    category: "outreach",
    tags: ["Serve", "Local", "Volunteer"]
  },
  {
    title: "Midweek Bible Study",
    date: "2026-01-22",
    time: "7:00 PM",
    location: "Room 104",
    category: "study",
    tags: ["Scripture", "Prayer"]
  }
];

function renderEvents(list) {
  const container = $("#eventList");
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `
      <div class="card">
        <h3>No events found</h3>
        <p class="muted">Try a different search or filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((ev) => {
      const d = new Date(ev.date + "T12:00:00");
      const month = formatMonthShort(d);
      const day = d.getDate();
      const safeTags = (ev.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");

      return `
        <article class="event">
          <div class="event-date" aria-hidden="true">
            <div class="month">${month}</div>
            <div class="day">${day}</div>
          </div>
          <div>
            <div class="event-title">${escapeHtml(ev.title)}</div>
            <div class="event-meta">${escapeHtml(ev.time)} • ${escapeHtml(ev.location)}</div>
            <div class="event-tags">${safeTags}</div>
          </div>
          <div style="display:flex; align-items:flex-start; justify-content:flex-end;">
            <button class="btn btn-small btn-ghost" type="button"
              data-add-event
              data-title="${encodeAttr(ev.title)}"
              data-date="${encodeAttr(ev.date)}"
              data-time="${encodeAttr(ev.time)}">
              Add to Calendar
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  // Wire up "Add to Calendar" buttons
  $$("[data-add-event]").forEach(btn => {
    btn.addEventListener("click", () => {
      const title = btn.getAttribute("data-title") || "Church Event";
      const date = btn.getAttribute("data-date") || "";
      const time = btn.getAttribute("data-time") || "";

      // Create a simple ICS file for download
      const ics = buildICS({
        title,
        startDate: date,
        startTime: time,
        durationMinutes: 90
      });

      downloadTextFile(`${slugify(title)}.ics`, ics);
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function encodeAttr(str) {
  // avoid quotes breaking attributes
  return escapeHtml(str).replaceAll('"', "&quot;");
}
function slugify(str) {
  return String(str).toLowerCase().trim().replace(/[^\w]+/g, "-").replace(/-+/g, "-");
}

// Filter controls
const searchInput = $("#eventSearch");
const filterSelect = $("#eventFilter");

function applyEventFilters() {
  const q = (searchInput?.value || "").toLowerCase().trim();
  const filter = filterSelect?.value || "all";

  const filtered = events.filter(ev => {
    const matchesFilter = filter === "all" ? true : ev.category === filter;
    const matchesQuery =
      !q ||
      ev.title.toLowerCase().includes(q) ||
      ev.location.toLowerCase().includes(q) ||
      (ev.tags || []).some(t => t.toLowerCase().includes(q));
    return matchesFilter && matchesQuery;
  });

  renderEvents(filtered);
}

if (searchInput) searchInput.addEventListener("input", applyEventFilters);
if (filterSelect) filterSelect.addEventListener("change", applyEventFilters);

// Initial events render
renderEvents(events);

// =========
// Demo forms (client-side only)
// =========
const visitForm = $("#visitForm");
const visitMsg = $("#visitFormMsg");
if (visitForm) {
  visitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(visitForm);
    const name = fd.get("name")?.toString().trim() || "there";
    if (visitMsg) visitMsg.textContent = `Thanks, ${name}! We’ll be ready to welcome you. (Demo only)`;
    visitForm.reset();
  });
}

const giveForm = $("#giveForm");
const giveMsg = $("#giveMsg");
if (giveForm) {
  giveForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(giveForm);
    const amount = (fd.get("amount") || "").toString().trim() || "0";
    const frequency = (fd.get("frequency") || "").toString();
    if (giveMsg) giveMsg.textContent = `Demo: You selected $${amount} (${frequency}). Replace with your giving provider.`;
  });
}

const contactForm = $("#contactForm");
const contactMsg = $("#contactMsg");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(contactForm);
    const isPrayer = fd.get("prayer") ? " (prayer request)" : "";
    const name = fd.get("name")?.toString().trim() || "Friend";
    if (contactMsg) contactMsg.textContent = `Thanks, ${name}${isPrayer}. We received your message. (Demo only)`;
    contactForm.reset();
  });
}

// =========
// "Add reminder" from hero
// =========
const addReminderBtn = $("#addReminderBtn");
if (addReminderBtn) {
  addReminderBtn.addEventListener("click", () => {
    const title = "Sunday Service — CHURCH_NAME";
    // Default: next Sunday at 10:00 AM local time (simple logic)
    const now = new Date();
    const nextSunday = new Date(now);
    const day = nextSunday.getDay(); // 0=Sunday
    const delta = (7 - day) % 7;     // days until Sunday
    nextSunday.setDate(nextSunday.getDate() + (delta === 0 ? 7 : delta));
    nextSunday.setHours(10, 0, 0, 0);

    const yyyy = nextSunday.getFullYear();
    const mm = pad2(nextSunday.getMonth() + 1);
    const dd = pad2(nextSunday.getDate());

    const ics = buildICS({
      title,
      startDate: `${yyyy}-${mm}-${dd}`,
      startTime: "10:00 AM",
      durationMinutes: 75
    });

    downloadTextFile("service-reminder.ics", ics);
  });
}

// =========
// ICS Calendar Utilities
// =========
function buildICS({ title, startDate, startTime, durationMinutes }) {
  // Very simple local-time ICS (works in most calendar apps)
  // startDate: YYYY-MM-DD
  // startTime: "10:00 AM"
  const dtStart = toICSLocalDateTime(startDate, startTime);
  const dtEnd = addMinutesToICS(dtStart, durationMinutes);

  const uid = `${Date.now()}-${Math.random().toString(16).slice(2)}@church-site`;
  const stamp = toICSStamp(new Date());

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Church Website//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICSText(title)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

function toICSStamp(date) {
  // UTC stamp
  const y = date.getUTCFullYear();
  const m = pad2(date.getUTCMonth() + 1);
  const d = pad2(date.getUTCDate());
  const hh = pad2(date.getUTCHours());
  const mm = pad2(date.getUTCMinutes());
  const ss = pad2(date.getUTCSeconds());
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function toICSLocalDateTime(dateStr, timeStr) {
  // dateStr: YYYY-MM-DD
  // timeStr: "10:00 AM"
  const [y, m, d] = dateStr.split("-").map(Number);
  const { hours24, minutes } = parseTimeTo24h(timeStr);
  const dt = new Date(y, m - 1, d, hours24, minutes, 0, 0);

  const yyyy = dt.getFullYear();
  const mm = pad2(dt.getMonth() + 1);
  const dd = pad2(dt.getDate());
  const hh = pad2(dt.getHours());
  const min = pad2(dt.getMinutes());

  // Local datetime without Z
  return `${yyyy}${mm}${dd}T${hh}${min}00`;
}

function addMinutesToICS(icsDTStart, minutesToAdd) {
  // icsDTStart: YYYYMMDDTHHMMSS (local)
  const y = Number(icsDTStart.slice(0, 4));
  const m = Number(icsDTStart.slice(4, 6));
  const d = Number(icsDTStart.slice(6, 8));
  const hh = Number(icsDTStart.slice(9, 11));
  const mm = Number(icsDTStart.slice(11, 13));

  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  dt.setMinutes(dt.getMinutes() + minutesToAdd);

  const yyyy = dt.getFullYear();
  const month = pad2(dt.getMonth() + 1);
  const day = pad2(dt.getDate());
  const hour = pad2(dt.getHours());
  const min = pad2(dt.getMinutes());

  return `${yyyy}${month}${day}T${hour}${min}00`;
}

function parseTimeTo24h(timeStr) {
  // "10:00 AM" -> {hours24:10, minutes:0}
  const s = timeStr.trim().toUpperCase();
  const match = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return { hours24: 10, minutes: 0 };

  let h = Number(match[1]);
  const m = Number(match[2]);
  const ap = match[3];

  if (ap === "AM") {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return { hours24: h, minutes: m };
}

function escapeICSText(str) {
  return String(str)
    .replaceAll("\\", "\\\\")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;")
    .replaceAll("\n", "\\n");
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
