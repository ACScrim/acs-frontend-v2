<script setup lang="ts">
import {ref, computed, onUnmounted, onMounted} from 'vue';
import { Button, Card } from '@/components/ui';
import CollectibleCard from './CollectibleCard.vue';
import useCardStore from '@/stores/cardStore';
import { useToastStore } from '@/stores/toastStore';

const cardStore = useCardStore();
const toastStore = useToastStore();

// TODO: Ajouté personnalisation plus poussée -> Déplacer titre et description, ajouter des effets, ajouter des icônes de rareté, etc.

// Form state
const title = ref('');
const description = ref('');
const imageUrl = ref('');
const assetCategory = ref<'background' | 'border'>('background');

const selectedFrontAssetId = ref<string | undefined>();
const selectedBorderAssetId = ref<string | undefined>();

// Custom asset state for creation
type AssetType = 'solid' | 'gradient' | 'image';

// Background asset state
const backgroundAssetName = ref('');
const backgroundAssetType = ref<AssetType>('solid');
const backgroundSolidColor = ref('#667eea');
const backgroundGradientColor1 = ref('#667eea');
const backgroundGradientColor2 = ref('#764ba2');
const backgroundGradientAngle = ref(135);
const backgroundAssetImageBase64 = ref('');
const backgroundAssetImageMimeType = ref('');
const backgroundAssetImagePreview = ref('');

// Border asset state
const borderAssetName = ref('');
const borderAssetType = ref<'solid' | 'image'>('solid');
const borderSolidColor = ref('#ffffff');
const borderAssetImageBase64 = ref('');
const borderAssetImageMimeType = ref('');
const borderAssetImagePreview = ref('');

// File input refs
const fileInputRef = ref<HTMLInputElement | null>(null);
const backgroundAssetImageInputRef = ref<HTMLInputElement | null>(null);
const borderAssetImageInputRef = ref<HTMLInputElement | null>(null);

// Helper to get current asset config based on category
const getCurrentAssetName = () => assetCategory.value === 'background' ? backgroundAssetName.value : borderAssetName.value;
const getCurrentAssetType = () => assetCategory.value === 'background' ? backgroundAssetType.value : borderAssetType.value;
const getCurrentSolidColor = () => assetCategory.value === 'background' ? backgroundSolidColor.value : borderSolidColor.value;
const getCurrentGradientColor1 = () => backgroundGradientColor1.value;
const getCurrentGradientColor2 = () => backgroundGradientColor2.value;
const getCurrentGradientAngle = () => backgroundGradientAngle.value;
const getCurrentImagePreview = () => assetCategory.value === 'background' ? backgroundAssetImagePreview.value : borderAssetImagePreview.value;

// Helper to set current asset properties
const setCurrentAssetName = (value: string) => {
  if (assetCategory.value === 'background') {
    backgroundAssetName.value = value;
  } else {
    borderAssetName.value = value;
  }
};

const setCurrentAssetType = (value: AssetType) => {
  if (assetCategory.value === 'background') {
    backgroundAssetType.value = value;
  } else {
    // Pour les bordures, on accepte seulement 'solid' et 'image'
    if (value !== 'gradient') {
      borderAssetType.value = value as 'solid' | 'image';
    }
  }
};

const setCurrentSolidColor = (value: string) => {
  if (assetCategory.value === 'background') {
    backgroundSolidColor.value = value;
  } else {
    borderSolidColor.value = value;
  }
};

const setCurrentGradientColor1 = (value: string) => {
  if (assetCategory.value === 'background') {
    backgroundGradientColor1.value = value;
  }
};

const setCurrentGradientColor2 = (value: string) => {
  if (assetCategory.value === 'background') {
    backgroundGradientColor2.value = value;
  }
};

const setCurrentGradientAngle = (value: number) => {
  if (assetCategory.value === 'background') {
    backgroundGradientAngle.value = value;
  }
};

const setCurrentImageData = (base64: string, mimeType: string, preview: string) => {
  if (assetCategory.value === 'background') {
    backgroundAssetImageBase64.value = base64;
    backgroundAssetImageMimeType.value = mimeType;
    backgroundAssetImagePreview.value = preview;
  } else {
    borderAssetImageBase64.value = base64;
    borderAssetImageMimeType.value = mimeType;
    borderAssetImagePreview.value = preview;
  }
};

const clearCurrentImageData = () => {
  if (assetCategory.value === 'background') {
    backgroundAssetImageBase64.value = '';
    backgroundAssetImageMimeType.value = '';
    backgroundAssetImagePreview.value = '';
  } else {
    borderAssetImageBase64.value = '';
    borderAssetImageMimeType.value = '';
    borderAssetImagePreview.value = '';
  }
};

// Computed
const selectedFrontAsset = computed(() => {
  if (!selectedFrontAssetId.value) {
    // Return current asset being created
    if (backgroundAssetType.value === 'solid') {
      return {
        type: 'solid' as const,
        solidColor: backgroundSolidColor.value
      };
    }
    if (backgroundAssetType.value === 'gradient') {
      return {
        type: 'gradient' as const,
        color1: backgroundGradientColor1.value,
        color2: backgroundGradientColor2.value,
        angle: backgroundGradientAngle.value
      };
    }
    if (backgroundAssetType.value === 'image' && backgroundAssetImagePreview.value) {
      return {
        type: 'image' as const,
        imageBase64: backgroundAssetImageBase64.value,
        imageMimeType: backgroundAssetImageMimeType.value
      };
    }
  }
  return cardStore.getCardAssetById(selectedFrontAssetId.value || '');
});

const selectedBorderAsset = computed(() => {
  if (!selectedBorderAssetId.value) {
    // Return current asset being created
    if (borderAssetType.value === 'solid') {
      return {
        type: 'solid' as const,
        solidColor: borderSolidColor.value
      };
    }
    if (borderAssetType.value === 'image' && borderAssetImagePreview.value) {
      return {
        type: 'image' as const,
        imageBase64: borderAssetImageBase64.value,
        imageMimeType: borderAssetImageMimeType.value
      };
    }
  }
  return cardStore.getCardAssetById(selectedBorderAssetId.value || '');
});

const isFormValid = computed(() => {
  const hasTitle = title.value.trim().length > 0;
  const hasDescription = description.value.trim().length > 0;

  // Either has a selected front asset OR has valid new asset data
  const hasFrontAsset = selectedFrontAssetId.value !== undefined || (backgroundAssetName.value.trim() && isBackgroundAssetValid.value);

  return hasTitle && hasDescription && hasFrontAsset;
});

const isBackgroundAssetValid = computed(() => {
  if (backgroundAssetType.value === 'solid') {
    return backgroundSolidColor.value.trim().length > 0;
  }
  if (backgroundAssetType.value === 'gradient') {
    return backgroundGradientColor1.value.trim().length > 0 && backgroundGradientColor2.value.trim().length > 0;
  }
  if (backgroundAssetType.value === 'image') {
    return backgroundAssetImageBase64.value.length > 0;
  }
  return false;
});

const isBorderAssetValid = computed(() => {
  if (borderAssetType.value === 'solid') {
    return borderSolidColor.value.trim().length > 0;
  }
  if (borderAssetType.value === 'image') {
    return borderAssetImageBase64.value.length > 0;
  }
  return false;
});

// Helper to revoke blob URL
const revokeImageUrl = () => {
  if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageUrl.value);
  }
};

// Handle asset image upload
const handleAssetImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];

    // Validate file type (PNG or GIF only)
    if (!['image/png', 'image/gif'].includes(file.type)) {
      toastStore.error('Veuillez sélectionner une image PNG ou GIF.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toastStore.error('L\'image ne doit pas dépasser 10MB.');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = (e.target?.result as string).split(',')[1];
      const mimeType = file.type;
      const preview = e.target?.result as string;

      if (!base64String) {
        toastStore.error('Erreur lors de la lecture du fichier.');
        return;
      }

      setCurrentImageData(base64String, mimeType, preview);
      setCurrentAssetType('image');
    };
    reader.onerror = () => {
      toastStore.error('Erreur lors de la lecture du fichier.');
    };
    reader.readAsDataURL(file);
  }
};

const triggerAssetImageInput = () => {
  if (assetCategory.value === 'background') {
    backgroundAssetImageInputRef.value?.click();
  } else {
    borderAssetImageInputRef.value?.click();
  }
};

const removeAssetImage = () => {
  clearCurrentImageData();
  if (assetCategory.value === 'background') {
    if (backgroundAssetImageInputRef.value) {
      backgroundAssetImageInputRef.value.value = '';
    }
  } else {
    if (borderAssetImageInputRef.value) {
      borderAssetImageInputRef.value.value = '';
    }
  }
};

// Build asset data from current form
const buildFrontAssetData = () => {
  if (!backgroundAssetName.value.trim() || !isBackgroundAssetValid.value) {
    return null;
  }

  return {
    name: backgroundAssetName.value,
    category: 'background' as const,
    type: backgroundAssetType.value as 'solid' | 'gradient' | 'image',
    ...(backgroundAssetType.value === 'solid' && { solidColor: backgroundSolidColor.value }),
    ...(backgroundAssetType.value === 'gradient' && {
      color1: backgroundGradientColor1.value,
      color2: backgroundGradientColor2.value,
      angle: backgroundGradientAngle.value
    }),
    ...(backgroundAssetType.value === 'image' && {
      imageBase64: backgroundAssetImageBase64.value,
      imageMimeType: backgroundAssetImageMimeType.value
    })
  };
};

const buildBorderAssetData = () => {
  if (!borderAssetName.value.trim() || !isBorderAssetValid.value) {
    return null;
  }

  return {
    name: borderAssetName.value,
    category: 'border' as const,
    type: borderAssetType.value as 'solid' | 'image',
    ...(borderAssetType.value === 'solid' && { solidColor: borderSolidColor.value }),
    ...(borderAssetType.value === 'image' && {
      imageBase64: borderAssetImageBase64.value,
      imageMimeType: borderAssetImageMimeType.value
    })
  };
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

  // Determine if we're using a new or existing front asset
  let finalFrontAssetId = selectedFrontAssetId.value;

  // If no existing asset is selected, create the new one
  if (!finalFrontAssetId) {
    // Check if asset name is provided
    if (!backgroundAssetName.value.trim()) {
      toastStore.error('Veuillez nommer le fond personnalisé ou sélectionner un fond prédéfini.');
      return;
    }

    const frontAssetData = buildFrontAssetData();

    if (!frontAssetData) {
      toastStore.error('Veuillez configurer correctement le fond.');
      return;
    }

    const newAsset = await cardStore.createCardAsset(frontAssetData);
    if (!newAsset) {
      toastStore.error('Erreur lors de la création du fond.');
      return;
    }
    finalFrontAssetId = newAsset.id;
  }

  // Determine if we're using a new or existing border asset
  let finalBorderAssetId: string | undefined;

  if (selectedBorderAssetId.value) {
    finalBorderAssetId = selectedBorderAssetId.value;
  } else if (borderAssetName.value.trim() && isBorderAssetValid.value) {
    // Check if asset name is provided for new border
    const borderAssetData = buildBorderAssetData();

    if (borderAssetData) {
      const newAsset = await cardStore.createCardAsset(borderAssetData);
      if (newAsset) {
        finalBorderAssetId = newAsset.id;
      }
    }
  }

  // Create the card with the asset IDs
  const card = await cardStore.createCard({
    title: title.value,
    description: description.value,
    imageUrl: imageUrl.value,
    frontAssetId: finalFrontAssetId,
    borderAssetId: finalBorderAssetId,
  });
  
  if (card) {
    // Reset form
    title.value = '';
    description.value = '';
    imageUrl.value = '';
    selectedFrontAssetId.value = undefined;
    selectedBorderAssetId.value = undefined;

    // Reset background asset
    backgroundAssetName.value = '';
    backgroundAssetType.value = 'solid';
    backgroundSolidColor.value = '#667eea';
    backgroundGradientColor1.value = '#667eea';
    backgroundGradientColor2.value = '#764ba2';
    backgroundGradientAngle.value = 135;
    backgroundAssetImageBase64.value = '';
    backgroundAssetImageMimeType.value = '';
    backgroundAssetImagePreview.value = '';

    // Reset border asset
    borderAssetName.value = '';
    borderAssetType.value = 'solid';
    borderSolidColor.value = '#ffffff';
    borderAssetImageBase64.value = '';
    borderAssetImageMimeType.value = '';
    borderAssetImagePreview.value = '';
  }
};

const resetForm = () => {
  title.value = '';
  description.value = '';
  imageUrl.value = '';
  selectedFrontAssetId.value = undefined;
  selectedBorderAssetId.value = undefined;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

onMounted(async () => {
  await cardStore.fetchCardAssets();
  await cardStore.fetchCards();
});
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
            :front-asset="selectedFrontAsset"
            :border-asset="selectedBorderAsset"
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

        <!-- Asset Creator Section -->
        <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-foam-200">Créer ou sélectionner un asset</h3>
            <div class="flex gap-2">
              <button
                :class="assetCategory === 'background' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                class="px-3 py-1 rounded text-xs font-medium transition-colors"
                @click="assetCategory = 'background'"
              >
                Fond
              </button>
              <button
                :class="assetCategory === 'border' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
                class="px-3 py-1 rounded text-xs font-medium transition-colors"
                @click="assetCategory = 'border'"
              >
                Bordure
              </button>
            </div>
          </div>

          <!-- Asset Type Tabs -->
          <div class="flex gap-2">
            <button
              :class="getCurrentAssetType() === 'solid' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
              class="px-3 py-2 rounded text-sm font-medium transition-colors"
              @click="setCurrentAssetType('solid')"
            >
              Couleur
            </button>
            <button
              v-if="assetCategory === 'background'"
              :class="getCurrentAssetType() === 'gradient' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
              class="px-3 py-2 rounded text-sm font-medium transition-colors"
              @click="setCurrentAssetType('gradient')"
            >
              Dégradé
            </button>
            <button
              :class="getCurrentAssetType() === 'image' ? 'bg-accent-500 text-white' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
              class="px-3 py-2 rounded text-sm font-medium transition-colors"
              @click="setCurrentAssetType('image')"
            >
              Image
            </button>
          </div>

          <!-- Solid Color -->
          <div v-if="getCurrentAssetType() === 'solid'" class="space-y-3">
            <div class="flex gap-3 items-center">
              <input
                :value="getCurrentSolidColor()"
                type="color"
                class="w-16 h-10 rounded cursor-pointer"
                @input="(e) => setCurrentSolidColor((e.target as HTMLInputElement).value)"
              />
              <input
                :value="getCurrentSolidColor()"
                type="text"
                placeholder="#667eea"
                class="flex-1 form-input text-sm"
                @input="(e) => setCurrentSolidColor((e.target as HTMLInputElement).value)"
              />
            </div>
            <div
              class="w-full h-20 rounded-lg border border-white/10"
              :style="{ background: getCurrentSolidColor() }"
            />
          </div>

          <!-- Gradient -->
          <div v-if="getCurrentAssetType() === 'gradient' && assetCategory === 'background'" class="space-y-3">
            <div>
              <label class="form-label text-sm">Couleur 1</label>
              <div class="flex gap-3 items-center mt-1">
                <input
                  :value="getCurrentGradientColor1()"
                  type="color"
                  class="w-16 h-10 rounded cursor-pointer"
                  @input="(e) => setCurrentGradientColor1((e.target as HTMLInputElement).value)"
                />
                <input
                  :value="getCurrentGradientColor1()"
                  type="text"
                  placeholder="#667eea"
                  class="flex-1 form-input text-sm"
                  @input="(e) => setCurrentGradientColor1((e.target as HTMLInputElement).value)"
                />
              </div>
            </div>
            <div>
              <label class="form-label text-sm">Couleur 2</label>
              <div class="flex gap-3 items-center mt-1">
                <input
                  :value="getCurrentGradientColor2()"
                  type="color"
                  class="w-16 h-10 rounded cursor-pointer"
                  @input="(e) => setCurrentGradientColor2((e.target as HTMLInputElement).value)"
                />
                <input
                  :value="getCurrentGradientColor2()"
                  type="text"
                  placeholder="#764ba2"
                  class="flex-1 form-input text-sm"
                  @input="(e) => setCurrentGradientColor2((e.target as HTMLInputElement).value)"
                />
              </div>
            </div>
            <div>
              <label class="form-label text-sm">Angle (0-360°)</label>
              <div class="flex gap-3 items-center mt-1">
                <input
                  :value="getCurrentGradientAngle()"
                  type="range"
                  min="0"
                  max="360"
                  class="flex-1"
                  @input="(e) => setCurrentGradientAngle(Number((e.target as HTMLInputElement).value))"
                />
                <span class="text-sm text-foam-300 w-12">{{ getCurrentGradientAngle() }}°</span>
              </div>
            </div>
            <div
              class="w-full h-20 rounded-lg border border-white/10"
              :style="{ background: `linear-gradient(${getCurrentGradientAngle()}deg, ${getCurrentGradientColor1()} 0%, ${getCurrentGradientColor2()} 100%)` }"
            />
          </div>

          <!-- Image Upload -->
          <div v-if="getCurrentAssetType() === 'image'" class="space-y-3">
            <input
              v-if="assetCategory === 'background'"
              ref="backgroundAssetImageInputRef"
              type="file"
              accept="image/png,image/gif"
              class="hidden"
              @change="handleAssetImageUpload"
            />
            <input
              v-else
              ref="borderAssetImageInputRef"
              type="file"
              accept="image/png,image/gif"
              class="hidden"
              @change="handleAssetImageUpload"
            />
            <div class="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                @click="triggerAssetImageInput"
              >
                {{ getCurrentImagePreview() ? 'Changer l\'image' : 'Ajouter une image' }}
              </Button>
              <Button
                v-if="getCurrentImagePreview()"
                variant="danger"
                size="sm"
                @click="removeAssetImage"
              >
                Supprimer
              </Button>
            </div>
            <p class="text-xs text-foam-300/50">PNG ou GIF, max 10MB</p>
            <div
              v-if="getCurrentImagePreview()"
              class="w-full h-20 rounded-lg border border-white/10 overflow-hidden"
            >
              <img
                :src="getCurrentImagePreview()"
                alt="Aperçu de l'asset"
                class="w-full h-full object-cover"
              />
            </div>
          </div>

          <!-- Asset Name (only shown when creating new asset) -->
          <div class="space-y-2">
            <label class="form-label text-sm">Nommer cet asset (pour le créer)</label>
            <input
              :value="getCurrentAssetName()"
              type="text"
              :placeholder="`ex: ${assetCategory === 'background' ? 'Ciel étoilé' : 'Bordure dorée'}`"
              class="form-input text-sm"
              @input="(e) => setCurrentAssetName((e.target as HTMLInputElement).value)"
            />
            <p class="text-xs text-foam-300/50">Laissez vide pour sélectionner un asset existant</p>
          </div>
        </div>

        <!-- Background Assets Selector -->
        <div class="space-y-3">
          <label class="form-label">Fonds disponibles</label>
          <div v-if="cardStore.getCardAssetsByCategory('background').length === 0" class="text-sm text-foam-300/60">
            Aucun fond créé pour le moment.
          </div>
          <div v-else class="grid grid-cols-4 gap-3">
            <button
              v-for="asset in cardStore.getCardAssetsByCategory('background')"
              :key="asset.id"
              class="w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 overflow-hidden"
              :class="selectedFrontAssetId === asset.id ? 'border-accent-400 ring-2 ring-accent-400/50' : 'border-white/10 hover:border-white/30'"
              :style="
                asset.type === 'solid'
                  ? { background: asset.solidColor }
                  : asset.type === 'gradient'
                    ? { background: `linear-gradient(${asset.angle || 135}deg, ${asset.color1} 0%, ${asset.color2} 100%)` }
                    : { background: '#1a1a2e' }
              "
              :title="asset.name"
              @click="selectedFrontAssetId = asset.id"
            >
              <img
                v-if="asset.type === 'image' && asset.imageBase64"
                :src="`data:${asset.imageMimeType || 'image/png'};base64,${asset.imageBase64}`"
                :alt="asset.name"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Border Assets Selector -->
        <div class="space-y-3">
          <label class="form-label">Bordures disponibles</label>
          <div v-if="cardStore.getCardAssetsByCategory('border').length === 0" class="text-sm text-foam-300/60">
            Aucune bordure créée pour le moment.
          </div>
          <div v-else class="grid grid-cols-4 gap-3">
            <button
              v-for="asset in cardStore.getCardAssetsByCategory('border')"
              :key="asset.id"
              class="w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 overflow-hidden bg-ink-800"
              :class="selectedBorderAssetId === asset.id ? 'border-accent-400 ring-2 ring-accent-400/50' : 'border-white/10 hover:border-white/30'"
              :style="
                asset.type === 'solid'
                  ? { borderColor: asset.solidColor }
                  : {}
              "
              :title="asset.name"
              @click="selectedBorderAssetId = asset.id"
            >
              <img
                v-if="asset.type === 'image' && asset.imageBase64"
                :src="`data:${asset.imageMimeType || 'image/png'};base64,${asset.imageBase64}`"
                :alt="asset.name"
                class="w-full h-full object-cover"
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
            :front-asset="card.frontAsset"
            :border-asset="card.borderAsset"
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
