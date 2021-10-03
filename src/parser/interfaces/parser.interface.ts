import { Scene } from '../../player/interfaces/scene.interface';

export interface Parser {
  parse(content: string): Scene;
}
