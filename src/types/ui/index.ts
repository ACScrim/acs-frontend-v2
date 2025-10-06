// Types de base pour le UI Kit
export type Size = "xs" | "sm" | "md" | "lg" | "xl";
export type Color =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gray";
export type Variant = "solid" | "outline" | "ghost" | "soft" | "link";

// Types pour les boutons
export interface ButtonProps {
  size?: Size;
  color?: Color;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
}

// Types pour les inputs
export interface InputProps {
  size?: Size;
  variant?: "outline" | "filled" | "underline";
  state?: "default" | "error" | "success" | "warning";
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  icon?: string;
  iconPosition?: "left" | "right";
}

// Types pour les cards
export interface CardProps {
  variant?: "elevated" | "outlined" | "filled" | "glass";
  padding?: Size;
  rounded?: boolean;
  shadow?: boolean;
  hoverable?: boolean;
}

// Types pour les toasts
export type ToastType = "success" | "error" | "warning" | "info" | "gaming";
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export interface ToastProps {
  type?: ToastType;
  title?: string;
  message?: string;
  duration?: number;
  position?: ToastPosition;
  closable?: boolean;
  persistent?: boolean;
  actionText?: string;
}

// Types pour les modals
export interface ModalProps {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
  persistent?: boolean;
  centered?: boolean;
  scrollable?: boolean;
  backdrop?: boolean;
  backdropBlur?: boolean;
}

// Types pour les badges
export type BadgeVariant = "solid" | "outline" | "soft" | "dot";
export interface BadgeProps {
  variant?: BadgeVariant;
  size?: Size;
  color?: Color;
  rounded?: boolean;
  pulsing?: boolean;
}

// Types pour les avatars
export interface AvatarProps {
  size?: Size;
  src?: string;
  alt?: string;
  fallback?: string;
  status?: "online" | "offline" | "away" | "busy";
  statusPosition?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
  rounded?: boolean;
  bordered?: boolean;
}

// Types pour les barres de progression
export interface ProgressProps {
  value?: number;
  max?: number;
  size?: Size;
  color?: Color;
  variant?: "linear" | "circular";
  animated?: boolean;
  striped?: boolean;
  label?: string;
  showPercentage?: boolean;
}

// Types pour les dropdowns
export interface DropdownItem {
  label: string;
  value: string | number;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  items?: DropdownItem[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  size?: "sm" | "md" | "lg";
}
