/**
 * Safely parses m3u8_urls which can be either a JSON string or an already-parsed object
 * @param m3u8_urls - The m3u8_urls data that can be a string, object, or undefined
 * @returns A Record<string, string> object or an empty object if parsing fails
 */
export function parse_m3u8_urls(
  m3u8_urls: string | Record<string, string> | undefined | null
): Record<string, string> {
  // If it's already an object, return it
  if (m3u8_urls && typeof m3u8_urls === "object") {
    return m3u8_urls;
  }

  // If it's a string, try to parse it
  if (m3u8_urls && typeof m3u8_urls === "string") {
    try {
      const parsed = JSON.parse(m3u8_urls);
      // Ensure the parsed result is an object
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse m3u8_urls:", e);
    }
  }

  // Default to empty object
  return {};
}
