<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import type { CustomText } from '@/composables/useCardCustomization';

// Props - Accept reactive metadata object with customTexts array
interface Props {
  metadata: {
    rarity: any;
    customTexts: CustomText[];
  };
}

const props = defineProps<Props>();

// Emits for add/remove operations (parent needs to handle array manipulation)
const emit = defineEmits<{
  'add-text': [];
  'remove-text': [index: number];
}>();
</script>

<template>
  <div class="space-y-6 animate-fadeIn">
    <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foam-200">📝 Textes personnalisés ({{ metadata.customTexts.length }}/5)</h3>
        <Button
          v-if="metadata.customTexts.length < 5"
          variant="secondary"
          size="sm"
          @click="emit('add-text')"
        >
          ➕ Ajouter texte
        </Button>
      </div>

      <!-- Custom texts list -->
      <div v-if="metadata.customTexts.length === 0" class="text-xs text-foam-300/60 py-8 text-center border border-dashed border-white/10 rounded-lg">
        <div class="mb-2">📝</div>
        Aucun texte personnalisé. Cliquez sur "+ Ajouter texte" pour en ajouter.
      </div>

      <div v-for="(text, index) in metadata.customTexts" :key="text.id || `text-${index}`" class="space-y-3 p-4 border border-white/10 rounded-lg bg-ink-700/20 hover:border-accent-500/30 transition-all duration-200">
        <!-- Text header -->
        <div class="flex items-center justify-between">
          <label class="text-xs text-foam-300 font-semibold">📄 Texte {{ index + 1 }}</label>
          <Button
            variant="danger"
            size="sm"
            @click="emit('remove-text', index)"
          >
            🗑️ Supprimer
          </Button>
        </div>

        <!-- Text content -->
        <div class="space-y-2">
          <textarea
            :value="text.content"
            @input="text.content = ($event.target as HTMLTextAreaElement).value"
            rows="2"
            maxlength="100"
            placeholder="Entrez votre texte..."
            class="form-input resize-none w-full text-sm"
          />
          <p class="text-xs text-foam-300/50">{{ text.content.length }}/100 caractères</p>
        </div>

        <!-- Text color -->
        <div class="space-y-2">
          <label class="text-xs text-foam-300">Couleur</label>
          <div class="flex gap-3 items-center">
            <input
              :value="text.color"
              type="color"
              @input="text.color = ($event.target as HTMLInputElement).value"
              class="w-12 h-8 rounded cursor-pointer border border-white/10"
            />
            <input
              :value="text.color"
              type="text"
              @input="text.color = ($event.target as HTMLInputElement).value"
              placeholder="#ffffff"
              class="flex-1 form-input text-sm"
            />
          </div>
        </div>

        <!-- Text Font Size -->
        <div class="space-y-2">
          <label class="text-xs text-foam-300">Taille du texte</label>
          <div class="flex gap-2 items-center">
            <input
              :value="text.fontSize || 14"
              @input="text.fontSize = Number(($event.target as HTMLInputElement).value)"
              type="range"
              min="8"
              max="32"
              class="flex-1"
            />
            <span class="text-xs text-foam-300 w-12 font-semibold">{{ text.fontSize || 14 }}px</span>
          </div>
        </div>

        <!-- Text positioning -->
        <div class="space-y-2">
          <label class="text-xs text-foam-300 block">Position</label>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-foam-300/80 block mb-1">X</label>
              <div class="flex gap-2 items-center">
                <input
                  :value="text.posX"
                  @input="text.posX = Number(($event.target as HTMLInputElement).value)"
                  type="range"
                  min="0"
                  max="100"
                  class="flex-1"
                />
                <span class="text-xs text-foam-300 w-12 font-semibold">{{ text.posX }}%</span>
              </div>
            </div>
            <div>
              <label class="text-xs text-foam-300/80 block mb-1">Y</label>
              <div class="flex gap-2 items-center">
                <input
                  :value="text.posY"
                  @input="text.posY = Number(($event.target as HTMLInputElement).value)"
                  type="range"
                  min="0"
                  max="100"
                  class="flex-1"
                />
                <span class="text-xs text-foam-300 w-12 font-semibold">{{ text.posY }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Text alignment -->
        <div class="space-y-2">
          <label class="text-xs text-foam-300 block">Alignement</label>
          <div class="flex gap-2">
            <button
              :class="text.align === 'left' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
              class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
              @click="text.align = 'left'"
            >
              ◀ Gauche
            </button>
            <button
              :class="text.align === 'center' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
              class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
              @click="text.align = 'center'"
            >
              ■ Centré
            </button>
            <button
              :class="text.align === 'right' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
              class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
              @click="text.align = 'right'"
            >
              ▶ Droite
            </button>
          </div>
        </div>

        <!-- Text width -->
        <div class="space-y-2">
          <label class="text-xs text-foam-300 block">Largeur du texte</label>
          <div class="flex gap-2">
            <button
              :class="text.width === 'w-full' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
              class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
              @click="text.width = 'w-full'"
            >
              Pleine largeur
            </button>
            <button
              :class="text.width === 'w-auto' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
              class="px-2 py-1 rounded text-xs font-medium transition-all duration-200 flex-1"
              @click="text.width = 'w-auto'"
            >
              Auto
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
