<script setup lang="ts">
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import { RouterLink } from 'vue-router';
import { ref } from 'vue';

const currentYear = ref(new Date().getFullYear());
</script>

<template>
  <footer class="mt-auto border-t border-white/10 bg-gradient-to-t from-ink-950 via-surface-900/50 to-surface-800/30 px-6 py-8">
    <div class="mx-auto max-w-6xl">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- About Section -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <img src="/acs.avif" alt="ACS" class="h-8 w-auto" />
            <span class="font-semibold text-white">ACS</span>
          </div>
          <p class="text-sm text-foam-300/80">
            Plateforme de jeux compétitifs et de tournois passionnants.
          </p>
        </div>

        <!-- Quick Links -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider">Liens rapides</h3>
          <nav class="flex flex-col gap-2 text-sm">
            <RouterLink to="/" class="text-foam-300/70 hover:text-accent-300 transition">Accueil</RouterLink>
            <RouterLink to="/tournaments" class="text-foam-300/70 hover:text-accent-300 transition">Tournois</RouterLink>
            <RouterLink to="/games" class="text-foam-300/70 hover:text-accent-300 transition">Jeux</RouterLink>
            <RouterLink to="/leaderboard" class="text-foam-300/70 hover:text-accent-300 transition">Classement</RouterLink>
          </nav>
        </div>

        <!-- Social Links -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider">Nous suivre</h3>
          <div class="flex gap-4">
            <a href="https://discord.gg/nH5cFvyVAG" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-white/5 text-foam-300/70 hover:bg-accent-500/20 hover:text-accent-300 transition" title="Discord">
              <VueIcon name="ak:discord-fill" class="text-lg" />
            </a>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-white/5 py-6" />

      <!-- Footer Bottom -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-foam-300/60">
        <p>&copy; {{ currentYear }} ACS - Tous droits réservés.</p>
        <div class="flex gap-4">
          <a href="#" class="hover:text-accent-300 transition">Politique de confidentialité</a>
          <a href="#" class="hover:text-accent-300 transition">Conditions d'utilisation</a>
          <a href="#" class="hover:text-accent-300 transition">Contact</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Footer styles are managed via Tailwind classes */
</style>

