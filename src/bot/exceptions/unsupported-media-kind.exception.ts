export class UnsupportedMediaKindException extends Error {
  constructor(kind: string) {
    super(`Unsupported "${kind}" media kind.`);
  }
}
