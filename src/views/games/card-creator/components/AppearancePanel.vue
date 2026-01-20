<script setup lang="ts">
// Props
interface Props {
  // Title style
  titleColor: string;
  titleFontSize: number;
  
  // Title position
  titlePosX: number;
  titlePosY: number;
  titleAlign: 'left' | 'center' | 'right';
  titleWidth: 'w-full' | 'w-auto';
  
  // Image position & size
  imagePosX: number;
  imagePosY: number;
  imageScale: number;
  imageWidth: number;
  imageHeight: number;
  imageObjectFit: 'cover' | 'contain';
  imageRounded: number;
  imageCropX: number;
  imageCropY: number;
}

defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:titleColor': [value: string];
  'update:titleFontSize': [value: number];
  'update:titlePosX': [value: number];
  'update:titlePosY': [value: number];
  'update:titleAlign': [value: 'left' | 'center' | 'right'];
  'update:titleWidth': [value: 'w-full' | 'w-auto'];
  'update:imagePosX': [value: number];
  'update:imagePosY': [value: number];
  'update:imageScale': [value: number];
  'update:imageWidth': [value: number];
  'update:imageHeight': [value: number];
  'update:imageObjectFit': [value: 'cover' | 'contain'];
  'update:imageRounded': [value: number];
  'update:imageCropX': [value: number];
  'update:imageCropY': [value: number];
}>();
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
            :value="titleColor"
            @input="emit('update:titleColor', ($event.target as HTMLInputElement).value)"
            type="color"
            class="w-12 h-10 rounded cursor-pointer border border-white/10"
          />
          <input
            :value="titleColor"
            @input="emit('update:titleColor', ($event.target as HTMLInputElement).value)"
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
            :value="titleFontSize"
            @input="emit('update:titleFontSize', Number(($event.target as HTMLInputElement).value))"
            type="range"
            min="8"
            max="40"
            class="flex-1"
          />
          <span class="text-xs text-foam-300 w-12 font-semibold">{{ titleFontSize }}px</span>
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
                :value="titlePosX"
                @input="emit('update:titlePosX', Number(($event.target as HTMLInputElement).value))"
                type="range"
                min="0"
                max="100"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-12 font-semibold">{{ titlePosX }}%</span>
            </div>
          </div>
          <div>
            <label class="text-xs text-foam-300/80 block mb-1">Y (Vertical)</label>
            <div class="flex gap-2 items-center">
              <input
                :value="titlePosY"
                @input="emit('update:titlePosY', Number(($event.target as HTMLInputElement).value))"
                type="range"
                min="0"
                max="100"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-12 font-semibold">{{ titlePosY }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Title Alignment -->
      <div class="space-y-2">
        <label class="text-xs text-foam-300 block">Alignement</label>
        <div class="flex gap-2">
          <button
            :class="titleAlign === 'left' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="emit('update:titleAlign', 'left')"
          >
            ◀ Gauche
          </button>
          <button
            :class="titleAlign === 'center' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="emit('update:titleAlign', 'center')"
          >
            ■ Centré
          </button>
          <button
            :class="titleAlign === 'right' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="emit('update:titleAlign', 'right')"
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
            :class="titleWidth === 'w-full' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="emit('update:titleWidth', 'w-full')"
          >
            Pleine largeur
          </button>
          <button
            :class="titleWidth === 'w-auto' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="emit('update:titleWidth', 'w-auto')"
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
                :value="imagePosX"
                @input="emit('update:imagePosX', Number(($event.target as HTMLInputElement).value))"
                type="range"
                min="0"
                max="100"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-12 font-semibold">{{ imagePosX }}%</span>
            </div>
          </div>
          <div>
            <label class="text-xs text-foam-300/80 block mb-1">Y (Vertical)</label>
            <div class="flex gap-2 items-center">
              <input
                :value="imagePosY"
                @input="emit('update:imagePosY', Number(($event.target as HTMLInputElement).value))"
                type="range"
                min="0"
                max="100"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-12 font-semibold">{{ imagePosY }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Scale -->
      <div class="space-y-2">
        <label class="text-xs text-foam-300">Échelle de l'image</label>
        <div class="flex gap-2 items-center">
          <input
            :value="imageScale"
            @input="emit('update:imageScale', Number(($event.target as HTMLInputElement).value))"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            class="flex-1"
          />
          <span class="text-xs text-foam-300 w-12 font-semibold">{{ imageScale.toFixed(1) }}x</span>
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
                :value="imageWidth"
                @input="emit('update:imageWidth', Number(($event.target as HTMLInputElement).value))"
                type="range"
                min="40"
                max="250"
                step="1"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-14 font-semibold">{{ imageWidth }}px</span>
            </div>
          </div>
          <div>
            <label class="text-xs text-foam-300/80 block mb-1">Hauteur</label>
            <div class="flex gap-2 items-center">
              <input
                :value="imageHeight"
                @input="emit('update:imageHeight', Number(($event.target as HTMLInputElement).value))"
                type="range"
                min="40"
                max="378"
                step="1"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-14 font-semibold">{{ imageHeight }}px</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Object Fit -->
      <div class="space-y-2">
        <label class="text-xs text-foam-300 block">Ajustement de l'image</label>
        <div class="flex gap-2">
          <button
            :class="imageObjectFit === 'cover' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-3 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="emit('update:imageObjectFit', 'cover')"
          >
            Cover (rognée)
          </button>
          <button
            :class="imageObjectFit === 'contain' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-3 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
            @click="emit('update:imageObjectFit', 'contain')"
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
            :value="imageRounded"
            @input="emit('update:imageRounded', Number(($event.target as HTMLInputElement).value))"
            type="range"
            min="0"
            max="50"
            step="1"
            class="flex-1"
          />
          <span class="text-xs text-foam-300 w-12 font-semibold">{{ imageRounded }}px</span>
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
                :value="imageCropX"
                @input="emit('update:imageCropX', Number(($event.target as HTMLInputElement).value))"
                type="range"
                min="0"
                max="100"
                step="1"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-12 font-semibold">{{ imageCropX }}%</span>
            </div>
          </div>
          <div>
            <label class="text-xs text-foam-300/80 block mb-1">Vertical</label>
            <div class="flex gap-2 items-center">
              <input
                :value="imageCropY"
                @input="emit('update:imageCropY', Number(($event.target as HTMLInputElement).value))"
                type="range"
                min="0"
                max="100"
                step="1"
                class="flex-1"
              />
              <span class="text-xs text-foam-300 w-12 font-semibold">{{ imageCropY }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
