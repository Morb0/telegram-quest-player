import { MediaKind } from '../enums/media-kind.enum';

export interface Media {
  kind: MediaKind;
  path: string;
}
