import { Scene } from '../../player/interfaces/scene.interface';

export interface ParserStrategy {
  name: string;
  anchor?: string;
  parse(content: string): Scene;
}
