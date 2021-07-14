import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';

import { PlayerModule } from '../player/player.module';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';

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
  providers: [BotUpdate, BotService],
})
export class BotModule {}
