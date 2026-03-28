import { useMemo } from 'react';
import clsx from 'clsx';

interface Props {
  password: string;
}

export default function PasswordStrengthBar({ password }: Props) {
  const strength = useMemo(() => {
    let score = 0;
    if (password.length > 0 && password.length <= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    
    // Exactly 1 special character constraint
    const specialCharMatches = password.match(/[^A-Za-z0-9]/g);
    if (specialCharMatches && specialCharMatches.length === 1) score += 1;

    return score; // Max 5
  }, [password]);

  // We have 4 segments to render as per PRD "4-segment bar"
  // If score is 0, empty. Score 1 is 1 red. Score 2 is 2 amber. Score 3 is 3 amber. Score 4-5 is 4 green.
  const levels = useMemo(() => {
    if (strength === 0) return 0;
    if (strength <= 1) return 1;
    if (strength <= 3) return 2;
    if (strength === 4) return 3;
    return 4;
  }, [strength]);

  const getColor = (index: number) => {
    if (index >= levels) return 'bg-[var(--color-surface-highest)]';
    if (levels === 1) return 'bg-[var(--color-error)]';
    if (levels <= 3) return 'bg-[var(--color-warning)]';
    return 'bg-[var(--color-success)]';
  };

  return (
    <div className="flex gap-1 h-1.5 w-full my-2">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className={clsx('flex-1 rounded-full transition-colors duration-300', getColor(index))}
        />
      ))}
    </div>
  );
}
