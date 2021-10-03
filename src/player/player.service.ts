import { Injectable, OnModuleInit } from '@nestjs/common';

import { BrowserService } from '../browser/browser.service';
import { Choice } from '../common/interfaces/choice.interface';
import { Scene } from '../common/interfaces/scene.interface';
import { ParserService } from '../parser/parser.service';
import { ButtonChoiceNotFoundException } from './exceptions/button-choice-not-found.exception';

@Injectable()
export class PlayerService implements OnModuleInit {
  private readonly localServerUrl = 'http://localhost:3000';
  private scene: Scene;

  constructor(
    private readonly browserService: BrowserService,
    private readonly parserService: ParserService,
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

  async choose(text: string): Promise<void> {
    const choice = this.findChoice(text);
    if (!choice) {
      throw new ButtonChoiceNotFoundException(text);
    }

    await this.browserService.clickBySelector(choice.selector);
    await this.browserService.page.waitForSelector('[class*=MainFrame]'); // REMOVE THIS! And make system for anchors
    await this.parseScene();
  }

  private findChoice(text: string): Choice | undefined {
    return this.scene.choices.find((choice) => choice.text === text);
  }

  private async parseScene(): Promise<void> {
    const content = await this.browserService.getPageHtml();
    this.scene = this.parserService.parse(content);
  }
}
