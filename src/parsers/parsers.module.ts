import { Module } from '@nestjs/common';

import { ParserProvider } from './parser.provider';

@Module({
  providers: [ParserProvider],
  exports: [ParserProvider],
})
export class ParsersModule {}
