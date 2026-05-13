import fs from 'node:fs';
import path from 'node:path';

const IMAGE_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg'] as const;

function publicFileExists(publicRelativePath: string) {
  const clean = publicRelativePath.replace(/^\/+/, '');
  const absolute = path.join(process.cwd(), 'public', clean);
  return fs.existsSync(absolute);
}

/**
 * Resolve an image URL with "override if exists" behavior.
 *
 * `overrideBasePath` should NOT include the extension (e.g. "/images/custom/restaurants/dodo/cover").
 * We'll try common extensions in order and return the first that exists in /public.
 *
 * If nothing exists - return `fallback` unchanged.
 */
export function resolveImageWithFallback(opts: {
  overrideBasePath: string;
  fallback: string | null | undefined;
}): string | null | undefined {
  const base = opts.overrideBasePath.startsWith('/')
    ? opts.overrideBasePath
    : `/${opts.overrideBasePath}`;

  for (const ext of IMAGE_EXTENSIONS) {
    const candidate = `${base}${ext}`;
    if (publicFileExists(candidate)) return candidate;
  }

  return opts.fallback;
}

