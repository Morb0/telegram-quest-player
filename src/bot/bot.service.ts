import { HttpService, Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import {
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
} from 'telegraf/typings/core/types/typegram';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { MediaKind } from '../common/enums/media-kind.enum';
import { PlayerService } from '../player/player.service';
import { UNSUPPORTED_MEDIA_KIND } from './messasges';

@Injectable()
export class BotService {
  constructor(
    private readonly playerService: PlayerService,
    private readonly http: HttpService,
  ) {}

  async replyScene(ctx: Context): Promise<void> {
    const scene = this.playerService.getScene();

    const extra: ExtraReplyMessage = {
      parse_mode: 'MarkdownV2',
    };

    if (!scene.choices.length) {
      extra.reply_markup = Markup.removeKeyboard().reply_markup;
    } else {
      const buttons = scene.choices.map((choice) =>
        Markup.button.text(choice.text),
      );
      extra.reply_markup = Markup.keyboard(buttons).reply_markup;
    }

    if (scene.media) {
      if (scene.media.kind === MediaKind.Photo) {
        await ctx.replyWithPhoto(scene.media.url, {
          caption: scene.text,
          ...extra,
        });
        return;
      }

      if (scene.media.kind === MediaKind.Video) {
        await ctx.replyWithVideo(scene.media.url, {
          caption: scene.text,
          ...extra,
        });
        return;
      }

      if (scene.media.kind === MediaKind.Audio) {
        await ctx.replyWithAudio(scene.media.url, {
          caption: scene.text,
          ...extra,
        });
        return;
      }

      if (scene.media.kind === MediaKind.Gif) {
        await ctx.replyWithAnimation(scene.media.url, {
          caption: scene.text,
          ...extra,
        });
        return;
      }

      throw new Error(UNSUPPORTED_MEDIA_KIND(scene.media.kind));
    }

    await ctx.reply(scene.text, extra);
  }

  async onButtonClick(ctx: Context): Promise<void> {
    await this.playerService.choose((ctx.message as any).text);
  }
}
