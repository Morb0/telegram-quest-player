import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BrowserModule } from './browser/browser.module';
import { ParserModule } from './parser/parser.module';
import { PlayerModule } from './player/player.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BrowserModule,
    ParserModule,
    PlayerModule,
    TelegramModule,
  ],
})
export class AppModule {}
