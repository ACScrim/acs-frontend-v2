<script setup lang="ts">

import useCollectionStore from "@/stores/collectionStore.ts";
import {onMounted} from "vue";
import CollectibleCard from "@/views/games/card-creator/CollectibleCard.vue";
import ListView from "@/components/global/ListView.vue";

const collectionStore = useCollectionStore();

onMounted(async () => {
  await collectionStore.fetchCollection();
})

</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="text-3xl font-bold text-foam-50">Ma collection de cartes</h1>
    <div v-if="!collectionStore.collection" class="text-foam-300">
      Vous n'avez pas encore de cartes dans votre collection.
    </div>
    <ListView
      v-else
      :data="collectionStore.collection?.cards ?? []"
      :itemsPerPage="9"
      paginate
    >
      <template #item="{ item: card }">
        <CollectibleCard
          :title="card.title"
          :borderAsset="card.borderAsset"
          :frontAsset="card.frontAsset"
          :customTexts="card.customTexts"
          :holographicEffect="card.holographicEffect"
          :holographicIntensity="card.holographicIntensity"
          :imageBase64="card.imageBase64"
          :imageHeight="card.imageHeight"
          :imageMimeType="card.imageMimeType"
          :imageObjectFit="card.imageObjectFit"
          :imagePosX="card.imagePosX"
          :imagePosY="card.imagePosY"
          :imageScale="card.imageScale"
          :imageUrl="card.imageUrl"
          :imageWidth="card.imageWidth"
          :rarity="card.rarity"
          :removeImageBg="card.removeImageBg"
          :titleAlign="card.titleAlign"
          :titleColor="card.titleAlign"
          :titlePosX="card.titlePosX"
          :titlePosY="card.titlePosY"
          :titleWidth="card.titleWidth"
          interactive
        />
      </template>
    </ListView>
  </div>
</template>