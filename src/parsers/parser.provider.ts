import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PARSER, PARSER_STRATEGIES } from './constants';
import { UnsupportedStrategyException } from './exceptions/unsupported-strategy.exception';

export const ParserProvider: FactoryProvider = {
  provide: PARSER,
  useFactory: (config: ConfigService) => {
    const strategyName = config.get('PARSER_STRATEGY');
    const StrategyClass = PARSER_STRATEGIES[strategyName];
    if (!StrategyClass) {
      throw new UnsupportedStrategyException(strategyName);
    }

    return new StrategyClass();
  },
  inject: [ConfigService],
};
