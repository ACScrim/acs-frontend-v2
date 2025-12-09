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
    class="glass-panel h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_35px_80px_rgba(0,0,0,0.45)]"
    :id="`proposal-card-${proposal.id}`"
  >
    <div class="flex h-full flex-col">
      <div class="relative h-48 overflow-hidden">
        <img v-if="proposal.imageUrl" :src="proposal.imageUrl" :alt="proposal.name"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
        <Badge class="absolute top-4 right-4" tone="neutral" size="sm">
          {{ formatDate(new Date(proposal.createdAt), "DD MMM YYYY", { locales: "fr" }) }}
        </Badge>
      </div>

      <div class="flex flex-1 flex-col gap-4 bg-gradient-to-b from-surface-700/50 to-surface-800/40 p-6">
        <div class="space-y-2">
          <h2 class="text-xl font-semibold text-white line-clamp-1 font-display" :title="proposal.name">{{ proposal.name }}</h2>
          <p class="muted line-clamp-3 flex items-start gap-2">
            <VueIcon name="bs:megaphone" class="text-accent-300" />
            {{ proposal.description || 'Aucune description fournie.' }}
          </p>
        </div>

        <div class="space-y-3">
          <div class="flex items-center gap-3 text-sm text-foam-200/80">
            <VueIcon name="bx:user" class="text-accent-300" />
            Proposé par
            <RouterLink :to="`/profile/${proposal.proposedBy.id}`" class="text-white font-semibold hover:text-accent-200">
              {{ proposal.proposedBy.username || 'Utilisateur inconnu' }}
            </RouterLink>
          </div>
          <div class="flex flex-wrap items-center gap-3 text-sm text-foam-200/80">
            <VueIcon name="bx:upvote" class="text-emerald-400" />
            {{ proposal.votes.length }} vote{{ proposal.votes.length > 1 ? 's' : '' }}
            <div class="inline-flex -space-x-3">
              <RouterLink :to="`/user/${vote.user.id}`" v-for="vote in proposal.votes" :key="vote.user.id" class="not-first:not-last:hover:mx-1 first:hover:mr-1 transition-all">
                <Avatar
                  :src="vote.user.avatarUrl"
                  class="rounded-full border border-white/10"
                  :alt="vote.user.username"
                  :title="vote.user.username"
                  :fallback="vote.user.username.charAt(0).toUpperCase()"
                  :size="10"
                />
              </RouterLink>
            </div>
          </div>
        </div>

        <Button
          class="w-full justify-between"
          icon-position="lr"
          :disabled="!userId || isLoading"
          :loading="isLoading"
          :variant="proposal.votes.find(vote => vote.user.id === userId) ? 'outline' : 'primary'"
          @click="handleVoteClick(proposal.votes.find(vote => vote.user.id === userId) ? false : true)"
        >
          <template #icon>
            <VueIcon :name="proposal.votes.find(vote => vote.user.id === userId) ? 'bx:downvote' : 'bx:upvote'" />
          </template>
          {{ proposal.votes.find(vote => vote.user.id === userId) ? 'Retirer mon vote' : 'Ajouter mon vote' }}
        </Button>
      </div>
    </div>
  </Card>
</template>