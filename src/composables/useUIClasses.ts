import type { Size, Color, Variant } from "@/types/ui";

// Composable pour gérer les classes CSS du UI Kit avec les variables CSS personnalisées
export const useUIClasses = () => {
  // Classes de taille utilisant les variables CSS
  const sizeClasses: Record<Size, string> = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  // Classes de couleur utilisant les variables CSS personnalisées
  const colorClasses: Record<Color, Record<Variant, string>> = {
    primary: {
      solid:
        "bg-[var(--acs-primary-600)] hover:bg-[var(--acs-primary-700)] focus:ring-[var(--acs-primary-500)] text-white shadow-[var(--acs-shadow-primary)]",
      outline:
        "border-2 border-[var(--acs-primary-600)] text-[var(--acs-primary-600)] hover:bg-[var(--acs-primary-50)] focus:ring-[var(--acs-primary-500)] dark:hover:bg-[var(--acs-primary-950)]",
      ghost:
        "text-[var(--acs-primary-600)] hover:bg-[var(--acs-primary-50)] focus:bg-[var(--acs-primary-100)] dark:hover:bg-[var(--acs-primary-950)]",
      soft: "bg-[var(--acs-primary-100)] text-[var(--acs-primary-800)] hover:bg-[var(--acs-primary-200)] focus:ring-[var(--acs-primary-500)] dark:bg-[var(--acs-primary-950)] dark:text-[var(--acs-primary-200)]",
      link: "text-[var(--acs-primary-600)] hover:text-[var(--acs-primary-800)] underline-offset-4 hover:underline",
      gaming: "bg-vibrant-cyan-500 rounded-sm transition-all duration-300 shadow-[5px_5px_0_black] px-4 py-2 focus:ring-0!"
    },
    secondary: {
      solid:
        "bg-[var(--acs-gray-600)] hover:bg-[var(--acs-gray-700)] focus:ring-[var(--acs-gray-500)] text-white",
      outline:
        "border-2 border-[var(--acs-gray-300)] text-[var(--acs-gray-700)] hover:bg-[var(--acs-gray-50)] focus:ring-[var(--acs-gray-500)] dark:border-[var(--acs-gray-700)] dark:text-[var(--acs-gray-300)]",
      ghost:
        "text-[var(--acs-gray-700)] hover:bg-[var(--acs-gray-50)] focus:bg-[var(--acs-gray-100)] dark:text-[var(--acs-gray-300)] dark:hover:bg-[var(--acs-gray-800)]",
      soft: "bg-[var(--acs-gray-100)] text-[var(--acs-gray-700)] hover:bg-[var(--acs-gray-200)] focus:ring-[var(--acs-gray-500)] dark:bg-[var(--acs-gray-800)] dark:text-[var(--acs-gray-300)]",
      link: "text-[var(--acs-gray-700)] hover:text-[var(--acs-gray-900)] underline-offset-4 hover:underline dark:text-[var(--acs-gray-300)]",
      gaming: ""
    },
    success: {
      solid:
        "bg-[var(--acs-success-600)] hover:bg-[var(--acs-success-700)] focus:ring-[var(--acs-success-500)] text-white shadow-[var(--acs-shadow-success)]",
      outline:
        "border-2 border-[var(--acs-success-600)] text-[var(--acs-success-600)] hover:bg-[var(--acs-success-50)] focus:ring-[var(--acs-success-500)]",
      ghost:
        "text-[var(--acs-success-600)] hover:bg-[var(--acs-success-50)] focus:bg-[var(--acs-success-100)]",
      soft: "bg-[var(--acs-success-100)] text-[var(--acs-success-800)] hover:bg-[var(--acs-success-200)] focus:ring-[var(--acs-success-500)]",
      link: "text-[var(--acs-success-600)] hover:text-[var(--acs-success-800)] underline-offset-4 hover:underline",
      gaming: ""
    },
    warning: {
      solid:
        "bg-[var(--acs-warning-600)] hover:bg-[var(--acs-warning-700)] focus:ring-[var(--acs-warning-500)] text-white",
      outline:
        "border-2 border-[var(--acs-warning-600)] text-[var(--acs-warning-600)] hover:bg-[var(--acs-warning-50)] focus:ring-[var(--acs-warning-500)]",
      ghost:
        "text-[var(--acs-warning-600)] hover:bg-[var(--acs-warning-50)] focus:bg-[var(--acs-warning-100)]",
      soft: "bg-[var(--acs-warning-100)] text-[var(--acs-warning-800)] hover:bg-[var(--acs-warning-200)] focus:ring-[var(--acs-warning-500)]",
      link: "text-[var(--acs-warning-600)] hover:text-[var(--acs-warning-800)] underline-offset-4 hover:underline",
      gaming: ""
    },
    danger: {
      solid:
        "bg-[var(--acs-danger-600)] hover:bg-[var(--acs-danger-700)] focus:ring-[var(--acs-danger-500)] text-white shadow-[var(--acs-shadow-danger)]",
      outline:
        "border-2 border-[var(--acs-danger-600)] text-[var(--acs-danger-600)] hover:bg-[var(--acs-danger-50)] focus:ring-[var(--acs-danger-500)]",
      ghost:
        "text-[var(--acs-danger-600)] hover:bg-[var(--acs-danger-50)] focus:bg-[var(--acs-danger-100)]",
      soft: "bg-[var(--acs-danger-100)] text-[var(--acs-danger-800)] hover:bg-[var(--acs-danger-200)] focus:ring-[var(--acs-danger-500)]",
      link: "text-[var(--acs-danger-600)] hover:text-[var(--acs-danger-800)] underline-offset-4 hover:underline",
      gaming: ""
    },
    info: {
      solid:
        "bg-[var(--acs-accent-600)] hover:bg-[var(--acs-accent-700)] focus:ring-[var(--acs-accent-500)] text-white shadow-[var(--acs-shadow-accent)]",
      outline:
        "border-2 border-[var(--acs-accent-600)] text-[var(--acs-accent-600)] hover:bg-[var(--acs-accent-50)] focus:ring-[var(--acs-accent-500)]",
      ghost:
        "text-[var(--acs-accent-600)] hover:bg-[var(--acs-accent-50)] focus:bg-[var(--acs-accent-100)]",
      soft: "bg-[var(--acs-accent-100)] text-[var(--acs-accent-800)] hover:bg-[var(--acs-accent-200)] focus:ring-[var(--acs-accent-500)]",
      link: "text-[var(--acs-accent-600)] hover:text-[var(--acs-accent-800)] underline-offset-4 hover:underline",
      gaming: ""
    },
    gray: {
      solid:
        "bg-[var(--acs-gray-600)] hover:bg-[var(--acs-gray-700)] focus:ring-[var(--acs-gray-500)] text-white",
      outline:
        "border-2 border-[var(--acs-border-secondary)] text-[var(--acs-text-secondary)] hover:bg-[var(--acs-bg-tertiary)] focus:ring-[var(--acs-gray-500)]",
      ghost:
        "text-[var(--acs-text-secondary)] hover:bg-[var(--acs-bg-tertiary)] focus:bg-[var(--acs-bg-tertiary)]",
      soft: "bg-[var(--acs-bg-tertiary)] text-[var(--acs-text-secondary)] hover:bg-[var(--acs-gray-200)] focus:ring-[var(--acs-gray-500)] dark:hover:bg-[var(--acs-gray-700)]",
      link: "text-[var(--acs-text-secondary)] hover:text-[var(--acs-text-primary)] underline-offset-4 hover:underline",
      gaming: ""
    }
  };

  // Classes de base pour les boutons avec les transitions personnalisées
  const baseButtonClasses =
    "inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed acs-hover-lift";

  // Classes pour les inputs avec les variables CSS
  const inputStateClasses = {
    default:
      "border-[var(--acs-border-primary)] focus:border-[var(--acs-primary-500)] focus:ring-[var(--acs-primary-500)]",
    error:
      "border-[var(--acs-danger-300)] focus:border-[var(--acs-danger-500)] focus:ring-[var(--acs-danger-500)]",
    success:
      "border-[var(--acs-success-300)] focus:border-[var(--acs-success-500)] focus:ring-[var(--acs-success-500)]",
    warning:
      "border-[var(--acs-warning-300)] focus:border-[var(--acs-warning-500)] focus:ring-[var(--acs-warning-500)]",
  };

  const inputVariantClasses = {
    outline:
      "border bg-[var(--acs-bg-secondary)] focus:ring-1 text-[var(--acs-text-primary)]",
    filled:
      "border-0 bg-[var(--acs-bg-tertiary)] focus:bg-[var(--acs-bg-secondary)] focus:ring-2 focus:ring-[var(--acs-primary-500)] text-[var(--acs-text-primary)]",
    underline:
      "border-0 border-b-2 bg-transparent focus:ring-0 rounded-none px-0 text-[var(--acs-text-primary)]",
  };

  // Fonctions utilitaires améliorées
  const getButtonClasses = (
    size: Size = "md",
    color: Color = "primary",
    variant: Variant = "solid",
    rounded = false,
    fullWidth = false,
    gradient = false
  ) => {
    const classes = [
      baseButtonClasses,
      sizeClasses[size],
      colorClasses[color][variant],
      rounded
        ? "rounded-[var(--acs-radius-full)]"
        : "rounded-[var(--acs-radius-lg)]",
      fullWidth ? "w-full" : "",
      "transition-all duration-[var(--acs-transition-normal)]",
    ];

    // Ajouter les classes de bordure pour les variants qui en ont besoin
    if (variant === "outline") {
      classes.push("border-2");
    }

    // Gradient spécial pour les boutons gaming
    if (gradient && color === "primary") {
      classes.push("acs-bg-gradient-primary");
    }

    return classes.filter(Boolean).join(" ");
  };

  const getInputClasses = (
    size: Size = "md",
    variant: "outline" | "filled" | "underline" = "outline",
    state: "default" | "error" | "success" | "warning" = "default"
  ) => {
    const classes = [
      "block w-full transition-all duration-[var(--acs-transition-normal)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[var(--acs-text-muted)]",
      sizeClasses[size],
      inputVariantClasses[variant],
      inputStateClasses[state],
    ];

    if (variant !== "underline") {
      classes.push("rounded-[var(--acs-radius-lg)]");
    }

    return classes.filter(Boolean).join(" ");
  };

  const getCardClasses = (
    variant: "elevated" | "outlined" | "filled" | "glass" | "gaming" = "elevated",
    padding: Size = "md",
    rounded = true,
    shadow = true,
    hoverable = false
  ) => {
    const classes = [
      "transition-all duration-[var(--acs-transition-normal)]",
      sizeClasses[padding],
    ];

    // Variantes de carte avec les nouvelles options
    switch (variant) {
      case "elevated":
        classes.push(
          "bg-[var(--acs-bg-secondary)] border border-[var(--acs-border-primary)]"
        );
        if (shadow) classes.push("shadow-[var(--acs-shadow-md)]");
        break;
      case "outlined":
        classes.push(
          "bg-[var(--acs-bg-secondary)] border-2 border-[var(--acs-border-secondary)]"
        );
        break;
      case "filled":
        classes.push(
          "bg-[var(--acs-bg-tertiary)] border border-[var(--acs-border-primary)]"
        );
        break;
      case "glass":
        classes.push("acs-glass");
        break;
      case "gaming":
        classes.push("bg-vibrant-purple-500 text-white relative border-shadow border-2 border-black");
        // if (shadow) classes.push("glow-vibrant-purple");
        break;
    }

    if (rounded) {
      if (!classes.reduce((acc, cls) => acc && cls.startsWith("rounded"), true)) {
        classes.push("rounded-[var(--acs-radius-lg)]");
      }
    }
    if (hoverable)
      classes.push(
        "hover:shadow-[var(--acs-shadow-lg)] cursor-pointer acs-hover-lift"
      );

    return classes.filter(Boolean).join(" ");
  };

  // Nouvelles fonctions pour les effets gaming
  const getGradientClasses = (
    type: "primary" | "gaming" | "neon" | "cyber" = "primary"
  ) => {
    const gradientMap = {
      primary: "acs-bg-gradient-primary",
      gaming: "acs-bg-gradient-gaming",
      neon: "acs-bg-gradient-neon",
      cyber: "acs-bg-gradient-cyber",
    };
    return gradientMap[type];
  };

  const getTextGradientClasses = (type: "primary" | "gaming" = "primary") => {
    const textGradientMap = {
      primary: "acs-text-gradient-primary",
      gaming: "acs-text-gradient-gaming",
    };
    return textGradientMap[type];
  };

  const getAnimationClasses = (type: "pulse" | "bounce" | "glow" = "pulse") => {
    const animationMap = {
      pulse: "acs-animate-pulse",
      bounce: "acs-animate-bounce",
      glow: "acs-animate-glow",
    };
    return animationMap[type];
  };

  return {
    sizeClasses,
    colorClasses,
    baseButtonClasses,
    inputStateClasses,
    inputVariantClasses,
    getButtonClasses,
    getInputClasses,
    getCardClasses,
    getGradientClasses,
    getTextGradientClasses,
    getAnimationClasses,
  };
};

export default useUIClasses;
