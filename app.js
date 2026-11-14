/**
 * app.js — TypoCute Duolingo-Grade Engine
 * Cute claymorphism typing tutor + English learning app.
 * Fully offline, zero external dependencies.
 */

/* ═══════════════════════════════════════════════════
   TYPOCUTE FRESH START & RESET SYSTEM
   ═══════════════════════════════════════════════════ */

const CURRENT_RESET_VERSION = "v2_fresh_start_reset_2026";

// One-time auto-reset: ensures test data from development is completely wiped on first open
(function() {
  try {
    if (localStorage.getItem("typoCute_reset_version") !== CURRENT_RESET_VERSION) {
      localStorage.removeItem("typo_stats");
      localStorage.removeItem("typo_last_date");
      localStorage.removeItem("typoCuteInfinite10kProgress");
      localStorage.removeItem("typoCuteDynamicParagraphsBank");
      localStorage.removeItem("typo_ai_saved");
      localStorage.setItem("typoCute_reset_version", CURRENT_RESET_VERSION);
    }
  } catch(e) {
    console.warn("Storage reset check bypassed:", e);
  }
})();

window.resetAllProgress = function(confirmPrompt = true) {
  if (confirmPrompt) {
    const ok = window.confirm(
      "🌸 TypoCute: Nayi Shuruat (Reset All Progress)? 🌸\n\n" +
      "Kya aap sach me saari progress reset karna chahte hain?\n\n" +
      "• Total XP: 0 XP se shuru hoga\n" +
      "• Gems: 15 Gems (starter balance)\n" +
      "• Streak: 1 Day se start hoga\n" +
      "• Completed Essays & Words: 0 se shuru honge\n\n" +
      "Click 'OK' to Reset or 'Cancel' to continue."
    );
    if (!ok) return;
  }

  try {
    localStorage.removeItem("typo_stats");
    localStorage.removeItem("typo_last_date");
    localStorage.removeItem("typoCuteInfinite10kProgress");
    localStorage.removeItem("typoCuteDynamicParagraphsBank");
    localStorage.removeItem("typo_ai_saved");
    localStorage.setItem("typoCute_reset_version", CURRENT_RESET_VERSION);
  } catch(e) {}

  if (confirmPrompt) {
    alert("✨ Saari progress safalta-purvak reset ho gayi hai! Ab bilkul nayi shuruat hogi. 💖");
  }
  window.location.reload();
};

/* ═══════════════════════════════════════════════════
   1. GLOBAL STATE & DUOLINGO ECONOMY
   ═══════════════════════════════════════════════════ */

const STATE = {
  currentTab: "arena",
  currentLesson: null,
  currentItems: [],
  itemIndex: 0,
  targetText: "",
  targetHindi: "",
  typedText: "",
  startTime: null,
  timerInterval: null,
  wpm: 0,
  accuracy: 100,
  errors: 0,
  totalTyped: 0,
  correctChars: 0,
  isCompleted: false,
  soundEnabled: true,
  speechRate: 0.85,
  weakKeys: {},
  streak: 1,
  totalWordsTyped: 0,
  bestWpm: 0,
  hfToken: "",

  // Duolingo Gamification Core
  xp: 0,
  gems: 15,
  hearts: 5,
  combo: 0,
  maxCombo: 0,
  mode: "classic", // "classic" | "listen" | "quiz"
  pathView: "path", // "path" | "grid"
  feedbackActive: false,
  unlockedNodes: ["l0_1"],
  nodeStars: {},
  quests: {
    date: new Date().toDateString(),
    wordsTyped: 0,        // goal: 30
    accuracyDone: false,  // goal: >=90% in 1 lesson
    practiceTime: 0,      // goal: 180 sec (3 min)
    claimed: [false, false, false]
  },
  stickers: ["stk_starter"],

  // Mimi's Boutique & Themes
  theme: "pink",
  accessory: "bow",
  unlockedThemes: ["pink"],
  unlockedAccessories: ["bow"],

  // Cozy Lofi Beats
  lofiPlaying: false,
  studentName: "Pooja Sharma",

  // Live Hands, Motivation & Conversation
  handsGuideEnabled: true,
  brotherNote: "Shaabash gudiya! Har roz thodi si practice se tumhari English aur typing dono zabardast ho jayegi. Mujhe tumpar poora bharosa hai! Proud of you! 💖 - Bhaiya",
  activeTypingSeconds: 0,
  lastBreakAt: 0,
  chatDialogueIndex: 0
};

/* ═══════════════════════════════════════════════════
   2. FINGER MAP (QWERTY → finger + CSS class)
   ═══════════════════════════════════════════════════ */

const FINGER_MAP = {
  // Left Pinky
  "`": { finger: "Left Pinky",  class: "finger-pinky-l", hand: "Left Hand"  },
  "1": { finger: "Left Pinky",  class: "finger-pinky-l", hand: "Left Hand"  },
  "q": { finger: "Left Pinky",  class: "finger-pinky-l", hand: "Left Hand"  },
  "a": { finger: "Left Pinky",  class: "finger-pinky-l", hand: "Left Hand"  },
  "z": { finger: "Left Pinky",  class: "finger-pinky-l", hand: "Left Hand"  },

  // Left Ring
  "2": { finger: "Left Ring",   class: "finger-ring-l",  hand: "Left Hand"  },
  "w": { finger: "Left Ring",   class: "finger-ring-l",  hand: "Left Hand"  },
  "s": { finger: "Left Ring",   class: "finger-ring-l",  hand: "Left Hand"  },
  "x": { finger: "Left Ring",   class: "finger-ring-l",  hand: "Left Hand"  },

  // Left Middle
  "3": { finger: "Left Middle", class: "finger-mid-l",   hand: "Left Hand"  },
  "e": { finger: "Left Middle", class: "finger-mid-l",   hand: "Left Hand"  },
  "d": { finger: "Left Middle", class: "finger-mid-l",   hand: "Left Hand"  },
  "c": { finger: "Left Middle", class: "finger-mid-l",   hand: "Left Hand"  },

  // Left Index
  "4": { finger: "Left Index",  class: "finger-idx-l",   hand: "Left Hand"  },
  "5": { finger: "Left Index",  class: "finger-idx-l",   hand: "Left Hand"  },
  "r": { finger: "Left Index",  class: "finger-idx-l",   hand: "Left Hand"  },
  "t": { finger: "Left Index",  class: "finger-idx-l",   hand: "Left Hand"  },
  "f": { finger: "Left Index",  class: "finger-idx-l",   hand: "Left Hand"  },
  "g": { finger: "Left Index",  class: "finger-idx-l",   hand: "Left Hand"  },
  "v": { finger: "Left Index",  class: "finger-idx-l",   hand: "Left Hand"  },
  "b": { finger: "Left Index",  class: "finger-idx-l",   hand: "Left Hand"  },

  // Thumbs
  " ": { finger: "Both Thumbs", class: "finger-thumb",   hand: "Thumbs"     },

  // Right Index
  "6": { finger: "Right Index", class: "finger-idx-r",   hand: "Right Hand" },
  "7": { finger: "Right Index", class: "finger-idx-r",   hand: "Right Hand" },
  "y": { finger: "Right Index", class: "finger-idx-r",   hand: "Right Hand" },
  "u": { finger: "Right Index", class: "finger-idx-r",   hand: "Right Hand" },
  "h": { finger: "Right Index", class: "finger-idx-r",   hand: "Right Hand" },
  "j": { finger: "Right Index", class: "finger-idx-r",   hand: "Right Hand" },
  "n": { finger: "Right Index", class: "finger-idx-r",   hand: "Right Hand" },
  "m": { finger: "Right Index", class: "finger-idx-r",   hand: "Right Hand" },

  // Right Middle
  "8": { finger: "Right Middle",class: "finger-mid-r",   hand: "Right Hand" },
  "i": { finger: "Right Middle",class: "finger-mid-r",   hand: "Right Hand" },
  "k": { finger: "Right Middle",class: "finger-mid-r",   hand: "Right Hand" },
  ",": { finger: "Right Middle",class: "finger-mid-r",   hand: "Right Hand" },

  // Right Ring
  "9": { finger: "Right Ring",  class: "finger-ring-r",  hand: "Right Hand" },
  "o": { finger: "Right Ring",  class: "finger-ring-r",  hand: "Right Hand" },
  "l": { finger: "Right Ring",  class: "finger-ring-r",  hand: "Right Hand" },
  ".": { finger: "Right Ring",  class: "finger-ring-r",  hand: "Right Hand" },

  // Right Pinky
  "0": { finger: "Right Pinky", class: "finger-pinky-r", hand: "Right Hand" },
  "-": { finger: "Right Pinky", class: "finger-pinky-r", hand: "Right Hand" },
  "=": { finger: "Right Pinky", class: "finger-pinky-r", hand: "Right Hand" },
  "p": { finger: "Right Pinky", class: "finger-pinky-r", hand: "Right Hand" },
  "[": { finger: "Right Pinky", class: "finger-pinky-r", hand: "Right Hand" },
  "]": { finger: "Right Pinky", class: "finger-pinky-r", hand: "Right Hand" },
  "\\": { finger: "Right Pinky", class: "finger-pinky-r", hand: "Right Hand" },
  ";": { finger: "Right Pinky", class: "finger-pinky-r", hand: "Right Hand" },
  "'": { finger: "Right Pinky", class: "finger-pinky-r", hand: "Right Hand" },
  "/": { finger: "Right Pinky", class: "finger-pinky-r", hand: "Right Hand" }
};

/* ═══════════════════════════════════════════════════
   3. DUOLINGO-GRADE WEB AUDIO SYNTHESIZERS
   ═══════════════════════════════════════════════════ */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// 1. Keystroke Sound: Sweet pop (correct) or gentle marimba tap (error)
function playTypingClick(isCorrect = true) {
  if (!STATE.soundEnabled) return;
  try {
    const ctx  = getAudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isCorrect) {
      osc.type = "sine";
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    }
  } catch (_) {}
}

// 2. Duolingo Word Completion Chime (F5 -> C6 joy chime)
function playWordCompleteChime() {
  if (!STATE.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const notes = [698.46, 1046.50];
    notes.forEach((freq, idx) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
    });
  } catch (_) {}
}

// 3. Sparkle Combo Chime (E5 -> G#5 -> B5 ascending chord)
function playComboChime() {
  if (!STATE.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const notes = [659.25, 830.61, 987.77];
    notes.forEach((freq, idx) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.3);
      osc.start(ctx.currentTime + idx * 0.06);
      osc.stop(ctx.currentTime + idx * 0.06 + 0.3);
    });
  } catch (_) {}
}

// 4. Grand Lesson Completion Fanfare (C5, E5, G5, C6)
function playVictoryChime() {
  if (!STATE.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
    });
  } catch (_) {}
}

/* ═══════════════════════════════════════════════════
   3b. DEVANAGARI PRONUNCIATION DICTIONARY (For Hindi Students)
   ═══════════════════════════════════════════════════ */

const DEVANAGARI_PRONUNCIATION = {
  "Mother": "मदर", "Father": "फादर", "Brother": "ब्रदर", "Sister": "सिस्टर",
  "Family": "फैमिली", "Friend": "फ्रेंड", "Parent": "पेरेंट", "Child": "चाइल्ड",
  "Daughter": "डॉटर", "Son": "सन", "Eat": "ईट", "Drink": "ड्रिंक",
  "Sleep": "स्लीप", "Walk": "वॉक", "Run": "रन", "Speak": "स्पीक",
  "Listen": "लिसन", "Read": "रीड", "Write": "राइट", "Learn": "लर्न",
  "Help": "हेल्प", "Work": "वर्क", "Smile": "स्माइल", "Think": "थिंक",
  "Understand": "अंडरस्टैंड", "Red": "रेड", "Blue": "ब्लू", "Green": "ग्रीन",
  "Yellow": "येलो", "Pink": "पिंक", "White": "व्हाइट", "Black": "ब्लैक",
  "Orange": "ऑरेंज", "Purple": "पर्पल", "Brown": "ब्राउन", "One": "वन",
  "Two": "टू", "Three": "थ्री", "Four": "फोर", "Five": "फाइव",
  "Six": "सिक्स", "Seven": "सेवन", "Eight": "एट", "Nine": "नाइन",
  "Ten": "टेन", "Head": "हेड", "Eye": "आई", "Ear": "इयर",
  "Nose": "नोज़", "Mouth": "माउथ", "Hand": "हैंड", "Leg": "लेग",
  "Finger": "फिंगर", "Hair": "हेयर", "Foot": "फुट", "Apple": "एप्पल",
  "Water": "वॉटर", "Milk": "मिल्क", "Bread": "ब्रेड", "Rice": "राइस",
  "Tea": "टी", "Fruit": "फ्रूट", "Sweet": "स्वीट", "Sugar": "शुगर",
  "Mango": "मैंगो", "School": "स्कूल", "Teacher": "टीचर", "Book": "बुक",
  "Pen": "पेन", "Pencil": "पेंसिल", "Bag": "बैग", "Class": "क्लास",
  "Desk": "डेस्क", "Exam": "एग्ज़ाम", "Study": "स्टडी", "House": "हाउस",
  "Door": "डोर", "Window": "विंडो", "Bed": "बेड", "Chair": "चेयर",
  "Table": "टेबल", "Room": "रूम", "Kitchen": "किचन", "Garden": "गार्डन",
  "Light": "लाइट", "Dog": "डॉग", "Cat": "कैट", "Cow": "काउ",
  "Bird": "बर्ड", "Horse": "हॉर्स", "Elephant": "एलिफेंट", "Lion": "लायन",
  "Monkey": "मंकी", "Fish": "फिश", "Rabbit": "रैबिट", "Happy": "हैप्पी",
  "Sad": "सैड", "Good": "गुड", "Bad": "बैड", "Big": "बिग",
  "Small": "स्मॉल", "Beautiful": "ब्यूटीफुल", "Kind": "काइन्ड", "Clever": "क्लेवर",
  "Brave": "ब्रेव", "Day": "डे", "Night": "नाइट", "Morning": "मॉर्निंग",
  "Evening": "इवनिंग", "Today": "टुडे", "Tomorrow": "टुमॉरो", "Yesterday": "यस्टरडे",
  "Week": "वीक", "Month": "मंथ", "Year": "इयर", "Hello": "हेलो",
  "Please": "प्लीज़", "Thank You": "थैंक यू", "Sorry": "सॉरी", "Welcome": "वेलकम",
  "Goodbye": "गुडबाय", "Excuse Me": "एक्सक्यूज़ मी", "Yes": "यस", "No": "नो", "Okay": "ओके"
};

// Friendly Error Boop
function playErrorBoop() {
  if (!STATE.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(277.18, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(233.08, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
  } catch (_) {}
}

// 3D Tile Click Thock
function playTileClick() {
  if (!STATE.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch (_) {}
}

/* ═══════════════════════════════════════════════════
   3c. DUOLINGO MULTI-TRACK STUDY MUSIC ENGINE (100% Offline Synthesizer)
   - Track 1: 'lofi' - Cozy Lofi Beats (Rhodes Piano Chords)
   - Track 2: 'rain' - Gentle Rain & Cafe (Pink/Brown noise ambiance)
   - Track 3: 'chiptune' - Kawaii 8-Bit Melody (Animal Crossing/Game Vibes)
   - Track 4: 'piano' - Peaceful Ghibli Piano (Classical Arpeggios)
   ═══════════════════════════════════════════════════ */

let CURRENT_BGM_TRACK = localStorage.getItem("typocute_bgm_track") || "lofi";
let CURRENT_BGM_INTERVAL = null;
let CURRENT_RAIN_NODE = null;
let bgmChordIndex = 0;
let bgmPianoIndex = 0;
let bgmChiptuneIndex = 0;

function toggleMusicPopover(forceState) {
  const popover = document.getElementById("duoMusicPopover");
  if (!popover) return;
  const isShown = popover.style.display !== "none";
  const shouldShow = forceState !== undefined ? forceState : !isShown;
  popover.style.display = shouldShow ? "flex" : "none";
  if (shouldShow) {
    updateMusicPopoverUI();
  }
}

function updateMusicPopoverUI() {
  const tracks = ["lofi", "rain", "chiptune", "piano"];
  tracks.forEach(t => {
    const btn = document.getElementById(`dmpBtn-${t}`);
    const ind = document.getElementById(`dmpInd-${t}`);
    const isThisActive = STATE.lofiPlaying && CURRENT_BGM_TRACK === t;
    if (btn) btn.classList.toggle("active", isThisActive);
    if (ind) ind.textContent = isThisActive ? "▶" : "";
  });

  const stopBtn = document.getElementById("dmpStopBtn");
  if (stopBtn) {
    stopBtn.style.display = STATE.lofiPlaying ? "flex" : "none";
  }
}

function selectMusicTrack(trackKey) {
  CURRENT_BGM_TRACK = trackKey;
  try { localStorage.setItem("typocute_bgm_track", trackKey); } catch(_) {}

  // Stop any playing audio
  stopMusicLoopOnly();

  // Start the selected track
  STATE.lofiPlaying = true;
  startTrackLoop(trackKey);

  const btn = document.getElementById("lofiToggle");
  if (btn) {
    btn.classList.add("active");
    btn.innerHTML = trackKey === "rain" ? "🌧️" : (trackKey === "piano" ? "🎹" : (trackKey === "chiptune" ? "🎮" : "🎶"));
  }

  updateMusicPopoverUI();
  
  const trackNames = {
    lofi: "Cozy Lofi Beats ☕",
    rain: "Gentle Rain & Cafe 🌧️",
    chiptune: "Kawaii 8-Bit Melody 🎮",
    piano: "Peaceful Ghibli Piano 🎹"
  };
  setMascot(`${trackNames[trackKey] || "Music"} chalu ho gaya! Sukoon se type karo 🌸`, "normal");
}

function toggleLofiMusic() {
  if (STATE.lofiPlaying) {
    // If playing, toggle popover
    toggleMusicPopover();
  } else {
    // If stopped, play current selected track and open popover
    selectMusicTrack(CURRENT_BGM_TRACK || "lofi");
    toggleMusicPopover(true);
  }
}

function stopMusicTrack() {
  STATE.lofiPlaying = false;
  stopMusicLoopOnly();

  const btn = document.getElementById("lofiToggle");
  if (btn) {
    btn.classList.remove("active");
    btn.innerHTML = "🎵";
  }

  updateMusicPopoverUI();
  setMascot("Music paused 🌸", "normal");
}

function stopMusicLoopOnly() {
  if (CURRENT_BGM_INTERVAL) {
    clearInterval(CURRENT_BGM_INTERVAL);
    CURRENT_BGM_INTERVAL = null;
  }
  if (CURRENT_RAIN_NODE) {
    try {
      CURRENT_RAIN_NODE.stop();
      CURRENT_RAIN_NODE.disconnect();
    } catch(_) {}
    CURRENT_RAIN_NODE = null;
  }
}

function startTrackLoop(trackKey) {
  stopMusicLoopOnly();
  if (!STATE.lofiPlaying) return;

  if (trackKey === "lofi") {
    playLofiChords();
    CURRENT_BGM_INTERVAL = setInterval(playLofiChords, 2800);
  } else if (trackKey === "rain") {
    playRainAmbiance();
  } else if (trackKey === "chiptune") {
    playChiptuneArp();
    CURRENT_BGM_INTERVAL = setInterval(playChiptuneArp, 2400);
  } else if (trackKey === "piano") {
    playPianoArp();
    CURRENT_BGM_INTERVAL = setInterval(playPianoArp, 3000);
  }
}

// 1. Cozy Lofi Chords (Rhodes Warm Chords)
function playLofiChords() {
  if (!STATE.lofiPlaying || CURRENT_BGM_TRACK !== "lofi") return;
  try {
    const ctx = getAudioContext();
    const chords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [146.83, 174.61, 220.00, 261.63], // Dm7
      [130.81, 164.81, 196.00, 246.94]  // Cmaj7
    ];
    const currentChord = chords[bgmChordIndex % chords.length];
    bgmChordIndex++;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(550, ctx.currentTime);
    filter.connect(ctx.destination);

    currentChord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(filter);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const startTime = ctx.currentTime + idx * 0.05;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.038, startTime + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.6);

      osc.start(startTime);
      osc.stop(startTime + 2.7);
    });
  } catch (_) {}
}

// 2. Gentle Rain & Cafe Ambiance (Synthesized Brown Noise)
function playRainAmbiance() {
  if (!STATE.lofiPlaying || CURRENT_BGM_TRACK !== "rain") return;
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.035, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start();
    CURRENT_RAIN_NODE = noiseSource;
  } catch (_) {}
}

// 3. Kawaii 8-Bit Melody (Animal Crossing / Game Theme)
function playChiptuneArp() {
  if (!STATE.lofiPlaying || CURRENT_BGM_TRACK !== "chiptune") return;
  try {
    const ctx = getAudioContext();
    const melodies = [
      [523.25, 659.25, 783.99, 987.77, 783.99, 659.25, 587.33, 523.25], // C - E - G - B - G - E - D - C
      [440.00, 523.25, 659.25, 783.99, 659.25, 523.25, 493.88, 440.00]  // A - C - E - G - E - C - B - A
    ];
    const notes = melodies[bgmChiptuneIndex % melodies.length];
    bgmChiptuneIndex++;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.22);

      const startTime = ctx.currentTime + idx * 0.22;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.035, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.26);

      osc.start(startTime);
      osc.stop(startTime + 0.28);
    });
  } catch (_) {}
}

// 4. Peaceful Ghibli Piano (Classical Flowing Arpeggios)
function playPianoArp() {
  if (!STATE.lofiPlaying || CURRENT_BGM_TRACK !== "piano") return;
  try {
    const ctx = getAudioContext();
    const chords = [
      [293.66, 369.99, 440.00, 587.33], // D - F# - A - D5
      [277.18, 329.63, 440.00, 554.37], // C# - E - A - C#5
      [246.94, 293.66, 369.99, 493.88], // B - D - F# - B
      [196.00, 246.94, 293.66, 392.00]  // G - B - D - G
    ];
    const chord = chords[bgmPianoIndex % chords.length];
    bgmPianoIndex++;

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.35);

      const startTime = ctx.currentTime + idx * 0.35;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.042, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

      osc.start(startTime);
      osc.stop(startTime + 1.7);
    });
  } catch (_) {}
}

// Close popover when clicking anywhere outside
document.addEventListener("click", (e) => {
  const wrapper = document.getElementById("duoMusicWrapper");
  if (wrapper && !wrapper.contains(e.target)) {
    toggleMusicPopover(false);
  }
});

/* ═══════════════════════════════════════════════════
   4. HYBRID NEURAL AUDIO ENGINE (English + Hindi Duolingo Duo Voice)
   - Tier 1: Local Pre-bundled Edge Neural Audio (100 core words, 200 files)
   - Tier 2: Real-time Google Neural Audio Stream (HTML5 new Audio)
   - Tier 3: Browser SpeechSynthesis (Natural Hindi / Indian English) offline fallback
   ═══════════════════════════════════════════════════ */

// Pre-bundled local offline audio list generated with Edge Neural TTS
const LOCAL_AUDIO_SET = new Set([
  "apple", "baby", "bad", "big", "bird", "black", "blue", "book", "boy", "bread",
  "brother", "car", "cat", "chair", "child", "city", "cold", "cow", "cry", "dance",
  "dog", "door", "dream", "ear", "eye", "face", "fast", "father", "fire", "fish",
  "flower", "food", "friend", "fruit", "girl", "gold", "good", "green", "hand", "happy",
  "head", "heart", "horse", "hot", "house", "king", "laugh", "light", "love", "man",
  "milk", "moon", "mother", "name", "new", "night", "old", "paper", "pen", "pencil",
  "play", "queen", "rain", "read", "red", "rice", "river", "road", "room", "run",
  "sad", "school", "shirt", "shoe", "silver", "sing", "sister", "sky", "sleep", "slow",
  "small", "smile", "star", "sun", "sweet", "table", "tea", "test", "time", "train",
  "tree", "village", "walk", "water", "white", "wind", "window", "woman", "write", "yellow"
]);

let CURRENT_AUDIO_PLAYING = null;
let CURRENT_SPEECH_TIMER = null;
let CURRENT_AUDIO_SESSION_ID = 0;

function stopCurrentAudio() {
  CURRENT_AUDIO_SESSION_ID++; // Invalidate any pending callbacks, fallback attempts, or sequence timers!

  if (CURRENT_SPEECH_TIMER) {
    clearTimeout(CURRENT_SPEECH_TIMER);
    CURRENT_SPEECH_TIMER = null;
  }

  if (CURRENT_AUDIO_PLAYING) {
    try {
      // Detach listeners first so pause/abort doesn't trigger phantom callbacks
      CURRENT_AUDIO_PLAYING.onplay = null;
      CURRENT_AUDIO_PLAYING.onended = null;
      CURRENT_AUDIO_PLAYING.onerror = null;
      CURRENT_AUDIO_PLAYING.pause();
      CURRENT_AUDIO_PLAYING.currentTime = 0;
    } catch(e) {}
    CURRENT_AUDIO_PLAYING = null;
  }

  if ("speechSynthesis" in window) {
    try { window.speechSynthesis.cancel(); } catch(e) {}
  }

  // Clear any playing-audio classes from pills
  document.getElementById("speakBtn")?.classList.remove("playing-audio");
  document.getElementById("speakHindiBtn")?.classList.remove("playing-audio");
  document.getElementById("turtleSpeakBtn")?.classList.remove("playing-audio");
}

function getBestVoice(type) {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (type === "hi") {
    return voices.find(v =>
      v.lang === "hi-IN" || v.lang === "hi_IN" || v.lang.startsWith("hi") ||
      v.name.includes("हिन्दी") || v.name.toLowerCase().includes("hindi") ||
      v.name.includes("Kalpana") || v.name.includes("Hemant")
    ) || null;
  } else {
    return voices.find(v =>
      (v.lang === "en-IN" || v.lang === "en_IN" || v.name.toLowerCase().includes("india") ||
       v.name.includes("Heera") || v.name.includes("Neerja") || v.name.includes("Ravi"))
    ) || voices.find(v =>
      v.lang.startsWith("en") &&
      (v.name.includes("Google") || v.name.includes("Zira") || v.name.includes("Natural"))
    ) || voices.find(v => v.lang.startsWith("en")) || null;
  }
}

function cleanHindiForSpeech(text) {
  if (!text) return "";
  let clean = text.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim();
  if (clean.includes("/")) {
    clean = clean.split("/")[0].trim();
  }
  if (clean.includes(",")) {
    clean = clean.split(",")[0].trim();
  }
  return clean.trim();
}

/**
 * Universal voice player:
 * 1. Checks local pre-bundled neural audio (instant offline)
 * 2. If not local, streams real Google neural human voice (online)
 * 3. If stream fails or device is offline, falls back immediately to SpeechSynthesis (strictly once!)
 */
function playAudioVoice({ text, lang, isSlow = false, baseWord = "", onStart, onEnd }) {
  if (!STATE.soundEnabled) {
    if (onEnd) onEnd();
    return;
  }

  stopCurrentAudio();
  const sessionId = CURRENT_AUDIO_SESSION_ID; // Locks this specific playback session

  const cleanText = lang === "hi" ? cleanHindiForSpeech(text) : (text || "").replace(/[^a-zA-Z0-9\s]/g, "").trim();
  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  const lookupKey = (baseWord || cleanText).toLowerCase().replace(/[^a-z0-9]/g, "");

  // Determine potential local pre-bundled file
  let localAudioUrl = null;
  if (lookupKey && LOCAL_AUDIO_SET.has(lookupKey)) {
    localAudioUrl = `./audio/${lookupKey}_${lang}.mp3`;
  }

  // Google neural stream URL
  const googleStreamUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${lang}&client=tw-ob`;

  // Fallback to browser SpeechSynthesis (Guaranteed to execute at most ONCE)
  let fallbackAttempted = false;
  function doSpeechSynthesisFallback() {
    if (fallbackAttempted || sessionId !== CURRENT_AUDIO_SESSION_ID) return;
    fallbackAttempted = true;

    if (!("speechSynthesis" in window)) {
      if (sessionId === CURRENT_AUDIO_SESSION_ID && onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (lang === "hi") {
        utterance.lang = "hi-IN";
        utterance.rate = 0.92;
        utterance.pitch = 1.0;
        const v = getBestVoice("hi");
        if (v) { utterance.voice = v; utterance.lang = v.lang; }
      } else {
        utterance.lang = "en-US";
        utterance.rate = isSlow ? 0.55 : (STATE.speechRate || 0.95);
        utterance.pitch = isSlow ? 1.05 : 1.0;
        const v = getBestVoice("en");
        if (v) { utterance.voice = v; utterance.lang = v.lang; }
      }

      if (onStart && sessionId === CURRENT_AUDIO_SESSION_ID) onStart();
      utterance.onend = () => {
        if (sessionId === CURRENT_AUDIO_SESSION_ID && onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (sessionId === CURRENT_AUDIO_SESSION_ID && onEnd) onEnd();
      };
      window.speechSynthesis.speak(utterance);
    } catch(e) {
      if (sessionId === CURRENT_AUDIO_SESSION_ID && onEnd) onEnd();
    }
  }

  // Target URL: local first, then stream (if online)
  const targetUrl = localAudioUrl || (navigator.onLine !== false ? googleStreamUrl : null);

  if (!targetUrl) {
    doSpeechSynthesisFallback();
    return;
  }

  try {
    const audio = new Audio(targetUrl);
    CURRENT_AUDIO_PLAYING = audio;
    audio.playbackRate = isSlow ? 0.70 : 1.0;

    let hasEnded = false;
    const safeEnd = () => {
      if (hasEnded || sessionId !== CURRENT_AUDIO_SESSION_ID) return;
      hasEnded = true;
      if (CURRENT_AUDIO_PLAYING === audio) CURRENT_AUDIO_PLAYING = null;
      if (onEnd) onEnd();
    };

    audio.onplay = () => {
      if (sessionId === CURRENT_AUDIO_SESSION_ID && onStart) onStart();
    };

    audio.onended = safeEnd;

    audio.onerror = () => {
      if (sessionId !== CURRENT_AUDIO_SESSION_ID) return;
      CURRENT_AUDIO_PLAYING = null;
      doSpeechSynthesisFallback();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        if (sessionId !== CURRENT_AUDIO_SESSION_ID) return;
        CURRENT_AUDIO_PLAYING = null;
        doSpeechSynthesisFallback();
      });
    }
  } catch(e) {
    doSpeechSynthesisFallback();
  }
}

function speakWord(text, isSlow = false) {
  if (!STATE.soundEnabled) return;
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
  if (words.length > 5 || (typeof CURRENT_SIMPLIFIED_MODE !== "undefined" && CURRENT_SIMPLIFIED_MODE === "paragraph_50")) {
    return;
  }

  const btnId = isSlow ? "turtleSpeakBtn" : "speakBtn";
  const btn = document.getElementById(btnId);

  playAudioVoice({
    text: text,
    lang: "en",
    isSlow: isSlow,
    baseWord: text,
    onStart: () => { btn?.classList.add("playing-audio"); },
    onEnd: () => { btn?.classList.remove("playing-audio"); }
  });
}

function speakHindiOnly(text, baseWord = "") {
  if (!STATE.soundEnabled) return;
  const hiBtn = document.getElementById("speakHindiBtn");

  playAudioVoice({
    text: text,
    lang: "hi",
    isSlow: false,
    baseWord: baseWord || STATE.targetText,
    onStart: () => { hiBtn?.classList.add("playing-audio"); },
    onEnd: () => { hiBtn?.classList.remove("playing-audio"); }
  });
}

function speakHindi(text) {
  speakHindiOnly(text, STATE.targetText);
}

// Speaks English first, followed smoothly by Hindi in "Chhote Shabd" mode!
function speakWordAndHindi(englishText, hindiText, isSlow = false) {
  if (!STATE.soundEnabled) return;
  if (typeof CURRENT_SIMPLIFIED_MODE !== "undefined" && CURRENT_SIMPLIFIED_MODE === "paragraph_50") {
    return;
  }

  const cleanEn = (englishText || "").replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const cleanHi = cleanHindiForSpeech(hindiText);

  if (!cleanEn && !cleanHi) return;
  if (!cleanEn && cleanHi) {
    speakHindiOnly(cleanHi, englishText);
    return;
  }

  stopCurrentAudio();
  const pairSessionId = CURRENT_AUDIO_SESSION_ID; // Pin this whole duo sequence

  const speakBtn = document.getElementById("speakBtn");
  const hiBtn    = document.getElementById("speakHindiBtn");

  // Step 1: Play English
  playAudioVoice({
    text: cleanEn,
    lang: "en",
    isSlow: isSlow,
    baseWord: cleanEn,
    onStart: () => {
      if (pairSessionId === CURRENT_AUDIO_SESSION_ID) speakBtn?.classList.add("playing-audio");
    },
    onEnd: () => {
      speakBtn?.classList.remove("playing-audio");

      // Step 2: If Hindi exists and session is still active, play Hindi after 220ms
      if (cleanHi && pairSessionId === CURRENT_AUDIO_SESSION_ID) {
        if (CURRENT_SPEECH_TIMER) clearTimeout(CURRENT_SPEECH_TIMER);
        CURRENT_SPEECH_TIMER = setTimeout(() => {
          CURRENT_SPEECH_TIMER = null;
          if (!STATE.soundEnabled || pairSessionId !== CURRENT_AUDIO_SESSION_ID) return;
          playAudioVoice({
            text: cleanHi,
            lang: "hi",
            isSlow: false,
            baseWord: cleanEn,
            onStart: () => {
              if (pairSessionId === CURRENT_AUDIO_SESSION_ID) hiBtn?.classList.add("playing-audio");
            },
            onEnd: () => {
              hiBtn?.classList.remove("playing-audio");
            }
          });
        }, 220);
      }
    }
  });
}

/* ═══════════════════════════════════════════════════
   5. MIMI THE CLAY MASCOT COMPANION CONTROLLER
   ═══════════════════════════════════════════════════ */

function setMascot(message, emotion = "normal") {
  const bubble = document.getElementById("mascotBubble");
  const figure = document.getElementById("mascotFigure");
  if (bubble) bubble.textContent = message;

  if (figure) {
    if (emotion === "cheer") {
      figure.style.transform = "scale(1.18) translateY(-4px)";
      setTimeout(() => { figure.style.transform = ""; }, 350);
    } else if (emotion === "encourage") {
      figure.style.transform = "scale(0.95) rotate(-3deg)";
      setTimeout(() => { figure.style.transform = ""; }, 300);
    }
  }
}

function showFloatingXp(amount = 10) {
  const layer = document.getElementById("floatingXpLayer");
  if (!layer) return;

  const item = document.createElement("div");
  item.className = "floating-xp-item";
  item.textContent = `+${amount} XP ⭐`;
  item.style.left = `${Math.floor(Math.random() * 40 + 30)}%`;
  item.style.top  = `${Math.floor(Math.random() * 30 + 40)}%`;

  layer.appendChild(item);
  setTimeout(() => item.remove(), 700);
}

/* ═══════════════════════════════════════════════════
   5b. CLOUD CONNECTION & AUTO-UPDATE ENGINE
   ═══════════════════════════════════════════════════ */

function initCloudConnectionSync() {
  updateConnectionStatus();
  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);

  // Check periodically every 60 seconds if online
  setInterval(() => {
    if (navigator.onLine) {
      checkForWebUpdates();
    }
  }, 60000);
}

function updateConnectionStatus() {
  const badge = document.getElementById("liveConnectionBadge");
  const menuIcon = document.getElementById("menuConnIcon");
  const menuTitle = document.getElementById("menuConnTitle");
  const menuSub = document.getElementById("menuConnSub");

  if (navigator.onLine) {
    if (badge) {
      badge.className = "badge-conn-pill online";
      badge.innerHTML = "☁️";
      badge.title = "Cloud Connected (Online & Auto-updates enabled)";
    }
    if (menuIcon) menuIcon.textContent = "☁️";
    if (menuTitle) menuTitle.textContent = "Cloud Connected";
    if (menuSub) menuSub.textContent = "Auto-updating enabled";
    checkForWebUpdates();
  } else {
    if (badge) {
      badge.className = "badge-conn-pill offline";
      badge.innerHTML = "🟢";
      badge.title = "100% Offline Mode (Bina internet ke chal raha hai)";
    }
    if (menuIcon) menuIcon.textContent = "🟢";
    if (menuTitle) menuTitle.textContent = "100% Offline Ready";
    if (menuSub) menuSub.textContent = "Bina internet sabhi lessons chalenge";
  }
}

const CURRENT_APP_BUILD = 2026111512; // Matches version.json build 2026111512 (v2.8.0 Duolingo 3D Shabd Khoj Redesign)

async function checkForWebUpdates() {
  try {
    const res = await fetch("https://gk2352444-lab.github.io/typocute/version.json?t=" + Date.now());
    if (!res.ok) return;
    const data = await res.json();
    
    // Check if student already applied or dismissed this build
    const dismissedBuild = parseInt(localStorage.getItem("typo_dismissed_update") || "0", 10);
    if (data.build && data.build > CURRENT_APP_BUILD && data.build > dismissedBuild) {
      showUpdateAvailableToast(data);
    }
  } catch(e) {}
}

window.applyWebUpdate = async function(targetBuild) {
  try {
    if (targetBuild) {
      localStorage.setItem("typo_dismissed_update", targetBuild.toString());
    }
    const toast = document.getElementById("typoUpdateToast");
    if (toast) toast.remove();

    // Clear service worker caches to force immediate refresh of all files
    if ("serviceWorker" in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let reg of registrations) {
          await reg.update();
        }
        if ("caches" in window) {
          const keys = await caches.keys();
          for (let key of keys) {
            await caches.delete(key);
          }
        }
      } catch(e) {}
    }
    
    // Force reload with cache-busting query param
    const cleanUrl = window.location.origin + window.location.pathname;
    window.location.href = cleanUrl + "?t=" + Date.now();
  } catch(err) {
    window.location.reload();
  }
};

window.dismissWebUpdate = function(targetBuild) {
  if (targetBuild) {
    localStorage.setItem("typo_dismissed_update", targetBuild.toString());
  }
  const toast = document.getElementById("typoUpdateToast");
  if (toast) toast.remove();
};

function showUpdateAvailableToast(updateData) {
  if (document.getElementById("typoUpdateToast")) return;
  const targetBuild = updateData.build || 0;
  const toast = document.createElement("div");
  toast.id = "typoUpdateToast";
  toast.className = "update-toast-banner";
  toast.innerHTML = `
    <div class="ut-content">
      <span class="ut-icon">✨</span>
      <div>
        <strong>Naya Update Ready Hai! (v${updateData.version || "New"})</strong>
        <p>Server se naye features aa gaye hain. Refresh karke apply karein.</p>
      </div>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      <button class="ut-btn" onclick="applyWebUpdate(${targetBuild})">🔄 Refresh Karein</button>
      <button class="ut-close-btn" onclick="dismissWebUpdate(${targetBuild})" title="Baad me karein">✕</button>
    </div>
  `;
  document.body.appendChild(toast);
}

/* ═══════════════════════════════════════════════════
   6. DOM-READY BOOTSTRAP
   ═══════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  try {
    const initialHash = window.location.hash.replace("#", "");

    initStorage();
    initNavigation();
    initCurriculumUI();
    initTypingArena();
    initVirtualKeyboard();
    initLiveHands();
    initAIScreen();
    initCustomTextScreen();
    initAi50WordStudio();
    initAiParagraphModal();
    initAi50WordStudio();
    initAiParagraphModal();
    initWordOfTheDay();
    initVocabularyDiary();
    initStatsScreen();
    initBrotherNote();
    initFamilyProgressCard();
    initStretchBreakTimer();
    initCuteCursorTrail();
    initModeToggles();

    // Sister's Simplified 2-Mode App (Small Words & 50-Word Paragraphs)
    initSimplifiedTwoModeApp();
    initVocabQuiz();
    initCloudConnectionSync();

    // Check URL hash for direct navigation
    if (initialHash && ["arena", "curriculum", "ai", "custom", "stats"].includes(initialHash)) {
      switchTab(initialHash);
    } else {
      switchTab("arena");
    }
  } catch (err) {
    window.__bootstrap_error = err.message + "\n" + err.stack;
    console.error("BOOTSTRAP ERROR:", err);
  }
});

/* ═══════════════════════════════════════════════════
   7. LOCAL STORAGE & PERSISTENCE
   ═══════════════════════════════════════════════════ */

function initStorage() {
  const saved = localStorage.getItem("typo_stats");
  if (saved) {
    try {
      const p = JSON.parse(saved);
      STATE.streak          = p.streak          || 1;
      STATE.totalWordsTyped = p.totalWordsTyped || 0;
      STATE.bestWpm         = p.bestWpm         || 0;
      STATE.weakKeys        = p.weakKeys        || {};
      STATE.xp              = p.xp              || 0;
      STATE.gems            = p.gems            || 15;
      STATE.hearts          = p.hearts          !== undefined ? p.hearts : 5;
      STATE.unlockedNodes   = p.unlockedNodes   || ["l0_1"];
      STATE.nodeStars       = p.nodeStars       || {};
      STATE.stickers        = p.stickers        || ["stk_starter"];
      STATE.theme               = p.theme               || "pink";
      STATE.accessory           = p.accessory           || "bow";
      STATE.unlockedThemes      = p.unlockedThemes      || ["pink"];
      STATE.unlockedAccessories = p.unlockedAccessories || ["bow"];
      STATE.studentName         = p.studentName         || "Pooja Sharma";
      STATE.brotherNote         = p.brotherNote         || STATE.brotherNote;
      STATE.handsGuideEnabled   = p.handsGuideEnabled !== undefined ? p.handsGuideEnabled : true;
      if (p.quests && p.quests.date === new Date().toDateString()) {
        STATE.quests = p.quests;
      }
    } catch (_) {}
  }

  // Apply saved theme immediately
  document.documentElement.dataset.theme = STATE.theme || "pink";
  renderMimiAccessory();

  // Daily streak check
  const lastDate = localStorage.getItem("typo_last_date");
  const today    = new Date().toDateString();
  if (lastDate !== today) {
    if (lastDate) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastDate === yesterday) STATE.streak += 1;
    }
    localStorage.setItem("typo_last_date", today);
    STATE.quests = {
      date: today,
      wordsTyped: 0,
      accuracyDone: false,
      practiceTime: 0,
      claimed: [false, false, false]
    };
    STATE.hearts = 5;
    saveStats();
  }

  updateHeaderBadges();
  STATE.hfToken = localStorage.getItem("hf_token") || "";
}

function saveStats() {
  localStorage.setItem("typo_stats", JSON.stringify({
    streak:          STATE.streak,
    totalWordsTyped: STATE.totalWordsTyped,
    bestWpm:         STATE.bestWpm,
    weakKeys:        STATE.weakKeys,
    xp:              STATE.xp,
    gems:            STATE.gems,
    hearts:          STATE.hearts,
    unlockedNodes:   STATE.unlockedNodes,
    nodeStars:       STATE.nodeStars,
    quests:          STATE.quests,
    stickers:        STATE.stickers,
    theme:               STATE.theme,
    accessory:           STATE.accessory,
    unlockedThemes:      STATE.unlockedThemes,
    unlockedAccessories: STATE.unlockedAccessories,
    studentName:         STATE.studentName,
    brotherNote:         STATE.brotherNote,
    handsGuideEnabled:   STATE.handsGuideEnabled
  }));
  updateHeaderBadges();
}

function updateHeaderBadges() {
  const streakEl = document.getElementById("headerStreak");
  const xpEl     = document.getElementById("headerXp");
  const gemsEl   = document.getElementById("headerGems");
  const heartsEl = document.getElementById("liveHearts");

  if (streakEl) streakEl.textContent = `🍓 ${STATE.streak} Day Streak`;
  if (xpEl)     xpEl.textContent     = STATE.xp;
  if (gemsEl)   gemsEl.textContent   = STATE.gems;
  if (heartsEl) heartsEl.textContent = "∞";
}

function addXp(amount) {
  STATE.xp += amount;
  showFloatingXp(amount);
  saveStats();
}

function addGems(amount) {
  STATE.gems += amount;
  saveStats();
}

function deductHeart() {
  // Unlimited Practice: No hearts deduction, stress-free learning!
  return;
}

/* ═══════════════════════════════════════════════════
   8. NAVIGATION TABS
   ═══════════════════════════════════════════════════ */

function initNavigation() {
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });
}

function switchTab(tabName) {
  STATE.currentTab = tabName;
  try {
    if (window.location.hash !== `#${tabName}`) {
      window.history.replaceState(null, "", `#${tabName}`);
    }
  } catch (_) {}

  document.querySelectorAll(".nav-tab").forEach(t =>
    t.classList.toggle("active", t.dataset.tab === tabName)
  );
  document.querySelectorAll(".tab-pane").forEach(p =>
    p.classList.toggle("active", p.id === `tab-${tabName}`)
  );

  if (tabName === "stats") renderStatsAndQuests();
  else if (tabName === "curriculum") renderCurriculumView();
  else if (tabName === "arena") focusTypingArea();
}

/* ═══════════════════════════════════════════════════
   9. VIRTUAL KEYBOARD & FINGER GUIDE
   ═══════════════════════════════════════════════════ */

function initVirtualKeyboard() {
  const rows = [
    ["`","1","2","3","4","5","6","7","8","9","0","-","=",
     { label:"Backspace", key:"Backspace", class:"key-wider" }],

    [{ label:"Tab", key:"Tab", class:"key-wide" },
     "q","w","e","r","t","y","u","i","o","p","[","]","\\"],

    [{ label:"Caps", key:"CapsLock", class:"key-wide" },
     "a","s","d","f","g","h","j","k","l",";","'",
     { label:"Enter", key:"Enter", class:"key-wider" }],

    [{ label:"Shift", key:"Shift", class:"key-widest" },
     "z","x","c","v","b","n","m",",",".","/",
     { label:"Shift", key:"Shift", class:"key-widest" }],

    [{ label:"Ctrl", key:"Control", class:"key-wide" },
     { label:"Alt",  key:"Alt" },
     { label:"Space",key:" ", class:"key-space" },
     { label:"Alt",  key:"Alt" },
     { label:"Ctrl", key:"Control", class:"key-wide" }]
  ];

  const kb = document.getElementById("virtualKeyboard");
  if (!kb) return;
  kb.innerHTML = "";

  rows.forEach(r => {
    const rowEl = document.createElement("div");
    rowEl.className = "keyboard-row";

    r.forEach(k => {
      const item = typeof k === "string" ? { label: k.toUpperCase(), key: k } : k;
      const el   = document.createElement("div");
      el.className    = `key ${item.class || ""}`;
      el.dataset.key  = item.key.toLowerCase();
      el.textContent  = item.label;

      const mapping = FINGER_MAP[item.key.toLowerCase()];
      if (mapping) el.classList.add(mapping.class);

      rowEl.appendChild(el);
    });

    kb.appendChild(rowEl);
  });
}

function updateActiveKeyboardKey() {
  document.querySelectorAll(".key.active-target").forEach(k =>
    k.classList.remove("active-target")
  );
  document.querySelectorAll(".finger-group").forEach(f =>
    f.classList.remove("finger-active")
  );

  if (STATE.isCompleted || STATE.mode === "quiz") return;

  const nextChar = STATE.targetText[STATE.typedText.length];
  if (!nextChar) return;

  const lowerChar = nextChar.toLowerCase();
  const isUpper   = nextChar >= "A" && nextChar <= "Z";

  const targetKey = document.querySelector(
    `.key[data-key="${lowerChar === " " ? " " : lowerChar}"]`
  );
  if (targetKey) targetKey.classList.add("active-target");

  if (isUpper) {
    document.querySelectorAll('.key[data-key="shift"]').forEach(sk =>
      sk.classList.add("active-target")
    );
  }

  const mapping     = FINGER_MAP[lowerChar];
  const fingerTip   = document.getElementById("fingerTipText");
  const fingerBadge = document.getElementById("fingerBadge");

  if (mapping && fingerTip && fingerBadge) {
    const displayChar = nextChar === " " ? "SPACEBAR" : `'${nextChar}'`;
    const shiftHint   = isUpper ? "<strong>[Hold SHIFT]</strong> + " : "";
    fingerTip.innerHTML =
      `${shiftHint}Press <strong>${displayChar}</strong> with ` +
      `<strong>${mapping.finger}</strong> (${mapping.hand})`;
    fingerBadge.style.color =
      getComputedStyle(document.documentElement)
        .getPropertyValue(`--${mapping.class}`);

    updateLiveHandsHighlight(mapping, isUpper);
  }
}

/* ═══════════════════════════════════════════════════
   10. TYPING ARENA & DUOLINGO FEEDBACK ENGINE
   ═══════════════════════════════════════════════════ */

function initTypingArena() {
  const container   = document.getElementById("typingContainer");
  const soundToggle = document.getElementById("soundToggle");
  const speakBtn    = document.getElementById("speakBtn");
  const turtleBtn   = document.getElementById("turtleSpeakBtn");
  const restartBtn  = document.getElementById("restartBtn");
  const continueBtn = document.getElementById("duoContinueBtn");
  const exitBtn     = document.getElementById("duoExitBtn");

  if (container) container.addEventListener("click", focusTypingArea);
  document.addEventListener("keydown", handleGlobalKeyDown);

  continueBtn?.addEventListener("click", dismissDuoFeedbackAndAdvance);
  document.getElementById("girlishContinueBtn")?.addEventListener("click", dismissDuoFeedbackAndAdvance);
  exitBtn?.addEventListener("click", () => switchTab("curriculum"));

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      STATE.soundEnabled = !STATE.soundEnabled;
      soundToggle.classList.toggle("active", STATE.soundEnabled);
      soundToggle.innerHTML = STATE.soundEnabled ? "🔊" : "🔇";
    });
  }

  const lofiBtn = document.getElementById("lofiToggle");
  if (lofiBtn) {
    lofiBtn.addEventListener("click", toggleLofiMusic);
  }

  if (speakBtn) {
    speakBtn.addEventListener("click", () => {
      speakWord(STATE.targetText, false);
      focusTypingArea();
    });
  }

  const speakHindiBtn = document.getElementById("speakHindiBtn");
  if (speakHindiBtn) {
    speakHindiBtn.addEventListener("click", () => {
      speakHindiOnly(STATE.targetHindi);
      focusTypingArea();
    });
  }

  const hindiMeaningEl = document.getElementById("hindiMeaningText");
  if (hindiMeaningEl) {
    hindiMeaningEl.addEventListener("click", () => {
      speakHindiOnly(STATE.targetHindi);
      focusTypingArea();
    });
  }

  if (turtleBtn) {
    turtleBtn.addEventListener("click", () => {
      speakWord(STATE.targetText, true);
      focusTypingArea();
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      resetCurrentItem();
  updateGrammarBite();
      focusTypingArea();
    });
  }

  // Unlimited Practice: Hearts modal removed
  document.getElementById("heartsPill")?.addEventListener("click", () => {
    setMascot("Aapka Unlimited Mode on hai! Bina kisi darr ke khul kar practice karein! 💖🌸", "happy");
  });
}

function initModeToggles() {
  const classicBtn = document.getElementById("modeClassicBtn");
  const tilesBtn   = document.getElementById("modeTilesBtn");
  const listenBtn  = document.getElementById("modeListenBtn");
  const quizBtn    = document.getElementById("modeQuizBtn");

  classicBtn?.addEventListener("click", () => {
    STATE.mode = "classic";
    setActiveModeButton(classicBtn);
    showTypingView();
    renderTypingText();
    setMascot("Classic Mode! Screen dekho aur type karo 🌸", "normal");
    focusTypingArea();
  });

  tilesBtn?.addEventListener("click", () => {
    STATE.mode = "tiles";
    setActiveModeButton(tilesBtn);
    showTilesView();
    setupTilesView();
    setMascot("Word Bank Mode! Words ko sahi order me lagao 🔤", "cheer");
  });

  listenBtn?.addEventListener("click", () => {
    STATE.mode = "listen";
    setActiveModeButton(listenBtn);
    showTypingView();
    renderTypingText();
    speakWord(STATE.targetText, false);
    setMascot("Listen carefully & type! 🎧", "cheer");
    focusTypingArea();
  });

  quizBtn?.addEventListener("click", () => {
    STATE.mode = "quiz";
    setActiveModeButton(quizBtn);
    showQuizView();
    setupQuizOptions();
    setMascot("Guess the Hindi meaning! 🧩", "cheer");
  });

  const chatBtn = document.getElementById("modeChatBtn");
  chatBtn?.addEventListener("click", () => {
    STATE.mode = "chat";
    setActiveModeButton(chatBtn);
    showChatView();
    setupChatView();
    setMascot("Mimi ke sath real conversation karo! Sentence bolo aur type karo 💬🌸", "happy");
    focusTypingArea();
  });
}

function setActiveModeButton(activeBtn) {
  document.querySelectorAll(".mode-pill").forEach(b => b.classList.remove("active"));
  activeBtn.classList.add("active");
}

function showTypingView() {
  const tc = document.getElementById("typingCore");
  const tb = document.getElementById("tilesCore");
  const qc = document.getElementById("quizCore");
  const cc = document.getElementById("chatCore");
  if (tc) tc.style.display = "flex";
  if (tb) tb.style.display = "none";
  if (qc) qc.style.display = "none";
  if (cc) cc.style.display = "none";

  const badge = document.getElementById("duoTaskBadge");
  if (badge) {
    badge.textContent = STATE.mode === "listen" ? "🎧 LISTEN & TYPE" : "🌸 TRANSLATE TO ENGLISH";
  }
}

function showTilesView() {
  const tc = document.getElementById("typingCore");
  const tb = document.getElementById("tilesCore");
  const qc = document.getElementById("quizCore");
  const cc = document.getElementById("chatCore");
  if (tc) tc.style.display = "none";
  if (tb) tb.style.display = "flex";
  if (qc) qc.style.display = "none";
  if (cc) cc.style.display = "none";

  const badge = document.getElementById("duoTaskBadge");
  if (badge) badge.textContent = "🔤 WORD BANK TILES";
}

function showQuizView() {
  const tc = document.getElementById("typingCore");
  const tb = document.getElementById("tilesCore");
  const qc = document.getElementById("quizCore");
  const cc = document.getElementById("chatCore");
  if (tc) tc.style.display = "none";
  if (tb) tb.style.display = "none";
  if (qc) qc.style.display = "flex";
  if (cc) cc.style.display = "none";

  const badge = document.getElementById("duoTaskBadge");
  if (badge) badge.textContent = "🧩 MEANING MATCH QUIZ";
}

function showChatView() {
  const tc = document.getElementById("typingCore");
  const tb = document.getElementById("tilesCore");
  const qc = document.getElementById("quizCore");
  const cc = document.getElementById("chatCore");
  if (tc) tc.style.display = "none";
  if (tb) tb.style.display = "none";
  if (qc) qc.style.display = "none";
  if (cc) cc.style.display = "flex";

  const badge = document.getElementById("duoTaskBadge");
  if (badge) badge.textContent = "💬 REAL-LIFE CONVERSATION";
}

function focusTypingArea() {
  if (STATE.mode === "quiz" || STATE.mode === "tiles") return;
  const input     = document.getElementById("hiddenInput");
  const container = document.getElementById("typingContainer");
  if (input)     input.focus();
  if (container) container.classList.add("focused");
}

function handleGlobalKeyDown(e) {
  if (STATE.currentTab !== "arena") return;

  // 1. Enter or Space dismisses the Celebration Modal / Feedback Sheet
  const girlishModal = document.getElementById("girlishCelebrationModal");
  if ((STATE.feedbackActive || (girlishModal && girlishModal.classList.contains("active"))) && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    dismissDuoFeedbackAndAdvance();
    return;
  }

  // 2. Keyboard shortcuts in Quiz Mode (1, 2, 3)
  if (STATE.mode === "quiz") {
    if (["1", "2", "3"].includes(e.key)) {
      e.preventDefault();
      const idx = parseInt(e.key) - 1;
      const opts = document.querySelectorAll(".quiz-option-card");
      if (opts[idx]) opts[idx].click();
    }
    return;
  }

  // 3. Keyboard shortcuts in Word-Bank Tiles Mode (1-9 to select, Backspace to undo)
  if (STATE.mode === "tiles") {
    if (e.key >= "1" && e.key <= "9") {
      e.preventDefault();
      const tile = document.querySelector(`.tiles-bank-grid .word-tile[data-idx="${e.key}"]`);
      if (tile && !tile.classList.contains("placed")) tile.click();
      return;
    } else if (e.key === "Backspace") {
      e.preventDefault();
      const placed = document.querySelectorAll("#tilesDropzone .word-tile.in-dropzone");
      if (placed.length > 0) placed[placed.length - 1].click();
      return;
    }
    return;
  }

  if (e.target.tagName === "INPUT" && e.target.id !== "hiddenInput") return;
  if (e.target.tagName === "TEXTAREA") return;

  if (e.ctrlKey || e.altKey || e.metaKey) return;
  if (["Tab","CapsLock","Shift","Control","Alt","Escape"].includes(e.key)) return;

  // Animate pressed key on virtual keyboard
  const pressedEl = document.querySelector(`.key[data-key="${e.key.toLowerCase()}"]`);
  if (pressedEl) {
    pressedEl.classList.add("pressed");
    setTimeout(() => pressedEl.classList.remove("pressed"), 120);
  }

  // Backspace
  if (e.key === "Backspace") {
    e.preventDefault();
    if (STATE.typedText.length > 0) {
      STATE.typedText = STATE.typedText.slice(0, -1);
      renderTypingText();
      updateActiveKeyboardKey();
    }
    return;
  }

  if (e.key.length === 1) {
    e.preventDefault();
    handleCharacterTyped(e.key);
  }
}

function handleCharacterTyped(char) {
  if (STATE.isCompleted || STATE.feedbackActive) return;

  if (!STATE.startTime) {
    STATE.startTime = Date.now();
    startTimer();
  }

  const expectedChar = STATE.targetText[STATE.typedText.length];
  const isCorrect    = char === expectedChar;

  STATE.totalTyped++;
  if (isCorrect) {
    STATE.correctChars++;
    STATE.combo++;
    if (STATE.combo > STATE.maxCombo) STATE.maxCombo = STATE.combo;

    playTypingClick(true);
    addXp(5);
    triggerKittyCheer();

    updateComboDisplay();
    if (STATE.combo === 5) {
      playComboChime();
      setMascot("🔥 5x Combo! You're on fire!", "cheer");
    } else if (STATE.combo === 10) {
      playComboChime();
      setMascot("⚡ 10x SUPER COMBO! Amazing!", "cheer");
      unlockSticker("stk_combo");
    }
  } else {
    STATE.errors++;
    STATE.combo = 0;
    playTypingClick(false);
    updateComboDisplay();

    const lowKey = expectedChar ? expectedChar.toLowerCase() : char.toLowerCase();
    STATE.weakKeys[lowKey] = (STATE.weakKeys[lowKey] || 0) + 1;

    // Heart deduction on repeated mistakes
    if (STATE.errors % 4 === 0) deductHeart();

    setMascot("Aaram se! Dekho kaun sa button dabana hai 💡", "encourage");
  }

  STATE.typedText += char;
  STATE.activeTypingSeconds++;
  if (STATE.activeTypingSeconds - STATE.lastBreakAt >= 1200) {
    showStretchBreakModal();
  }

  renderTypingText();
  updateLiveMetrics();
  updateActiveKeyboardKey();

  // Word complete -> Trigger Duolingo Sliding Feedback Sheet or Chat advance!
  if (STATE.typedText.length >= STATE.targetText.length) {
    playWordCompleteChime();
    addXp(20);
    addGems(1);
    updateQuestProgress("word");

    if (STATE.mode === "chat") {
      handleChatSentenceCompleted();
      return;
    }

    const flawless = STATE.errors === 0;
    showDuoFeedback(flawless, flawless ? "Shaabash! Ekdum Sahi! 🌸" : "Achha prayas! Word Complete! 💖");
  }
}

function triggerKittyCheer() {
  const peekers = document.querySelectorAll(".kitty-peeker");
  peekers.forEach(p => {
    p.classList.add("cheer-pop");
    setTimeout(() => p.classList.remove("cheer-pop"), 180);
  });
}

/* ═══════════════════════════════════════════════════
   11. GIRLISH CELEBRATION POP-UP MODAL (100% NOT RED)
   ═══════════════════════════════════════════════════ */

function showDuoFeedback(isCorrect = true, title = "Shaabash! Ekdum Sahi! 🌸") {
  STATE.feedbackActive = true;
  clearInterval(STATE.timerInterval);
  updateLiveMetrics();

  const modal          = document.getElementById("girlishCelebrationModal");
  const titleEl        = document.getElementById("girlishModalTitle");
  const subEl          = document.getElementById("girlishModalSubtitle");
  const typedWordEl    = document.getElementById("girlishTypedWord");
  const pronounceEl    = document.getElementById("girlishPronounce");
  const hindiQuoteEl   = document.getElementById("girlishHindiQuote");
  const speakBtn       = document.getElementById("girlishSpeakBtn");
  const vocabDuoBox    = document.getElementById("vocabDuoContainer");
  const essayDuoBox    = document.getElementById("essayDuoContainer");
  const essayTopicEl   = document.getElementById("girlishEssayTopicTag");
  const essayHiTextEl  = document.getElementById("girlishEssayHiText");

  const wpmEl          = document.getElementById("girlishWpm");
  const accEl          = document.getElementById("girlishAccuracy");
  const xpEl           = document.getElementById("girlishXp");
  const comboEl        = document.getElementById("girlishCombo");
  const continueBtn    = document.getElementById("girlishContinueBtn");

  if (!modal) {
    advanceToNextItem();
    return;
  }

  const isFinalItem = (STATE.itemIndex + 1 >= STATE.currentItems.length);
  const wordsCount  = (STATE.targetText || "").trim().split(/\s+/).filter(Boolean).length;
  const isParagraph = wordsCount >= 8 || (STATE.targetText || "").length > 60;

  // Reward calculation
  const earnedXp   = isParagraph ? 80 : 25;
  const earnedGems = isParagraph ? 5 : 1;
  addXp(earnedXp);
  addGems(earnedGems);

  // Girlish Sound & Visual Celebration
  playVictoryChime();
  launchConfetti();

  // Title & Subtitle
  if (titleEl) {
    if (isParagraph) {
      titleEl.textContent = "Wah! 50-Word Essay Complete! 🌸✨";
    } else if (isFinalItem) {
      titleEl.textContent = "Shaabash! Pura Lesson Complete! 💖✨";
    } else if (isCorrect) {
      titleEl.textContent = "Shaabash! Ekdum Sahi! 🌸✨";
    } else {
      titleEl.textContent = "Achha Prayas! Word Complete! 💖🌸";
    }
  }

  if (subEl) {
    if (isParagraph) {
      subEl.textContent = "Aapne pura 50 shabdon ka paragraph shandar speed aur accuracy se complete kiya!";
    } else if (STATE.accuracy >= 90) {
      subEl.textContent = "Superb accuracy! Har ek shabd ke sath aapki English aur speed dono badh rahi hai! 🌸";
    } else {
      subEl.textContent = "Bohot pyari typing! Aise hi lagatar practice karein! 💖";
    }
  }

  // Populate Vocabulary Showcase (NO MORE ADHURA SLOP!)
  if (isParagraph) {
    if (vocabDuoBox) vocabDuoBox.style.display = "none";
    if (essayDuoBox) {
      essayDuoBox.style.display = "block";
      if (essayTopicEl) essayTopicEl.textContent = `📝 ${STATE.currentLesson?.title || "50-Word Essay"} Complete!`;
      if (essayHiTextEl) essayHiTextEl.textContent = STATE.targetHindi || "बहुत सुंदर निबंध!";
    }
  } else {
    if (essayDuoBox) essayDuoBox.style.display = "none";
    if (vocabDuoBox) vocabDuoBox.style.display = "flex";

    const word = STATE.targetText || "";
    if (typedWordEl)  typedWordEl.textContent  = word;
    if (pronounceEl)  pronounceEl.textContent  = `[ ${word.toLowerCase()} ]`;
    if (hindiQuoteEl) hindiQuoteEl.textContent = STATE.targetHindi || "अर्थ";

    if (speakBtn) {
      speakBtn.onclick = () => {
        speakWordAndHindi(word, STATE.targetHindi);
      };
    }
  }

  // Smart Realistic Speed Calculation (Never 0 WPM!)
  let displayWpm = STATE.wpm;
  if (!displayWpm || displayWpm <= 0) {
    const durationSec = Math.max(1.2, (Date.now() - (STATE.itemStartTime || Date.now() - 2200)) / 1000);
    const chars = (STATE.targetText || "").length;
    displayWpm = Math.round(((chars / 5) / (durationSec / 60)));
    if (displayWpm < 18) displayWpm = 28;
    if (displayWpm > 90) displayWpm = 45;
  }

  if (wpmEl)   wpmEl.textContent   = `${displayWpm} WPM`;
  if (accEl)   accEl.textContent   = `${Math.max(85, STATE.accuracy || 100)}%`;
  if (xpEl)    xpEl.textContent    = `+${earnedXp} XP`;
  if (comboEl) comboEl.textContent = `${Math.max(STATE.combo || 1, STATE.maxCombo || 1)}x`;

  // Button text
  if (continueBtn) {
    continueBtn.innerHTML = isFinalItem 
      ? `<span>🎉 Finish & Continue</span> <kbd>↵ Enter</kbd>` 
      : `<span>🌸 Continue Next (आगे बढ़ें)</span> <kbd>↵ Enter</kbd>`;
  }

  setMascot("Wah! Pura ho gaya! Kamal kar diya! 🌸💖", "cheer");
  modal.classList.add("active");
}

function dismissDuoFeedbackAndAdvance() {
  STATE.feedbackActive = false;
  const modal = document.getElementById("girlishCelebrationModal");
  if (modal) modal.classList.remove("active");

  const sheet = document.getElementById("duoFeedbackSheet");
  if (sheet) sheet.classList.remove("active");

  if (STATE.itemIndex + 1 >= STATE.currentItems.length) {
    STATE.isCompleted = true;
    addXp(60);
    saveStats();
    if (typeof advanceSimplifiedLesson === "function") {
      advanceSimplifiedLesson();
    } else {
      advanceToNextItem();
    }
  } else {
    advanceToNextItem();
    focusTypingArea();
  }
}

/* ═══════════════════════════════════════════════════
   12. DUOLINGO MEANING MATCH QUIZ MODE
   ═══════════════════════════════════════════════════ */

function setupQuizOptions() {
  const grid = document.getElementById("quizOptionsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  // Auto-pronounce
  speakWord(STATE.targetText, false);

  // Correct answer
  const correct = STATE.targetHindi;

  // Gather distractors from Level 1
  const allVocab = [];
  LESSONS_DATABASE.level1.forEach(cat => {
    cat.items.forEach(it => {
      if (it.hindi !== correct && !allVocab.includes(it.hindi)) {
        allVocab.push(it.hindi);
      }
    });
  });

  // Shuffle 2 distractors
  allVocab.sort(() => Math.random() - 0.5);
  const options = [correct, allVocab[0] || "दोस्त", allVocab[1] || "घर"].sort(() => Math.random() - 0.5);

  options.forEach((optText, idx) => {
    const card = document.createElement("div");
    card.className = "quiz-option-card";
    card.innerHTML = `
      <span class="quiz-opt-num">${idx + 1}</span>
      <span class="quiz-opt-text">${optText}</span>
    `;

    card.addEventListener("click", () => {
      if (STATE.feedbackActive) return;
      const isCorrect = optText === correct;
      if (isCorrect) {
        card.classList.add("correct");
        playWordCompleteChime();
        addXp(25);
        addGems(1);
        updateQuestProgress("word");
        showDuoFeedback(true, "Bilkul Sahi Jawab! 🌟");
      } else {
        card.classList.add("wrong");
        playErrorBoop();
        deductHeart();
        showDuoFeedback(false, `Galat! Sahi jawab tha: "${correct}"`);
      }
    });

    grid.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════════
   12b. DUOLINGO WORD-BANK TILES MODE
   ═══════════════════════════════════════════════════ */

function setupTilesView() {
  const dropzone = document.getElementById("tilesDropzone");
  const bankGrid = document.getElementById("tilesBankGrid");
  if (!dropzone || !bankGrid) return;

  dropzone.innerHTML = `<span class="tiles-slot-empty">Click or press number keys (1-6) to assemble words</span>`;
  bankGrid.innerHTML = "";

  // Auto-pronounce
  speakWord(STATE.targetText, false);

  // Target tokens
  let correctTokens = [];
  if (STATE.targetText.includes(" ")) {
    correctTokens = STATE.targetText.split(" ");
  } else {
    correctTokens = [STATE.targetText];
  }

  // Gather distractors
  const distractors = [];
  const currentLvl = STATE.currentLesson?.level || "level1";
  if (LESSONS_DATABASE[currentLvl]) {
    LESSONS_DATABASE[currentLvl].forEach(cat => {
      const items = cat.items || [];
      items.forEach(it => {
        const w = it.word || it.english;
        if (w && !correctTokens.includes(w) && !distractors.includes(w)) {
          distractors.push(w);
        }
      });
    });
  }

  distractors.sort(() => Math.random() - 0.5);
  const extraNeeded = Math.max(3, 5 - correctTokens.length);
  const pickedDistractors = distractors.slice(0, extraNeeded);

  const allTokens = [...correctTokens, ...pickedDistractors].sort(() => Math.random() - 0.5);
  const placedTokens = [];

  function checkTilesAnswer() {
    const assembled = placedTokens.join(" ");
    if (assembled === STATE.targetText) {
      playWordCompleteChime();
      addXp(25);
      addGems(1);
      updateQuestProgress("word");
      showDuoFeedback(true, "Amazing! Word Bank Complete! 🌸");
    } else if (placedTokens.length >= correctTokens.length) {
      playErrorBoop();
      deductHeart();
      showDuoFeedback(false, `Word Order galat! Sahi tha: "${STATE.targetText}"`);
    }
  }

  function renderDropzone() {
    dropzone.innerHTML = "";
    if (placedTokens.length === 0) {
      dropzone.innerHTML = `<span class="tiles-slot-empty">Click or press number keys to assemble words</span>`;
      return;
    }
    placedTokens.forEach((tok, pIdx) => {
      const placedBtn = document.createElement("button");
      placedBtn.className = "word-tile in-dropzone";
      placedBtn.textContent = tok;
      placedBtn.title = "Click to remove back to bank";
      placedBtn.addEventListener("click", () => {
        if (STATE.feedbackActive) return;
        placedTokens.splice(pIdx, 1);
        playTileClick();
        renderDropzone();
        updateBankPlacedState();
      });
      dropzone.appendChild(placedBtn);
    });
  }

  function updateBankPlacedState() {
    const allBankEls = bankGrid.querySelectorAll(".word-tile");
    const counts = {};
    placedTokens.forEach(t => counts[t] = (counts[t] || 0) + 1);

    allBankEls.forEach(b => {
      const token = b.dataset.token;
      if (counts[token] && counts[token] > 0) {
        b.classList.add("placed");
        counts[token]--;
      } else {
        b.classList.remove("placed");
      }
    });
  }

  allTokens.forEach((token, idx) => {
    const tile = document.createElement("button");
    tile.className = "word-tile";
    tile.dataset.token = token;
    tile.dataset.idx = idx + 1;
    tile.innerHTML = `<span class="tile-key-hint">${idx + 1}</span> <span>${token}</span>`;

    tile.addEventListener("click", () => {
      if (STATE.feedbackActive || tile.classList.contains("placed")) return;
      placedTokens.push(token);
      playTileClick();
      renderDropzone();
      updateBankPlacedState();
      checkTilesAnswer();
    });

    bankGrid.appendChild(tile);
  });
}

function updateComboDisplay() {
  const pill  = document.getElementById("comboPill");
  const count = document.getElementById("comboCount");
  if (!pill || !count) return;

  count.textContent = STATE.combo;
  if (STATE.combo >= 3) {
    pill.classList.add("active-combo");
  } else {
    pill.classList.remove("active-combo");
  }
}

function renderTypingText() {
  const el = document.getElementById("textDisplay");
  if (!el) return;
  el.innerHTML = "";

  const text = STATE.targetText || "";
  const wordsCount = text.trim().split(/\s+/).filter(Boolean).length;
  const isParagraph = (wordsCount >= 8) || (text.length > 60);

  if (isParagraph) {
    el.classList.add("is-paragraph");
  } else {
    el.classList.remove("is-paragraph");
  }

  let currentWordSpan = null;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const isSpace = (ch === " ");

    const span = document.createElement("span");
    span.className = "char";

    if (STATE.mode === "listen" && i >= STATE.typedText.length) {
      span.textContent = i === STATE.typedText.length ? "?" : "•";
    } else {
      span.textContent = ch;
    }

    if (isSpace) {
      span.classList.add("is-space");
    }

    if (i < STATE.typedText.length) {
      span.classList.add(
        STATE.typedText[i] === ch ? "correct" : "wrong"
      );
    } else if (i === STATE.typedText.length) {
      span.classList.add("current");
    } else {
      span.classList.add("untyped");
    }

    if (isSpace) {
      currentWordSpan = null;
      el.appendChild(span);
    } else {
      if (!currentWordSpan) {
        currentWordSpan = document.createElement("span");
        currentWordSpan.className = "word-token";
        el.appendChild(currentWordSpan);
      }
      currentWordSpan.appendChild(span);
    }
  }

  if (isParagraph) {
    const currentChar = el.querySelector(".char.current");
    if (currentChar) {
      currentChar.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  const chatDisplay = document.getElementById("chatTargetDisplay");
  if (STATE.mode === "chat" && chatDisplay) {
    chatDisplay.innerHTML = "";
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = text[i];
      chatDisplay.appendChild(span);
    }
  }
}

/* ═══════════════════════════════════════════════════
   13. LIVE METRICS & TIMER
   ═══════════════════════════════════════════════════ */

function updateLiveMetrics() {
  const elapsedSec = (Date.now() - (STATE.startTime || Date.now())) / 1000;
  const elapsedMin = elapsedSec / 60;

  if (elapsedMin > 0.05) {
    STATE.wpm      = Math.round((STATE.correctChars / 5) / elapsedMin);
    STATE.accuracy = Math.round((STATE.correctChars / (STATE.totalTyped || 1)) * 100);
  }

  const wpmEl = document.getElementById("liveWpm");
  const accEl = document.getElementById("liveAccuracy");
  if (wpmEl) wpmEl.textContent = STATE.wpm;
  if (accEl) accEl.textContent = `${STATE.accuracy}%`;

  if (STATE.wpm >= 20) unlockSticker("stk_speed");
}

function startTimer() {
  clearInterval(STATE.timerInterval);
  STATE.timerInterval = setInterval(() => {
    if (!STATE.startTime) return;
    const total = Math.floor((Date.now() - STATE.startTime) / 1000);
    const m = Math.floor(total / 60).toString().padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    const timeEl = document.getElementById("liveTime");
    if (timeEl) timeEl.textContent = `${m}:${s}`;
    updateLiveMetrics();

    STATE.quests.practiceTime += 0.5;
  }, 500);
}

function resetCurrentItem() {
  STATE.typedText   = "";
  STATE.startTime   = null;
  clearInterval(STATE.timerInterval);
  STATE.wpm         = 0;
  STATE.accuracy    = 100;
  STATE.errors      = 0;
  STATE.totalTyped  = 0;
  STATE.correctChars = 0;
  STATE.combo       = 0;
  STATE.feedbackActive = false;

  updateComboDisplay();

  const wpmEl  = document.getElementById("liveWpm");
  const accEl  = document.getElementById("liveAccuracy");
  const timeEl = document.getElementById("liveTime");
  if (wpmEl)  wpmEl.textContent  = "0";
  if (accEl)  accEl.textContent  = "100%";
  if (timeEl) timeEl.textContent = "00:00";

  renderTypingText();
  updateActiveKeyboardKey();
}

/* ═══════════════════════════════════════════════════
   14. LESSON LOADING & PROGRESSION
   ═══════════════════════════════════════════════════ */

function loadLesson(lessonObj, items, navigate = true) {
  STATE.currentLesson = lessonObj;
  STATE.currentItems  = items;
  STATE.itemIndex     = 0;
  STATE.isCompleted   = false;

  const titleEl = document.getElementById("lessonTitle");
  const hintEl  = document.getElementById("lessonHindiHint");
  if (titleEl) titleEl.textContent = lessonObj.title;
  if (hintEl)  hintEl.textContent  = lessonObj.hindi || lessonObj.category || "Practice";

  loadItem(0);
  if (navigate) switchTab("arena");
  setMascot("Naya lesson shuru! Best of luck! 🌸", "normal");
}

function loadItem(index) {
  if (index >= STATE.currentItems.length) {
    showLessonCompletedModal();
    return;
  }

  STATE.itemIndex = index;
  const item = STATE.currentItems[index];

  if (typeof item === "string") {
    STATE.targetText  = item;
    STATE.targetHindi = STATE.currentLesson?.hindi || "";
  } else if (item.word) {
    STATE.targetText  = item.word;
    STATE.targetHindi = item.hindi;
  } else if (item.english) {
    STATE.targetText  = item.english;
    STATE.targetHindi = item.hindi;
  }

  const hindiEl = document.getElementById("hindiMeaningText");
  if (hindiEl) hindiEl.textContent = STATE.targetHindi;

  const displayEl   = document.getElementById("textDisplay");
  const wordsCount  = STATE.targetText.trim().split(/\s+/).filter(Boolean).length;
  const pronounceEl = document.getElementById("promptPronounce");
  const audioActions = document.getElementById("duoAudioActions");
  const categoryTag  = document.getElementById("promptCategoryTag");
  const speechBubble = document.getElementById("duoSpeechBubble");
  const grammarBite  = document.getElementById("duoGrammarBite");

  if (wordsCount >= 8 || STATE.targetText.length > 60) {
    displayEl?.classList.add("is-paragraph");
    speechBubble?.classList.add("is-paragraph-bubble");
    if (audioActions) audioActions.style.display = "none";
    if (categoryTag)  categoryTag.style.display = "inline-block";
    if (grammarBite)  grammarBite.style.display = "none";
    if (pronounceEl) {
      pronounceEl.textContent = `[ 📝 50-Word Continuous Essay • ${wordsCount} Words ]`;
    }
  } else {
    displayEl?.classList.remove("is-paragraph");
    speechBubble?.classList.remove("is-paragraph-bubble");
    if (audioActions) audioActions.style.display = "flex";
    if (categoryTag)  categoryTag.style.display = "none";
    if (grammarBite)  grammarBite.style.display = "flex";
    const translit = DEVANAGARI_PRONUNCIATION[STATE.targetText] || "";
    if (pronounceEl) {
      pronounceEl.textContent = translit ? `[ ${STATE.targetText} • ${translit} ]` : `[ ${STATE.targetText} ]`;
    }
  }

  const pct = Math.round(((index + 1) / STATE.currentItems.length) * 100);
  const barEl   = document.getElementById("progressBarFill");
  const countEl = document.getElementById("progressCount");
  if (barEl)   barEl.style.width  = `${pct}%`;
  if (countEl) countEl.textContent = `${index + 1} / ${STATE.currentItems.length}`;

  resetCurrentItem();
  updateGrammarBite();

  if (STATE.mode === "quiz") {
    setupQuizOptions();
  } else if (STATE.mode === "tiles") {
    setupTilesView();
  } else {
    // In Chhote Shabd (small words), speak both English and Hindi!
    if (CURRENT_SPEECH_TIMER) {
      clearTimeout(CURRENT_SPEECH_TIMER);
      CURRENT_SPEECH_TIMER = null;
    }
    if (typeof CURRENT_SIMPLIFIED_MODE === "undefined" || CURRENT_SIMPLIFIED_MODE === "small_words") {
      CURRENT_SPEECH_TIMER = setTimeout(() => {
        CURRENT_SPEECH_TIMER = null;
        speakWordAndHindi(STATE.targetText, STATE.targetHindi, false);
      }, 150);
    } else {
      CURRENT_SPEECH_TIMER = setTimeout(() => {
        CURRENT_SPEECH_TIMER = null;
        speakWord(STATE.targetText, false);
      }, 150);
    }
  }
}

function advanceToNextItem() {
  loadItem(STATE.itemIndex + 1);
}

/* ═══════════════════════════════════════════════════
   15. LESSON COMPLETION CELEBRATION
   ═══════════════════════════════════════════════════ */

function showLessonCompletedModal() {
  STATE.isCompleted = true;
  clearInterval(STATE.timerInterval);

  STATE.totalWordsTyped += STATE.currentItems.length;
  if (STATE.wpm > STATE.bestWpm) STATE.bestWpm = STATE.wpm;

  let stars = 1;
  if (STATE.accuracy >= 95) stars = 3;
  else if (STATE.accuracy >= 85) stars = 2;

  if (STATE.currentLesson?.id) {
    STATE.nodeStars[STATE.currentLesson.id] = Math.max(
      STATE.nodeStars[STATE.currentLesson.id] || 0,
      stars
    );
    unlockNextPathNode(STATE.currentLesson.id);
  }

  addXp(120);
  addGems(10);

  if (STATE.accuracy >= 90) {
    STATE.quests.accuracyDone = true;
  }

  if (STATE.accuracy === 100) unlockSticker("stk_accuracy");
  unlockSticker("stk_lesson");

  saveStats();
  playVictoryChime();
  launchConfetti();

  const girlishModal = document.getElementById("girlishCelebrationModal");
  if (girlishModal) {
    const titleEl   = document.getElementById("girlishModalTitle");
    const subEl     = document.getElementById("girlishModalSubtitle");
    const hindiCard = document.getElementById("girlishHindiCard");
    const hindiQuote= document.getElementById("girlishHindiQuote");
    const wpmElG    = document.getElementById("girlishWpm");
    const accElG    = document.getElementById("girlishAccuracy");
    const xpElG     = document.getElementById("girlishXp");
    const comboElG  = document.getElementById("girlishCombo");
    const continueBtn = document.getElementById("girlishContinueBtn");

    const wordsCount = (STATE.targetText || "").trim().split(/\s+/).filter(Boolean).length;
    const isParagraph = wordsCount >= 8;

    if (titleEl) {
      if (isParagraph) {
        titleEl.textContent = "Wah! 50-Word Essay Complete! 🌸✨";
      } else {
        titleEl.textContent = stars === 3 ? "🌸 FABULOUS! 3 STARS! ⭐⭐⭐" : "🌸 Shaabash! Lesson Complete! 💖✨";
      }
    }

    if (subEl) {
      if (isParagraph) {
        subEl.textContent = "Aapne pura 50 shabdon ka paragraph kamal ki speed aur accuracy se complete kiya!";
      } else {
        subEl.textContent = stars === 3 
          ? "Kamaal kar diya! 100% perfect accuracy aur shandar speed!" 
          : "Bahut pyari typing! Aise hi practice karte rahein!";
      }
    }

    if (hindiCard && hindiQuote) {
      if (STATE.targetHindi && STATE.targetHindi.trim()) {
        hindiQuote.textContent = `"${STATE.targetHindi}"`;
        hindiCard.style.display = "block";
      } else {
        hindiCard.style.display = "none";
      }
    }

    if (wpmElG)   wpmElG.textContent   = `${STATE.wpm} WPM`;
    if (accElG)   accElG.textContent   = `${STATE.accuracy}%`;
    if (xpElG)    xpElG.textContent    = "+120 XP ⭐";
    if (comboElG) comboElG.textContent = `${Math.max(STATE.combo, STATE.maxCombo || 1)}x`;

    if (continueBtn) {
      continueBtn.innerHTML = `<span>🌸 Agla Lesson (Next)</span> <kbd>↵ Enter</kbd>`;
      continueBtn.onclick = () => {
        girlishModal.classList.remove("active");
        if (typeof advanceSimplifiedLesson === "function") {
          advanceSimplifiedLesson();
        }
      };
    }

    setMascot("Wah! Lesson poora ho gaya! ⭐🌸✨", "cheer");
    girlishModal.classList.add("active");
    return;
  }

  const modal        = document.getElementById("celebrationModal");
  const wpmEl        = document.getElementById("modalWpm");
  const accEl        = document.getElementById("modalAccuracy");
  const xpEl         = document.getElementById("modalXpEarned");
  const praiseEl     = document.getElementById("modalHindiPraise");
  const streakTitle  = document.getElementById("modalStreakTitle");

  if (wpmEl) wpmEl.textContent = STATE.wpm;
  if (accEl) accEl.textContent = `${STATE.accuracy}%`;
  if (xpEl)  xpEl.textContent  = "+120 XP ⭐ (+10 💎)";

  if (streakTitle) streakTitle.textContent = `Day ${STATE.streak} Streak Extended!`;

  if (praiseEl) {
    if (stars === 3) {
      praiseEl.textContent = "⭐⭐⭐ 3 STARS! Kamal kar diya! Perfect typing! 🌸✨";
    } else if (stars === 2) {
      praiseEl.textContent = "⭐⭐ 2 STARS! Bahut badhiya speed aur accuracy! 💖";
    } else {
      praiseEl.textContent = "⭐ Lesson Complete! Roz thoda practice sab asaan bana dega! 🍓";
    }
  }

  setMascot("Wah! Lesson poora ho gaya! 🏆✨", "cheer");
  if (modal) modal.classList.add("active");
}

document.getElementById("modalNextBtn")?.addEventListener("click", () => {
  document.getElementById("celebrationModal")?.classList.remove("active");
  switchTab("curriculum");
});

document.getElementById("modalRetryBtn")?.addEventListener("click", () => {
  document.getElementById("celebrationModal")?.classList.remove("active");
  loadItem(0);
});

/* ═══════════════════════════════════════════════════
   16. DUOLINGO WINDING LEARNING PATH WITH UNITS
   ═══════════════════════════════════════════════════ */

function getAllLessonsFlat() {
  const list = [];
  const unitNames = {
    level0: "Unit 1: Home Row Mastery (शुरुआती उंगलियाँ)",
    level1: "Unit 2: 500 Daily Vocabulary (रोज़ के शब्द)",
    level2: "Unit 3: Essential Phrases (रोज़मर्रा के वाक्य)",
    level3: "Unit 4: Real Grammar Sentences (वाक्य रचना)",
    level4: "Unit 5: Stories & Dialogue (कहानियाँ और बातचीत)",
    level5: "Unit 6: 50-Word Continuous Essays (50 शब्दों के निबंध)"
  };

  Object.entries(LESSONS_DATABASE).forEach(([lvlKey, lessons]) => {
    lessons.forEach((l, idx) => {
      let icon = "⭐";
      if (lvlKey === "level0") icon = "⌨️";
      else if (lvlKey === "level1") icon = "🌸";
      else if (lvlKey === "level2") icon = "💬";
      else if (lvlKey === "level3") icon = "📖";
      else if (lvlKey === "level4") icon = "🏆";
      else if (lvlKey === "level5") icon = "✍️";
      list.push({ ...l, level: lvlKey, icon, unitHeader: idx === 0 ? unitNames[lvlKey] : null });
    });
  });
  return list;
}

function unlockNextPathNode(currentId) {
  const flat = getAllLessonsFlat();
  const idx  = flat.findIndex(l => l.id === currentId);
  if (idx !== -1 && idx + 1 < flat.length) {
    const nextId = flat[idx + 1].id;
    if (!STATE.unlockedNodes.includes(nextId)) {
      STATE.unlockedNodes.push(nextId);
    }
  }
}

function initCurriculumUI() {
  const pathBtn = document.getElementById("viewPathBtn");
  const gridBtn = document.getElementById("viewGridBtn");

  pathBtn?.addEventListener("click", () => {
    STATE.pathView = "path";
    pathBtn.classList.add("active");
    gridBtn?.classList.remove("active");
    renderCurriculumView();
  });

  gridBtn?.addEventListener("click", () => {
    STATE.pathView = "grid";
    gridBtn.classList.add("active");
    pathBtn?.classList.remove("active");
    renderCurriculumView();
  });

  renderLevelGrid("level0List", LESSONS_DATABASE.level0, l => loadLesson(l, l.text.split(" ")));
  renderLevelGrid("level1List", LESSONS_DATABASE.level1, l => loadLesson(l, l.items));
  renderLevelGrid("level2List", LESSONS_DATABASE.level2, l => loadLesson(l, l.items));
  renderLevelGrid("level3List", LESSONS_DATABASE.level3, l => loadLesson(l, l.items));
  renderLevelGrid("level4List", LESSONS_DATABASE.level4, l => loadLesson(l, l.lines));
  renderLevelGrid("level5List", LESSONS_DATABASE.level5, l => loadLesson(l, l.items));
}

function renderCurriculumView() {
  const pathContainer = document.getElementById("windingPathContainer");
  const gridContainer = document.getElementById("gridCurriculumContainer");

  if (STATE.pathView === "path") {
    if (pathContainer) pathContainer.style.display = "flex";
    if (gridContainer) gridContainer.style.display = "none";
    renderWindingPath();
  } else {
    if (pathContainer) pathContainer.style.display = "none";
    if (gridContainer) gridContainer.style.display = "block";
  }
}

function renderWindingPath() {
  const container = document.getElementById("windingPathContainer");
  if (!container) return;
  container.innerHTML = "";

  const flat = getAllLessonsFlat();
  const offsets = ["offset-center", "offset-left", "offset-center", "offset-right"];

  flat.forEach((lesson, idx) => {
    // If unit header
    if (lesson.unitHeader) {
      const banner = document.createElement("div");
      banner.className = "path-view-header";
      banner.style.width = "100%";
      banner.style.marginTop = idx > 0 ? "24px" : "0";
      banner.innerHTML = `
        <div class="path-title">
          <h2>${lesson.unitHeader}</h2>
        </div>
      `;
      container.appendChild(banner);
    }

    const isUnlocked  = STATE.unlockedNodes.includes(lesson.id);
    const stars       = STATE.nodeStars[lesson.id] || 0;
    const isCompleted = stars > 0;
    const isActive    = isUnlocked && !isCompleted;

    const row = document.createElement("div");
    row.className = `path-step-row ${offsets[idx % offsets.length]}`;

    const node = document.createElement("div");
    node.className = `path-node ${isCompleted ? "completed" : (isActive ? "active-node" : "locked")}`;

    let starDisplay = "";
    if (stars === 3) starDisplay = "⭐⭐⭐";
    else if (stars === 2) starDisplay = "⭐⭐";
    else if (stars === 1) starDisplay = "⭐";

    node.innerHTML = `
      ${stars > 0 ? `<div class="path-node-stars">${starDisplay}</div>` : ""}
      <div class="path-node-icon">${isUnlocked ? lesson.icon : "🔒"}</div>
      <div class="path-node-label">${lesson.title.split("(")[0].trim()}</div>
    `;

    if (isUnlocked) {
      node.addEventListener("click", () => {
        const items = lesson.items || lesson.lines || lesson.text.split(" ");
        loadLesson(lesson, items);
      });
    }

    row.appendChild(node);
    container.appendChild(row);

    // Connecting dashed line
    if (idx < flat.length - 1) {
      const line = document.createElement("div");
      line.className = "path-connector-line";
      container.appendChild(line);
    }
  });
}

function renderLevelGrid(containerId, list, onClickFn) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  list.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "lesson-btn";
    btn.innerHTML = `
      <div class="lesson-btn-title">${item.title}</div>
      <div class="lesson-btn-desc">${item.hindi || item.category || "Interactive Practice"}</div>
    `;
    btn.addEventListener("click", () => onClickFn(item));
    container.appendChild(btn);
  });
}

function loadLessonById(id, navigate = true) {
  for (const lvl of Object.values(LESSONS_DATABASE)) {
    const found = lvl.find(l => l.id === id);
    if (found) {
      const items = found.items || found.lines || found.text.split(" ");
      loadLesson(found, items, navigate);
      return;
    }
  }
}

/* ═══════════════════════════════════════════════════
   17. DAILY QUESTS & STICKER ALBUM SYSTEM
   ═══════════════════════════════════════════════════ */

const STICKERS_CONFIG = [
  { id: "stk_starter", icon: "🍓", name: "Strawberry Rookie", desc: "Started typing journey!" },
  { id: "stk_speed",   icon: "⚡", name: "Speed Queen",       desc: "Crossed 20 WPM speed!" },
  { id: "stk_accuracy",icon: "🎯", name: "100% Accuracy",     desc: "Perfect flawless lesson!" },
  { id: "stk_combo",   icon: "🔥", name: "10x Combo Legend",  desc: "10 flawless keystrokes!" },
  { id: "stk_lesson",  icon: "👑", name: "Lesson Champion",   desc: "Completed a full lesson!" },
  { id: "stk_treasure",icon: "💎", name: "Treasure Hunter",   desc: "Collected 50+ Gems!" }
];

function unlockSticker(id) {
  if (!STATE.stickers.includes(id)) {
    STATE.stickers.push(id);
    saveStats();
  }
}

function updateQuestProgress(type) {
  if (type === "word") {
    STATE.quests.wordsTyped++;
  }
  saveStats();
}

function renderStatsAndQuests() {
  const streakEl = document.getElementById("statStreakDisplay");
  const xpEl     = document.getElementById("statXpDisplay");
  const gemsEl   = document.getElementById("statGemsDisplay");
  const wordsEl  = document.getElementById("statWordsDisplay");
  const bestEl   = document.getElementById("statBestWpmDisplay");

  if (streakEl) streakEl.textContent = `${STATE.streak} Days`;
  if (xpEl)     xpEl.textContent     = `${STATE.xp} XP`;
  if (gemsEl)   gemsEl.textContent   = STATE.gems;
  if (wordsEl)  wordsEl.textContent  = STATE.totalWordsTyped;
  if (bestEl)   bestEl.textContent   = `${STATE.bestWpm} WPM`;

  renderDailyQuests();
  renderLeagueRoster();
  renderBoutiqueShop();
  renderStickers();
  renderWeakKeys();
}

function renderDailyQuests() {
  const container = document.getElementById("questsList");
  if (!container) return;
  container.innerHTML = "";

  const questsData = [
    {
      title: "📝 Type 30 Words Today",
      current: Math.min(STATE.quests.wordsTyped, 30),
      goal: 30,
      reward: "+20 💎",
      claimed: STATE.quests.claimed[0]
    },
    {
      title: "🎯 90%+ Accuracy in 1 Lesson",
      current: STATE.quests.accuracyDone ? 1 : 0,
      goal: 1,
      reward: "+25 💎",
      claimed: STATE.quests.claimed[1]
    },
    {
      title: "⏱️ Practice for 3 Minutes",
      current: Math.min(Math.floor(STATE.quests.practiceTime / 60), 3),
      goal: 3,
      reward: "+20 💎",
      claimed: STATE.quests.claimed[2]
    }
  ];

  let allCompleted = true;

  questsData.forEach((q, idx) => {
    const isDone = q.current >= q.goal;
    if (!isDone) allCompleted = false;
    const pct = Math.round((q.current / q.goal) * 100);

    const item = document.createElement("div");
    item.className = "quest-item";
    item.innerHTML = `
      <div class="quest-info">
        <div class="quest-title">${q.title} (${q.current} / ${q.goal})</div>
        <div class="quest-bar"><div class="quest-fill" style="width:${pct}%"></div></div>
      </div>
      <button class="quest-reward ${q.claimed ? 'claimed' : ''}" id="claimBtn_${idx}">
        ${q.claimed ? '✅ Claimed' : (isDone ? '🎁 Claim 💎' : q.reward)}
      </button>
    `;

    item.querySelector(`#claimBtn_${idx}`)?.addEventListener("click", () => {
      if (isDone && !q.claimed) {
        STATE.quests.claimed[idx] = true;
        addGems(parseInt(q.reward));
        playWordCompleteChime();
        renderDailyQuests();
      }
    });

    container.appendChild(item);
  });

  const crownBadge = document.getElementById("questCrownBadge");
  if (crownBadge) {
    if (allCompleted) {
      crownBadge.textContent = "👑 All Quests Completed!";
      crownBadge.classList.add("completed");
    } else {
      crownBadge.textContent = "👑 In Progress";
      crownBadge.classList.remove("completed");
    }
  }
}

function renderStickers() {
  const container = document.getElementById("stickersGrid");
  if (!container) return;
  container.innerHTML = "";

  if (STATE.gems >= 50) unlockSticker("stk_treasure");

  STICKERS_CONFIG.forEach(s => {
    const isUnlocked = STATE.stickers.includes(s.id);
    const div = document.createElement("div");
    div.className = `sticker-item ${isUnlocked ? "" : "locked"}`;
    div.innerHTML = `
      <div class="sticker-icon">${s.icon}</div>
      <div class="sticker-name">${s.name}</div>
      <div class="sticker-desc">${isUnlocked ? s.desc : "🔒 Locked"}</div>
    `;
    container.appendChild(div);
  });
}

function renderWeakKeys() {
  const weakContainer = document.getElementById("weakKeysContainer");
  if (!weakContainer) return;
  weakContainer.innerHTML = "";

  const sorted = Object.entries(STATE.weakKeys).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    weakContainer.innerHTML =
      "<p style='color:#94a3b8; font-size:0.85rem;'>अभी तक कोई बड़ी गलती नहीं हुई। आपकी सटीकता बेहतरीन है!</p>";
    return;
  }

  sorted.slice(0, 8).forEach(([key, count]) => {
    const chip = document.createElement("div");
    chip.className = "weak-chip";
    chip.innerHTML = `Key '${key.toUpperCase()}': ${count} mistakes`;
    weakContainer.appendChild(chip);
  });
}

function initStatsScreen() {
  initCertificateModal();
  document.getElementById("practiceWeakKeysBtn")?.addEventListener("click", () => {
    const keys = Object.keys(STATE.weakKeys);
    if (keys.length === 0) return alert("अभी कोई कमज़ोर कीज़ नहीं मिलीं! बहुत बढ़िया!");

    const drill = keys.map(k => `${k}${k} ${k}a ${k}o ${k}e ${k}i`).join(" ");
    const weakLesson = {
      title: "Targeted Weak Keys Drill (कमज़ोर बटनों का सुधार)",
      hindi: "जिन बटनों पर ज़्यादा गलतियाँ हुईं, उनका विशेष अभ्यास।",
      items: drill.split(" ")
    };
    loadLesson(weakLesson, weakLesson.items);
  });
}

/* ═══════════════════════════════════════════════════
   18. AI STUDIO SCREEN
   ═══════════════════════════════════════════════════ */

function initAIScreen() {
  const generateBtn = document.getElementById("aiGenerateBtn");
  const topicInput  = document.getElementById("aiTopicInput");
  const outputBox   = document.getElementById("aiOutputBox");
  const saveBtn     = document.getElementById("aiSaveOfflineBtn");
  const startBtn    = document.getElementById("aiStartPracticeBtn");
  const tokenInput  = document.getElementById("hfTokenInput");

  const defaultHfToken = "";
  STATE.hfToken = STATE.hfToken || localStorage.getItem("hf_token") || defaultHfToken;
  if (tokenInput) tokenInput.value = STATE.hfToken;

  tokenInput?.addEventListener("change", e => {
    STATE.hfToken = e.target.value.trim();
    localStorage.setItem("hf_token", STATE.hfToken);
  });

  document.querySelectorAll(".topic-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      if (topicInput) topicInput.value = chip.dataset.topic;
    });
  });

  let currentAILesson = null;

  if (generateBtn) {
    generateBtn.addEventListener("click", async () => {
      const topic = topicInput?.value.trim();
      if (!topic) return alert("कृपया कोई टॉपिक लिखें (जैसे: Shopping, Doctor, Cooking)!");

      generateBtn.innerHTML = "⏳ AI Lesson बन रहा है...";
      generateBtn.disabled  = true;

      try {
        const result = await AI_ENGINE.generateLesson(topic, STATE.hfToken);
        currentAILesson = {
          title: `AI Lesson: ${topic}`,
          hindi: `विषय: ${topic} (AI द्वारा निर्मित पाठ)`,
          items: result.items
        };

        if (outputBox) {
          outputBox.innerHTML = "";
          result.items.forEach((item, idx) => {
            const row = document.createElement("div");
            row.className = "ai-line-item";
            row.innerHTML = `
              <div class="ai-en">${idx + 1}. ${item.english}</div>
              <div class="ai-hi">${item.hindi}</div>
            `;
            outputBox.appendChild(row);
          });
        }

        if (saveBtn)  saveBtn.style.display  = "block";
        if (startBtn) startBtn.style.display = "block";
      } catch (err) {
        alert("Lesson generate karne me dikkat aayi: " + err.message);
      } finally {
        generateBtn.innerHTML = "✨ Generate AI English Lesson";
        generateBtn.disabled  = false;
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (!currentAILesson) return;
      const existing = JSON.parse(localStorage.getItem("typo_ai_saved") || "[]");
      existing.push(currentAILesson);
      localStorage.setItem("typo_ai_saved", JSON.stringify(existing));
      alert("✅ Lesson आपकी Offline Library में सुरक्षित सेव हो गया है! इंटरनेट बंद होने पर भी चलेगा।");
    });
  }

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (!currentAILesson) return;
      loadLesson(currentAILesson, currentAILesson.items);
    });
  }
}

/* ═══════════════════════════════════════════════════
   19. CUSTOM TEXT SCREEN
   ═══════════════════════════════════════════════════ */

function initCustomTextScreen() {
  const input      = document.getElementById("customTextInput");
  const hindiInput = document.getElementById("customTextHindiInput");
  const startBtn   = document.getElementById("customTextStartBtn");

  if (!startBtn) return;

  startBtn.addEventListener("click", () => {
    const text = input?.value.trim();
    if (!text) return alert("कृपया कुछ टेक्स्ट पेस्ट करें!");

    const sentences = text.split(/[.?!]\s+/).filter(s => s.trim().length > 0);
    const hindiVal  = hindiInput?.value.trim() || "मेरा कस्टम टेक्स्ट अभ्यास";

    const customLesson = {
      title: "My School Book / Custom Practice",
      hindi: hindiVal,
      items: sentences.map(s => ({ english: s + ".", hindi: hindiVal }))
    };

    loadLesson(customLesson, customLesson.items);
  });
}

/* ═══════════════════════════════════════════════════
   19b. AI 50-WORD PARAGRAPH STUDIO & MODAL CONTROLLER
   ═══════════════════════════════════════════════════ */

let currentAi50WordParagraph = {
  topic: "school",
  english: "My school is a wonderful temple of knowledge, discipline, and friendship. Every morning, I wear my clean uniform, tie my shoelaces, and reach the peaceful assembly ground. Our dedicated teachers explain every subject with patience and joy. I enjoy studying in our quiet library and playing badminton with dear classmates.",
  hindi: "मेरा विद्यालय ज्ञान, अनुशासन और मित्रता का एक अद्भुत मंदिर है। हर सुबह मैं साफ़ ड्रेस पहनकर शांत प्रार्थना सभा में पहुँचती हूँ। शिक्षक धैर्य और आनंद से पढ़ाते हैं। मुझे लाइब्रेरी में पढ़ना और दोस्तों के साथ बैडमिंटन खेलना बहुत पसंद है।",
  wordCount: 49
};

function initAi50WordStudio() {
  const chipContainer = document.getElementById("studioTopicChips");
  const customInput   = document.getElementById("studioCustomInput");
  const generateBtn   = document.getElementById("studioGenerateBtn");
  const typeInArenaBtn= document.getElementById("studioTypeInArenaBtn");
  const topicBadge    = document.getElementById("studioTopicBadge");
  const wordBadge     = document.getElementById("studioWordBadge");
  const englishEl     = document.getElementById("studioEnglishText");
  const hindiEl       = document.getElementById("studioHindiText");
  const wordCountPill = document.getElementById("studioWordCount");

  if (!generateBtn && !typeInArenaBtn) return;

  async function generateAndDisplay(topic) {
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = "<span>⏳ AI Bana Rahi Hai... ✨</span>";
    }

    try {
      if (topic === "surprise") {
        const topics = ["school", "mother", "nature", "walk", "friend", "cricket", "pet", "diwali", "books", "dream"];
        topic = topics[Math.floor(Math.random() * topics.length)];
      }

      const res = await window.AI_ENGINE.generateParagraph50Words(topic, STATE.hfToken);
      currentAi50WordParagraph = res;

      const capitalized = res.topic.charAt(0).toUpperCase() + res.topic.slice(1);
      if (topicBadge) topicBadge.textContent = `🏫 Topic: ${capitalized}`;
      if (wordBadge)  wordBadge.textContent  = `📝 ${res.wordCount} Words`;
      if (englishEl)  englishEl.textContent  = res.english;
      if (hindiEl)    hindiEl.innerHTML      = `🌸 <strong>हिंदी अनुवाद:</strong> ${res.hindi}`;
      if (wordCountPill) wordCountPill.textContent = res.wordCount;

      addXp(20);
      playWordCompleteChime();
      setMascot("AI ne 50-word paragraph bana diya! Arena me type karo! 🌸", "happy");
    } catch (e) {
      console.error("AI studio generation error:", e);
    } finally {
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = "<span>✨ AI Paragraph Banao</span>";
      }
    }
  }

  // Topic chip click
  if (chipContainer) {
    const chips = chipContainer.querySelectorAll(".topic-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const topic = chip.getAttribute("data-topic") || "school";
        generateAndDisplay(topic);
      });
    });
  }

  // Custom topic generate
  if (generateBtn) {
    generateBtn.addEventListener("click", () => {
      const topic = customInput?.value.trim() || "school";
      generateAndDisplay(topic);
    });
  }

  // Start practice in arena
  if (typeInArenaBtn) {
    typeInArenaBtn.addEventListener("click", () => {
      loadAiParagraphIntoArena(currentAi50WordParagraph);
    });
  }
}

function initAiParagraphModal() {
  const openBtn       = document.getElementById("arenaAiParagraphBtn");
  const modal         = document.getElementById("aiParagraphModal");
  const closeBtn      = document.getElementById("closeAiParaModalBtn");
  const chipContainer = document.getElementById("aiParaTopicsGrid");
  const customInput   = document.getElementById("aiParaCustomTopicInput");
  const generateBtn   = document.getElementById("generateAiParaBtn");
  const startTypingBtn= document.getElementById("startAiParaTypingBtn");
  const englishEl     = document.getElementById("aiParaEnglishText");
  const hindiEl       = document.getElementById("aiParaHindiText");
  const countPill     = document.getElementById("aiParaCountPill");
  const previewBox    = document.getElementById("aiParaPreview");

  if (!openBtn || !modal) return;

  let selectedTopic = "school";

  openBtn.addEventListener("click", () => {
    modal.classList.add("active");
    if (previewBox) previewBox.style.display = "block";
    if (startTypingBtn) startTypingBtn.style.display = "inline-flex";
  });

  closeBtn?.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  // Chip click
  if (chipContainer) {
    const chips = chipContainer.querySelectorAll(".topic-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        selectedTopic = chip.getAttribute("data-topic") || "school";
      });
    });
  }

  // Generate button
  if (generateBtn) {
    generateBtn.addEventListener("click", async () => {
      let topic = customInput?.value.trim() || selectedTopic;
      if (topic === "surprise") {
        const topics = ["school", "mother", "nature", "walk", "friend", "cricket", "pet", "diwali", "books", "dream"];
        topic = topics[Math.floor(Math.random() * topics.length)];
      }

      generateBtn.disabled = true;
      generateBtn.innerHTML = "<span>⏳ AI Paragraph Bana Rahi Hai... ✨</span>";

      try {
        const res = await window.AI_ENGINE.generateParagraph50Words(topic, STATE.hfToken);
        currentAi50WordParagraph = res;

        if (englishEl) englishEl.textContent = res.english;
        if (hindiEl)   hindiEl.innerHTML     = `🌸 <strong>हिंदी:</strong> ${res.hindi}`;
        if (countPill) countPill.textContent = `📝 ${res.wordCount} Words`;
        if (previewBox) previewBox.style.display = "block";
        if (startTypingBtn) startTypingBtn.style.display = "inline-flex";

        playWordCompleteChime();
      } catch (e) {
        console.error("Modal generate error:", e);
      } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = "<span>✨ Naya Paragraph Banao</span>";
      }
    });
  }

  // Start typing button
  if (startTypingBtn) {
    startTypingBtn.addEventListener("click", () => {
      modal.classList.remove("active");
      loadAiParagraphIntoArena(currentAi50WordParagraph);
    });
  }
}

function loadAiParagraphIntoArena(para) {
  if (!para || !para.english) return;
  const wordCount = para.english.trim().split(/\s+/).filter(Boolean).length;
  const topicTitle = para.topic ? para.topic.charAt(0).toUpperCase() + para.topic.slice(1) : "AI Essay";

  const lesson = {
    id: "ai_essay_" + Date.now(),
    title: `🤖 AI Essay: ${topicTitle}`,
    hindi: para.hindi,
    items: [para.english]
  };

  loadLesson(lesson, lesson.items);

  // Switch to arena tab if not already on it
  const arenaTabBtn = document.querySelector('[data-tab="arena"]');
  if (arenaTabBtn && STATE.currentTab !== "arena") {
    arenaTabBtn.click();
  }

  setMascot("AI ka 50-word paragraph load ho gaya! Pura paragraph type karo! 🌸⌨️", "happy");
}

/* ═══════════════════════════════════════════════════
   19b. 50-WORD SELF-WRITING CHALLENGE & ESSAY BUILDER
   ═══════════════════════════════════════════════════ */

function initSelfWritingChallenge() {
  const input = document.getElementById("selfWritingInput");
  const countEl = document.getElementById("selfWordCount");
  const badgeEl = document.getElementById("selfWordCounterBadge");
  const chipContainer = document.getElementById("promptStarterChips");
  const checkBtn = document.getElementById("aiCheckEssayBtn");
  const practiceBtn = document.getElementById("practiceSelfEssayBtn");
  const reviewBox = document.getElementById("aiReviewBox");
  const reviewScore = document.getElementById("aiReviewScore");
  const reviewFeedback = document.getElementById("aiReviewFeedback");

  if (!input) return;

  function updateCount() {
    const text = input.value.trim();
    const count = text ? text.split(/\s+/).filter(Boolean).length : 0;
    if (countEl) countEl.textContent = count;
    if (badgeEl) {
      if (count >= 40 && count <= 65) {
        badgeEl.classList.add("goal-reached");
      } else {
        badgeEl.classList.remove("goal-reached");
      }
    }
  }

  input.addEventListener("input", updateCount);

  // Topic starter chips
  if (chipContainer) {
    const chips = chipContainer.querySelectorAll(".topic-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const promptText = chip.getAttribute("data-prompt") || "";
        input.value = promptText;
        updateCount();
        input.focus();
      });
    });
  }

  // AI Check / Grammar Review button
  if (checkBtn) {
    checkBtn.addEventListener("click", async () => {
      const text = input.value.trim();
      const count = text ? text.split(/\s+/).filter(Boolean).length : 0;
      if (!text) {
        alert("Pehle kuch English sentences likho!");
        return;
      }

      checkBtn.disabled = true;
      const originalHtml = checkBtn.innerHTML;
      checkBtn.innerHTML = "<span>⏳ Mimi check kar rahi hai... ✨</span>";

      try {
        let feedback = "";
        let score = "⭐ 10/10 Superb Writing! (+30 XP)";

        if (window.AI_ENGINE) {
          feedback = await window.AI_ENGINE.reviewEssay(text, STATE.hfToken);
        }

        if (!feedback) {
          if (count >= 35) {
            score = `⭐ 10/10 Wonderful Essay! (${count} Words • +30 XP)`;
            feedback = `Wah! Bahut hi sundar paragraph likha hai! 🌸 Aapki vocabulary aur sentence formation bilkul school-standard hai. Ab ise Arena me type karke apni typing speed badhao! 🚀`;
          } else {
            score = `⭐ 8/10 Good Attempt! (${count} Words • +15 XP)`;
            feedback = `Achha prayas hai! Abhi ${count} shabd hue hain, thoda aur likhkar ise 45-50 words ka complete essay banayein. You are doing great! 💖`;
          }
        }

        if (reviewBox && reviewFeedback && reviewScore) {
          reviewScore.textContent = count >= 35 ? `⭐ 10/10 Excellent Effort! (${count} Words • +30 XP)` : `⭐ 8/10 Good Try! (${count} Words • +15 XP)`;
          reviewFeedback.textContent = feedback;
          reviewBox.style.display = "block";
          reviewBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }

        addXp(30);
        addGems(5);
        playVictoryChime();
        setMascot("Shabash! Bahut accha essay likha aapne! 💖", "happy");
      } catch (err) {
        console.error("AI review error:", err);
      } finally {
        checkBtn.disabled = false;
        checkBtn.innerHTML = originalHtml;
      }
    });
  }

  // Practice typing the self-written essay in Arena
  if (practiceBtn) {
    practiceBtn.addEventListener("click", () => {
      const text = input.value.trim();
      if (!text) {
        alert("Pehle kuch English sentences likho ya chip se select karo!");
        return;
      }

      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const customLesson = {
        id: "self_essay_" + Date.now(),
        title: "✍️ Meri Apni 50-Word Diary",
        hindi: `Khud likha hua paragraph (${wordCount} Words)`,
        items: [text]
      };

      loadLesson(customLesson, customLesson.items);

      // Switch to Arena tab
      const arenaTabBtn = document.querySelector('[data-tab="tab-arena"]');
      if (arenaTabBtn) {
        arenaTabBtn.click();
      } else {
        switchTab("arena");
      }
      setMascot("Aapka apna likha paragraph Arena me load ho gaya! Type karo! ⌨️🌸", "happy");
    });
  }
}

/* ═══════════════════════════════════════════════════
   20. CONFETTI CANVAS
   ═══════════════════════════════════════════════════ */

function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#f472b6","#ec4899","#c084fc","#34d399","#fde047","#fed7aa"];
  const particles = [];

  for (let i = 0; i < 65; i++) {
    particles.push({
      x: canvas.width  / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.8) * 14,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8
    });
  }

  let frame = null;
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;

    particles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.35;
      p.alpha    -= 0.012;
      p.rotation += p.rotSpeed;

      if (p.alpha > 0) {
        alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle   = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive > 0) {
      frame = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  tick();
}

/* ═══════════════════════════════════════════════════
   21. CUTE CURSOR SPARKLE TRAIL
   ═══════════════════════════════════════════════════ */

function initCuteCursorTrail() {
  const emojis = ["✨","🌸","💖","🍓","⭐","🎀"];
  let lastTime = 0;

  function spawnSparkle(x, y, isClick = false) {
    const el = document.createElement("div");
    el.className = "cursor-sparkle";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const spread = isClick ? 26 : 12;
    el.style.left = `${x + (Math.random() - 0.5) * spread}px`;
    el.style.top  = `${y + (Math.random() - 0.5) * spread}px`;
    if (isClick) el.style.fontSize = `${Math.floor(Math.random() * 8 + 16)}px`;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 580);
  }

  window.addEventListener("pointermove", e => {
    const now = Date.now();
    if (now - lastTime > 45) {
      spawnSparkle(e.clientX, e.clientY);
      lastTime = now;
    }
  }, { passive: true });

  window.addEventListener("click", e => {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => spawnSparkle(e.clientX, e.clientY, true), i * 35);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════
   22. HINDI-TO-ENGLISH GRAMMAR BITES (Micro-Tips for Arena)
   ═══════════════════════════════════════════════════════════════════ */

const GRAMMAR_BITES = {
  // Family & Relations
  "mother": "💡 Grammar Bite: 'Mother' relation me capital tab hota hai jab direct naam ki tarah bulayein ('Yes, Mother!'). Normal me 'my mother' chhota hota hai! 🌸",
  "father": "💡 Grammar Bite: 'Father' ke sath singular verb 'is/was' lagta hai. Jaise: 'My father is working hard.' 🌸",
  "brother": "💡 Grammar Bite: Chhote bhai ko 'Younger brother' aur bade bhai ko 'Elder brother' bolte hain! 👦",
  "sister": "💡 Grammar Bite: Chhoti behen ko 'Younger sister' aur badi behen ko 'Elder sister' kehte hain! 👧",
  "family": "💡 Grammar Bite: 'Family' ek collective noun hai. 'My family is very loving' me singular 'is' lagta hai! 👨‍👩‍👧‍👦",
  "friend": "💡 Grammar Bite: Friend ka plural 'Friends' hota hai: 'Pooja has many good friends.' ✨",
  "parent": "💡 Grammar Bite: 'Parent' ek (Mummy ya Papa) ke liye aur 'Parents' dono ke liye use hota hai! 🏡",
  "child": "💡 Grammar Bite: 'Child' ka plural 'Children' hota hai, 'childs' kabhi mat likhna! 🧒",
  "daughter": "💡 Grammar Bite: 'Daughter' me 'gh' silent rehta hai, iska ucharan 'Doh-ter' hota hai! 🌸",
  "son": "💡 Grammar Bite: 'Son' (beta) aur 'Sun' (suraj) dono ka bolna ek jaisa hota hai par spelling alag! ☀️",

  // Food & Kitchen
  "apple": "💡 Grammar Bite: Vowel sound (A, E, I, O, U) se shuru hone wale shabd ke aage 'an' lagta hai: 'An apple'! 🍎",
  "water": "💡 Grammar Bite: Water uncountable noun hai, iske aage 'a water' nahi bolte, 'some water' ya 'a glass of water' kehte hain! 💧",
  "milk": "💡 Grammar Bite: Milk bhi uncountable hai. 'I drink milk every day' bolte hain! 🥛",
  "bread": "💡 Grammar Bite: Bread ke tukde ko 'a slice of bread' ya 'a loaf of bread' bolte hain! 🍞",
  "rice": "💡 Grammar Bite: Rice hamesha singular form me use hota hai: 'Rice is tasty.' 🍚",
  "tea": "💡 Grammar Bite: Chai pine ke liye English me 'drink tea' se behtar 'have tea' ya 'take tea' mana jata hai! ☕",
  "mango": "💡 Grammar Bite: Mango ka plural 'Mangoes' hota hai ('es' lagta hai)! 🥭",

  // Action Verbs
  "eat": "💡 Grammar Bite: He/She/It ke sath 'eats' aur I/You/We ke sath 'eat' use hota hai! 🍽️",
  "drink": "💡 Grammar Bite: Drink ka past tense 'Drank' hota hai: 'I drank cool water.' 🥤",
  "sleep": "💡 Grammar Bite: Sleep ka past form 'Slept' hota hai: 'She slept for 8 hours.' 🌙",
  "walk": "💡 Grammar Bite: 'Walk' me 'L' silent hota hai, iska ucharan 'Wok' hota hai! 🚶‍♀️",
  "run": "💡 Grammar Bite: Run ka past form 'Ran' hota hai: 'He ran fast.' 🏃‍♂️",
  "speak": "💡 Grammar Bite: 'Speak' ka past tense 'Spoke' hota hai: 'She spoke fluently in English.' 🗣️",
  "listen": "💡 Grammar Bite: 'Listen' ke baad hamesha 'to' lagta hai: 'Listen to the teacher'! 🎧",
  "read": "💡 Grammar Bite: 'Read' ki spelling past me bhi 'read' hoti hai par pronunciation 'red' ban jati hai! 📖",
  "write": "💡 Grammar Bite: 'Write' me 'W' silent hota hai. Iska past tense 'Wrote' hota hai! ✍️",
  "learn": "💡 Grammar Bite: 'Learn' ka past tense 'Learnt' ya 'Learned' dono sahi hota hai! 🌟",
  "smile": "💡 Grammar Bite: Smile ke sath 'at' lagta hai: 'Mimi smiles at your great typing!' 😊",

  // Polite Greetings
  "hello": "💡 Grammar Bite: 'Hello' sabhi age groups ke sath bola jane wala sweet aur polite greeting hai! 👋",
  "please": "💡 Grammar Bite: Madad maangte waqt 'Please' ka use sentence ko respect deta hai! 🙏",
  "thank you": "💡 Grammar Bite: Kisi ki help ke baad 'Thank you so much' kehna etiquette sikhata hai! 💖",
  "sorry": "💡 Grammar Bite: Maafi maangne ke liye 'I am very sorry' ya 'Excuse me' ka prayog karein! 🌸",
  "welcome": "💡 Grammar Bite: 'Thank you' ke reply me hamesha 'You are welcome' ya 'My pleasure' kahein! 🌼"
};

const GENERAL_GRAMMAR_TIPS = [
  "💡 Touch-Typing Tip: Screen par dhyan kendrit karein, keyboard dekhne ki aadat chhodne se speed 3 guna tezi se badhti hai! 🚀",
  "💡 Home-Row Rule: Dono hath hamesha A-S-D-F aur J-K-L-; par rakhein, taaki har ungli apne button tak bina dekhe pahunch sake! 🖐️",
  "💡 Shift Key Rule: Right hand ke letters ke liye Left Shift, aur Left hand ke letters ke liye Right Shift use karein! ✨",
  "💡 English Rule: Capital letter hamesha sentence ke shuru me aur kisi ke naam (Proper Noun) me lagta hai! 📝",
  "💡 Spacebar Tip: Hamesha apne dono thumbs me se kisi ek se Spacebar dabane ki aadat banayein! 🌸",
  "💡 Pronunciation: Har shabd ko type karte waqt munh se halka sa ucharan karein, isse English bolne ka jhijhak khulega! 🗣️"
];

function updateGrammarBite() {
  const biteEl = document.getElementById("grammarBiteText");
  if (!biteEl) return;

  const wordKey = (STATE.targetText || "").trim().toLowerCase();
  if (GRAMMAR_BITES[wordKey]) {
    biteEl.textContent = GRAMMAR_BITES[wordKey];
  } else {
    const idx = (STATE.targetText.length + STATE.itemIndex) % GENERAL_GRAMMAR_TIPS.length;
    biteEl.textContent = GENERAL_GRAMMAR_TIPS[idx];
  }
}

/* ═══════════════════════════════════════════════════════════════════
   23. DUOLINGO ANIMAL LEAGUE LEADERBOARD
   ═══════════════════════════════════════════════════════════════════ */

const LEAGUE_ROSTER_TEMPLATES = [
  { name: "Chintu 🐿️", role: "Speed Squirrel", xpOffset: 240, avatar: "🐿️" },
  { name: "Gappu 🐼", role: "Chubby Panda",  xpOffset: 180, avatar: "🐼" },
  { name: "Meenu 🐱", role: "Book Cat",      xpOffset: 120, avatar: "🐱" },
  { name: "Bholu 🐻", role: "Gentle Bear",   xpOffset: 70,  avatar: "🐻" },
  { name: "Ronnie 🐶", role: "Playful Pup",   xpOffset: 35,  avatar: "🐶" },
  { name: "Pari 🕊️",   role: "Peace Dove",    xpOffset: 10,  avatar: "🕊️" }
];

function renderLeagueRoster() {
  const rosterEl = document.getElementById("leagueRoster");
  const badgeEl  = document.getElementById("leagueBadge");
  if (!rosterEl) return;

  let leagueTier = "🥉 Bronze League";
  if (STATE.xp >= 350) {
    leagueTier = "🥇 Gold League";
  } else if (STATE.xp >= 150) {
    leagueTier = "🥈 Silver League";
  }
  if (badgeEl) badgeEl.textContent = leagueTier;

  const list = LEAGUE_ROSTER_TEMPLATES.map(bot => {
    return {
      name: bot.name,
      role: bot.role,
      avatar: bot.avatar,
      xp: Math.max(bot.xpOffset, Math.round(bot.xpOffset * 0.7 + (STATE.xp * 0.35))),
      isUser: false
    };
  });

  const userName = STATE.studentName ? `${STATE.studentName} 🌸` : "You (Pooja 🌸)";
  list.push({
    name: userName,
    role: "Typing Scholar ⭐",
    avatar: "🎀",
    xp: STATE.xp,
    isUser: true
  });

  list.sort((a, b) => b.xp - a.xp);

  rosterEl.innerHTML = "";
  list.forEach((entry, idx) => {
    const rank = idx + 1;
    const isTop3 = rank <= 3;
    const row = document.createElement("div");
    row.className = `league-row ${entry.isUser ? "is-user" : ""} ${isTop3 ? "top-tier" : ""}`;

    row.innerHTML = `
      <div class="league-left">
        <div class="league-rank">${rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}</div>
        <div class="league-avatar">${entry.avatar}</div>
        <div>
          <div class="league-name">${entry.name} ${entry.isUser ? '<span class="league-tag">YOU</span>' : ''}</div>
          <small style="color:var(--pink-700); font-weight:700;">${isTop3 ? '⭐ PROMOTION ZONE' : entry.role}</small>
        </div>
      </div>
      <div class="league-xp-badge">
        <span>⭐</span>
        <strong>${entry.xp}</strong> <small>XP</small>
      </div>
    `;

    rosterEl.appendChild(row);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   24. MIMI'S BOUTIQUE & CLAY THEME SHOP (Gems Economy 💎)
   ═══════════════════════════════════════════════════════════════════ */

const THEMES_CONFIG = [
  { id: "pink",     name: "🌸 Sakura Pink",   color: "#f472b6", price: 0,  desc: "Girlish Pastel Clay (Default)" },
  { id: "mint",     name: "🍃 Mint Blossom",  color: "#4ade80", price: 25, desc: "Fresh Mint & Soothing Green" },
  { id: "lavender", name: "🔮 Lavender Magic", color: "#c084fc", price: 30, desc: "Calm Purple Dreamscape" },
  { id: "peach",    name: "🍑 Sunny Peach",   color: "#fb923c", price: 35, desc: "Warm Sunshine Clay" },
  { id: "sky",      name: "☁️ Sky Blue",      color: "#38bdf8", price: 40, desc: "Peaceful Pastel Cloud" }
];

const ACCESSORIES_CONFIG = [
  { id: "bow",        name: "🎀 Ribbon Bow",      icon: "🎀", price: 0,  desc: "Mimi's Signature Pink Ribbon" },
  { id: "crown",      name: "👑 Princess Crown",  icon: "👑", price: 30, desc: "Sparkling Royal Gold Tiara" },
  { id: "sunglasses", name: "🕶️ Star Sunglasses", icon: "🕶️", price: 20, desc: "Cool Anime Shades" },
  { id: "glasses",    name: "👓 Study Glasses",   icon: "👓", price: 15, desc: "Diligence & Scholar Look" },
  { id: "flower",     name: "🌸 Sakura Blossom",  icon: "🌸", price: 10, desc: "Fresh Spring Flower Pin" }
];

function applyTheme(themeId) {
  STATE.theme = themeId;
  if (themeId === "pink") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = themeId;
  }
  saveStats();
  renderBoutiqueShop();
}

function buyTheme(themeId, price) {
  if (STATE.gems >= price) {
    STATE.gems -= price;
    if (!STATE.unlockedThemes.includes(themeId)) {
      STATE.unlockedThemes.push(themeId);
    }
    applyTheme(themeId);
    playVictoryChime();
    setMascot("Waah! Naya Clay Theme lag gaya! Kitna pyara lag raha hai! 🌸✨", "happy");
    updateHeaderBadges();
    saveStats();
    renderBoutiqueShop();
  } else {
    playErrorBoop();
    alert(`💎 Gems kam hain! Is theme ke liye ${price} Gems chahiye. Lessons complete karke aur Gems kamao!`);
  }
}

function applyAccessory(accId) {
  STATE.accessory = accId;
  saveStats();
  renderMimiAccessory();
  renderBoutiqueShop();
}

function buyAccessory(accId, price) {
  if (STATE.gems >= price) {
    STATE.gems -= price;
    if (!STATE.unlockedAccessories.includes(accId)) {
      STATE.unlockedAccessories.push(accId);
    }
    applyAccessory(accId);
    playVictoryChime();
    setMascot("Mimi ko yeh naya accessory bahut pasand aaya! Thank you! 🥰✨", "happy");
    updateHeaderBadges();
    saveStats();
    renderBoutiqueShop();
  } else {
    playErrorBoop();
    alert(`💎 Gems kam hain! Is accessory ke liye ${price} Gems chahiye. Daily quests poore karo!`);
  }
}

function renderMimiAccessory() {
  const slot = document.getElementById("mimiAccessorySlot");
  if (!slot) return;

  const acc = STATE.accessory || "bow";
  if (acc === "crown") {
    slot.innerHTML = `
      <path d="M40,32 L40,24 L45,28 L50,22 L55,28 L60,24 L60,32 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1.2"/>
      <circle cx="40" cy="23" r="1.5" fill="#ef4444"/>
      <circle cx="50" cy="21" r="1.8" fill="#ec4899"/>
      <circle cx="60" cy="23" r="1.5" fill="#3b82f6"/>
    `;
  } else if (acc === "sunglasses") {
    slot.innerHTML = `
      <rect x="33" y="47" width="13" height="9" rx="3" fill="#1e1b4b"/>
      <rect x="54" y="47" width="13" height="9" rx="3" fill="#1e1b4b"/>
      <line x1="46" y1="51" x2="54" y2="51" stroke="#1e1b4b" stroke-width="2"/>
      <line x1="35" y1="49" x2="41" y2="49" stroke="#93c5fd" stroke-width="1"/>
    `;
  } else if (acc === "glasses") {
    slot.innerHTML = `
      <circle cx="39" cy="52" r="7" fill="none" stroke="#be185d" stroke-width="2"/>
      <circle cx="61" cy="52" r="7" fill="none" stroke="#be185d" stroke-width="2"/>
      <line x1="46" y1="52" x2="54" y2="52" stroke="#be185d" stroke-width="2"/>
    `;
  } else if (acc === "flower") {
    slot.innerHTML = `
      <g transform="translate(28, 30)">
        <circle cx="0" cy="0" r="3" fill="#fde047"/>
        <circle cx="0" cy="-5" r="3" fill="#f472b6" opacity="0.95"/>
        <circle cx="5" cy="-2" r="3" fill="#f472b6" opacity="0.95"/>
        <circle cx="3" cy="4" r="3" fill="#f472b6" opacity="0.95"/>
        <circle cx="-3" cy="4" r="3" fill="#f472b6" opacity="0.95"/>
        <circle cx="-5" cy="-2" r="3" fill="#f472b6" opacity="0.95"/>
      </g>
    `;
  } else {
    slot.innerHTML = `
      <circle cx="28" cy="30" r="3" fill="#fde047"/>
      <ellipse cx="23" cy="30" rx="4" ry="2.5" fill="#ec4899"/>
      <ellipse cx="33" cy="30" rx="4" ry="2.5" fill="#ec4899"/>
    `;
  }
}

function renderBoutiqueShop() {
  const shopGems = document.getElementById("shopGemsDisplay");
  if (shopGems) shopGems.textContent = STATE.gems;

  const themesGrid = document.getElementById("themesGrid");
  if (themesGrid) {
    themesGrid.innerHTML = "";
    THEMES_CONFIG.forEach(t => {
      const isUnlocked = (STATE.unlockedThemes || []).includes(t.id);
      const isActive   = (STATE.theme || "pink") === t.id;

      const card = document.createElement("div");
      card.className = `theme-card ${isActive ? "active" : ""}`;
      card.innerHTML = `
        <div style="display:flex; align-items:center;">
          <span class="theme-swatch" style="background:${t.color};"></span>
          <div>
            <div style="font-size:0.85rem; font-weight:800; color:var(--pink-950);">${t.name}</div>
            <div style="font-size:0.68rem; color:var(--pink-700);">${t.desc}</div>
          </div>
        </div>
        <div>
          ${isActive ? '<span class="status-pill-badge active">✓ Applied</span>' :
            isUnlocked ? `<button class="shop-action-btn apply-btn" data-theme="${t.id}">Apply</button>` :
            `<button class="shop-action-btn buy-btn" data-theme="${t.id}" data-price="${t.price}">💎 ${t.price}</button>`}
        </div>
      `;

      card.querySelector(".apply-btn")?.addEventListener("click", () => applyTheme(t.id));
      card.querySelector(".buy-btn")?.addEventListener("click", () => buyTheme(t.id, t.price));

      themesGrid.appendChild(card);
    });
  }

  const accGrid = document.getElementById("accessoriesGrid");
  if (accGrid) {
    accGrid.innerHTML = "";
    ACCESSORIES_CONFIG.forEach(a => {
      const isUnlocked = (STATE.unlockedAccessories || []).includes(a.id);
      const isActive   = (STATE.accessory || "bow") === a.id;

      const card = document.createElement("div");
      card.className = `accessory-card ${isActive ? "active" : ""}`;
      card.innerHTML = `
        <div style="display:flex; align-items:center;">
          <span class="accessory-icon">${a.icon}</span>
          <div>
            <div class="accessory-name">${a.name}</div>
            <div style="font-size:0.68rem; color:var(--pink-700);">${a.desc}</div>
          </div>
        </div>
        <div>
          ${isActive ? '<span class="status-pill-badge active">✓ Wearing</span>' :
            isUnlocked ? `<button class="shop-action-btn apply-btn" data-acc="${a.id}">Wear</button>` :
            `<button class="shop-action-btn buy-btn" data-acc="${a.id}" data-price="${a.price}">💎 ${a.price}</button>`}
        </div>
      `;

      card.querySelector(".apply-btn")?.addEventListener("click", () => applyAccessory(a.id));
      card.querySelector(".buy-btn")?.addEventListener("click", () => buyAccessory(a.id, a.price));

      accGrid.appendChild(card);
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   25. PRINTABLE OFFICIAL CERTIFICATE MODAL
   ═══════════════════════════════════════════════════════════════════ */

function initCertificateModal() {
  const modal      = document.getElementById("certificateModal");
  const openBtn    = document.getElementById("openCertBtn");
  const closeBtn   = document.getElementById("closeCertBtn");
  const printBtn   = document.getElementById("printCertBtn");
  const nameInput  = document.getElementById("certStudentName");
  const speedEl    = document.getElementById("certSpeed");
  const accEl      = document.getElementById("certAccuracy");
  const xpEl       = document.getElementById("certXp");
  const dateEl     = document.getElementById("certDateDisplay");

  if (!modal) return;

  openBtn?.addEventListener("click", () => {
    if (nameInput) nameInput.value = STATE.studentName || "Pooja Sharma";
    if (speedEl)   speedEl.textContent = `${Math.max(STATE.bestWpm, 20)} WPM`;
    if (accEl)     accEl.textContent = `98%`;
    if (xpEl)      xpEl.textContent = `${STATE.xp} XP`;
    if (dateEl) {
      const now = new Date();
      dateEl.textContent = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }
    modal.classList.add("active");
    playComboChime();
  });

  closeBtn?.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.remove("active");
  });

  nameInput?.addEventListener("input", e => {
    STATE.studentName = e.target.value.trim() || "Pooja Sharma";
    saveStats();
  });

  printBtn?.addEventListener("click", () => {
    window.print();
  });
}

/* ═══════════════════════════════════════════════════════════════════
   26. LIVE HANDS ANIMATED VISUALIZER CONTROLLER
   ═══════════════════════════════════════════════════════════════════ */

function initLiveHands() {
  const btn = document.getElementById("handsToggleBtn");
  const stateLabel = document.getElementById("handsToggleState");
  const container = document.getElementById("liveHandsContainer");
  if (!btn && !container) return;

  function updateUi() {
    if (btn) btn.classList.toggle("active", STATE.handsGuideEnabled);
    if (stateLabel) stateLabel.textContent = STATE.handsGuideEnabled ? "ON" : "OFF";
    if (container) container.style.display = STATE.handsGuideEnabled ? "flex" : "none";
  }

  updateUi();

  btn?.addEventListener("click", () => {
    STATE.handsGuideEnabled = !STATE.handsGuideEnabled;
    localStorage.setItem("typo_hands_guide", STATE.handsGuideEnabled);
    updateUi();
    updateActiveKeyboardKey();
  });
}

function updateLiveHandsHighlight(mapping, isUpper) {
  if (!STATE.handsGuideEnabled) return;
  document.querySelectorAll(".finger-group").forEach(f => f.classList.remove("finger-active"));

  if (!mapping) return;

  const targetId = `hand_${mapping.finger.replace(/\s+/g, "_")}`;
  const fingerEl = document.getElementById(targetId);
  if (fingerEl) fingerEl.classList.add("finger-active");

  if (isUpper) {
    const shiftId = mapping.hand === "Right Hand" ? "hand_Left_Pinky" : "hand_Right_Pinky";
    const shiftEl = document.getElementById(shiftId);
    if (shiftEl) shiftEl.classList.add("finger-active");
  }
}

/* ═══════════════════════════════════════════════════════════════════
   27. WORD OF THE DAY & MERI VOCABULARY DIARY
   ═══════════════════════════════════════════════════════════════════ */

const VOCABULARY_NOTEBOOK = [
  { word: "Mother", hindi: "माँ / माता जी", category: "family", pronounce: "मदर", sentence: "My mother is very kind and loving." },
  { word: "Father", hindi: "पिताजी / पापा", category: "family", pronounce: "फादर", sentence: "My father works hard for our family." },
  { word: "Brother", hindi: "भाई", category: "family", pronounce: "ब्रदर", sentence: "My brother helps me with my studies and laptop." },
  { word: "Sister", hindi: "बहन", category: "family", pronounce: "सिस्टर", sentence: "My sister has a sweet and cheerful smile." },
  { word: "Family", hindi: "परिवार", category: "family", pronounce: "फैमिली", sentence: "We are a happy and caring family." },
  { word: "Friend", hindi: "दोस्त / मित्र", category: "family", pronounce: "फ्रेंड", sentence: "A good friend always supports and encourages you." },
  { word: "School", hindi: "विद्यालय / स्कूल", category: "school", pronounce: "स्कूल", sentence: "I love going to school to learn English." },
  { word: "Teacher", hindi: "अध्यापक / शिक्षिका", category: "school", pronounce: "टीचर", sentence: "Our teacher explains every lesson with patience." },
  { word: "Book", hindi: "किताब / पुस्तक", category: "school", pronounce: "बुक", sentence: "Reading books improves our English vocabulary." },
  { word: "Study", hindi: "पढ़ाई करना", category: "school", pronounce: "स्टडी", sentence: "I study English every day with dedication." },
  { word: "Confidence", hindi: "आत्मविश्वास / भरोसा", category: "school", pronounce: "कॉनफिडेंस", sentence: "Daily practice gives us confidence in speaking." },
  { word: "Courage", hindi: "हिम्मत / साहस", category: "school", pronounce: "करेज", sentence: "Have courage to try new challenges and succeed." },
  { word: "Knowledge", hindi: "ज्ञान / विद्या", category: "school", pronounce: "नॉलेज", sentence: "Education is the key to deep knowledge." },
  { word: "Water", hindi: "पानी / जल", category: "food", pronounce: "वॉटर", sentence: "Drink plenty of clean water every morning." },
  { word: "Milk", hindi: "दूध", category: "food", pronounce: "मिल्क", sentence: "Warm milk is healthy for the body." },
  { word: "Apple", hindi: "सेब", category: "food", pronounce: "ऐप्पल", sentence: "An apple a day keeps the doctor away." },
  { word: "Bread", hindi: "रोटी / ब्रेड", category: "food", pronounce: "ब्रेड", sentence: "I eat fresh bread with butter for breakfast." },
  { word: "Mango", hindi: "आम", category: "food", pronounce: "मैंगो", sentence: "Mango is the sweet king of summer fruits." },
  { word: "Rice", hindi: "चावल", category: "food", pronounce: "राइस", sentence: "Rice and lentils make a nutritious meal." },
  { word: "Speak", hindi: "बोलना", category: "actions", pronounce: "स्पीक", sentence: "Practice speaking English aloud with confidence." },
  { word: "Listen", hindi: "ध्यान से सुनना", category: "actions", pronounce: "लिसन", sentence: "Listen carefully to good English pronunciation." },
  { word: "Read", hindi: "पढ़ना", category: "actions", pronounce: "रीड", sentence: "Read one English storybook page every night." },
  { word: "Write", hindi: "लिखना", category: "actions", pronounce: "राइट", sentence: "Writing notes helps you remember new words." },
  { word: "Smile", hindi: "मुस्कुराना", category: "actions", pronounce: "स्माइल", sentence: "Always welcome everyone with a pleasant smile." },
  { word: "Help", hindi: "मदद करना", category: "actions", pronounce: "हेल्प", sentence: "Always help others whenever they need support." },
  { word: "Please", hindi: "कृपया / विनम्रता से", category: "courtesy", pronounce: "प्लीज़", sentence: "Please pass the English notebook." },
  { word: "Thank You", hindi: "धन्यवाद / शुक्रिया", category: "courtesy", pronounce: "थैंक यू", sentence: "Thank you so much for your kind guidance." },
  { word: "Welcome", hindi: "स्वागत है / कोई बात नहीं", category: "courtesy", pronounce: "वेलकम", sentence: "You are always welcome in our home." },
  { word: "Respect", hindi: "आदर / सम्मान", category: "courtesy", pronounce: "रिस्पेक्ट", sentence: "Always give genuine respect to your parents." },
  { word: "Kindness", hindi: "दयालुता / नेकी", category: "courtesy", pronounce: "काइन्डनेस", sentence: "Kindness makes the whole world a sweeter place." }
];

function initWordOfTheDay() {
  const dayIndex = new Date().getDate() % VOCABULARY_NOTEBOOK.length;
  const wordObj = VOCABULARY_NOTEBOOK[dayIndex] || VOCABULARY_NOTEBOOK[0];

  const engEl = document.getElementById("wodEnglish");
  const prEl = document.getElementById("wodPronounce");
  const hiEl = document.getElementById("wodHindi");
  const stEl = document.getElementById("wodSentence");
  const speakBtn = document.getElementById("wodSpeakBtn");
  const turtleBtn = document.getElementById("wodTurtleBtn");
  const practiceBtn = document.getElementById("wodPracticeBtn");

  if (engEl) engEl.textContent = wordObj.word;
  if (prEl) prEl.textContent = `[ ${wordObj.pronounce} • ${wordObj.word} ]`;
  if (hiEl) hiEl.textContent = `🌸 अर्थ: ${wordObj.hindi}`;
  if (stEl) stEl.textContent = `"${wordObj.sentence}"`;

  speakBtn?.addEventListener("click", () => speakWord(wordObj.word, false));
  turtleBtn?.addEventListener("click", () => speakWord(wordObj.word, true));

  practiceBtn?.addEventListener("click", () => {
    const singleLesson = {
      id: "wod_" + wordObj.word.toLowerCase(),
      title: `Word of the Day: ${wordObj.word}`,
      hindi: wordObj.hindi,
      items: [wordObj.word, wordObj.sentence.replace(/[."']/g, "")]
    };
    loadLesson(singleLesson, singleLesson.items);
    switchTab("arena");
  });
}

function renderVocabularyDiary(filter = "all", search = "") {
  const grid = document.getElementById("diaryWordsGrid");
  const countEl = document.getElementById("diaryTotalCount");
  if (!grid) return;

  grid.innerHTML = "";
  const query = search.trim().toLowerCase();

  const filtered = VOCABULARY_NOTEBOOK.filter(item => {
    const matchesFilter = filter === "all" || item.category === filter;
    const matchesSearch = !query || 
      item.word.toLowerCase().includes(query) || 
      item.hindi.includes(query) ||
      (item.sentence && item.sentence.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  if (countEl) countEl.textContent = VOCABULARY_NOTEBOOK.length;

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "diary-word-item";
    card.innerHTML = `
      <div class="d-top-row">
        <div>
          <span class="d-english">${item.word}</span>
          <span class="d-pronounce">[${item.pronounce}]</span>
        </div>
        <button class="duo-audio-btn speaker-btn d-speak" title="Listen">🔊</button>
      </div>
      <div class="d-hindi">🌸 ${item.hindi}</div>
      <div class="d-sentence">"${item.sentence}"</div>
      <div class="d-actions">
        <span class="status-pill-badge">✨ Ready</span>
        <button class="shop-action-btn apply-btn d-practice">⌨️ Practice</button>
      </div>
    `;

    card.querySelector(".d-speak")?.addEventListener("click", () => speakWord(item.word, false));
    card.querySelector(".d-practice")?.addEventListener("click", () => {
      const singleLesson = {
        id: "diary_" + item.word.toLowerCase(),
        title: `Practice: ${item.word}`,
        hindi: item.hindi,
        items: [item.word, item.sentence.replace(/[."']/g, "")]
      };
      loadLesson(singleLesson, singleLesson.items);
      switchTab("arena");
    });

    grid.appendChild(card);
  });
}

function initVocabularyDiary() {
  let currentFilter = "all";
  let currentSearch = "";

  const searchInput = document.getElementById("diarySearchInput");
  searchInput?.addEventListener("input", e => {
    currentSearch = e.target.value;
    renderVocabularyDiary(currentFilter, currentSearch);
  });

  const chips = document.querySelectorAll(".diary-filter-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentFilter = chip.dataset.filter || "all";
      renderVocabularyDiary(currentFilter, currentSearch);
    });
  });

  renderVocabularyDiary();
}

/* ═══════════════════════════════════════════════════════════════════
   28. REAL-LIFE CONVERSATION CHAT CONTROLLER
   ═══════════════════════════════════════════════════════════════════ */

const CHAT_SCENARIOS = [
  {
    id: "school_intro",
    badge: "🏫 School Roleplay",
    title: "Introducing Yourself to Teacher (टीचर से परिचय)",
    steps: [
      {
        mimi: "Hello! Welcome to the classroom. What is your name? 👋",
        mimiHindi: "नमस्ते! कक्षा में स्वागत है। आपका क्या नाम है?",
        reply: "My name is Pooja.",
        replyHindi: "मेरा नाम पूजा है।"
      },
      {
        mimi: "Nice to meet you, Pooja! How are you feeling today? 🌸",
        mimiHindi: "आपसे मिलकर खुशी हुई! आज आप कैसा महसूस कर रही हैं?",
        reply: "I am feeling happy and excited.",
        replyHindi: "मैं खुश और उत्साहित महसूस कर रही हूँ।"
      },
      {
        mimi: "Which subject do you like the most? 📚",
        mimiHindi: "आपको कौनसा विषय सबसे ज़्यादा पसंद है?",
        reply: "I love learning English and typing.",
        replyHindi: "मुझे अंग्रेज़ी सीखना और टाइपिंग पसंद है।"
      }
    ]
  },
  {
    id: "fruit_shop",
    badge: "🛍️ Fruit Market",
    title: "Buying Fresh Fruits at the Shop (फल की दुकान पर)",
    steps: [
      {
        mimi: "Good morning! Can I help you with fresh fruits? 🍎",
        mimiHindi: "सुप्रभात! क्या मैं ताज़े फलों में आपकी मदद करूँ?",
        reply: "Yes please, I want fresh apples.",
        replyHindi: "हाँ कृपया, मुझे ताज़े सेब चाहिए।"
      },
      {
        mimi: "Sure! How many apples do you need today? 🧺",
        mimiHindi: "ज़रूर! आपको आज कितने सेब चाहिए?",
        reply: "Please give me four red apples.",
        replyHindi: "कृपया मुझे चार लाल सेब दीजिए।"
      },
      {
        mimi: "Here you go! That will be sixty rupees. ✨",
        mimiHindi: "यह लीजिए! साठ रुपये हुए।",
        reply: "Here is the money. Thank you!",
        replyHindi: "यह लीजिए पैसे। धन्यवाद!"
      }
    ]
  },
  {
    id: "home_morning",
    badge: "🏡 Good Morning at Home",
    title: "Morning Conversation with Family (सुबह की बातचीत)",
    steps: [
      {
        mimi: "Good morning! Did you sleep well last night? ☀️",
        mimiHindi: "सुप्रभात! क्या रात को अच्छी नींद आई?",
        reply: "Good morning! Yes, I slept very well.",
        replyHindi: "सुप्रभात! हाँ, मुझे बहुत अच्छी नींद आई।"
      },
      {
        mimi: "Are you ready for a healthy breakfast? 🥛",
        mimiHindi: "क्या आप पौष्टिक नाश्ते के लिए तैयार हैं?",
        reply: "Yes, I will have warm milk and fruit.",
        replyHindi: "हाँ, मैं गर्म दूध और फल लूँगी।"
      }
    ]
  }
];

let currentChatScenario = null;
let currentChatStepIndex = 0;

function setupChatView() {
  const scenario = CHAT_SCENARIOS[STATE.chatDialogueIndex % CHAT_SCENARIOS.length];
  currentChatScenario = scenario;
  currentChatStepIndex = 0;

  const badgeEl = document.getElementById("chatScenarioBadge");
  const titleEl = document.getElementById("chatScenarioTitle");
  if (badgeEl) badgeEl.textContent = scenario.badge;
  if (titleEl) titleEl.textContent = scenario.title;

  const container = document.getElementById("chatMessagesContainer");
  if (container) container.innerHTML = "";

  loadChatStep(0);
}

function loadChatStep(stepIdx) {
  if (!currentChatScenario || stepIdx >= currentChatScenario.steps.length) {
    playVictoryChime();
    addXp(35);
    addGems(5);
    STATE.chatDialogueIndex++;
    showDuoFeedback(true, "Shaabash! Conversation Completed! 🌟");
    return;
  }

  currentChatStepIndex = stepIdx;
  const step = currentChatScenario.steps[stepIdx];

  const container = document.getElementById("chatMessagesContainer");
  if (container) {
    const mimiBubble = document.createElement("div");
    mimiBubble.className = "chat-bubble mimi-bubble";
    mimiBubble.innerHTML = `
      <strong>🐰 Mimi:</strong> ${step.mimi}
      <button class="chat-bubble-speaker" title="Speak">🔊</button>
      <div class="chat-bubble-hindi">${step.mimiHindi}</div>
    `;
    mimiBubble.querySelector(".chat-bubble-speaker")?.addEventListener("click", () => speakWord(step.mimi));
    container.appendChild(mimiBubble);
    container.scrollTop = container.scrollHeight;
  }

  speakWord(step.mimi, false);

  STATE.targetText = step.reply;
  STATE.typedText = "";
  STATE.targetHindi = step.replyHindi;

  const promptHindi = document.getElementById("chatPromptHindi");
  if (promptHindi) promptHindi.textContent = `"${step.replyHindi}"`;

  renderTypingText();
  updateActiveKeyboardKey();
}

function handleChatSentenceCompleted() {
  const container = document.getElementById("chatMessagesContainer");
  if (container && currentChatScenario) {
    const step = currentChatScenario.steps[currentChatStepIndex];
    const studentBubble = document.createElement("div");
    studentBubble.className = "chat-bubble student-bubble";
    studentBubble.innerHTML = `
      <strong>🌸 You:</strong> ${STATE.targetText}
      <div class="chat-bubble-hindi">${step.replyHindi}</div>
    `;
    container.appendChild(studentBubble);
    container.scrollTop = container.scrollHeight;
  }

  setTimeout(() => {
    loadChatStep(currentChatStepIndex + 1);
  }, 700);
}

/* ═══════════════════════════════════════════════════════════════════
   29. BHAIYA'S MOTIVATION NOTE & FAMILY PROGRESS CARD
   ═══════════════════════════════════════════════════════════════════ */

function initBrotherNote() {
  const display = document.getElementById("brotherNoteDisplay");
  const editArea = document.getElementById("brotherNoteEditArea");
  const input = document.getElementById("brotherNoteInput");
  const editBtn = document.getElementById("editBrotherNoteBtn");
  const saveBtn = document.getElementById("saveBrotherNoteBtn");
  const cancelBtn = document.getElementById("cancelBrotherNoteBtn");

  const savedNote = localStorage.getItem("typo_brother_note") || 
    "Shaabash gudiya! Har roz thodi si practice se tumhari English aur typing dono zabardast ho jayegi. Mujhe tumpar poora bharosa hai! Proud of you! 💖 - Bhaiya";
  STATE.brotherNote = savedNote;

  if (display) display.textContent = `"${STATE.brotherNote}"`;

  editBtn?.addEventListener("click", () => {
    if (input) input.value = STATE.brotherNote;
    if (display) display.style.display = "none";
    if (editArea) editArea.style.display = "block";
    editBtn.style.display = "none";
  });

  saveBtn?.addEventListener("click", () => {
    if (input) {
      STATE.brotherNote = input.value.trim() || STATE.brotherNote;
      localStorage.setItem("typo_brother_note", STATE.brotherNote);
      if (display) {
        display.textContent = `"${STATE.brotherNote}"`;
        display.style.display = "block";
      }
      if (editArea) editArea.style.display = "none";
      if (editBtn) editBtn.style.display = "inline-flex";
      playWordCompleteChime();
    }
  });

  cancelBtn?.addEventListener("click", () => {
    if (display) display.style.display = "block";
    if (editArea) editArea.style.display = "none";
    if (editBtn) editBtn.style.display = "inline-flex";
  });
}

function initFamilyProgressCard() {
  const openBtn = document.getElementById("openFamilyCardBtn");
  const modal = document.getElementById("familyProgressModal");
  const closeBtn = document.getElementById("closeFamilyCardBtn");
  const printBtn = document.getElementById("printFamilyCardBtn");

  const wordsEl = document.getElementById("fWordsTyped");
  const speedEl = document.getElementById("fSpeed");
  const accEl = document.getElementById("fAccuracy");
  const streakEl = document.getElementById("fStreak");
  const noteEl = document.getElementById("familyCardBrotherNote");

  openBtn?.addEventListener("click", () => {
    if (wordsEl) wordsEl.textContent = `${Math.max(STATE.totalWordsTyped, 35)}+`;
    if (speedEl) speedEl.textContent = `${Math.max(STATE.bestWpm, 20)} WPM`;
    if (accEl) accEl.textContent = "98%";
    if (streakEl) streakEl.textContent = `${STATE.streak} Days`;
    if (noteEl) noteEl.textContent = `"${STATE.brotherNote || 'Proud of you, Gudiya!'}"`;

    if (modal) modal.classList.add("active");
    playComboChime();
  });

  closeBtn?.addEventListener("click", () => modal?.classList.remove("active"));
  modal?.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("active"); });
  printBtn?.addEventListener("click", () => window.print());
}

/* ═══════════════════════════════════════════════════════════════════
   30. 20-MINUTE EYE & WRIST STRETCH BREAK CONTROLLER
   ═══════════════════════════════════════════════════════════════════ */

let stretchCountdownInterval = null;

function initStretchBreakTimer() {
  STATE.activeTypingSeconds = 0;
  STATE.lastBreakAt = 0;

  const resumeBtn = document.getElementById("resumeFromBreakBtn");
  resumeBtn?.addEventListener("click", () => {
    clearInterval(stretchCountdownInterval);
    document.getElementById("stretchBreakModal")?.classList.remove("active");
    STATE.lastBreakAt = STATE.activeTypingSeconds;
    playVictoryChime();
    setMascot("Chalo, ab refresh hokar typing shuru karein! 🚀", "happy");
    focusTypingArea();
  });
}

function showStretchBreakModal() {
  const modal = document.getElementById("stretchBreakModal");
  const secEl = document.getElementById("stretchSeconds");
  const breatheEl = document.getElementById("stretchBreatheText");
  if (!modal) return;

  modal.classList.add("active");
  let left = 20;
  if (secEl) secEl.textContent = left;

  clearInterval(stretchCountdownInterval);
  stretchCountdownInterval = setInterval(() => {
    left--;
    if (secEl) secEl.textContent = Math.max(left, 0);
    if (breatheEl) {
      breatheEl.textContent = (left % 4 < 2) ? "Breathe In... 🌸" : "Breathe Out... 🍵";
    }
    if (left <= 0) {
      clearInterval(stretchCountdownInterval);
      if (breatheEl) breatheEl.textContent = "Refresh Completed! ✨";
    }
  }, 1000);
}


/* ============================================================
   31. INFINITE 10,000+ MIXED WORDS & ESSAYS ENGINE (ZERO REPEAT)
   ============================================================ */

/* ── Mixed Word Filter Modes ── */
const MIXED_FILTERS = [
  { id: "all",    title: "🎲 Sab Mixed (10k+ Words)" },
  { id: "short",  title: "⚡ Chhote (3-4 Letters)" },
  { id: "medium", title: "🌟 Medium (5-6 Letters)" },
  { id: "long",   title: "🏆 Bade (7+ Letters)" }
];

/* ── 50-Word Paragraph Templates ── */
const PARAGRAPH_BANK = [
  {
    "id": "p50_school",
    "title": "🏫 Mera Vidyalaya",
    "text": "My school is a wonderful temple of knowledge discipline and friendship. Every morning I wear my clean dress and attend the peaceful morning prayer. The teachers explain lessons with great care and patience. I love reading books in the library and playing badminton with my dear friends.",
    "hindi": "मेरा विद्यालय ज्ञान, अनुशासन और मित्रता का एक अद्भुत मंदिर है। हर सुबह मैं साफ़ ड्रेस पहनकर शांत प्रार्थना सभा में शामिल होती हूँ। शिक्षक बड़े धैर्य और स्नेह से पाठ समझाते हैं। मुझे पुस्तकालय में किताबें पढ़ना और सहेलियों के साथ बैडमिंटन खेलना बहुत पसंद है।"
  },
  {
    "id": "p50_mother",
    "title": "🌸 Meri Pyari Maa",
    "text": "My mother is the sweetest and kindest person in my whole life. She wakes up early with a bright smile and prepares warm healthy food for us. She guides me patiently in my school homework and inspires me to be brave. Her loving hug gives me peaceful confidence every day.",
    "hindi": "मेरी माँ मेरे पूरे जीवन में सबसे प्यारी और दयालु इंसान हैं। वह हर सुबह मुस्कान के साथ उठती हैं और हमारे लिए गरम पौष्टिक खाना बनाती हैं। वे स्कूल के गृहकार्य में धैर्य से मेरा मार्गदर्शन करती हैं। उनका प्यारा आलिंगन मुझे हर दिन आत्मविश्वास देता है।"
  },
  {
    "id": "p50_nature",
    "title": "🌳 Hare Bhare Ped",
    "text": "Green trees are the greatest blessings given by mother nature to our earth. They give us cool shade sweet fruits fragrant flowers and clean oxygen to breathe. Sweet birds build cozy nests on leafy branches. We must protect plants and grow more green saplings to keep nature joyful and healthy.",
    "hindi": "हरे-भरे पेड़ प्रकृति माँ द्वारा हमारी धरती को दिया गया सबसे बड़ा वरदान हैं। वे हमें ठंडी छाया, मीठे फल, खुशबूदार फूल और ताज़ा ऑक्सीजन देते हैं। चिड़ियाँ हरी शाखाओं पर प्यारे घोंसले बनाती हैं। प्रकृति को खुशहाल और स्वस्थ रखने के लिए हमें नए पौधे लगाने चाहिए।"
  },
  {
    "id": "p50_morning",
    "title": "🌅 Subah Ki Sair",
    "text": "A brisk morning walk is the best way to keep body and mind fresh. Early at dawn the cool breeze blows gently and birds chirp sweet melodies in the sky. Dewdrops shine brightly like pearls on soft grass. Walking daily makes me energetic strong and full of positive joy.",
    "hindi": "सुबह की सैर शरीर और मन को तरोताज़ा रखने का सबसे बढ़िया तरीका है। भोर में ठंडी हवा धीरे-धीरे बहती है और आसमान में चिड़ियाँ मीठे गीत गाती हैं। ओस की बूँदें हरी घास पर मोतियों जैसी चमकती हैं। रोज़ सैर करने से मैं फुर्तीली, स्वस्थ और प्रसन्न रहती हूँ।"
  },
  {
    "id": "p50_friend",
    "title": "👭 Pakki Saheli",
    "text": "A true friend is like a shining star that brings bright light to our life. My best friend always studies with me and shares sweet lunch boxes during recess. We help each other learn computer typing skills and always speak polite words with great kindness respect and affection.",
    "hindi": "एक सच्चा मित्र चमकते तारे की तरह है जो हमारे जीवन में उजाला भरता है। मेरी सबसे अच्छी सहेली हमेशा मेरे साथ पढ़ती है और लंच बाँटती है। हम कंप्यूटर टाइपिंग सीखने में एक-दूसरे की मदद करते हैं और सदा विनम्रता, आदर व प्यार से बात करते हैं।"
  },
  {
    "id": "p50_rain",
    "title": "🌧️ Baarish Ka Mausam",
    "text": "The rainy season brings happiness and beauty to the entire world around us. Dark clouds cover the bright sky and cool raindrops fall gently on green leaves. Children love to splash water in little puddles. The sweet smell of wet earth makes everyone feel peaceful and delighted.",
    "hindi": "बारिश का मौसम हमारे चारों ओर की दुनिया में खुशियाँ और सुंदरता लाता है। काले बादल आसमान में छा जाते हैं और ठंडी बूँदें हरी पत्तियों पर गिरती हैं। बच्चे पानी के छोटे गड्ढों में छप-छप करना पसंद करते हैं। गीली मिट्टी की सौंधी खुशबू सभी के मन को शांत और प्रफुल्लित करती है।"
  },
  {
    "id": "p50_festival",
    "title": "🪔 Tyohaar Ki Khushi",
    "text": "Festivals bring joy love and togetherness to every family in our country. We wear colorful new clothes and share delicious homemade sweets with our neighbors. Bright earthen lamps light up every corner of our home. Sweet music and joyful laughter fill the air with pure warmth and harmony.",
    "hindi": "त्योहार हमारे देश के हर परिवार में खुशियाँ, प्यार और अपनापन लाते हैं। हम नए रंग-बिरंगे कपड़े पहनते हैं और पड़ोसियों के साथ स्वादिष्ट मिठाइयाँ बाँटते हैं। मिट्टी के दीये घर के हर कोने को रोशन करते हैं। मधुर संगीत और हँसी का माहौल हवा में प्रेम और मिठास घोल देता है।"
  },
  {
    "id": "p50_books",
    "title": "📚 Kitaabon Ka Sansar",
    "text": "Books are wonderful companions that teach us great wisdom and inspire our imagination. Reading good storybooks introduces us to brave heroes distant kingdoms and exciting scientific discoveries. Every single page gives us fresh knowledge and happiness. A person who loves reading books is never lonely or bored.",
    "hindi": "किताबें अद्भुत साथी हैं जो हमें ज्ञान सिखाती हैं और हमारी कल्पना को उड़ान देती हैं। अच्छी कहानियाँ हमें वीर नायकों, दूर देशों और नए वैज्ञानिक आविष्कारों से मिलवाती हैं। हर पन्ना हमें नया ज्ञान और आनंद देता है। किताबें पढ़ने का शौक रखने वाला कभी अकेला महसूस नहीं करता।"
  },
  {
    "id": "p50_pet",
    "title": "🐱 Mera Pyara Puppy",
    "text": "My cute little puppy is the most playful and loyal friend in our home. He has soft brown fur and bright sparkling eyes that shine with curiosity. Whenever I return from school he wags his tail and jumps happily. Playing with him in the garden brings endless laughter and joy.",
    "hindi": "मेरा नन्हा प्यारा पिल्ला हमारे घर में सबसे चंचल और वफ़ादार दोस्त है। उसके मुलायम भूरे बाल और चमकती हुई उत्सुक आँखें हैं। जब भी मैं स्कूल से लौटती हूँ, वह खुशी से पूँछ हिलाता है और उछलता है। बगीचे में उसके साथ खेलने से मन खुशियों से भर जाता है।"
  },
  {
    "id": "p50_dream",
    "title": "✨ Mera Sapna",
    "text": "Every student should have a noble dream that motivates them to work hard. My dream is to become a helpful teacher who inspires children with knowledge and kindness. I want to build a free library in every village. Hard work courage and dedication will make my dream come true.",
    "hindi": "हर विद्यार्थी का एक नेक सपना होना चाहिए जो उसे मेहनत करने की प्रेरणा दे। मेरा सपना एक शिक्षिका बनना है जो बच्चों को ज्ञान और दयालुता सिखाए। मैं हर गाँव में एक मुफ़्त पुस्तकालय बनाना चाहती हूँ। सच्ची मेहनत और लगन से मेरा यह सपना ज़रूर पूरा होगा।"
  },
  {
    "id": "p50_rainbow",
    "title": "🌈 Indradhanush Ke Rang",
    "text": "A colorful rainbow in the sky after a gentle rain is one of the most magical sights in nature. Seven bright vibrant colors curve gracefully across fluffy white clouds. It reminds us that after every dark storm bright sunshine always returns. Nature paints the sky with peace hope and wonder.",
    "hindi": "हल्की बारिश के बाद आसमान में सतरंगी इंद्रधनुष प्रकृति का सबसे जादुई दृश्य होता है। सात चमकदार रंग सफ़ेद बादलों के बीच सुंदर धनुष बनाते हैं। यह हमें याद दिलाता है कि हर तूफ़ान के बाद धूप खिलती है। प्रकृति आसमान को शांति, उम्मीद और आश्चर्य से सजाती है।"
  },
  {
    "id": "p50_kitten",
    "title": "🐾 Nanhi Kitten",
    "text": "A tiny white kitten with soft paws and pink ears is exploring our sunny veranda. She chases gentle buttercups and pounces playfully on fallen leaves. When she gets tired she curls into a warm little ball and naps peacefully. Her sweet gentle purr brings warmth to everyone.",
    "hindi": "मुलायम पंजों और गुलाबी कानों वाली एक नन्हीं सफ़ेद बिल्ली बरामदे में खेल रही है। वह तितलियों का पीछा करती है और गिरे हुए पत्तों पर झपटती है। थक जाने पर वह गोल मटोल गेंद बनकर सो जाती है। उसकी मीठी म्याऊँ सबके दिल को सुकून देती है।"
  },
  {
    "id": "p50_stars",
    "title": "⭐ Taaron Bhari Raat",
    "text": "Looking at millions of twinkling stars on a quiet clear night fills our heart with calm wonder. The gentle silver moonlight shines peacefully over silent rooftops and sleeping gardens. Every distant star seems to whisper secrets of the vast cosmos. The night brings peaceful rest and sweet dreams to all.",
    "hindi": "शांत और साफ़ रात में लाखों टिमटिमाते तारों को देखना दिल को विस्मय और शांति से भर देता है। चाँदनी खामोश छतों और सोए हुए बगीचों पर चमकती है। हर दूर का तारा ब्रह्मांड के रहस्य बताता प्रतीत होता है। रात सभी के लिए मीठे सपने और विश्राम लाती है।"
  },
  {
    "id": "p50_peacock",
    "title": "🦚 Mor Ka Sundar Naach",
    "text": "The peacock is the national bird of India admired for its royal grace and majestic beauty. When dark monsoon rain clouds appear it spreads its glorious emerald feathers and dances with pure delight. The rhythmic sway of its colorful crown brings instant joy to anyone who watches this wonder.",
    "hindi": "मोर भारत का राष्ट्रीय पक्षी है जो अपने शाही सौंदर्य और अनुग्रह के लिए जाना जाता है। जब काले मानसूनी बादल घिरते हैं, तो वह अपने पन्ने जैसे पंख फैलाकर झूम उठता है। उसके मुकुट का लहराना और सुंदर नृत्य देखने वाले के दिल को अपार खुशी देता है।"
  },
  {
    "id": "p50_baking",
    "title": "🧁 Cake Aur Mithaas",
    "text": "Baking a sweet vanilla cake with my elder sister on Sunday afternoon is my favorite weekend activity. We carefully mix fresh flour golden butter sugar and rich milk in a large ceramic bowl. The sweet fragrant aroma fills our kitchen as the oven warms. Sharing slices brings great happiness.",
    "hindi": "रविवार की दोपहर बड़ी बहन के साथ वैनिला केक बनाना मेरा पसंदीदा काम है। हम बड़े कटोरे में ताज़ा आटा, मक्खन, चीनी और दूध मिलाते हैं। जब ओवन गर्म होता है, तो रसोई में मीठी खुशबू फैल जाती है। सबके साथ केक बाँटना बहुत खुशी देता है।"
  },
  {
    "id": "p50_typing",
    "title": "💻 Computer Typing",
    "text": "Learning touch typing on a computer keyboard is an essential skill that empowers students for a bright future. By keeping all fingers placed properly on the home row keys we can type fast without looking down. Daily practice improves our English spelling accuracy and gives us immense learning confidence.",
    "hindi": "कंप्यूटर कीबोर्ड पर टच टाइपिंग सीखना विद्यार्थियों के उज्ज्वल भविष्य के लिए बहुत ज़रूरी हुनर है। होम रो कुंजियों पर उंगलियाँ रखकर हम बिना देखे तेज़ टाइप कर सकते हैं। रोज़ाना अभ्यास से हमारी स्पेलिंग सही होती है और सीखने का आत्मविश्वास बढ़ता है।"
  },
  {
    "id": "p50_dolphin",
    "title": "🐬 Samandar Ki Dolphin",
    "text": "Dolphins are intelligent friendly and joyful sea animals that swim gracefully through deep ocean waves. They leap playfully high above the blue water and communicate using sweet whistling sounds. Dolphins love to help each other and protect their family pod. Their playful nature reminds us to stay cheerful always.",
    "hindi": "डॉल्फ़िन बहुत समझदार, मिलनसार और खुशमिज़ाज समुद्री जीव हैं जो नीले पानी में तैरते हैं। वे पानी से ऊपर उछलती हैं और सीटी जैसी आवाज़ों से बातचीत करती हैं। वे अपने परिवार की रक्षा करती हैं। उनका चंचल स्वभाव हमें सदा मुस्कुराने की सीख देता है।"
  },
  {
    "id": "p50_garden",
    "title": "🌺 Phoolon Ka Bagicha",
    "text": "Our school botanical garden is filled with bright fragrant roses blooming lotus and golden sunflowers. Colorful butterflies flutter gently from petal to petal while busy honeybees collect sweet golden nectar. Watering tender plants every morning teaches us patience responsibility and deep love for our beautiful natural environment.",
    "hindi": "हमारे स्कूल का बगीचा महकते गुलाबों, कमलों और सुनहरे सूरजमुखी से भरा हुआ है। रंग-बिरंगी तितलियाँ पंखुड़ियों पर मँडराती हैं और मधुमक्खियाँ मीठा रस जुटाती हैं। रोज़ सुबह पौधों को पानी देना हमें धैर्य, ज़िम्मेदारी और प्रकृति से सच्चा प्रेम सिखाता है।"
  },
  {
    "id": "p50_music",
    "title": "🎵 Sangeet Ki Meethi Dhun",
    "text": "Music is the universal language of emotion that soothes our tired mind and inspires our spirit. Playing a gentle tune on the acoustic guitar or singing a sweet melodious song brings harmony to any home. Listening to peaceful classical rhythms helps us concentrate better during our daily school studies.",
    "hindi": "संगीत भावनाओं की ऐसी भाषा है जो थके हुए मन को शांति और उत्साह देती है। गिटार पर धुन बजाना या सुरीला गाना गाना घर में सकारात्मकता लाता है। शास्त्रीय संगीत की शांत लय सुनने से हमें पढ़ाई में बेहतर ध्यान केंद्रित करने में मदद मिलती है।"
  },
  {
    "id": "p50_courage",
    "title": "🦁 Himmat Aur Vishwas",
    "text": "True courage does not mean never feeling afraid but choosing to move forward with strong determination. Whenever we face a difficult exam or a challenging task we must stay patient and calm. Honest effort and self-belief turn every little obstacle into a stepping stone toward glorious lifelong success.",
    "hindi": "सच्चे साहस का मतलब डर न होना नहीं, बल्कि दृढ़ निश्चय से आगे बढ़ना है। जब भी कोई कठिन परीक्षा या चुनौती आए, हमें धैर्य और शांति बनाए रखनी चाहिए। सच्ची मेहनत और आत्मविश्वास हर बाधा को सफलता की सीढ़ी बना देते हैं।"
  },
  {
    "id": "p50_village",
    "title": "🏡 Pyara Shanti Bhara Gaon",
    "text": "My grandmother lives in a peaceful little village surrounded by golden wheat fields and green mango groves. Every morning roosters crow loudly and farmers walk cheerfully to their fertile farms. The air is completely pure and fresh without any city pollution. Village life teaches us simplicity and gratitude.",
    "hindi": "मेरी दादी एक शांत गाँव में रहती हैं जो गेहूँ के खेतों और आम के बगीचों से घिरा हुआ है। सुबह किसान खेतों की ओर जाते हैं और हवा शहर के प्रदूषण से दूर एकदम शुद्ध होती है। गाँव का जीवन हमें सादगी और कृतज्ञता का पाठ पढ़ाता है।"
  },
  {
    "id": "p50_tea",
    "title": "☕ Sham Ki Masala Chai",
    "text": "Drinking a warm cup of sweet cardamom tea with my loving family in the evening is our daily ritual of joy. We sit together in the cozy balcony and talk about our school day and funny moments. Sharing hot snacks and warm stories strengthens our family bonds with unending love.",
    "hindi": "शाम को परिवार के साथ इलायची वाली चाय पीना हमारे लिए खुशियों का पल होता है। हम बालकनी में बैठकर स्कूल की बातें और मज़ेदार किस्से साझा करते हैं। गरम नाश्ता और बातचीत हमारे पारिवारिक रिश्तों को अटूट प्रेम से मजबूत बनाते हैं।"
  },
  {
    "id": "p50_painting",
    "title": "🎨 Rang Aur Chitrashala",
    "text": "Splashing bright watercolors on a clean white drawing sheet lets our imagination fly completely free. Mixing bright crimson with sunny yellow creates cheerful orange hues that glow with warmth. Painting blooming valleys and cute animal portraits brings immense peaceful happiness. Art gives every student a beautiful creative voice.",
    "hindi": "ड्राइंग शीट पर वॉटरकलर से चित्र बनाना हमारी कल्पना को आज़ाद कर देता है। लाल और पीले रंग को मिलाकर नारंगी रंग बनाना बहुत आनंददायक होता है। फूलों की घाटियों और प्यारे जानवरों के चित्र बनाना मन को शांति देता है। कला हमें रचनात्मक बनाती है।"
  },
  {
    "id": "p50_recess",
    "title": "🏸 Recess Ka Khel",
    "text": "The school recess bell rings loudly bringing cheerful smiles to every student in our busy classroom. We quickly pack our books rush to the grassy playground and open our delicious homemade lunch boxes. Playing fun badminton matches and tag games makes our body energetic agile and ready to learn.",
    "hindi": "स्कूल की आधी छुट्टी की घंटी बजते ही हर चेहरे पर मुस्कान आ जाती है। हम किताबें रखकर मैदान में जाते हैं और स्वादिष्ट टिफिन खोलते हैं। बैडमिंटन और खेलकूद करने से हमारा शरीर फुर्तीला बनता है और पढ़ाई के लिए नया जोश मिलता है।"
  },
  {
    "id": "p50_space",
    "title": "🚀 Antariksh Ki Yatra",
    "text": "The vast deep space is a breathtaking universe waiting for young scientists and brave astronauts to explore. Distant spinning galaxies glowing nebulae and mysterious rocky planets orbit quietly in the darkness. Human curiosity and modern science build rockets that travel across stars. Science shows that our potential is truly limitless.",
    "hindi": "अथाह अंतरिक्ष एक विस्मयकारी ब्रह्मांड है जो युवा वैज्ञानिकों की खोज की प्रतीक्षा कर रहा है। चमकती आकाशगंगाएं और ग्रह अंधेरे में परिक्रमा करते हैं। आधुनिक विज्ञान रॉकेट बनाकर सितारों तक पहुँच रहा है। विज्ञान हमें सिखाता है कि हमारी क्षमताएं असीम हैं।"
  },
  {
    "id": "p50_bunny",
    "title": "🐰 Nanha Khargosh",
    "text": "A fluffy white bunny with long soft ears is nibbling fresh green clover in the sunny meadow. When a butterfly flutters near she hops gently across the grass. Her pink nose twitches with innocent curiosity. Seeing gentle animals live in peaceful harmony fills our heart with gentle kindness.",
    "hindi": "लंबे मुलायम कानों वाला एक रोएँदार सफ़ेद खरगोश धूप खिली घास के मैदान में ताज़ा घास खा रहा है। जब कोई तितली पास आती है, तो वह धीरे से कूदता है। उसकी गुलाबी नाक मासूम उत्सुकता से हिलती है। ऐसे शांत जानवरों को देखना मन में दयालुता भर देता है।"
  },
  {
    "id": "p50_mountains",
    "title": "🏔️ Barfili Pahadiyan",
    "text": "High snow-capped mountains stand tall and majestic against the clear blue morning sky. Fresh icy winds whisper ancient secrets through silent pine valleys. Crystal clear rivers flow swiftly down steep rocky slopes toward the fertile plains below. Standing before these grand mountains teaches us profound humility and inner strength.",
    "hindi": "बर्फ़ से ढके ऊँचे पहाड़ सुबह के नीले आसमान में शान से खड़े हैं। ठंडी हवा चीड़ के पेड़ों की वादियों में बहती है। साफ़ नदियाँ पथरीली ढलानों से नीचे मैदानों की ओर तेज़ी से बहती हैं। इन विशाल पहाड़ों के सामने खड़े होना हमें विनम्रता और आंतरिक शक्ति सिखाता है।"
  },
  {
    "id": "p50_violin",
    "title": "🎻 Pyari Violin Dhun",
    "text": "Playing the wooden violin with a smooth horsehair bow creates sweet enchanting melodies that touch every listener. Practicing musical scales every evening requires patience good posture and deep concentration. When the fingers press the silver strings accurately beautiful music flows effortlessly. Art brings peace and joy to everyday life.",
    "hindi": "चिकने धनुष से लकड़ी का वायलिन बजाने पर ऐसी मीठी धुन निकलती है जो हर किसी का दिल छू लेती है। हर शाम संगीत का अभ्यास करने के लिए धैर्य और एकाग्रता चाहिए। जब उंगलियाँ तारों पर सही बैठती हैं, तो सुंदर संगीत बह निकलता है। कला जीवन में शांति और आनंद लाती है।"
  },
  {
    "id": "p50_picnic",
    "title": "🧺 Parivar Ka Picnic",
    "text": "Going for a fun weekend picnic in the city rose park is our happiest family tradition. We spread a large red checkered mat under a shady banyan tree and enjoy sweet sandwiches. My little brother plays flying disc while father reads poetry. Spending quality time together strengthens family affection.",
    "hindi": "सप्ताहांत पर शहर के गुलाब पार्क में पिकनिक मनाना हमारे परिवार की सबसे प्यारी परंपरा है। हम बरगद के पेड़ के नीचे चटाई बिछाते हैं और स्वादिष्ट सैंडविच खाते हैं। छोटा भाई खेलता है और पिताजी कविता पढ़ते हैं। एक साथ समय बिताने से पारिवारिक प्रेम और गहरा होता है।"
  },
  {
    "id": "p50_fairy",
    "title": "📖 Dadi Ki Lori",
    "text": "My gentle grandmother tells the most wonderful bedtime fairy tales before we fall asleep at night. Her soft soothing voice speaks of kind fairies magical wishing trees and brave honest princes. Listening to her sweet stories makes all our daily worries disappear. Her affectionate blessings protect us always.",
    "hindi": "मेरी प्यारी दादी रात को सोने से पहले परियों की सबसे सुंदर कहानियाँ सुनाती हैं। उनकी मधुर आवाज़ में जादुई पेड़ों और दयालु परियों की बातें होती हैं। उनकी कहानियाँ सुनने से दिनभर की सारी थकान दूर हो जाती है। उनका स्नेहमयी आशीर्वाद हमेशा हमारे साथ रहता है।"
  }
];


/* ── Dynamic Storage & Background Auto-Generator for Endless 50-Word Essays ── */
const DYNAMIC_PARAS_KEY = "typoCuteDynamicParagraphsBank";

function loadDynamicParagraphs() {
  try {
    const raw = localStorage.getItem(DYNAMIC_PARAS_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return [];
}

function saveDynamicParagraphs(list) {
  try {
    localStorage.setItem(DYNAMIC_PARAS_KEY, JSON.stringify(list));
  } catch(e) {}
}

let DYNAMIC_PARAGRAPHS = loadDynamicParagraphs();

function getAllParagraphs() {
  const merged = [...PARAGRAPH_BANK];
  const seenIds = new Set(merged.map(p => p.id));
  DYNAMIC_PARAGRAPHS.forEach(p => {
    if (!seenIds.has(p.id)) {
      merged.push(p);
      seenIds.add(p.id);
    }
  });
  return merged;
}

const PROCEDURAL_TOPICS_POOL = [
  {
    topic: "Sunflower Field",
    title: "🌻 Surajmukhi Ka Khet",
    text: "Bright golden sunflowers always turn their cheerful faces toward the warm glowing morning sun. Tall green stalks sway gently in the refreshing country breeze as hummingbirds flutter nearby. Millions of yellow petals create a joyful sea of golden sunshine. Nature shows us how to follow light and stay optimistic.",
    hindi: "चमकते सूरजमुखी हमेशा अपना चेहरा सुबह के गर्म सूरज की ओर मोड़ते हैं। तने हवा में झूमते हैं और पक्षी मँडराते हैं। लाखों पीली पंखुड़ियाँ सुनहरी धूप का खूबसूरत नज़ारा बनाती हैं। प्रकृति हमें रोशनी का पीछा करने और सकारात्मक रहने की सीख देती है।"
  },
  {
    topic: "Baby Elephant",
    title: "🐘 Nanha Haathi",
    text: "A playful baby elephant walks happily beside his caring mother through the lush green wildlife sanctuary. He sprays cool river water over his back using his tiny curious trunk. Gentle birds perch safely on his round back. Living in harmony with wild animals teaches us deep compassion and peace.",
    hindi: "एक चंचल नन्हा हाथी अपनी माँ के साथ हरे-भरे जंगल में खुशी से चल रहा है। वह अपनी नन्हीं सूँड से नदी का पानी अपनी पीठ पर छिड़कता है। शांत पक्षी उसकी पीठ पर बैठते हैं। जंगली जीवों के साथ मिलकर रहना हमें सच्ची करुणा और शांति सिखाता है।"
  },
  {
    topic: "Ocean Waves",
    title: "🌊 Samandar Ki Lehrein",
    text: "Gentle rhythmic ocean waves roll smoothly toward the golden sandy beach under the warm afternoon sunshine. Children build small sandcastles and collect smooth shiny seashells along the peaceful shore. White seagulls glide gracefully through the salty sea breeze. The boundless ocean reminds us of the endless beauty in our world.",
    hindi: "शांत समुद्री लहरें दोपहर की धूप में सुनहरे रेतीले तट की ओर बहती हैं। बच्चे रेत के महल बनाते हैं और चमकदार सीपियाँ इकट्ठा करते हैं। सफ़ेद बगुले हवा में तैरते हैं। विशाल समुद्र हमें अपनी दुनिया की असीम सुंदरता की याद दिलाता है।"
  },
  {
    topic: "Morning Yoga",
    title: "🧘‍♀️ Subah Ka Yoga",
    text: "Practicing peaceful morning yoga breathing exercises in the open garden calms our mind and makes our muscles strong. Inhaling fresh oxygen fills our body with joyful vitality while gentle stretching relieves tiredness. Yoga teaches students self-discipline inner harmony and quiet mental focus. Healthy habits build a bright energetic life.",
    hindi: "बगीचे में सुबह शांत योग और प्राणायाम करना हमारे मन को शांत और शरीर को मज़बूत बनाता है। ताज़ी हवा में साँस लेने से स्फूर्ति आती है और खिंचाव से थकान दूर होती है। योग विद्यार्थियों को आत्म-अनुशासन और एकाग्रता सिखाता है। अच्छी आदतें जीवन को ऊर्जावान बनाती हैं।"
  },
  {
    topic: "First Bicycle",
    title: "🚲 Meri Pehli Cycle",
    text: "Riding my shiny pink bicycle along the quiet neighborhood lane with my friends is an exciting daily joy. Ringing the clear bell and pedaling through the cool evening breeze feels like flying freely. Balancing steadily on two wheels teaches us patience courage and determination to overcome all difficult hurdles.",
    hindi: "सहेलियों के साथ अपनी गुलाबी साइकिल चलाना एक रोमांचक खुशी है। घंटी बजाते हुए शाम की ठंडी हवा में पैडल मारना आज़ाद उड़ने जैसा लगता है। दो पहियों पर संतुलन बनाना हमें धैर्य, साहस और मुश्किलों को पार करने का आत्मविश्वास सिखाता है।"
  },
  {
    topic: "Apple Orchard",
    title: "🍎 Seb Ka Bagicha",
    text: "Walking through a sunny hillside apple orchard in autumn is a delightful feast for all our senses. Heavy branches bend gracefully under bright crisp red apples shining in the morning dew. Farmers pick fresh ripe fruit with happy songs. Tasting sweet juicy organic apples connects us directly with fertile earth.",
    hindi: "पहाड़ी सेब के बगीचे में टहलना इंद्रियों के लिए एक अद्भुत आनंद है। शाखाएं ओस में चमकते लाल सेबों के भार से झुक जाती हैं। किसान खुशी के गीतों के साथ फल तोड़ते हैं। मीठे रसीले सेब खाना हमें उपजाऊ धरती के उपहारों से जोड़ता है।"
  },
  {
    topic: "Grandmothers Garden",
    title: "🏡 Dadi Ki Phulwari",
    text: "My grandmother tends a charming little balcony garden filled with holy basil fragrant mint and cheerful yellow marigolds. Every morning she hums peaceful devotional prayers while watering each ceramic pot with gentle care. Green leaves purify our home air and bring soothing tranquil harmony to our busy everyday life.",
    hindi: "मेरी दादी बालकनी में तुलसी, पुदीना और गेंदे के फूलों का बगीचा संवारती हैं। वे सुबह प्रार्थना गुनगुनाते हुए पौधों को पानी देती हैं। हरी पत्तियाँ घर की हवा को शुद्ध करती हैं और हमारे जीवन में शांति व सौहार्द लाती हैं।"
  },
  {
    topic: "Shooting Star",
    title: "🌠 Toot-ta Tara",
    text: "Spotting a brilliant shooting star streak across the dark velvet midnight sky is a breathtaking moment of wonder. Making a silent hopeful wish for family health and peace fills our young heart with optimism. The vast starry cosmos reminds us that every dream is achievable with hard work and faith.",
    hindi: "रात के अंधेरे आसमान में टूटते हुए तारे को देखना एक विस्मयकारी पल होता है। परिवार की सेहत और शांति के लिए दिल से मांगी गई दुआ मन को आशा से भर देती है। तारों भरा ब्रह्मांड याद दिलाता है कि मेहनत से हर सपना पूरा हो सकता है।"
  }
];

let isGeneratingBackgroundEssay = false;

function triggerBackgroundParagraphGeneration() {
  if (isGeneratingBackgroundEssay) return;
  const allParas = getAllParagraphs();
  const completed = new Set(INFINITE_PROGRESS.completedParas);
  const uncompleted = allParas.filter(p => !completed.has(p.id));

  // If uncompleted essays are plenty, no rush
  if (uncompleted.length >= 20) return;

  isGeneratingBackgroundEssay = true;
  setTimeout(async () => {
    try {
      const existingIds = new Set(allParas.map(p => p.id));
      const candidates = PROCEDURAL_TOPICS_POOL.filter(pt => !existingIds.has("p50_auto_" + pt.topic.toLowerCase().replace(/[^a-z0-9]/g, "_")));

      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        const newPara = {
          id: "p50_auto_" + pick.topic.toLowerCase().replace(/[^a-z0-9]/g, "_"),
          title: pick.title,
          text: pick.text,
          hindi: pick.hindi
        };
        DYNAMIC_PARAGRAPHS.push(newPara);
        saveDynamicParagraphs(DYNAMIC_PARAGRAPHS);
      } else if (navigator.onLine && typeof AI_ENGINE !== "undefined" && typeof AI_ENGINE.generateParagraph50Words === "function") {
        const topics = ["Peaceful Lake", "Dancing Peacock", "Cute Kitten", "Warm Milk", "Library Corner"];
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const res = await AI_ENGINE.generateParagraph50Words(topic);
        if (res && res.english && res.hindi) {
          const newPara = {
            id: "p50_ai_" + Date.now(),
            title: "✨ " + topic,
            text: res.english,
            hindi: res.hindi
          };
          DYNAMIC_PARAGRAPHS.push(newPara);
          saveDynamicParagraphs(DYNAMIC_PARAGRAPHS);
        }
      }
    } catch(e) {
      console.warn("Background auto-generation note:", e);
    } finally {
      isGeneratingBackgroundEssay = false;
      if (CURRENT_SIMPLIFIED_MODE === "paragraph_50") {
        renderTopicPills("paragraph_50");
        updateLifetimeProgress();
      }
    }
  }, 1200);
}



/* ── Fallback 200 Core Words if words_10k.js is not loaded ── */
const FALLBACK_CORE_WORDS = [
  {word:"mother",hindi:"माँ"},{word:"father",hindi:"पिताजी"},{word:"sister",hindi:"बहन"},{word:"brother",hindi:"भाई"},
  {word:"family",hindi:"परिवार"},{word:"water",hindi:"पानी"},{word:"smile",hindi:"मुस्कान"},{word:"happy",hindi:"खुश"},
  {word:"flower",hindi:"फूल"},{word:"tree",hindi:"पेड़"},{word:"school",hindi:"विद्यालय"},{word:"friend",hindi:"सहेली"},
  {word:"book",hindi:"किताब"},{word:"pencil",hindi:"पेंसिल"},{word:"sun",hindi:"सूरज"},{word:"star",hindi:"तारा"},
  {word:"kind",hindi:"दयालु"},{word:"brave",hindi:"बहादुर"},{word:"love",hindi:"प्यार"},{word:"peace",hindi:"शांति"},
  {word:"apple",hindi:"सेब"},{word:"bread",hindi:"रोटी"},{word:"milk",hindi:"दूध"},{word:"rose",hindi:"गुलाब"},
  {word:"bird",hindi:"चिड़िया"},{word:"cloud",hindi:"बादल"},{word:"cute",hindi:"प्यारा"},{word:"sweet",hindi:"मीठा"},
  {word:"dance",hindi:"नाचना"},{word:"sing",hindi:"गाना"},{word:"learn",hindi:"सीखना"},{word:"walk",hindi:"चलना"},
  {word:"play",hindi:"खेलना"},{word:"write",hindi:"लिखना"},{word:"read",hindi:"पढ़ना"},{word:"help",hindi:"मदद"}
];

/* ── Get All 10,000+ Mixed Words ── */
function getAll10kWords() {
  if (typeof WORDS_10K_DATABASE !== "undefined" && Array.isArray(WORDS_10K_DATABASE) && WORDS_10K_DATABASE.length > 0) {
    return WORDS_10K_DATABASE;
  }
  return FALLBACK_CORE_WORDS;
}

/* ── Infinite Progress Tracker (localStorage) ── */
const PROGRESS_KEY = "typoCuteInfinite10kProgress";

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return { completedWords: [], completedParas: [], totalWordsTyped: 0, totalParasTyped: 0 };
}

function saveProgress(prog) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog));
  } catch(e) {}
}

let INFINITE_PROGRESS = loadProgress();

/* ── Fisher-Yates Shuffle ── */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Get 10 Fresh Mixed Words without repetition ── */
function getFreshMixedWords(filterId = "all", count = 10) {
  const allWords = getAll10kWords();
  const completed = new Set(INFINITE_PROGRESS.completedWords);

  // Apply letter-length filter if specified
  let filtered = allWords;
  if (filterId === "short") {
    filtered = allWords.filter(w => w.word.length >= 3 && w.word.length <= 4);
  } else if (filterId === "medium") {
    filtered = allWords.filter(w => w.word.length >= 5 && w.word.length <= 6);
  } else if (filterId === "long") {
    filtered = allWords.filter(w => w.word.length >= 7);
  }

  // Filter out already completed words
  let uncompleted = filtered.filter(w => !completed.has(w.word));

  if (uncompleted.length < count) {
    // If we finished all 10k words, reset completed set and keep rolling infinitely!
    INFINITE_PROGRESS.completedWords = [];
    saveProgress(INFINITE_PROGRESS);
    uncompleted = filtered;
  }

  return shuffleArray(uncompleted).slice(0, count);
}

/* ── Get Fresh 50-Word Paragraph without repetition ── */
function getVisibleParagraphPills() {
  const allParas = getAllParagraphs();
  const completed = new Set(INFINITE_PROGRESS.completedParas);
  const uncompleted = allParas.filter(p => !completed.has(p.id));

  const pills = [
    { title: "🎲 Agla Naya Essay (Random)", isRandom: true }
  ];

  // Show up to 4 fresh uncompleted essays as quick topic choices
  const toShow = uncompleted.slice(0, 4);
  toShow.forEach(p => {
    pills.push({ title: p.title, para: p, isRandom: false });
  });

  return pills;
}

function getFreshParagraph(forceIdx = null) {
  const allParas = getAllParagraphs();
  const completed = new Set(INFINITE_PROGRESS.completedParas);
  let uncompleted = allParas.filter(p => !completed.has(p.id));

  if (uncompleted.length === 0) {
    // If all completed, reset completed set and keep rolling infinitely!
    INFINITE_PROGRESS.completedParas = [];
    saveProgress(INFINITE_PROGRESS);
    uncompleted = allParas;
  }

  // If forceIdx is 0 (Random pill) or null, pick a random uncompleted essay
  if (forceIdx === 0 || forceIdx === null) {
    return uncompleted[Math.floor(Math.random() * uncompleted.length)];
  }

  // If forceIdx > 0, find specific visible pill
  const pills = getVisibleParagraphPills();
  if (pills[forceIdx] && pills[forceIdx].para) {
    return pills[forceIdx].para;
  }

  return uncompleted[Math.floor(Math.random() * uncompleted.length)];
}

/* ── Mark completed ── */
function markWordCompleted(word) {
  if (!INFINITE_PROGRESS.completedWords.includes(word)) {
    INFINITE_PROGRESS.completedWords.push(word);
  }
  INFINITE_PROGRESS.totalWordsTyped++;
  saveProgress(INFINITE_PROGRESS);
}

function markParagraphCompleted(paraId) {
  if (!INFINITE_PROGRESS.completedParas.includes(paraId)) {
    INFINITE_PROGRESS.completedParas.push(paraId);
  }
  INFINITE_PROGRESS.totalParasTyped++;
  saveProgress(INFINITE_PROGRESS);
}

/* ── Update Lifetime Counter ── */
function updateLifetimeProgress() {
  const el = document.getElementById("progressCount");
  if (!el) return;
  el.textContent = `${STATE.itemIndex + 1} / ${STATE.currentItems.length || 10}`;
}

/* ── Mode State ── */
let CURRENT_SIMPLIFIED_MODE = "small_words";
let CURRENT_FILTER_INDEX = 0;

function initSimplifiedTwoModeApp() {
  const btnSmall = document.getElementById("btnModeSmallWords");
  const btn50    = document.getElementById("btnMode50Words");
  const btnVocab = document.getElementById("btnModeVocabStudio");
  const btnHeaderQuiz = document.getElementById("btnHeaderQuiz");

  btnSmall?.addEventListener("click", () => {
    switchSimplifiedMode("small_words", 0);
  });

  btn50?.addEventListener("click", () => {
    switchSimplifiedMode("paragraph_50", 0);
  });

  btnVocab?.addEventListener("click", () => {
    switchSimplifiedMode("vocab_studio");
  });

  btnHeaderQuiz?.addEventListener("click", () => {
    switchSimplifiedMode("vocab_studio");
  });

  const btnHeaderReset = document.getElementById("btnHeaderReset");
  btnHeaderReset?.addEventListener("click", () => {
    resetAllProgress(true);
  });

  const btnHeaderTracker = document.getElementById("btnHeaderTracker");
  btnHeaderTracker?.addEventListener("click", () => {
    openProgressTrackerModal();
  });

  const closePtBtn = document.getElementById("closeProgressTrackerBtn");
  closePtBtn?.addEventListener("click", () => {
    closeProgressTrackerModal();
  });

  // Restore sister's last mode and filter
  const savedMode = localStorage.getItem("typo_last_mode") || "small_words";
  const savedFilter = parseInt(localStorage.getItem("typo_last_filter") || "0", 10);
  switchSimplifiedMode(savedMode, isNaN(savedFilter) ? 0 : savedFilter);
}

function switchSimplifiedMode(mode, filterIdx = 0) {
  CURRENT_SIMPLIFIED_MODE = mode;
  CURRENT_FILTER_INDEX = filterIdx;
  try {
    localStorage.setItem("typo_last_mode", mode);
    localStorage.setItem("typo_last_filter", filterIdx.toString());
  } catch(e) {}

  const btnSmall = document.getElementById("btnModeSmallWords");
  const btn50    = document.getElementById("btnMode50Words");
  const btnVocab = document.getElementById("btnModeVocabStudio");
  const tabArena = document.getElementById("tab-arena");
  const tabVocabPage = document.getElementById("tab-vocab-page");

  btnSmall?.classList.remove("active");
  btn50?.classList.remove("active");
  btnVocab?.classList.remove("active");

  if (mode === "vocab_studio") {
    btnVocab?.classList.add("active");
    if (tabArena) {
      tabArena.classList.remove("active");
      tabArena.style.display = "none";
    }
    if (tabVocabPage) {
      tabVocabPage.classList.add("active");
      tabVocabPage.style.display = "flex";
    }
    if (typeof openVocabStudioPage === "function") {
      openVocabStudioPage();
    }
    return;
  }

  // Normal arena modes (small_words or paragraph_50)
  if (tabVocabPage) {
    tabVocabPage.classList.remove("active");
    tabVocabPage.style.display = "none";
  }
  if (tabArena) {
    tabArena.classList.add("active");
    tabArena.style.display = "flex";
  }

  if (mode === "small_words") {
    btnSmall?.classList.add("active");
  } else if (mode === "paragraph_50") {
    btn50?.classList.add("active");
  }

  renderTopicPills(mode);
  loadSimplifiedTopic(mode, filterIdx);
}

function renderTopicPills(mode) {
  const container = document.getElementById("practiceTopicSelectorRow");
  if (!container) return;
  container.innerHTML = "";

  if (mode === "small_words") {
    // 100% Mixed Words Filters
    MIXED_FILTERS.forEach((f, idx) => {
      const pill = document.createElement("button");
      pill.className = `topic-pill-btn ${idx === CURRENT_FILTER_INDEX ? "active" : ""}`;
      pill.textContent = f.title;
      pill.onclick = () => {
        CURRENT_FILTER_INDEX = idx;
        updateActiveTopicPill();
        loadSimplifiedTopic("small_words", idx);
      };
      container.appendChild(pill);
    });

    // Special AI Naye Shabd Pill
    const aiWordPill = document.createElement("button");
    aiWordPill.className = "topic-pill-btn ai-special-pill";
    aiWordPill.innerHTML = "✨ AI Naye Shabd";
    aiWordPill.title = "AI se kisi bhi topic ke naye words banwayein";
    aiWordPill.onclick = () => {
      handleGenerateAiSmallWords();
    };
    container.appendChild(aiWordPill);

  } else {
    // 50-Word Essays - Infinite Non-Repeating Dynamic Stream
    const pills = getVisibleParagraphPills();
    pills.forEach((p, idx) => {
      const pill = document.createElement("button");
      pill.className = `topic-pill-btn ${idx === CURRENT_FILTER_INDEX ? "active" : ""}`;
      pill.textContent = p.title;
      pill.title = p.isRandom ? "Har baar naya bina repeat hone wala essay" : "Is essay ko type karein";
      pill.onclick = () => {
        CURRENT_FILTER_INDEX = idx;
        updateActiveTopicPill();
        loadSimplifiedTopic("paragraph_50", idx);
      };
      container.appendChild(pill);
    });

    // AI 50-Word Essay Pill
    const aiPill = document.createElement("button");
    aiPill.className = "topic-pill-btn ai-special-pill";
    aiPill.innerHTML = "✨ AI Naya 50-Word Essay";
    aiPill.title = "Apni marzi ke topic par naya 50-word essay banwayein";
    aiPill.onclick = () => {
      handleGenerateAi50WordParagraph();
    };
    container.appendChild(aiPill);

    // All 30 Essays & Progress Tracker Pill
    const allEssaysPill = document.createElement("button");
    allEssaysPill.className = "topic-pill-btn";
    allEssaysPill.style.background = "#f0fdf4";
    allEssaysPill.style.color = "#15803d";
    allEssaysPill.style.borderColor = "#86efac";
    allEssaysPill.innerHTML = "📊 Sabhi 30 Essays & Progress";
    allEssaysPill.title = "Sabhi 30 essays ki list aur kaunse complete hue hain dekhein";
    allEssaysPill.onclick = () => {
      openProgressTrackerModal();
    };
    container.appendChild(allEssaysPill);

    // Trigger background generation to keep pool full!
    triggerBackgroundParagraphGeneration();
  }
}

function updateActiveTopicPill() {
  const pills = document.querySelectorAll("#practiceTopicSelectorRow .topic-pill-btn:not(.ai-special-pill)");
  pills.forEach((p, i) => {
    p.classList.toggle("active", i === CURRENT_FILTER_INDEX);
  });
}

function loadSimplifiedTopic(mode, idx) {
  CURRENT_FILTER_INDEX = idx;
  const audioActions = document.getElementById("duoAudioActions");
  const categoryTag  = document.getElementById("promptCategoryTag");
  const speechBubble = document.getElementById("duoSpeechBubble");
  const grammarBite  = document.getElementById("duoGrammarBite");

  stopCurrentAudio();

  if (mode === "small_words") {
    if (audioActions) audioActions.style.display = "flex";
    if (categoryTag)  categoryTag.style.display = "none";
    if (grammarBite)  grammarBite.style.display = "flex";
    speechBubble?.classList.remove("is-paragraph-bubble");

    const filter = MIXED_FILTERS[idx] || MIXED_FILTERS[0];
    const freshWords = getFreshMixedWords(filter.id, 10);

    const lessonObj = {
      id: "mix10k_" + filter.id + "_" + Date.now(),
      title: filter.title,
      hindi: "10,000+ Mixed Words — कभी repeat नहीं होंगे! 🌸"
    };

    const displayEl = document.getElementById("textDisplay");
    displayEl?.classList.remove("is-paragraph");
    loadLesson(lessonObj, freshWords, false);
    setMascot("10,000+ Mixed Words! Ek ek shabd aaram se type karo 🌸", "normal");

  } else {
    if (audioActions) audioActions.style.display = "none";
    if (categoryTag)  categoryTag.style.display = "inline-block";
    if (grammarBite)  grammarBite.style.display = "none";
    speechBubble?.classList.add("is-paragraph-bubble");

    const para = getFreshParagraph(idx);
    const lessonObj = {
      id: para.id,
      title: para.title,
      hindi: para.hindi
    };

    const displayEl = document.getElementById("textDisplay");
    displayEl?.classList.add("is-paragraph");
    loadLesson(lessonObj, [{ english: para.text, hindi: para.hindi }], false);
    setMascot("50-Word Essay Mode! Pura paragraph ek saath type karo 📝✨", "cheer");
  }

  updateLifetimeProgress();
  focusTypingArea();
}

function loadDirectParagraph(para) {
  if (!para) return;
  const audioActions = document.getElementById("duoAudioActions");
  const categoryTag  = document.getElementById("promptCategoryTag");
  const speechBubble = document.getElementById("duoSpeechBubble");
  const grammarBite  = document.getElementById("duoGrammarBite");

  stopCurrentAudio();

  if (audioActions) audioActions.style.display = "none";
  if (categoryTag)  categoryTag.style.display = "inline-block";
  if (grammarBite)  grammarBite.style.display = "none";
  speechBubble?.classList.add("is-paragraph-bubble");

  const lessonObj = {
    id: para.id,
    title: para.title,
    hindi: para.hindi
  };

  const displayEl = document.getElementById("textDisplay");
  displayEl?.classList.add("is-paragraph");
  loadLesson(lessonObj, [{ english: para.text, hindi: para.hindi }], false);
  setMascot(`Chosen Essay: ${para.title}! Aaram se type karo 📝🌸`, "cheer");
  updateLifetimeProgress();
  focusTypingArea();
}

function openProgressTrackerModal() {
  const modal = document.getElementById("progressTrackerModal");
  if (!modal) return;

  const paras = getAllParagraphs();
  const completedParas = new Set(INFINITE_PROGRESS.completedParas || []);
  const completedWords = new Set(INFINITE_PROGRESS.completedWords || []);

  const ptParasCount = document.getElementById("ptParasCount");
  if (ptParasCount) ptParasCount.textContent = `${completedParas.size} / ${paras.length}`;

  const ptWordsCount = document.getElementById("ptWordsCount");
  if (ptWordsCount) ptWordsCount.textContent = `${completedWords.size} / 2,211`;

  const ptXpVal = document.getElementById("ptXpVal");
  if (ptXpVal) ptXpVal.textContent = `${STATE.xp} XP`;

  const ptStreakVal = document.getElementById("ptStreakVal");
  if (ptStreakVal) ptStreakVal.textContent = `${STATE.streak} Day`;

  const percent = Math.round((completedParas.size / Math.max(1, paras.length)) * 100);
  const ptPercent = document.getElementById("ptEssaysProgressPercent");
  if (ptPercent) ptPercent.textContent = `${percent}% Completed`;

  const ptBar = document.getElementById("ptRoadmapBarFill");
  if (ptBar) ptBar.style.width = `${percent}%`;

  const listEl = document.getElementById("ptEssaysChecklist");
  if (listEl) {
    listEl.innerHTML = "";
    paras.forEach((p, idx) => {
      const isDone = completedParas.has(p.id);
      const row = document.createElement("div");
      row.className = `pt-essay-row ${isDone ? "completed" : ""}`;
      row.title = "Click karke yeh essay type karna shuru karein";

      row.innerHTML = `
        <div class="pt-essay-left">
          <div class="pt-essay-num-badge ${isDone ? "is-done" : ""}">${String(idx + 1).padStart(2, "0")}</div>
          <div class="pt-essay-text">
            <span class="pt-essay-name">${p.title || p.topic || "Essay " + (idx + 1)}</span>
            <span class="pt-essay-meta">50 Words • 80 XP • 🌸 Hindi Anuvad</span>
          </div>
        </div>
        <div class="pt-essay-right">
          ${isDone 
            ? `<span class="pt-duo-done-badge">✅ DONE</span>` 
            : `<button class="pt-duo-start-btn" type="button">▶️ START</button>`
          }
        </div>
      `;

      row.onclick = () => {
        closeProgressTrackerModal();
        switchSimplifiedMode("paragraph_50");
        loadDirectParagraph(p);
      };

      listEl.appendChild(row);
    });
  }

  modal.style.display = "flex";
}

function closeProgressTrackerModal() {
  const modal = document.getElementById("progressTrackerModal");
  if (modal) modal.style.display = "none";
}

window.openProgressTrackerModal = openProgressTrackerModal;
window.closeProgressTrackerModal = closeProgressTrackerModal;
window.loadDirectParagraph = loadDirectParagraph;

/* ── Top Header Menu Dropdown ── */
function toggleHeaderMenu() {
  const menu = document.getElementById("headerMenuDropdown");
  if (!menu) return;
  if (menu.style.display === "none" || menu.style.display === "") {
    menu.style.display = "flex";
  } else {
    menu.style.display = "none";
  }
}

function closeHeaderMenu() {
  const menu = document.getElementById("headerMenuDropdown");
  if (menu) menu.style.display = "none";
}

window.toggleHeaderMenu = toggleHeaderMenu;
window.closeHeaderMenu = closeHeaderMenu;

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  const container = document.querySelector(".header-menu-container");
  if (container && !container.contains(e.target)) {
    closeHeaderMenu();
  }
});

/* ═══════════════════════════════════════════════════
   PWA & NATIVE DESKTOP APPLICATION INSTALLATION
   ═══════════════════════════════════════════════════ */

let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById("btnHeaderInstallApp");
  if (btn) {
    btn.style.display = "inline-flex";
  }
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  const btn = document.getElementById("btnHeaderInstallApp");
  if (btn) {
    btn.innerHTML = "✅ <span>Installed</span>";
    btn.disabled = true;
  }
  alert("🎉 Shaabash! TypoCute aapke laptop me real application ki tarah install ho gaya hai! Ab aap ise Desktop ya Start Menu se open kar sakte hain. 💖");
});

window.triggerAppInstall = function() {
  openInstallModal();
};

window.openInstallModal = function() {
  const modal = document.getElementById("installAppModal");
  if (modal) modal.style.display = "flex";
};

window.closeInstallModal = function() {
  const modal = document.getElementById("installAppModal");
  if (modal) modal.style.display = "none";
};

window.handlePwaInstallBtnClick = async function() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === "accepted") {
      closeInstallModal();
    }
    deferredInstallPrompt = null;
  } else {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (isStandalone) {
      alert("🎀 TypoCute pehle se hi aapke laptop me installed application ke roop me chal raha hai! 🌸");
    } else {
      alert(
        "📲 1-Click Install Guide:\n\n" +
        "1. Apne Chrome ya Edge browser ke top-right me 3 dots (⋮) par click karein.\n" +
        "2. Wahan 'Install TypoCute' ya 'Apps > Install this site as an app' par click karein.\n" +
        "3. Bas! Laptop ke Desktop par TypoCute ka real application shortcut ban jayega! 🎀"
      );
    }
  }
};

window.exportProgressBackup = function() {
  const backupData = {
    appName: "TypoCute",
    version: "2.0",
    exportDate: new Date().toISOString(),
    exportDateFormatted: new Date().toLocaleString(),
    studentName: STATE.studentName || "Pooja Sharma",
    stats: {
      xp: STATE.xp,
      gems: STATE.gems,
      streak: STATE.streak,
      totalWordsTyped: STATE.totalWordsTyped,
      bestWpm: STATE.bestWpm,
      weakKeys: STATE.weakKeys
    },
    infiniteProgress: INFINITE_PROGRESS,
    lastMode: localStorage.getItem("typo_last_mode") || CURRENT_SIMPLIFIED_MODE,
    dynamicParas: JSON.parse(localStorage.getItem("typoCuteDynamicParagraphsBank") || "[]")
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  a.download = `TypoCute_Progress_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.importProgressBackup = function(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.appName !== "TypoCute" && !data.stats) {
        alert("Yeh file valid TypoCute backup nahi hai!");
        return;
      }
      if (data.stats) {
        const stats = {
          streak: data.stats.streak || 1,
          totalWordsTyped: data.stats.totalWordsTyped || 0,
          bestWpm: data.stats.bestWpm || 0,
          weakKeys: data.stats.weakKeys || {},
          xp: data.stats.xp || 0,
          gems: data.stats.gems || 15,
          hearts: 5,
          studentName: data.studentName || "Pooja Sharma"
        };
        localStorage.setItem("typo_stats", JSON.stringify(stats));
      }
      if (data.infiniteProgress) {
        localStorage.setItem("typoCuteInfinite10kProgress", JSON.stringify(data.infiniteProgress));
      }
      if (data.lastMode) {
        localStorage.setItem("typo_last_mode", data.lastMode);
      }
      alert("✅ Backup safalta-purvak restore ho gaya hai! App reload ho raha hai... 💖");
      window.location.reload();
    } catch(err) {
      alert("Backup file read karne me error: " + err.message);
    }
  };
  reader.readAsText(file);
};

function advanceSimplifiedLesson() {
  if (CURRENT_SIMPLIFIED_MODE === "small_words") {
    // Mark current batch words as completed
    if (STATE.currentItems) {
      STATE.currentItems.forEach(item => {
        const word = (typeof item === "string") ? item : item.word;
        if (word) markWordCompleted(word);
      });
    }
    // Load next 10 fresh mixed words automatically
    loadSimplifiedTopic("small_words", CURRENT_FILTER_INDEX);
    setMascot("Shaabash! Agle 10 fresh mixed words aa gaye! 🌸✨", "cheer");

  } else {
    // Mark current paragraph as completed
    if (STATE.currentLesson?.id) {
      markParagraphCompleted(STATE.currentLesson.id);
    }
    // Keep filter index at 0 (Random stream) so it rolls continuously without repeat!
    CURRENT_FILTER_INDEX = 0;
    renderTopicPills("paragraph_50");
    loadSimplifiedTopic("paragraph_50", 0);
    setMascot("Shaabash! Agla naya 50-word essay aa gaya! Aage badho! 📝🌸", "cheer");

    // Auto-generate more in the background so pool never empties
    triggerBackgroundParagraphGeneration();
  }
}

/* ── AI Generator for Small Words ── */
async function handleGenerateAiSmallWords() {
  const topics = ["Cute Pets", "Cooking & Sweets", "Space & Stars", "Music & Dance", "Garden & Flowers", "School & Games", "Fashion & Colors"];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  const userTopic = prompt("AI se kaun se topic par naye words banwane hain? (e.g. Pets, Space, Flowers, Sweets):", randomTopic);
  const topicToUse = (userTopic && userTopic.trim()) ? userTopic.trim() : randomTopic;

  setMascot("✨ AI naye mixed words dhoondh raha hai...", "cheer");
  try {
    let generatedWords = null;
    if (typeof AI_ENGINE !== "undefined" && typeof AI_ENGINE.generateLesson === "function") {
      const res = await AI_ENGINE.generateLesson(topicToUse);
      if (res && res.items && res.items.length > 0) {
        generatedWords = res.items.map(it => ({ word: (it.word || it.english || "").toLowerCase().trim(), hindi: it.hindi || "अर्थ" }));
      }
    }

    if (!generatedWords || generatedWords.length < 5) {
      // Local fallback generator for the topic
      generatedWords = [
        { word: "sparkle", hindi: "चमकना" },
        { word: "cuddle",  hindi: "लाड़ प्यार" },
        { word: "delight", hindi: "प्रसन्नता" },
        { word: "rainbow", hindi: "इंद्रधनुष" },
        { word: "feather", hindi: "पंख" },
        { word: "whisper", hindi: "फुसफुसाना" },
        { word: "gentle",  hindi: "कोमल" },
        { word: "twinkle", hindi: "टिमटिमाना" },
        { word: "breeze",  hindi: "मंद हवा" },
        { word: "sunshine",hindi: "धूप" }
      ];
    }

    const aiLessonObj = {
      id: "ai_words_" + Date.now(),
      title: "✨ AI: " + topicToUse,
      hindi: `Topic: ${topicToUse} — ताज़ा शब्द 🌸`
    };

    const pills = document.querySelectorAll("#practiceTopicSelectorRow .topic-pill-btn");
    pills.forEach(p => p.classList.remove("active"));
    const aiBtn = document.querySelector("#practiceTopicSelectorRow .ai-special-pill");
    aiBtn?.classList.add("active");

    const displayEl = document.getElementById("textDisplay");
    displayEl?.classList.remove("is-paragraph");
    loadLesson(aiLessonObj, generatedWords, false);
    setMascot("✨ AI naye words aa gaye! Typing shuru karo! 🌸", "cheer");
    focusTypingArea();

  } catch (err) {
    console.error("AI words error:", err);
    loadSimplifiedTopic("small_words", 0);
  }
}

/* ── AI Generator for 50-Word Essays ── */
async function handleGenerateAi50WordParagraph() {
  const defaultTopics = ["My School", "My Mother", "Green Trees", "Morning Walk", "Best Friend", "Rainy Season", "My Kitten", "My Dream", "Festivals", "My Garden"];
  const randomTopic = defaultTopics[Math.floor(Math.random() * defaultTopics.length)];
  const userTopic = prompt("AI 50-Word Essay topic (e.g. My School, Flowers, Rain, Hobby):", randomTopic);
  const topicToUse = (userTopic && userTopic.trim()) ? userTopic.trim() : randomTopic;

  setMascot("✨ AI naya 50-word paragraph likh raha hai...", "cheer");
  try {
    let result = null;
    if (typeof AI_ENGINE !== "undefined" && typeof AI_ENGINE.generateParagraph50Words === "function") {
      result = await AI_ENGINE.generateParagraph50Words(topicToUse);
    }
    if (!result || !result.english) {
      result = generateLocalParagraph(topicToUse);
    }

    const aiLessonObj = {
      id: "ai_para_" + Date.now(),
      title: "✨ AI: " + topicToUse,
      hindi: result.hindi
    };

    const pills = document.querySelectorAll("#practiceTopicSelectorRow .topic-pill-btn");
    pills.forEach(p => p.classList.remove("active"));
    const aiBtn = document.querySelector("#practiceTopicSelectorRow .ai-special-pill");
    aiBtn?.classList.add("active");

    const displayEl = document.getElementById("textDisplay");
    displayEl?.classList.add("is-paragraph");
    loadLesson(aiLessonObj, [{ english: result.english, hindi: result.hindi }], false);
    setMascot("✨ AI 50-Word Essay ready! Shuru karo typing! 🌸", "cheer");
    focusTypingArea();
  } catch (err) {
    console.error("AI paragraph error:", err);
    loadSimplifiedTopic("paragraph_50", 0);
  }
}

/* ── Local AI-like paragraph generator (offline fallback) ── */
function generateLocalParagraph(topic) {
  const templates = [
    `${topic} is one of the most beautiful and important things in our daily life. Every morning brings new hope and fresh energy to learn something wonderful. We should always be grateful for the blessings we receive from nature and our loving family. Working with dedication and kindness makes the whole world a better and happier place for everyone.`,
    `I truly love ${topic.toLowerCase()} because it fills my heart with pure joy and happiness. Learning about new things every day makes us smarter and more confident. Good friends and caring teachers help us grow into kind responsible human beings. Let us always spread love peace and beautiful smiles wherever we go in this amazing world.`,
    `The beauty of ${topic.toLowerCase()} teaches us to appreciate every small moment in life. When we work hard with patience and love we can achieve our biggest dreams easily. Every child deserves the chance to learn play and explore the wonderful world around them. Together we can build a future filled with knowledge wisdom kindness and endless bright sunshine.`,
    `${topic} reminds us that life is a precious gift we must cherish every single day. With courage and determination we can overcome any challenge that comes our way. Helping others and showing compassion makes our hearts grow stronger and our smiles wider. Nature surrounds us with beauty and we should always protect our green beautiful planet Earth with love.`
  ];
  const text = templates[Math.floor(Math.random() * templates.length)];
  return {
    english: text,
    hindi: `"${topic}" के बारे में एक सुंदर कहानी। यह हमें सिखाती है कि जीवन में प्यार, मेहनत और दयालुता सबसे ज़रूरी हैं। 🌸`
  };
}



/* ═══════════════════════════════════════════════════
   SHABD TEST & VOCAB QUIZ STUDIO CONTROLLER
   ═══════════════════════════════════════════════════ */

let QUIZ_STATE = {
  index: 1,
  score: 0,
  streak: 0,
  total: 10,
  current: null,
  activeTab: "quiz"
};

function openVocabStudioPage() {
  if (!QUIZ_STATE.current) {
    startNewQuizSession();
  }
  const page = document.getElementById("tab-vocab-page");
  if (page) page.scrollTop = 0;
}


function initVocabCategoriesUI() {
  const chipsRow = document.getElementById("vocabCatChipsRow");
  if (!chipsRow) return;

  const chips = chipsRow.querySelectorAll(".vocab-cat-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const catKey = chip.getAttribute("data-cat");
      renderSubwordsCarousel(catKey);
    });
  });

  // Default to 'multimeaning'
  renderSubwordsCarousel("multimeaning");
}

function renderSubwordsCarousel(catKey) {
  const container = document.getElementById("vocabSubwordsCarousel");
  if (!container) return;
  container.innerHTML = "";

  let words = [];
  if (catKey === "all") {
    // Show top curated words
    words = [
      { word: "cell", hindi: "कोशिका / बैटरी" },
      { word: "monday", hindi: "सोमवार" },
      { word: "january", hindi: "जनवरी" },
      { word: "one", hindi: "एक (1)" },
      { word: "pink", hindi: "गुलाबी" },
      { word: "mother", hindi: "माँ" },
      { word: "apple", hindi: "सेब" },
      { word: "kitten", hindi: "बिल्ली का बच्चा" },
      { word: "school", hindi: "विद्यालय" },
      { word: "time", hindi: "समय" }
    ];
  } else if (typeof window.ESSENTIAL_CATEGORIES !== "undefined" && window.ESSENTIAL_CATEGORIES[catKey]) {
    words = window.ESSENTIAL_CATEGORIES[catKey].words || [];
  }

  words.forEach((item, idx) => {
    const pill = document.createElement("button");
    pill.className = "vocab-subword-pill" + (idx === 0 ? " active" : "");
    pill.type = "button";
    pill.textContent = `${item.word} (${item.hindi.split("/")[0].split("(")[0].trim()})`;
    pill.addEventListener("click", () => {
      container.querySelectorAll(".vocab-subword-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      lookupWordInDict(item.word);
    });
    container.appendChild(pill);
  });

  if (words.length > 0) {
    lookupWordInDict(words[0].word);
  }
}

function initVocabQuiz() {
  initVocabCategoriesUI();
  const btnTabQuiz = document.getElementById("btnPageTabQuiz");
  const btnTabDict = document.getElementById("btnPageTabDict");
  const viewQuiz = document.getElementById("pageViewQuiz");
  const viewDict = document.getElementById("pageViewDict");

  // Tab switching between Quiz and Dictionary
  if (btnTabQuiz && btnTabDict && viewQuiz && viewDict) {
    btnTabQuiz.addEventListener("click", () => {
      btnTabQuiz.classList.add("active");
      btnTabDict.classList.remove("active");
      viewQuiz.style.display = "block";
      viewDict.style.display = "none";
      QUIZ_STATE.activeTab = "quiz";
    });

    btnTabDict.addEventListener("click", () => {
      btnTabDict.classList.add("active");
      btnTabQuiz.classList.remove("active");
      viewQuiz.style.display = "none";
      viewDict.style.display = "block";
      QUIZ_STATE.activeTab = "dict";
      const targetWord = QUIZ_STATE.current ? QUIZ_STATE.current.word : "time";
      lookupWordInDict(targetWord);
    });
  }

  // 4 Quiz option buttons
  const optButtons = document.querySelectorAll("#pageOptionsGrid .quiz-opt-btn");
  optButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const optIndex = parseInt(btn.getAttribute("data-opt"), 10);
      handleQuizOptionClick(optIndex);
    });
  });

  // Next Question button
  const nextBtn = document.getElementById("pageNextBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (QUIZ_STATE.index >= QUIZ_STATE.total) {
        startNewQuizSession();
      } else {
        QUIZ_STATE.index++;
        loadQuizQuestion();
      }
    });
  }

  // Quiz audio button
  const audioBtn = document.getElementById("pageAudioBtn");
  if (audioBtn) {
    audioBtn.addEventListener("click", () => {
      if (QUIZ_STATE.current && QUIZ_STATE.current.word) {
        speakWord(QUIZ_STATE.current.word);
      }
    });
  }

  // Quiz: Type this word in arena
  const typeWordBtn = document.getElementById("pageTypeThisWordBtn");
  if (typeWordBtn) {
    typeWordBtn.addEventListener("click", () => {
      if (QUIZ_STATE.current) {
        loadWordIntoTypingArena(QUIZ_STATE.current.word, QUIZ_STATE.current.hindi);
      }
    });
  }

  // Dictionary Search
  const dictSearchInput = document.getElementById("pageDictSearchInput");
  const dictSearchBtn = document.getElementById("pageDictSearchBtn");
  if (dictSearchBtn && dictSearchInput) {
    dictSearchBtn.addEventListener("click", () => {
      const q = dictSearchInput.value.trim();
      if (q) lookupWordInDict(q);
    });
    dictSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = dictSearchInput.value.trim();
        if (q) lookupWordInDict(q);
      }
    });
  }

  // Dict Audio
  const dictSpeakBtn = document.getElementById("pageDictSpeakBtn");
  if (dictSpeakBtn) {
    dictSpeakBtn.addEventListener("click", () => {
      const w = document.getElementById("pageDictResWord")?.textContent;
      if (w) speakWord(w);
    });
  }

  // Dict Type Button (Duolingo 3D Button)
  const dictTypeBtn = document.getElementById("pageDictTypeWordBtn");
  if (dictTypeBtn) {
    dictTypeBtn.addEventListener("click", () => {
      const w = document.getElementById("pageDictResWord")?.textContent;
      const h = document.getElementById("pageDictResHindi")?.textContent;
      if (w) loadWordIntoTypingArena(w, h);
    });
  }
}

function startNewQuizSession() {
  QUIZ_STATE.index = 1;
  QUIZ_STATE.score = 0;
  QUIZ_STATE.streak = 0;
  loadQuizQuestion();
}

function loadQuizQuestion() {
  const db = (typeof WORDS_10K_DATABASE !== "undefined" && Array.isArray(WORDS_10K_DATABASE) && WORDS_10K_DATABASE.length > 0)
    ? WORDS_10K_DATABASE
    : [
        { word: "courage", hindi: "हिम्मत / साहस" },
        { word: "honest", hindi: "ईमानदार" },
        { word: "gentle", hindi: "कोमल / दयालु" },
        { word: "peaceful", hindi: "शांतिपूर्ण" }
      ];

  // Pick random target
  const correctItem = db[Math.floor(Math.random() * db.length)];

  // Pick 3 distractors
  const distractors = [];
  let attempts = 0;
  while (distractors.length < 3 && attempts < 100) {
    attempts++;
    const cand = db[Math.floor(Math.random() * db.length)];
    if (cand.hindi !== correctItem.hindi && !distractors.some(d => d.hindi === cand.hindi)) {
      distractors.push(cand);
    }
  }

  // 4 Options
  const options = [
    { text: correctItem.hindi, isCorrect: true },
    ...distractors.map(d => ({ text: d.hindi, isCorrect: false }))
  ];

  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  QUIZ_STATE.current = {
    word: correctItem.word,
    hindi: correctItem.hindi,
    options: options,
    answered: false
  };

  // Update UI Elements
  const qWord = document.getElementById("pageTargetWord");
  const qPhonetic = document.getElementById("pagePhonetic");
  const qCounter = document.getElementById("pageQCounter");
  const qScore = document.getElementById("pageScoreText");
  const feedbackBox = document.getElementById("pageFeedbackBox");
  const nextBtn = document.getElementById("pageNextBtn");

  if (qWord) qWord.textContent = correctItem.word;
  if (qPhonetic) qPhonetic.textContent = `[ ${correctItem.word} ]`;
  if (qCounter) qCounter.textContent = `${QUIZ_STATE.index} / ${QUIZ_STATE.total}`;
  if (qScore) qScore.textContent = `${QUIZ_STATE.score}`;

  if (feedbackBox) feedbackBox.style.display = "none";
  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.innerHTML = `<span>Agla Sawal (Next) ➔</span>`;
  }
  const kCloud = document.getElementById("pageKittyCloud");
  const mCloud = document.getElementById("pageMimiCloud");
  if (kCloud) kCloud.textContent = "Arth seekho & jeeto! 💖";
  if (mCloud) mCloud.textContent = "Sahi jawab par +20 XP! 🌸";

  // Update 4 options buttons
  options.forEach((opt, idx) => {
    const btn = document.querySelector(`#pageOptionsGrid .quiz-opt-btn[data-opt="${idx}"]`);
    if (btn) {
      btn.className = "quiz-opt-btn";
      btn.disabled = false;
      const textSpan = btn.querySelector(".opt-text");
      if (textSpan) textSpan.textContent = opt.text;
    }
  });
}

function handleQuizOptionClick(selectedIndex) {
  if (!QUIZ_STATE.current || QUIZ_STATE.current.answered) return;
  QUIZ_STATE.current.answered = true;

  const optButtons = document.querySelectorAll("#pageOptionsGrid .quiz-opt-btn");
  optButtons.forEach(btn => btn.disabled = true);

  const selectedOpt = QUIZ_STATE.current.options[selectedIndex];
  const selectedBtn = document.querySelector(`#pageOptionsGrid .quiz-opt-btn[data-opt="${selectedIndex}"]`);
  const feedbackBox = document.getElementById("pageFeedbackBox");
  const feedbackIcon = document.getElementById("pageFeedbackIcon");
  const feedbackText = document.getElementById("pageFeedbackText");
  const nextBtn = document.getElementById("pageNextBtn");
  const scoreText = document.getElementById("pageScoreText");

  if (selectedOpt && selectedOpt.isCorrect) {
    if (selectedBtn) selectedBtn.classList.add("correct");
    QUIZ_STATE.score++;
    QUIZ_STATE.streak++;
    if (typeof addXp === "function") addXp(20);
    if (typeof addGems === "function") addGems(5);
    if (typeof playVictoryChime === "function") playVictoryChime();
    if (typeof launchConfetti === "function") launchConfetti();

    if (feedbackBox) {
      feedbackBox.className = "quiz-feedback-box correct";
      feedbackBox.style.display = "flex";
      if (feedbackIcon) feedbackIcon.textContent = "🎉";
      if (feedbackText) feedbackText.textContent = `Shaabash! Ekdum Sahi Jawab! (+20 XP, +5 Gems 💎)`;
    }
    const kCloud = document.getElementById("pageKittyCloud");
    const mCloud = document.getElementById("pageMimiCloud");
    if (kCloud) kCloud.textContent = "Shaabash! +20 XP! 💖";
    if (mCloud) mCloud.textContent = "100% Sahi Jawab! 🌸";
  } else {
    if (selectedBtn) selectedBtn.classList.add("wrong");
    QUIZ_STATE.current.options.forEach((opt, idx) => {
      if (opt.isCorrect) {
        const correctBtn = document.querySelector(`#pageOptionsGrid .quiz-opt-btn[data-opt="${idx}"]`);
        if (correctBtn) correctBtn.classList.add("correct");
      }
    });
    QUIZ_STATE.streak = 0;
    if (typeof playErrorBoop === "function") playErrorBoop();

    if (feedbackBox) {
      feedbackBox.className = "quiz-feedback-box wrong";
      feedbackBox.style.display = "flex";
      if (feedbackIcon) feedbackIcon.textContent = "🌸";
      if (feedbackText) feedbackText.textContent = `Sahi arth tha: "${QUIZ_STATE.current.hindi}". Agli baar pakka sahi hoga!`;
    }
    const kCloud = document.getElementById("pageKittyCloud");
    const mCloud = document.getElementById("pageMimiCloud");
    if (kCloud) kCloud.textContent = "Koi baat nahi! 💖";
    if (mCloud) mCloud.textContent = "Agli baar sahi! 🌸";
  }

  if (scoreText) scoreText.textContent = `${QUIZ_STATE.score}`;

  if (nextBtn) {
    nextBtn.disabled = false;
    if (QUIZ_STATE.index >= QUIZ_STATE.total) {
      nextBtn.innerHTML = `<span>🏆 Quiz Pura Hua! Naya Round Shuru Karein 🔄</span>`;
    } else {
      nextBtn.innerHTML = `<span>Agla Sawal (Next) ➔</span>`;
    }
  }
}

function lookupWordInDict(wordQuery) {
  const q = (wordQuery || "").trim().toLowerCase();
  if (!q) return;

  const db = (typeof WORDS_10K_DATABASE !== "undefined" && Array.isArray(WORDS_10K_DATABASE))
    ? WORDS_10K_DATABASE
    : [];

  let matched = db.find(item => item.word.toLowerCase() === q);
  if (!matched) {
    matched = db.find(item => item.word.toLowerCase().startsWith(q));
  }

  const resWord = document.getElementById("pageDictResWord");
  const resPronounce = document.getElementById("pageDictResPronounce");
  const resHindi = document.getElementById("pageDictResHindi");
  const resExample = document.getElementById("pageDictResExample");
  const resExampleHi = document.getElementById("pageDictResExampleHi");
  const catTag = document.getElementById("pageDictCategoryTag");
  const multiBox = document.getElementById("pageDictMultiSensesBox");

  const displayWord = matched ? matched.word : q;
  const displayHindi = matched ? matched.hindi : "अर्थ खोजा गया";
  const lowerWord = displayWord.toLowerCase();

  if (resWord) resWord.textContent = displayWord;
  if (resPronounce) resPronounce.textContent = `[ ${displayWord} ]`;
  if (resHindi) resHindi.textContent = displayHindi;

  // 1. Check if word is in MULTI_MEANING_WORDS (Double meaning words like cell, bat, watch, etc.)
  const mmData = (typeof window.MULTI_MEANING_WORDS !== "undefined") && window.MULTI_MEANING_WORDS[lowerWord];
  if (mmData && multiBox) {
    multiBox.style.display = "flex";
    let sensesHtml = `
      <div class="multi-sense-header">
        <span class="multi-sense-badge">✨ 2+ Alag-Alag Hindi Arth (Double Meaning Word)</span>
      </div>
      <div class="multi-sense-grid">`;

    mmData.senses.forEach(s => {
      sensesHtml += `
        <div class="multi-sense-item">
          <div class="sense-badge-row">${s.badge}</div>
          <div class="sense-hindi-text">${s.hindi}</div>
          <div class="sense-ex-text">"${s.example}"</div>
          <div class="sense-ex-text" style="color:#be185d;">"${s.exampleHi}"</div>
        </div>`;
    });
    sensesHtml += `</div>`;
    multiBox.innerHTML = sensesHtml;

    if (catTag) catTag.textContent = "✨ 2+ Meanings";
    if (resExample) resExample.textContent = `"${mmData.senses[0].example}"`;
    if (resExampleHi) resExampleHi.textContent = `"${mmData.senses[0].exampleHi}"`;
    return;
  } else if (multiBox) {
    multiBox.style.display = "none";
  }

  // 2. Regular curated examples
  const EXAMPLES = {
    time: {
      en: "Time is very precious, so spend every moment wisely.",
      hi: "समय बहुत अनमोल है, इसलिए हर पल का समझदारी से उपयोग करें।"
    },
    courage: {
      en: "Courage is doing what is right even when you feel scared.",
      hi: "साहस का अर्थ है डर लगने पर भी सही काम करना।"
    },
    honest: {
      en: "An honest person is loved and respected by all friends.",
      hi: "ईमानदार इंसान को सभी दोस्त प्यार और सम्मान देते हैं।"
    },
    gentle: {
      en: "Her gentle voice brought comfort to everyone in the room.",
      hi: "उसकी कोमल और दयालु आवाज़ ने कमरे के सभी लोगों को सुकून दिया।"
    },
    curtain: {
      en: "Open the pink curtain to let the morning sunlight into your room.",
      hi: "सुबह की प्यारी धूप कमरे में आने के लिए गुलाबी पर्दा खोलें।"
    },
    blossom: {
      en: "Fresh cherry flowers blossom beautifully in the pleasant spring season.",
      hi: "वसंत के सुहावने मौसम में ताज़ा चेरी के फूल बहुत सुंदर खिलते हैं।"
    },
    delightful: {
      en: "Learning new words with Hello Kitty is a truly delightful experience.",
      hi: "हैलो किट्टी के साथ नए शब्द सीखना सचमुच बहुत आनंददायक अनुभव है।"
    },
    peaceful: {
      en: "A quiet morning walk in the green garden makes the mind peaceful.",
      hi: "हरे-भरे बगीचे में सुबह की शांत सैर मन को शांति और सुकून देती है।"
    },
    wisdom: {
      en: "Reading good books daily gives you deep wisdom and bright knowledge.",
      hi: "रोज अच्छी किताबें पढ़ने से आपको गहरी समझ और ज्ञान प्राप्त होता है।"
    },
    monday: {
      en: "Monday is the start of a wonderful and productive school week.",
      hi: "सोमवार एक शानदार और पढ़ाई भरे नए सप्ताह की शुरुआत है।"
    },
    sunday: {
      en: "Sunday is a joyful holiday for relaxing and playing with family.",
      hi: "रविवार परिवार के साथ आराम करने और खेलने का मज़ेदार दिन है।"
    },
    january: {
      en: "January is the first month of the new year with pleasant cool mornings.",
      hi: "जनवरी नए साल का पहला महीना है जिसमें सुबह की प्यारी ठंडक होती है।"
    },
    mother: {
      en: "Mother is the sweetest and kindest person who always loves and cares for us.",
      hi: "माँ सबसे प्यारी और दयालु इंसान हैं जो हमेशा हमें प्यार और देखभाल देती हैं।"
    },
    school: {
      en: "Our school has a beautiful library and a green playground.",
      hi: "हमारे स्कूल में एक सुंदर पुस्तकालय और हरा-भरा खेल का मैदान है।"
    },
    apple: {
      en: "An apple a day keeps the doctor away.",
      hi: "रोज़ाना एक सेब खाना सेहत को तंदुरुस्त और निरोगी रखता है।"
    }
  };

  if (EXAMPLES[lowerWord]) {
    if (resExample) resExample.textContent = `"${EXAMPLES[lowerWord].en}"`;
    if (resExampleHi) resExampleHi.textContent = `"${EXAMPLES[lowerWord].hi}"`;
  } else {
    if (resExample) resExample.textContent = `"Practicing '${displayWord}' helps build fluent English communication and typing speed."`;
    if (resExampleHi) resExampleHi.textContent = `"'${displayWord}' (${displayHindi}) का अभ्यास आपकी इंग्लिश और टाइपिंग दोनों को बेहतर बनाता है।"`;
  }

  if (catTag) {
    catTag.textContent = matched ? "✅ Verified Meaning" : "✨ Searched Word";
  }
}

function loadWordIntoTypingArena(word, hindi) {
  const cleanWord = (word || "").trim();
  const cleanHindi = (hindi || "").trim();

  // Switch to small words mode in Arena (which hides tab-vocab-page and shows tab-arena)
  if (typeof switchSimplifiedMode === "function") {
    switchSimplifiedMode("small_words");
  }

  STATE.currentItems = [{ word: cleanWord, hindi: cleanHindi }, ...(STATE.currentItems || [])];
  STATE.itemIndex = 0;
  STATE.targetText = cleanWord;
  STATE.targetHindi = cleanHindi;
  STATE.typedText = "";
  STATE.inputLocked = false;
  STATE.startTime = null;
  STATE.endTime = null;

  if (typeof renderTypingText === "function") {
    renderTypingText(0);
  }

  const hindiEl = document.getElementById("hindiMeaningText");
  if (hindiEl) hindiEl.textContent = STATE.targetHindi;

  const pronounceEl = document.getElementById("promptPronounce");
  if (pronounceEl) {
    const translit = (typeof DEVANAGARI_PRONUNCIATION !== "undefined" && DEVANAGARI_PRONUNCIATION[cleanWord.toLowerCase()]) || "";
    pronounceEl.textContent = translit ? `[ ${cleanWord} • ${translit} ]` : `[ ${cleanWord} ]`;
  }

  if (typeof updateActiveKeyboardKey === "function") {
    updateActiveKeyboardKey();
  }

  if (typeof updateLiveHandsHighlight === "function") {
    updateLiveHandsHighlight();
  }

  const input = document.getElementById("typingInput");
  if (input) {
    input.value = "";
    input.focus();
  }

  if (typeof updateStatsUI === "function") {
    updateStatsUI();
  }
}
