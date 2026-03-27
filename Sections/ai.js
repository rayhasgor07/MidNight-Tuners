async function sendMessage() {
  const inputEl = document.getElementById("userInput");
  const outputEl = document.getElementById("chatOutput");
  const text = inputEl.value.trim();

  if (!text) return;

  // Show user message
  outputEl.innerHTML += `<p><strong>You:</strong> ${text}</p>`;
  inputEl.value = "";

  try {
    const res = await fetch("https://mt-ai-backend-o39v.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text
      })
    });

    const data = await res.json();

    // Show Torque's reply
    outputEl.innerHTML += `<p><strong>Torque:</strong> ${data.reply}</p>`;
    outputEl.scrollTop = outputEl.scrollHeight;

  } catch (err) {
    console.error(err);
    outputEl.innerHTML += `<p><strong>Torque:</strong> Error talking to server.</p>`;
  }
}