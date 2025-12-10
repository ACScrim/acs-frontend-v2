<script setup lang="ts">
import LoaderACS from '@/components/global/LoaderACS.vue';
import PageHeader from '@/components/global/PageHeader.vue';
import {AcsSelect} from '@/components/ui';
import useSeasonStore from '@/stores/seasonStore';
import {useToastStore} from '@/stores/toastStore';
import {type ApiResponse, type LeaderboardEntry} from '@/types/models';
import api from '@/utils/api';
import {getErrorMessage} from '@/utils';
import VueIcon from '@kalimahapps/vue-icons/VueIcon';
import {whenever} from '@vueuse/core';
import {computed, h, onMounted, ref} from 'vue';
import {createColumnHelper, getCoreRowModel, getPaginationRowModel, useVueTable} from '@tanstack/vue-table';
import TableTanstack from "@/components/global/TableTanstack.vue";
import ProfileLink from "@/components/global/ProfileLink.vue";

const seasonFilter = ref('');
const pagination = ref({
  pageIndex: 0,
  pageSize: 10
});

const seasonStore = useSeasonStore();
const seasons = computed(() => seasonStore.seasons);

const leaderboard = ref<LeaderboardEntry[]>([]);
onMounted((async () => {
  try {
    const response = await api.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard?season=${seasonFilter.value}`);
    leaderboard.value = response.data.data;

    seasonStore.fetchSeasons();
  } catch (error: unknown) {
    useToastStore().error('Error fetching leaderboard: ' + getErrorMessage(error));
  }
}))

whenever(seasonFilter, async () => {
  try {
    const response = await api.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard?season=${seasonFilter.value}`);
    leaderboard.value = response.data.data;
  } catch (error: unknown) {
    useToastStore().error('Error fetching leaderboard: ' + getErrorMessage(error));
  }
});

whenever(seasons, () => {
  seasonFilter.value = seasonStore.seasons[0]?.number ? String(seasonStore.seasons[0].number) : '';
});

const medalColors = ['text-amber-400', 'text-foam-300', 'text-blush-400'];

const columnHelper = createColumnHelper<LeaderboardEntry>();

const columns = [
  columnHelper.display({
    id: 'position',
    header: () => 'Position',
    cell: ({ row }) => {
      const rank = row.index + 1;
      if (rank <= 3) {
        return h('div', { class: 'flex items-center gap-3' }, [
          h('div', { class: 'flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5' }, [
            h(VueIcon, { name: 'bs:award', class: `text-xl ${medalColors[rank - 1]}` })
          ]),
          h('span', { class: 'hidden md:inline text-sm text-white/70' }, `#${rank}`)
        ]);
      }
      return h('span', { class: 'text-sm font-semibold text-foam-200' }, `#${rank}`);
    }
  }),
  columnHelper.display({
    id: 'user',
    header: () => 'Utilisateur',
    cell: ({ row }) => {
      const user = row.original.user;
      return h(
        ProfileLink,
        {
          user: user,
          size: 12
        }
      );
    }
  }),
  columnHelper.accessor('tournamentsCount', {
    header: () => 'Tournois',
    cell: info => h('span', { class: 'text-foam-50 font-semibold' }, info.getValue())
  }),
  columnHelper.accessor('victoriesCount', {
    header: () => 'Victoires',
    cell: info => h('span', { class: 'text-foam-50 font-semibold' }, info.getValue())
  }),
  columnHelper.accessor('top25Count', {
    header: () => 'Top 25',
    cell: info => h('span', { class: 'text-foam-50 font-semibold' }, info.getValue())
  }),
  columnHelper.accessor('points', {
    header: () => h('div', { title: '3 points par victoire, 1 point par top25', class: 'flex items-center justify-center w-full' }, ['Points', h(VueIcon, { name: 'fa:circle-info' })]),
    cell: info => h('span', { class: 'text-2xl font-semibold text-white' }, info.getValue())
  })
];

const table = useVueTable({
  get data() {
    return leaderboard.value;
  },
  columns,
  enableSorting: false,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: {
    get pagination() {
      return pagination.value;
    }
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater;
  }
});
</script>

<template>
  <div class="space-y-10">
    <PageHeader title="Classement global" subtitle="Performance cumulée">
      <template #icon>
        <VueIcon name="ic:leaderboard-star" class="text-3xl text-accent-300" />
      </template>
      <template #actions>
        <AcsSelect v-model="seasonFilter"
          class="min-w-[220px]"
          :options="seasons.map(season => ({ label: `${season.number === 0 ? 'Alors ça chill' : `Saison ${season.number}`}`, value: String(season.number) }))"
          default-option-label="Toutes les saisons" />
      </template>
    </PageHeader>

    <LoaderACS v-if="seasonStore.isLoading" class="place-self-center" />

    <div v-else class="glass-panel overflow-hidden">
      <TableTanstack :table="table" paginated />
    </div>
  </div>
</template>