// forms.js
// Configure this to forward submissions to a server. Leave empty to only store to localStorage.
const backendEndpoint = ""; // e.g. "https://your-server.example.com/api/submit" OR Formspree URL

const STORAGE_KEY = "miraceuticals_submissions";

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (e) {
    console.error("Could not parse stored submissions:", e);
    return [];
  }
}
function writeStored(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function saveSubmission(type, payload) {
  const stored = readStored();
  const item = {
    type,
    timestamp: new Date().toISOString(),
    payload
  };
  stored.push(item);
  writeStored(stored);
  return item;
}

async function sendToBackend(item) {
  if (!backendEndpoint) return null;
  try {
    const res = await fetch(backendEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    return res;
  } catch (err) {
    console.error("Failed to send to backend:", err);
    return null;
  }
}

function showMessage(form, text, isError=false) {
  const msg = form.querySelector(".form-message");
  if (!msg) return;
  msg.style.display = "block";
  msg.textContent = text;
  if (isError) {
    msg.style.background = "#f8d7da";
    msg.style.color = "#721c24";
    msg.style.border = "1px solid #f5c6cb";
  } else {
    msg.style.background = "#dff0d8";
    msg.style.color = "#2b6f2b";
    msg.style.border = "1px solid #c3e6cb";
  }
}

// generic submit handler
async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const type = form.dataset.type || form.id || "form";
  const fd = new FormData(form);
  const data = {};
  for (const [k, v] of fd.entries()) data[k] = v;

  // save locally
  const saved = saveSubmission(type, data);

  // optionally forward to remote backend
  if (backendEndpoint) {
    const res = await sendToBackend(saved);
    if (!res || !res.ok) {
      showMessage(form, "Saved locally, but failed to send to server.", true);
      form.reset();
      return;
    }
  }

  showMessage(form, "Thank you — your submission has been recorded.");
  form.reset();
}

// init: attach handlers for forms we expect
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const orderForm = document.getElementById("orderForm");
  const reportForm = document.getElementById("reportForm");

  if (contactForm) contactForm.addEventListener("submit", handleSubmit);
  if (orderForm) orderForm.addEventListener("submit", handleSubmit);
  if (reportForm) reportForm.addEventListener("submit", handleSubmit);
});


  document.getElementById("contactForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let entries = JSON.parse(localStorage.getItem("contactEntries")) || [];
    entries.push({
      name: document.getElementById("contactName").value,
      email: document.getElementById("contactEmail").value,
      message: document.getElementById("contactMessage").value,
      date: new Date().toLocaleString()
    });

    localStorage.setItem("contactEntries", JSON.stringify(entries));
    alert("Message submitted successfully!");
    this.reset();
  });
