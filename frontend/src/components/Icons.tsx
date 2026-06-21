import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const FlightIcon: React.FC<IconProps> = ({ size = 32, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M6 22L12 18L18 20L28 10L14 16L10 14L6 22Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 16L28 10L24 24L18 20L14 16Z" fill="#008cff" fillOpacity="0.85" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 14L12 18L18 20L14 16L10 14Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M6 22L8 20L10 21L6 22Z" fill="#64748b" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const HotelIcon: React.FC<IconProps> = ({ size = 32, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M6 26V8L16 4V22M6 26H16V22" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M16 4L22 7V22H16V4Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M22 14L28 17V26H22V14Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M16 22H22V26H16V22Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M9 10H11M9 14H11M9 18H11M13 10H15M13 14H15M13 18H15" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M24 19H26M24 22H26" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const VillaIcon: React.FC<IconProps> = ({ size = 32, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M4 16L14 8L24 16H4Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 8L24 6L30 13L24 16L14 8Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M6 16V26H18V16H6Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M18 16L26 19V26H18V16Z" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 21H14V26H10V21Z" fill="#64748b" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M21 20H23V23H21V20Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const HolidayIcon: React.FC<IconProps> = ({ size = 32, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    {...props}
  >
    <line x1="16" y1="8" x2="16" y2="28" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 18C6 11 10.5 8 16 8C21.5 8 26 11 26 18H6Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M11 18C11 14 13 11 16 11C19 11 21 14 21 18H11Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="24" cy="24" r="4" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.5" />
    <path d="M24 20A4 4 0 0 1 28 24" stroke="#1e293b" strokeWidth="1.5" />
    <path d="M20 24A4 4 0 0 1 24 28" stroke="#1e293b" strokeWidth="1.5" />
  </svg>
);

export const TrainIcon: React.FC<IconProps> = ({ size = 32, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M4 22L16 14L28 18L16 26L4 22Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M16 14L28 10L30 14L28 18L16 14Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M22 13L26 12L25 15L22 13Z" fill="#1e293b" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="2" y1="24" x2="16" y2="28" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="16" y1="28" x2="30" y2="20" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const BusIcon: React.FC<IconProps> = ({ size = 32, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M6 14L18 8L28 13V22L16 27L6 22V14Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M18 8L28 13L28 17L18 12V8Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 15H12V18H8V15Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" />
    <path d="M13 13H17V16H13V13Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" />
    <circle cx="10" cy="24" r="2.5" fill="#64748b" stroke="#1e293b" strokeWidth="1.5" />
    <circle cx="22" cy="20" r="2.5" fill="#64748b" stroke="#1e293b" strokeWidth="1.5" />
  </svg>
);

export const CabIcon: React.FC<IconProps> = ({ size = 32, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M4 20L12 16L24 19L28 22L16 25L4 20Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 17L14 12L20 13L22 18" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="9" cy="22" r="2" fill="#64748b" stroke="#1e293b" strokeWidth="1.5" />
    <circle cx="21" cy="21" r="2" fill="#64748b" stroke="#1e293b" strokeWidth="1.5" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

export const MoonIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const BaggageIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="3" y="6" width="18" height="14" rx="2" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 12h4" />
  </svg>
);

export const MealIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 2v20M2 12h20M12 12a5 5 0 1 0-10 0h10zm0 0a5 5 0 1 1 10 0H12z" />
  </svg>
);

export const WifiIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const TicketIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M6 5v14M18 5v14M12 9v6" />
  </svg>
);

export const RevenueIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="8" cy="8" r="6" />
    <circle cx="16" cy="16" r="6" />
    <path d="M2 8h12M10 16h12" />
  </svg>
);

export const CruiseIcon: React.FC<IconProps> = ({ size = 32, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M4 22L20 18L28 20L22 24L4 22Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 18V13H20V17" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M13 13V10H18V13" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <rect x="14" y="7" width="2" height="3" fill="#64748b" stroke="#1e293b" strokeWidth="1.5" />
    <path d="M2 24C4 24 5 25 7 25C9 25 10 24 12 24C14 24 15 25 17 25" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const VisaIcon: React.FC<IconProps> = ({ size = 32, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M10 24L22 21V6L10 9V24Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 24L8 23V8L10 9M10 24V9" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="16" cy="15" r="3" stroke="#1e293b" strokeWidth="1.5" />
    <line x1="13" y1="15" x2="19" y2="15" stroke="#1e293b" strokeWidth="1.5" />
  </svg>
);

export const ToursIcon: React.FC<IconProps> = ({ size = 32, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M16 4C10.5 4 7 8 7 13.5C7 18 12.5 22.5 16 25C19.5 22.5 25 18 25 13.5C25 8 21.5 4 16 4Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 4.5C12 9 14.5 18.5 16 25C17.5 18.5 20 9 20 4.5" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M16 4V25" stroke="#1e293b" strokeWidth="1.5" />
    <rect x="14" y="27" width="4" height="3" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" />
    <line x1="14" y1="25" x2="14" y2="27" stroke="#1e293b" strokeWidth="1.5" />
    <line x1="18" y1="25" x2="18" y2="27" stroke="#1e293b" strokeWidth="1.5" />
  </svg>
);

export const ForexIcon: React.FC<IconProps> = ({ size = 32, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M4 22L16 16L28 20L16 26L4 22Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M6 18L18 12L30 16L18 22L6 18Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="18" cy="17" r="2.5" stroke="#1e293b" strokeWidth="1.5" />
    <path d="M18 15V19" stroke="#1e293b" strokeWidth="1.5" />
  </svg>
);

export const InsuranceIcon: React.FC<IconProps> = ({ size = 32, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    {...props}
  >
    <path d="M8 6L16 3L24 6V14C24 20 16 26 16 26C16 26 8 20 8 14V6Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 14L16 12L20 15L16 16" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="16" y1="10" x2="16" y2="18" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const SecureIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const FlashIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const RobotIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16.01" />
    <line x1="16" y1="16" x2="16" y2="16.01" />
  </svg>
);

export const ChatBubbleIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const TagIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7" y2="7.01" />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const SeatIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M4 18V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" />
    <path d="M3 18h18" />
    <path d="M6 18v3" />
    <path d="M18 18v3" />
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const ErrorCircleIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const WarningIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const OfficeBuildingIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="16" />
    <line x1="15" y1="22" x2="15" y2="16" />
    <line x1="9" y1="16" x2="15" y2="16" />
    <path d="M8 6h2M14 6h2M8 10h2M14 10h2" />
  </svg>
);

export const ChartIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export const HeartIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);



