document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const messageContainer = document.getElementById('message-container');
    const currentUserElement = document.getElementById('current-user');
    const logoutBtn = document.getElementById('logout-btn');

    const jwt = localStorage.getItem('jwt');
    const username = localStorage.getItem('username');

    if (!jwt || !username) {
        window.location.href = 'index.html';
        return;
    }

    currentUserElement.textContent = username;

    let stompClient = null;
    let currentChannel = 'general';
    let currentSubscription = null;

    function connect() {
        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnected, onError);
    }

    function onConnected() {
        // Subscribe to Public Topic for Online Users
        stompClient.subscribe('/topic/online', onOnlineUsersReceived);

        // Subscribe to current channel
        subscribeToChannel(currentChannel);
    }

    function subscribeToChannel(channel) {
        if (currentSubscription) {
            currentSubscription.unsubscribe();
        }
        currentSubscription = stompClient.subscribe(`/topic/${channel}`, onMessageReceived);

        // Notify server of join (optional, maybe specific to channel)
        stompClient.send("/app/chat.addUser",
            {},
            JSON.stringify({ sender: username, type: 'JOIN', channel: channel })
        );

        loadHistory(channel);
    }

    function onError(error) {
        console.log('Could not connect to WebSocket server. Please refresh this page to try again!');
    }

    function sendMessage(event) {
        event.preventDefault();
        const messageContent = messageInput.value.trim();

        if (messageContent && stompClient) {
            const chatMessage = {
                sender: username,
                content: messageInput.value,
                type: 'CHAT',
                channel: currentChannel
            };

            stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
            messageInput.value = '';
        }
    }

    function onMessageReceived(payload) {
        const message = JSON.parse(payload.body);

        // Ignore JOIN/LEAVE messages for chat area, or show system message
        if (message.type === 'JOIN' || message.type === 'LEAVE') {
            return;
        }

        displayMessage(message);
    }

    function onOnlineUsersReceived(payload) {
        const message = JSON.parse(payload.body);
        if (message.type === 'USER_LIST') {
            updateOnlineUsers(message.users);
        }
    }

    function updateOnlineUsers(users) {
        const userListElement = document.getElementById('online-users-list');
        userListElement.innerHTML = '';

        users.forEach(user => {
            const li = document.createElement('li');
            li.style.padding = '5px 0';
            li.style.display = 'flex';
            li.style.alignItems = 'center';

            const statusDot = document.createElement('span');
            statusDot.style.height = '8px';
            statusDot.style.width = '8px';
            statusDot.style.backgroundColor = '#3ba55c'; // Green
            statusDot.style.borderRadius = '50%';
            statusDot.style.display = 'inline-block';
            statusDot.style.marginRight = '8px';

            const usernameSpan = document.createElement('span');
            usernameSpan.textContent = user;
            usernameSpan.style.color = '#dcddde';

            li.appendChild(statusDot);
            li.appendChild(usernameSpan);
            userListElement.appendChild(li);
        });
    }

    function displayMessage(message) {
        // Prevent duplicates based on Message ID
        if (message.id && document.querySelector(`.message[data-id="${message.id}"]`)) {
            return;
        }

        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        if (message.id) {
            messageElement.setAttribute('data-id', message.id);
        }

        if (message.sender === username) {
            messageElement.classList.add('self');
        } else {
            messageElement.classList.add('other');
        }

        const avatarElement = document.createElement('div');
        avatarElement.classList.add('message-avatar');
        // avatarElement.style.backgroundColor = getAvatarColor(message.sender);

        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('message-content-wrapper');

        const headerElement = document.createElement('div');
        headerElement.classList.add('message-header');

        const usernameElement = document.createElement('span');
        usernameElement.classList.add('message-username');
        usernameElement.textContent = message.sender;

        const timeElement = document.createElement('span');
        timeElement.classList.add('message-timestamp');
        const date = message.timestamp ? new Date(message.timestamp) : new Date();
        timeElement.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const textElement = document.createElement('div');
        textElement.classList.add('message-text');
        textElement.textContent = message.content;

        headerElement.appendChild(usernameElement);
        headerElement.appendChild(timeElement);

        contentWrapper.appendChild(headerElement);
        contentWrapper.appendChild(textElement);

        messageElement.appendChild(avatarElement);
        messageElement.appendChild(contentWrapper);

        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    async function loadHistory(channel) {
        messageContainer.innerHTML = ''; // Clear previous messages
        try {
            const response = await fetch(`/api/messages?channel=${channel}`, {
                headers: {
                    'Authorization': 'Bearer ' + jwt
                }
            });
            if (response.ok) {
                const messages = await response.json();
                messages.forEach(displayMessage);
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }

    // Channel Switching Logic
    document.querySelectorAll('.channel').forEach(channelElem => {
        channelElem.addEventListener('click', () => {
            // Update UI
            document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
            channelElem.classList.add('active');

            const newChannel = channelElem.getAttribute('data-channel');
            if (newChannel !== currentChannel) {
                currentChannel = newChannel;

                // Update Header and Placeholder
                document.querySelector('.chat-header').innerHTML = `<span style="color: #72767d; margin-right: 5px;">#</span> ${currentChannel}`;
                document.getElementById('message-input').placeholder = `Message #${currentChannel}`;

                loadHistory(currentChannel);
                subscribeToChannel(currentChannel);
            }
        });
    });

    messageForm.addEventListener('submit', sendMessage);

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    });

    connect();
});
