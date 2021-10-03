import { JSDOM } from 'jsdom';

import { MediaKind } from '../../player/enums/media-kind.enum';
import { Choice } from '../../player/interfaces/choice.interface';
import { Media } from '../../player/interfaces/media.interface';
import { Scene } from '../../player/interfaces/scene.interface';
import { ParserStrategy } from '../interfaces/parser-strategy.interface';
import { getCSSSelector } from '../utils/css-selector.util';
import { extractMediaFromDom } from '../utils/dom-media-extractor.util';
import { escapeTextForMarkup } from '../utils/markup-escape.util';

export default {
  name: 'qspider',
  anchor: '[class*=MainFrame]',
  parse(content) {
    return new QSpiderStrategy(content).parse();
  },
} as ParserStrategy;

class QSpiderStrategy {
  private readonly dom: JSDOM;

  constructor(content: string) {
    this.dom = new JSDOM(content);
  }

  parse(): Scene {
    const menuParser = new QSpiderMenuParser(this.dom);
    const gameParser = new QSpiderGameParser(this.dom);

    if (menuParser.isMainMenu()) {
      return menuParser.parse();
    }

    return gameParser.parse();
  }
}

class QSpiderMenuParser {
  private $games: Element[];

  constructor(private readonly dom: JSDOM) {}

  isMainMenu(): boolean {
    return (
      this.dom.window.document.querySelectorAll('[class*=GameSlots]').length > 0
    );
  }

  parse(): Scene {
    this.$games = this.getGames();
    const text = this.gamesInfoToText();
    const choices = this.getGameChoices();
    return {
      text,
      choices,
    };
  }

  private getGames(): Element[] {
    return Array.from<Element>(
      this.dom.window.document.querySelectorAll('[class*=GameSlot]'),
    ).filter((elem) => !elem.className.includes('GameSlots'));
  }

  private gamesInfoToText(): string {
    let text = '';
    for (const $slot of this.$games) {
      const title = this.getGameTitle($slot);
      const description = this.getGameDescription($slot);
      text += `*${title}*\n${description}\n\n`;
    }
    return this.formatSceneText(text);
  }

  private getGameChoices(): Choice[] {
    return this.$games.map((el) => ({
      text: this.getGameTitle(el),
      selector: getCSSSelector(el),
    }));
  }

  private getGameTitle($game: Element): string {
    return $game.getElementsByTagName('h3')[0].textContent;
  }

  private getGameDescription($game: Element): string {
    return $game.getElementsByTagName('p')?.[0]?.textContent || '';
  }

  private formatSceneText(text: string): string {
    return text.replace(/[#+\-=|{}.![\]()>`]/g, '\\$&');
  }
}

export class QSpiderGameParser {
  private $mainDock: Element;
  private $bottomDock: Element;
  private $leftDock: Element | null;
  private $rightDock: Element | null;

  constructor(private readonly dom: JSDOM) {}

  parse(): Scene {
    this.$mainDock = this.getMainDock();
    this.$bottomDock = this.getBottomDock();
    this.$leftDock = this.getLeftDock();
    this.$rightDock = this.getRightDock();
    const modalParser = new QSpiderModalParser(this.dom);
    const popupParser = new QSpiderPopupMenuParser(this.dom);

    if (modalParser.isModalWindowExist()) {
      return modalParser.parse();
    }

    if (popupParser.isPopupMenuExist()) {
      return popupParser.parse();
    }

    const media = this.getMediaByPriorityIfExist();
    const choices = this.getChoices();
    const text = this.getMainDockText();
    return {
      text,
      media,
      choices,
    };
  }

  private getMainDock(): Element {
    return this.dom.window.document.querySelector(
      '[class*=Panel-PanelWithBackground]',
    );
  }

  private getBottomDock(): Element {
    return this.dom.window.document.querySelector('[class*=BottomDock]');
  }

  private getLeftDock(): Element | undefined {
    return this.dom.window.document.querySelector('[class*=LeftDock]');
  }

  private getRightDock(): Element | undefined {
    return this.dom.window.document.querySelector('[class*=RightDock]');
  }

  private getChoices(): Choice[] {
    return [
      ...this.makeCommandChoices(),
      ...this.getChoicesFromBottomDock(),
      ...this.getChoicesFromRightDock(),
      // TODO: Get action buttons from popups
    ];
  }

  private makeCommandChoices(): Choice[] {
    const $links = this.$mainDock.querySelectorAll('a');
    return Array.from<Element>($links).map((el, idx) => {
      const command = `/_${++idx}`;
      el.textContent = `${command} ${el.textContent.trim()}`;
      return {
        text: command,
        selector: getCSSSelector(el),
      };
    });
  }

  private getChoicesFromBottomDock(): Choice[] {
    return this.actionButtonsToChoices(this.$bottomDock);
  }

  private getChoicesFromRightDock(): Choice[] {
    if (!this.$rightDock) return [];
    return this.actionButtonsToChoices(this.$rightDock);
  }

  private actionButtonsToChoices($container: Element): Choice[] {
    const $btns = $container.querySelectorAll('[class*=ActionButton]');
    return Array.from<Element>($btns).map((el) => ({
      text: el.textContent.trim(),
      selector: getCSSSelector(el),
    }));
  }

  private getMediaByPriorityIfExist(): Media | null {
    let media;
    if (this.$rightDock) media = extractMediaFromDom(this.$rightDock);
    if (!media) {
      media = this.getMainDockBackgroundMedia();
      media = extractMediaFromDom(this.$mainDock);
    }
    if (!media && this.$leftDock) media = extractMediaFromDom(this.$leftDock);
    return media;
  }

  private getMainDockBackgroundMedia(): Media | null {
    // TODO: Fix. Now JSDOM don't return all style values after using getComputedStyle
    const styleValue = this.dom.window.getComputedStyle(
      this.$mainDock,
    ).backgroundImage;
    if (!styleValue || styleValue === 'none') return;
    const url = styleValue.split('"')[1];
    return {
      kind: MediaKind.Photo,
      path: url,
    };
  }

  private getMainDockText(): string {
    this.formatMainDockText();
    return this.$mainDock.textContent;
  }

  private formatMainDockText(): void {
    this.$mainDock.innerHTML = this.$mainDock.innerHTML
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
    this.$mainDock.textContent = escapeTextForMarkup(
      this.$mainDock.textContent,
    );
  }
}

export class QSpiderModalParser {
  private $modalWindow: Element;

  constructor(private dom: JSDOM) {
    this.$modalWindow = this.getModalWindow();
  }

  isModalWindowExist(): boolean {
    return !!this.getModalWindow();
  }

  parse(): Scene {
    const text = this.getText();
    const choices = this.getChoicesOrClose();
    const media = this.getMedia();
    return {
      text,
      media,
      choices,
    };
  }

  private getModalWindow(): Element | null {
    return this.dom.window.document.querySelector('[class*=ModalContainer]');
  }

  private getTextInput(): Element | null {
    return this.$modalWindow.querySelector('[class*=TextInput]');
  }

  private getText(): string {
    const content = this.$modalWindow.querySelector(
      '.rcs-inner-container>div',
    ).textContent;
    return escapeTextForMarkup(content);
  }

  private getChoicesOrClose(): Choice[] {
    const customChoices = this.getChoices();
    if (!customChoices.length) {
      return [this.getCloseAsChoice()];
    }
    return customChoices;
  }

  private getChoices(): Choice[] {
    const $btns = this.$modalWindow.querySelectorAll('[class*=-Button]');
    return Array.from<Element>($btns).map((el) => ({
      text: el.textContent.trim(),
      selector: getCSSSelector(el),
    }));
  }

  private getCloseAsChoice(): Choice {
    const $closeBtn = this.$modalWindow.querySelector('[class*=-CloseButton ]');
    return {
      text: 'X',
      selector: getCSSSelector($closeBtn),
    };
  }

  private getMedia(): Media | null {
    return extractMediaFromDom(this.$modalWindow);
  }
}

export class QSpiderPopupMenuParser {
  private $popupMenu: Element;

  constructor(private dom: JSDOM) {
    this.$popupMenu = this.getPopupMenu();
  }
  isPopupMenuExist(): boolean {
    return !!this.getPopupMenu();
  }

  parse(): Scene {
    return {
      text: '',
      choices: [],
    };
  }

  private getPopupMenu(): Element | null {
    return this.dom.window.document.querySelector('[class*=MenuWrapper]');
  }
}