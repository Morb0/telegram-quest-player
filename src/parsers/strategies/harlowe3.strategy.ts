import { JSDOM } from 'jsdom';

import { MediaKind } from '../../common/enums/media-kind.enum';
import { Choice } from '../../common/interfaces/choice.interface';
import { Media } from '../../common/interfaces/media.interface';
import { Scene } from '../../common/interfaces/scene.interface';
import { getCSSSelector } from '../../common/utils/css-selector.util';
import { ParserStrategy } from '../interfaces/parser-strategy.interface';

export class Harlowe3Strategy implements ParserStrategy {
  private $passage: Element;

  parse(content: string): Scene {
    const dom = new JSDOM(content);
    this.$passage = dom.window.document.querySelector('tw-passage');

    this.unwrapFromPassageTransitionContainerIfExist();
    const choices = this.getPassageActions();
    this.removePassageLinks();
    this.removePassageSidebar();
    const media = this.getMediaIfExist();
    const text = this.getPassageText();

    return {
      text,
      media,
      choices,
    };
  }

  private unwrapFromPassageTransitionContainerIfExist(): void {
    const foundContainer = this.$passage.querySelector(
      'tw-transition-container',
    );
    if (foundContainer) {
      foundContainer.replaceWith(...foundContainer.childNodes);
    }
  }

  private getPassageActions(): Choice[] {
    const $links = this.getPassageLinks();
    return $links.map((el) => ({
      text: el.textContent,
      selector: getCSSSelector(el),
    }));
  }

  private removePassageLinks(): void {
    this.getPassageLinks().forEach((el) => el.remove());
  }

  private getPassageLinks(): Element[] {
    return Array.from(this.$passage.querySelectorAll('tw-link').values());
  }

  private removePassageSidebar(): void {
    this.$passage.querySelector('tw-sidebar').remove();
  }

  private getMediaIfExist(): Media {
    const $img = this.$passage.querySelector('img');
    if ($img && $img.src.startsWith('http')) {
      if ($img.src.includes('.gif')) {
        return {
          kind: MediaKind.Gif,
          url: $img.src,
        };
      }

      return {
        kind: MediaKind.Photo,
        url: $img.src,
      };
    }

    const $video = this.$passage.querySelector('video');
    if ($video && $video.src.includes('.mp4')) {
      return {
        kind: MediaKind.Video,
        url: $video.src,
      };
    }

    const $audio = this.$passage.querySelector('audio');
    if ($audio) {
      return {
        kind: MediaKind.Audio,
        url: $audio.src,
      };
    }
  }

  private getPassageText(): string {
    this.$passage.innerHTML = this.$passage.innerHTML.replace(
      /<br\s*[\/]?>/gi,
      '\n',
    );
    return this.$passage.textContent;
  }
}
