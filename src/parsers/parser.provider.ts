import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PARSER } from './constants';
import { ParserStrategy } from './interfaces/parser-strategy.interface';
import { UNSUPPORTED_FORMAT } from './messages';
import { Harlowe3Strategy } from './strategies/harlowe3.strategy';

function parserFactory(format: string): ParserStrategy {
  switch (format) {
    case 'harlowe3':
      return new Harlowe3Strategy();
    default:
      throw new Error(UNSUPPORTED_FORMAT(format));
  }
}

export const parserProvider: Provider = {
  provide: PARSER,
  useFactory: (config: ConfigService) =>
    parserFactory(config.get('QUEST_FORMAT')),
  inject: [ConfigService],
};
