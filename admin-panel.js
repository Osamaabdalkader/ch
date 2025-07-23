document.addEventListener('DOMContentLoaded', () => {
    // تهيئة Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyAzYZMxqNmnLMGYnCyiJYPg2MbxZMt0co0",
        authDomain: "osama-91b95.firebaseapp.com",
        databaseURL: "https://osama-91b95-default-rtdb.firebaseio.com",
        projectId: "osama-91b95",
        storageBucket: "osama-91b95.appspot.com",
        messagingSenderId: "118875905722",
        appId: "1:118875905722:web:200bff1bd99db2c1caac83",
        measurementId: "G-LEM5PVPJZC"
    };
    
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const database = firebase.database();

    // التحقق من حالة المستخدم
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'index.html';
        } else {
            // التحقق من أن المستخدم مدير
            database.ref('users/' + user.uid).once('value')
                .then(snapshot => {
                    const userData = snapshot.val();
                    if (userData && userData.role === 'admin') {
                        initAdminPage(user);
                    } else {
                        alert('ليس لديك صلاحية الوصول');
                        auth.signOut();
                    }
                });
        }
    });

    function initAdminPage(adminUser) {
        // عناصر واجهة المستخدم
        const logoutBtn = document.getElementById('logoutBtn');
        const usersList = document.getElementById('usersList');
        const searchUsers = document.getElementById('searchUsers');
        const currentUserName = document.getElementById('currentUserName');
        const messagesContainer = document.getElementById('messagesContainer');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');

        // تسجيل الخروج
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        });

        // تحميل المستخدمين
        database.ref('users').on('value', snapshot => {
            usersList.innerHTML = '';
            snapshot.forEach(child => {
                const userData = child.val();
                if (userData.role === 'user') {
                    const userElement = document.createElement('div');
                    userElement.className = 'user-item';
                    userElement.dataset.userId = child.key;
                    
                    userElement.innerHTML = `
                        <div class="user-name">${userData.name}</div>
                        <div class="user-email">${userData.email}</div>
                    `;
                    
                    userElement.addEventListener('click', () => {
                        document.querySelectorAll('.user-item').forEach(el => el.classList.remove('active'));
                        userElement.classList.add('active');
                        loadMessages(child.key, userData.name);
                    });
                    
                    usersList.appendChild(userElement);
                }
            });
        });

        // إرسال الرسائل
        sendBtn.addEventListener('click', () => {
            const activeUser = document.querySelector('.user-item.active');
            if (!activeUser) return alert('اختر مستخدمًا أولاً');
            
            const userId = activeUser.dataset.userId;
            const content = messageInput.value.trim();
            if (!content) return;
            
            const newMessage = {
                senderId: adminUser.uid,
                receiverId: userId,
                content: content,
                timestamp: Date.now(),
                isRead: false,
                senderRole: 'admin',
                receiverRole: 'user'
            };
            
            database.ref('messages').push().set(newMessage)
                .then(() => {
                    messageInput.value = '';
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                });
        });

        // بحث المستخدمين
        searchUsers.addEventListener('input', () => {
            const term = searchUsers.value.toLowerCase();
            document.querySelectorAll('.user-item').forEach(el => {
                const name = el.querySelector('.user-name').textContent.toLowerCase();
                const email = el.querySelector('.user-email').textContent.toLowerCase();
                el.style.display = (name.includes(term) || email.includes(term) ? 'block' : 'none';
            });
        });

        // تحميل الرسائل
        function loadMessages(userId, userName) {
            currentUserName.textContent = userName;
            messagesContainer.innerHTML = '';
            
            database.ref('messages')
                .orderByChild('timestamp')
                .on('child_added', snapshot => {
                    const message = snapshot.val();
                    
                    if ((message.senderId === adminUser.uid && message.receiverId === userId) || 
                        (message.senderId === userId && message.receiverId === adminUser.uid)) {
                        
                        displayMessage(message, adminUser.uid);
                        
                        if (message.receiverId === adminUser.uid && !message.isRead) {
                            database.ref('messages/' + snapshot.key).update({ isRead: true });
                        }
                    }
                });
        }

        function displayMessage(message, currentUserId) {
            const messageDiv = document.createElement('div');
            messageDiv.className = message.senderId === currentUserId ? 
                'message sent' : 'message received';
            
            messageDiv.innerHTML = `
                <div class="message-content">${message.content}</div>
                <div class="message-time">${formatTime(message.timestamp)}</div>
            `;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function formatTime(timestamp) {
            const date = new Date(timestamp);
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
    }
});