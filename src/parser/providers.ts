import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { PARSER_STRATEGY_TOKEN, PARSER_TOKEN } from './constants';

export const parserProvider: Provider = {
  provide: PARSER_TOKEN,
  useFactory: (config: ConfigService, moduleRef: ModuleRef) => {
    const strategyName = config.get('PARSER_STRATEGY');
    return moduleRef.get(PARSER_STRATEGY_TOKEN(strategyName));
  },
  inject: [ConfigService, ModuleRef],
};
