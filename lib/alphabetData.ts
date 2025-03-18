
export type KannadaLetter = {
  id: string;
  rank: number;     
  character: string;
  name: string;
  pronunciation: string;
  examples: string[];
  category: string;
  audio: string;
  word: string;
  image: string;
  transliteration: string;      
  exampleImages : string[]
};

export const kannadaAlphabet: KannadaLetter[] = [
  {
    id: "vowel-a",
    rank: 1,
    character: "ಅ",
    name: "a",
    pronunciation: "a as in 'america'",
    examples: ["ಅಮ್ಮ (amma) - mother", "ಅಪ್ಪ (appa) - father"],
    category: "vowel",
    audio: "/audio/1.mp3",
    word: 'ಅಪ್ಪ',
    image: '/images/words/1.jpg',
    transliteration: 'appa (father)',
    exampleImages : ['/images/words/1.jpg', '/images/words/1.jpg']
  },
  
  {
    id: "vowel-aa",
    rank: 2,
    character: "ಆ",
    name: "aa",
    pronunciation: "aa as in 'art'",
    examples: ["ಆನೆ (aane) - elephant", "ಆಕಾಶ (aakaasha) - sky"],
    category: "vowel",
    audio: "/audio/2.mp3",
    word: 'ಆನೆ',
    image: '/images/words/2.jpg',
    transliteration: 'aane (elephant)',
    exampleImages : ['/images/words/2.jpg', '/images/words/1.jpg']
  },
  {
    id: "vowel-i",
    rank: 3,
    character: "ಇ",
    name: "i",
    pronunciation: "i as in 'in'",
    examples: ["ಇಲಿ (ili) - rat", "ಇದು (idu) - this"],
    category: "vowel",
    audio: "/audio/3.mp3",
    word: 'ಇಲಿ',
    image: '/images/words/3.jpg',
    transliteration: 'ili (mouse)',
    exampleImages : ['/images/words/3.jpg', '/images/words/1.jpg']
  },
  {
    id: "vowel-ii",
    rank: 4,
    character: "ಈ",
    name: "ii",
    pronunciation: "ee as in 'eat'",
    examples: ["ಈಶ್ವರ (eeshwara) - god", "ಈಗ (eega) - now"],
    category: "vowel",
    audio: "/audio/4.mp3",
    word: 'ಈಶ್ವರ',
    image: '/images/words/4.jpg',
    transliteration: 'eeshwar (god)',
    exampleImages : ['/images/words/4.jpg', '/images/words/1.jpg']
  },
  {
    id: "vowel-u",
    rank: 5,
    character: "ಉ",
    name: "u",
    pronunciation: "u as in 'put'",
    examples: ["ಉಪ್ಪು (uppu) - salt", "ಉಡುಗೆ (uduge) - clothes"],
    category: "vowel",
    audio: "/audio/5.mp3",
    word: 'ಉಪ್ಪು',
    image: '/images/words/5.jpg',
    transliteration: 'uppu (soup)',
    exampleImages : ['/images/words/5.jpg', '/images/words/1.jpg']
  },
  {
    id: "vowel-uu",
    rank: 6,
    character: "ಊ",
    name: "uu",
    pronunciation: "oo as in 'food'",
    examples: ["ಊಟ (oota) - meal", "ಊರು (ooru) - village"],
    category: "vowel",
    audio: "/audio/6.mp3",
    word: 'ಊಟ',
    image: '/images/words/6.jpg',
    transliteration: 'oot (food)',
    exampleImages : ['/images/words/6.jpg', '/images/words/1.jpg']
  },
  {
    id: "vowel-ru",
    rank: 7,
    character: "ಋ",
    name: "ru",
    pronunciation: "ru as in 'ruby'",
    examples: ["ಋಷಿ (rushi) - sage", "ಋತು (rutu) - season"],
    category: "vowel",
    audio: "/audio/7.mp3",
    word: 'ಋಷಿ',
    image: '/images/words/7.jpg',
    transliteration: 'rishi (teacher)',
    exampleImages : ['/images/words/7.jpg', '/images/words/1.jpg']
  },
  {
    id: "vowel-e",
    rank: 8,
    character: "ಎ",
    name: "e",
    pronunciation: "e as in 'egg'",
    examples: ["ಎಲೆ (ele) - leaf", "ಎಳು (elu) - seven"],
    category: "vowel",
    audio: "/audio/8.mp3",
    word: 'ಎಲೆ',
    image: '/images/words/8.jpg',
    transliteration: 'ele (leaf)',
    exampleImages : ['/images/words/8.jpg', '/images/words/1.jpg']
  },
  {
    id: "vowel-ee",
    rank: 9,
    character: "ಏ",
    name: "ee",
    pronunciation: "ay as in 'day'",
    examples: ["ಏಣಿ (eni) - ladder", "ಏನು (enu) - what"],
    category: "vowel",
    audio: "/audio/9.mp3",
    word: 'ಏಣಿ',
    image: '/images/words/9.jpg',
    transliteration: 'ene (river)',
    exampleImages : ['/images/words/9.jpg', '/images/words/1.jpg']
  },
  {
    id: "vowel-ai",
    rank: 10,
    character: "ಐ",
    name: "ai",
    pronunciation: "ai as in 'aisle'",
    examples: ["ಐದು (aidu) - five", "ಐಸ್ (ais) - ice"],
    category: "vowel",
    audio: "/audio/10.mp3",
    word: 'ಐದು',
    image: '/images/words/10.jpg',
    transliteration: 'aidu (five)',
    exampleImages : ['/images/words/10.jpg', '/images/words/1.jpg']
  },
  {
    id: "vowel-o",
    rank: 11,
    character: "ಒ",
    name: "o",
    pronunciation: "o as in 'hot'",
    examples: ["ಒಂದು (ondu) - one", "ಒಳ್ಳೆಯ (olleya) - good"],
    category: "vowel",
    audio: "/audio/11.mp3",
    word: 'ಒಂದು',
    image: '/images/words/11.jpg',
    transliteration: 'oondu (one)',
    exampleImages : ['/images/words/11.jpg', '/images/words/1.jpg']
  },
  {
    id: "vowel-oo",
    rank: 12,
    character: "ಓ",
    name: "oo",
    pronunciation: "o as in 'over'",
    examples: ["ಓದು (odu) - read", "ಓಟ (ota) - run"],
    category: "vowel",
    audio: "/audio/12.mp3",
    word: 'ಓದು',
    image: '/images/words/12.jpg',
    transliteration: 'oodu (read)',
    exampleImages : ['/images/words/12.jpg', '/images/words/1.jpg']
  },
  {
    id: "vowel-au",
    rank: 13,
    character: "ಔ",
    name: "au",
    pronunciation: "ou as in 'out'",
    examples: ["ಔಷಧ (aushadha) - medicine", "ಔದಾರ್ಯ (audarya) - generosity"],
    category: "vowel",
    audio: "/audio/13.mp3",
    word: 'ಔಷಧ',
    image: '/images/words/13.jpg',
    transliteration: 'aushadha (medicine)',
    exampleImages : ['/images/words/13.jpg', '/images/words/1.jpg']
  },
  
  {
    id: "vowel-am",
    rank: 14,
    character: "ಅಂ",
    name: "am",
    pronunciation: "am as in 'umbrella' (nasalized sound)",
    examples: ["ಹಂಸ (hamsa) - swan", "ಸಂತೋಷ (santosha) - happiness"],
    category: "vowel",
    audio: "/audio/14.mp3",
    word: 'ಹಂಸ',
    image: '/images/words/14.jpg',
    transliteration: 'hans (horse)',
    exampleImages : ['/images/words/14.jpg', '/images/words/1.jpg']
  },
  {
    id: "vowel-ahh",
    rank: 15,
    character: "ಅಃ",
    name: "ahh",
    pronunciation: "ahh as in 'aha!' (breathy sound)",
    examples: ["ನಮಃ (namah) - salutation", "ಶಾಂತಿಃ (shantih) - peace"],
    category: "vowel",
    audio: "/audio/15.mp3",
    word: 'ನಮಃ',
    image: '/images/words/15.jpg',
    transliteration: 'namah (salutation)',
    exampleImages : ['/images/words/15.jpg', '/images/words/1.jpg']
  }
];
