<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import SectionHeader from '@/components/global/SectionHeader.vue';
import { Button, Card } from '@/components/ui';
import type { Tournament } from '@/types/models';
import { ref, computed } from 'vue';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { useDateFormat } from '@vueuse/core';
import { getGameColor } from '../composables/useGameColor';

interface Props {
  tournament: Tournament;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  addClip: [url: string];
}>();

const showFormToAddClip = ref(false);
const clipUrl = ref('');
const urlError = ref('');

const youtubeFormats = [
  'https://youtube.com/embed/dQw4w9WgXcQ',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
];

const twitchFormat = 'https://www.twitch.tv/streamer/clip/idduclip';

const isValidUrl = computed(() => {
  if (!clipUrl.value) return false;
  
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\/(.+)$/;
  const twitchRegex = /^(https?:\/\/)?(www\.)?twitch\.tv\/\w+\/clip\/[\w-]+$/;
  
  return youtubeRegex.test(clipUrl.value) || twitchRegex.test(clipUrl.value);
});

const handleAddClip = () => {
  urlError.value = '';
  
  if (!clipUrl.value.trim()) {
    urlError.value = 'Veuillez entrer une URL';
    return;
  }

  if (!isValidUrl.value) {
    urlError.value = 'Format d\'URL invalide. Consultez les formats acceptés ci-dessus.';
    return;
  }

  emit('addClip', clipUrl.value);
  clipUrl.value = '';
  showFormToAddClip.value = urlError.value !== '';
};

const resetForm = () => {
  clipUrl.value = '';
  urlError.value = '';
  showFormToAddClip.value = false;
};

const headerColor = computed((): string => {
  const gameId = props.tournament.gameId || 'default';
  return getGameColor(gameId);
});
</script>

<template>
  <Card class="glass-panel p-6">
    <template #header>
      <div class="flex items-center justify-between">
        <SectionHeader title="Clips du tournoi" :color="headerColor" icon="bs:play-circle" size-class="text-2xl" />
        <Button v-if="!showFormToAddClip" @click="showFormToAddClip = true">
          <template #icon><VueIcon name="bs:plus-circle" /></template>
          Ajouter un clip
        </Button>
      </div>
    </template>

    <!-- Formulaire d'ajout de clip -->
    <template v-if="showFormToAddClip">
      <form @submit.prevent="handleAddClip" class="space-y-6 mb-6">
        <!-- Titre -->
        <h3 class="text-lg font-semibold text-white">Ajouter un nouveau clip</h3>
        <div class="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-4 text-sm text-foam-200 space-y-2">
          <p class="font-semibold">Formats acceptés</p>
          <div class="space-y-2 text-sm">
            <div class="text-foam-100">
              <p class="font-semibold text-accent-300 mb-1">YouTube :</p>
              <ul class="space-y-1 ml-4">
                <li v-for="format in youtubeFormats" :key="format" class="text-foam-100/80 break-all text-xs md:text-sm font-mono bg-ink-800/60 p-2 rounded border border-accent-300/20">
                  {{ format }}
                </li>
              </ul>
            </div>

            <div class="text-foam-100">
              <p class="font-semibold text-accent-300 mb-1">Twitch :</p>
              <div class="text-foam-100/80 break-all text-xs md:text-sm font-mono bg-ink-800/60 p-2 rounded border border-accent-300/20">
                {{ twitchFormat }}
              </div>
            </div>
          </div>

          <div class="border-t border-white/10 pt-3 text-xs text-foam-200/80">
            <p class="flex items-start gap-2">
              <VueIcon name="bs:exclamation-triangle-fill" class="flex-shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Important :</strong> Votre clip sera refusé si le format n'est pas respecté. Les administrateurs se réservent le droit de supprimer tout clip ne correspondant pas au tournoi.
              </span>
            </p>
          </div>
        </div>
        <!-- Champ URL -->
        <div class="space-y-2">
          <label for="clip-url" class="text-sm font-semibold text-white flex items-center gap-2">
            <VueIcon name="bs:link-45deg" /> URL du clip
          </label>
          <input
            id="clip-url"
            v-model="clipUrl"
            type="text"
            class="w-full rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-3 text-white"
            placeholder="Collez l'URL de votre clip..."
          />
          <p v-if="urlError" class="text-sm text-blush-400 flex items-center gap-2">
            <VueIcon name="bs:exclamation-circle" /> {{ urlError }}
          </p>
        </div>
        <!-- Boutons d'action -->
        <div class="flex gap-3">
          <Button 
            type="button"
            variant="ghost"
            class="flex-1"
            @click="resetForm"
          >
            Annuler
          </Button>
          <Button 
            type="submit"
            class="flex-1"
            :disabled="!isValidUrl"
          >
            Ajouter le clip
          </Button>
        </div>
      </form>
    </template>

    <!-- Liste des clips -->
    <ListView 
      :data="tournament.clips" 
      empty-title="Aucun clip pour ce tournoi"
      empty-message="Soyez le premier à partager un clip de ce tournoi !"
      :max-cols="2"
    >
      <template #item="{ item: clip }">
        <Card class="glass-panel bg-white/5 p-0 overflow-hidden">
          <iframe
            class="w-full h-60"
            :src="clip.url"
            :title="`Clip ajouté par ${clip.addedBy?.username}`"
            frameborder="0"
            allow="clipboard-write; encrypted-media; picture-in-picture"
            allowfullscreen
          />
          <div class="flex items-center justify-between px-4 py-3 text-sm text-foam-200/80">
            <span>Par <strong>{{ clip.addedBy?.username }}</strong></span>
            <span>{{ useDateFormat(clip.addedAt, '[Le] DD/MM/YYYY [à] HH:mm') }}</span>
          </div>
        </Card>
      </template>
      <template #emptyIcon>
        <VueIcon name="bs:film" class="mx-auto mb-4 text-4xl text-foam-300/60" />
      </template>
    </ListView>
  </Card>
</template>
