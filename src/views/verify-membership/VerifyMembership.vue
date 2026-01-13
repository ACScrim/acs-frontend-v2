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
            <p v-if="lastErrorMessage" class="mt-3 text-sm text-white/70">
              Dernier état :
              <span v-if="lastStatusCode" class="font-semibold">HTTP {{ lastStatusCode }}</span>
              <span v-else class="font-semibold">réseau</span>
              — {{ lastErrorMessage }}
              <span class="text-white/40">(tentative {{ attempts }})</span>
            </p>
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
            <a
                v-if="inviteUrl"
                :href="inviteUrl"
                target="_blank"
                rel="noopener"
                class="px-4 py-2 bg-gradient-to-br from-accent-500 to-emerald-400 text-ink-900 font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <VueIcon name="bs:box-arrow-up-right" /> Ouvrir l'invitation
            </a>
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
            {{ verificationState === 'failed'
              ? (lastErrorMessage || 'Votre session d\'authentification a expiré. Veuillez recommencer.')
              : 'La vérification a pris trop de temps. Rafraîchissez si vous avez rejoint le serveur.' }}
          </p>
          <div v-if="lastStatusCode || lastErrorMessage" class="text-xs text-white/50">
            <span v-if="lastStatusCode">HTTP {{ lastStatusCode }} · </span>
            <span v-if="attempts">tentatives {{ attempts }} · </span>
            <span v-if="lastErrorMessage">{{ lastErrorMessage }}</span>
          </div>
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
import {onMounted, onUnmounted, computed, ref} from "vue";
import {useRoute} from "vue-router";
import {Button, Card} from '@/components/ui';
import VueIcon from "@kalimahapps/vue-icons/VueIcon";

const route = useRoute();

type VerificationState = 'verifying' | 'failed' | 'timeout';
const verificationState = ref<VerificationState>('verifying');

const lastStatusCode = ref<number | null>(null);
const lastErrorMessage = ref<string | null>(null);
const attempts = ref(0);

const inviteUrl = computed(() => {
  const raw = route.query['invite'];
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
});

let intervalId: number | undefined;
let timeoutId: number | undefined;

const stopTimers = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  }
};

const runVerifyOnce = async (): Promise<void> => {
  attempts.value += 1;

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

    lastStatusCode.value = result.status;

    // 401 = la session n'a pas le discord_temp_token (perte cookie, ITP mobile, etc.)
    if (result.status === 401) {
      lastErrorMessage.value = "Session expirée ou cookie bloqué. Reconnectez-vous.";
      verificationState.value = 'failed';
      stopTimers();
      return;
    }

    // 403 = pas encore membre (ou propagation Discord). On continue à poller.
    if (result.status === 403) {
      lastErrorMessage.value = "Pas encore détecté comme membre du serveur. Si vous venez d'accepter l'invitation, patientez quelques secondes.";
      return;
    }

    // Autres erreurs HTTP
    if (!result.ok) {
      let serverErr: any = null;
      try {
        serverErr = await result.json();
      } catch {
        // ignore
      }
      lastErrorMessage.value = serverErr?.error || serverErr?.message || `Erreur HTTP ${result.status}`;
      return;
    }

    const data = await result.json().catch(() => ({} as any));

    // Compat : l'endpoint peut répondre { message: 'User already authenticated' }
    if (data?.success || data?.message === 'User already authenticated') {
      stopTimers();
      window.location.href = "/";
      return;
    }

    // Réponse 200 mais pas succès
    lastErrorMessage.value = data?.error || data?.message || "Réponse inattendue du serveur.";
  } catch (error) {
    lastErrorMessage.value = error instanceof Error ? error.message : String(error);
  }
};

onMounted(() => {
  if (!inviteUrl.value) {
    // Sans lien d'invite, on ne peut pas vraiment guider l'utilisateur vers le serveur.
    verificationState.value = 'failed';
    lastErrorMessage.value = "Lien d'invitation manquant.";
    return;
  }

  // Polling pour vérifier l'appartenance
  intervalId = window.setInterval(runVerifyOnce, 1000);

  // lancer immédiatement sans attendre 1s
  void runVerifyOnce();

  // arrêter le polling après 5 minutes
  timeoutId = window.setTimeout(() => {
    stopTimers();
    verificationState.value = 'timeout';
  }, 5 * 60 * 1000);
});

onUnmounted(() => {
  stopTimers();
});

const handleRetry = () => {
  verificationState.value = 'verifying';
  lastStatusCode.value = null;
  lastErrorMessage.value = null;
  attempts.value = 0;
  window.location.reload();
}

const handleGoHome = () => {
  window.location.href = "/";
}

const handleReconnect = () => {
  // Relance le flow OAuth Discord
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/discord`;
}

const steps = [
  {
    title: "Acceptez l'invitation Discord",
    description: "Cliquez sur <span class='font-semibold'>\"Accepter l'invitation\"</span> pour rejoindre le serveur. Sur mobile, il est plus fiable de cliquer sur le bouton ci-dessous plutôt que d'attendre une fenêtre automatique."
  },
  {
    title: "Attendez la vérification",
    description: "Cette page vérifie automatiquement votre appartenance toutes les 1 seconde."
  },
  {
    title: "Rafraîchissez si nécessaire",
    description: "Si la vérification bloque, rafraîchissez la page (<kbd class='px-1 py-0.5 bg-white/10 rounded'>F5</kbd>)."
  }
];
</script>
