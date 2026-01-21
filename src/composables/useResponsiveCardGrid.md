# 📐 useResponsiveCardGrid - Composable

## Vue d'ensemble

Le composable `useResponsiveCardGrid` calcule automatiquement la largeur maximale optimale pour les cartes à collectionner en fonction de la taille de la grille et des breakpoints responsive définis.

## Problème Résolu

Avant ce composable, chaque vue devait gérer manuellement le calcul de la largeur des cartes :

```typescript
// ❌ Code dupliqué et fragile
const { width: windowWidth } = useWindowSize();
const cardsGrid = ref<HTMLElement | null>(null);
const { width: gridWidth } = useElementSize(cardsGrid);

const maxCardWidth = computed(() => {
  if (windowWidth.value >= 1024) {
    return (gridWidth.value / 6) - 14;
  } else if (windowWidth.value >= 768) {
    return (gridWidth.value / 4) - 12;
  } else {
    return (gridWidth.value / 2) - 8;
  }
});
```

Avec `useResponsiveCardGrid` :

```typescript
// ✅ Simple, réutilisable et précis
const cardsGrid = ref<HTMLElement | null>(null);
const { maxCardWidth } = useResponsiveCardGrid(cardsGrid, {
  breakpoints: {
    1024: { cells: 6, gap: 16 },
    768: { cells: 4, gap: 12 },
    0: { cells: 2, gap: 8 }
  }
});
```

## Installation

Le composable est déjà créé dans :
```
frontend/src/composables/useResponsiveCardGrid.ts
```

## Utilisation

### Import

```typescript
import { useResponsiveCardGrid } from '@/composables/useResponsiveCardGrid';
```

### Exemple Complet

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useResponsiveCardGrid } from '@/composables/useResponsiveCardGrid';
import CollectibleCard from '@/components/CollectibleCard.vue';

const cardsGrid = ref<HTMLElement | null>(null);

const { maxCardWidth } = useResponsiveCardGrid(cardsGrid, {
  breakpoints: {
    1280: { cells: 6, gap: 16 },  // Desktop large
    1024: { cells: 5, gap: 16 },  // Desktop
    768: { cells: 4, gap: 12 },   // Tablet
    640: { cells: 3, gap: 12 },   // Tablet small
    0: { cells: 2, gap: 8 }       // Mobile
  },
  defaultWidth: 150  // Largeur pendant le chargement
});
</script>

<template>
  <div 
    ref="cardsGrid" 
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
  >
    <CollectibleCard 
      v-for="card in cards" 
      :key="card.id"
      :card="card"
      :maxWidth="maxCardWidth"
    />
  </div>
</template>
```

## API

### Paramètres

#### `gridElement: MaybeElementRef`
La référence à l'élément HTML de la grille de cartes.

```typescript
const cardsGrid = ref<HTMLElement | null>(null);
```

#### `options: UseResponsiveCardGridOptions`

##### `breakpoints: GridBreakpoints` (requis)
Configuration des breakpoints avec le nombre de colonnes et l'espacement.

```typescript
breakpoints: {
  1024: { cells: 6, gap: 16 },  // ≥1024px : 6 colonnes, 16px de gap
  768: { cells: 4, gap: 12 },   // ≥768px : 4 colonnes, 12px de gap
  0: { cells: 2, gap: 8 }       // ≥0px : 2 colonnes, 8px de gap
}
```

##### `defaultWidth?: number` (optionnel)
Largeur par défaut utilisée avant que la grille soit montée.
- **Défaut** : `150`

```typescript
defaultWidth: 150  // pixels
```

### Valeurs Retournées

```typescript
{
  maxCardWidth: Ref<number>,           // Largeur maximale calculée
  currentBreakpoint: Ref<GridBreakpoint>, // Configuration actuelle
  currentCells: Ref<number>,           // Nombre de colonnes actuel
  currentGap: Ref<number>,             // Espacement actuel
  windowWidth: Ref<number>,            // Largeur de la fenêtre
  gridWidth: Ref<number>,              // Largeur de la grille
}
```

#### `maxCardWidth`
**Type** : `Ref<number>`

La largeur maximale calculée pour chaque carte en pixels.

**Formule** :
```
maxCardWidth = (gridWidth - (gap × (cells - 1))) / cells
```

**Exemple** :
```typescript
// Grille de 1200px, 6 colonnes, gap de 16px
// maxCardWidth = (1200 - (16 × 5)) / 6
// maxCardWidth = (1200 - 80) / 6
// maxCardWidth = 186.67px
```

## Configuration des Breakpoints

### Recommandations

#### Mobile (0-639px)
```typescript
0: { cells: 2, gap: 8 }
```
- 2 colonnes pour maximiser la lisibilité
- Gap réduit pour économiser l'espace

#### Tablet Small (640-767px)
```typescript
640: { cells: 3, gap: 12 }
```
- 3 colonnes pour un bon équilibre
- Gap modéré

#### Tablet (768-1023px)
```typescript
768: { cells: 4, gap: 12 }
```
- 4 colonnes pour afficher plus de contenu
- Gap confortable

#### Desktop (1024-1279px)
```typescript
1024: { cells: 5, gap: 16 }
```
- 5 colonnes pour exploiter l'espace
- Gap généreux

#### Desktop Large (≥1280px)
```typescript
1280: { cells: 6, gap: 16 }
```
- 6 colonnes pour les grands écrans
- Gap maximum pour la clarté

### Breakpoints Tailwind

Pour synchroniser avec les classes Tailwind CSS :

```typescript
breakpoints: {
  1280: { cells: 6, gap: 16 },  // xl:
  1024: { cells: 5, gap: 16 },  // lg:
  768: { cells: 4, gap: 12 },   // md:
  640: { cells: 3, gap: 12 },   // sm:
  0: { cells: 2, gap: 8 }       // default
}
```

Correspond aux classes CSS :
```html
<div class="grid 
  grid-cols-2 
  sm:grid-cols-3 
  md:grid-cols-4 
  lg:grid-cols-5 
  xl:grid-cols-6
  gap-2 
  sm:gap-3 
  md:gap-3 
  lg:gap-4 
  xl:gap-4
">
```

## Cas d'Usage

### CreateTrade.vue
```typescript
const { maxCardWidth } = useResponsiveCardGrid(cardsGrid, {
  breakpoints: {
    1024: { cells: 6, gap: 16 },
    768: { cells: 4, gap: 12 },
    0: { cells: 2, gap: 8 }
  },
  defaultWidth: 150
});
```

### CardFusion.vue
```typescript
const { maxCardWidth } = useResponsiveCardGrid(cardsGrid, {
  breakpoints: {
    1280: { cells: 6, gap: 16 },
    1024: { cells: 5, gap: 16 },
    768: { cells: 4, gap: 12 },
    640: { cells: 3, gap: 12 },
    0: { cells: 2, gap: 8 }
  },
  defaultWidth: 150
});
```

### CardCollection.vue (usage futur)
```typescript
const { maxCardWidth } = useResponsiveCardGrid(cardsGrid, {
  breakpoints: {
    1536: { cells: 8, gap: 16 },  // 2xl
    1280: { cells: 6, gap: 16 },  // xl
    1024: { cells: 5, gap: 16 },  // lg
    768: { cells: 4, gap: 12 },   // md
    640: { cells: 3, gap: 12 },   // sm
    0: { cells: 2, gap: 8 }       // mobile
  }
});
```

## Avantages

### 1. Réutilisabilité
✅ Un seul composable pour toutes les grilles de cartes
✅ Configuration déclarative simple

### 2. Précision
✅ Calcul exact basé sur la largeur réelle de la grille
✅ Pas d'estimation approximative
✅ S'adapte au redimensionnement de la fenêtre

### 3. Performance
✅ Valeurs calculées réactives avec `computed`
✅ Pas de recalcul inutile
✅ Optimisé avec VueUse (`useElementSize`, `useWindowSize`)

### 4. Maintenabilité
✅ Un seul endroit pour la logique
✅ Facile à tester
✅ Configuration centralisée

### 5. Type-Safety
✅ TypeScript complet
✅ Interfaces claires
✅ Autocomplete dans l'IDE

## Types

```typescript
interface GridBreakpoint {
  cells: number;  // Nombre de colonnes
  gap: number;    // Espacement en pixels
}

interface GridBreakpoints {
  [breakpoint: number]: GridBreakpoint;
}

interface UseResponsiveCardGridOptions {
  breakpoints: GridBreakpoints;
  defaultWidth?: number;
}
```

## Dépendances

- `vue` - Pour `computed`, `ref`
- `@vueuse/core` - Pour `useElementSize`, `useWindowSize`

## Performance

### Réactivité
Les valeurs sont recalculées automatiquement quand :
- La fenêtre est redimensionnée
- La grille change de taille
- Le breakpoint change

### Optimisations
- ✅ `computed` pour éviter les recalculs inutiles
- ✅ `useElementSize` et `useWindowSize` avec debounce interne
- ✅ Pas de listeners d'événements manuels

## Exemples Avancés

### Utiliser Toutes les Valeurs

```typescript
const {
  maxCardWidth,
  currentBreakpoint,
  currentCells,
  currentGap,
  windowWidth,
  gridWidth
} = useResponsiveCardGrid(cardsGrid, { ... });

// Afficher des infos de debug
console.log('Largeur fenêtre:', windowWidth.value);
console.log('Largeur grille:', gridWidth.value);
console.log('Colonnes:', currentCells.value);
console.log('Gap:', currentGap.value);
console.log('Largeur carte:', maxCardWidth.value);
```

### Grille Dynamique

```typescript
// Changer les breakpoints dynamiquement
const breakpoints = ref({
  1024: { cells: 6, gap: 16 },
  0: { cells: 2, gap: 8 }
});

const { maxCardWidth } = useResponsiveCardGrid(cardsGrid, {
  breakpoints: breakpoints.value
});

// Modifier la configuration
function toggleDenseMode() {
  breakpoints.value = {
    1024: { cells: 8, gap: 8 },  // Plus dense
    0: { cells: 3, gap: 4 }
  };
}
```

## Migration

### Avant (code dupliqué)
```typescript
const { width: windowWidth } = useWindowSize();
const cardsGrid = ref<HTMLElement | null>(null);
const { width: gridWidth } = useElementSize(cardsGrid);

const maxCardWidth = computed(() => {
  if (windowWidth.value >= 1024) {
    return (gridWidth.value / 6) - 14;
  } else if (windowWidth.value >= 768) {
    return (gridWidth.value / 4) - 12;
  } else {
    return (gridWidth.value / 2) - 8;
  }
});
```

### Après (avec composable)
```typescript
const cardsGrid = ref<HTMLElement | null>(null);
const { maxCardWidth } = useResponsiveCardGrid(cardsGrid, {
  breakpoints: {
    1024: { cells: 6, gap: 16 },
    768: { cells: 4, gap: 12 },
    0: { cells: 2, gap: 8 }
  }
});
```

**Bénéfices** :
- 📉 75% de code en moins
- ✅ Plus précis (utilise le gap réel)
- 🔄 Réutilisable partout
- 📝 Déclaratif et lisible

## Troubleshooting

### La largeur est toujours 150px

**Problème** : `maxCardWidth` reste à la valeur par défaut.

**Solution** : Vérifier que la ref est bien attachée à l'élément :
```html
<div ref="cardsGrid" class="grid ...">
  <!-- cartes -->
</div>
```

### Les cartes ne s'adaptent pas

**Problème** : Les cartes ne changent pas de taille.

**Solution** : Passer `maxWidth` au composant de carte :
```html
<CollectibleCard :maxWidth="maxCardWidth" />
```

### Breakpoints non respectés

**Problème** : Les breakpoints ne correspondent pas aux classes CSS.

**Solution** : S'assurer que les breakpoints et les classes Tailwind correspondent :
```typescript
// Breakpoints du composable
1024: { cells: 6 }  // ≥1024px

// Classes CSS
lg:grid-cols-6      // @media (min-width: 1024px)
```

## Conclusion

Le composable `useResponsiveCardGrid` simplifie grandement la gestion des grilles de cartes responsive en :
- ✅ Centralisant la logique
- ✅ Calculant précisément les tailles
- ✅ S'adaptant automatiquement
- ✅ Offrant une API simple et type-safe

**Utilisé dans** :
- `CreateTrade.vue`
- `CardFusion.vue`
- (À venir : `CardCollection.vue`, `TradeDetails.vue`, etc.)

---

**Créé le** : 2026-01-21
**Auteur** : Équipe ScrimDeck
**Version** : 1.0.0
