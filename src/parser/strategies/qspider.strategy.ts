import { JSDOM } from 'jsdom';

import { ActionType } from '../../player/enums/action-type.enum';
import { MediaKind } from '../../player/enums/media-kind.enum';
import { Action, Choice } from '../../player/interfaces/action.interface';
import { Media } from '../../player/interfaces/media.interface';
import { Scene } from '../../player/interfaces/scene.interface';
import { ParserStrategy } from '../interfaces/parser-strategy.interface';
import { getCSSSelector } from '../utils/css-selector.util';
import { extractMediaFromDom } from '../utils/dom-media-extractor.util';
import { makeInTextCommand } from '../utils/in-text-command.util';
import {
  convertHtmlToMarkup,
  escapeElementTextForMarkup,
  escapeTextForMarkup,
} from '../utils/markup-escape.util';

export default {
  name: 'qspider',
  anchor: '[class*=e1csenz80]',
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
      this.dom.window.document.querySelectorAll('[class*=e1as4avk2]').length > 0
    );
  }

  parse(): Scene {
    this.$games = this.getGames();
    const text = this.gamesInfoToText();
    const choices = this.getGameChoices();
    return {
      text,
      actions: choices,
    };
  }

  private getGames(): Element[] {
    return Array.from<Element>(
      this.dom.window.document.querySelectorAll('[class*=e1as4avk2]'),
    );
  }

  private gamesInfoToText(): string {
    let text = '';
    for (const $slot of this.$games) {
      const title = this.getGameTitle($slot);
      const description = this.getGameDescription($slot);
      text += `*${title}*\n${description}\n\n`;
    }
    return escapeTextForMarkup(text);
  }

  private getGameChoices(): Choice[] {
    return this.$games.map((el) => ({
      type: ActionType.Choice,
      text: this.getGameTitle(el),
      selector: getCSSSelector(el),
    }));
  }

  private getGameTitle($game: Element): string {
    return $game.getElementsByTagName('h3')[0].textContent.trim();
  }

  private getGameDescription($game: Element): string {
    return $game.getElementsByTagName('p')?.[0]?.textContent.trim() || '';
  }
}

export class QSpiderGameParser {
  private $mainDock: Element;
  private $bottomDock: Element;
  private $bottomRightDock: Element | null;
  private $leftDock: Element | null;
  private $rightDock: Element | null;

  constructor(private readonly dom: JSDOM) {}

  parse(): Scene {
    this.$mainDock = this.getMainDock();
    this.$bottomDock = this.getBottomDock();
    this.$bottomRightDock = this.getBottomRightDock();
    this.$leftDock = this.getLeftDock();
    this.$rightDock = this.getRightDock();
    const modalParser = new QSpiderModalParser(this.dom);

    if (modalParser.isModalWindowExist()) {
      return modalParser.parse();
    }

    this.escapeTextInDocks();

    const media = this.getMediaByPriorityIfExist();
    const choices = this.getChoices();
    let text = this.getMainDockText();
    if (this.getBottomRightDockerText() !== '') {
      text += `\n${escapeTextForMarkup('------- Menu -------')}\n\n`;
      text += this.getBottomRightDockerText();
    }
    return {
      text,
      media,
      actions: choices,
    };
  }

  private getMainDock(): Element {
    return this.dom.window.document.querySelector('[class*=e1by9dh71]');
  }

  private getBottomDock(): Element {
    return this.dom.window.document.querySelector(
      '[class*=e12qeq3o1-container]',
    );
  }

  private getBottomRightDock(): Element {
    return this.dom.window.document.querySelector(
      '[class*=e12qeq3o1-container] [class*=eo7xiku0]:nth-child(2)',
    );
  }

  private getLeftDock(): Element | undefined {
    return this.dom.window.document.querySelector(
      '[class*=e12qeq3o2-container]',
    );
  }

  private getRightDock(): Element | undefined {
    return this.dom.window.document.querySelector(
      '[class*=e12qeq3o3-container]',
    );
  }

  private getChoices(): Choice[] {
    const choices: Choice[] = [];
    const commandChoices = this.makeCommandChoices();
    const mainChoices = this.getChoicesFromBottomDock();
    const otherChoices = this.getChoicesFromRightDock();
    const popupChoices = this.getPopupChoices();

    choices.push(...commandChoices, ...mainChoices);
    if (otherChoices.length > 0) {
      choices.push(this.getSeparatorChoice('Menu'));
    }
    choices.push(...otherChoices);
    if (popupChoices.length > 0) {
      choices.push(this.getSeparatorChoice('Popup'));
    }
    choices.push(...popupChoices);

    return choices;
  }

  private getSeparatorChoice(label: string): Choice {
    return {
      type: ActionType.Choice,
      text: `------------ ${label} ------------`,
      selector: 'body',
    };
  }

  private makeCommandChoices(): Choice[] {
    const $links = this.$mainDock.querySelectorAll('a');
    return Array.from<Element>($links).map((el, idx) => {
      const command = makeInTextCommand(idx);
      el.textContent = `${command} ${el.textContent.trim()}`;
      return {
        type: ActionType.Choice,
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
    const $btns = $container.querySelectorAll('[class*=egqqxmy0]');
    return Array.from<Element>($btns).map((el) => ({
      type: ActionType.Choice,
      text: el.textContent.trim(),
      selector: getCSSSelector(el),
    }));
  }

  private getPopupChoices(): Choice[] {
    const popupParser = new QSpiderPopupMenuParser(this.dom);
    if (!popupParser.isPopupMenuExist()) {
      return [];
    }

    return popupParser.getChoices();
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

  private escapeTextInDocks(): void {
    escapeElementTextForMarkup(this.$mainDock);
    if (this.$bottomRightDock) {
      escapeElementTextForMarkup(this.$bottomRightDock);
    }
  }

  private getMainDockText(): string {
    this.$mainDock.innerHTML = convertHtmlToMarkup(this.$mainDock.innerHTML);
    return this.$mainDock.textContent.trim();
  }

  private getBottomRightDockerText(): string {
    if (!this.$bottomRightDock) return '';
    this.$bottomRightDock.innerHTML = convertHtmlToMarkup(
      this.$bottomRightDock.innerHTML,
    );
    return this.$bottomRightDock.textContent.trim();
  }
}

export class QSpiderModalParser {
  private $modalWindow: Element;

  constructor(private dom: JSDOM) {
    this.$modalWindow = this.getModalWindow();
  }

  isModalWindowExist(): boolean {
    return !!this.$modalWindow;
  }

  parse(): Scene {
    const text = this.getText();
    const actions = this.getActions();
    const media = this.getMedia();

    return {
      text,
      media,
      actions,
    };
  }

  private getModalWindow(): Element | null {
    return this.dom.window.document.querySelector('[class*=e12ysyus4]');
  }

  private getText(): string {
    const TEXT_NODE = 3;
    let content = '';
    // NOTE: Take only text notes without nested
    const $container =
      this.$modalWindow.querySelector('form') ??
      this.$modalWindow.querySelector('.os-content');
    $container.childNodes.forEach((value) => {
      if (value.nodeType === TEXT_NODE) {
        content += value.nodeValue;
      }
    });
    return escapeTextForMarkup(content);
  }

  private getActions(): Action[] {
    const actions = [];

    const $input = this.getTextInput();
    if ($input) {
      actions.push({
        type: ActionType.Input,
        selector: getCSSSelector($input),
      });
    }

    actions.push(...this.getChoicesOrClose());

    return actions;
  }

  private getTextInput(): Element | null {
    return this.$modalWindow.querySelector('[class*=epa50c20]');
  }

  private getChoicesOrClose(): Choice[] {
    const customChoices = this.getChoices();
    if (!customChoices.length) {
      return [this.getCloseAsChoice()];
    }
    return customChoices;
  }

  private getChoices(): Choice[] {
    const $btns = this.$modalWindow.querySelectorAll('[class*=e19hjue90]');
    return Array.from<Element>($btns).map((el) => ({
      type: ActionType.Choice,
      text: el.textContent.trim(),
      selector: getCSSSelector(el),
    }));
  }

  private getCloseAsChoice(): Choice {
    const $closeBtn = this.$modalWindow.querySelector('[class*=e12ysyus1]');
    return {
      type: ActionType.Choice,
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

  getChoices(): Choice[] {
    const $btns = this.$popupMenu.querySelectorAll('button');
    return Array.from<Element>($btns).map((el) => ({
      type: ActionType.Choice,
      text: el.textContent.trim(),
      selector: getCSSSelector(el),
    }));
  }

  private getPopupMenu(): Element | null {
    return this.dom.window.document.querySelector('[class*=e1d5449f0]');
  }
}
