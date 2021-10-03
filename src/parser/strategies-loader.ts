import { Provider } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { PARSER_STRATEGY_TOKEN } from './constants';
import { ParserStrategy } from './interfaces/parser-strategy.interface';

export class StrategiesLoader {
  static loadProviders(): Provider[] {
    const paths = this.getStrategiesPaths();
    const providers: Provider[] = [];

    for (const path of paths) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const streategy: unknown = require(path)?.default;
      if (!streategy) {
        throw new Error(
          `Failed to load ${path} strategy. May be file have no default export?`,
        );
      }

      if (!this.isParserStrategy(streategy)) {
        throw new Error(
          `Failed to load ${path} strategy. File export object have invalid signature`,
        );
      }

      providers.push({
        provide: PARSER_STRATEGY_TOKEN(streategy.name),
        useValue: streategy,
      });
    }

    return providers;
  }

  private static isParserStrategy(obj: any): obj is ParserStrategy {
    return (
      obj?.name !== undefined &&
      obj?.parse !== undefined &&
      typeof obj.parse === 'function'
    );
  }

  private static getStrategiesPaths(): string[] {
    const dirPath = path.resolve(__dirname, 'strategies');
    const fileNames = fs.readdirSync(dirPath);
    const jsFileNames = fileNames.filter((fileName) =>
      fileName.endsWith('.js'),
    );
    return jsFileNames.map((fileName) => path.join(dirPath, fileName));
  }
}
