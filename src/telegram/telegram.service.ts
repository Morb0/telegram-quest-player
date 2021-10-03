import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

import { ActionType } from '../player/enums/action-type.enum';
import { MediaKind } from '../player/enums/media-kind.enum';
import { Choice } from '../player/interfaces/action.interface';
import { PlayerService } from '../player/player.service';
import { UnsupportedMediaKindException } from './exceptions/unsupported-media-kind.exception';
import { chunkString } from './utils/chunk-string.util';

@Injectable()
export class TelegramService {
  constructor(private readonly playerService: PlayerService) {}

  async handleUserText(ctx: Context): Promise<void> {
    try {
      const text = (ctx.message as any).text;

      if (!this.playerService.currentScene) {
        return;
      }

      if (this.playerService.isChoiceExist(text)) {
        await this.playerService.choose(text);
        await this.replyScene(ctx);
        return;
      }

      if (this.playerService.isInputExist()) {
        await this.playerService.input(text);
        await ctx.reply(`✏️ You entered: ${text}`);
        return;
      }

      await ctx.reply(
        '⚠️ Failed to found action. May be you do something wrong?',
      );
    } catch (e) {
      await ctx.reply(`❌ Some bad occurred - ${e.message}`);
    }
  }

  async reset(ctx: Context): Promise<void> {
    await this.playerService.startNewSession();
    await this.replyScene(ctx);
  }

  async replyScene(ctx: Context): Promise<void> {
    const MAX_MESSAGE_LENGTH = 4096;
    const MAX_MESSAGE_WITH_CAPTION_LENGTH = 1024;
    const scene = this.playerService.currentScene;
    if (!scene) {
      await ctx.reply('⌛ Game loading...');
      return;
    }

    const chunkSize = scene?.media
      ? MAX_MESSAGE_WITH_CAPTION_LENGTH
      : MAX_MESSAGE_LENGTH;
    const sceneText = scene.text === '' ? '\\-' : scene.text;
    const [text, ...otherText] = chunkString(sceneText, chunkSize);
    const extra: ExtraReplyMessage = {
      parse_mode: 'MarkdownV2',
    };

    if (!scene.actions.length) {
      extra.reply_markup = Markup.removeKeyboard().reply_markup;
    } else {
      const buttons = scene.actions
        .filter((action) => action.type === ActionType.Choice)
        .filter((choice: Choice) => !choice.text.startsWith('/_'))
        .map((choice: Choice) => Markup.button.text(choice.text));
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
