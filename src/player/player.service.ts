import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { BrowserService } from '../browser/browser.service';
import { ButtonChoice } from '../common/interfaces/button-choice.interface';
import { CommandChoice } from '../common/interfaces/command-choice.interface';
import { Scene } from '../common/interfaces/scene.interface';
import { PARSER } from '../parsers/constants';
import { ParserStrategy } from '../parsers/interfaces/parser-strategy.interface';
import { ButtonChoiceNotFoundException } from './exceptions/button-choice-not-found.exception';

@Injectable()
export class PlayerService implements OnModuleInit {
  private readonly localServerUrl = 'http://localhost:3000';
  private scene: Scene;

  constructor(
    @Inject(PARSER) private readonly parserStrategy: ParserStrategy,
    private readonly browserService: BrowserService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.browserService.start();
    await this.startNewSession();
    await this.parseScene();
  }

  async startNewSession(): Promise<void> {
    await this.browserService.openUrl(this.localServerUrl);
  }

  getScene(): Scene {
    return this.scene;
  }

  async chooseByButton(text: string): Promise<void> {
    const choice = this.findChoiceButton(text);
    await this.browserService.clickBySelector(choice.selector);
    await this.browserService.page.waitForSelector('[class*=MainFrame]');
    await this.parseScene();
  }

  private findChoiceButton(text: string): ButtonChoice {
    const foundChoice = this.scene.buttonChoices.find(
      (choice) => choice.text === text,
    );

    if (!foundChoice) {
      throw new ButtonChoiceNotFoundException(text);
    }

    return foundChoice;
  }

  async chooseByCommand(command: string): Promise<void> {
    const choice = this.findChoiceCommand(command);
    await this.browserService.clickBySelector(choice.selector);
    await this.parseScene();
  }

  private findChoiceCommand(command: string): CommandChoice {
    const foundChoice = this.scene.commandChoices.find(
      (choice) => choice.command === command,
    );

    if (!foundChoice) {
      throw new ButtonChoiceNotFoundException(command);
    }

    return foundChoice;
  }

  private async parseScene(): Promise<void> {
    const content = await this.browserService.getPageHtml();
    this.scene = this.parserStrategy.parse(content);
  }
}
