function detectValueDuplicate(items, exceptions = []) {
  const seen = new Set();
  const duplicates = [];

  for (const item of items) {
    // 除外キーを取り除いた値の配列を作成
    const values = Object.entries(item)
      .filter(([key]) => !exceptions.includes(key))
      .map(([_, value]) => value);

    const key = JSON.stringify(values);

    if (seen.has(key)) {
      duplicates.push(item);
    } else {
      seen.add(key);
    }
  }
  return duplicates.length !== 0;
}

module.exports = detectValueDuplicate;