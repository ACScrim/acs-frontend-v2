<template>
  <main class="maincontainer bg-vibrant-yellow-300">
    <div class="aside">
      <slot name="aside"></slot>
    </div>
    <div class="view">
      <div class="h-full w-full max-w-7xl mx-auto p-5 space-y-8">
        <slot name="view"></slot>
      </div>
    </div>
  </main>
</template>

<style scoped>
.maincontainer {
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100dvh;
  width: 100%;
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, #80808012 1px, transparent 1px),
    linear-gradient(to bottom, #80808012 1px, transparent 1px);
}

.aside {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view {
  height: 100%;
  scrollbar-color: var(--color-vibrant-cyan-500) transparent;
  scrollbar-width: thin;
  overflow-y: overlay;
  overflow-x: hidden;
}
</style>