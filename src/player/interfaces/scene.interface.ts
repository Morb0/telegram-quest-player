import { Action } from './action.interface';
import { Media } from './media.interface';

export interface Scene {
  text: string;
  media?: Media;
  actions: Action[];
}
