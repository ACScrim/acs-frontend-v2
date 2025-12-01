import { defineStore } from "pinia";
import type { CardBackground, CardBorder, CollectibleCard } from "@/types/models";
import { useToastStore } from "@/stores/toastStore.ts";

// Mock data for backgrounds
export const CARD_BACKGROUNDS: CardBackground[] = [
  { id: 'bg-1', name: 'Cosmic Purple', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'bg-2', name: 'Ocean Blue', gradient: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)' },
  { id: 'bg-3', name: 'Sunset Orange', gradient: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 100%)' },
  { id: 'bg-4', name: 'Emerald Green', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'bg-5', name: 'Fire Red', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'bg-6', name: 'Midnight Black', gradient: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)' },
  { id: 'bg-7', name: 'Golden Hour', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { id: 'bg-8', name: 'Aurora', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  // UI Kit backgrounds
  { id: 'bg-nebula', name: 'Nebula', gradient: 'radial-gradient(ellipse at 20% 80%, #1a0a2e 0%, #16213e 30%, #0f0c29 60%, #302b63 100%)' },
  { id: 'bg-hex', name: 'Hex', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%)' },
  { id: 'bg-amber-liquid', name: 'Amber Liquid', gradient: 'linear-gradient(180deg, #f6d365 0%, #fda085 30%, #f5576c 70%, #764ba2 100%)' },
];

// Mock data for borders
export const CARD_BORDERS: CardBorder[] = [
  { id: 'border-1', name: 'Simple', style: '3px solid rgba(255, 255, 255, 0.3)' },
  { id: 'border-2', name: 'Gold', style: '4px solid #f0ab49' },
  { id: 'border-3', name: 'Silver', style: '4px solid #c0c0c0' },
  { id: 'border-4', name: 'Rainbow', style: '4px solid transparent' },
  { id: 'border-5', name: 'Neon Purple', style: '3px solid #a855f7' },
  { id: 'border-6', name: 'Neon Blue', style: '3px solid #3b82f6' },
  { id: 'border-7', name: 'Double Gold', style: '6px double #f0ab49' },
  { id: 'border-8', name: 'Gradient', style: '4px solid transparent' },
  // UI Kit borders
  { id: 'border-lightning', name: 'Lightning', style: '4px solid transparent' },
  { id: 'border-blue-ring', name: 'BlueRing', style: '4px solid transparent' },
  { id: 'border-tech-frame', name: 'TechFrame', style: '4px solid transparent' },
];

// Helper to generate unique ID
const generateId = () => `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const useCardStore = defineStore('cards', {
  state: () => ({
    cards: [] as CollectibleCard[],
    backgrounds: CARD_BACKGROUNDS,
    borders: CARD_BORDERS,
    loading: false,
  }),
  actions: {
    // Mock API: Fetch all cards
    async fetchCards() {
      this.loading = true;
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        // In real implementation, this would call the API
        // const { data: { data: cards }} = await api.get<ApiResponse<CollectibleCard[]>>("/cards");
        // this.cards = cards;
      } catch {
        useToastStore().error("Erreur lors de la récupération des cartes.");
      } finally {
        this.loading = false;
      }
    },

    // Mock API: Create a new card
    async createCard(cardData: Omit<CollectibleCard, 'id' | 'createdAt' | 'createdBy'>): Promise<CollectibleCard | null> {
      this.loading = true;
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newCard: CollectibleCard = {
          ...cardData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          createdBy: 'current-user', // Would be fetched from userStore in real implementation
        };
        
        // In real implementation:
        // const { data: { data: card }} = await api.post<ApiResponse<CollectibleCard>>("/cards", cardData);
        
        this.cards.push(newCard);
        useToastStore().success("Carte créée avec succès !");
        return newCard;
      } catch {
        useToastStore().error("Erreur lors de la création de la carte.");
        return null;
      } finally {
        this.loading = false;
      }
    },

    // Mock API: Delete a card
    async deleteCard(cardId: string) {
      this.loading = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        // In real implementation:
        // await api.delete(`/cards/${cardId}`);
        
        this.cards = this.cards.filter(c => c.id !== cardId);
        useToastStore().success("Carte supprimée avec succès !");
      } catch {
        useToastStore().error("Erreur lors de la suppression de la carte.");
      } finally {
        this.loading = false;
      }
    },

    // Get background by ID
    getBackgroundById(id: string): CardBackground | undefined {
      return this.backgrounds.find(bg => bg.id === id);
    },

    // Get border by ID
    getBorderById(id: string): CardBorder | undefined {
      return this.borders.find(b => b.id === id);
    },
  }
});

export default useCardStore;
