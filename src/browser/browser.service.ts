import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class BrowserService {
  private browser: puppeteer.Browser;
  page: puppeteer.Page;

  async start(): Promise<void> {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
  }

  async openUrl(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'networkidle0' });
  }

  async clickBySelector(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  async getPageHtml(): Promise<string> {
    return this.page.evaluate(() => document.querySelector('*').outerHTML);
  }
}
