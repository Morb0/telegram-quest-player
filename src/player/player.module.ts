import { Module } from '@nestjs/common';

import { BrowserModule } from '../browser/browser.module';
import { ParserModule } from '../parser/parser.module';
import { PlayerService } from './player.service';

@Module({
  imports: [BrowserModule, ParserModule],
  providers: [PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
