import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { BotModule } from './bot/bot.module';
import { BrowserModule } from './browser/browser.module';
import { ParsersModule } from './parsers/parsers.module';
import { PlayerModule } from './player/player.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BotModule,
    PlayerModule,
    BrowserModule,
    ParsersModule,
  ],
})
export class AppModule {}
