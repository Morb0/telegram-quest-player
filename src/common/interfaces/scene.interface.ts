import { ButtonChoice } from './button-choice.interface';
import { CommandChoice } from './command-choice.interface';
import { Media } from './media.interface';

export interface Scene {
  text: string;
  media?: Media;
  commandChoices: CommandChoice[];
  buttonChoices: ButtonChoice[];
}
