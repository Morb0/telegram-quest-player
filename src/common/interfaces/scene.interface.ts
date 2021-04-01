import { Choice } from './choice.interface';
import { Media } from './media.interface';

export interface Scene {
  text: string;
  media?: Media;
  choices: Choice[];
}
