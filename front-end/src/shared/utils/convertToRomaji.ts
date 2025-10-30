const kanaToRomaMap: { [key: string]: string } = {
  // ひらがな・カタカナ対応
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", を: "wo", ん: "n",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  きゃ: "kya", きゅ: "kyu", きょ: "kyo",
  しゃ: "sha", しゅ: "shu", しょ: "sho",
  ちゃ: "cha", ちゅ: "chu", ちょ: "cho",
  にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
  みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo",
  ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  じゃ: "ja",  じゅ: "ju", じょ: "jo",
  びゃ: "bya", ゔぃ: "vi", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  // カタカナ（ひらがなと同じローマ字）
};

// function isKana(char: string): boolean {
//   return /^[\u3040-\u309F\u30A0-\u30FF]$/.test(char);
// }

function normalizeKana(input: string): string {
  return input.replace(/[\u30A1-\u30F6]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60)
  );
}

function kanaToRomaji(input: string): string {
  let result = "";
  const normalized = normalizeKana(input);
  let i = 0;

  while (i < normalized.length) {
    const char = normalized[i];

    // 促音（っ）
    if (char === "っ") {
      const nextChar = normalized[i + 1];
      const roma = kanaToRomaMap[normalized.slice(i + 1, i + 3)] || kanaToRomaMap[nextChar];
      if (roma) result += roma[0];
      i++;
      continue;
    }

    // 拗音（2文字）
    const twoChar = normalized.slice(i, i + 2);
    if (kanaToRomaMap[twoChar]) {
      result += kanaToRomaMap[twoChar];
      i += 2;
      continue;
    }

    // 通常の1文字
    result += kanaToRomaMap[char] || char;
    i++;
  }

  return result;
}

export function convertJapaneseNameToRomaji(input: string): string {
  return input
    .split(/\s+/)
    .map(kanaToRomaji)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// エイリアスは不要なので削除（直接 convertJapaneseNameToRomaji を使用）