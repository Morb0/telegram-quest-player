import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';

import { BotService } from './bot.service';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        token: config.get('TELEGRAM_TOKEN'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BotService],
})
export class BotModule {}
