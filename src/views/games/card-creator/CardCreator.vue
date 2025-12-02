<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { Button, Card } from '@/components/ui';
import CollectibleCard from './CollectibleCard.vue';
import useCardStore, { CARD_BACKGROUNDS, CARD_BORDERS } from '@/stores/cardStore';
import { useToastStore } from '@/stores/toastStore';

const cardStore = useCardStore();
const toastStore = useToastStore();

// Form state
const title = ref('');
const description = ref('');
const imageUrl = ref('');
const initialBackgroundId = CARD_BACKGROUNDS[0]?.id ?? '';
const initialBorderId = CARD_BORDERS[0]?.id ?? '';

const selectedBackgroundId = ref(initialBackgroundId);
const selectedBorderId = ref(initialBorderId);

// File input ref
const fileInputRef = ref<HTMLInputElement | null>(null);

// Computed
const selectedBackground = computed(() => 
  cardStore.getBackgroundById(selectedBackgroundId.value)
);

const selectedBorder = computed(() => 
  cardStore.getBorderById(selectedBorderId.value)
);

const isFormValid = computed(() => 
  title.value.trim().length > 0 && 
  description.value.trim().length > 0
);

// Helper to revoke blob URL
const revokeImageUrl = () => {
  if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageUrl.value);
  }
};

// Methods
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toastStore.error('Veuillez sélectionner une image valide.');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toastStore.error('L\'image ne doit pas dépasser 5MB.');
      return;
    }
    
    // Revoke previous blob URL if exists
    revokeImageUrl();
    
    // Create local URL for preview
    imageUrl.value = URL.createObjectURL(file);
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const removeImage = () => {
  revokeImageUrl();
  imageUrl.value = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// Cleanup on unmount
onUnmounted(() => {
  revokeImageUrl();
});

const saveCard = async () => {
  if (!isFormValid.value) {
    toastStore.error('Veuillez remplir tous les champs requis.');
    return;
  }
  
  if (!selectedBackgroundId.value || !selectedBorderId.value) {
    toastStore.error('Veuillez sélectionner un fond et une bordure.');
    return;
  }

  const card = await cardStore.createCard({
    title: title.value,
    description: description.value,
    imageUrl: imageUrl.value,
    backgroundId: selectedBackgroundId.value,
    borderId: selectedBorderId.value,
  });
  
  if (card) {
    // Reset form (don't revoke URL as it's now saved in the card)
    title.value = '';
    description.value = '';
    imageUrl.value = '';
    selectedBackgroundId.value = initialBackgroundId;
    selectedBorderId.value = initialBorderId;
  }
};

const resetForm = () => {
  title.value = '';
  description.value = '';
  imageUrl.value = '';
  selectedBackgroundId.value = initialBackgroundId;
  selectedBorderId.value = initialBorderId;
};
</script>

<template>
  <div class="py-8 space-y-8">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <div class="h-px w-16 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
      <div>
        <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">Créateur</p>
        <h1 class="text-2xl font-semibold text-white/90">Création de Carte</h1>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Card Preview Panel -->
      <Card class="p-8 flex flex-col items-center justify-center min-h-[600px]">
        <h2 class="text-lg font-semibold text-foam-200 mb-6">Aperçu 3D</h2>
        <div class="flex-1 flex items-center justify-center">
          <CollectibleCard
            :title="title"
            :description="description"
            :image-url="imageUrl"
            :background="selectedBackground"
            :border="selectedBorder"
            :interactive="true"
          />
        </div>
        <p class="text-sm text-foam-300/60 mt-6 text-center">
          Déplacez votre souris sur la carte pour voir l'effet 3D
        </p>
      </Card>

      <!-- Editor Panel -->
      <Card class="p-8 space-y-6">
        <h2 class="text-lg font-semibold text-foam-200 mb-4">Personnalisation</h2>

        <!-- Title Input -->
        <div class="space-y-2">
          <label class="form-label">Titre *</label>
          <input
            v-model="title"
            type="text"
            maxlength="30"
            placeholder="Entrez le titre de votre carte"
            class="form-input"
          />
          <p class="text-xs text-foam-300/50">{{ title.length }}/30 caractères</p>
        </div>

        <!-- Description Input -->
        <div class="space-y-2">
          <label class="form-label">Description *</label>
          <textarea
            v-model="description"
            rows="3"
            maxlength="150"
            placeholder="Décrivez votre carte..."
            class="form-input resize-none"
          />
          <p class="text-xs text-foam-300/50">{{ description.length }}/150 caractères</p>
        </div>

        <!-- Image Upload -->
        <div class="space-y-2">
          <label class="form-label">Image</label>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload"
          />
          <div class="flex gap-3">
            <Button 
              variant="secondary" 
              size="sm"
              @click="triggerFileInput"
            >
              {{ imageUrl ? 'Changer l\'image' : 'Ajouter une image' }}
            </Button>
            <Button 
              v-if="imageUrl"
              variant="danger" 
              size="sm"
              @click="removeImage"
            >
              Supprimer
            </Button>
          </div>
        </div>

        <!-- Background Selector -->
        <div class="space-y-3">
          <label class="form-label">Fond</label>
          <div class="grid grid-cols-4 gap-3">
            <button
              v-for="bg in CARD_BACKGROUNDS"
              :key="bg.id"
              class="w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 overflow-hidden"
              :class="selectedBackgroundId === bg.id ? 'border-accent-400 ring-2 ring-accent-400/50' : 'border-white/10 hover:border-white/30'"
              :style="bg.imageUrl ? {} : { background: bg.gradient }"
              :title="bg.name"
              @click="selectedBackgroundId = bg.id"
            >
              <img 
                v-if="bg.imageUrl" 
                :src="bg.imageUrl" 
                :alt="bg.name"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Border Selector -->
        <div class="space-y-3">
          <label class="form-label">Bordure</label>
          <div class="grid grid-cols-4 gap-3">
            <button
              v-for="border in CARD_BORDERS"
              :key="border.id"
              class="w-full aspect-square rounded-lg bg-ink-800 transition-all duration-200 hover:scale-105 overflow-hidden relative"
              :class="selectedBorderId === border.id ? 'ring-2 ring-accent-400/50' : ''"
              :style="border.imageUrl ? {} : { border: border.style }"
              :title="border.name"
              @click="selectedBorderId = border.id"
            >
              <img 
                v-if="border.imageUrl" 
                :src="border.imageUrl" 
                :alt="border.name"
                class="absolute inset-0 w-full h-full object-contain"
              />
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-4 pt-4">
          <Button 
            variant="primary" 
            :disabled="!isFormValid || cardStore.loading"
            :loading="cardStore.loading"
            @click="saveCard"
            class="flex-1"
          >
            Sauvegarder la carte
          </Button>
          <Button 
            variant="ghost"
            @click="resetForm"
          >
            Réinitialiser
          </Button>
        </div>
      </Card>
    </div>

    <!-- Saved Cards Section -->
    <div v-if="cardStore.cards.length > 0" class="space-y-6">
      <div class="flex items-center gap-4">
        <div class="h-px w-16 bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-foam-300/60">Collection</p>
          <h2 class="text-xl font-semibold text-white/90">
            Vos Cartes <span class="text-foam-200/60">({{ cardStore.cards.length }})</span>
          </h2>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div 
          v-for="card in cardStore.cards" 
          :key="card.id"
          class="flex flex-col items-center"
        >
          <CollectibleCard
            :title="card.title"
            :description="card.description"
            :image-url="card.imageUrl"
            :background="cardStore.getBackgroundById(card.backgroundId)"
            :border="cardStore.getBorderById(card.borderId)"
            :interactive="true"
          />
          <Button
            variant="danger"
            size="sm"
            class="mt-4"
            @click="cardStore.deleteCard(card.id)"
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
