<script setup lang="ts">
import Container from "./components/global/Container.vue";
import Sidebar from "./components/global/Sidebar.vue";
import ToastContainer from "./components/global/ToastContainer.vue";
import {useUserStore} from "./stores/userStore";

// Fetch user
useUserStore().fetchUser()
</script>

<template>
  <Container>
    <template #aside>
      <Sidebar />
    </template>
    <template #view>
      <ToastContainer />
      <RouterView />
    </template>
  </Container>
</template>
