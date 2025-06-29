// Poet data
const poetData = [
  {
    name: "Sarojini Naidu",
    state: "Telangana",
    born: 1879,
    works: ["The Golden Threshold", "The Bird of Time"],
    bio: "Sarojini Naidu, known as the Nightingale of India, was a poet and freedom fighter born in Hyderabad.",
  },
  {
    name: "Rabindranath Tagore",
    state: "West Bengal",
    born: 1861,
    works: ["Gitanjali", "The Home and the World"],
    bio: "Rabindranath Tagore was a Nobel laureate poet, playwright, and philosopher from Bengal.",
  },
  {
    name: "Subramania Bharati",
    state: "Tamil Nadu",
    born: 1882,
    works: ["Kuyil Pattu", "Panchali Sapatham"],
    bio: "Subramania Bharati was a Tamil poet and independence activist known for his patriotic works.",
  },
];

// Quotes
const quotes = [
  "“A country's greatness lies in its undying ideals of love and sacrifice.” — Sarojini Naidu",
  "“Where the mind is without fear and the head is held high.” — Rabindranath Tagore",
  "“The world is full of beauty when the heart is full of love.” — Subramania Bharati",
];

// Chatbot response logic
function getChatbotResponse(message) {
  const msg = message.toLowerCase().trim();

  // Navigation Helper
  if (msg.includes("telangana")) {
    window.location.href = "telangana.html";
    return "Taking you to poets from Telangana!";
  } else if (msg.includes("map")) {
    window.location.href = "/map";
    return "Loading the interactive map for you!";
  } else if (msg.includes("support") || msg.includes("contact") || msg.includes("help")) {
    window.location.href = "/contact";
    return "You can reach out via the Support page. Taking you there now!";
  } else if (msg.includes("home")) {
    window.location.href = "/";
    return "Heading back to the homepage!";
  }

  // Search Poets by Name or State
  const poet = poetData.find(
    (p) => msg.includes(p.name.toLowerCase()) || msg.includes(p.state.toLowerCase())
  );
  if (poet) {
    const poetUrl = poet.name === "Sarojini Naidu" ? "sa.html" : `/poets?name=${encodeURIComponent(poet.name)}`;
    return `${poet.bio}<br>Notable works: ${poet.works.join(", ")}<br><a href='${poetUrl}' class='text-blue-600 hover:underline'>View ${poet.name}'s page</a>`;
  }

  // Poet FAQs
  if (msg.includes("born") && poetData.some((p) => msg.includes(p.name.toLowerCase()))) {
    const poetName = poetData.find((p) => msg.includes(p.name.toLowerCase())).name;
    const poetBorn = poetData.find((p) => msg.includes(p.name.toLowerCase())).born;
    return `${poetName} was born in ${poetBorn}.`;
  }
  if (msg.includes("poems") || msg.includes("works")) {
    const poet = poetData.find((p) => msg.includes(p.name.toLowerCase()));
    if (poet) {
      return `Famous works by ${poet.name}: ${poet.works.join(", ")}.`;
    }
  }

  // Quote of the Day
  if (msg.includes("quote")) {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return randomQuote;
  }

  // Fun Responses
  if (msg.includes("hi") || msg.includes("hello")) {
    return "Hello, poetic soul! Ready to explore India's poets?";
  } else if (msg.includes("how are you")) {
    return "I'm doing rhyme-tastically well! How about you?";
  } else if (msg.includes("awesome")) {
    return "You're the awesome one, my poetic friend!";
  }

  // Who's the Best?
  if (msg.includes("famous") || msg.includes("best")) {
    return "That's hard to say! Rabindranath Tagore is a legend, but every poet is special. Try asking about a specific poet!";
  }

  // Default Response
  return "I'm KaviBot, your poetic guide! Try asking about a poet, state, or say 'quote' for inspiration.";
}

// Typing effect
function typeMessage(text, callback) {
  const messagesDiv = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.className = "p-2 bg-blue-100 rounded-lg mb-2 text-sm";
  messagesDiv.appendChild(messageDiv);

  let i = 0;
  messageDiv.classList.add("typing");
  function type() {
    if (i < text.length) {
      messageDiv.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, 30);
    } else {
      messageDiv.classList.remove("typing");
      if (callback) callback();
    }
  }
  type();
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Send message
function sendMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message) return;

  // Display user message
  const messagesDiv = document.getElementById("chatMessages");
  const userDiv = document.createElement("div");
  userDiv.className = "p-2 bg-gray-200 rounded-lg mb-2 text-sm text-right";
  userDiv.textContent = message;
  messagesDiv.appendChild(userDiv);
  input.value = "";

  // Get and display bot response
  const response = getChatbotResponse(message);
  typeMessage(response, () => {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// Initialize with welcome message
document.addEventListener("DOMContentLoaded", () => {
  typeMessage("Hi! I'm KaviBot, your guide to Indian poets. Ask about a poet, state, or say 'quote' for inspiration!");
});

// Handle Enter key
document.getElementById("chatInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});