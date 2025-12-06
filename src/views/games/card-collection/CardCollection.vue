<script setup lang="ts">

import useCollectionStore from "@/stores/collectionStore.ts";
import {computed, onMounted, ref} from "vue";
import CollectibleCard from "@/views/games/card-creator/CollectibleCard.vue";
import ListView from "@/components/global/ListView.vue";
import type { CollectibleCard as Card } from "@/types/models";
import {useToastStore} from "@/stores/toastStore.ts";

const collectionStore = useCollectionStore();
const cards = computed(() => collectionStore.cards);

const isLoadingFullCard = ref<boolean>(false);

onMounted(async () => {
  await collectionStore.fetchCollection();
});

const handleMouseHoverPreview = async (card: any) => {
  if (isLoadingFullCard.value) return useToastStore().info('Le chargement de la carte est en cours.');
  isLoadingFullCard.value = true;
  setTimeout(() => {
    if (!collectionStore.collection) return;
    if ((card as Card).frontAsset) return; // Déjà chargé
    collectionStore.fetchFullCard(collectionStore.collection.id, card.id)
      .then(() => {
        isLoadingFullCard.value = false;
      })
      .catch(() => {
        isLoadingFullCard.value = false;
        useToastStore().error('Erreur lors du chargement de la carte complète.');
      })
      .finally(() => {
        isLoadingFullCard.value = false;
      });
  }, 1000);
};

const handleMouseLeavePreview = () => {
  if (collectionStore.listCardLoaded.length <= 0) return;
  const firstCardLoaded = collectionStore.listCardLoaded[0];
  if (!firstCardLoaded) return;
  collectionStore.unloadFullCard(firstCardLoaded);
};

</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-3xl font-bold text-foam-50">Ma collection de cartes</h1>
    <div v-if="!collectionStore.collection" class="text-foam-300">
      Vous n'avez pas encore de cartes dans votre collection.
    </div>
    <ListView
      v-else
      :data="cards"
      :itemsPerPage="9"
      paginate
    >
      <template #item="{ item: card }">
        <CollectibleCard
          v-if="(card as Card).frontAsset"
          :card="card as Card"
          interactive
          @mouseleave="handleMouseLeavePreview"
        />
        <img
          v-else
          :src="card.previewCardB64"
          alt="Aperçu de la carte"
          class="w-62.5 object-contain"
          :class="{ 'cursor-wait': isLoadingFullCard }"
          @mouseover="handleMouseHoverPreview(card)"
        />
      </template>
    </ListView>
  </div>
</template>