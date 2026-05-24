/**
 * Formats a timestamp or date into HH:MM:SS string.
 * @param {Date|number|string} dateVal 
 * @returns {string} HH:MM:SS format
 */
export const formatHHMMSS = (dateVal = new Date()) => {
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "00:00:00";
  
  const pad = (n) => String(n).padStart(2, '0');
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  
  return `${hh}:${mm}:${ss}`;
};

/**
 * Formats a timestamp into a full localized display string.
 * @param {Date|number|string} dateVal 
 * @returns {string} "DD MMM YYYY, HH:MM:SS"
 */
export const formatFullDateTime = (dateVal = new Date()) => {
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "N/A";
  
  const pad = (n) => String(n).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = pad(d.getDate());
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const timeStr = formatHHMMSS(d);
  
  return `${day} ${month} ${year}, ${timeStr}`;
};
