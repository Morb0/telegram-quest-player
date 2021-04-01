import { Module } from '@nestjs/common';

import { parserProvider } from './parser.provider';

@Module({
  providers: [parserProvider],
  exports: [parserProvider],
})
export class ParsersModule {}
