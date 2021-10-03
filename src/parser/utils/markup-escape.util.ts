export function escapeTextForMarkup(text: string): string {
  return text.replace(/[#+\-=|{}.![\]()>`]/g, '\\$&');
}
