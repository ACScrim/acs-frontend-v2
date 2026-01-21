import { computed } from 'vue';
import { useElementSize, useWindowSize } from '@vueuse/core';
import type { MaybeElementRef } from '@vueuse/core';

export interface GridBreakpoint {
  /** Nombre de colonnes dans la grille */
  cells: number;
  /** Espacement entre les cartes en pixels */
  gap: number;
}

export interface GridBreakpoints {
  /** Configuration pour chaque breakpoint (en pixels) */
  [breakpoint: number]: GridBreakpoint;
}

export interface UseResponsiveCardGridOptions {
  /** Configuration des breakpoints (ex: { 1024: { cells: 6, gap: 16 }, 768: { cells: 4, gap: 12 } }) */
  breakpoints: GridBreakpoints;
  /** Largeur par défaut si la grille n'est pas encore montée */
  defaultWidth?: number;
}

/**
 * Composable pour calculer automatiquement la largeur maximale des cartes
 * en fonction de la grille responsive et de ses breakpoints
 *
 * @example
 * ```ts
 * const cardsGrid = ref<HTMLElement | null>(null);
 * const { maxCardWidth } = useResponsiveCardGrid(cardsGrid, {
 *   breakpoints: {
 *     1024: { cells: 6, gap: 16 },
 *     768: { cells: 4, gap: 12 },
 *     0: { cells: 2, gap: 8 }
 *   }
 * });
 * ```
 */
export function useResponsiveCardGrid(
  gridElement: MaybeElementRef,
  options: UseResponsiveCardGridOptions
) {
  const { breakpoints, defaultWidth = 150 } = options;

  const { width: windowWidth } = useWindowSize();
  const { width: gridWidth } = useElementSize(gridElement);

  /**
   * Trouve la configuration de grille appropriée pour la largeur actuelle de la fenêtre
   */
  const currentBreakpoint = computed((): GridBreakpoint => {
    // Trier les breakpoints par ordre décroissant
    const sortedBreakpoints = Object.keys(breakpoints)
      .map(Number)
      .sort((a, b) => b - a);

    // Trouver le premier breakpoint qui correspond
    for (const breakpoint of sortedBreakpoints) {
      if (windowWidth.value >= breakpoint) {
        const config = breakpoints[breakpoint];
        if (config) {
          return config;
        }
      }
    }

    // Fallback sur le plus petit breakpoint
    const smallestBreakpoint = sortedBreakpoints[sortedBreakpoints.length - 1];
    if (smallestBreakpoint !== undefined) {
      const fallbackConfig = breakpoints[smallestBreakpoint];
      if (fallbackConfig) {
        return fallbackConfig;
      }
    }

    // Si aucun breakpoint n'est trouvé, utiliser une configuration par défaut
    return { cells: 2, gap: 8 };
  });

  /**
   * Calcule la largeur maximale d'une carte en fonction de la grille
   * Formule: (largeur de la grille - (gap * (cells - 1))) / cells
   */
  const maxCardWidth = computed((): number => {
    const { cells, gap } = currentBreakpoint.value;

    // Si la grille n'est pas encore montée, utiliser la largeur par défaut
    if (!gridWidth.value || gridWidth.value === 0) {
      return defaultWidth;
    }

    // Calculer l'espace total occupé par les gaps
    const totalGapSpace = gap * (cells - 1);

    // Calculer la largeur disponible pour les cartes
    const availableWidth = gridWidth.value - totalGapSpace;

    // Diviser par le nombre de colonnes
    return Math.floor(availableWidth / cells);
  });

  /**
   * Nombre de colonnes actuel
   */
  const currentCells = computed(() => currentBreakpoint.value.cells);

  /**
   * Espacement actuel entre les cartes
   */
  const currentGap = computed(() => currentBreakpoint.value.gap);

  return {
    /** Largeur maximale calculée pour chaque carte */
    maxCardWidth,
    /** Configuration du breakpoint actuel */
    currentBreakpoint,
    /** Nombre de colonnes dans la grille actuelle */
    currentCells,
    /** Espacement entre les cartes */
    currentGap,
    /** Largeur de la fenêtre */
    windowWidth,
    /** Largeur de la grille */
    gridWidth,
  };
}
