export function escapeTextForMarkup(text: string): string {
  return text.replace(/[_*\[\]()~`>$+\-=|{}.!]/g, '\\$&');
}

export function convertHtmlToMarkup(text: string): string {
  return text
    .replace(/<li>/g, '* ')
    .replace(/<\/li>/g, '\n')
    .replace(/[_*~]/g, '\\$&')
    .replace(/<br>/g, '\n')
    .replace(/<tw-consecutive-br>/g, '\n')
    .replace(/<\/?h1>/g, '*')
    .replace(/<\/?b>/g, '*')
    .replace(/<\/?i>/g, '_')
    .replace(/<\/?s>/g, '~')
    .replace(/<\/?a.*?>/g, '*');
}
