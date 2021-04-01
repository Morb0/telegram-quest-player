import { MediaKind } from '../enums/media-kind.enum';

export type Media = HttpMedia;

interface BaseMedia {
  kind: MediaKind;
}

interface HttpMedia extends BaseMedia {
  url: string;
}
