import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRootAsync({
      useFactory: (config: ConfigService) => [
        {
          rootPath: config.get('GAME_DIR_PATH'),
          serveStaticOptions: {
            index: config.get('GAME_FILENAME'),
          },
        },
      ],
      inject: [ConfigService],
    }),
    BotModule,
  ],
})
export class AppModule {}
