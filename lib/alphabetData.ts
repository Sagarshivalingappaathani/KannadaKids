
export type KannadaLetter = {
  id: string;
  character: string;
  name: string;
  pronunciation: string;
  examples: string[];
  category: string;
  audio: string;
};

export const kannadaAlphabet: KannadaLetter[] = [
  {
    id: "vowel-a",
    character: "ಅ",
    name: "a",
    pronunciation: "a as in 'america'",
    examples: ["ಅಮ್ಮ (amma) - mother", "ಅಪ್ಪ (appa) - father"],
    category: "vowel",
    audio: "/audio/1.mp3"
  },
  
  {
    id: "vowel-aa",
    character: "ಆ",
    name: "aa",
    pronunciation: "aa as in 'art'",
    examples: ["ಆನೆ (aane) - elephant", "ಆಕಾಶ (aakaasha) - sky"],
    category: "vowel",
    audio: "/audio/2.mp3"
  },
  {
    id: "vowel-i",
    character: "ಇ",
    name: "i",
    pronunciation: "i as in 'in'",
    examples: ["ಇಲಿ (ili) - rat", "ಇದು (idu) - this"],
    category: "vowel",
    audio: "/audio/3.mp3"
  },
  {
    id: "vowel-ii",
    character: "ಈ",
    name: "ii",
    pronunciation: "ee as in 'eat'",
    examples: ["ಈಶ್ವರ (eeshwara) - god", "ಈಗ (eega) - now"],
    category: "vowel",
    audio: "/audio/4.mp3"
  },
  {
    id: "vowel-u",
    character: "ಉ",
    name: "u",
    pronunciation: "u as in 'put'",
    examples: ["ಉಪ್ಪು (uppu) - salt", "ಉಡುಗೆ (uduge) - clothes"],
    category: "vowel",
    audio: "/audio/5.mp3"
  },
  {
    id: "vowel-uu",
    character: "ಊ",
    name: "uu",
    pronunciation: "oo as in 'food'",
    examples: ["ಊಟ (oota) - meal", "ಊರು (ooru) - village"],
    category: "vowel",
    audio: "/audio/6.mp3"
  },
  {
    id: "vowel-ru",
    character: "ಋ",
    name: "ru",
    pronunciation: "ru as in 'ruby'",
    examples: ["ಋಷಿ (rushi) - sage", "ಋತು (rutu) - season"],
    category: "vowel",
    audio: "/audio/7.mp3"
  },
  {
    id: "vowel-e",
    character: "ಎ",
    name: "e",
    pronunciation: "e as in 'egg'",
    examples: ["ಎಲೆ (ele) - leaf", "ಎಳು (elu) - seven"],
    category: "vowel",
    audio: "/audio/8.mp3"
  },
  {
    id: "vowel-ee",
    character: "ಏ",
    name: "ee",
    pronunciation: "ay as in 'day'",
    examples: ["ಏಣಿ (eni) - ladder", "ಏನು (enu) - what"],
    category: "vowel",
    audio: "/audio/9.mp3"
  },
  {
    id: "vowel-ai",
    character: "ಐ",
    name: "ai",
    pronunciation: "ai as in 'aisle'",
    examples: ["ಐದು (aidu) - five", "ಐಸ್ (ais) - ice"],
    category: "vowel",
    audio: "/audio/10.mp3"
  },
  {
    id: "vowel-o",
    character: "ಒ",
    name: "o",
    pronunciation: "o as in 'hot'",
    examples: ["ಒಂದು (ondu) - one", "ಒಳ್ಳೆಯ (olleya) - good"],
    category: "vowel",
    audio: "/audio/11.mp3"
  },
  {
    id: "vowel-oo",
    character: "ಓ",
    name: "oo",
    pronunciation: "o as in 'over'",
    examples: ["ಓದು (odu) - read", "ಓಟ (ota) - run"],
    category: "vowel",
    audio: "/audio/12.mp3"
  },
  {
    id: "vowel-au",
    character: "ಔ",
    name: "au",
    pronunciation: "ou as in 'out'",
    examples: ["ಔಷಧ (aushadha) - medicine", "ಔದಾರ್ಯ (audarya) - generosity"],
    category: "vowel",
    audio: "/audio/13.mp3"
  },
  
  {
    id: "vowel-am",
    character: "ಅಂ",
    name: "am",
    pronunciation: "am as in 'umbrella' (nasalized sound)",
    examples: ["ಹಂಸ (hamsa) - swan", "ಸಂತೋಷ (santosha) - happiness"],
    category: "vowel",
    audio: "/audio/14.mp3"
  },
  {
    id: "vowel-ahh",
    character: "ಅಃ",
    name: "ahh",
    pronunciation: "ahh as in 'aha!' (breathy sound)",
    examples: ["ನಮಃ (namah) - salutation", "ಶಾಂತಿಃ (shantih) - peace"],
    category: "vowel",
    audio: "/audio/15.mp3"
  }
];
