import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const shared = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function GridIcon(props: IconProps) {
  return <svg {...shared} {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}

export function ActivityIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M3 12h4l2.2-6 4 12 2.2-6H21"/></svg>;
}

export function ShieldIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M12 3 4.5 6v5.2c0 4.6 3.2 8.2 7.5 9.8 4.3-1.6 7.5-5.2 7.5-9.8V6L12 3Z"/><path d="m9 12 2 2 4-4"/></svg>;
}

export function GitBranchIcon(props: IconProps) {
  return <svg {...shared} {...props}><circle cx="6" cy="5" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="19" r="2"/><path d="M6 7v10M8 10h4a6 6 0 0 0 6-2"/></svg>;
}

export function LayersIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="m12 3-9 5 9 5 9-5-9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></svg>;
}

export function ArrowIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
}

export function LockIcon(props: IconProps) {
  return <svg {...shared} {...props}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>;
}

export function RadioIcon(props: IconProps) {
  return <svg {...shared} {...props}><circle cx="12" cy="12" r="2" fill="currentColor"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8"/></svg>;
}

export function CheckIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="m5 12 4 4L19 6"/></svg>;
}

export function XIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="m6 6 12 12M18 6 6 18"/></svg>;
}

export function PlusIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M12 5v14M5 12h14"/></svg>;
}

