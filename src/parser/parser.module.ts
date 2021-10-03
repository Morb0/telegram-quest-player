import { Module } from '@nestjs/common';

import { parserProvider } from './providers';
import { StrategiesLoader } from './strategies-loader';

@Module({
  providers: [...StrategiesLoader.loadProviders(), parserProvider],
  exports: [parserProvider],
})
export class ParserModule {}
