import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { MediaKind } from '../common/enums/media-kind.enum';
import { PlayerService } from '../player/player.service';
import { UnsupportedMediaKindException } from './exceptions/unsupported-media-kind.exception';
import { chunkString } from './utils/chunk-string.util';

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
    const MAX_MESSAGE_LENGTH = 4096;
    const MAX_MESSAGE_WITH_CAPTION_LENGTH = 1024;
    const scene = this.playerService.getScene();
    const chunkSize = scene.media
      ? MAX_MESSAGE_WITH_CAPTION_LENGTH
      : MAX_MESSAGE_LENGTH;
    const sceneText = scene.text === '' ? '\\-' : scene.text;
    const [text, ...otherText] = chunkString(sceneText, chunkSize);
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

    if (!scene.media) {
      await ctx.reply(text, extra);
    } else {
      if (scene.media.kind === MediaKind.Photo) {
        await ctx.replyWithPhoto(
          {
            source: scene.media.path,
          },
          {
            caption: text,
            ...extra,
          },
        );
        return;
      } else if (scene.media.kind === MediaKind.Video) {
        await ctx.replyWithVideo(
          {
            source: scene.media.path,
          },
          {
            caption: text,
            ...extra,
          },
        );
        return;
      } else if (scene.media.kind === MediaKind.Audio) {
        await ctx.replyWithAudio(
          {
            source: scene.media.path,
          },
          {
            caption: text,
            ...extra,
          },
        );
        return;
      } else if (scene.media.kind === MediaKind.Gif) {
        await ctx.replyWithAnimation(
          {
            source: scene.media.path,
          },
          {
            caption: text,
            ...extra,
          },
        );
      } else {
        throw new UnsupportedMediaKindException(scene.media.kind);
      }
    }

    for (const text of otherText) {
      await ctx.reply(text);
    }
  }
}
