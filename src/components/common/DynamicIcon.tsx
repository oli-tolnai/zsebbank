import * as icons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = (icons as unknown as Record<string, icons.LucideIcon>)[name];
  if (!IconComponent) {
    return <icons.Circle {...props} />;
  }
  return <IconComponent {...props} />;
}
