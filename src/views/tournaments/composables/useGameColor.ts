import { computed, type ComputedRef } from 'vue';

const GAME_COLORS: string[] = ['#6366F1', '#8B5CF6', '#D946EF', '#EC4899', '#F43F5E', '#F97316', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4'];

export function getGameColor(gameId: string): string {
  let hash = 0;
  for (let i = 0; i < gameId.length; i++) {
    hash = ((hash << 5) - hash) + gameId.charCodeAt(i);
    hash = hash & hash;
  }
  const color = GAME_COLORS[Math.abs(hash) % GAME_COLORS.length];
  return color || '#6366F1';
}

export function useGameColor(gameId: string | undefined): ComputedRef<string> {
  return computed(() => getGameColor(gameId || 'default'));
}

