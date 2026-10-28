const API_BASE = "/api";
const grid = document.querySelector("#destination-grid");
const statusEl = document.querySelector("#destination-status");
const searchInput = document.querySelector("#search-input");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const destinationSelect = document.querySelector("#booking-destination");
const bookingForm = document.querySelector("#booking-form");
const bookingStatus = document.querySelector("#booking-status");
const dialog = document.querySelector("#destination-dialog");
const dialogContent = document.querySelector("#dialog-content");
let destinations = [];
let activeCategory = "All";

const artThemes = {
  Mountains: ["#d9e4d7", "#9bb59e", "#4f7860", "#f1d5a5"],
  Beach: ["#dce9e7", "#9fc9c5", "#4f9890", "#f7d9a0"],
  Culture: ["#eadbc9", "#c99d7b", "#956747", "#f0c87f"],
  Nature: ["#e1e5cf", "#a8b68c", "#667e54", "#f0d5a0"]
};
function themeFor(category) {
  const theme = artThemes[category] || artThemes.Nature;
  return `--art-bg:${theme[0]};--art-back:${theme[1]};--art-front:${theme[2]};--art-sun:${theme[3]}`;
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function artMarkup(destination, large = false) {
  return `<div class="${large ? "dialog-art" : "destination-art"}" style="${themeFor(destination.category)}" aria-hidden="true"><span class="art-sun"></span><span class="art-tag">${escapeHTML(destination.category)}</span><span class="art-symbol">✦ &nbsp; EXPLORE</span></div>`;
}
function renderDestinations() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = destinations.filter(d =>
    (activeCategory === "All" || d.category === activeCategory) &&
    `${d.name} ${d.country} ${d.description} ${d.category}`.toLowerCase().includes(term)
  );
  statusEl.textContent = filtered.length ? `${filtered.length} destination${filtered.length === 1 ? "" : "s"} to inspire you` : "No destinations match your search. Try another place or category.";
  grid.innerHTML = filtered.map(d => `
    <article class="destination-card" tabindex="0" role="button" data-id="${escapeHTML(d.id)}" aria-label="View ${escapeHTML(d.name)} details">
      ${artMarkup(d)}
      <div class="card-body">
        <div class="card-topline"><span>${escapeHTML(d.country)}</span><span>${escapeHTML(d.duration_days)} DAYS SUGGESTED</span></div>
        <h3>${escapeHTML(d.name)}</h3>
        <p>${escapeHTML(d.description)}</p>
        <div class="card-bottom"><strong>From ₹${Number(d.price_from).toLocaleString("en-IN")}</strong><button type="button" data-view="${escapeHTML(d.id)}">Discover ↗</button></div>
      </div>
    </article>`).join("");
}
function populateSelect() {
  destinationSelect.innerHTML = '<option value="">Choose a destination</option>' + destinations.map(d =>
    `<option value="${escapeHTML(d.id)}">${escapeHTML(d.name)}, ${escapeHTML(d.country)}</option>`
  ).join("");
}
async function loadDestinations() {
  try {
    const response = await fetch(`${API_BASE}/destinations`);
    if (!response.ok) throw new Error("Could not load destinations.");
    const data = await response.json();
    destinations = data.destinations || [];
    renderDestinations();
    populateSelect();
  } catch (error) {
    statusEl.textContent = "We couldn't load destinations. Please check that the server and Supabase setup are running, then refresh.";
    grid.innerHTML = "";
  }
}
function openDestination(id) {
  const d = destinations.find(item => item.id === id);
  if (!d) return;
  dialogContent.innerHTML = `${artMarkup(d, true)}<div class="dialog-body"><p class="eyebrow">${escapeHTML(d.category)} · ${escapeHTML(d.country)}</p><h2>${escapeHTML(d.name)}</h2><p>${escapeHTML(d.long_description || d.description)}</p><div class="dialog-meta"><div><strong>₹${Number(d.price_from).toLocaleString("en-IN")}</strong>Starting estimate</div><div><strong>${escapeHTML(d.duration_days)} days</strong>Suggested stay</div></div><a class="button button-dark" href="#plan" id="dialog-plan">Plan this trip <span>↗</span></a></div>`;
  if (typeof dialog.showModal === "function") dialog.showModal();
  document.querySelector("#dialog-plan").addEventListener("click", () => {
    destinationSelect.value = d.id;
    dialog.close();
  });
}
grid.addEventListener("click", event => {
  const target = event.target.closest("[data-view], .destination-card");
  if (target) openDestination(target.dataset.view || target.dataset.id);
});
grid.addEventListener("keydown", event => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches(".destination-card")) {
    event.preventDefault();
    openDestination(event.target.dataset.id);
  }
});
document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
searchInput.addEventListener("input", renderDestinations);
filterButtons.forEach(button => button.addEventListener("click", () => {
  activeCategory = button.dataset.category;
  filterButtons.forEach(b => b.classList.toggle("active", b === button));
  renderDestinations();
}));
const today = new Date();
document.querySelector("#travel-date").min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
bookingForm.addEventListener("submit", async event => {
  event.preventDefault();
  bookingStatus.className = "form-status";
  bookingStatus.textContent = "Sending your request…";
  const formData = new FormData(bookingForm);
  const payload = Object.fromEntries(formData.entries());
  payload.travellers = Number(payload.travellers);
  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Your request could not be sent.");
    bookingStatus.classList.add("success");
    bookingStatus.textContent = `Thank you! Your trip request reference is ${result.booking.reference}. We’ll be in touch.`;
    bookingForm.reset();
    document.querySelector("#travel-date").min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  } catch (error) {
    bookingStatus.classList.add("error");
    bookingStatus.textContent = error.message || "Something went wrong. Please try again.";
  }
});
document.querySelector("#year").textContent = new Date().getFullYear();
loadDestinations();
