import { cn } from '@/lib/utils';

interface IllustrationProps {
  className?: string;
}

export function AuthIllustration({ className }: IllustrationProps) {
  return (
    <svg
      className={cn('text-brand/20', className)}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="200" cy="200" r="180" className="fill-brand/5" />
      <circle cx="200" cy="200" r="120" className="fill-brand/10" />
      <circle cx="200" cy="200" r="60" className="fill-brand/20" />
      <circle cx="200" cy="80" r="8" className="fill-brand/40" />
      <circle cx="320" cy="160" r="6" className="fill-brand-secondary/40" />
      <circle cx="320" cy="240" r="6" className="fill-brand-secondary/40" />
      <circle cx="200" cy="320" r="8" className="fill-brand/40" />
      <circle cx="80" cy="240" r="6" className="fill-brand-secondary/40" />
      <circle cx="80" cy="160" r="6" className="fill-brand-secondary/40" />
      <circle cx="200" cy="200" r="12" className="fill-brand/60" />
      <path
        d="M200 80 L320 160 L320 240 L200 320 L80 240 L80 160 Z"
        className="stroke-brand/20"
        strokeWidth="1"
      />
      <path
        d="M200 80 L200 320"
        className="stroke-brand-secondary/15"
        strokeWidth="1"
      />
      <path
        d="M320 160 L80 160"
        className="stroke-brand-secondary/15"
        strokeWidth="1"
      />
      <path
        d="M320 240 L80 240"
        className="stroke-brand-secondary/15"
        strokeWidth="1"
      />
    </svg>
  );
}

export function EmptyProjectIllustration({ className }: IllustrationProps) {
  return (
    <svg
      className={cn('', className)}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="20" y="30" width="80" height="70" rx="8" className="fill-brand/10 stroke-brand/30" strokeWidth="1.5" />
      <path d="M20 50h80" className="stroke-brand/20" strokeWidth="1.5" />
      <circle cx="35" cy="42" r="3" className="fill-brand/40" />
      <circle cx="45" cy="42" r="3" className="fill-brand/40" />
      <circle cx="55" cy="42" r="3" className="fill-brand/40" />
      <rect x="35" y="65" width="50" height="4" rx="2" className="fill-brand/20" />
      <rect x="35" y="75" width="40" height="4" rx="2" className="fill-brand/15" />
      <rect x="35" y="85" width="30" height="4" rx="2" className="fill-brand/10" />
      <path d="M85 20l10 10-10 10" className="stroke-success/50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="90" cy="25" r="12" className="fill-success/10 stroke-success/40" strokeWidth="1.5" />
    </svg>
  );
}

export function EmptySpecIllustration({ className }: IllustrationProps) {
  return (
    <svg
      className={cn('', className)}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="25" y="15" width="70" height="90" rx="6" className="fill-brand/10 stroke-brand/30" strokeWidth="1.5" />
      <rect x="35" y="30" width="50" height="4" rx="2" className="fill-brand/25" />
      <rect x="35" y="42" width="40" height="4" rx="2" className="fill-brand/15" />
      <rect x="35" y="54" width="45" height="4" rx="2" className="fill-brand/20" />
      <rect x="35" y="66" width="35" height="4" rx="2" className="fill-brand/15" />
      <rect x="35" y="78" width="42" height="4" rx="2" className="fill-brand/10" />
      <circle cx="90" cy="35" r="10" className="fill-brand-secondary/10 stroke-brand-secondary/40" strokeWidth="1.5" />
      <path d="M86 35h8M90 31v8" className="stroke-brand-secondary/50" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyActivityIllustration({ className }: IllustrationProps) {
  return (
    <svg
      className={cn('', className)}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="20" y="80" width="80" height="4" rx="2" className="fill-brand/20" />
      <rect x="40" y="60" width="12" height="24" rx="2" className="fill-brand/30" />
      <rect x="56" y="40" width="12" height="44" rx="2" className="fill-brand-secondary/30" />
      <rect x="72" y="50" width="12" height="34" rx="2" className="fill-brand/30" />
      <circle cx="46" cy="54" r="4" className="fill-brand/40" />
      <circle cx="62" cy="34" r="4" className="fill-brand-secondary/40" />
      <circle cx="78" cy="44" r="4" className="fill-brand/40" />
      <path d="M46 54l16-20l16 10" className="stroke-success/40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeroDecoration({ className }: IllustrationProps) {
  return (
    <svg
      className={cn('', className)}
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="400" cy="300" r="280" className="fill-brand/5" />
      <circle cx="400" cy="300" r="200" className="fill-brand/8" />
      <circle cx="400" cy="300" r="120" className="fill-brand-secondary/10" />
      <circle cx="400" cy="300" r="50" className="fill-brand/15" />

      <circle cx="400" cy="60" r="6" className="fill-brand/30" />
      <circle cx="600" cy="140" r="4" className="fill-brand-secondary/30" />
      <circle cx="660" cy="300" r="5" className="fill-brand/30" />
      <circle cx="600" cy="460" r="4" className="fill-brand-secondary/30" />
      <circle cx="400" cy="540" r="6" className="fill-brand/30" />
      <circle cx="200" cy="460" r="4" className="fill-brand-secondary/30" />
      <circle cx="140" cy="300" r="5" className="fill-brand/30" />
      <circle cx="200" cy="140" r="4" className="fill-brand-secondary/30" />

      <path
        d="M400 60 L600 140 L660 300 L600 460 L400 540 L200 460 L140 300 L200 140 Z"
        className="stroke-brand/10"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <path
        d="M400 60 L400 540"
        className="stroke-brand-secondary/8"
        strokeWidth="1"
      />
      <path
        d="M660 300 L140 300"
        className="stroke-brand-secondary/8"
        strokeWidth="1"
      />
      <path
        d="M600 140 L200 460"
        className="stroke-success/8"
        strokeWidth="1"
      />
      <path
        d="M200 140 L600 460"
        className="stroke-success/8"
        strokeWidth="1"
      />
    </svg>
  );
}
