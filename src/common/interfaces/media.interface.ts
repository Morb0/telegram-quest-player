export type Media = Photo | Video | Gif | Audio;

interface BaseMedia {
  kind: string;
}

interface HttpMedia extends BaseMedia {
  url: string;
}

interface Photo extends HttpMedia {
  kind: 'photo';
}

interface Video extends HttpMedia {
  kind: 'video';
}

interface Gif extends HttpMedia {
  kind: 'gif';
}

interface Audio extends HttpMedia {
  kind: 'audio';
}
