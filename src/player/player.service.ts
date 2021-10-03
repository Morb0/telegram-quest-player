import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { BrowserService } from '../browser/browser.service';
import { PARSER_TOKEN } from '../parser/constants';
import { ParserStrategy } from '../parser/interfaces/parser-strategy.interface';
import { ActionType } from './enums/action-type.enum';
import { ActionNotFoundException } from './exceptions/action-not-found.exception';
import { Choice, Input } from './interfaces/action.interface';
import { Scene } from './interfaces/scene.interface';

@Injectable()
export class PlayerService implements OnModuleInit {
  private readonly localServerUrl = 'http://localhost:3000';
  private scene: Scene;

  constructor(
    private readonly browserService: BrowserService,
    @Inject(PARSER_TOKEN) private readonly parserStrategy: ParserStrategy,
  ) {}

  get currentScene(): Scene {
    return this.scene;
  }

  async onModuleInit(): Promise<void> {
    await this.browserService.start();
    await this.startNewSession();
    await this.parseScene();
  }

  async startNewSession(): Promise<void> {
    await this.browserService.openUrl(this.localServerUrl);
  }

  isChoiceExist(text: string): boolean {
    return Boolean(this.findChoice(text));
  }

  isInputExist(): boolean {
    return Boolean(this.findInput());
  }

  async choose(text: string): Promise<void> {
    const choice = this.findChoice(text);
    if (!choice) {
      throw new ActionNotFoundException();
    }

    await this.makeAction(() =>
      this.browserService.clickBySelector(choice.selector),
    );
  }

  async input(text: string): Promise<void> {
    const input = this.findInput();
    if (!input) {
      throw new ActionNotFoundException();
    }

    await this.makeAction(() =>
      this.browserService.setTextToInputBySelector(input.selector, text),
    );
  }

  private findChoice(text: string): Choice | undefined {
    return this.scene.actions.find(
      (action) => action.type === ActionType.Choice && action.text === text,
    ) as Choice;
  }

  private findInput(): Input | undefined {
    return this.scene.actions.find(
      (action) => action.type === ActionType.Input,
    ) as Input;
  }

  private async makeAction(actionFn: () => Promise<void>): Promise<void> {
    await actionFn();
    await this.waitAnchor();
    await this.parseScene();
  }

  private async waitAnchor(): Promise<void> {
    await this.browserService.page.waitForSelector(this.parserStrategy.anchor);
  }

  private async parseScene(): Promise<void> {
    const content = await this.browserService.getPageHtml();
    this.scene = this.parserStrategy.parse(content);
  }
}
