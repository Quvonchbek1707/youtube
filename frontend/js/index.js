const API_BASE_URL = "http://localhost:4445";

const channelsList = document.querySelector(".navbar-list");
const videoList = document.querySelector(".iframes-list");
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#inputSearch");
const toggleBtn = document.querySelector(".toggle-menu");
const sidebar = document.querySelector(".left-menu-wrapper");
const content = document.querySelector(".iframes-wrapper");

function formatVideo(video) {
    const created = new Date(video.created_at);
    const date = created.toISOString().split("T")[0];
    const time = created.toTimeString().split(":").slice(0, 2).join(":");
    const avatarUrl = `${API_BASE_URL}/api/avatar/${video.user?.id}`;
    return `
    <li class="iframe">
        <video src="${API_BASE_URL}/uploads/videos/${video.file_name}" controls></video>
        <div class="iframe-footer">
            <img src="${avatarUrl}" alt="channel-icon" class="online">
            <div class="iframe-footer-text">
                <h2 class="channel-name">${video.user?.username || 'Unknown'}</h2>
                <h3 class="iframe-title">${video.title}</h3>
                <time class="uploaded-time">${date} | ${time}</time>
                <a class="download" href="${API_BASE_URL}/uploads/videos/${video.file_name}" download>
                    <span>${(video.size / 1024 / 1024).toFixed(2)} MB</span>
                    <img src="./img/download.png" alt="download">
                </a>
            </div>
        </div>
    </li>`;
}

async function loadVideos(userId = null, search = null) {
    try {
        let url = `${API_BASE_URL}/api/files`;
        if (userId) url = `${API_BASE_URL}/api/files/user/${userId}`;
        else if (search) url += `?search=${search}`;

        console.log('Loading videos from:', url);
        const response = await axios.get(url);
        console.log('Response:', response.data);

        const videos = response.data.data || response.data;
        console.log('Videos:', videos);

        videoList.innerHTML = videos.length
            ? videos.map(formatVideo).join("")
            : `<h2 style="text-align:center; margin-top:50px;">No videos found</h2>`;

        document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
        if (!userId) document.getElementById('homeButton')?.classList.add('active');
        else document.querySelector(`.channel[data-id="${userId}"]`)?.classList.add('active');
    } catch (err) {
        console.error("Error loading videos:", err);
        console.error("Error response:", err.response?.data);
        videoList.innerHTML = `<h2 style="text-align:center; color:red; margin-top:50px;">Error loading videos: ${err.message}</h2>`;
    }
}

async function loadUsers() {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/users`);
        const users = response.data.data || response.data;
        channelsList.innerHTML = `
        <li id="homeButton" onclick="loadVideos()" class="channel active">🏠 Home</li>
        ${users.map(u => {
            const statusClass = u.socket_id ? 'online' : 'offline';
            return `
            <li class="channel" data-id="${u.id}" data-username="${u.username}" data-avatar="${u.avatar}" onclick="loadVideos(${u.id}); openChat(${u.id}, '${u.username}', '${u.id}')">
                <img src="${API_BASE_URL}/api/avatar/${u.id}" width="30" alt="${u.username}" title="${u.username}" class="${statusClass}">
                <span>${u.username}</span>
            </li>`;
        }).join("")}`;
    } catch (err) {
        console.error("Error loading users:", err);
        channelsList.innerHTML = '<li style="color: red; padding: 10px;">Error loading users</li>';
    }
}

searchForm?.addEventListener("submit", e => {
    e.preventDefault();
    const query = searchInput.value.trim();
    console.log('Searching for:', query);
    loadVideos(null, query);
});

function voice() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        return alert("Voice search is only available in Chrome browser.");
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'uz-UZ';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const voiceBtn = document.querySelector('.voice-search-btn');
    if (voiceBtn) {
        voiceBtn.style.backgroundColor = "#ffcccc";
    }

    recognition.start();
    console.log('Voice recognition started');

    recognition.onresult = e => {
        const transcript = e.results[0][0].transcript;
        console.log('Voice recognized:', transcript);
        searchInput.value = transcript;
        loadVideos(null, transcript);
    };

    recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        if (event.error === 'no-speech') {
            alert('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone access.');
        } else {
            alert('Voice recognition error: ' + event.error);
        }
    };

    recognition.onend = () => {
        console.log('Voice recognition ended');
        if (voiceBtn) {
            voiceBtn.style.backgroundColor = "transparent";
        }
    };
}
window.voice = voice;

toggleBtn?.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    content.classList.toggle("expanded");
});

let socket = null;

function initSocket() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    socket = io(API_BASE_URL, {
        auth: { token }
    });

    socket.on('connect', () => {
        console.log('Connected to socket');
    });

    socket.on('user_status', ({ userId, status }) => {
        const userItem = document.querySelector(`.channel[data-id="${userId}"] img`);
        if (userItem) {
            if (status === 'online') {
                userItem.classList.remove('offline');
                userItem.classList.add('online');
            } else {
                userItem.classList.add('offline');
                userItem.classList.remove('online');
            }
        }
    });

    socket.on('receive_message', (msg) => {
        const isMyMessage = msg.sender_id === getCurrentUserId();
        const isChattingWithSender = currentChatUserId == msg.sender_id;
        const isChattingWithReceiver = currentChatUserId == msg.receiver_id;

        if (isMyMessage || isChattingWithSender) {
            const chat = document.getElementById('chatMessages');
            if (chat) {
                const div = document.createElement('div');
                div.className = isMyMessage ? 'message outgoing' : 'message incoming';
                if (msg.type && msg.type.startsWith('image')) {
                    div.innerHTML = `<img src="${msg.text}" class="message-image">`;
                } else if (msg.type && msg.type.startsWith('video')) {
                    div.innerHTML = `<video controls src="${msg.text}" class="message-video"></video>`;
                } else {
                    div.innerHTML = `<p>${msg.text}</p>`;
                }

                chat.appendChild(div);
                scrollChat();
            }
        }
    });
}

let currentChatUserId = null;
let currentChatUsername = null;
let currentChatAvatar = null;

function openChat(userId, username, avatar) {
    currentChatUserId = userId;
    currentChatUsername = username;
    currentChatAvatar = `${API_BASE_URL}/api/avatar/${userId}`;

    document.querySelector('.chat-name').textContent = username;
    document.querySelector('.chat-avatar').src = currentChatAvatar;

    document.getElementById('chatMessages').innerHTML = '';

    loadChatMessages(userId);

    const chatBox = document.getElementById('chatBox');
    const iframesWrapper = document.querySelector('.iframes-wrapper');
    if (chatBox.classList.contains('minimized')) {
        chatBox.classList.remove('minimized');
        iframesWrapper?.classList.add('with-chat');
    }
}

async function sendMessageToBackend(receiverId, text) {
    try {
        await axios.post(`${API_BASE_URL}/api/messages/send`, {
            receiverId: receiverId,
            content: text,
            type: 'text'
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
    } catch (err) {
        console.error("Error sending message:", err);
        alert("Failed to send message: " + (err.response?.data?.message || err.message));
    }
}
async function loadChatMessages(userId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/messages/chat/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
        });
        const messages = response.data.data || response.data || [];
        const chat = document.getElementById('chatMessages');
        chat.innerHTML = '';

        const myId = getCurrentUserId();

        messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = msg.sender_id === myId ? 'message outgoing' : 'message incoming';

            if (msg.type && msg.type.startsWith('image')) {
                div.innerHTML = `<img src="${msg.content || msg.text}" class="message-image">`;
            } else if (msg.type && msg.type.startsWith('video')) {
                div.innerHTML = `<video controls src="${msg.content || msg.text}" class="message-video"></video>`;
            } else {
                div.innerHTML = `<p>${msg.content || msg.text}</p>`;
            }
            chat.appendChild(div);
        });
        scrollChat();
    } catch (err) {
        console.error("Could not load chat history:", err);
    }
}

function getCurrentUserId() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    } catch {
        return null;
    }
}

function scrollChat() {
    const chat = document.getElementById('chatMessages');
    if (chat) chat.scrollTop = chat.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    if (!currentChatUserId) return alert('Please select a user to chat with');

    const messageText = input.value.trim();

    input.value = '';

    sendMessageToBackend(currentChatUserId, messageText);
}

function addMediaToChat(fileUrl, type) {
    if (socket) {
        socket.emit('send_message', {
            receiverId: currentChatUserId,
            text: fileUrl,
            type: type
        });
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => addMediaToChat(ev.target.result, file.type);
    reader.readAsDataURL(file);
    e.target.value = '';
}

function toggleChatBox() {
    const chatBox = document.getElementById('chatBox');
    const iframesWrapper = document.querySelector('.iframes-wrapper');

    chatBox?.classList.toggle('minimized');

    if (chatBox?.classList.contains('minimized')) {
        iframesWrapper?.classList.remove('with-chat');
    } else {
        iframesWrapper?.classList.add('with-chat');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('chatInput')?.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });
    scrollChat();
    updateUserAvatarInHeader();
    initSocket();
});

function handleUserAvatarClick() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/login';
    } else {
        window.location.href = '/admin';
    }
}

function updateUserAvatarInHeader() {
    const token = localStorage.getItem('accessToken');
    const avatarImg = document.getElementById('userAvatarImg');

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.id;

            avatarImg.src = `${API_BASE_URL}/api/avatar/${userId}`;
        } catch (error) {
            console.error('Invalid token:', error);
        }
    }
}

window.loadVideos = loadVideos;
window.openChat = openChat;
window.sendMessage = sendMessage;
window.handleFileSelect = handleFileSelect;
window.toggleChatBox = toggleChatBox;
window.handleUserAvatarClick = handleUserAvatarClick;

loadUsers();
loadVideos();
