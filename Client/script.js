const API_URL = 'http://localhost:3000/api/chat';
const conversation = [];

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const suggestions = document.getElementById('suggestions');

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function sendSuggestion(text) {
  userInput.value = text;
  suggestions.style.display = 'none';
  sendMessage();
}

function appendMessage(role, text) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('message', role);

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.innerHTML = formatText(text);

  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatText(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

function showTyping() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('message', 'bot', 'typing-wrapper');
  wrapper.id = 'typingIndicator';
  wrapper.innerHTML = `
    <div class="bubble typing">
      <span></span><span></span><span></span>
    </div>`;
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Hide suggestions after first message
  suggestions.style.display = 'none';

  // Show user message
  appendMessage('user', text);
  conversation.push({ role: 'user', text });

  // Clear input
  userInput.value = '';
  userInput.style.height = 'auto';
  sendBtn.disabled = true;

  showTyping();

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    });

    const data = await res.json();
    removeTyping();

    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan pada server.');

    const botText = data.response;
    conversation.push({ role: 'model', text: botText });
    appendMessage('bot', botText);
  } catch (err) {
    removeTyping();
    appendMessage('bot', '⚠️ Maaf, terjadi kesalahan. Silakan coba lagi.');
    console.error(err);
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
}
