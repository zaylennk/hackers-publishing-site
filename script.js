const WEBHOOK_URL = "https://discord.com/api/webhooks/1534691470320205927/WVL1mCehN3shwuOBwfDWr6uGeP1cH0LGy-r4-wgVmuXT21BtUXLhWkpbe1XvPzQlJMVE";
const modalOverlay = document.getElementById("modalOverlay");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");
const form = document.getElementById("submissionForm");
const statusMessage = document.getElementById("formStatus");

function openModal(event) {
  if (event) {
    event.preventDefault();
  }

  modalOverlay.hidden = false;
  modalOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.getElementById("songLink").focus();
}

function closeModal(event) {
  if (event) {
    event.preventDefault();
  }

  modalOverlay.hidden = true;
  modalOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  form.reset();
  statusMessage.textContent = "";
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

  if (!songLink || !songTitle || !songDescription || !songSeries) {
    statusMessage.textContent = "Please complete every field before sending.";
    return;
  }

  statusMessage.textContent = "Sending your submission...";

  const payload = {
    username: "A world of tunes website",
    content: `New song submission link: ${songLink}`,
    embeds: [
      {
        title: songTitle,
        description: songDescription,
        color: 0x6d7cff,
        fields: [
          {
            name: "Series",
            value: songSeries,
            inline: true,
          },
        ],
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

    statusMessage.textContent = "Submission sent successfully.";
    form.reset();
    setTimeout(closeModal, 900);
  } catch (error) {
    console.error(error);
    statusMessage.textContent = `Unable to send the submission. ${error.message}`;
  }
});
