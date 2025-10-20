<script setup lang="ts">
import useProposalStore from '@/stores/proposalStore';
import { useUserStore } from '@/stores/userStore';
import type { GameProposal } from '@/types/models';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { formatDate } from '@vueuse/core';
import { ref } from 'vue';
import { Avatar, Badge, Button, Card } from '../ui';

const props = defineProps<{
  proposal: GameProposal;
}>();

const userId = useUserStore().user?.id;
const proposalStore = useProposalStore();

const isLoading = ref(false);

const handleVoteClick = (value: boolean) => {
  isLoading.value = true;
  proposalStore.voteOnProposal(props.proposal.id, value).finally(() => {
    isLoading.value = false;
  });
}
</script>

<template>
  <Card
    class="overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-christmas-gold/30 border border-christmas-gold/30 h-full"
    color="navy"
    :id="`proposal-card-${proposal.id}`"
  >
    <div class="flex flex-col h-full">
      <!-- Image avec overlay gradient -->
      <div class="relative overflow-hidden">
        <img v-if="proposal.imageUrl" :src="proposal.imageUrl" :alt="proposal.name"
          class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          fetchpriority="high" loading="lazy"
        />
        <!-- Gradient overlay Noël -->
        <div class="absolute inset-0 bg-gradient-to-t from-christmas-navy/40 via-christmas-navy/20 to-transparent"></div>

        <!-- Badge jour -->
        <Badge
          class="uppercase ml-auto absolute top-4 right-4 font-bold h-auto text-sm! bg-gradient-to-r from-christmas-gold to-christmas-gold-light text-christmas-navy backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg shadow-christmas-gold/40">
          {{ formatDate(new Date(proposal.createdAt), "[Ajouté le] DD/MM/YYYY", { locales: "fr" }) }}
        </Badge>
      </div>

      <!-- Contenu -->
      <div class="flex-1 flex flex-col justify-between p-6 space-y-4 bg-gradient-to-br from-christmas-navy/50 to-christmas-midnight/50">
        <div class="flex-1 flex flex-col space-y-4">
          <h2 class="text-xl font-bold text-christmas-snow group-hover:text-christmas-gold-light transition-colors line-clamp-1"
            :title="proposal.name">
            {{ proposal.name }}
          </h2>

          <div class="flex-1 flex flex-col justify-between gap-4">
            <div class="inline-flex gap-3 items-center text-christmas-gold-light">
              <p class="line-clamp-2" :id="`proposal-description-${proposal.id}`" :title="proposal.description">
                <VueIcon name="bs:megaphone" class="text-christmas-gold text-xl inline-block mr-2" />
                {{ proposal.description || 'Aucune description fournie.' }}
              </p>
            </div>

            <div class="space-y-2">
              <div class="inline-flex gap-3 items-center">
                <VueIcon name="bx:upvote" class="text-christmas-gold text-xl" />
                <span class="font-medium text-christmas-gold-light">
                  {{ proposal.votes.length }} vote{{ proposal.votes.length > 1 ? 's' : '' }}
                </span>
                <div class="inline-flex -space-x-6">
                  <Avatar 
                    v-for="vote in proposal.votes"
                    :src="vote.user.avatarUrl"
                    class="rounded-full overflow-hidden size-10 [&>img]:object-cover transition-all hover:scale-125 hover:not-first:ml-6 hover:not-first:mr-1 hover:first:mr-2.5"
                    :key="vote.user.id"
                    :alt="vote.user.username"
                    :title="vote.user.username"
                    :fallback="vote.user.username.charAt(0).toUpperCase()"
                  />
                </div>
              </div>
            </div>

            <div class="inline-flex gap-3 items-center text-christmas-gold-light">
              <p class="line-clamp-2" :id="`proposal-description-${proposal.id}`" :title="proposal.description">
                <VueIcon name="bx:user" class="text-christmas-gold text-xl inline-block mr-2" />
                Proposé par {{ proposal.proposedBy.username || 'Utilisateur inconnu.' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Bouton d'action -->
        <Button 
          class="w-full font-bold" 
          icon-position="lr" 
          :disabled="!userId || isLoading"
          :loading="isLoading"
          :color="proposal.votes.find(vote => vote.user.id === userId) ? 'christmas-red' : 'christmas-gold'"
          @click="handleVoteClick(proposal.votes.find(vote => vote.user.id === userId) ? false : true)"
        >
          <template #icon>
            <VueIcon
              :name="proposal.votes.find(vote => vote.user.id === userId) ? 'bx:downvote' : 'bx:upvote'"
              class="transition-transform group-hover:scale-110 text-xl" />
          </template>
          <span class="line-clamp-1 text-left">
            {{ proposal.votes.find(vote => vote.user.id === userId) ? 'Retirer mon vote' : 'Ajouter mon vote' }}
          </span>
        </Button>
      </div>
    </div>
  </Card>
</template>