export function sanitizeTextForMarkup(text: string): string {
  return text.replace(/[#+\-=|{}.![\]()>`]/g, '\\$&');
}
