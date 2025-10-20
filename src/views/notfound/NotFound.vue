<script setup lang="ts">
import { Card } from '@/components/ui';
import { useRafFn } from '@vueuse/core';
import { onMounted } from 'vue';

const generateColorHex = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
}

onMounted(() => {
  const position = [30,30];
  const direction = [1,1];
  let color = generateColorHex();
  const canvas = document.getElementById('notfound-canvas') as HTMLCanvasElement;
  const context = canvas.getContext("2d");
  const text = "ACS";
  const fontSize = 30;
  
  useRafFn(() => {
    if (context && position[0] && position[1] && direction[0] && direction[1]) {
      context?.clearRect(0,0,canvas.width, canvas.height)
      context.font = `${fontSize}px Comic Sans MS, Comic Sans, cursive`;
      context.fillStyle = color;
      
      // Mesurer la largeur du texte
      const metrics = context.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize; // Approximation de la hauteur
      
      position[0] += direction[0];
      position[1] += direction[1];
      
      if (position[0] + textWidth >= canvas.width) { direction[0] = -1; color = generateColorHex(); }
      else if (position[0] <= 1) { direction[0] = 1; color = generateColorHex(); }
      if (position[1] >= canvas.height) { direction[1] = -1; color = generateColorHex(); }
      else if (position[1] <= textHeight - 10) { direction[1] = 1; color = generateColorHex(); }
      
      context.fillText(text, position[0], position[1]);
    }    
  }, { fpsLimit: 60 });
})

</script>

<template>
  <Card class="h-[calc(100dvh_-_7rem)] lg:h-[calc(100dvh_-_2.5rem)] lg:w-full relative">
    <canvas id="notfound-canvas" class="size-full">
      Your browser does not support the HTML5 canvas tag.
    </canvas>
    <Card class="absolute! top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4">
      <template #header>
        <h1 class="text-4xl font-bold text-center">Oups...</h1>
      </template>
      <p class="text-center">La page que tu cherches n'existe pas ou a été déplacée.</p>
      <p class="text-center">Retourne à l'accueil en cliquant sur le logo en haut à gauche !</p>
      <p class="text-center italic text-sm">Ou reste ici pour prédire la prochaine couleur !</p>
    </Card>
  </Card>
</template>