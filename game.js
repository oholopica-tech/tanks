// ===== FIREBASE =====
const firebaseConfig = {
    apiKey: "AIzaSyD-TRbEO2NWx-UYzstFdqp4EeaSC1sBkvc",
    authDomain: "tanks-blitz-online.firebaseapp.com",
    databaseURL: "https://tanks-blitz-online-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tanks-blitz-online",
    storageBucket: "tanks-blitz-online.firebasestorage.app",
    messagingSenderId: "88253923419",
    appId: "1:88253923419:web:b83f36019eb1f4b1dabf7e"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

let currentUser = null;
let currentUserData = null;
let isGameReady = false;
let audioContext = null;
let musicGain = null;
let isMusicPlaying = false;
let musicInterval = null;
let frameCount = 0;
let lastFpsUpdate = 0;
let currentFps = 0;
let fpsLimit = 60;
let animationId = null;
let lastFrameTime = 0;

// ===== ПРОВЕРКА ИНТЕРНЕТА =====
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
    isOnline = true;
    console.log('✅ Интернет подключён');
    checkFirebaseConnection();
});

window.addEventListener('offline', () => {
    isOnline = false;
    alert('❌ Нет подключения к интернету! Игра требует онлайн-соединения.');
    showOfflineOverlay();
});

function checkFirebaseConnection() {
    database.ref('.info/connected').on('value', (snap) => {
        if (snap.val() === true) {
            console.log('✅ Firebase подключён');
            isOnline = true;
            hideOfflineOverlay();
        } else {
            console.log('❌ Firebase отключён');
            isOnline = false;
            showOfflineOverlay();
        }
    });
}

function showOfflineOverlay() {
    let overlay = document.getElementById('offlineOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'offlineOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #fff;
            backdrop-filter: blur(10px);
        `;
        overlay.innerHTML = `
            <div style="font-size:64px;margin-bottom:20px;">📡</div>
            <div style="font-size:24px;font-weight:bold;color:#ff6b6b;">НЕТ ИНТЕРНЕТА</div>
            <div style="color:#8899bb;font-size:14px;margin-top:8px;">Для игры требуется подключение к интернету</div>
            <button onclick="location.reload()" style="margin-top:20px;padding:10px 30px;background:linear-gradient(135deg,#ffd700,#f0a500);border:none;border-radius:8px;color:#000;font-weight:bold;font-size:16px;cursor:pointer;">🔄 ПЕРЕЗАГРУЗИТЬ</button>
        `;
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

function hideOfflineOverlay() {
    const overlay = document.getElementById('offlineOverlay');
    if (overlay) overlay.style.display = 'none';
}

// ===== МУЗЫКА =====
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        musicGain = audioContext.createGain();
        musicGain.gain.value = 0.25;
        musicGain.connect(audioContext.destination);
        return true;
    } catch(e) {
        console.log('Audio not supported');
        return false;
    }
}

function playBackgroundMusic() {
    if (!audioContext) {
        if (!initAudio()) return;
    }
    if (isMusicPlaying) return;
    
    try {
        const startTime = audioContext.currentTime + 0.3;
        let timeOffset = 0;
        
        const melody = [
            { freq: 185, dur: 0.6, vol: 0.12 },
            { freq: 220, dur: 0.4, vol: 0.10 },
            { freq: 277, dur: 0.6, vol: 0.14 },
            { freq: 330, dur: 0.4, vol: 0.12 },
            { freq: 370, dur: 0.8, vol: 0.15 },
            { freq: 330, dur: 0.4, vol: 0.10 },
            { freq: 277, dur: 0.6, vol: 0.12 },
            { freq: 330, dur: 0.4, vol: 0.10 },
            { freq: 370, dur: 0.8, vol: 0.15 },
            { freq: 415, dur: 0.6, vol: 0.14 },
            { freq: 370, dur: 0.4, vol: 0.10 },
            { freq: 330, dur: 0.8, vol: 0.12 },
            { freq: 277, dur: 0.6, vol: 0.10 },
            { freq: 330, dur: 0.4, vol: 0.12 },
            { freq: 370, dur: 0.8, vol: 0.15 },
            { freq: 415, dur: 0.6, vol: 0.14 },
            { freq: 440, dur: 0.8, vol: 0.16 },
            { freq: 415, dur: 0.4, vol: 0.12 },
            { freq: 370, dur: 0.6, vol: 0.14 },
            { freq: 330, dur: 0.8, vol: 0.12 },
            { freq: 220, dur: 0.4, vol: 0.14 },
            { freq: 277, dur: 0.4, vol: 0.12 },
            { freq: 330, dur: 0.6, vol: 0.16 },
            { freq: 370, dur: 0.4, vol: 0.14 },
            { freq: 415, dur: 0.6, vol: 0.15 },
            { freq: 440, dur: 0.4, vol: 0.14 },
            { freq: 370, dur: 0.6, vol: 0.12 },
            { freq: 330, dur: 0.4, vol: 0.10 },
            { freq: 277, dur: 0.6, vol: 0.12 },
            { freq: 220, dur: 0.8, vol: 0.14 },
            { freq: 277, dur: 0.6, vol: 0.12 },
            { freq: 330, dur: 0.4, vol: 0.10 },
            { freq: 370, dur: 0.8, vol: 0.16 },
            { freq: 415, dur: 0.6, vol: 0.14 },
            { freq: 440, dur: 0.8, vol: 0.18 },
            { freq: 494, dur: 0.6, vol: 0.16 },
            { freq: 440, dur: 0.4, vol: 0.14 },
            { freq: 370, dur: 0.8, vol: 0.15 },
            { freq: 330, dur: 0.6, vol: 0.12 },
            { freq: 277, dur: 0.8, vol: 0.14 },
        ];
        
        const bassLine = [
            { freq: 82, dur: 1.2, vol: 0.08 },
            { freq: 82, dur: 0.8, vol: 0.06 },
            { freq: 92, dur: 1.2, vol: 0.08 },
            { freq: 92, dur: 0.8, vol: 0.06 },
            { freq: 110, dur: 1.2, vol: 0.10 },
            { freq: 110, dur: 0.8, vol: 0.08 },
            { freq: 138, dur: 1.2, vol: 0.10 },
            { freq: 138, dur: 0.8, vol: 0.08 },
            { freq: 110, dur: 1.2, vol: 0.10 },
            { freq: 110, dur: 0.8, vol: 0.08 },
            { freq: 92, dur: 1.2, vol: 0.08 },
            { freq: 92, dur: 0.8, vol: 0.06 },
            { freq: 82, dur: 1.2, vol: 0.08 },
            { freq: 82, dur: 0.8, vol: 0.06 },
        ];
        
        function playMelody() {
            if (!isMusicPlaying) return;
            
            let currentTime = startTime + timeOffset;
            
            melody.forEach((note) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                osc.type = Math.random() > 0.5 ? 'sawtooth' : 'square';
                osc.frequency.value = note.freq;
                
                gain.gain.setValueAtTime(note.vol * 0.5, currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, currentTime + note.dur);
                
                osc.connect(gain);
                gain.connect(musicGain);
                
                osc.start(currentTime);
                osc.stop(currentTime + note.dur + 0.05);
                
                currentTime += note.dur;
            });
            
            bassLine.forEach((note) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                osc.type = 'square';
                osc.frequency.value = note.freq;
                
                gain.gain.setValueAtTime(note.vol * 0.5, currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, currentTime + note.dur);
                
                osc.connect(gain);
                gain.connect(musicGain);
                
                osc.start(currentTime);
                osc.stop(currentTime + note.dur + 0.05);
                
                currentTime += note.dur;
            });
            
            timeOffset += melody.reduce((acc, n) => acc + n.dur, 0) + bassLine.reduce((acc, n) => acc + n.dur, 0);
            
            musicInterval = setTimeout(() => {
                if (isMusicPlaying) {
                    playMelody();
                }
            }, 2000);
        }
        
        isMusicPlaying = true;
        playMelody();
        
    } catch(e) {
        console.log('Music error:', e);
        isMusicPlaying = false;
    }
}

function toggleMusic() {
    if (isMusicPlaying) {
        isMusicPlaying = false;
        if (musicInterval) {
            clearTimeout(musicInterval);
            musicInterval = null;
        }
        document.getElementById('musicToggleBtnTop').textContent = '🔇';
        if (audioContext) {
            audioContext.close().then(() => {
                audioContext = null;
                initAudio();
            });
        }
    } else {
        document.getElementById('musicToggleBtnTop').textContent = '🔊';
        playBackgroundMusic();
    }
}

// ===== ЭТАПЫ ЗАГРУЗКИ =====
const loadingStages = [
    { text: 'Запуск игры...', duration: 3000 },
    { text: 'Проверка данных...', duration: 4000 },
    { text: 'Загрузка данных пользователя...', duration: 5000 }
];

const loadingStagesPostLogin = [
    { text: 'Загрузка танков...', duration: 6000 },
    { text: 'Загрузка магазина...', duration: 4000 },
    { text: 'Загрузка кланов...', duration: 3000 },
    { text: 'Загрузка чата...', duration: 3000 },
    { text: 'Загрузка статистики...', duration: 3000 },
    { text: 'Загрузка профиля...', duration: 3000 }
];

// ===== ЗАГРУЗКА ПРИ ЗАПУСКЕ =====
document.addEventListener('DOMContentLoaded', function() {
    if (!navigator.onLine) {
        showOfflineOverlay();
        return;
    }
    checkFirebaseConnection();
    startInitialLoading();
    
    // ===== ОБРАБОТЧИКИ КНОПОК =====
    
    // Кнопка хранилища
    document.getElementById('storageBtn').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showNotification('📦 Хранилище в разработке');
        document.querySelectorAll('.left-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
    
    // Кнопка чата (открывает полноэкранный чат)
    document.getElementById('chatMenuBtn').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleChatFullscreen();
        document.querySelectorAll('.left-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
    
    // Кнопка настроек
    document.getElementById('settingsMenuBtn').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSettings();
        document.querySelectorAll('.left-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
    
    // Кнопка новостей
    document.getElementById('newsBtn').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleNews();
        document.querySelectorAll('.left-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
    
    // Закрытие настроек
    document.getElementById('settingsCloseBtn').addEventListener('click', toggleSettings);
    
    // Закрытие новостей
    document.getElementById('newsCloseBtn').addEventListener('click', toggleNews);
    
    // Смена пароля
    document.getElementById('changePasswordBtn').addEventListener('click', changePassword);
    
    // Активация промо-кода
    document.getElementById('activatePromoBtn').addEventListener('click', activatePromoCode);
    
    // Применить разрешение
    document.getElementById('applyResolutionBtn').addEventListener('click', applyResolution);
    
    // Применить все настройки
    document.getElementById('applySettingsBtn').addEventListener('click', applyAllSettings);
    
    // Кнопка музыки
    const musicBtn = document.getElementById('musicToggleBtnTop');
    if (musicBtn) {
        musicBtn.addEventListener('click', toggleMusic);
    }
    
    // Кнопка статистики (открывает полноэкранную статистику)
    document.getElementById('statsToggleBtn').addEventListener('click', toggleStatsFullscreen);
    
    // Кнопки полноэкранной статистики
    document.getElementById('statsBackBtn').addEventListener('click', toggleStatsFullscreen);
    document.getElementById('statsFullscreenClose').addEventListener('click', toggleStatsFullscreen);
    
    // Кнопка фонов
    document.getElementById('wallpapersBtn').addEventListener('click', toggleWallpapers);
    document.getElementById('galleryCloseBtn').addEventListener('click', toggleWallpapers);
    document.querySelectorAll('.wallpaper-item').forEach(function(item) {
        item.addEventListener('click', function() {
            changeStatsBg(this.dataset.bg);
        });
    });
    
    // Кнопка боя
    document.getElementById('battleBtn').addEventListener('click', startBattle);
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    
    // Вход и регистрация
    document.getElementById('loginBtn').addEventListener('click', loginWithFirebase);
    document.getElementById('registerBtn').addEventListener('click', function() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('registerScreen').style.display = 'flex';
    });
    document.getElementById('registerBtn2').addEventListener('click', registerWithFirebase);
    document.getElementById('backToLoginBtn').addEventListener('click', function() {
        document.getElementById('registerScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
    });
    document.getElementById('forgotBtn').addEventListener('click', function() {
        alert('🔑 Для восстановления пароля обратитесь в поддержку');
    });
    
    // Выход
    document.getElementById('logoutBtn').addEventListener('click', logoutUser);
    document.getElementById('logoutBtnFull').addEventListener('click', logoutUser);
    
    // Чат (полноэкранный)
    document.getElementById('chatBackBtn').addEventListener('click', toggleChatFullscreen);
    document.getElementById('chatFullscreenClose').addEventListener('click', toggleChatFullscreen);
    document.getElementById('chatFullSendBtn').addEventListener('click', sendChatFullMessage);
    document.getElementById('chatFullInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') sendChatFullMessage();
    });
    
    // Поиск друзей
    document.getElementById('friendSearchBtn').addEventListener('click', searchFriendsFull);
    document.getElementById('friendSearchInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') searchFriendsFull();
    });
    
    // Подписка на новости
    initNewsListener();
});

function startInitialLoading() {
    const progress = document.getElementById('loadingProgress');
    const subtitle = document.querySelector('.loading-subtitle');
    const tanksText = document.querySelector('.loading-tanks');
    let currentStage = 0;
    let totalProgress = 0;

    function nextStage() {
        if (currentStage < loadingStages.length) {
            const stage = loadingStages[currentStage];
            subtitle.textContent = stage.text;
            const increment = 100 / loadingStages.length;
            const steps = 20;
            let step = 0;
            const interval = setInterval(() => {
                step++;
                totalProgress += increment / steps;
                progress.style.width = Math.min(totalProgress, 100) + '%';
                if (step >= steps) {
                    clearInterval(interval);
                    currentStage++;
                    setTimeout(nextStage, 100);
                }
            }, stage.duration / steps);
        } else {
            tanksText.textContent = '✅ Загрузка завершена!';
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'none';
                auth.onAuthStateChanged(function(user) {
                    if (user) {
                        currentUser = user;
                        loadUserData(user.uid);
                        showGameWithPostLoading();
                    } else {
                        document.getElementById('loginScreen').style.display = 'flex';
                    }
                });
            }, 500);
        }
    }

    nextStage();
}

// ===== ПОСТ-ЗАГРУЗКА ПОСЛЕ ВХОДА =====
function showGameWithPostLoading() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('gameInterface').style.display = 'block';
    
    const overlay = document.createElement('div');
    overlay.id = 'postLoadingOverlay';
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        z-index: 100;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
    `;
    overlay.innerHTML = `
        <div style="text-align:center;color:#fff;">
            <div style="font-size:50px;margin-bottom:10px;">🎮</div>
            <div style="font-size:20px;font-weight:bold;color:#ffd700;margin-bottom:4px;">TANKS BLITZ</div>
            <div id="postLoadText" style="color:#8899bb;font-size:14px;margin-bottom:10px;">Загрузка данных...</div>
            <div style="width:300px;height:4px;background:rgba(255,255,255,0.1);border-radius:4px;margin:0 auto;overflow:hidden;">
                <div id="postLoadProgress" style="height:100%;width:0%;background:linear-gradient(90deg,#ffd700,#ff6b35);border-radius:4px;transition:width 0.3s;"></div>
            </div>
        </div>
    `;
    document.getElementById('gameInterface').appendChild(overlay);

    let stageIndex = 0;
    let totalProgress = 0;
    const progressEl = document.getElementById('postLoadProgress');
    const textEl = document.getElementById('postLoadText');

    function nextPostStage() {
        if (stageIndex < loadingStagesPostLogin.length) {
            const stage = loadingStagesPostLogin[stageIndex];
            textEl.textContent = stage.text;
            const increment = 100 / loadingStagesPostLogin.length;
            const steps = 20;
            let step = 0;
            const interval = setInterval(() => {
                step++;
                totalProgress += increment / steps;
                progressEl.style.width = Math.min(totalProgress, 100) + '%';
                if (step >= steps) {
                    clearInterval(interval);
                    stageIndex++;
                    setTimeout(nextPostStage, 200);
                }
            }, stage.duration / steps);
        } else {
            progressEl.style.width = '100%';
            textEl.textContent = '✅ Добро пожаловать!';
            setTimeout(() => {
                overlay.remove();
                isGameReady = true;
                loadSettings();
                initGame();
                initChatListeners();
                initFriendSystem();
                updateLastLogin();
                setTimeout(() => {
                    if (!isMusicPlaying) {
                        playBackgroundMusic();
                        document.getElementById('musicToggleBtnTop').textContent = '🔊';
                    }
                }, 1000);
                startFpsCounter();
            }, 500);
        }
    }

    nextPostStage();
}

// ===== АВТОРИЗАЦИЯ =====
function loadUserData(uid) {
    database.ref('users/' + uid).once('value').then(function(snapshot) {
        const data = snapshot.val();
        if (data) {
            currentUserData = data;
            document.getElementById('gamePlayerName').textContent = data.name || 'Игрок';
            document.getElementById('statsPlayerName').textContent = data.name || 'Игрок';
            document.getElementById('statsFullName').textContent = data.name || 'Игрок';
            loadUserStats(data);
            loadSettingsData();
            updateStatsFullscreen();
        }
    });
}

function loginWithFirebase() {
    if (!navigator.onLine) {
        alert('❌ Нет интернета! Проверьте подключение.');
        return;
    }
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorEl = document.getElementById('loginError');
    
    if (!email || !password) {
        errorEl.textContent = 'Заполните все поля';
        errorEl.style.display = 'block';
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            errorEl.style.display = 'none';
            loadUserData(currentUser.uid);
            showGameWithPostLoading();
        })
        .catch((error) => {
            errorEl.textContent = error.message;
            errorEl.style.display = 'block';
        });
}

function registerWithFirebase() {
    if (!navigator.onLine) {
        alert('❌ Нет интернета! Проверьте подключение.');
        return;
    }
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirm = document.getElementById('registerPasswordConfirm').value.trim();
    const errorEl = document.getElementById('registerError');
    
    if (!name || !email || !password || !confirm) {
        errorEl.textContent = 'Заполните все поля';
        errorEl.style.display = 'block';
        return;
    }
    
    if (name.length < 3) {
        errorEl.textContent = 'Ник должен содержать минимум 3 символа';
        errorEl.style.display = 'block';
        return;
    }
    
    if (password.length < 6) {
        errorEl.textContent = 'Пароль должен содержать минимум 6 символов';
        errorEl.style.display = 'block';
        return;
    }
    
    if (password !== confirm) {
        errorEl.textContent = 'Пароли не совпадают';
        errorEl.style.display = 'block';
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return database.ref('users/' + user.uid).set({
                name: name,
                email: email,
                created: Date.now(),
                lastLogin: Date.now(),
                friends: {},
                stats: {
                    battles: 0, wins: 0, winrate: 0, avgDamage: 0,
                    mastery: 0, rating: 0, destroyed: 0, survival: 0, accuracy: 0
                }
            }).then(() => {
                currentUser = user;
                currentUserData = { 
                    name: name, 
                    friends: {},
                    stats: { 
                        battles: 0, wins: 0, winrate: 0, avgDamage: 0,
                        mastery: 0, rating: 0, destroyed: 0, survival: 0, accuracy: 0 
                    } 
                };
                errorEl.style.display = 'none';
                showGameWithPostLoading();
            });
        })
        .catch((error) => {
            errorEl.textContent = error.message;
            errorEl.style.display = 'block';
        });
}

function logoutUser() {
    auth.signOut().then(() => {
        currentUser = null;
        currentUserData = null;
        isGameReady = false;
        isMusicPlaying = false;
        if (musicInterval) {
            clearTimeout(musicInterval);
            musicInterval = null;
        }
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        document.getElementById('gameInterface').style.display = 'none';
        document.getElementById('statsFullscreen').classList.remove('active');
        document.getElementById('chatFullscreen').classList.remove('active');
        document.getElementById('settingsPanel').classList.remove('active');
        document.getElementById('newsPanel').classList.remove('active');
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginError').style.display = 'none';
    });
}

function loadUserStats(data) {
    const stats = data.stats || {};
    document.getElementById('statBattles').textContent = stats.battles || 0;
    document.getElementById('statWins').textContent = stats.wins || 0;
    document.getElementById('statWinrate').textContent = (stats.winrate || 0) + '%';
    document.getElementById('statAvgDamage').textContent = stats.avgDamage || 0;
    document.getElementById('statMastery').textContent = stats.mastery || 0;
    document.getElementById('statRating').textContent = stats.rating || 0;
    document.getElementById('statDestroyed').textContent = stats.destroyed || 0;
    document.getElementById('statSurvival').textContent = (stats.survival || 0) + '%';
    document.getElementById('statAccuracy').textContent = (stats.accuracy || 0) + '%';
    
    // Обновляем полноэкранную статистику
    updateStatsFullscreen();
}

function updateStats(won, damage, destroyed) {
    if (!currentUser) return;
    
    const statsRef = database.ref('users/' + currentUser.uid + '/stats');
    statsRef.once('value').then(function(snapshot) {
        const stats = snapshot.val() || {};
        stats.battles = (stats.battles || 0) + 1;
        if (won) stats.wins = (stats.wins || 0) + 1;
        stats.winrate = stats.battles > 0 ? Math.round((stats.wins / stats.battles) * 100) : 0;
        stats.avgDamage = Math.round(((stats.avgDamage || 0) * (stats.battles - 1) + damage) / stats.battles);
        stats.destroyed = (stats.destroyed || 0) + destroyed;
        stats.rating = Math.round((stats.rating || 0) + (won ? 25 : -10));
        if (stats.rating < 0) stats.rating = 0;
        
        return statsRef.set(stats).then(() => {
            if (currentUserData) {
                currentUserData.stats = stats;
                loadUserStats(currentUserData);
            }
        });
    });
}

// ===== 3D СЦЕНА =====
let scene, camera, renderer, controls, tankGroup;

function initGame() {
    const container = document.getElementById('game-container');
    
    applyResolution();
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 30, 60);
    
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(12, 6, 12);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1.5, 0);
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minPolarAngle = Math.PI / 6;
    controls.rotateSpeed = 0.8;
    controls.update();
    
    // Освещение
    const ambientLight = new THREE.AmbientLight(0x8899bb, 0.4);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffeedd, 1.5);
    sunLight.position.set(20, 25, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    scene.add(sunLight);
    
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xff8844, 0.15);
    rimLight.position.set(0, 2, -15);
    scene.add(rimLight);
    
    // Ландшафт
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x4a8c5a,
        roughness: 0.9,
        metalness: 0.0
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Горы
    function createMountain(x, z, scale, color) {
        const group = new THREE.Group();
        const geo = new THREE.ConeGeometry(scale * 2, scale * 3, 8);
        const mat = new THREE.MeshStandardMaterial({ 
            color: color || 0x6b8e6b,
            roughness: 0.9,
            metalness: 0.0,
            flatShading: true
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = scale * 1.5;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        
        const snowGeo = new THREE.ConeGeometry(scale * 1.2, scale * 0.8, 8);
        const snowMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.8,
            metalness: 0.0
        });
        const snow = new THREE.Mesh(snowGeo, snowMat);
        snow.position.y = scale * 2.6;
        snow.castShadow = true;
        group.add(snow);
        
        group.position.set(x, 0, z);
        scene.add(group);
        return group;
    }
    
    createMountain(-15, -12, 4, 0x5a7a5a);
    createMountain(-12, -16, 5, 0x4a6a4a);
    createMountain(-18, -8, 3, 0x6a8a6a);
    createMountain(14, -14, 4.5, 0x5a7a5a);
    createMountain(17, -10, 3.5, 0x4a6a4a);
    createMountain(12, -18, 3, 0x6a8a6a);
    createMountain(-8, -20, 3.5, 0x5a7a5a);
    createMountain(8, -20, 3, 0x4a6a4a);
    
    // Дома
    function createHouse(x, z, scale, color) {
        const group = new THREE.Group();
        const wallMat = new THREE.MeshStandardMaterial({ 
            color: color || 0xe8d5b0,
            roughness: 0.8,
            metalness: 0.0
        });
        const wall = new THREE.Mesh(new THREE.BoxGeometry(scale * 2, scale * 1.2, scale * 1.8), wallMat);
        wall.position.y = scale * 0.6;
        wall.castShadow = true;
        wall.receiveShadow = true;
        group.add(wall);
        
        const roofMat = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,
            roughness: 0.9,
            metalness: 0.0
        });
        const roof = new THREE.Mesh(new THREE.ConeGeometry(scale * 1.5, scale * 0.8, 4), roofMat);
        roof.position.y = scale * 1.4;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);
        
        const windowMat = new THREE.MeshStandardMaterial({ 
            color: 0x87CEEB,
            emissive: 0x87CEEB,
            emissiveIntensity: 0.1
        });
        const windowGeo = new THREE.BoxGeometry(scale * 0.3, scale * 0.3, 0.02);
        const win1 = new THREE.Mesh(windowGeo, windowMat);
        win1.position.set(scale * 0.6, scale * 0.6, scale * 0.91);
        group.add(win1);
        const win2 = new THREE.Mesh(windowGeo, windowMat);
        win2.position.set(-scale * 0.6, scale * 0.6, scale * 0.91);
        group.add(win2);
        
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a });
        const door = new THREE.Mesh(new THREE.BoxGeometry(scale * 0.4, scale * 0.7, 0.02), doorMat);
        door.position.set(0, scale * 0.35, scale * 0.91);
        group.add(door);
        
        group.position.set(x, 0, z);
        scene.add(group);
        return group;
    }
    
    createHouse(-6, -6, 1.2, 0xe8d5b0);
    createHouse(-4, -4, 0.8, 0xd4c4a0);
    createHouse(5, -5, 1.0, 0xe0d0b0);
    createHouse(3, -7, 0.9, 0xd8c8a8);
    createHouse(-7, -3, 0.7, 0xecdcc0);
    createHouse(7, -3, 1.1, 0xe4d4b4);
    
    // Деревья
    function createTree(x, z, scale) {
        const group = new THREE.Group();
        const trunkMat = new THREE.MeshStandardMaterial({ 
            color: 0x5a3a1a,
            roughness: 0.9,
            metalness: 0.0
        });
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(scale * 0.1, scale * 0.15, scale * 0.8, 6), trunkMat);
        trunk.position.y = scale * 0.4;
        trunk.castShadow = true;
        group.add(trunk);
        
        const leafMat = new THREE.MeshStandardMaterial({ 
            color: 0x2d8a4e,
            roughness: 0.9,
            metalness: 0.0
        });
        const leafMat2 = new THREE.MeshStandardMaterial({ 
            color: 0x3a9a5e,
            roughness: 0.9,
            metalness: 0.0
        });
        
        const crown1 = new THREE.Mesh(new THREE.SphereGeometry(scale * 0.35, 5, 5), leafMat);
        crown1.position.set(0, scale * 0.9, 0);
        crown1.castShadow = true;
        group.add(crown1);
        
        const crown2 = new THREE.Mesh(new THREE.SphereGeometry(scale * 0.3, 5, 5), leafMat2);
        crown2.position.set(scale * 0.2, scale * 1.05, scale * 0.15);
        crown2.castShadow = true;
        group.add(crown2);
        
        const crown3 = new THREE.Mesh(new THREE.SphereGeometry(scale * 0.3, 5, 5), leafMat);
        crown3.position.set(-scale * 0.2, scale * 1.05, -scale * 0.15);
        crown3.castShadow = true;
        group.add(crown3);
        
        const crown4 = new THREE.Mesh(new THREE.SphereGeometry(scale * 0.25, 5, 5), leafMat2);
        crown4.position.set(scale * 0.1, scale * 1.2, -scale * 0.1);
        crown4.castShadow = true;
        group.add(crown4);
        
        group.position.set(x, 0, z);
        scene.add(group);
        return group;
    }
    
    const treePositions = [
        [-10, -2], [-9, -4], [-11, -1], [-8, 0], [-12, -3],
        [-3, -8], [-2, -9], [-1, -7], [0, -10], [-4, -9],
        [9, -2], [10, -4], [11, -1], [8, 0], [12, -3],
        [2, -8], [3, -9], [4, -7], [5, -10], [1, -9],
        [-5, 2], [-4, 3], [-6, 1], [-3, 4], [-7, 0],
        [6, 2], [5, 3], [7, 1], [4, 4], [8, 0],
        [-1, -12], [0, -13], [1, -12], [-2, -13], [2, -14]
    ];
    
    treePositions.forEach(pos => {
        const scale = 0.6 + Math.random() * 0.8;
        createTree(pos[0], pos[1], scale);
    });
    
    createTank();
    animate();
}

function createTank() {
    tankGroup = new THREE.Group();
    
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x4a3d30, roughness: 0.6, metalness: 0.3 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.7, metalness: 0.5 });
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x282828, roughness: 0.5, metalness: 0.8 });
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9, metalness: 0.1 });
    const camoMat = new THREE.MeshStandardMaterial({ color: 0x4a6a3a, roughness: 0.7, metalness: 0.1 });
    
    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 4.0), camoMat);
    hull.position.y = 0.5;
    hull.castShadow = true;
    hull.receiveShadow = true;
    tankGroup.add(hull);
    
    const nose = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 1.4), camoMat);
    nose.position.set(0, 0.7, 1.6);
    nose.rotation.x = -0.5;
    nose.castShadow = true;
    tankGroup.add(nose);
    
    const upperHull = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 2.4), camoMat);
    upperHull.position.set(0, 0.9, -0.2);
    upperHull.castShadow = true;
    tankGroup.add(upperHull);
    
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 2.2), camoMat);
    cabin.position.set(0, 1.4, -0.2);
    cabin.castShadow = true;
    tankGroup.add(cabin);
    
    for (let side = -1; side <= 1; side += 2) {
        const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 2.0), armorMat);
        skirt.position.set(side * 1.1, 1.4, -0.2);
        skirt.rotation.z = -side * 0.3;
        tankGroup.add(skirt);
    }
    
    const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.12, 12), darkMat);
    hatch.position.set(0.3, 1.85, -0.2);
    tankGroup.add(hatch);
    
    const gunMask = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), gunMat);
    gunMask.position.set(0, 1.4, 0.8);
    tankGroup.add(gunMask);
    
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 3.5, 12), gunMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 1.4, 2.5);
    barrel.castShadow = true;
    tankGroup.add(barrel);
    
    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.4), gunMat);
    muzzle.position.set(0, 1.4, 4.2);
    tankGroup.add(muzzle);
    
    const trackGeo = new THREE.BoxGeometry(0.4, 0.5, 4.2);
    const trackL = new THREE.Mesh(trackGeo, trackMat);
    trackL.position.set(-1.3, 0.3, 0);
    trackL.castShadow = true;
    tankGroup.add(trackL);
    const trackR = trackL.clone();
    trackR.position.x = 1.3;
    tankGroup.add(trackR);
    
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.3 });
    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.14, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    for (let z = -1.6; z <= 1.6; z += 0.8) {
        const wheelL = new THREE.Mesh(wheelGeo, wheelMat);
        wheelL.position.set(-1.35, 0.18, z);
        tankGroup.add(wheelL);
        const wheelR = wheelL.clone();
        wheelR.position.x = 1.35;
        tankGroup.add(wheelR);
    }
    
    tankGroup.position.y = 0;
    scene.add(tankGroup);
}

function animate() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    const now = performance.now();
    const delta = now - lastFrameTime;
    
    if (fpsLimit > 0 && delta < 1000 / fpsLimit) {
        animationId = requestAnimationFrame(animate);
        return;
    }
    
    lastFrameTime = now;
    
    frameCount++;
    if (now - lastFpsUpdate >= 1000) {
        currentFps = frameCount;
        frameCount = 0;
        lastFpsUpdate = now;
        document.getElementById('fpsValue').textContent = currentFps;
    }
    
    if (controls) controls.update();
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
    
    animationId = requestAnimationFrame(animate);
}

function startFpsCounter() {
    lastFpsUpdate = performance.now();
    frameCount = 0;
    lastFrameTime = performance.now();
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    animate();
}

// ===== НАСТРОЙКИ =====
function loadSettings() {
    const savedFpsLimit = localStorage.getItem('fpsLimit');
    if (savedFpsLimit) {
        fpsLimit = parseInt(savedFpsLimit);
        document.getElementById('fpsLimitSelect').value = savedFpsLimit;
    }
    
    const savedGraphics = localStorage.getItem('graphicsQuality');
    if (savedGraphics) {
        document.getElementById('graphicsSelect').value = savedGraphics;
        applyGraphicsQuality(savedGraphics);
    }
}

function applyGraphicsQuality(quality) {
    if (!renderer) return;
    
    switch(quality) {
        case 'low':
            renderer.setPixelRatio(0.5);
            renderer.shadowMap.enabled = false;
            renderer.toneMappingExposure = 1.0;
            break;
        case 'medium':
            renderer.setPixelRatio(1);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.toneMappingExposure = 1.2;
            break;
        case 'high':
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.toneMappingExposure = 1.3;
            break;
        case 'ultra':
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.toneMappingExposure = 1.4;
            break;
    }
}

function applyAllSettings() {
    const graphicsSelect = document.getElementById('graphicsSelect');
    if (graphicsSelect) {
        const quality = graphicsSelect.value;
        localStorage.setItem('graphicsQuality', quality);
        applyGraphicsQuality(quality);
    }
    
    const fpsSelect = document.getElementById('fpsLimitSelect');
    if (fpsSelect) {
        fpsLimit = parseInt(fpsSelect.value);
        localStorage.setItem('fpsLimit', fpsLimit);
        showNotification('⚡ FPS лимит: ' + (fpsLimit === 0 ? 'Без ограничений' : fpsLimit + ' FPS'));
    }
    
    applyResolution();
    
    showNotification('✅ Все настройки применены!');
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
    } else {
        panel.classList.add('active');
        loadSettingsData();
    }
}

function loadSettingsData() {
    const emailEl = document.getElementById('settingsEmail');
    if (emailEl && currentUser) {
        emailEl.textContent = currentUser.email || 'Не указан';
    }
    
    const lastLoginEl = document.getElementById('settingsLastLogin');
    if (lastLoginEl && currentUserData) {
        const lastLogin = currentUserData.lastLogin || Date.now();
        const date = new Date(lastLogin);
        lastLoginEl.textContent = date.toLocaleString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
    
    const updateEl = document.getElementById('settingsLastUpdate');
    if (updateEl) {
        const now = new Date();
        updateEl.textContent = now.toLocaleDateString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }
    
    const resolutionSelect = document.getElementById('resolutionSelect');
    if (resolutionSelect) {
        const savedResolution = localStorage.getItem('gameResolution') || 'auto';
        resolutionSelect.value = savedResolution;
    }
    
    const graphicsSelect = document.getElementById('graphicsSelect');
    if (graphicsSelect) {
        const savedGraphics = localStorage.getItem('graphicsQuality') || 'medium';
        graphicsSelect.value = savedGraphics;
    }
    
    const fpsSelect = document.getElementById('fpsLimitSelect');
    if (fpsSelect) {
        const savedFps = localStorage.getItem('fpsLimit') || '60';
        fpsSelect.value = savedFps;
    }
}

function changePassword() {
    if (!currentUser) {
        alert('❌ Вы не авторизованы');
        return;
    }
    
    if (!navigator.onLine) {
        alert('❌ Нет интернета!');
        return;
    }
    
    auth.sendPasswordResetEmail(currentUser.email)
        .then(() => {
            alert('✅ Код для сброса пароля отправлен на вашу почту!\nПроверьте папку "Спам"');
        })
        .catch((error) => {
            alert('❌ Ошибка: ' + error.message);
        });
}

function activatePromoCode() {
    const input = document.getElementById('promoInput');
    const resultEl = document.getElementById('promoResult');
    if (!input || !resultEl) return;
    
    const code = input.value.trim().toUpperCase();
    if (!code) {
        resultEl.textContent = '❌ Введите промо-код';
        resultEl.style.color = '#ff4444';
        return;
    }
    
    const usedCodes = JSON.parse(localStorage.getItem('usedPromoCodes') || '[]');
    if (usedCodes.includes(code)) {
        resultEl.textContent = '❌ Данный промо-код не существует или был уже использован';
        resultEl.style.color = '#ff4444';
        input.value = '';
        return;
    }
    
    const validCodes = {
        'TANK2026': '🎖️ 500 золота + премиум 3 дня',
        'BLITZ2026': '⚡ 1000 золота + танк T-34',
        'WOTBLITZ': '🎯 750 золота + снаряды x50',
        'HELLO2026': '👋 200 золота + бонусы',
        'GOLD2026': '💰 1500 золота',
        'PROMO2026': '🎁 Премиум 7 дней',
        'VIP2026': '👑 VIP статус на 30 дней',
        'STAR2026': '⭐ 5000 опыта + 1000 золота'
    };
    
    if (validCodes[code]) {
        usedCodes.push(code);
        localStorage.setItem('usedPromoCodes', JSON.stringify(usedCodes));
        
        resultEl.textContent = '✅ Вы успешно активировали промо-код! Получено: ' + validCodes[code];
        resultEl.style.color = '#44ff44';
        input.value = '';
        
        showNotification('🎉 Промо-код активирован!\n' + validCodes[code]);
    } else {
        resultEl.textContent = '❌ Данный промо-код не существует или был уже использован';
        resultEl.style.color = '#ff4444';
        input.value = '';
    }
}

function applyResolution() {
    const select = document.getElementById('resolutionSelect');
    if (!select) return;
    
    const resolution = select.value;
    localStorage.setItem('gameResolution', resolution);
    
    const container = document.getElementById('game-container');
    if (!container) return;
    
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.margin = '0';
    
    if (resolution === 'auto') {
        container.style.width = '100%';
        container.style.height = '100%';
        if (renderer) {
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
        if (camera) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }
        showNotification('✅ Разрешение: Авто');
        return;
    }
    
    const parts = resolution.split('x');
    if (parts.length === 2) {
        const width = parseInt(parts[0]);
        const height = parseInt(parts[1]);
        
        container.style.width = width + 'px';
        container.style.height = height + 'px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        
        if (renderer) {
            renderer.setSize(width, height);
        }
        if (camera) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        
        showNotification('✅ Разрешение: ' + resolution);
    }
}

function updateLastLogin() {
    if (!currentUser) return;
    database.ref('users/' + currentUser.uid + '/lastLogin').set(Date.now());
}

// ===== НОВОСТИ =====
function toggleNews() {
    const panel = document.getElementById('newsPanel');
    if (!panel) return;
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
    } else {
        panel.classList.add('active');
    }
}

function initNewsListener() {
    database.ref('news').limitToLast(50).on('child_added', function(snapshot) {
        const news = snapshot.val();
        if (!news) return;
        
        const newsBody = document.getElementById('newsBody');
        if (!newsBody) return;
        const welcome = newsBody.querySelector('.news-welcome');
        if (welcome) welcome.remove();
        
        const date = new Date(news.time).toLocaleDateString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        
        const div = document.createElement('div');
        div.className = 'news-item';
        div.innerHTML = `
            <div class="news-date">${date}</div>
            <div class="news-text">${news.text}</div>
        `;
        newsBody.prepend(div);
    });
}

// Функция для публикации новостей через консоль
function publishNews(text) {
    if (!currentUser) {
        console.log('❌ Вы не авторизованы');
        return;
    }
    database.ref('news').push({
        text: text,
        time: Date.now(),
        author: currentUser.uid
    }).then(() => {
        console.log('✅ Новость опубликована!');
    }).catch((error) => {
        console.log('❌ Ошибка:', error);
    });
}

window.publishNews = publishNews;

// ===== ЧАТ =====
function initChatListeners() {
    database.ref('chat').limitToLast(100).on('child_added', function(snapshot) {
        const msg = snapshot.val();
        if (!msg) return;
        
        // Обновляем обычный чат
        const messagesDiv = document.getElementById('chatMessages');
        if (messagesDiv) {
            const welcome = messagesDiv.querySelector('.chat-welcome');
            if (welcome) welcome.remove();
            
            const isOwn = msg.uid === (currentUser ? currentUser.uid : null);
            const time = new Date(msg.time).toLocaleTimeString();
            
            const div = document.createElement('div');
            div.className = 'chat-message' + (isOwn ? ' own' : '');
            div.innerHTML = `
                <span class="chat-name">${msg.name}</span>
                <span class="chat-time">${time}</span>
                <div class="chat-text">${msg.text}</div>
                ${!isOwn && currentUser ? `<button class="chat-add-friend" data-uid="${msg.uid}" data-name="${msg.name}" style="font-size:9px;padding:2px 10px;margin-top:4px;background:rgba(68,187,68,0.2);border:1px solid rgba(68,187,68,0.3);border-radius:4px;color:#44bb44;cursor:pointer;">➕ В друзья</button>` : ''}
            `;
            messagesDiv.appendChild(div);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            
            const addBtn = div.querySelector('.chat-add-friend');
            if (addBtn) {
                addBtn.addEventListener('click', function() {
                    const uid = this.dataset.uid;
                    const name = this.dataset.name;
                    if (currentUserData && currentUserData.friends && currentUserData.friends[uid]) {
                        showNotification('❌ Этот игрок уже в друзьях');
                        return;
                    }
                    addFriend(uid, name);
                    this.textContent = '✅ В друзьях';
                    this.style.background = 'rgba(68,187,68,0.4)';
                    this.style.borderColor = 'rgba(68,187,68,0.5)';
                    this.style.color = '#88ff88';
                    this.disabled = true;
                });
            }
        }
        
        // Обновляем полноэкранный чат
        const clanMessages = document.getElementById('clanMessages');
        if (clanMessages) {
            const isOwn = msg.uid === (currentUser ? currentUser.uid : null);
            const div = document.createElement('div');
            div.className = 'clan-message' + (isOwn ? ' own' : '');
            div.innerHTML = `
                <span class="clan-msg-name">${msg.name}</span>
                <span class="clan-msg-text">${msg.text}</span>
            `;
            clanMessages.appendChild(div);
            clanMessages.scrollTop = clanMessages.scrollHeight;
        }
    });
}

function sendChatMessage() {
    if (!navigator.onLine) {
        alert('❌ Нет интернета! Сообщение не отправлено.');
        return;
    }
    
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text) return;
    if (!currentUser) {
        alert('Войдите в аккаунт чтобы писать в чат');
        return;
    }
    
    const name = currentUserData ? currentUserData.name : 'Игрок';
    
    database.ref('chat').push({
        name: name,
        text: text,
        uid: currentUser.uid,
        time: Date.now()
    });
    
    input.value = '';
}

function toggleChat() {
    const panel = document.getElementById('chatPanel');
    if (!panel) return;
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
    } else {
        panel.classList.add('active');
        const input = document.getElementById('chatInput');
        if (input) {
            setTimeout(() => input.focus(), 150);
        }
        const messages = document.getElementById('chatMessages');
        if (messages) {
            messages.scrollTop = messages.scrollHeight;
        }
    }
}

// ===== ЧАТ (ПОЛНЫЙ ЭКРАН) =====
function toggleChatFullscreen() {
    const panel = document.getElementById('chatFullscreen');
    if (!panel) return;
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
    } else {
        panel.classList.add('active');
        loadFriendsListFull();
    }
}

function loadFriendsListFull() {
    const container = document.querySelector('.chat-friends-list');
    if (!container) return;
    
    if (!currentUserData || !currentUserData.friends || Object.keys(currentUserData.friends).length === 0) {
        container.innerHTML = '<div style="color:#556;font-size:12px;text-align:center;padding:10px 0;">У вас пока нет друзей</div>';
        return;
    }
    
    container.innerHTML = '';
    for (const uid in currentUserData.friends) {
        const friend = currentUserData.friends[uid];
        const div = document.createElement('div');
        div.className = 'friend-item';
        div.innerHTML = `
            <span class="friend-name">${friend.name || 'Игрок'}</span>
            <span class="friend-status online">1</span>
        `;
        container.appendChild(div);
    }
}

function sendChatFullMessage() {
    if (!navigator.onLine) {
        alert('❌ Нет интернета! Сообщение не отправлено.');
        return;
    }
    
    const input = document.getElementById('chatFullInput');
    const text = input.value.trim();
    
    if (!text) return;
    if (!currentUser) {
        alert('Войдите в аккаунт чтобы писать в чат');
        return;
    }
    
    const name = currentUserData ? currentUserData.name : 'Игрок';
    
    database.ref('chat').push({
        name: name,
        text: text,
        uid: currentUser.uid,
        time: Date.now()
    });
    
    input.value = '';
}

function searchFriendsFull() {
    const input = document.getElementById('friendSearchInput');
    const query = input.value.trim();
    if (!query) {
        showNotification('Введите ник игрока');
        return;
    }
    
    if (!navigator.onLine) {
        alert('❌ Нет интернета!');
        return;
    }
    
    database.ref('users').orderByChild('name').startAt(query).endAt(query + '\uf8ff').once('value').then((snapshot) => {
        const data = snapshot.val();
        if (!data) {
            showNotification('❌ Игроки не найдены');
            return;
        }
        
        let found = false;
        for (const uid in data) {
            if (uid === currentUser.uid) continue;
            const user = data[uid];
            if (user.name && user.name.toLowerCase().includes(query.toLowerCase())) {
                found = true;
                const isFriend = currentUserData && currentUserData.friends && currentUserData.friends[uid];
                showNotification((isFriend ? '✅ ' : '🔍 ') + user.name + (isFriend ? ' (уже в друзьях)' : ''));
                if (!isFriend) {
                    addFriend(uid, user.name);
                }
                break;
            }
        }
        
        if (!found) {
            showNotification('❌ Игрок не найден');
        }
    });
}

// ===== СТАТИСТИКА (ПОЛНЫЙ ЭКРАН) =====
function toggleStatsFullscreen() {
    const panel = document.getElementById('statsFullscreen');
    if (!panel) return;
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
    } else {
        panel.classList.add('active');
        updateStatsFullscreen();
    }
}

function updateStatsFullscreen() {
    const stats = currentUserData?.stats || {};
    document.getElementById('statFullBattles').textContent = stats.battles || 0;
    document.getElementById('statFullWins').textContent = stats.wins || 0;
    document.getElementById('statFullWinrate').textContent = (stats.winrate || 0) + '%';
    document.getElementById('statFullAvgDamage').textContent = stats.avgDamage || 0;
    document.getElementById('statFullMastery').textContent = stats.mastery || 0;
    document.getElementById('statFullRating').textContent = stats.rating || 0;
    document.getElementById('statFullDestroyed').textContent = stats.destroyed || 0;
    document.getElementById('statFullSurvival').textContent = (stats.survival || 0) + '%';
    document.getElementById('statFullAccuracy').textContent = (stats.accuracy || 0) + '%';
    
    const name = currentUserData?.name || 'Игрок';
    document.getElementById('statsFullName').textContent = name;
}

// ===== СИСТЕМА ДРУЗЕЙ =====
function addFriend(uid, name) {
    if (!currentUser) return;
    
    const friendRef = database.ref('users/' + currentUser.uid + '/friends/' + uid);
    friendRef.set({
        name: name,
        added: Date.now()
    }).then(() => {
        if (currentUserData) {
            if (!currentUserData.friends) currentUserData.friends = {};
            currentUserData.friends[uid] = { name: name };
        }
        loadFriendsListFull();
        showNotification('✅ ' + name + ' добавлен в друзья!');
    });
}

function removeFriend(uid) {
    if (!currentUser) return;
    
    const friendRef = database.ref('users/' + currentUser.uid + '/friends/' + uid);
    friendRef.remove().then(() => {
        if (currentUserData && currentUserData.friends) {
            delete currentUserData.friends[uid];
        }
        loadFriendsListFull();
        showNotification('❌ Друг удалён');
    });
}

function showNotification(text) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 120px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.9);
        backdrop-filter: blur(10px);
        padding: 10px 24px;
        border-radius: 12px;
        color: #fff;
        font-size: 14px;
        z-index: 200;
        border: 1px solid rgba(255,215,0,0.2);
        animation: fadeInUp 0.3s ease;
        pointer-events: none;
    `;
    notif.textContent = text;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transition = 'opacity 0.5s';
        setTimeout(() => notif.remove(), 500);
    }, 2000);
}

// ===== ИГРОВЫЕ ФУНКЦИИ =====
function toggleWallpapers() {
    document.getElementById('wallpapersGallery').classList.toggle('active');
}

function startBattle() {
    if (!isGameReady) {
        alert('⏳ Игра ещё загружается, подождите...');
        return;
    }
    
    if (!navigator.onLine) {
        alert('❌ Нет интернета!');
        return;
    }
    
    document.getElementById('modal').style.display = 'block';
    setTimeout(() => {
        document.getElementById('modal').querySelector('p').textContent = '⏳ Поиск игроков...';
        setTimeout(() => {
            document.getElementById('modal').querySelector('p').textContent = '⚔️ БОЙ НАЧАЛСЯ!';
            setTimeout(() => {
                document.getElementById('modal').style.display = 'none';
                document.getElementById('modal').querySelector('p').textContent = 'Загрузка карты "Минск"...';
                const won = Math.random() > 0.4;
                const damage = Math.floor(200 + Math.random() * 1800);
                const destroyed = Math.floor(Math.random() * 5);
                updateStats(won, damage, destroyed);
                alert(won ? '🎉 ПОБЕДА!' : '💀 ПОРАЖЕНИЕ');
            }, 1000);
        }, 1500);
    }, 1000);
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modal').querySelector('p').textContent = 'Загрузка карты "Минск"...';
}

// ===== ФОНЫ =====
const statsBackgrounds = {
    default: 'linear-gradient(135deg, #0a0a2e, #1a1a4e)',
    anime1: 'linear-gradient(135deg, #ff6b6b, #ffd93d)',
    anime2: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    tank1: 'linear-gradient(135deg, #2d3436, #636e72)',
    tank2: 'linear-gradient(135deg, #e17055, #d63031)',
    night: 'linear-gradient(135deg, #0a0a1a, #1a0a2a)',
    cyber: 'linear-gradient(135deg, #0a0a2a, #ff00ff33)',
    sunset: 'linear-gradient(135deg, #ff6b35, #ffd93d)',
    ocean: 'linear-gradient(135deg, #006994, #00b4d8)'
};

function changeStatsBg(name) {
    const bg = document.getElementById('statsBackground');
    if (bg && statsBackgrounds[name]) {
        bg.style.background = statsBackgrounds[name];
        localStorage.setItem('statsBackground', name);
    }
    document.getElementById('wallpapersGallery').classList.remove('active');
    const btn = document.getElementById('wallpapersBtn');
    if (btn) {
        btn.textContent = '✅ Фон установлен!';
        setTimeout(() => { btn.textContent = '🖼️ Фоны для статистики'; }, 1500);
    }
}

const savedStatsBg = localStorage.getItem('statsBackground');
if (savedStatsBg && statsBackgrounds[savedStatsBg]) {
    document.getElementById('statsBackground').style.background = statsBackgrounds[savedStatsBg];
}

// ===== ЗАКРЫТИЕ ПАНЕЛЕЙ ПО КЛИКУ ВНЕ =====
document.addEventListener('click', function(e) {
    const gallery = document.getElementById('wallpapersGallery');
    const settings = document.getElementById('settingsPanel');
    const news = document.getElementById('newsPanel');
    const wallpapersBtn = document.getElementById('wallpapersBtn');
    const settingsMenu = document.getElementById('settingsMenuBtn');
    const newsBtn = document.getElementById('newsBtn');
    
    if (gallery && gallery.classList.contains('active')) {
        if (!gallery.contains(e.target) && !wallpapersBtn.contains(e.target)) {
            gallery.classList.remove('active');
        }
    }
    if (settings && settings.classList.contains('active')) {
        if (!settings.contains(e.target) && !settingsMenu.contains(e.target)) {
            settings.classList.remove('active');
        }
    }
    if (news && news.classList.contains('active')) {
        if (!news.contains(e.target) && !newsBtn.contains(e.target)) {
            news.classList.remove('active');
        }
    }
});

window.addEventListener('resize', function() {
    if (camera && renderer) {
        const savedResolution = localStorage.getItem('gameResolution') || 'auto';
        if (savedResolution === 'auto') {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
});

console.log('🎮 Tanks Blitz Online v26.8.0');
console.log('💬 Чат работает в реальном времени');
console.log('👥 Система друзей активна');
console.log('🔄 Свободное вращение камеры (зажмите ЛКМ)');
console.log('🎵 Эпическая музыка играет');
console.log('📡 Требуется интернет для игры');
console.log('⚙️ Настройки графики и FPS доступны');
console.log('🎁 Промо-коды активируются в настройках');
console.log('📰 Для публикации новостей используйте: publishNews("Текст новости")');
