(() => {
  const chatLog = document.getElementById("chatLog");
  const chatForm = document.getElementById("chatForm");
  const messageInput = document.getElementById("messageInput");
  const mealTypeSelect = document.getElementById("mealType");
  const dietarySelect = document.getElementById("dietaryPreference");
  const skillSelect = document.getElementById("skillLevel");
  const submitButton = document.getElementById("submitButton");
  const clearButton = document.getElementById("clearButton");
  const downloadButton = document.getElementById("downloadButton");
  const toastContainer = document.getElementById("toast");
  const suggestionChips = document.querySelectorAll(".suggestion-chip");

  let conversation = [];

  const renderContent = (container, content) => {
    if (window.marked && window.DOMPurify) {
      container.innerHTML = window.DOMPurify.sanitize(
        window.marked.parse(content)
      );
    } else {
      container.textContent = content;
    }
  };

  const appendMessage = (role, content, options = {}) => {
    const { isLoading = false } = options;
    const message = document.createElement("div");
    message.className = `message ${role}${isLoading ? " loading" : ""}`;
    message.dataset.role = role;
    message.dataset.raw = content || "";

    const meta = document.createElement("div");
    meta.className = "message-meta";
    meta.textContent = role === "assistant" ? "ChatBite" : "You";
    message.appendChild(meta);

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    if (isLoading) {
      const dots = ["", "", ""].map(() => {
        const dot = document.createElement("span");
        dot.className = "dot";
        return dot;
      });
      dots.forEach((dot) => bubble.appendChild(dot));
    } else {
      renderContent(bubble, content);
    }
    message.appendChild(bubble);

    chatLog.appendChild(message);
    chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
    return message;
  };

  const updateMessage = (messageEl, newContent) => {
    if (!messageEl) return;
    const bubble = messageEl.querySelector(".message-bubble");
    if (!bubble) return;
    messageEl.classList.remove("loading");
    messageEl.dataset.raw = newContent;
    bubble.innerHTML = "";
    renderContent(bubble, newContent);
    chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
  };

  const removeMessage = (messageEl) => {
    if (messageEl && messageEl.parentElement) {
      chatLog.removeChild(messageEl);
    }
  };

  const setFormDisabled = (state) => {
    submitButton.disabled = state;
    messageInput.disabled = state;
    mealTypeSelect.disabled = state;
    dietarySelect.disabled = state;
    skillSelect.disabled = state;
  };

  const showToast = (message) => {
    if (!toastContainer) return;
    toastContainer.innerHTML = "";
    const toast = document.createElement("div");
    toast.id = "toastMessage";
    toast.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>${message}</span>
        `;
    toastContainer.appendChild(toast);
    toastContainer.style.opacity = "1";
    setTimeout(() => {
      toastContainer.style.opacity = "0";
    }, 3200);
  };

  const lastAssistantMessage = () => {
    const nodes = Array.from(chatLog.querySelectorAll(".message"));
    for (let i = nodes.length - 1; i >= 0; i -= 1) {
      if (nodes[i].dataset.role === "assistant" && nodes[i].dataset.raw) {
        return nodes[i];
      }
    }
    return null;
  };

  const updateDownloadButton = () => {
    const latest = lastAssistantMessage();
    downloadButton.disabled = !latest;
  };

  const resetChat = () => {
    conversation = [];
    chatLog.innerHTML = "";
    appendMessage(
      "assistant",
      "Fresh start! Share a few ingredients, pick the vibe if you like, and I will craft a recipe you can trust."
    );
    updateDownloadButton();
    messageInput.focus();
  };

  const handleDownload = () => {
    const latest = lastAssistantMessage();
    if (!latest) return;
    const content = latest.dataset.raw || "";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.download = "chatbite-recipe.txt";
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(url);
  };

  suggestionChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const value = chip.dataset.suggestion || "";
      messageInput.value = value;
      messageInput.focus();
    });
  });

  clearButton.addEventListener("click", resetChat);
  downloadButton.addEventListener("click", handleDownload);

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const entry = messageInput.value.trim();
    if (!entry) return;

    const mealChoice = mealTypeSelect.value;
    const dietaryChoice = dietarySelect.value;
    const skillChoice = skillSelect.value;

    appendMessage("user", entry);
    conversation.push({ role: "user", content: entry });
    const userIndex = conversation.length - 1;
    messageInput.value = "";

    const loader = appendMessage("assistant", "", { isLoading: true });
    setFormDisabled(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: entry,
          history: conversation,
          mealType: mealChoice,
          dietaryPreference: dietaryChoice,
          skillLevel: skillChoice,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errMessage =
          errorBody.error || "Something went wrong. Please try again.";
        removeMessage(loader);
        if (userIndex > -1) {
          conversation.splice(userIndex, 1);
        }
        showToast(errMessage);
        return;
      }

      const data = await response.json();
      const reply = (data.reply || "").trim();
      if (!reply) {
        removeMessage(loader);
        if (userIndex > -1) {
          conversation.splice(userIndex, 1);
        }
        showToast("The response was empty. Let's try another combo.");
        return;
      }

      conversation.push({ role: "assistant", content: reply });
      updateMessage(loader, reply);
      updateDownloadButton();
    } catch (error) {
      console.error(error);
      removeMessage(loader);
      if (userIndex > -1) {
        conversation.splice(userIndex, 1);
      }
      showToast("Network hiccup. Check your connection and try again.");
    } finally {
      setFormDisabled(false);
      messageInput.focus();
    }
  });

  resetChat();
  window.resetChat = resetChat;

  document.addEventListener("click", (e) => {
    const el = e.target.closest && e.target.closest("#clearButton");
    if (el) {
      resetChat();
    }
  });
})();
