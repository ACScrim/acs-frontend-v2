import { ref } from 'vue';
import type { CollectibleCard } from '@/types/models';

export type FusionAnimationPhase = 'idle' | 'spiraling' | 'imploding' | 'revealing' | 'complete';

export interface SpiralCard {
  id: string;
  card: CollectibleCard;
  angle: number;
  radius: number;
  scale: number;
  opacity: number;
}

export function useCardFusionAnimation() {
  const animationPhase = ref<FusionAnimationPhase>('idle');
  const spiralCards = ref<SpiralCard[]>([]);
  const newCardOpacity = ref(0);
  const newCardScale = ref(0);
  const implosionProgress = ref(0);

  // Animation de spirale et aspiration
  const startSpiralAnimation = async (cards: CollectibleCard[]) => {
    animationPhase.value = 'spiraling';

    // Initialiser les cartes en cercle
    spiralCards.value = cards.map((card, index) => ({
      id: card.id,
      card,
      angle: (index / cards.length) * 360,
      radius: 200,
      scale: 1,
      opacity: 1,
    }));

    return new Promise<void>((resolve) => {
      const duration = 1500; // 1.5 secondes pour la spirale
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing pour accélération progressive
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        spiralCards.value = spiralCards.value.map((spiralCard, _) => {
          // Rotation de plus en plus rapide
          const rotationSpeed = 2 + progress * 8;
          const newAngle = spiralCard.angle + rotationSpeed;

          // Réduction du rayon (aspiration vers le centre)
          const newRadius = 200 * (1 - easeProgress);

          // Réduction de la taille
          const newScale = 1 - easeProgress * 0.7;

          return {
            ...spiralCard,
            angle: newAngle,
            radius: newRadius,
            scale: newScale,
            opacity: 1 - progress * 0.3,
          };
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  };

  // Animation d'implosion finale
  const startImplosionAnimation = async () => {
    animationPhase.value = 'imploding';

    return new Promise<void>((resolve) => {
      const duration = 400; // 0.4 secondes pour l'implosion
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        implosionProgress.value = progress;

        // Faire disparaître les cartes restantes
        spiralCards.value = spiralCards.value.map(card => ({
          ...card,
          radius: card.radius * (1 - progress),
          scale: card.scale * (1 - progress),
          opacity: 1 - progress,
        }));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          spiralCards.value = [];
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  };

  // Animation de révélation de la nouvelle carte
  const startRevealAnimation = async () => {
    animationPhase.value = 'revealing';

    return new Promise<void>((resolve) => {
      const duration = 800; // 0.8 secondes pour la révélation
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing élastique pour un effet plus dynamique
        const easeProgress = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        newCardScale.value = easeProgress * 1.2; // Légèrement plus grand au début
        newCardOpacity.value = progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Revenir à la taille normale
          setTimeout(() => {
            newCardScale.value = 1;
            animationPhase.value = 'complete';
            resolve();
          }, 200);
        }
      };

      requestAnimationFrame(animate);
    });
  };

  // Séquence complète d'animation
  const playFusionAnimation = async (cards: CollectibleCard[]) => {
    await startSpiralAnimation(cards);
    await startImplosionAnimation();
    await startRevealAnimation();
  };

  // Réinitialiser l'animation
  const resetAnimation = () => {
    animationPhase.value = 'idle';
    spiralCards.value = [];
    newCardOpacity.value = 0;
    newCardScale.value = 0;
    implosionProgress.value = 0;
  };

  return {
    animationPhase,
    spiralCards,
    newCardOpacity,
    newCardScale,
    implosionProgress,
    playFusionAnimation,
    resetAnimation,
  };
}
