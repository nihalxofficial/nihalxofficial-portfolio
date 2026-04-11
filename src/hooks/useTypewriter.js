import { useState, useEffect } from 'react';

const ROLES = [
  'Mern Stack Developer',
  'UI/UX Designer',
  'Full Stack Developer',
  'React Specialist',
  'Open Source Contributor',
];

/**
 * useTypewriter — returns the current string to display.
 * Cycles through ROLES, typing forward then deleting.
 */
export function useTypewriter() {
  const [displayed, setDisplayed] = useState('');
  const [roleIndex, setRoleIndex]  = useState(0);
  const [charIndex, setCharIndex]  = useState(0);
  const [deleting, setDeleting]    = useState(false);

  useEffect(() => {
    const word = ROLES[roleIndex];
    let delay;

    if (deleting) {
      // Remove one character at a time
      delay = 60;
      const timer = setTimeout(() => {
        setDisplayed(word.slice(0, charIndex - 1));
        setCharIndex((c) => c - 1);
        if (charIndex - 1 === 0) {
          setDeleting(false);
          setRoleIndex((r) => (r + 1) % ROLES.length);
        }
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // Type one character at a time
      delay = charIndex === word.length ? 1600 : 90; // pause at end
      const timer = setTimeout(() => {
        if (charIndex === word.length) {
          setDeleting(true);
        } else {
          setDisplayed(word.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [charIndex, deleting, roleIndex]);

  return displayed;
}
