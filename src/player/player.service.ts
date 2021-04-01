import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import { Page } from 'puppeteer';

import { BrowserService } from '../browser/browser.service';
import { Choice } from '../common/interfaces/choice.interface';
import { Scene } from '../common/interfaces/scene.interface';
import { PARSER } from '../parsers/constants';
import { ParserStrategy } from '../parsers/interfaces/parser-strategy.interface';
import { CHOICE_NOT_EXIST } from './messages';

@Injectable()
export class PlayerService implements OnModuleInit {
  private scene: Scene;
  private page: Page;

  constructor(
    private readonly configService: ConfigService,
    private readonly browserService: BrowserService,
    @Inject(PARSER) private readonly parserStrategy: ParserStrategy,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.startSession();
    await this.parseScene();
  }

  getScene(): Scene {
    return this.scene;
  }

  async choose(text: string): Promise<void> {
    const choice = this.findChoiceByText(text);
    await this.page.click(choice.selector);
    await this.parseScene();
  }

  private findChoiceByText(text: string): Choice {
    const foundChoice = this.scene.choices.find(
      (choice) => choice.text === text,
    );

    if (!foundChoice) {
      throw new Error(CHOICE_NOT_EXIST(text));
    }

    return foundChoice;
  }

  private async startSession(): Promise<void> {
    const filePath = this.configService.get('QUEST_FILE_PATH');
    const fileUrl = `file:${path.resolve(filePath)}`;
    this.page = await this.browserService.openPage(fileUrl);
  }

  private async parseScene(): Promise<void> {
    const html = await this.page.evaluate(
      () => document.querySelector('*').outerHTML,
    );
    this.scene = this.parserStrategy.parse(html);
  }
}
