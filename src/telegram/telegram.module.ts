import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';

import { PlayerModule } from '../player/player.module';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        token: config.get('TELEGRAM_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    PlayerModule,
  ],
  providers: [TelegramUpdate, TelegramService],
})
export class TelegramModule {}
