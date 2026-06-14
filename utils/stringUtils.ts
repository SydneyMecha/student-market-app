export const decodeHTMLEntities = (str: string): string => {
  if (!str) return '';

  // 1. Decode decimal numerical entities (e.g., &#8211; to –, &#8217; to ', &#8243; to ")
  let decoded = str.replace(/&#([0-9]+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });

  // 2. Decode hexadecimal numerical entities (e.g., &#x2013;)
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // 3. Map standard named XML/HTML entities
  return decoded
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&nbsp;/g, ' ');
};