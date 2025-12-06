<template>
  <div class="min-h-[70vh] py-10">
    <Card class="glass-panel mx-auto max-w-3xl space-y-8 p-8">
      <template v-if="verificationState === 'verifying'">
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="h-14 w-14 rounded-full border border-white/20 flex items-center justify-center">
            <div class="size-8 border-2 border-transparent border-t-accent-300 border-r-emerald-400 rounded-full animate-spin" />
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-foam-300/70">Connexion Discord</p>
            <h1 class="hero-title">Vérification en cours</h1>
            <p class="muted mt-2">Nous vérifions votre appartenance au serveur Discord.</p>
          </div>
        </div>

        <div class="space-y-5">
          <div v-for="(step, idx) in steps" :key="idx" class="flex items-start gap-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white/80">
              {{ idx + 1 }}
            </div>
            <div>
              <h3 class="text-white font-semibold">{{ step.title }}</h3>
              <p class="muted text-sm" v-html="step.description" />
            </div>
          </div>
          <div class="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 p-4">
            <p class="text-sm text-white/80 mb-3">💡 Vous ne voyez pas la fenêtre d'invitation ?</p>
            <Button :to="$route.query['invite'] as string" variant="outline" class="gap-2" size="sm">
              <VueIcon name="bs:box-arrow-up-right" /> Ouvrir l'invitation
            </Button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="text-5xl" v-if="verificationState === 'failed'">⚠️</div>
          <div class="text-5xl" v-else>⏱️</div>
          <h1 class="hero-title">
            {{ verificationState === 'failed' ? 'Session expirée' : "Délai d'attente dépassé" }}
          </h1>
          <p class="muted max-w-md">
            {{ verificationState === 'failed' ? 'Votre session d\'authentification a expiré. Veuillez recommencer.' : 'La vérification a pris trop de temps. Rafraîchissez si vous avez rejoint le serveur.' }}
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <Button variant="ghost" @click="handleGoHome">Retourner à l'accueil</Button>
            <Button v-if="verificationState === 'failed'" @click="handleReconnect">Se reconnecter</Button>
            <Button v-else variant="primary" @click="handleRetry">Réessayer</Button>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {Button, Card} from '@/components/ui';
import VueIcon from "@kalimahapps/vue-icons/VueIcon";

const route = useRoute();
const verificationState = ref<'verifying' | 'failed' | 'timeout'>('verifying');

onMounted(() => {
  if (route.query['invite']) {
    let linkOpened = false;
    // Polling pour vérifier l'appartenance
    const interval = setInterval(async () => {
      try {
        const result = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/discord/verify-membership`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }
        );

        if (result.ok) {
          clearInterval(interval);
          const data = await result.json();
          if (data.success) {
            window.location.href = "/";
          }
        } else if (result.status === 403) {
          if (!linkOpened) {
            window.open(route.query['invite'] as string, '_blank');
            linkOpened = true;
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
      }
    }, 3000);

    // arrêter le polling après 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      verificationState.value = 'timeout';
    }, 5 * 60 * 1000);
  }
})

const handleRetry = () => {
  verificationState.value = 'verifying';
  window.location.reload();
}

const handleGoHome = () => {
  window.location.href = "/";
}

const handleReconnect = () => {
  window.location.href = "/";
}

const steps = [
  {
    title: "Acceptez l'invitation Discord",
    description: "Une fenêtre s\'est ouverte. Cliquez sur <span class='font-semibold'>\"Accepter l'invitation\"</span> pour rejoindre le serveur."
  },
  {
    title: "Attendez la vérification",
    description: "Cette page vérifie automatiquement votre appartenance toutes les 3 secondes."
  },
  {
    title: "Rafraîchissez si nécessaire",
    description: "Si la vérification bloque, rafraîchissez la page (<kbd class='px-1 py-0.5 bg-white/10 rounded'>F5</kbd>)."
  }
];
</script>
