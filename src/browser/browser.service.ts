import { Injectable, OnModuleInit } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';

@Injectable()
export class BrowserService implements OnModuleInit {
  private browser: Browser;

  async onModuleInit(): Promise<void> {
    this.browser = await puppeteer.launch();
  }

  async openPage(url: string): Promise<Page> {
    const page = await this.browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    return page;
  }
}
