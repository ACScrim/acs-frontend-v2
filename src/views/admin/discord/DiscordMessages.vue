<script setup lang="ts">
import {onMounted, reactive, ref, computed, watch} from 'vue';
import {Badge, Button, Card} from '@/components/ui';
import useAdminStore from '@/stores/adminStore';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';

const adminStore = useAdminStore();
const loading = ref(false);
const form = reactive({
  targetType: 'channel' as 'channel' | 'dm',
  discordChannelId: '',
  discordUserId: '',
  messageType: 'text' as 'text' | 'embed',
  content: '',
  embed: {
    title: '',
    description: '',
    color: '#0099ff',
    imageUrl: '',
    footer: '',
    fields: [] as Array<{ name: string; value: string; inline?: boolean }>
  }
});

const newField = reactive({ name: '', value: '', inline: false });

const addField = () => {
  if (!newField.name || !newField.value) return;
  form.embed.fields.push({ name: newField.name, value: newField.value, inline: newField.inline });
  newField.name = '';
  newField.value = '';
  newField.inline = false;
};

const removeField = (index: number) => {
  form.embed.fields.splice(index, 1);
};

const sendMessage = async () => {
  loading.value = true;
  try {
    await adminStore.sendDiscordMessage({
      targetType: form.targetType,
      discordChannelId: form.targetType === 'channel' ? form.discordChannelId : undefined,
      discordUserId: form.targetType === 'dm' ? form.discordUserId : undefined,
      messageType: form.messageType,
      content: form.messageType === 'text' ? form.content : undefined,
      embed: form.messageType === 'embed' ? form.embed : undefined
    });
    form.content = '';
  } finally {
    loading.value = false;
  }
};

const selectedUserId = ref<string>('');
const threadsLoading = ref(false);

const loadMetaAndThreads = async () => {
  threadsLoading.value = true;
  await Promise.all([adminStore.fetchDiscordMeta(), adminStore.fetchDiscordThreads()]);
  threadsLoading.value = false;
};

const selectThread = async (discordUserId: string) => {
  selectedUserId.value = discordUserId;
  await adminStore.fetchDiscordConversation(discordUserId);
};

const selectedMember = computed(() => adminStore.discordMeta.members.find((m: any) => m.id === selectedUserId.value));
const channelOptions = computed(() => adminStore.discordMeta.channels || []);
const memberOptions = computed(() => adminStore.discordMeta.members || []);

watch(() => adminStore.discordThreads, (threads) => {
  if (!selectedUserId.value && threads.length > 0) {
    selectThread(threads[0].discordUserId);
  }
});

watch(selectedUserId, (val) => {
  if (val && form.targetType === 'dm') {
    form.discordUserId = val;
  }
});

onMounted(() => {
  loadMetaAndThreads();
});
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="hero-title">Messages Discord</h1>
      <p class="muted">Envoyer des messages et consulter les DMs reçus</p>
    </div>

    <Card class="glass-panel p-6 space-y-4">
      <div class="flex flex-wrap gap-3">
        <Button :variant="form.targetType === 'channel' ? 'primary' : 'outline'" @click="form.targetType = 'channel'">Salon</Button>
        <Button :variant="form.targetType === 'dm' ? 'primary' : 'outline'" @click="form.targetType = 'dm'">Message privé</Button>
        <Button :variant="form.messageType === 'text' ? 'primary' : 'outline'" @click="form.messageType = 'text'">Texte</Button>
        <Button :variant="form.messageType === 'embed' ? 'primary' : 'outline'" @click="form.messageType = 'embed'">Embed</Button>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div v-if="form.targetType === 'channel'">
          <label class="label">Salon</label>
          <select class="form-input" v-model="form.discordChannelId">
            <option value="" disabled>Choisir un salon</option>
            <option v-for="ch in channelOptions" :key="ch.id" :value="ch.id">#{{ ch.name }}</option>
          </select>
        </div>
        <div v-if="form.targetType === 'dm'">
          <label class="label">Membre</label>
          <select class="form-input" v-model="form.discordUserId">
            <option value="" disabled>Choisir un membre</option>
            <option v-for="m in memberOptions" :key="m.id" :value="m.id">{{ m.username }}</option>
          </select>
        </div>
      </div>

      <div v-if="form.messageType === 'text'" class="space-y-2">
        <label class="label">Contenu</label>
        <textarea v-model="form.content" rows="4" placeholder="Votre message" class="form-input" />
      </div>

      <div v-else class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="label">Titre</label>
            <input class="form-input" v-model="form.embed.title" placeholder="Titre" />
          </div>
          <div>
            <label class="label">Couleur (hex)</label>
            <input v-model="form.embed.color" placeholder="#0099ff" type="color" class="w-full my-2" />
          </div>
        </div>
        <div>
          <label class="label">Description</label>
          <textarea v-model="form.embed.description" rows="3" placeholder="Description" class="form-input" />
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="label">Image URL</label>
            <input class="form-input" v-model="form.embed.imageUrl" placeholder="https://..." />
          </div>
          <div>
            <label class="label">Footer</label>
            <input class="form-input" v-model="form.embed.footer" placeholder="Texte de bas de page" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="label">Champs</label>
          <div class="flex flex-col gap-2">
            <div class="grid gap-2 md:grid-cols-3">
              <input class="form-input" v-model="newField.name" placeholder="Nom" />
              <input class="form-input" v-model="newField.value" placeholder="Valeur" />
              <label class="inline-flex items-center gap-2 text-sm text-foam-200/80">
                <input class="form-input" type="checkbox" v-model="newField.inline" /> Inline
              </label>
            </div>
            <Button size="sm" variant="outline" @click="addField">Ajouter</Button>
          </div>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="(field, idx) in form.embed.fields" :key="idx" tone="neutral" class="flex items-center gap-2">
              <span>{{ field.name }}: {{ field.value }}</span>
              <Button size="sm" variant="ghost" @click="removeField(idx)"><VueIcon name="ci:close" /></Button>
            </Badge>
          </div>
        </div>
      </div>

      <Button :loading="loading" @click="sendMessage">Envoyer</Button>
    </Card>

    <Card class="glass-panel p-6 space-y-4">
      <div class="grid gap-4 grid-conversations">
        <div class="space-y-3 border-r border-white/10 pr-3">
          <div class="flex items-center justify-between text-sm text-foam-200/80">
            <span>Conversations</span>
            <Button size="sm" variant="outline" :loading="threadsLoading" @click="loadMetaAndThreads">Rafraîchir</Button>
          </div>
          <div class="space-y-2 max-h-[420px] overflow-auto">
            <button
              v-for="thread in adminStore.discordThreads"
              :key="thread.discordUserId"
              class="w-full rounded px-3 py-2 text-left hover:bg-white/5 border border-transparent"
              :class="thread.discordUserId === selectedUserId ? 'bg-white/10 border-white/10' : ''"
              @click="selectThread(thread.discordUserId)"
            >
              <div class="flex items-center gap-3">
                <img :src="adminStore.discordMeta.members.find((m: any) => m.id === thread.discordUserId)?.avatar || ''" class="h-8 w-8 rounded-full border border-white/10 object-cover" loading="lazy" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-white truncate">{{ adminStore.discordMeta.members.find((m: any) => m.id === thread.discordUserId)?.username || thread.discordUserId }}</p>
                  <p class="text-xs text-foam-300/70 truncate">{{ thread.lastMessage?.content || '[embed]' }}</p>
                </div>
                <Badge v-if="thread.unreadCount > 0" tone="accent" size="sm">{{ thread.unreadCount }}</Badge>
              </div>
            </button>
          </div>
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img v-if="selectedMember" :src="selectedMember.avatar" class="h-10 w-10 rounded-full border border-white/10 object-cover" loading="lazy" />
              <div>
                <p class="text-sm font-semibold text-white">{{ selectedMember?.username || 'Sélectionnez une conversation' }}</p>
                <p class="text-xs text-foam-300/70">{{ selectedUserId }}</p>
              </div>
            </div>
          </div>
          <div class="space-y-2 max-h-[420px] overflow-auto rounded border border-white/10 p-3 bg-white/5">
            <div v-if="adminStore.discordDMs.length === 0" class="text-sm text-foam-300/70">Aucun message</div>
            <div v-for="msg in adminStore.discordDMs" :key="msg.id" class="flex" :class="msg.direction === 'outbound' ? 'justify-end' : 'justify-start'">
              <div :class="msg.direction === 'outbound' ? 'bg-primary/30' : 'bg-white/10'" class="max-w-[75%] rounded-lg px-3 py-2 border border-white/10 text-sm text-white whitespace-pre-wrap">
                <div class="text-xs text-foam-300/80 mb-1">{{ new Date(msg.createdAt).toLocaleString() }}</div>
                <div v-if="msg.content">{{ msg.content }}</div>
                <div v-else>[embed]</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>

@media screen and (min-width: 768px) {
  .grid-conversations {
    grid-template-columns: 260px 1fr;
  }
}
</style>