import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BotModule } from './bot/bot.module';
import { BrowserModule } from './browser/browser.module';
import { PlayerModule } from './player/player.module';
import { ParsersModule } from './parsers/parsers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BotModule,
    BrowserModule,
    PlayerModule,
    ParsersModule,
  ],
})
export class AppModule {}
