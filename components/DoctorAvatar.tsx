import React, { useState } from 'react';

interface DoctorAvatarProps {
  name: string;
  photoUrl: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 'w-10 h-10 text-xs',
  md: 'w-14 h-14 text-sm',
  lg: 'w-20 h-20 text-lg',
} as const;

/** "Dr. Ana Ximenes" → "AX". Strips the title so initials aren't always "DR". */
const initials = (name: string): string =>
  name
    .replace(/^(Dr\.?|Mid\.?|Prof\.?)\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();

/**
 * photoUrl is nullable and rendered in half a dozen places, so the initials fallback lives
 * here once rather than being re-implemented at every call site. Also handles a URL that
 * 404s at runtime — seeded photos point at an external host.
 */
const DoctorAvatar: React.FC<DoctorAvatarProps> = ({ name, photoUrl, size = 'md' }) => {
  const [broken, setBroken] = useState(false);
  const box = `${SIZES[size]} rounded-2xl flex-shrink-0 object-cover`;

  if (!photoUrl || broken) {
    return (
      <div className={`${box} bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center font-black text-blue-600 dark:text-blue-300`}>
        {initials(name)}
      </div>
    );
  }

  return <img src={photoUrl} alt={name} className={box} onError={() => setBroken(true)} />;
};

export default DoctorAvatar;
