import { Command, Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

import { TelegramService } from './telegram.service';

@Update()
export class TelegramUpdate {
  constructor(private readonly botService: TelegramService) {}

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void> {
    await this.botService.replyScene(ctx);
  }

  @Command('reset')
  async onResetCommand(@Ctx() ctx: Context): Promise<void> {
    await this.botService.reset();
    await this.botService.replyScene(ctx);
  }

  @On('text')
  async onText(@Ctx() ctx: Context): Promise<void> {
    await this.botService.handleUserText(ctx);
    await this.botService.replyScene(ctx);
  }
}
