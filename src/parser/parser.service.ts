import { Injectable } from '@nestjs/common';

import { Scene } from '../common/interfaces/scene.interface';

@Injectable()
export class ParserService {
  parse(content: string): Scene {
    return {
      text: 'mock',
      choices: [],
    };
  }
}
