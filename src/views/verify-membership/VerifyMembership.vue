<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import { Card } from '@/components/ui';

const route = useRoute();
const verificationState = ref<'verifying' | 'failed' | 'timeout'>('verifying');

onMounted(() => {
  if (route.query['invite']) {
    let linkOpened = false;
    // Polling pour vérifier l'appartenance
    const interval = setInterval(async () => {
      try {
        const result = await fetch(
            "http://localhost:5000/api/auth/discord/verify-membership",
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
        } else if (result.status === 401) {
          clearInterval(interval);
          verificationState.value = 'failed';
        } else if (result.status === 403) {
          console.log("Pas encore membre du serveur...");
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
</script>

<template>
  <div class="h-[calc(100dvh_-_7rem)] lg:h-[calc(100dvh_-_2.5rem)] flex items-center justify-center p-4">
    <Card class="w-full max-w-2xl p-6 bg-christmas-navy">
      <!-- État : Vérification en cours -->
      <template v-if="verificationState === 'verifying'">
        <div class="flex flex-col items-center gap-4 mb-6">
          <div class="relative w-16 h-16 animate-spin" style="animation-duration: 3s;">
            <div class="absolute inset-0 rounded-full border-4 border-christmas-gold/30"></div>
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-christmas-red border-r-christmas-gold"></div>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-center text-christmas-navy dark:text-christmas-snow">
              Vérification en cours
            </h1>
            <p class="text-center text-christmas-navy/70 dark:text-christmas-snow/70 mt-2">
              Nous vérifions votre appartenance au serveur Discord
            </p>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Étapes -->
          <div class="space-y-4">
            <div class="flex gap-4 items-start">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-christmas-red text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 class="font-semibold text-christmas-navy dark:text-christmas-snow mb-1">
                  Acceptez l'invitation Discord
                </h3>
                <p class="text-sm text-christmas-navy/70 dark:text-christmas-snow/70">
                  Une fenêtre Discord s'est ouverte. Cliquez sur <span class="font-semibold">"Accepter l'invitation"</span> pour rejoindre le serveur.
                </p>
              </div>
            </div>

            <div class="flex gap-4 items-start">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-christmas-gold text-christmas-navy flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 class="font-semibold text-christmas-navy dark:text-christmas-snow mb-1">
                  Attendez la vérification
                </h3>
                <p class="text-sm text-christmas-navy/70 dark:text-christmas-snow/70">
                  Cette page vérifiera automatiquement votre appartenance toutes les 3 secondes.
                </p>
              </div>
            </div>

            <div class="flex gap-4 items-start">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-christmas-pine text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 class="font-semibold text-christmas-navy dark:text-christmas-snow mb-1">
                  Rafraîchissez si nécessaire
                </h3>
                <p class="text-sm text-christmas-navy/70 dark:text-christmas-snow/70">
                  Si vous avez <span class="font-semibold">rejoint le serveur mais que la vérification ne se fait pas</span>, essayez de <span class="font-semibold">rafraîchir cette page</span> (appuyez sur <kbd class="px-2 py-1 bg-christmas-navy/10 dark:bg-christmas-snow/10 rounded text-xs font-mono">F5</kbd> ou <kbd class="px-2 py-1 bg-christmas-navy/10 dark:bg-christmas-snow/10 rounded text-xs font-mono">Ctrl+R</kbd>).
                </p>
              </div>
            </div>
          </div>

          <!-- Section d'aide -->
          <div class="bg-christmas-gold/10 dark:bg-christmas-gold/5 rounded-lg p-4 border border-christmas-gold/20">
            <p class="text-sm text-christmas-navy dark:text-christmas-snow mb-3">
              <span class="font-semibold">💡 Vous ne voyez pas la fenêtre d'invitation ?</span>
            </p>
            <a :href="$route.query['invite'] as string" target="_blank" class="inline-block px-4 py-2 bg-christmas-red hover:bg-christmas-red/90 text-white rounded-lg font-semibold transition-colors">
              Ouvrir l'invitation
            </a>
          </div>
        </div>
      </template>

      <!-- État : Session expirée -->
      <template v-if="verificationState === 'failed'">
        <div class="flex flex-col items-center gap-4 mb-6">
          <div class="text-5xl">⚠️</div>
          <div>
            <h1 class="text-3xl font-bold text-center text-christmas-navy dark:text-christmas-snow">
              Session expirée
            </h1>
            <p class="text-center text-christmas-navy/70 dark:text-christmas-snow/70 mt-2">
              Votre session d'authentification a expiré
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <p class="text-center text-christmas-navy/70 dark:text-christmas-snow/70">
            Veuillez recommencer le processus d'authentification.
          </p>
          <div class="flex gap-3 justify-center">
            <button @click="handleGoHome" class="px-6 py-2 bg-christmas-navy dark:bg-christmas-snow text-white dark:text-christmas-navy rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Retourner à l'accueil
            </button>
            <button @click="handleReconnect" class="px-6 py-2 bg-christmas-red hover:bg-christmas-red/90 text-white rounded-lg font-semibold transition-colors">
              Se reconnecter
            </button>
          </div>
        </div>
      </template>

      <!-- État : Délai dépassé -->
      <template v-if="verificationState === 'timeout'">
        <div class="flex flex-col items-center gap-4 mb-6">
          <div class="text-5xl">⏱️</div>
          <div>
            <h1 class="text-3xl font-bold text-center text-christmas-navy dark:text-christmas-snow">
              Délai d'attente dépassé
            </h1>
            <p class="text-center text-christmas-navy/70 dark:text-christmas-snow/70 mt-2">
              La vérification a pris trop de temps
            </p>
          </div>
        </div>

        <div class="space-y-4">
          <p class="text-center text-christmas-navy/70 dark:text-christmas-snow/70">
            Si vous avez rejoins le serveur Discord, vous pouvez réessayer en rafraîchissant la page.
          </p>
          <div class="flex gap-3 justify-center">
            <button @click="handleRetry" class="px-6 py-2 bg-christmas-gold hover:bg-christmas-gold/90 text-christmas-navy rounded-lg font-semibold transition-colors">
              Réessayer
            </button>
            <button @click="handleGoHome" class="px-6 py-2 bg-christmas-navy dark:bg-christmas-snow text-white dark:text-christmas-navy rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Retourner à l'accueil
            </button>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>