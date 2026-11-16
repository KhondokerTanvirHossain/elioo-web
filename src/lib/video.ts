// Finds a video's files in public/video at build time. Returns undefined when there is no video yet.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export interface VideoFiles { webm?: string; mp4?: string; poster?: string }

export function findVideo(name: string, root = join(process.cwd(), 'public', 'video')): VideoFiles | undefined {
  const has = (ext: string) => existsSync(join(root, `${name}.${ext}`));
  const v: VideoFiles = {
    webm: has('webm') ? `/video/${name}.webm` : undefined,
    mp4: has('mp4') ? `/video/${name}.mp4` : undefined,
    poster: has('jpg') ? `/video/${name}.jpg` : undefined,
  };
  return v.webm || v.mp4 ? v : undefined;
}
