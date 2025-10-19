<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import { Button, Card } from '@/components/ui';
import type { Tournament } from '@/types/models';
import { ref, computed } from 'vue';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { useDateFormat } from '@vueuse/core';

defineProps<{
  tournament: Tournament;
}>();

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
</script>

<template>
  <Card
    class="p-6 bg-christmas-navy/50"
    style="border: 2px solid #D4AF37;"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent flex items-center gap-2">
          <VueIcon name="bs:play-circle" class="text-christmas-gold" />
          Clips du tournoi
        </h2>
        <Button 
          v-if="!showFormToAddClip"
          @click="showFormToAddClip = true"
          color="christmas-gold"
        >
          <template #icon>
            <VueIcon name="bs:plus-circle" />
          </template>
          Ajouter un clip
        </Button>
      </div>
    </template>

    <!-- Formulaire d'ajout de clip -->
    <template v-if="showFormToAddClip">
      <form @submit.prevent="handleAddClip" class="space-y-6 mb-6">
        <!-- Titre -->
        <h3 class="text-lg font-bold text-christmas-gold">Ajouter un nouveau clip</h3>

        <!-- Informations importantes -->
        <div class="bg-gradient-to-br from-christmas-gold/10 to-christmas-red/10 border-l-4 border-christmas-gold rounded-lg p-4 space-y-3">
          <h4 class="font-bold text-christmas-gold flex items-center gap-2">
            <VueIcon name="bs:info-circle" />
            Formats acceptés
          </h4>
          
          <div class="space-y-2 text-sm">
            <div class="text-christmas-snow">
              <p class="font-semibold text-christmas-gold-light mb-1">YouTube :</p>
              <ul class="space-y-1 ml-4">
                <li v-for="format in youtubeFormats" :key="format" class="text-christmas-snow/80 break-all text-xs md:text-sm font-mono bg-christmas-navy/50 p-2 rounded border border-christmas-gold/20">
                  {{ format }}
                </li>
              </ul>
            </div>

            <div class="text-christmas-snow">
              <p class="font-semibold text-christmas-gold-light mb-1">Twitch :</p>
              <div class="text-christmas-snow/80 break-all text-xs md:text-sm font-mono bg-christmas-navy/50 p-2 rounded border border-christmas-gold/20">
                {{ twitchFormat }}
              </div>
            </div>
          </div>

          <div class="border-t border-christmas-gold/20 pt-3 text-xs text-christmas-gold-light">
            <p class="flex items-start gap-2">
              <VueIcon name="bs:exclamation-triangle-fill" class="flex-shrink-0 mt-0.5" />
              <span>
                <strong>Important :</strong> Votre clip sera refusé si le format n'est pas respecté. Les administrateurs se réservent le droit de supprimer tout clip ne correspondant pas au tournoi.
              </span>
            </p>
          </div>
        </div>

        <!-- Champ URL -->
        <div class="space-y-2">
          <label for="clip-url" class="block font-bold text-christmas-gold">
            <span class="flex items-center gap-2">
              <VueIcon name="bs:link-45deg" />
              URL du clip
            </span>
          </label>
          <input
            id="clip-url"
            v-model="clipUrl"
            type="text"
            placeholder="Collez l'URL de votre clip..."
            class="w-full p-3 border-2 border-christmas-gold/30 rounded-lg bg-christmas-navy/30 text-christmas-snow placeholder-christmas-gold-light/50 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/20 transition-all"
          />
          <p v-if="urlError" class="text-christmas-red text-sm font-semibold flex items-center gap-1">
            <VueIcon name="bs:exclamation-circle" />
            {{ urlError }}
          </p>
        </div>

        <!-- Boutons d'action -->
        <div class="flex gap-3">
          <Button 
            type="button"
            @click="resetForm"
            color="christmas-red"
            class="flex-1"
          >
            <template #icon>
              <VueIcon name="bs:x-circle" />
            </template>
            Annuler
          </Button>
          <Button 
            type="submit"
            :disabled="!isValidUrl"
            :color="isValidUrl ? 'christmas-green' : 'christmas-gold'"
            class="flex-1"
          >
            <template #icon>
              <VueIcon name="bs:check-circle" />
            </template>
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
        <Card class="bg-christmas-navy/30 rounded-lg border border-christmas-gold/20 space-y-4 overflow-hidden">
          <iframe
            class="w-full h-60"
            :src="clip.url"
            :title="`Clip ajouté par ${clip.addedBy?.username} pour le tournoi ${tournament.name}`"
            frameborder="0"
            allow="clipboard-write; encrypted-media; picture-in-picture"
            allowfullscreen
          ></iframe>
          <div
            class="flex flex-row justify-between items-center text-color-text-muted px-4 pb-4 space-y-1"
          >
            <p>
              Par <b>{{ clip.addedBy?.username }}</b>
            </p>
            <!-- <button
              @click="clipToDelete = clip"
              v-if="user?.role === 'admin' || user?.role === 'superadmin'"
              class="text-red-400 hover:underline"
            >
              Supprimer le clip
            </button> -->
            <p>{{ useDateFormat(clip.addedAt, '[Le] DD/MM/YYYY [à] HH:mm') }}</p>
          </div>
        </Card>
      </template>

      <template #emptyIcon>
        <VueIcon name="bs:film" class="text-6xl text-christmas-gold/50 mx-auto mb-4" />
      </template>
    </ListView>
  </Card>
</template>