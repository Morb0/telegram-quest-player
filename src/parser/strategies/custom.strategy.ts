import { Scene } from '../../player/interfaces/scene.interface';
import { ParserStrategy } from '../interfaces/parser-strategy.interface';

export default {
  name: 'custom',
  parse() {
    return new CustomStrategy().parse();
  },
} as ParserStrategy;

class CustomStrategy {
  parse(): Scene {
    return {
      text: 'Empty',
      choices: [],
    };
  }
}
