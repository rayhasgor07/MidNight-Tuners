// Load or initialize user profile
let userProfile = loadUserProfile();
let pendingSave = null; // holds data Torque wants to save

async function sendMessage() {
  const inputEl = document.getElementById("userInput");
  const outputEl = document.getElementById("chatOutput");
  const text = inputEl.value.trim();

  if (!text) return;

  // Show user message
  outputEl.innerHTML += `<p><strong>You:</strong> ${text}</p>`;
  inputEl.value = "";

  // If user says "yes" and we have pending save data
  if (pendingSave && text.toLowerCase() === "yes") {
    const updated = { ...userProfile, ...pendingSave };
    saveUserProfile(updated);
    userProfile = updated;
    pendingSave = null;

    outputEl.innerHTML += `<p><strong>Torque:</strong> Saved.</p>`;
    outputEl.scrollTop = outputEl.scrollHeight;
    return;
  }

  try {
    const res = await fetch("https://mt-ai-backend-o39v.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        profile: userProfile
      })
    });

    const data = await res.json();

    let agent;
    try {
      agent = JSON.parse(data.reply); // parse JSON agent output
    } catch (e) {
      // fallback if model returns plain text
      outputEl.innerHTML += `<p><strong>Torque:</strong> ${data.reply}</p>`;
      outputEl.scrollTop = outputEl.scrollHeight;
      return;
    }

    // Always show Torque's reply text
    outputEl.innerHTML += `<p><strong>Torque:</strong> ${agent.reply}</p>`;

    // Handle agent actions
    if (agent.type === "action") {

      // Save new profile info
      if (agent.action === "save_profile") {
        pendingSave = agent.data;
        outputEl.innerHTML += `<p><em>Type "yes" to save this to your profile.</em></p>`;
      }

      // Update profile immediately
      if (agent.action === "update_profile") {
        const updated = { ...userProfile, ...agent.data };
        saveUserProfile(updated);
        userProfile = updated;
      }

      // Build multi-step mod plan
      if (agent.action === "build_mod_plan") {
        const steps = agent.data.steps || [];
        let html = "<ul>";
        steps.forEach(step => {
          html += `<li>${step}</li>`;
        });
        html += "</ul>";
        outputEl.innerHTML += html;
      }

      // Ask for missing info
      if (agent.action === "ask_clarification") {
        outputEl.innerHTML += `<p><em>${agent.data.question}</em></p>`;
      }
    }

    outputEl.scrollTop = outputEl.scrollHeight;

  } catch (err) {
    console.error(err);
    outputEl.innerHTML += `<p><strong>Torque:</strong> Error talking to server.</p>`;
  }
}

// Load profile from localStorage
function loadUserProfile() {
  const saved = localStorage.getItem("userProfile");
  if (saved) return JSON.parse(saved);

  const profile = {
    car: null,
    engine: null,
    budget: null,
    goals: null,
    style: null,
    brands: [],
    experience: null,
    modPreferences: []
  };

  localStorage.setItem("userProfile", JSON.stringify(profile));
  return profile;
}

// Save profile to localStorage
function saveUserProfile(profile) {
  localStorage.setItem("userProfile", JSON.stringify(profile));
}