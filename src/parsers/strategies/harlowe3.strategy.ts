import { JSDOM } from 'jsdom';

import { getCSSSelector } from '../../common/common/utils/css-selector.util';
import { Choice } from '../../common/interfaces/choice.interface';
import { Scene } from '../../common/interfaces/scene.interface';
import { ParserStrategy } from '../interfaces/parser-strategy.interface';
export class Harlowe3Strategy implements ParserStrategy {
  private $passage: Element;

  parse(content: string): Scene {
    const dom = new JSDOM(content);
    this.$passage = dom.window.document.querySelector('tw-passage');

    this.unwrapFromPassageTransitionContainerIfExist();
    const choices = this.getPassageActions();
    this.removePassageLinks();
    this.removePassageSidebar();
    const text = this.getPassageText();

    return {
      text,
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

  private getPassageActions(): Choice[] {
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

  private getPassageText(): string {
    this.$passage.innerHTML = this.$passage.innerHTML.replace(
      /<br\s*[\/]?>/gi,
      '\n',
    );
    return this.$passage.textContent;
  }
}
