<template>
  <main class="maincontainer">
    <div class="aside">
      <slot name="aside"></slot>
    </div>
    <div class="view w-full max-w-7xl mx-auto p-5 space-y-8">
      <slot name="view"></slot>
    </div>
  </main>
</template>

<style scoped>
.maincontainer {
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100dvh;
  width: 100%;
}

.aside {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view {
  overflow-y: auto;
  height: 100%;
}
</style>