import React from 'react';

interface LogoProps {
  /** Sizing classes. Applied to both variants so the box is identical either way. */
  className?: string;
  /** Empty (decorative) by default — the header already has the wordmark beside it. */
  alt?: string;
}

const IMG_CLASS = 'object-contain';

/**
 * The brand mark, in the variant that suits the active theme.
 *
 * Both files are rendered and Tailwind's `dark:` variant picks one, rather than swapping a
 * `src` from the `darkMode` boolean. Two reasons, and neither is stylistic:
 *
 *  1. `AuthScreen` never receives `darkMode` — it renders before `ShellProps` exists in
 *     `App.tsx`. Classes need nothing threaded through the signed-out tree.
 *  2. Dark mode here is a `.dark` class on `documentElement` backed by localStorage, so a
 *     `<picture>` / `prefers-color-scheme` swap would follow the OS and desync from the
 *     header toggle the moment a user overrides it.
 *
 * The inactive variant is `display:none`, and both are ~24 KB, so there is no flash on
 * toggle — the browser has already decoded them.
 */
const Logo: React.FC<LogoProps> = ({ className = '', alt = '' }) => (
  <>
    <img src="/medlab-light.png" alt={alt} className={`${IMG_CLASS} block dark:hidden ${className}`} />
    <img src="/medlab-dark.png" alt={alt} className={`${IMG_CLASS} hidden dark:block ${className}`} />
  </>
);

export default Logo;
