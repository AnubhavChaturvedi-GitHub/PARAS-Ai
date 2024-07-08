document.addEventListener('DOMContentLoaded', () => {
    const newChatButton = document.getElementById('new-chat-button');
    const sendIcon = document.getElementById('send-icon');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const chatTitle = document.getElementById('chat-title');
    const chatList = document.getElementById('chat-list');
    const deleteChatButton = document.getElementById('delete-chat-button');
    const downloadHistoryButton = document.getElementById('download-history-button');
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const closeHelp = document.getElementById('close-help');
    const messageSound = document.getElementById('message-sound');
  
    let chats = {};
    let currentChatId = null;
  
    const createChat = () => {
      currentChatId = `chat-${Date.now()}`;
      chats[currentChatId] = [];
      const chatItem = document.createElement('div');
      chatItem.textContent = 'New Chat';
      chatItem.dataset.chatId = currentChatId;
      chatItem.addEventListener('click', () => switchChat(chatItem.dataset.chatId));
      chatList.appendChild(chatItem);
      switchChat(currentChatId);
    };
  
    const switchChat = (chatId) => {
      currentChatId = chatId;
      chatBox.innerHTML = '';
      const chatName = document.querySelector(`[data-chat-id="${chatId}"]`).textContent;
      chatTitle.textContent = chatName || `Chat ${Object.keys(chats).length}`;
      // chats[currentChatId].forEach(message => {
      //   appendMessage(message.text, message.type, chatBox, message.timestamp);
      // });
    };
  
    const appendMessage = (message, className, container) => {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', className);
      messageElement.textContent = message;
  
      // const timestampElement = document.createElement('span');
      // timestampElement.classList.add('timestamp');
      // timestampElement.textContent = timestamp;
      // messageElement.appendChild(timestampElement);
  
      container.appendChild(messageElement);
      container.scrollTop = container.scrollHeight;
    };
  
    const saveChatHistory = () => {
      localStorage.setItem('chats', JSON.stringify(chats));
    };
  
    const loadChatHistory = () => {
      const savedChats = JSON.parse(localStorage.getItem('chats'));
      if (savedChats) {
        chats = savedChats;
        for (const chatId in chats) {
          const chatItem = document.createElement('div');
          chatItem.textContent = chatId.startsWith('chat-') ? `Chat ${Object.keys(chats).indexOf(chatId) + 1}` : chatId;
          chatItem.dataset.chatId = chatId;
          chatItem.addEventListener('click', () => switchChat(chatId));
          chatList.appendChild(chatItem);
        }
        if (Object.keys(chats).length > 0) {
          switchChat(Object.keys(chats)[0]);
        }
      } else {
        createChat();
      }
    };
  
    const playMessageSound = () => {
      messageSound.currentTime = 0;
      messageSound.play();
    };
  
    const getCurrentTimestamp = () => {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
  
    const fetchBotResponse = (userMessage) => {
      return new Promise((resolve, reject) => {
        fetch('/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 'user-message':   userMessage }),
        })
          .then(response => response.json())
          .then(data => {
            if (data.error) {
              reject(data.error);
            } else {
              resolve(data.response);
            }
          })
          .catch(error => {
            console.error('Error fetching bot response:', error);
            reject(error);
          });
      });
    };
  
    const sendMessage = () => {
      const userMessage = userInput.value.trim();
      if (userMessage && currentChatId) {
        const timestamp = getCurrentTimestamp();
        appendMessage(userMessage, 'user-message', chatBox, timestamp);
        chats[currentChatId].push({ text: userMessage, type: 'user-message', timestamp });
        saveChatHistory();
        userInput.value = '';
        playMessageSound();
  
        // Simulate bot response with animation
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing');
        chatBox.appendChild(typingIndicator);
        chatBox.scrollTop = chatBox.scrollHeight;
  
        fetchBotResponse(userMessage)
          .then(botResponse => {
            setTimeout(() => {
              chatBox.removeChild(typingIndicator);
              appendMessage(botResponse, 'bot-message', chatBox, getCurrentTimestamp());
              chats[currentChatId].push({ text: botResponse, type: 'bot-message', timestamp: getCurrentTimestamp() });
              saveChatHistory();
              playMessageSound();
            }, 1500); // Simulate typing delay
          })
          .catch(() => {
            setTimeout(() => {
              chatBox.removeChild(typingIndicator);
              appendMessage('...', 'bot-message', chatBox, getCurrentTimestamp());
              setTimeout(() => {
                chatBox.removeChild(chatBox.lastChild); // Remove "..." after showing
              }, 1000); // Delay before removing "..."
            }, 1500); // Simulate typing delay
          });
      }
    };
  
    const deleteChatHistory = () => {
      if (currentChatId && confirm('Are you sure you want to delete this chat history?')) {
        delete chats[currentChatId];
        saveChatHistory();
        chatList.innerHTML = '';
        loadChatHistory();
        chatBox.innerHTML = '';
      }
    };
  
    const downloadChatHistory = () => {
      const chatHistory = chats[currentChatId].map(chat => `${chat.type === 'user-message' ? 'Q: ' : 'A: '}${chat.text}`).join('\n');
      const blob = new Blob([chatHistory], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chat_history.txt';
      a.click();
      URL.revokeObjectURL(url);
    };
  
    const toggleHelpModal = () => {
      helpModal.style.display = helpModal.style.display === 'none' ? 'block' : 'none';
    };
  
    newChatButton.addEventListener('click', createChat);
    sendIcon.addEventListener('click', sendMessage);
    deleteChatButton.addEventListener('click', deleteChatHistory);
    downloadHistoryButton.addEventListener('click', downloadChatHistory);
    helpButton.addEventListener('click', toggleHelpModal);
    closeHelp.addEventListener('click', toggleHelpModal);
    userInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        sendMessage();
      }
    });
  
    loadChatHistory();
  });
  