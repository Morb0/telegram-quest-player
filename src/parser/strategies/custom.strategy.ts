import { Scene } from '../../common/interfaces/scene.interface';
import { ParserStrategy } from '../parser-strategy.abstract';

export class CustomStrategy extends ParserStrategy {
  constructor() {
    super('custom');
  }

  parse(content: string): Scene {
    console.log(content.length);
    return undefined;
  }
}
