<script setup lang="ts">
import LoaderACS from "@/components/global/LoaderACS.vue";
import PageHeader from "@/components/global/PageHeader.vue";
import { AcsSelect } from "@/components/ui";
import useSeasonStore from "@/stores/seasonStore";
import { useToastStore } from "@/stores/toastStore";
import { type ApiResponse, type LeaderboardEntry } from "@/types/models";
import api from "@/utils/api";
import { getErrorMessage } from "@/utils";
import VueIcon from "@kalimahapps/vue-icons/VueIcon";
import { computed, h, nextTick, onMounted, ref, watch } from "vue";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel, getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import TableTanstack from "@/components/global/TableTanstack.vue";
import ProfileLink from "@/components/global/ProfileLink.vue";
import {useTablePaginationQueryString} from "@/composables/useTablePaginationQueryString";

const seasonFilter = ref("");
const searchQuery = ref("");
const isLoading = ref(false);

const paginationQs = useTablePaginationQueryString({ param: 'page', defaultPage: 1, cleanDefault: false });

const seasonStore = useSeasonStore();
const seasons = computed(() => seasonStore.seasons);

const leaderboard = ref<LeaderboardEntry[]>([]);

const filteredLeaderboard = computed(() => {
  if (!searchQuery.value.trim()) {
    return leaderboard.value;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return leaderboard.value.filter((entry) =>
    entry.user.username.toLowerCase().includes(query)
  );
});
const loadLeaderboard = async () => {
  isLoading.value = true;
  try {
    const url =
      seasonFilter.value && seasonFilter.value !== ""
        ? `/leaderboard?season=${seasonFilter.value}`
        : "/leaderboard";

    const response = await api.get<ApiResponse<LeaderboardEntry[]>>(url);
    leaderboard.value = response.data.data;
  } catch (error: unknown) {
    useToastStore().error(
      "Error fetching leaderboard: " + getErrorMessage(error)
    );
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await seasonStore.fetchSeasons();
  // Sélectionner la saison en cours par défaut (première dans la liste)
  if (seasonStore.seasons.length > 0 && seasonStore.seasons[0]) {
    seasonFilter.value = String(seasonStore.seasons[0].number);
  }
  await loadLeaderboard();
  await nextTick();
  const targetPageIndex = paginationQs.pagination.value.pageIndex;
  const pageCount = table.getPageCount();
  if (targetPageIndex > 0 && pageCount > 0 && targetPageIndex < pageCount) {
    table.setPageIndex(targetPageIndex);
  }
});

watch(seasonFilter, () => {
  loadLeaderboard();
});

const medalColors = ["text-amber-400", "text-foam-300", "text-blush-400"];

const columnHelper = createColumnHelper<LeaderboardEntry>();

const columns = [
  columnHelper.display({
    id: "position",
    header: () => "Position",
    cell: ({ row }) => {
      const rank = leaderboard.value.indexOf(row.original) + 1;
      if (rank <= 3) {
        return h("div", { class: "flex items-center gap-3" }, [
          h(
            "div",
            {
              class:
                "flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5",
            },
            [
              h(VueIcon, {
                name: "bs:award",
                class: `text-xl ${medalColors[rank - 1]}`,
              }),
            ]
          ),
          h(
            "span",
            { class: "hidden md:inline text-sm text-white/70" },
            `#${rank}`
          ),
        ]);
      }
      return h(
        "span",
        { class: "text-sm font-semibold text-foam-200" },
        `#${rank}`
      );
    },
  }),
  columnHelper.display({
    id: "user",
    header: () => "Utilisateur",
    cell: ({ row }) => {
      const user = row.original.user;
      return h(ProfileLink, {
        user: user,
        size: 12,
      });
    },
  }),
  columnHelper.accessor("tournamentsCount", {
    header: () => "Tournois",
    cell: (info) =>
      h("span", { class: "text-foam-50 font-semibold" }, info.getValue()),

  }),
  columnHelper.accessor("victoriesCount", {
    header: () => "Victoires",
    cell: (info) =>
      h("span", { class: "text-foam-50 font-semibold" }, info.getValue()),
  }),
  columnHelper.accessor("top25Count", {
    header: () => "Podium",
    cell: (info) =>
      h("span", { class: "text-foam-50 font-semibold" }, info.getValue()),
  }),
  columnHelper.accessor("points", {
    header: () =>
      h(
        "div",
        {
          title: "3 points par victoire, 1 point par top 25%",
          class: "flex items-center justify-center w-full",
        },
        ["Points", h(VueIcon, { name: "fa:circle-info" })]
      ),
    cell: (info) =>
      h(
        "span",
        { class: "text-2xl font-semibold text-white" },
        info.getValue()
      ),
  }),
];

const table = useVueTable({
  get data() {
    return filteredLeaderboard.value;
  },
  columns,
  enableSorting: true,
  getSortedRowModel: getSortedRowModel(),
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  autoResetPageIndex: false,
  state: {
    get pagination() {
      return paginationQs.pagination.value;
    },
  },
  onPaginationChange: paginationQs.onPaginationChange,
});
</script>

<template>
  <div class="space-y-10">
    <PageHeader title="Classement global" subtitle="Performance cumulée">
      <template #icon>
        <VueIcon name="ic:leaderboard-star" class="text-3xl text-accent-300" />
      </template>
      <template #actions>
        <div class="flex gap-3 items-center">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="🔍 Rechercher un joueur..."
              class="w-full min-w-[200px] rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400/50 transition-all duration-200"
            />
            <VueIcon
              v-if="searchQuery"
              @click="searchQuery = ''"
              name="md:close"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer transition-colors"
            />
          </div>
          <AcsSelect
            v-model="seasonFilter"
            class="min-w-[180px] md:min-w-[220px]"
            :options="
              seasons.map((season) => ({
                label: `${
                  season.number === 0 ? 'Alors ça chill' : `S${season.number}`
                }`,
                value: String(season.number),
              }))
            "
            default-option-label="Toutes les saisons"
          />
        </div>
      </template>
    </PageHeader>

    <LoaderACS v-if="isLoading" class="place-self-center" />

    <div v-else>
      <!-- Vue mobile: cartes -->
      <div class="md:hidden space-y-3">
        <div
          v-if="filteredLeaderboard.length === 0 && searchQuery"
          class="text-center py-8"
        >
          <div class="text-4xl mb-2">🔍</div>
          <h3 class="text-lg font-semibold text-white mb-1">
            Aucun joueur trouvé
          </h3>
          <p class="text-gray-400 text-sm">
            Essayez avec un autre nom d'utilisateur
          </p>
        </div>
        <div
          v-for="(entry, index) in filteredLeaderboard"
          :key="entry.user.id"
          class="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 flex-1">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 flex-shrink-0"
              >
                <VueIcon
                  v-if="leaderboard.indexOf(entry) < 3"
                  name="bs:award"
                  :class="`text-sm ${medalColors[leaderboard.indexOf(entry)]}`"
                />
                <span v-else class="text-xs font-semibold text-foam-200"
                  >#{{ leaderboard.indexOf(entry) + 1 }}</span
                >
              </div>
              <ProfileLink :user="entry.user" :size="10" />
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-lg font-semibold text-white">{{ entry.points }}</p>
              <p class="text-xs text-foam-300/60">pts</p>
            </div>
          </div>
          <div
            class="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-white/10"
          >
            <div class="text-center">
              <p class="text-foam-300/60">Tournois</p>
              <p class="font-semibold text-foam-50">
                {{ entry.tournamentsCount }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-foam-300/60">Victoires</p>
              <p class="font-semibold text-foam-50">
                {{ entry.victoriesCount }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-foam-300/60">Top 25%</p>
              <p class="font-semibold text-foam-50">{{ entry.top25Count }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue desktop: tableau -->
      <div class="hidden md:block glass-panel overflow-hidden">
        <TableTanstack :table="table" paginated />
      </div>
    </div>
  </div>
</template>
