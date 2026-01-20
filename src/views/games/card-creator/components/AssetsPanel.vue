<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui';
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import type { CardAsset } from '@/types/models';
import type { AssetType, BorderAssetType } from '@/composables/useCardAssets';

// Props - Accept reactive objects from useCardForm
interface Props {
  // Reactive asset state objects
  assetSelection: {
    assetCategory: 'background' | 'border';
    selectedFrontAssetId: string | undefined;
    selectedBorderAssetId: string | undefined;
    useCustomFrontAsset: boolean;
    useCustomBorderAsset: boolean;
  };
  backgroundAsset: {
    name: string;
    type: AssetType;
    solidColor: string;
    gradientColor1: string;
    gradientColor2: string;
    gradientAngle: number;
    imageBase64: string;
    imagePreview: string;
  };
  borderAsset: {
    name: string;
    type: BorderAssetType;
    solidColor: string;
    imageBase64: string;
    imagePreview: string;
  };
  
  // Asset lists and validation
  filteredBackgroundAssets: CardAsset[];
  filteredBorderAssets: CardAsset[];
  isBackgroundAssetValid: boolean;
  isBorderAssetValid: boolean;
  showAllAssets: boolean;
  
  // User ID for delete permission
  userId: string | undefined;
}

const props = defineProps<Props>();

// Emits for parent-level operations
const emit = defineEmits<{
  'trigger-asset-image-input': [];
  'remove-asset-image': [];
  'apply-current-asset': [];
  'delete-asset': [assetId: string];
  'toggle-show-all-assets': [];
}>();

// Helper computed properties
const getCurrentAssetName = computed(() => 
  props.assetSelection.assetCategory === 'background' 
    ? props.backgroundAsset.name 
    : props.borderAsset.name
);

const getCurrentAssetType = computed(() => 
  props.assetSelection.assetCategory === 'background' 
    ? props.backgroundAsset.type 
    : props.borderAsset.type
);

const getCurrentSolidColor = computed(() => 
  props.assetSelection.assetCategory === 'background' 
    ? props.backgroundAsset.solidColor 
    : props.borderAsset.solidColor
);

const getCurrentImagePreview = computed(() => 
  props.assetSelection.assetCategory === 'background' 
    ? props.backgroundAsset.imagePreview 
    : props.borderAsset.imagePreview
);

const isCurrentAssetValid = computed(() => 
  props.assetSelection.assetCategory === 'background' 
    ? props.isBackgroundAssetValid 
    : props.isBorderAssetValid
);

// Helper methods for setting values
const setCurrentAssetName = (value: string) => {
  if (props.assetSelection.assetCategory === 'background') {
    props.backgroundAsset.name = value;
  } else {
    props.borderAsset.name = value;
  }
};

const setCurrentAssetType = (value: AssetType) => {
  if (props.assetSelection.assetCategory === 'background') {
    props.backgroundAsset.type = value;
  } else {
    if (value !== 'gradient') {
      props.borderAsset.type = value as BorderAssetType;
    }
  }
};

const setCurrentSolidColor = (value: string) => {
  if (props.assetSelection.assetCategory === 'background') {
    props.backgroundAsset.solidColor = value;
  } else {
    props.borderAsset.solidColor = value;
  }
};

const clearFrontAssetSelection = () => {
  props.assetSelection.selectedFrontAssetId = undefined;
  props.assetSelection.useCustomFrontAsset = false;
};

const clearBorderAssetSelection = () => {
  props.assetSelection.selectedBorderAssetId = undefined;
  props.assetSelection.useCustomBorderAsset = false;
};

const selectFrontAsset = (assetId: string) => {
  props.assetSelection.selectedFrontAssetId = assetId;
  props.assetSelection.useCustomFrontAsset = false;
};

const selectBorderAsset = (assetId: string) => {
  props.assetSelection.selectedBorderAssetId = assetId;
  props.assetSelection.useCustomBorderAsset = false;
};
</script>

<template>
  <div class="space-y-6 animate-fadeIn">
    <!-- CRÉER UN ASSET -->
    <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foam-200">🎨 Créer un asset personnalisé</h3>
        <div class="flex gap-2">
          <button
            :class="assetSelection.assetCategory === 'background' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-3 py-1 rounded text-xs font-medium transition-all duration-200"
            @click="assetSelection.assetCategory = 'background'"
          >
            🖼️ Fond
          </button>
          <button
            :class="assetSelection.assetCategory === 'border' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-3 py-1 rounded text-xs font-medium transition-all duration-200"
            @click="assetSelection.assetCategory = 'border'"
          >
            🔲 Bordure
          </button>
        </div>
      </div>

      <!-- Asset Type Tabs -->
      <div class="flex gap-2">
        <button
          :class="getCurrentAssetType === 'solid' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
          class="px-3 py-2 rounded text-sm font-medium transition-all duration-200"
          @click="setCurrentAssetType('solid')"
        >
          🎨 Couleur
        </button>
        <button
          v-if="assetSelection.assetCategory === 'background'"
          :class="getCurrentAssetType === 'gradient' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
          class="px-3 py-2 rounded text-sm font-medium transition-all duration-200"
          @click="setCurrentAssetType('gradient')"
        >
          🌈 Dégradé
        </button>
        <button
          :class="getCurrentAssetType === 'image' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
          class="px-3 py-2 rounded text-sm font-medium transition-all duration-200"
          @click="setCurrentAssetType('image')"
        >
          📷 Image
        </button>
      </div>

      <!-- Solid Color -->
      <div v-if="getCurrentAssetType === 'solid'" class="space-y-3">
        <div class="flex gap-3 items-center">
          <input
            :value="getCurrentSolidColor"
            type="color"
            class="w-16 h-10 rounded cursor-pointer border border-white/10"
            @input="setCurrentSolidColor(($event.target as HTMLInputElement).value)"
          />
          <input
            :value="getCurrentSolidColor"
            type="text"
            placeholder="#667eea"
            class="flex-1 form-input text-sm"
            @input="setCurrentSolidColor(($event.target as HTMLInputElement).value)"
          />
        </div>
        <div
          class="w-full h-20 rounded-lg border border-white/10"
          :style="{ background: getCurrentSolidColor }"
        />
      </div>

      <!-- Gradient -->
      <div v-if="getCurrentAssetType === 'gradient' && assetSelection.assetCategory === 'background'" class="space-y-3">
        <div>
          <label class="form-label text-sm">Couleur 1</label>
          <div class="flex gap-3 items-center mt-1">
            <input
              :value="backgroundAsset.gradientColor1"
              type="color"
              class="w-16 h-10 rounded cursor-pointer border border-white/10"
              @input="backgroundAsset.gradientColor1 = ($event.target as HTMLInputElement).value"
            />
            <input
              :value="backgroundAsset.gradientColor1"
              type="text"
              placeholder="#667eea"
              class="flex-1 form-input text-sm"
              @input="backgroundAsset.gradientColor1 = ($event.target as HTMLInputElement).value"
            />
          </div>
        </div>
        <div>
          <label class="form-label text-sm">Couleur 2</label>
          <div class="flex gap-3 items-center mt-1">
            <input
              :value="backgroundAsset.gradientColor2"
              type="color"
              class="w-16 h-10 rounded cursor-pointer border border-white/10"
              @input="backgroundAsset.gradientColor2 = ($event.target as HTMLInputElement).value"
            />
            <input
              :value="backgroundAsset.gradientColor2"
              type="text"
              placeholder="#764ba2"
              class="flex-1 form-input text-sm"
              @input="backgroundAsset.gradientColor2 = ($event.target as HTMLInputElement).value"
            />
          </div>
        </div>
        <div>
          <label class="form-label text-sm">Angle (0-360°)</label>
          <div class="flex gap-3 items-center mt-1">
            <input
              :value="backgroundAsset.gradientAngle"
              type="range"
              min="0"
              max="360"
              class="flex-1"
              @input="backgroundAsset.gradientAngle = Number(($event.target as HTMLInputElement).value)"
            />
            <span class="text-sm text-foam-300 w-12 font-semibold">{{ backgroundAsset.gradientAngle }}°</span>
          </div>
        </div>
        <div
          class="w-full h-20 rounded-lg border border-white/10"
          :style="{ background: `linear-gradient(${backgroundAsset.gradientAngle}deg, ${backgroundAsset.gradientColor1} 0%, ${backgroundAsset.gradientColor2} 100%)` }"
        />
      </div>

      <!-- Image Upload -->
      <div v-if="getCurrentAssetType === 'image'" class="space-y-3">
        <div class="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            @click="emit('trigger-asset-image-input')"
          >
            {{ getCurrentImagePreview ? '🔄 Changer l\'image' : '📤 Ajouter une image' }}
          </Button>
          <Button
            v-if="getCurrentImagePreview"
            variant="danger"
            size="sm"
            @click="emit('remove-asset-image')"
          >
            🗑️ Supprimer
          </Button>
        </div>
        <p class="text-xs text-foam-300/50">PNG ou GIF, max 3MB</p>
        <div
          v-if="getCurrentImagePreview"
          class="w-full h-20 rounded-lg border border-white/10 overflow-hidden"
        >
          <img
            :src="getCurrentImagePreview"
            alt="Aperçu de l'asset"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <!-- Asset Name -->
      <div class="space-y-2">
        <label class="form-label text-sm">Nommer cet asset (pour le créer)</label>
        <input
          :value="getCurrentAssetName"
          type="text"
          :placeholder="`ex: ${assetSelection.assetCategory === 'background' ? 'Ciel étoilé' : 'Bordure dorée'}`"
          class="form-input text-sm"
          @input="setCurrentAssetName(($event.target as HTMLInputElement).value)"
        />
        <p class="text-xs text-foam-300/50">Laissez vide pour sélectionner un asset existant</p>
        <div class="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            @click="emit('apply-current-asset')"
            :disabled="!isCurrentAssetValid"
          >
            ✓ Utiliser cet asset
          </Button>
        </div>
      </div>
      <p class="text-xs text-foam-300/60 p-2 bg-ink-700/30 rounded border border-white/5">
        💡 Vérifiez qu'un asset similaire n'existe pas déjà avant d'en créer un nouveau
      </p>
    </div>

    <!-- SÉLECTION FOND -->
    <div class="space-y-3 p-4 border border-white/10 rounded-lg bg-ink-800/30">
      <div class="flex justify-between items-center">
        <label class="form-label flex items-center gap-2">
          <span>🖼️ Fonds disponibles</span>
        </label>
        <Button
          variant="ghost"
          size="sm"
          @click="clearFrontAssetSelection"
        >
          ✕ Aucun fond
        </Button>
      </div>
      <div class="flex justify-center">
        <Button
          variant="secondary"
          size="sm"
          @click="emit('toggle-show-all-assets')"
          class="w-full max-w-xs"
        >
          {{ showAllAssets ? '👤 Afficher mes assets uniquement' : '👥 Afficher tous les assets' }}
        </Button>
      </div>
      <div v-if="filteredBackgroundAssets.length === 0" class="text-sm text-foam-300/60 py-8 text-center border border-dashed border-white/10 rounded-lg">
        {{ showAllAssets ? 'Aucun fond créé pour le moment.' : 'Vous n\'avez créé aucun fond. Cliquez sur "Afficher tous les assets" pour voir ceux des autres utilisateurs.' }}
      </div>
      <div v-else class="grid grid-cols-4 gap-3">
        <button
          v-for="asset in filteredBackgroundAssets"
          :key="asset.id"
          class="w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 overflow-hidden relative"
          :class="assetSelection.selectedFrontAssetId === asset.id ? 'border-accent-400 ring-2 ring-accent-400/50 scale-105' : 'border-white/10 hover:border-white/30'"
          :style="
            asset.type === 'solid'
              ? { background: asset.solidColor }
              : asset.type === 'gradient'
                ? { background: `linear-gradient(${asset.angle || 135}deg, ${asset.color1} 0%, ${asset.color2} 100%)` }
                : { background: '#1a1a2e' }
          "
          :title="asset.name"
          @click="asset.id && selectFrontAsset(asset.id)"
        >
          <VueIcon v-if="asset.createdBy?.id === userId && asset.id" name="fa:trash" class="text-red-400 cursor-pointer absolute top-1 right-1 hover:scale-125 transition-transform" @click.stop="emit('delete-asset', asset.id)" />
          <img
            v-if="asset.type === 'image' && (asset.imageUrl || asset.imageBase64)"
            :src="asset.imageUrl || `data:image/png;base64,${asset.imageBase64}`"
            :alt="asset.name"
            class="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>

    <!-- SÉLECTION BORDURE -->
    <div class="space-y-3 p-4 border border-white/10 rounded-lg bg-ink-800/30">
      <div class="flex justify-between items-center">
        <label class="form-label flex items-center gap-2">
          <span>🔲 Bordures disponibles</span>
        </label>
        <Button
          variant="ghost"
          size="sm"
          @click="clearBorderAssetSelection"
        >
          ✕ Aucune bordure
        </Button>
      </div>
      <div class="flex justify-center">
        <Button
          variant="secondary"
          size="sm"
          @click="emit('toggle-show-all-assets')"
          class="w-full max-w-xs"
        >
          {{ showAllAssets ? '👤 Afficher mes assets uniquement' : '👥 Afficher tous les assets' }}
        </Button>
      </div>
      <div v-if="filteredBorderAssets.length === 0" class="text-sm text-foam-300/60 py-8 text-center border border-dashed border-white/10 rounded-lg">
        {{ showAllAssets ? 'Aucune bordure créée pour le moment.' : 'Vous n\'avez créé aucune bordure. Cliquez sur "Afficher tous les assets" pour voir ceux des autres utilisateurs.' }}
      </div>
      <div v-else class="grid grid-cols-4 gap-3">
        <button
          v-for="asset in filteredBorderAssets"
          :key="asset.id"
          class="w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 overflow-hidden bg-ink-800 relative"
          :class="assetSelection.selectedBorderAssetId === asset.id ? 'border-accent-400 ring-2 ring-accent-400/50 scale-105' : 'border-white/10 hover:border-white/30'"
          :style="
            asset.type === 'solid'
              ? { borderColor: asset.solidColor }
              : {}
          "
          :title="asset.name"
          @click="asset.id && selectBorderAsset(asset.id)"
        >
          <VueIcon v-if="asset.createdBy?.id === userId && asset.id" name="fa:trash" class="text-red-400 cursor-pointer absolute top-1 right-1 hover:scale-125 transition-transform" @click.stop="emit('delete-asset', asset.id)" />
          <img
            v-if="asset.type === 'image' && (asset.imageUrl || asset.imageBase64)"
            :src="asset.imageUrl || `data:image/png;base64,${asset.imageBase64}`"
            :alt="asset.name"
            class="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  </div>
</template>
