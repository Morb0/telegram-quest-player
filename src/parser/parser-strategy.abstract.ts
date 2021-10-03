import { Scene } from '../common/interfaces/scene.interface';

export abstract class ParserStrategy {
  private readonly _name: string;

  protected constructor(name: string) {
    if (!name) {
      throw new Error('Strategy must call parent constructor and pass name');
    }

    this._name = name;
  }

  get name(): string {
    return this._name;
  }

  abstract parse(content: string): Scene;
}
