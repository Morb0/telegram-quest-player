import { Module } from '@nestjs/common';

import { BrowserModule } from '../browser/browser.module';
import { ParsersModule } from '../parsers/parsers.module';
import { PlayerService } from './player.service';

@Module({
  imports: [BrowserModule, ParsersModule],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
