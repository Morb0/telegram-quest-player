import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import {
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from 'telegraf/typings/core/types/typegram';

import { PlayerService } from '../player/player.service';

@Injectable()
export class BotService {
  constructor(private readonly playerService: PlayerService) {}

  async replyScene(ctx: Context): Promise<void> {
    const scene = this.playerService.getScene();

    let markup: ReplyKeyboardMarkup | ReplyKeyboardRemove;
    if (!scene.choices.length) {
      markup = Markup.removeKeyboard().reply_markup;
    } else {
      const buttons = scene.choices.map((choice) =>
        Markup.button.text(choice.text),
      );
      markup = Markup.keyboard(buttons).reply_markup;
    }

    await ctx.reply(scene.text, {
      reply_markup: markup,
    });
  }

  async onButtonClick(ctx: Context): Promise<void> {
    await this.playerService.choose((ctx.message as any).text);
  }
}
