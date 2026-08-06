const SERIES_WEBHOOKS = {
  "Hypershifted Saga": "https://discord.com/api/webhooks/1535052135425773649/jKEtvw82Yb5J6vvSZEa7nHsFRInBYUPcFqkgioGP0svDed7zrBJNf0k8vC7eu-YdLFOz",
  "Carnage Saga": "https://discord.com/api/webhooks/1535052313243426816/0X4EXGTnEZnG8jxepikkUAfGd9fuP1z-Nn3gxA_Jb5eQqEJt6SL-uVeqCgBOz2p8ihQA",
  "Shifted Saga": "https://discord.com/api/webhooks/1535052379907559576/LyDf2yxPXeI_uD275rqLl9AnPUm8ZIrshdxqy5APJ7sqXiOEa5vLe58Em3yi2OZmWkV0",
  "Anti Shifted Saga": "https://discord.com/api/webhooks/1535052620522328117/THVQSBhh6Y4cCnNCnzoH8r6d_mNyxrer8pjmjbrpVFzpngIAiFJMq3DDbaOnxAmxTylu",
  "Treatment Troubles": "https://discord.com/api/webhooks/1535052698095853722/PLQDEUu-1ALLW2szA4oGuLSOX-0MLJyRlyGS-GJnAU0-3QW7_ldg1lcJvUPwfPFV5TBR",
  "Betters and Losses": "https://discord.com/api/webhooks/1535052860717277224/e8BjtNywEyHWIHPlvKSxCdM9cvhSV_XlX88mp6A8m9enUjsOJxY9BUM5GVUTs8qExvdg",
  "The Acolytes vs the Apocalypse": "https://discord.com/api/webhooks/1535052943638790326/3uu3SaVqrtRIltBVVDrO3z0cxjdnAPFxo7PtnXV7P-4cWUzY86EHQeFgUqNrrz9stFm9",
  "Rareshifted Saga": "https://discord.com/api/webhooks/1535053401790877746/Mg6wERsL8BNI4tRo1g2tAj-ooAMxR0oRc8GwYKjIY58-BrGFtTyLLuCMhYLYfDoOkK8f",
};
const modalOverlay = document.getElementById("modalOverlay");
const seriesPicker = document.querySelector(".series-picker");
const seriesToggle = document.getElementById("seriesSelectToggle");
const seriesLabel = document.getElementById("seriesSelectLabel");
const seriesOptions = document.getElementById("seriesOptions");
const hiddenSeriesSelect = document.getElementById("songSeries");

function resetSeriesPicker() {
  hiddenSeriesSelect.value = "";
  seriesLabel.textContent = "Choose a series";
  seriesToggle.setAttribute("aria-expanded", "false");
  seriesOptions.hidden = true;
}

function toggleSeriesOptions(isOpen) {
  const shouldOpen = typeof isOpen === "boolean" ? isOpen : seriesOptions.hidden;
  seriesOptions.hidden = !shouldOpen;
  seriesToggle.setAttribute("aria-expanded", String(shouldOpen));
}

seriesToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleSeriesOptions(true);
});

seriesOptions.querySelectorAll(".series-option").forEach((optionButton) => {
  optionButton.addEventListener("click", (event) => {
    event.stopPropagation();
    hiddenSeriesSelect.value = optionButton.dataset.value;
    seriesLabel.textContent = optionButton.textContent.trim();
    toggleSeriesOptions(false);
  });
});

document.addEventListener("click", (event) => {
  if (seriesPicker && !seriesPicker.contains(event.target)) {
    toggleSeriesOptions(false);
  }
});
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
  resetSeriesPicker();
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
  statusMessage.hidden = true;
}

function showStatus(message, isSuccess, closeModalAfter = false) {
  if (closeModalAfter) {
    setModalVisibility(false);
    form.reset();
  }

  statusMessage.hidden = false;
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${isSuccess ? "success" : "error"}`;
  statusMessage.style.opacity = "1";

  window.clearTimeout(showStatus.timeoutId);
  showStatus.timeoutId = window.setTimeout(() => {
    statusMessage.textContent = "";
    statusMessage.className = "status-message";
    statusMessage.hidden = true;
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
  if (event.key === "Escape") {
    if (!modalOverlay.hidden) {
      closeModal();
    } else if (!seriesOptions.hidden) {
      toggleSeriesOptions(false);
    }
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
    showStatus("Please enter a valid URL beginning with http:// or https:// and it ends with a valid domain (e.g., .com).", false);
    return;
  }

  if (!songSeries) {
    showStatus("Please select a series before sending.", false);
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
  const webhookUrl = SERIES_WEBHOOKS[songSeries];

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
    const response = await fetch(webhookUrl, {
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
