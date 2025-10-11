<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Props {
  text: string;
  fontSize?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  duration?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  delay?: number;
  width?: string;
  maxWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
  fontSize: 80,
  strokeColor: '#7c3aed',
  fillColor: '#7c3aed',
  strokeWidth: 2,
  duration: 3,
  fontFamily: 'Arial Black, sans-serif',
  fontWeight: 900,
  delay: 0,
  width: '100%',
  maxWidth: '100%',
});

const textRef = ref<SVGTextElement>();
const svgRef = ref<SVGSVGElement>();
const pathLength = ref(0);
const isAnimating = ref(false);
const viewBox = ref('0 0 100 100');

onMounted(() => {
  if (textRef.value && svgRef.value) {
    // Obtenir les dimensions réelles du texte
    const bbox = textRef.value.getBBox();
    
    // Calculer la longueur du chemin pour l'animation
    pathLength.value = textRef.value.getBoundingClientRect().width || 0;
    
    // Ajouter un padding autour du texte
    const padding = props.strokeWidth * 2;
    viewBox.value = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`;
    
    setTimeout(() => {
      isAnimating.value = true;
    }, props.delay);
  }
});

const style = computed(() => ({
  '--stroke-color': props.strokeColor,
  '--fill-color': props.fillColor,
  '--stroke-width': `${props.strokeWidth}px`,
  '--animation-duration': `${props.duration}s`,
  '--path-length': pathLength.value,
  'width': props.width,
  'max-width': props.maxWidth,
}));
</script>

<template>
  <svg 
    ref="svgRef"
    :viewBox="viewBox"
    xmlns="http://www.w3.org/2000/svg"
    class="text-svg"
    :style="style"
    preserveAspectRatio="xMidYMid meet"
  >
    <text
      ref="textRef"
      x="0"
      y="0"
      :font-size="fontSize"
      :font-family="fontFamily"
      :font-weight="fontWeight"
      :class="{ 'is-animating': isAnimating }"
      class="svg-text"
      dominant-baseline="hanging"
    >
      {{ text }}
    </text>
  </svg>
</template>

<style scoped>
.text-svg {
  width: var(--width, 100%);
  max-width: var(--max-width, 100%);
  height: auto;
  display: block;
}

.svg-text {
  fill: transparent;
  stroke: var(--stroke-color);
  stroke-width: var(--stroke-width);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: var(--path-length);
  stroke-dashoffset: var(--path-length);
}

.svg-text.is-animating {
  animation: draw var(--animation-duration) ease-in-out forwards,
             fill calc(var(--animation-duration) * 0.3) ease-in calc(var(--animation-duration) * 0.1) forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fill {
  to {
    fill: var(--fill-color);
  }
}
</style>