import { Harlowe3Strategy } from './strategies/harlowe3.strategy';
import { QSpiderStrategy } from './strategies/qspider.strategy';

export const PARSER = 'Parser';
export const PARSER_STRATEGIES = {
  ['harlowe3']: Harlowe3Strategy,
  ['qspider']: QSpiderStrategy,
};
