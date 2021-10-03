import { JSDOM } from 'jsdom';

import { Choice } from '../../common/interfaces/choice.interface';
import { Media } from '../../common/interfaces/media.interface';
import { Scene } from '../../common/interfaces/scene.interface';
import { ParserStrategy } from '../parser-strategy.abstract';
import { getCSSSelector } from '../utils/css-selector.util';
import { extractMediaFromDom } from '../utils/dom-media-extractor.util';
import { escapeTextForMarkup } from '../utils/markup-escape.util';

export class Harlowe3Strategy extends ParserStrategy {
  private $passage: Element;

  constructor() {
    super('harlowe3');
  }

  parse(content: string): Scene {
    const dom = new JSDOM(content);
    this.$passage = dom.window.document.querySelector('tw-passage');

    this.unwrapFromPassageTransitionContainerIfExist();
    const choices = this.getPassageChoices();
    this.removePassageLinks();
    this.removePassageSidebar();
    const media = this.getMediaIfExist();
    this.formatPassageText();
    const text = this.getPassageText();

    return {
      text,
      media,
      choices,
    };
  }

  private unwrapFromPassageTransitionContainerIfExist(): void {
    const foundContainer = this.$passage.querySelector(
      'tw-transition-container',
    );
    if (foundContainer) {
      foundContainer.replaceWith(...foundContainer.childNodes);
    }
  }

  private getPassageChoices(): Choice[] {
    const $links = this.getPassageLinks();
    return $links.map((el) => ({
      text: el.textContent,
      selector: getCSSSelector(el),
    }));
  }

  private removePassageLinks(): void {
    this.getPassageLinks().forEach((el) => el.remove());
  }

  private getPassageLinks(): Element[] {
    return Array.from(this.$passage.querySelectorAll('tw-link').values());
  }

  private removePassageSidebar(): void {
    this.$passage.querySelector('tw-sidebar').remove();
  }

  private getMediaIfExist(): Media | null {
    return extractMediaFromDom(this.$passage);
  }

  private formatPassageText(): void {
    this.$passage.innerHTML = this.$passage.innerHTML
      .replace(/<li>/g, '* ')
      .replace(/<\/li>/g, '\n')
      .replace(/[_*~]/g, '\\$&')
      .replace(/<br>/g, '\n')
      .replace(/<tw-consecutive-br>/g, '\n')
      .replace(/<\/?h1>/g, '*')
      .replace(/<\/?b>/g, '*')
      .replace(/<\/?i>/g, '_')
      .replace(/<\/?s>/g, '~');
    this.$passage.textContent = escapeTextForMarkup(this.$passage.textContent);
  }

  private getPassageText(): string {
    return this.$passage.textContent;
  }
}
