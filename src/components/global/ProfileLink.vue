<script setup lang="ts">
import { type User } from "@/types/models";
import {Avatar} from "@/components/ui";

defineProps({
  user: {
    type: Object as () => User,
    required: true
  },
  size: {
    type: Number,
    default: 14
  }
})
</script>

<template>
  <RouterLink :to="`/profile/${user.id}`" class="flex items-center gap-4 text-left group transition-all">
    <Avatar :src="user.avatarUrl" :alt="`Photo de ${user.username}`" :size="size" />
    <div>
      <p class="text-white font-semibold group-hover:text-azure-300">{{ user.username }}</p>
    </div>
  </RouterLink>
</template>