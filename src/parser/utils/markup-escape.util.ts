import { replaceTextInElement } from './dom-text-replace.util';

const MARKUP_ESCAPE_REGEXP = /[_*\[\]()~`>$+\-=|{}.!]/g;

export function escapeTextForMarkup(text: string): string {
  return text.replace(MARKUP_ESCAPE_REGEXP, '\\$&');
}

export function escapeElementTextForMarkup(elem: Element): void {
  replaceTextInElement(elem, MARKUP_ESCAPE_REGEXP, '\\$&');
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
