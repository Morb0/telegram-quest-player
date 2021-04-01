import { Scene } from '../../common/interfaces/scene.interface';

export interface ParserStrategy {
  parse(content: string): Scene;
}
