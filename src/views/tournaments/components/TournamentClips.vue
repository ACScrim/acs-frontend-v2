<script setup lang="ts">
import ListView from '@/components/global/ListView.vue';
import { Button, Card } from '@/components/ui';
import type { Tournament } from '@/types/models';

defineProps<{
  tournament: Tournament;
}>();
</script>

<template>
  <Card
    class="p-6"
    style="border: 2px solid #D4AF37;"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <h2
        class="text-2xl font-bold bg-gradient-to-r from-christmas-gold via-christmas-gold-light to-christmas-gold bg-clip-text text-transparent flex items-center gap-2"
        >
        🎬 Clips du tournoi 🎬
      </h2>
      <Button>
        Ajouter un clip
      </Button>
    </div>
    </template>
    <ListView :data="tournament.clips" :empty-title="'Aucun clip pour ce tournoi.'">
      <template #item="{ item }">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 p-4 border-b border-gray-200">
          <a
            :href="item.url"
            target="_blank"
            class="text-blue-600 hover:underline break-all"
          >
            {{ item.url }}
          </a>
          <div class="text-sm text-gray-500">
            Ajouté le {{ new Date(item.addedAt).toLocaleDateString() }} 
            <span v-if="item.addedBy">par {{ item.addedBy.username }}</span>
          </div>
        </div>
      </template>
    </ListView>
  </Card>
</template>