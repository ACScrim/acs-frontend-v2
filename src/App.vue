<script setup lang="ts">
import Container from "./components/global/Container.vue";
import Sidebar from "./components/global/Sidebar.vue";
import ToastContainer from "./components/global/ToastContainer.vue";
import useStatsStore from "./stores/statsStore";
import useTournamentStore from "./stores/tournamentStore";
import { useUserStore } from "./stores/userStore";

// TEMP: A DEPLACER DANS LA BONNE PAGE - Logique d'authentification Discord
const params = new URLSearchParams(window.location.search);
if (params.has("invite")) {
  // Ouvrir l'invitation Discord
  window.open(params.get("invite") as string, "_blank");

  // Polling pour vérifier l'appartenance
  const interval = setInterval(async () => {
    try {
      const result = await fetch(
        "http://localhost:5000/api/auth/discord/verify-membership",
        {
          method: "POST",
          credentials: "include", // IMPORTANT: Inclure les cookies de session
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          // Plus besoin de body avec token car on utilise les sessions
        }
      );

      if (result.ok) {
        clearInterval(interval);
        const data = await result.json();
        if (data.success) {
          // Rediriger vers l'app
          window.location.href = "/dashboard";
        }
      } else if (result.status === 401) {
        // Token temporaire expiré ou session invalide
        clearInterval(interval);
        alert("Session expirée, veuillez recommencer l'authentification");
        window.location.href = "/auth";
      } else if (result.status === 403) {
        // Pas encore membre du serveur, continuer le polling
        console.log("Pas encore membre du serveur...");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
    }
  }, 3000);

  // Optionnel: arrêter le polling après 5 minutes
  setTimeout(() => {
    clearInterval(interval);
    alert("Temps d'attente dépassé. Veuillez recommencer.");
  }, 5 * 60 * 1000);
}

// Fetch user
useUserStore().fetchUser()

// Fetch tournaments
useTournamentStore().fetchTournaments();

useStatsStore().fetchHomeStats();
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
