<template>
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 1080 1080" class="loader-svg size-100 place-self-center-safe">
    <polygon class="st7"
      points="163.61 542.07 259.01 542.07 274.82 511.64 288.26 542.07 381.68 542.07 323.65 389.57 202.56 389.57 219.4 406.42 163.61 542.07" />
    <polygon class="st3" points="159.78 572.07 57.54 829.02 188.88 731.37 255.1 572.07 159.78 572.07" />
    <polygon class="st6"
      points="291.59 572.07 307.29 609.3 262.13 609.3 225.02 706.95 340.01 706.95 348.06 731.37 445.72 731.37 385.26 572.07 291.59 572.07" />
    <path class="st10"
      d="M605.81,633.71c-20.18,0-37.44-7.16-51.76-21.48-13.94-13.94-21.08-20.66-21.45-40.16h-97.67c.37,46.51,17.04,76.26,50.03,109.25,33.36,33.37,73.65,50.05,120.85,50.05h97.66l-24.41-97.66h-73.24Z" />
    <path class="st8"
      d="M533.02,542.07c1.74-16.61,8.74-21.07,21.04-33.36,14.32-14.32,31.57-21.48,51.76-21.48h73.24l24.41-97.66h-97.66c-47.2,0-87.49,16.69-120.85,50.05-31.37,31.37-47.99,58.85-49.87,102.45h97.92Z" />
    <path class="st1"
      d="M955.61,515.87c-31.14,31.14-62.28,62.28-93.42,93.42.42,0,40.1,0,40.1,0,16.27,0,24.41,3.75,24.41,11.23,0,8.79-8.14,13.18-24.41,13.18h-48.83l-97.66,97.66h146.48c81.38,0,122.07-36.95,122.07-110.84,0-58.3-16.25-93.18-68.75-104.66Z" />
    <path class="st4"
      d="M828.49,608.85c31.71-31.71,63.42-63.42,95.14-95.14-9.67-1.38-10.11-2.07-21.33-2.07h-48.83c-16.28,0-24.41-4.39-24.41-13.18,0-7.48,8.14-11.23,24.41-11.23h48.83l97.66-97.66h-146.48c-81.38,0-122.07,36.3-122.07,108.89s25.7,106.01,97.1,110.39Z" />
  </svg>
</template>

<style scoped>
/* Loader SVG - Dessiner progressivement chaque path */
.loader-svg .st1,
.loader-svg .st3,
.loader-svg .st4,
.loader-svg .st6,
.loader-svg .st7,
.loader-svg .st8,
.loader-svg .st10 {
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke: #a855f7;
  /* acs-purple */
  stroke-width: 8px;
  fill: white;

  /* Calculer la longueur totale du path */
  stroke-dasharray: 1000;
  /* Valeur suffisamment grande pour couvrir tous les paths */
  stroke-dashoffset: 2000;

  /* Animation GPU */
  will-change: stroke-dashoffset;
  transform: translateZ(0);

  /* Dessiner progressivement */
  animation: draw 2s alternate infinite;
}

/* Décalage pour animer les paths les uns après les autres */
.loader-svg .st7 {
  animation-delay: 0s;
}

.loader-svg .st3 {
  animation-delay: 0.2s;
}

.loader-svg .st6 {
  animation-delay: 0.4s;
}

.loader-svg .st10 {
  animation-delay: 0.6s;
}

.loader-svg .st8 {
  animation-delay: 0.8s;
}

.loader-svg .st1 {
  animation-delay: 1s;
}

.loader-svg .st4 {
  animation-delay: 1.2s;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
    fill: #a855f740;
  }
}

/* Animation du SVG complet (fade in) */
.loader-svg {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>