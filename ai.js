/**
 * ai.js - Hugging Face & Offline Smart Generator
 * Handles dynamic AI lesson creation with English + Hindi translations.
 */

const AI_ENGINE = {
  // Free Hugging Face model endpoint for text generation with multi-model fallback
  DEFAULT_MODEL: "Qwen/Qwen2.5-3B-Instruct",
  FALLBACK_MODELS: [
    "Qwen/Qwen2.5-3B-Instruct",
    "google/gemma-2-2b-it",
    "meta-llama/Llama-3.2-3B-Instruct",
    "HuggingFaceH4/zephyr-7b-beta"
  ],
  HF_API_URL: "https://api-inference.huggingface.co/models/",
  DEFAULT_TOKEN: "",

  // Offline Smart Lesson Generator (Works 100% without internet!)
  // If student has no internet or no HF token, this generates contextual lessons instantly.
  offlineTopicBanks: {
    doctor: [
      { english: "I have a mild fever and a headache since yesterday.", hindi: "मुझे कल से हल्का बुखार और सिरदर्द है।" },
      { english: "The doctor advised me to drink plenty of warm water.", hindi: "डॉक्टर ने मुझे खूब गर्म पानी पीने की सलाह दी।" },
      { english: "Please take this medicine twice a day after meals.", hindi: "कृपया यह दवाई भोजन के बाद दिन में दो बार लें।" },
      { english: "You will feel completely energetic and fine in two days.", hindi: "आप दो दिनों में बिल्कुल तरोताज़ा और ठीक महसूस करेंगे।" },
      { english: "Healthy food and daily rest help our body recover fast.", hindi: "पौष्टिक भोजन और रोज़ का आराम हमारे शरीर को जल्दी ठीक करता है।" }
    ],
    shopping: [
      { english: "Excuse me, what is the price of this blue shirt?", hindi: "माफ़ कीजिए, इस नीली शर्ट की कीमत क्या है?" },
      { english: "Do you have this dress in a medium size?", hindi: "क्या आपके पास यह पोशाक मीडियम साइज़ में उपलब्ध है?" },
      { english: "Can I pay using online UPI or cash at the counter?", hindi: "क्या मैं काउंटर पर ऑनलाइन UPI या नकद से भुगतान कर सकती हूँ?" },
      { english: "Please give me a printed receipt and a carry bag.", hindi: "कृपया मुझे एक छपी हुई रसीद और एक थैला दें।" },
      { english: "Thank you for your polite assistance and quick service.", hindi: "आपकी विनम्र सहायता और त्वरित सेवा के लिए धन्यवाद।" }
    ],
    cricket: [
      { english: "Cricket is the most popular and loved sport in India.", hindi: "क्रिकेट भारत में सबसे लोकप्रिय और पसंदीदा खेल है।" },
      { english: "The batsman played a beautiful shot towards the boundary.", hindi: "बल्लेबाज़ ने बाउंड्री की तरफ एक बहुत खूबसूरत शॉट खेला।" },
      { english: "Our team needed six runs to win in the final over.", hindi: "हमारी टीम को आखिरी ओवर में जीतने के लिए छह रन चाहिए थे।" },
      { english: "The bowler threw a fast ball and took an important wicket.", hindi: "गेंदबाज़ ने एक तेज़ गेंद फेंकी और एक महत्वपूर्ण विकेट लिया।" },
      { english: "Hard work, team unity, and practice bring glorious victory.", hindi: "कड़ी मेहनत, टीम की एकता और अभ्यास शानदार जीत दिलाते हैं।" }
    ],
    cooking: [
      { english: "My grandmother taught me how to make traditional ginger tea.", hindi: "मेरी नानी ने मुझे पारंपरिक अदरक वाली चाय बनाना सिखाया था।" },
      { english: "First boil two cups of fresh water and milk in a pan.", hindi: "सबसे पहले एक बर्तन में दो कप ताज़ा पानी और दूध उबालें।" },
      { english: "Add crushed cardamom, fresh ginger, and natural brown sugar.", hindi: "कुटी हुई इलायची, ताज़ा अदरक और प्राकृतिक गुड़ या चीनी डालें।" },
      { english: "The sweet aroma of spices filled the entire warm kitchen.", hindi: "मसालों की भीनी-भीनी खुशबू से पूरी रसोई महक उठी।" },
      { english: "Cooking with love and patience always makes food delicious.", hindi: "प्यार और धैर्य से खाना पकाने पर वह हमेशा स्वादिष्ट बनता है।" }
    ],
    interview: [
      { english: "Tell me something about yourself and your educational background.", hindi: "मुझे अपने बारे में और अपनी शिक्षा की पृष्ठभूमि के बारे में बताइए।" },
      { english: "I am confident, self-motivated, and a quick learner of skills.", hindi: "मैं आत्मविश्वासी, स्व-प्रेरित और नई चीजें जल्दी सीखने वाली हूँ।" },
      { english: "I can type fast with high accuracy on any computer keyboard.", hindi: "मैं किसी भी कंप्यूटर कीबोर्ड पर तेज़ी और उच्च सटीकता से टाइप कर सकती हूँ।" },
      { english: "My long term goal is to contribute effectively to your organization.", hindi: "मेरा दीर्घकालिक लक्ष्य आपके संगठन में प्रभावी योगदान देना है।" },
      { english: "Thank you very much for this wonderful discussion.", hindi: "इस शानदार चर्चा के लिए आपका बहुत-बहुत धन्यवाद।" }
    ],
    nature: [
      { english: "Fresh green trees provide cool shade and life-giving oxygen.", hindi: "हरे-भरे पेड़ ठंडी छाया और जीवनदायिनी ऑक्सीजन प्रदान करते हैं।" },
      { english: "Birds chirp sweetly at sunrise as a gentle breeze blows.", hindi: "सूरज उगते ही पक्षी मधुर चहचहाहट करते हैं और मंद हवा चलती है।" },
      { english: "Clear rivers flow gracefully down the tall rocky mountains.", hindi: "साफ़ नदियाँ ऊँचे पथरीले पहाड़ों से नीचे की ओर खूबसूरती से बहती हैं।" },
      { english: "We must protect our mother earth and plant more saplings.", hindi: "हमें अपनी धरती माँ की रक्षा करनी चाहिए और अधिक पौधे लगाने चाहिए।" },
      { english: "Nature brings peaceful harmony and joy to every open heart.", hindi: "प्रकृति हर खुले दिल में शांति, सद्भाव और आनंद लाती है।" }
    ]
  },

  /**
   * Generates a lesson either via Hugging Face API (online) or Smart Fallback (offline)
   * @param {string} topic - User's chosen topic or prompt
   * @param {string} hfToken - Optional Hugging Face API Token
   * @returns {Promise<Array>} List of {english, hindi} lines
   */
  async generateLesson(topic, hfToken = "") {
    const cleanTopic = (topic || "").trim().toLowerCase();
    const token = hfToken || this.DEFAULT_TOKEN;

    // 1. Try Hugging Face API with fallback models if online and token is available
    if (navigator.onLine && token && cleanTopic) {
      for (const model of this.FALLBACK_MODELS) {
        try {
          const response = await this.callHuggingFace(cleanTopic, token, model);
          if (response && response.length > 0) {
            return { source: "huggingface", model, items: response };
          }
        } catch (err) {
          console.warn(`Hugging Face model ${model} failed, trying next:`, err);
        }
      }
    }

    // 2. Offline Smart Fallback
    const fallbackItems = this.getOfflineSmartLesson(cleanTopic);
    return { source: "offline-ai", items: fallbackItems };
  },

  /**
   * Call Hugging Face API with structured prompt
   */
  async callHuggingFace(topic, token, model = this.DEFAULT_MODEL) {
    const prompt = `You are an English language tutor for a Hindi-medium school student.
Topic: "${topic}".
Generate 5 simple, grammatically correct English sentences suitable for beginners.
For each sentence, provide the exact and natural Hindi translation in Devanagari script.
Return STRICTLY a JSON array of objects with keys "english" and "hindi". No markdown, no preface.
Example format:
[
  {"english": "I enjoy reading books every day.", "hindi": "मुझे हर रोज़ किताबें पढ़ना पसंद है।"},
  {"english": "My teacher teaches English very politely.", "hindi": "मेरी अध्यापिका बहुत विनम्रता से इंग्लिश पढ़ाती हैं।"}
]`;

    const res = await fetch(`${this.HF_API_URL}${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 350, temperature: 0.6, return_full_text: false }
      })
    });

    if (!res.ok) {
      throw new Error(`HF API HTTP error ${res.status}`);
    }

    const data = await res.json();
    let text = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      text = data[0].generated_text;
    } else if (typeof data === "string") {
      text = data;
    }

    // Extract JSON from output
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse JSON from model output");
  },

  /**
   * Smart Offline Generation: Combines topic cues with natural sentences
   */
  getOfflineSmartLesson(topic) {
    // Match topic keywords
    for (const [key, bank] of Object.entries(this.offlineTopicBanks)) {
      if (topic.includes(key)) {
        return bank;
      }
    }

    // Keyword heuristics
    if (topic.includes("doc") || topic.includes("health") || topic.includes("bimar") || topic.includes("hospital")) {
      return this.offlineTopicBanks.doctor;
    }
    if (topic.includes("shop") || topic.includes("market") || topic.includes("khareed") || topic.includes("bazaar")) {
      return this.offlineTopicBanks.shopping;
    }
    if (topic.includes("match") || topic.includes("game") || topic.includes("khel") || topic.includes("sport")) {
      return this.offlineTopicBanks.cricket;
    }
    if (topic.includes("chai") || topic.includes("tea") || topic.includes("food") || topic.includes("khana") || topic.includes("rasoi")) {
      return this.offlineTopicBanks.cooking;
    }
    if (topic.includes("job") || topic.includes("work") || topic.includes("naukri") || topic.includes("interview")) {
      return this.offlineTopicBanks.interview;
    }

    // Dynamic procedural sentence generator for custom topic
    const capitalizedTopic = topic ? topic.charAt(0).toUpperCase() + topic.slice(1) : "Learning";
    return [
      {
        english: `Learning about ${capitalizedTopic} is interesting and very helpful for my future.`,
        hindi: `${capitalizedTopic} के बारे में सीखना बहुत दिलचस्प और मेरे भविष्य के लिए उपयोगी है।`
      },
      {
        english: `I practice typing sentences about ${capitalizedTopic} with patience every morning.`,
        hindi: `मैं हर सुबह धैर्य के साथ ${capitalizedTopic} पर आधारित वाक्यों की टाइपिंग का अभ्यास करती हूँ।`
      },
      {
        english: `Daily English typing helps me understand new vocabulary clearly.`,
        hindi: `रोज़ की इंग्लिश टाइपिंग मुझे नए शब्दों को साफ़-साफ़ समझने में मदद करती है।`
      },
      {
        english: `My speed, accuracy, and confidence improve with every single lesson.`,
        hindi: `हर एक पाठ के साथ मेरी स्पीड, सटीकता और आत्मविश्वास लगातार बढ़ते हैं।`
      },
      {
        english: `Consistent dedication turns every difficult task into a grand success.`,
        hindi: `लगातार समर्पण हर कठिन काम को एक शानदार सफलता में बदल देता है।`
      }
    ];
  },

  /**
   * Reviews a 50-word student essay: gives encouraging feedback + praise + tip
   */
  async reviewEssay(text, hfToken = "") {
    const cleanText = (text || "").trim();
    const token = hfToken || this.DEFAULT_TOKEN;
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

    if (navigator.onLine && token && cleanText) {
      for (const model of this.FALLBACK_MODELS) {
        try {
          const prompt = `You are Mimi, a kind loving English tutor for an Indian school girl.
She wrote this continuous English essay (${wordCount} words):
"${cleanText}"

Write a short, encouraging review in 2-3 friendly sentences in warm Hinglish (Hindi + English). Praise her effort, give one gentle tip if any, and end with cute emojis. Keep it under 60 words.`;

          const res = await fetch(`${this.HF_API_URL}${model}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: { max_new_tokens: 150, temperature: 0.7, return_full_text: false }
            })
          });

          if (res.ok) {
            const data = await res.json();
            let out = "";
            if (Array.isArray(data) && data[0]?.generated_text) {
              out = data[0].generated_text.trim();
            } else if (typeof data === "string") {
              out = data.trim();
            }
            if (out) return out;
          }
        } catch (err) {
          console.warn(`HF review with ${model} failed:`, err);
        }
      }
    }

    // Smart local review fallback
    if (wordCount >= 40) {
      return `Wah! Bahut hi shandar aur sundar paragraph likha hai! 🌸 Aapki vocabulary aur sentence flow school standard ke hisab se bohot acchi hai. Ab niche diye button se isko Arena me type karo aur speed badhao! 🚀💖`;
    } else if (wordCount >= 20) {
      return `Bohot pyara prayas hai! 🌷 Aapne ${wordCount} shabd likhe hain. Isme 1-2 sentences aur jodkar ise 45-50 words ka complete essay bana sakti hain. Keep going champion! ⭐`;
    } else {
      return `Shuruat bohot achhi hai! 🌸 Thoda aur likhein taaki 40-50 words ka paragraph ban sake. You can do it! ✨`;
    }
  },

  /**
   * Generates a 50-word continuous paragraph + Hindi translation for typing practice
   * @param {string} topic - Topic name (e.g. school, mother, nature, cricket, etc.)
   * @param {string} hfToken - Hugging Face Token (optional)
   * @returns {Promise<{english: string, hindi: string, wordCount: number, topic: string, source: string}>}
   */
  async generateParagraph50Words(topic = "school", hfToken = "") {
    const cleanTopic = (topic || "school").trim();
    const token = hfToken || this.DEFAULT_TOKEN;

    // 1. Online Hugging Face Generation
    if (navigator.onLine && token && cleanTopic) {
      for (const model of this.FALLBACK_MODELS) {
        try {
          const prompt = `You are Mimi, a kind English tutor for an Indian school girl.
Topic: "${cleanTopic}".
Write a beautiful, positive continuous English paragraph of exactly 45 to 50 words for her typing practice.
Also provide the complete Hindi translation in Devanagari script.
Return STRICTLY valid JSON with two keys:
{"english": "The 45-50 word continuous paragraph...", "hindi": "हिंदी अनुवाद..."}
No markdown formatting, no code blocks, pure JSON.`;

          const res = await fetch(`${this.HF_API_URL}${model}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: { max_new_tokens: 250, temperature: 0.7, return_full_text: false }
            })
          });

          if (res.ok) {
            const data = await res.json();
            let text = "";
            if (Array.isArray(data) && data[0]?.generated_text) {
              text = data[0].generated_text;
            } else if (typeof data === "string") {
              text = data;
            }
            const match = text.match(/\{[\s\S]*"english"[\s\S]*"hindi"[\s\S]*\}/);
            if (match) {
              const parsed = JSON.parse(match[0]);
              const words = parsed.english.trim().split(/\s+/).filter(Boolean).length;
              return {
                english: parsed.english.trim(),
                hindi: parsed.hindi.trim(),
                wordCount: words,
                topic: cleanTopic,
                source: "huggingface"
              };
            }
          }
        } catch (err) {
          console.warn(`HF paragraph generation with ${model} failed, trying fallback:`, err);
        }
      }
    }

    // 2. Offline High-Quality Smart Generator
    const offlineResult = this.getOffline50WordParagraph(cleanTopic);
    const words = offlineResult.english.trim().split(/\s+/).filter(Boolean).length;
    return {
      english: offlineResult.english.trim(),
      hindi: offlineResult.hindi.trim(),
      wordCount: words,
      topic: cleanTopic,
      source: "offline-smart"
    };
  },

  offline50WordBanks: {
    school: {
      english: "My school is a wonderful temple of knowledge, discipline, and friendship. Every morning, I wear my clean uniform, tie my shoelaces, and reach the peaceful assembly ground. Our dedicated teachers explain every subject with patience and joy. I enjoy studying in our quiet library and playing badminton with dear classmates.",
      hindi: "मेरा विद्यालय ज्ञान, अनुशासन और मित्रता का एक अद्भुत मंदिर है। हर सुबह मैं साफ़ ड्रेस पहनकर शांत प्रार्थना सभा में पहुँचती हूँ। शिक्षक धैर्य और आनंद से पढ़ाते हैं। मुझे लाइब्रेरी में पढ़ना और दोस्तों के साथ बैडमिंटन खेलना बहुत पसंद है।"
    },
    mother: {
      english: "My mother is the kindest, most affectionate, and hard-working person in our loving family. She wakes up early, prepares warm nutritious breakfast, and blesses me with a gentle smile. Whenever I face any difficulty in my school lessons, she guides me patiently. Her love gives me unending confidence.",
      hindi: "मेरी माँ हमारे प्यारे परिवार में सबसे दयालु, स्नेही और मेहनती इंसान हैं। वे सुबह जल्दी उठकर पौष्टिक नाश्ता बनाती हैं और मुझे प्यार भरी मुस्कान देती हैं। जब भी पढ़ाई में कोई कठिनाई होती है, वे धैर्य से मेरा मार्गदर्शन करती हैं।"
    },
    nature: {
      english: "Green trees are the greatest lifesavers and most precious companions on our earth. They absorb harmful gases, release fresh oxygen, and bring cooling monsoon rains. Many sweet birds build nests on their leafy branches. We receive delicious fruits, medicinal herbs, and cool shade. Everyone should plant one sapling regularly.",
      hindi: "हरे-भरे पेड़ हमारी धरती पर सबसे बड़े जीवनदाता और अनमोल साथी हैं। वे ताज़ा ऑक्सीजन छोड़ते हैं और मानसूनी बारिश लाते हैं। पक्षी उनकी शाखाओं पर घोंसले बनाते हैं। हमें मीठे फल, औषधियाँ और ठंडी छाया मिलती है। सभी को नियमित पौधे लगाने चाहिए।"
    },
    walk: {
      english: "A morning walk is the finest natural medicine for a healthy body and active mind. Early at dawn, gentle cool breeze whispers through green gardens. Beautiful dew drops sparkle like pearls on fresh grass. Birds sing sweet melodies. Walking regularly keeps our heart strong, reduces stress, and fills the day with positivity.",
      hindi: "सुबह की सैर स्वस्थ शरीर और सक्रिय दिमाग के लिए सबसे बेहतरीन प्राकृतिक दवा है। भोर में बगीचों में ठंडी हवा चलती है। हरी घास पर ओस की बूंदें मोतियों जैसी चमकती हैं। रोज़ सैर करने से दिल मज़बूत रहता है और पूरा दिन सकारात्मकता से भर जाता है।"
    },
    friend: {
      english: "A true friend is a great blessing who brings immense joy, honesty, and support to life. My best friend is cheerful, trustworthy, and always ready to help others. We sit together during classes, share lunch boxes, and practice math puzzles. True friendship teaches us loyalty, kindness, and mutual respect.",
      hindi: "एक सच्चा दोस्त एक बहुत बड़ा आशीर्वाद होता है जो जीवन में खुशियाँ, ईमानदारी और सहारा लाता है। मेरी सबसे अच्छी दोस्त हंसमुख और मददगार है। हम कक्षा में साथ बैठते हैं और टिफिन शेयर करते हैं। सच्ची दोस्ती हमें वफादारी और दयालुता सिखाती है।"
    },
    cricket: {
      english: "Cricket is an exciting outdoor sport loved and celebrated passionately across our country. Two teams compete with high energy, teamwork, and sharp focus. Playing sports teaches us discipline, sportsmanship, and how to remain calm under pressure. Exercise keeps our muscles agile, healthy, and sharp for everyday studies.",
      hindi: "क्रिकेट हमारे देश में बहुत उत्साह से खेला जाने वाला खेल है। दो टीमें एकता और एकाग्रता के साथ खेलती हैं। खेल हमें अनुशासन और खेल भावना सिखाते हैं। व्यायाम से शरीर फुर्तीला, स्वस्थ और पढ़ाई के लिए तेज़ रहता है।"
    },
    diwali: {
      english: "Diwali is the glorious festival of lights celebrating the victory of good over evil. Families decorate homes with bright earthen lamps, colorful rangoli, and fragrant marigold flowers. Everyone wears new traditional clothes, distributes homemade sweets, and shares joyful laughter. This beautiful festival spreads harmony, hope, and togetherness everywhere.",
      hindi: "दिवाली रोशनी का एक पावन पर्व है जो अच्छाई की बुराई पर जीत का प्रतीक है। परिवार अपने घरों को दीपों और रंगोली से सजाते हैं। सब नए कपड़े पहनते हैं और मिठाइयाँ बाँटते हैं। यह त्यौहार हर जगह आशा, प्रेम और भाईचारा फैलाता है।"
    },
    pet: {
      english: "My cute pet puppy is an energetic, loyal, and playful member of our household. Whenever I return home from school, he wags his tail enthusiastically and jumps with delight. We play running games in the garden every evening. Caring for a pet teaches us true empathy, love, and responsibility.",
      hindi: "मेरा नन्हा पिल्ला बहुत फुर्तीला, वफादार और चंचल है। जब भी मैं स्कूल से लौटती हूँ, वह खुशी से पूँछ हिलाता है और उछलता है। हम शाम को बगीचे में खेलते हैं। पालतू जानवर की देखभाल हमें सच्ची करुणा, प्रेम और ज़िम्मेदारी सिखाती है।"
    },
    books: {
      english: "Reading books is one of the most rewarding and peaceful hobbies in the world. Good books introduce us to inspiring heroes, distant lands, and fascinating scientific discoveries. Daily reading enriches our vocabulary and builds fluent English speaking skills. A person who loves reading is never alone or bored.",
      hindi: "किताबें पढ़ना दुनिया का सबसे सुखद और ज्ञानवर्धक शौक है। अच्छी किताबें हमें महान लोगों और विज्ञान से परिचित कराती हैं। रोज़ पढ़ने से हमारा शब्दभंडार समृद्ध होता है और इंग्लिश बोलने का कौशल बढ़ता है। किताबें पढ़ने वाला कभी अकेला महसूस नहीं करता।"
    },
    dream: {
      english: "Every young student has unique dreams, talents, and bright aspirations for the future. With honest dedication, patience, and regular practice, any difficult challenge can be mastered successfully. I aim to excel in my studies and become a responsible, helpful citizen. Hard work and self-belief make every impossible dream come true.",
      hindi: "हर विद्यार्थी के भविष्य के लिए अनूठे सपने और उज्ज्वल आकांक्षाएं होती हैं। सच्ची निष्ठा और नियमित अभ्यास से किसी भी मुश्किल काम पर विजय पाई जा सकती है। मेरा लक्ष्य पढ़ाई में अव्वल आना और एक ज़िम्मेदार नागरिक बनना है। आत्मविश्वास हर सपने को सच बनाता है।"
    }
  },

  getOffline50WordParagraph(topic) {
    const t = (topic || "").toLowerCase();
    for (const [k, v] of Object.entries(this.offline50WordBanks)) {
      if (t.includes(k)) return v;
    }
    if (t.includes("tree") || t.includes("plant") || t.includes("garden") || t.includes("paryavaran")) {
      return this.offline50WordBanks.nature;
    }
    if (t.includes("maa") || t.includes("mom") || t.includes("family") || t.includes("parivar")) {
      return this.offline50WordBanks.mother;
    }
    if (t.includes("morning") || t.includes("sair") || t.includes("health") || t.includes("routine")) {
      return this.offline50WordBanks.walk;
    }
    if (t.includes("dost") || t.includes("mitra") || t.includes("yaar")) {
      return this.offline50WordBanks.friend;
    }
    if (t.includes("khel") || t.includes("match") || t.includes("sport") || t.includes("game")) {
      return this.offline50WordBanks.cricket;
    }
    if (t.includes("dog") || t.includes("cat") || t.includes("animal") || t.includes("janwar")) {
      return this.offline50WordBanks.pet;
    }
    if (t.includes("tyohar") || t.includes("holi") || t.includes("eid") || t.includes("fest")) {
      return this.offline50WordBanks.diwali;
    }
    if (t.includes("kitab") || t.includes("study") || t.includes("padhai")) {
      return this.offline50WordBanks.books;
    }

    // Dynamic procedural fallback for any custom topic
    const topicCap = topic ? topic.charAt(0).toUpperCase() + topic.slice(1) : "English Learning";
    return {
      english: `${topicCap} is a truly fascinating and valuable topic that inspires my daily curiosity and learning. Exploring about ${topicCap} helps me understand new ideas, expand vocabulary, and build strong confidence. With regular study and focused touch typing, I improve my knowledge, typing speed, and English fluency with great joy every day.`,
      hindi: `${topicCap} एक बहुत ही रोचक और उपयोगी विषय है जो मेरी सीखने की जिज्ञासा को बढ़ाता है। इसके बारे में जानने से नए विचार और इंग्लिश शब्दावली बढ़ती है। रोज़ाना ध्यान लगाकर टाइपिंग करने से मेरी स्पीड और ज्ञान लगातार बढ़ता है।`
    };
  }
};

window.AI_ENGINE = AI_ENGINE;

