import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { MediaKind } from '../common/enums/media-kind.enum';
import { PlayerService } from '../player/player.service';
import { UnsupportedMediaKindException } from './exceptions/unsupported-media-kind.exception';

@Injectable()
export class BotService {
  constructor(private readonly playerService: PlayerService) {}

  async handleUserText(ctx: Context): Promise<void> {
    const text = (ctx.message as any).text;
    const { commandChoices, buttonChoices } = this.playerService.getScene();

    const isButtonChoice = buttonChoices.find((choice) => choice.text === text);
    if (isButtonChoice) {
      return this.playerService.chooseByButton(text);
    }

    const isCommandChoice = commandChoices.find(
      (choice) => choice.command === text,
    );
    if (isCommandChoice) {
      return this.playerService.chooseByCommand(text);
    }

    // TODO: Custom text input
  }

  async reset(): Promise<void> {
    await this.playerService.startNewSession();
  }

  async replyScene(ctx: Context): Promise<void> {
    const scene = this.playerService.getScene();
    const extra: ExtraReplyMessage = {
      parse_mode: 'MarkdownV2',
    };

    if (!scene.buttonChoices.length) {
      extra.reply_markup = Markup.removeKeyboard().reply_markup;
    } else {
      const buttons = scene.buttonChoices.map((choice) =>
        Markup.button.text(choice.text),
      );
      extra.reply_markup = Markup.keyboard(buttons).reply_markup;
    }

    if (scene.media) {
      if (scene.media.kind === MediaKind.Photo) {
        await ctx.replyWithPhoto(
          {
            source: scene.media.path,
          },
          {
            caption: scene.text,
            ...extra,
          },
        );
        return;
      }

      if (scene.media.kind === MediaKind.Video) {
        await ctx.replyWithVideo(
          {
            source: scene.media.path,
          },
          {
            caption: scene.text,
            ...extra,
          },
        );
        return;
      }

      if (scene.media.kind === MediaKind.Audio) {
        await ctx.replyWithAudio(
          {
            source: scene.media.path,
          },
          {
            caption: scene.text,
            ...extra,
          },
        );
        return;
      }

      if (scene.media.kind === MediaKind.Gif) {
        await ctx.replyWithAnimation(
          {
            source: scene.media.path,
          },
          {
            caption: scene.text,
            ...extra,
          },
        );
        return;
      }

      throw new UnsupportedMediaKindException(scene.media.kind);
    }

    await ctx.reply(scene.text, extra);
  }
}
