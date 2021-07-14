import * as path from 'path';

import { MediaKind } from '../../common/enums/media-kind.enum';
import { Media } from '../../common/interfaces/media.interface';

export function extractMediaFromDom($el: Element): Media | null {
  const $img = $el.querySelector('img');
  if ($img) {
    if ($img.src.includes('.gif')) {
      return {
        kind: MediaKind.Gif,
        path: resolveUrlAbsolutePath($img.src),
      };
    }

    return {
      kind: MediaKind.Photo,
      path: resolveUrlAbsolutePath($img.src),
    };
  }

  const $video = $el.querySelector('video');
  if ($video && $video.src.startsWith('http') && $video.src.includes('.mp4')) {
    return {
      kind: MediaKind.Video,
      path: resolveUrlAbsolutePath($video.src),
    };
  }

  const $audio = $el.querySelector('audio');
  if ($audio && $audio.src.startsWith('http')) {
    return {
      kind: MediaKind.Audio,
      path: resolveUrlAbsolutePath($audio.src),
    };
  }
}

function resolveUrlAbsolutePath(src: string): string {
  const gameDir = process.env.GAME_DIR_PATH;
  if (path.isAbsolute(gameDir)) {
    return path.join(gameDir, src);
  } else {
    return path.join(process.cwd(), process.env.GAME_DIR_PATH, src);
  }
}
