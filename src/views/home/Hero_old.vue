<template>
  <div class="relative w-full h-75">
    <div class="herocontainer">
      <div class="p-4 flex flex-row">
        <div class="px-10 space-y-4">
          <h1 class="uppercase text-xl font-bold">Viens jouer avec nous !</h1>
          <p>Nous organisons tous les lundi un tournoi fun sur différents jeux avec des équipes équilibrées en fonction
            du niveau des joueurs !</p>
          <p>Ajouter plus de texte ici</p>
        </div>
        <div>
          <img src="/Logo_ACS.png" class="h-full pr-20" />
        </div>
      </div>
    </div>
    <button class="uppercase font-bold text-2xl">
      Rejoins nous sur discord
    </button>
  </div>
</template>

<style scoped>
.herocontainer {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 300px;
  background: var(--acs-electric-blue-500);
  border-radius: 1rem;
  box-sizing: border-box;

  clip-path: polygon(0 0, 100% 0, 100% 100%, 60% 100%, 55% 70%, 15% 70%, 10% 100%, 0 100%);
  /* -webkit-clip-path: polygon(0 0, 100% 0, 100% 100%, 40% 100%, 35% 75%, 15% 75%, 10% 100%, 0 100%); */

  &>div {
    position: absolute;
    top: 2px;
    left: 2px;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    border-radius: 1rem;
    background: var(--acs-gradient-gaming);

    clip-path: polygon(0 0, 100% 0, 100% 100%, 60.2% 100%, 55.2% 69.4%, 14.8% 69.4%, 9.8% 100%, 0 100%);
    /* -webkit-clip-path: polygon(0 0, 100% 0, 100% 100%, 40.1% 100%, 35.1% 74.5%, 14.9% 74.5%, 9.8% 100%, 0 100%); */
  }
}

button {
  position: absolute;
  left: 10%;
  bottom: 0;
  width: 50%;
  height: 30%;
  background: var(--acs-gradient-button);
  z-index: 50;
  clip-path: polygon(11% 10%, 89% 10%, 98% 100%, 2% 100%);
}
</style>