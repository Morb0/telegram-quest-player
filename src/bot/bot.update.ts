import { Start, Update } from 'nestjs-telegraf';

import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  onStart(): void {}
}
