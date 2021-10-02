import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BrowserModule } from './browser/browser.module';
import { ParsersModule } from './parsers/parsers.module';
import { PlayerModule } from './player/player.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegramModule,
    PlayerModule,
    BrowserModule,
    ParsersModule,
  ],
})
export class AppModule {}
