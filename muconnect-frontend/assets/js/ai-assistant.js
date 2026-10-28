// Muconnect AI Assistant Frontend Logic
// Connected to express backend -> Groq API

const BACKEND_URL = 'http://localhost:5000'; // Replace with your Render URL when deployed

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('aiToggleBtn');
  const closeBtn = document.getElementById('closeAiBtn');
  const chatBox = document.getElementById('aiChatBox');
  const aiForm = document.getElementById('aiForm');
  const aiInput = document.getElementById('aiInput');
  const aiMessages = document.getElementById('aiMessages');

  if (!toggleBtn || !chatBox) return;

  // Toggle chat window
  toggleBtn.addEventListener('click', () => {
    chatBox.style.display = chatBox.style.display === 'none' ? 'flex' : 'none';
  });

  closeBtn.addEventListener('click', () => {
    chatBox.style.display = 'none';
  });

  // Handle send message
  aiForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = aiInput.value.trim();
    if (!userText) return;

    // Append user message
    appendMessage(userText, 'user');
    aiInput.value = '';

    // Append loading indicator
    const loadingId = appendMessage('Thinking...', 'ai');

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      const data = await response.json();
      const loadingEl = document.getElementById(loadingId);
      
      if (response.ok && data.reply) {
        loadingEl.textContent = data.reply;
      } else {
        loadingEl.textContent = 'AI is temporarily unavailable. Try standard marketplace search!';
      }
    } catch (err) {
      console.error('AI Request Error:', err);
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.textContent = 'Network error. Make sure backend is running!';
    }
  });

  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    const msgId = 'msg-' + Date.now();
    msgDiv.id = msgId;
    msgDiv.style.padding = '0.6rem 0.8rem';
    msgDiv.style.borderRadius = '8px';
    msgDiv.style.maxWidth = '85%';
    
    if (sender === 'user') {
      msgDiv.style.backgroundColor = 'var(--accent)';
      msgDiv.style.color = 'white';
      msgDiv.style.alignSelf = 'flex-end';
    } else {
      msgDiv.style.backgroundColor = 'var(--bg-color)';
      msgDiv.style.border = '1px solid var(--border)';
      msgDiv.style.alignSelf = 'flex-start';
    }
    
    msgDiv.textContent = text;
    aiMessages.appendChild(msgDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;
    return msgId;
  }
});
