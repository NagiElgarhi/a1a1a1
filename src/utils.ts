export function extractVideoId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  
  // If explicitly a length of 11 chars with no slash, likely a direct ID
  if (trimmed.length === 11 && !trimmed.includes('/')) return trimmed;
  
  // Enhanced regex to catch /watch?v=, /live/, /embed/, youtu.be, etc.
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);
  
  return match ? match[1] : null;
}
