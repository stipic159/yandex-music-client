const EN_TO_RU_MAP: Record<string, string> = {
  q: "й", w: "ц", e: "у", r: "к", t: "е", y: "н", u: "г", i: "ш", o: "щ", p: "з",
  "[": "х", "]": "ъ", a: "ф", s: "ы", d: "в", f: "а", g: "п", h: "р", j: "о", k: "л",
  l: "д", ";": "ж", "'": "э", z: "я", x: "ч", c: "с", v: "м", b: "и", n: "т", m: "ь",
  ",": "б", ".": "ю", "`": "ё",
  Q: "Й", W: "Ц", E: "У", R: "К", T: "Е", Y: "Н", U: "Г", I: "Ш", O: "Щ", P: "З",
  "{": "Х", "}": "Ъ", A: "Ф", S: "Ы", D: "В", F: "А", G: "П", H: "Р", J: "О", K: "Л",
  L: "Д", ":": "Ж", '"': "Э", Z: "Я", X: "Ч", C: "С", V: "М", B: "И", N: "Т", M: "Ь",
  "<": "Б", ">": "Ю", "~": "Ё",
};

const RU_TO_EN_MAP: Record<string, string> = {
  й: "q", ц: "w", у: "e", к: "r", е: "t", н: "y", г: "u", ш: "i", щ: "o", з: "p",
  х: "[", ъ: "]", ф: "a", ы: "s", в: "d", а: "f", п: "g", р: "h", о: "j", л: "k",
  д: "l", ж: ";", э: "'", я: "z", ч: "x", с: "c", м: "v", и: "b", т: "n", ь: "m",
  б: ",", ю: ".", ё: "`",
  Й: "Q", Ц: "W", У: "E", К: "R", Е: "T", Н: "Y", Г: "U", Ш: "I", Щ: "O", З: "P",
  Х: "{", Ъ: "}", Ф: "A", Ы: "S", В: "D", А: "F", П: "G", Р: "H", О: "J", Л: "K",
  Д: "L", Ж: ":", Э: '"', Я: "Z", Ч: "X", С: "C", М: "V", И: "B", Т: "N", Ь: "M",
  Б: "<", Ю: ">", Ё: "~",
};

export function switchKeyboardLayout(text: string): string {
  if (!text) return "";
  let ruCount = 0;
  let enCount = 0;
  for (const ch of text) {
    if (/[а-яёА-ЯЁ]/.test(ch)) ruCount++;
    if (/[a-zA-Z]/.test(ch)) enCount++;
  }

  // Если преимущественно русский текст, конвертируем в английскую раскладку
  if (ruCount > enCount) {
    return text
      .split("")
      .map((ch) => RU_TO_EN_MAP[ch] || ch)
      .join("");
  }
  // Иначе конвертируем в русскую раскладку
  return text
    .split("")
    .map((ch) => EN_TO_RU_MAP[ch] || ch)
    .join("");
}

export function isDifferentLayout(text: string): boolean {
  if (!text || text.trim().length < 2) return false;
  const switched = switchKeyboardLayout(text);
  return switched.trim().toLowerCase() !== text.trim().toLowerCase();
}
