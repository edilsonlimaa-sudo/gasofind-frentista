import { twMerge } from 'tailwind-merge';

/** Combines class names, resolving Tailwind conflicts with tailwind-merge. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return twMerge(classes.filter(Boolean).join(' '));
}
