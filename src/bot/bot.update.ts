import { Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  onStart(@Ctx() ctx: Context): Promise<void> {
    return this.botService.replyScene(ctx);
  }

  @Command('reset')
  onReset(): Promise<void> {
    // TODO
    return Promise.resolve();
  }

  @On('text')
  async onText(@Ctx() ctx: Context): Promise<void> {
    await this.botService.onButtonClick(ctx);
    return this.botService.replyScene(ctx);
  }
}
