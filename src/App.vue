<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue';

// TEMP: A DEPLACER DANS LA BONNE PAGE
const params = new URLSearchParams(window.location.search)
if (params.has('invite')) {
  // Ouvrir l'invitation Discord
  window.open(params.get('invite') as string, '_blank');
  
  // Polling pour vérifier l'appartenance
  const interval = setInterval(async () => {
    try {
      const result = await fetch('http://localhost:5000/api/auth/discord/verify-membership', {
        method: 'POST',
        credentials: 'include', // IMPORTANT: Inclure les cookies de session
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
        // Plus besoin de body avec token car on utilise les sessions
      });
      
      if (result.ok) {
        clearInterval(interval);
        const data = await result.json();
        if (data.success) {
          // Rediriger vers l'app
          window.location.href = '/dashboard';
        }
      } else if (result.status === 401) {
        // Token temporaire expiré ou session invalide
        clearInterval(interval);
        alert('Session expirée, veuillez recommencer l\'authentification');
        window.location.href = '/auth';
      } else if (result.status === 403) {
        // Pas encore membre du serveur, continuer le polling
        console.log('Pas encore membre du serveur...');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
    }
  }, 3000);
  
  // Optionnel: arrêter le polling après 5 minutes
  setTimeout(() => {
    clearInterval(interval);
    alert('Temps d\'attente dépassé. Veuillez recommencer.');
  }, 5 * 60 * 1000);
}
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
