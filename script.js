const WEBHOOK_URL = "https://discord.com/api/webhooks/1534691470320205927/WVL1mCehN3shwuOBwfDWr6uGeP1cH0LGy-r4-wgVmuXT21BtUXLhWkpbe1XvPzQlJMVE";
const modalOverlay = document.getElementById("modalOverlay");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");
const form = document.getElementById("submissionForm");
const statusMessage = document.getElementById("formStatus");

setModalVisibility(false);

function setModalVisibility(isVisible) {
  modalOverlay.hidden = !isVisible;
  modalOverlay.style.display = isVisible ? "grid" : "none";
  modalOverlay.setAttribute("aria-hidden", String(!isVisible));
  document.body.classList.toggle("modal-open", isVisible);
}

function openModal(event) {
  if (event) {
    event.preventDefault();
  }

  setModalVisibility(true);
  document.getElementById("songLink").focus();
}

function closeModal(event) {
  if (event) {
    event.preventDefault();
  }

  setModalVisibility(false);
  form.reset();
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
}

function showStatus(message, isSuccess, closeModalAfter = false) {
  if (closeModalAfter) {
    setModalVisibility(false);
    form.reset();
  }

  statusMessage.textContent = message;
  statusMessage.className = `status-message ${isSuccess ? "success" : "error"}`;

  window.clearTimeout(showStatus.timeoutId);
  showStatus.timeoutId = window.setTimeout(() => {
    statusMessage.textContent = "";
    statusMessage.className = "status-message";
  }, 5000);
}

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  closeModal(event);
});

modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    closeModal(event);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalOverlay.hidden) {
    closeModal();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const songLink = formData.get("songLink").toString().trim();
  const songTitle = formData.get("songTitle").toString().trim();
  const songDescription = formData.get("songDescription").toString().trim();
  const songSeries = formData.get("songSeries").toString().trim();
  const pingEveryone = formData.get("pingEveryone") === "yes";

  if (!songLink || !songTitle || !songDescription) {
    showStatus("Please complete the required fields before sending.", false);
    return;
  }

  if (!isValidUrl(songLink)) {
    showStatus("Please enter a valid URL beginning with http:// or https://and it ends with a valid domain (e.g., .com).", false);
    return;
  }

  showStatus("Sending your submission...", true);

  const embedFields = [];
  if (songSeries) {
    embedFields.push({
      name: "Series",
      value: songSeries,
      inline: true,
    });
  }

  const content = pingEveryone ? `@everyone ${songLink}` : songLink;

  const payload = {
    username: "A world of tunes website",
    content,
    embeds: [
      {
        title: songTitle,
        description: songDescription,
        color: 0x6d7cff,
        fields: embedFields,
        footer: {
          text: "Submitted via A world of tunes publishing site",
        },
      },
    ],
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord responded with status ${response.status}`);
    }

    showStatus("Posted Successfully", true, true);
  } catch (error) {
    console.error(error);
    showStatus("Could not Post", false, true);
  }
});
