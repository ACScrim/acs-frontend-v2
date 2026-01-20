<script setup lang="ts">
// Props
interface Props {
  removeImageBg: boolean;
  holographicEffect: boolean;
  holographicIntensity: number;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:removeImageBg': [value: boolean];
  'update:holographicEffect': [value: boolean];
  'update:holographicIntensity': [value: number];
}>();
</script>

<template>
  <div class="space-y-6 animate-fadeIn">
    <!-- SECTION EFFETS -->
    <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
      <h3 class="text-sm font-semibold text-foam-200">✨ Effets visuels</h3>

      <!-- Remove Background Toggle -->
      <div class="flex items-center gap-3 p-3 rounded-lg bg-ink-700/20 hover:bg-ink-700/30 transition-all duration-200">
        <input
          :checked="removeImageBg"
          type="checkbox"
          id="removeBg"
          class="w-4 h-4 rounded cursor-pointer"
          @change="(e) => emit('update:removeImageBg', (e.target as HTMLInputElement).checked)"
        />
        <label for="removeBg" class="text-sm text-foam-300 cursor-pointer flex-1">
          🎭 Supprimer le fond de l'image (approximatif)
        </label>
      </div>

      <!-- Holographic Effect Toggle -->
      <div class="flex items-center gap-3 p-3 rounded-lg bg-ink-700/20 hover:bg-ink-700/30 transition-all duration-200">
        <input
          :checked="holographicEffect"
          type="checkbox"
          id="holoEffect"
          class="w-4 h-4 rounded cursor-pointer"
          @change="(e) => emit('update:holographicEffect', (e.target as HTMLInputElement).checked)"
        />
        <label for="holoEffect" class="text-sm text-foam-300 cursor-pointer flex-1">
          💎 Activer l'effet holographique
        </label>
      </div>

      <!-- Holographic Intensity Slider -->
      <div v-if="holographicEffect" class="space-y-2 ml-6 p-3 bg-ink-700/10 rounded-lg border-l-2 border-accent-500/30">
        <label class="text-xs text-foam-300 font-semibold">Intensité de l'effet</label>
        <div class="flex gap-2 items-center">
          <input
            :value="holographicIntensity"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="flex-1"
            @input="(e) => emit('update:holographicIntensity', Number((e.target as HTMLInputElement).value))"
          />
          <span class="text-xs text-foam-300 w-12 font-semibold">{{ Math.round(holographicIntensity * 100) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>
