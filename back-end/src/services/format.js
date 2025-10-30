/**
 * 配列に格納されたオブジェクトのキーをすべて小文字に変換する
 * @param {Array<Object>} array
 * @returns {{ success: boolean, data?: Array<Object>, message?: string, status?: number }}
 */
function formatResponse(array) {
  if (!Array.isArray(array)) {
    return {
      success: false,
      message: 'Input is not an array',
      status: 500
    };
  }

  const response = array.map(item => {
    const newObj = {};

    for (const key in item) {
      const lowerKey = key.toLowerCase();
      const value = item[key];

      // 値はそのまま、キーのみ小文字化
      newObj[lowerKey] = value;
    }

    return newObj;
  });

  return {
    success: true,
    data: response
  };
}

function formatDateFromISO(isoString) {
  const date = new Date(isoString);
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 0始まりなので+1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTimeFromISO(isoString) {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function formatTimeForMySQL(timeString) {
  const [h, m, s] = timeString.split(':').map(Number);
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
  ].join(':');
}

function formatDateForMySQL(dateString) {
  const [y, mo, d] = dateString.split('-').map(Number);
  return [
    y,
    String(mo).padStart(2, '0'),
    String(d).padStart(2, '0'),
  ].join('-');
}

const enrollmentStatus = [
  'INACTIVE',
  'ACTIVE'
];

module.exports = {
    formatResponse,
    formatDateFromISO,
    formatTimeFromISO,
    formatTimeForMySQL,
    formatDateForMySQL,
    enrollmentStatus
};