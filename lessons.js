/**
 * lessons.js - Offline Content Database
 * Specially designed for Hindi-Medium Students learning English Typing
 */

const LESSONS_DATABASE = {
  // Level 0: Basic Finger Muscle Memory (Home Row, Top Row, Bottom Row)
  level0: [
    {
      id: "l0_1",
      title: "Home Row Basics (Left Hand: ASDF)",
      hindi: "बायां हाथ: अपनी 4 उंगलियों को A S D F पर रखें।",
      hint: "Use Left Pinky (A), Ring (S), Middle (D), Index (F)",
      text: "asdf asdf asdf fdsa fdsa aass ddff asdf",
      type: "keys"
    },
    {
      id: "l0_2",
      title: "Home Row Basics (Right Hand: JKL;)",
      hindi: "दायां हाथ: अपनी 4 उंगलियों को J K L ; पर रखें।",
      hint: "Use Right Index (J), Middle (K), Ring (L), Pinky (;)",
      text: "jkl; jkl; jkl; ;lkj ;lkj jjkk ll;; jkl;",
      type: "keys"
    },
    {
      id: "l0_3",
      title: "Home Row Combined (Both Hands)",
      hindi: "दोनों हाथ: Home Row की पूरी प्रैक्टिस।",
      hint: "Thumbs on Spacebar, Fingers on ASDF and JKL;",
      text: "asdf jkl; asdf jkl; a; s l d k f j flash salad fall flask",
      type: "keys"
    },
    {
      id: "l0_4",
      title: "Top Row Exploration (QWERTY UIOP)",
      hindi: "ऊपर वाली पंक्ति: उंगलियों को ऊपर ले जाकर वापस Home Row पर लाएं।",
      hint: "Reach up from ASDF to QWER and JKL; to UIOP",
      text: "qwer uiop rewq poiu quiet write power your trip peer",
      type: "keys"
    },
    {
      id: "l0_5",
      title: "Bottom Row Exploration (ZXCVBNM)",
      hindi: "नीचे वाली पंक्ति: उंगलियों को नीचे लाकर दबाएं।",
      hint: "Reach down to ZXCV and BNM",
      text: "zxcv bnm mnbv cxz van cabin zoom calm back move",
      type: "keys"
    },
    {
      id: "l0_6",
      title: "All Rows Master Drill",
      hindi: "तीनों पंक्तियों का मिक्स अभ्यास।",
      hint: "Always return your fingers to the Home Row!",
      text: "the quick brown fox jumps over the lazy dog",
      type: "keys"
    }
  ],

  // Level 1: 500 Daily Essential Vocabulary (Categorized with Hindi meanings)
  level1: [
    {
      id: "l1_cat_family",
      title: "Family & Relations (परिवार और रिश्ते)",
      category: "Family",
      items: [
        { word: "Mother", hindi: "माँ / माता जी" },
        { word: "Father", hindi: "पिता जी" },
        { word: "Brother", hindi: "भाई" },
        { word: "Sister", hindi: "बहन" },
        { word: "Family", hindi: "परिवार" },
        { word: "Friend", hindi: "दोस्त / मित्र" },
        { word: "Parent", hindi: "माता-पिता" },
        { word: "Child", hindi: "बच्चा" },
        { word: "Daughter", hindi: "बेटी" },
        { word: "Son", hindi: "बेटा" }
      ]
    },
    {
      id: "l1_cat_actions",
      title: "Daily Actions & Verbs (रोज़ के काम और क्रियाएँ)",
      category: "Actions",
      items: [
        { word: "Eat", hindi: "खाना" },
        { word: "Drink", hindi: "पीना" },
        { word: "Sleep", hindi: "सोना" },
        { word: "Walk", hindi: "चलना / टहलना" },
        { word: "Run", hindi: "दौड़ना" },
        { word: "Speak", hindi: "बोलना" },
        { word: "Listen", hindi: "सुनना" },
        { word: "Read", hindi: "पढ़ना" },
        { word: "Write", hindi: "लिखना" },
        { word: "Learn", hindi: "सीखना" },
        { word: "Help", hindi: "मदद करना" },
        { word: "Work", hindi: "काम करना" },
        { word: "Smile", hindi: "मुस्कुराना" },
        { word: "Think", hindi: "सोचना" },
        { word: "Understand", hindi: "समझना" }
      ]
    },
    {
      id: "l1_cat_home",
      title: "Home & Household (घर और घरेलू वस्तुएँ)",
      category: "Home",
      items: [
        { word: "House", hindi: "घर / मकान" },
        { word: "Room", hindi: "कमरा" },
        { word: "Door", hindi: "दरवाज़ा" },
        { word: "Window", hindi: "खिड़की" },
        { word: "Water", hindi: "पानी" },
        { word: "Food", hindi: "भोजन / खाना" },
        { word: "Book", hindi: "किताब" },
        { word: "Table", hindi: "मेज़" },
        { word: "Chair", hindi: "कुर्सी" },
        { word: "Bed", hindi: "बिस्तर / पलंग" },
        { word: "Kitchen", hindi: "रसोई घर" },
        { word: "Mirror", hindi: "आईना / शीशा" }
      ]
    },
    {
      id: "l1_cat_school",
      title: "School & Education (स्कूल और शिक्षा)",
      category: "School",
      items: [
        { word: "Teacher", hindi: "अध्यापक / शिक्षक" },
        { word: "Student", hindi: "छात्र / विद्यार्थी" },
        { word: "Pen", hindi: "कलम" },
        { word: "Pencil", hindi: "पेंसिल" },
        { word: "Paper", hindi: "कागज़" },
        { word: "Question", hindi: "सवाल / प्रश्न" },
        { word: "Answer", hindi: "जवाब / उत्तर" },
        { word: "Knowledge", hindi: "ज्ञान / जानकारी" },
        { word: "Exam", hindi: "परीक्षा" },
        { word: "Practice", hindi: "अभ्यास" }
      ]
    },
    {
      id: "l1_cat_emotions",
      title: "Feelings & Emotions (भावनाएं और मिजाज)",
      category: "Feelings",
      items: [
        { word: "Happy", hindi: "खुश / प्रसन्न" },
        { word: "Sad", hindi: "उदास / दुखी" },
        { word: "Angry", hindi: "नाराज़ / गुस्सा" },
        { word: "Tired", hindi: "थका हुआ" },
        { word: "Strong", hindi: "मजबूत / बलवान" },
        { word: "Kind", hindi: "दयालु / नेक" },
        { word: "Brave", hindi: "बहादुर" },
        { word: "Honest", hindi: "ईमानदार" },
        { word: "Calm", hindi: "शांत" },
        { word: "Proud", hindi: "गर्व महसूस करना" }
      ]
    },
    {
      id: "l1_cat_nature",
      title: "Nature & Surroundings (प्रकृति और वातावरण)",
      category: "Nature",
      items: [
        { word: "Sun", hindi: "सूरज" },
        { word: "Moon", hindi: "चाँद" },
        { word: "Sky", hindi: "आसमान / आकाश" },
        { word: "Tree", hindi: "पेड़ / वृक्ष" },
        { word: "Flower", hindi: "फूल" },
        { word: "River", hindi: "नदी" },
        { word: "Rain", hindi: "बारिश / वर्षा" },
        { word: "Wind", hindi: "हवा" },
        { word: "Mountain", hindi: "पहाड़ / पर्वत" },
        { word: "Morning", hindi: "सुबह / प्रात:" }
      ]
    }
  ],

  // Level 2: Everyday Common Phrases (2 to 4 words)
  level2: [
    {
      id: "l2_1",
      title: "Daily Greetings (रोज़ के अभिवादन)",
      items: [
        { english: "Good morning", hindi: "शुभ प्रभात / नमस्ते" },
        { english: "How are you?", hindi: "आप कैसे हैं?" },
        { english: "I am fine.", hindi: "मैं ठीक हूँ।" },
        { english: "Thank you so much.", hindi: "आपका बहुत-बहुत धन्यवाद।" },
        { english: "You are welcome.", hindi: "आपका स्वागत है।" },
        { english: "Have a nice day!", hindi: "आपका दिन शुभ हो!" }
      ]
    },
    {
      id: "l2_2",
      title: "Simple Daily Requests (सरल निवेदन)",
      items: [
        { english: "Please come here.", hindi: "कृपया यहाँ आइए।" },
        { english: "Please sit down.", hindi: "कृपया बैठ जाइए।" },
        { english: "Help me please.", hindi: "कृपया मेरी मदद कीजिए।" },
        { english: "Wait a minute.", hindi: "एक मिनट इंतज़ार करें।" },
        { english: "Listen to me.", hindi: "मेरी बात सुनो।" },
        { english: "Tell me more.", hindi: "मुझे और बताओ।" }
      ]
    },
    {
      id: "l2_3",
      title: "Confidence & Encouragement (हिम्मत और आत्मविश्वास)",
      items: [
        { english: "I can do it.", hindi: "मैं यह कर सकती हूँ।" },
        { english: "Do not worry.", hindi: "चिंता मत करो।" },
        { english: "Never give up.", hindi: "कभी हार मत मानो।" },
        { english: "Keep it up!", hindi: "इसे जारी रखो!" },
        { english: "I am ready.", hindi: "मैं तैयार हूँ।" },
        { english: "Practice makes perfect.", hindi: "अभ्यास से सब आसान हो जाता है।" }
      ]
    },
    {
      id: "l2_4",
      title: "Asking Common Questions (सामान्य सवाल पूछना)",
      items: [
        { english: "What is your name?", hindi: "आपका नाम क्या है?" },
        { english: "Where are you going?", hindi: "आप कहाँ जा रहे हैं?" },
        { english: "What time is it?", hindi: "कितने बजे हैं?" },
        { english: "Can you help me?", hindi: "क्या आप मेरी मदद कर सकते हैं?" },
        { english: "Do you understand?", hindi: "क्या आप समझ रहे हैं?" }
      ]
    }
  ],

  // Level 3: Real Life Grammar & Daily Sentences (Present, Past, Future)
  level3: [
    {
      id: "l3_present",
      title: "Present Tense: Daily Routine (आज और रोज़ की आदतें)",
      items: [
        { english: "I wake up early in the morning.", hindi: "मैं सुबह जल्दी उठती हूँ।" },
        { english: "She drinks clean water every day.", hindi: "वह रोज़ साफ़ पानी पीती है।" },
        { english: "He reads a book for one hour.", hindi: "वह एक घंटे किताब पढ़ता है।" },
        { english: "My mother cooks delicious food.", hindi: "मेरी माँ स्वादिष्ट खाना बनाती हैं।" },
        { english: "We go to school together.", hindi: "हम साथ में स्कूल जाते हैं।" },
        { english: "I am learning English typing with confidence.", hindi: "मैं पूरे आत्मविश्वास के साथ इंग्लिश टाइपिंग सीख रही हूँ।" }
      ]
    },
    {
      id: "l3_past",
      title: "Past Tense: Completed Events (बीती हुई बातें)",
      items: [
        { english: "I completed my homework yesterday.", hindi: "मैंने कल अपना होमवर्क पूरा किया था।" },
        { english: "She bought a new notebook.", hindi: "उसने एक नई कॉपी खरीदी।" },
        { english: "My brother helped me solve this problem.", hindi: "मेरे भाई ने इस सवाल को हल करने में मेरी मदद की।" },
        { english: "We visited our grandmother last Sunday.", hindi: "हम पिछले रविवार को अपनी नानी से मिलने गए थे।" },
        { english: "It was a wonderful day for all of us.", hindi: "वह हम सभी के लिए एक शानदार दिन था।" }
      ]
    },
    {
      id: "l3_future",
      title: "Future Tense: Goals & Plans (आने वाला कल और सपने)",
      items: [
        { english: "I will improve my English every single day.", hindi: "मैं हर रोज़ अपनी इंग्लिश बेहतर बनाऊँगी।" },
        { english: "She will speak English fluently very soon.", hindi: "वह बहुत जल्द धाराप्रवाह इंग्लिश बोलेगी।" },
        { english: "We will achieve our dreams with hard work.", hindi: "हम कड़ी मेहनत से अपने सपनों को हासिल करेंगे।" },
        { english: "He will join a new computer course tomorrow.", hindi: "वह कल एक नया कंप्यूटर कोर्स शुरू करेगा।" },
        { english: "Practice will make me fast and accurate.", hindi: "अभ्यास मुझे तेज़ और सटीक बनाएगा।" }
      ]
    },
    {
      id: "l3_office",
      title: "Workplace & Formal Talk (दफ्तर और शिष्टाचार)",
      items: [
        { english: "Could you please send me the document?", hindi: "क्या आप कृपया मुझे वह दस्तावेज़ भेज सकते हैं?" },
        { english: "I am pleased to meet you today.", hindi: "आज आपसे मिलकर मुझे बहुत खुशी हुई।" },
        { english: "Thank you for giving me this opportunity.", hindi: "मुझे यह अवसर देने के लिए आपका धन्यवाद।" },
        { english: "I will finish this task before five o'clock.", hindi: "मैं यह काम पाँच बजे से पहले पूरा कर दूँगी।" }
      ]
    }
  ],

  // Level 4: Stories & Real Life Conversations
  level4: [
    {
      id: "l4_story_woodcutter",
      title: "Story: The Honest Woodcutter (ईमानदार लकड़हारा)",
      lines: [
        { english: "Once upon a time, an honest woodcutter lived in a peaceful village.", hindi: "एक बार की बात है, एक शांत गाँव में एक ईमानदार लकड़हारा रहता था।" },
        { english: "Every day, he went to the deep forest to cut wood near a river.", hindi: "हर रोज़ वह एक नदी के किनारे घने जंगल में लकड़ी काटने जाता था।" },
        { english: "One afternoon, his iron axe slipped from his hand and fell into deep water.", hindi: "एक दोपहर, उसकी लोहे की कुल्हाड़ी हाथ से फिसल कर गहरे पानी में गिर गई।" },
        { english: "He was very sad and prayed to God for help.", hindi: "वह बहुत दुखी हुआ और उसने भगवान से मदद की प्रार्थना की।" },
        { english: "A river fairy appeared with a golden axe and asked if it was his.", hindi: "एक जलपरी सोने की कुल्हाड़ी लेकर प्रकट हुई और पूछा कि क्या यह उसकी है।" },
        { english: "The honest man said no, my axe is made of simple iron.", hindi: "ईमानदार आदमी ने कहा नहीं, मेरी कुल्हाड़ी तो साधारण लोहे की बनी है।" },
        { english: "Pleased with his honesty, the fairy gifted him both the axes.", hindi: "उसकी ईमानदारी से खुश होकर जलपरी ने उसे दोनों कुल्हाड़ियाँ उपहार में दे दीं।" },
        { english: "Moral: Honesty is always rewarded.", hindi: "सीख: ईमानदारी का फल हमेशा मीठा होता है।" }
      ]
    },
    {
      id: "l4_story_crow",
      title: "Story: The Thirsty Crow (प्यासा कौआ)",
      lines: [
        { english: "On a hot summer afternoon, a thirsty crow was flying in search of water.", hindi: "गर्मी की एक दोपहर में, एक प्यासा कौआ पानी की तलाश में उड़ रहा था।" },
        { english: "He flew for a long time but could not find a single drop anywhere.", hindi: "वह बहुत देर तक उड़ा लेकिन उसे कहीं भी पानी की एक बूँद नहीं मिली।" },
        { english: "Finally, he saw a water pitcher sitting in a small garden.", hindi: "आखिरकार, उसे एक छोटे से बगीचे में पानी का एक घड़ा दिखाई दिया।" },
        { english: "The water level was very low, and his beak could not reach it.", hindi: "पानी का स्तर बहुत कम था, और उसकी चोंच उस तक नहीं पहुँच सकी।" },
        { english: "The clever crow gathered small pebbles and dropped them into the pitcher one by one.", hindi: "चतुर कौवे ने छोटे-छोटे कंकड़ इकट्ठे किए और उन्हें एक-एक करके घड़े में डाला।" },
        { english: "The water slowly rose to the top, and he drank happily.", hindi: "पानी धीरे-धीरे ऊपर आ गया, और उसने खुशी-खुशी पानी पिया।" },
        { english: "Moral: Where there is a will, there is a way.", hindi: "सीख: जहाँ चाह, वहाँ राह।" }
      ]
    },
    {
      id: "l4_interview",
      title: "Conversation: First Job Interview (इंटरव्यू में बातचीत)",
      lines: [
        { english: "Interviewer: Good morning! Please take your seat.", hindi: "इंटरव्यूअर: सुप्रभात! कृपया अपना स्थान ग्रहण करें।" },
        { english: "Candidate: Good morning, sir! Thank you very much.", hindi: "उम्मीदवार: सुप्रभात सर! आपका बहुत-बहुत धन्यवाद।" },
        { english: "Interviewer: Could you please introduce yourself briefly?", hindi: "इंटरव्यूअर: क्या आप कृपया संक्षेप में अपना परिचय दे सकते हैं?" },
        { english: "Candidate: My name is Priya, and I have completed my computer diploma.", hindi: "उम्मीदवार: मेरा नाम प्रिया है, और मैंने अपना कंप्यूटर डिप्लोमा पूरा किया है।" },
        { english: "Candidate: I am hardworking, punctual, and eager to learn new skills.", hindi: "उम्मीदवार: मैं मेहनती हूँ, समय की पाबंद हूँ और नई चीजें सीखने के लिए उत्सुक हूँ।" },
        { english: "Interviewer: That sounds great! Welcome to our team.", hindi: "इंटरव्यूअर: यह बहुत अच्छी बात है! हमारी टीम में आपका स्वागत है।" }
      ]
    }
  ],

  // Level 5: 50-Word Continuous Paragraphs & School Essays
  level5: [
    {
      id: "l5_essay_school",
      title: "Essay: My School (मेरा विद्यालय)",
      hindi: "विद्यालय पर 50 शब्दों का सुंदर निबंध",
      category: "50-Word Essay",
      items: [
        "My school is a wonderful place of learning and joy. Every morning, I wear my neat uniform and attend the assembly. The teachers are very kind, polite, and teach us with great care. There is a green playground and a big library. I truly love my school."
      ]
    },
    {
      id: "l5_essay_mother",
      title: "Essay: My Loving Mother (मेरी प्यारी माँ)",
      hindi: "माँ पर 50 शब्दों का दिल छू लेने वाला निबंध",
      category: "50-Word Essay",
      items: [
        "My mother is the most special and caring person in my life. She wakes up early and prepares healthy meals with love. She helps me with my studies and teaches good moral values. Her sweet smile gives me confidence and strength every day. I love my mother dearly."
      ]
    },
    {
      id: "l5_essay_trees",
      title: "Essay: Importance of Trees (पेड़ों का महत्व)",
      hindi: "प्रकृति और वृक्षों पर 50 शब्दों का निबंध",
      category: "50-Word Essay",
      items: [
        "Trees are our best friends and the greatest gift of nature. They give us life giving oxygen, cool shade, fresh fruits, and colorful fragrant flowers. Birds build cute nests on their branches. Trees prevent soil erosion and bring rain. We must protect nature and plant trees daily."
      ]
    },
    {
      id: "l5_essay_morning",
      title: "Essay: A Morning Walk (सुबह की सैर)",
      hindi: "सुबह की सैर और स्वास्थ्य पर 50 शब्दों का निबंध",
      category: "50-Word Essay",
      items: [
        "A morning walk is the finest exercise for good physical and mental health. Early in the morning, the air is clean, cool, and fresh. Dew drops shine like pearls on the green grass. Walking keeps our body energetic, healthy, and happy. It is a wonderful habit."
      ]
    },
    {
      id: "l5_essay_friend",
      title: "Essay: My Best Friend (मेरी सबसे अच्छी सहेली)",
      hindi: "सच्ची दोस्ती पर 50 शब्दों का निबंध",
      category: "50-Word Essay",
      items: [
        "My best friend is honest, cheerful, and very helpful. We sit together in class and share our storybooks. Whenever I face any difficulty in English or mathematics, she explains it with patience. True friendship is a rare blessing, and we always support each other with love and respect."
      ]
    }
  ]
};

// Expose globally
window.LESSONS_DATABASE = LESSONS_DATABASE;

