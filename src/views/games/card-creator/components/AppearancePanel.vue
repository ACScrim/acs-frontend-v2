<script setup lang="ts">
import type { TextAlign, TextWidth, ImageObjectFit } from '@/composables/useCardCustomization';

// Props - Accept reactive objects directly
interface Props {
  appearance: {
    titlePosX: number;
    titlePosY: number;
    titleAlign: TextAlign;
    titleWidth: TextWidth;
    titleColor: string;
    titleFontSize: number;
  };
  imageSettings: {
    posX: number;
    posY: number;
    scale: number;
    width: number;
    height: number;
    objectFit: ImageObjectFit;
    rounded: number;
    cropX: number;
    cropY: number;
  };
}

defineProps<Props>();
</script>

<template>
  <div class="space-y-6 animate-fadeIn">
    <!-- SECTION STYLE DU TITRE -->
    <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
      <h3 class="text-sm font-semibold text-foam-200">🎨 Style du titre</h3>

      <!-- Title Color -->
      <div class="space-y-2">
        <label class="text-xs text-foam-300">Couleur du titre</label>
        <div class="flex gap-3 items-center">
          <input
            :value="appearance.titleColor"
            @input="appearance.titleColor = ($event.target as HTMLInputElement).value"
            type="color"
            class="w-12 h-10 rounded cursor-pointer border border-white/10"
          />
          <input
            :value="appearance.titleColor"
            @input="appearance.titleColor = ($event.target as HTMLInputElement).value"
            type="text"
            placeholder="#ffffff"
            class="flex-1 form-input text-sm"
          />
        </div>
      </div>

      <!-- Title Font Size -->
      <div class="space-y-2">
        <label class="text-xs text-foam-300">Taille du titre</label>
        <div class="flex gap-2 items-center">
          <input
            :value="appearance.titleFontSize"
            @input="appearance.titleFontSize = Number(($event.target as HTMLInputElement).value)"
            type="range"
            min="8"
            max="40"
            class="flex-1"
          />
          <span class="text-xs text-foam-300 w-12 font-semibold">{{ appearance.titleFontSize }}px</span>
        </div>
      </div>
    </div>

    <!-- SECTION POSITION DU TITRE -->
    <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
      <h3 class="text-sm font-semibold text-foam-200">📍 Position du titre</h3>

      <div class="space-y-2">
        <label class="text-xs text-foam-300 block">Position</label>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-foam-300/80 block mb-1">X (Horizontal)</label>
            <div class="flex gap-2 items-center">
              <input
                :value="appearance.titlePosX"
                @input="appearance.titlePosX = Number(($event.target as HTMLInputElement).value)"
                type="range"
                min="0"
                max="100"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-12 font-semibold">{{ appearance.titlePosX }}%</span>
            </div>
          </div>
          <div>
            <label class="text-xs text-foam-300/80 block mb-1">Y (Vertical)</label>
            <div class="flex gap-2 items-center">
              <input
                :value="appearance.titlePosY"
                @input="appearance.titlePosY = Number(($event.target as HTMLInputElement).value)"
                type="range"
                min="0"
                max="100"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-12 font-semibold">{{ appearance.titlePosY }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Title Alignment -->
      <div class="space-y-2">
        <label class="text-xs text-foam-300 block">Alignement</label>
        <div class="flex gap-2">
          <button
            :class="appearance.titleAlign === 'left' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="appearance.titleAlign = 'left'"
          >
            ◀ Gauche
          </button>
          <button
            :class="appearance.titleAlign === 'center' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="appearance.titleAlign = 'center'"
          >
            ■ Centré
          </button>
          <button
            :class="appearance.titleAlign === 'right' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="appearance.titleAlign = 'right'"
          >
            ▶ Droite
          </button>
        </div>
      </div>

      <!-- Title width -->
      <div class="space-y-2">
        <label class="text-xs text-foam-300 block">Largeur du titre</label>
        <div class="flex gap-2">
          <button
            :class="appearance.titleWidth === 'w-full' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="appearance.titleWidth = 'w-full'"
          >
            Pleine largeur
          </button>
          <button
            :class="appearance.titleWidth === 'w-auto' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="appearance.titleWidth = 'w-auto'"
          >
            Auto
          </button>
        </div>
      </div>
    </div>

    <!-- SECTION POSITION & TAILLE DE L'IMAGE -->
    <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
      <h3 class="text-sm font-semibold text-foam-200">📐 Position & Taille de l'image</h3>

      <!-- Image Positioning -->
      <div class="space-y-2">
        <label class="text-xs text-foam-300 block">Position de l'image</label>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-foam-300/80 block mb-1">X (Horizontal)</label>
            <div class="flex gap-2 items-center">
              <input
                :value="imageSettings.posX"
                @input="imageSettings.posX = Number(($event.target as HTMLInputElement).value)"
                type="range"
                min="0"
                max="100"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-12 font-semibold">{{ imageSettings.posX }}%</span>
            </div>
          </div>
          <div>
            <label class="text-xs text-foam-300/80 block mb-1">Y (Vertical)</label>
            <div class="flex gap-2 items-center">
              <input
                :value="imageSettings.posY"
                @input="imageSettings.posY = Number(($event.target as HTMLInputElement).value)"
                type="range"
                min="0"
                max="100"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-12 font-semibold">{{ imageSettings.posY }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Scale -->
      <div class="space-y-2">
        <label class="text-xs text-foam-300">Échelle de l'image</label>
        <div class="flex gap-2 items-center">
          <input
            :value="imageSettings.scale"
            @input="imageSettings.scale = Number(($event.target as HTMLInputElement).value)"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            class="flex-1"
          />
          <span class="text-xs text-foam-300 w-12 font-semibold">{{ imageSettings.scale.toFixed(1) }}x</span>
        </div>
      </div>

      <!-- Image Container Size -->
      <div class="space-y-2">
        <label class="text-xs text-foam-300 block">Taille du conteneur</label>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-foam-300/80 block mb-1">Largeur</label>
            <div class="flex gap-2 items-center">
              <input
                :value="imageSettings.width"
                @input="imageSettings.width = Number(($event.target as HTMLInputElement).value)"
                type="range"
                min="40"
                max="250"
                step="1"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-14 font-semibold">{{ imageSettings.width }}px</span>
            </div>
          </div>
          <div>
            <label class="text-xs text-foam-300/80 block mb-1">Hauteur</label>
            <div class="flex gap-2 items-center">
              <input
                :value="imageSettings.height"
                @input="imageSettings.height = Number(($event.target as HTMLInputElement).value)"
                type="range"
                min="40"
                max="378"
                step="1"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-14 font-semibold">{{ imageSettings.height }}px</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Object Fit -->
      <div class="space-y-2">
        <label class="text-xs text-foam-300 block">Ajustement de l'image</label>
        <div class="flex gap-2">
          <button
            :class="imageSettings.objectFit === 'cover' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-3 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="imageSettings.objectFit = 'cover'"
          >
            Cover (rognée)
          </button>
          <button
            :class="imageSettings.objectFit === 'contain' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-3 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="imageSettings.objectFit = 'contain'"
          >
            Contain (complète)
          </button>
        </div>
      </div>

      <!-- Image Style - Rounded -->
      <div class="space-y-2">
        <label class="text-xs text-foam-300 block">Coins arrondis</label>
        <div class="flex gap-2 items-center">
          <input
            :value="imageSettings.rounded"
            @input="imageSettings.rounded = Number(($event.target as HTMLInputElement).value)"
            type="range"
            min="0"
            max="50"
            step="1"
            class="flex-1"
          />
          <span class="text-xs text-foam-300 w-12 font-semibold">{{ imageSettings.rounded }}px</span>
        </div>
      </div>

      <!-- Image Crop Position -->
      <div class="space-y-2">
        <label class="text-xs text-foam-300 block">Position du crop</label>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-foam-300/80 block mb-1">Horizontal</label>
            <div class="flex gap-2 items-center">
              <input
                :value="imageSettings.cropX"
                @input="imageSettings.cropX = Number(($event.target as HTMLInputElement).value)"
                type="range"
                min="0"
                max="100"
                step="1"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-12 font-semibold">{{ imageSettings.cropX }}%</span>
            </div>
          </div>
          <div>
            <label class="text-xs text-foam-300/80 block mb-1">Vertical</label>
            <div class="flex gap-2 items-center">
              <input
                :value="imageSettings.cropY"
                @input="imageSettings.cropY = Number(($event.target as HTMLInputElement).value)"
                type="range"
                min="0"
                max="100"
                step="1"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-12 font-semibold">{{ imageSettings.cropY }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
