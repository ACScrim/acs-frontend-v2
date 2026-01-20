<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@/components/ui';
import ACSSelect from "@/components/ui/ACSSelect.vue";
import type { CardCategory } from '@/types/models';

// Props
interface Props {
  // Basic info
  title: string;
  categoryId: string | undefined;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  hasMainImage: boolean;
  
  // Image source state
  imageSourceType: 'upload' | 'url' | 'discord' | 'cloudinary';
  imageUrlInput: string;
  discordSearchQuery: string;
  selectedDiscordMemberId: string;
  selectedCloudinaryImage: string;
  showAllImages: boolean;
  
  // Data from stores
  categories: CardCategory[];
  discordMembers: Array<{ id: string; username: string; avatarUrl: string }>;
  cloudinaryImages: Array<{ publicId: string; secure_url: string }>;
  isLoadingImages: boolean;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:title': [value: string];
  'update:categoryId': [value: string | undefined];
  'update:rarity': [value: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'];
  'update:imageSourceType': [value: 'upload' | 'url' | 'discord' | 'cloudinary'];
  'update:imageUrlInput': [value: string];
  'update:discordSearchQuery': [value: string];
  'update:selectedDiscordMemberId': [value: string];
  'update:selectedCloudinaryImage': [value: string];
  'show-create-category-modal': [];
  'trigger-file-input': [];
  'remove-image': [];
  'load-image-from-url': [url: string];
  'toggle-show-all-images': [];
  'refresh-images': [];
}>();

// Computed
const filteredDiscordMembers = computed(() => {
  if (!props.discordSearchQuery.trim()) return props.discordMembers;
  const query = props.discordSearchQuery.toLowerCase();
  return props.discordMembers.filter(m => 
    m.username.toLowerCase().includes(query)
  );
});
</script>

<template>
  <div class="space-y-6 animate-fadeIn">
    <!-- SECTION CATÉGORIE -->
    <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foam-200 flex items-center gap-2">
          <span>📁 Catégorie</span>
        </h3>
      </div>

      <div class="space-y-2 pt-2">
        <label class="form-label text-sm">Sélectionner ou créer une catégorie</label>
        <div class="flex gap-2">
          <ACSSelect
            :model-value="categoryId"
            @update:model-value="emit('update:categoryId', $event)"
            defaultOptionLabel="-- Pas de catégorie --"
            :options="categories.map(category => ({ label: category.name, value: category.id }))"
          />
          <Button
            variant="secondary"
            size="sm"
            @click="emit('show-create-category-modal')"
          >
            + Nouvelle
          </Button>
        </div>
      </div>
    </div>

    <!-- SECTION TITRE -->
    <div class="space-y-4 p-4 border border-accent-500/20 rounded-lg bg-gradient-to-br from-accent-900/10 to-ink-800/30 shadow-lg">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foam-200 flex items-center gap-2">
          <span>📌 Titre</span>
          <span class="text-xs text-red-400">*</span>
        </h3>
      </div>

      <div class="space-y-4 pt-2">
        <div class="space-y-2">
          <label class="form-label text-sm">Contenu du titre *</label>
          <input
            :value="title"
            @input="emit('update:title', ($event.target as HTMLInputElement).value)"
            type="text"
            maxlength="30"
            placeholder="Entrez le titre de votre carte"
            class="form-input"
          />
          <p class="text-xs text-foam-300/50">{{ title.length }}/30 caractères</p>
        </div>
      </div>
    </div>

    <!-- SECTION IMAGE PRINCIPALE -->
    <div class="space-y-4 p-4 border border-accent-500/20 rounded-lg bg-gradient-to-br from-accent-900/10 to-ink-800/30 shadow-lg">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foam-200 flex items-center gap-2">
          <span>🖼️ Image principale</span>
          <span class="text-xs text-red-400">*</span>
        </h3>
      </div>

      <div class="space-y-4 pt-2">
        <!-- Image Upload -->
        <div class="space-y-2">
          <div class="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              @click="emit('trigger-file-input')"
            >
              {{ hasMainImage ? 'Changer l\'image' : '📤 Ajouter une image' }}
            </Button>
            <Button
              v-if="hasMainImage"
              variant="danger"
              size="sm"
              @click="emit('remove-image')"
            >
              🗑️ Supprimer
            </Button>
          </div>
          <p
            v-if="!hasMainImage"
            class="text-xs text-red-400"
          >
            L'image principale est obligatoire pour sauvegarder la carte.
          </p>
        </div>

        <!-- Image Source Selection -->
        <div class="space-y-2">
          <label class="text-xs text-foam-300 block">Source de l'image</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              :class="imageSourceType === 'cloudinary' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
              class="px-3 py-2 rounded text-xs font-medium transition-all duration-200"
              @click="emit('update:imageSourceType', 'cloudinary')"
            >
              🖼️ Galerie
            </button>
            <button
              v-if="discordMembers.length > 0"
              :class="imageSourceType === 'discord' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
              class="px-3 py-2 rounded text-xs font-medium transition-all duration-200"
              @click="emit('update:imageSourceType', 'discord')"
            >
              💬 Discord
            </button>
            <button
              :class="imageSourceType === 'upload' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
              class="px-3 py-2 rounded text-xs font-medium transition-all duration-200"
              @click="emit('update:imageSourceType', 'upload')"
            >
              📤 Téléverser
            </button>
            <button
              :class="imageSourceType === 'url' ? 'bg-accent-500 text-white ring-2 ring-accent-400' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
              class="px-3 py-2 rounded text-xs font-medium transition-all duration-200"
              @click="emit('update:imageSourceType', 'url')"
            >
              🔗 URL
            </button>
          </div>
        </div>

        <!-- URL Input -->
        <div v-if="imageSourceType === 'url'" class="space-y-2">
          <label class="form-label text-sm">URL de l'image</label>
          <div class="flex gap-2">
            <input
              :value="imageUrlInput"
              @input="emit('update:imageUrlInput', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="Entrez l'URL de l'image"
              class="form-input flex-1"
            />
            <Button
              variant="secondary"
              size="sm"
              @click="emit('load-image-from-url', imageUrlInput)"
            >
              Charger
            </Button>
          </div>
        </div>

        <!-- Discord Member Selector -->
        <div v-if="imageSourceType === 'discord'" class="space-y-2">
          <label class="form-label text-sm">Sélectionner un avatar Discord</label>
          <input
            :value="discordSearchQuery"
            @input="emit('update:discordSearchQuery', ($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="🔍 Rechercher par username..."
            class="form-input"
          />
          <div v-if="filteredDiscordMembers.length > 0" class="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto border border-white/10 rounded-lg p-3 bg-ink-700/20">
            <button
              v-for="member in filteredDiscordMembers"
              :key="member.id"
              :class="selectedDiscordMemberId === member.id ? 'ring-2 ring-accent-400 border-accent-400 scale-105' : 'border-white/10 hover:border-white/30'"
              class="flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105"
              :title="member.username"
              @click="emit('update:selectedDiscordMemberId', member.id)"
            >
              <img
                :src="member.avatarUrl"
                :alt="member.username"
                class="w-12 h-12 rounded-full object-cover border border-white/10"
                loading="lazy"
              />
              <span class="text-xs text-foam-300 truncate max-w-[3rem]">{{ member.username }}</span>
            </button>
          </div>
          <div v-else class="text-xs text-foam-300/60 py-4 text-center">
            {{ discordSearchQuery ? 'Aucun membre trouvé.' : 'Aucun membre disponible.' }}
          </div>
        </div>

        <!-- Cloudinary Images Gallery -->
        <div v-if="imageSourceType === 'cloudinary'" class="space-y-2">
          <label class="form-label text-sm">Galerie d'images</label>
          <div class="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              @click="emit('toggle-show-all-images')"
              class="flex-1"
            >
              {{ showAllImages ? '📌 Afficher les images utilisées' : '🌐 Afficher toutes les images' }}
            </Button>
            <Button
              v-if="!isLoadingImages"
              variant="secondary"
              size="sm"
              @click="emit('refresh-images')"
            >
              🔄
            </Button>
            <div v-else class="text-xs text-foam-400 flex items-center px-2">Chargement...</div>
          </div>
          <div v-if="cloudinaryImages.length > 0" class="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto border border-white/10 rounded-lg p-3 bg-ink-700/20">
            <button
              v-for="image in cloudinaryImages"
              :key="image.publicId"
              :class="selectedCloudinaryImage === image.publicId ? 'ring-2 ring-accent-400 border-accent-400 scale-105' : 'border-white/10 hover:border-white/30'"
              class="w-full h-22 items-center gap-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 overflow-hidden"
              @click="emit('update:selectedCloudinaryImage', image.publicId)"
            >
              <img
                :src="image.secure_url"
                :alt="image.publicId"
                class="size-full rounded object-cover"
                loading="lazy"
              />
            </button>
          </div>
          <div v-else class="text-xs text-foam-300/60 py-4 text-center">
            {{ showAllImages ? 'Aucune image trouvée dans la galerie.' : 'Aucune image utilisée pour le moment.' }}
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION RARETÉ -->
    <div class="space-y-4 p-4 border border-white/10 rounded-lg bg-ink-800/30">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foam-200 flex items-center gap-2">
          <span>⭐ Rareté</span>
        </h3>
      </div>

      <div class="space-y-2 pt-2">
        <label class="text-xs text-foam-300 block">Sélectionnez la rareté de la carte</label>
        <div class="grid grid-cols-5 gap-2">
          <button
            v-for="r in ['common', 'uncommon', 'rare', 'epic', 'legendary']"
            :key="r"
            :class="rarity === r ? 'bg-accent-500 text-white ring-2 ring-accent-400 scale-105' : 'bg-ink-700 text-foam-300 hover:bg-ink-600'"
            class="px-2 py-2 rounded text-xs font-medium transition-all duration-200"
            :title="r.charAt(0).toUpperCase() + r.slice(1)"
            @click="emit('update:rarity', r as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary')"
          >
            {{ r === 'common' ? '⚪' : r === 'uncommon' ? '🟩' : r === 'rare' ? '🟦' : r === 'epic' ? '🟪' : '🟨' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
