import { JSDOM } from 'jsdom';

import { ActionType } from '../../player/enums/action-type.enum';
import { Choice } from '../../player/interfaces/action.interface';
import { Media } from '../../player/interfaces/media.interface';
import { Scene } from '../../player/interfaces/scene.interface';
import { ParserStrategy } from '../interfaces/parser-strategy.interface';
import { getCSSSelector } from '../utils/css-selector.util';
import { extractMediaFromDom } from '../utils/dom-media-extractor.util';
import { escapeTextForMarkup } from '../utils/markup-escape.util';

export default {
  name: 'harlowe3',
  parse: (content) => {
    return new Harlowe3Strategy(content).parse();
  },
} as ParserStrategy;

class Harlowe3Strategy {
  private readonly dom: JSDOM;
  private $passage: Element;

  constructor(content: string) {
    this.dom = new JSDOM(content);
  }

  parse(): Scene {
    this.$passage = this.dom.window.document.querySelector('tw-passage');

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
      actions: choices,
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
      type: ActionType.Choice,
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
