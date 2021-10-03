import { Scene } from '../../player/interfaces/scene.interface';

export interface ParserStrategy {
  name: string;
  parse(content: string): Scene;
}
