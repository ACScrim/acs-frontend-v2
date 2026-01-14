import {ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import type {PaginationState, Updater} from '@tanstack/vue-table';

type Options = {
  /**
   * Nom du paramètre querystring. Par défaut: page
   * Valeur attendue côté URL: 1-based (page=1, page=2, ...)
   */
  param?: string;

  /**
   * Page par défaut si le paramètre est absent/invalide.
   * 1-based.
   */
  defaultPage?: number;

  /**
   * Retire le paramètre si on revient à la page par défaut.
   * Mettre à false pour ne jamais supprimer `?page=...`.
   */
  cleanDefault?: boolean;

  /**
   * Page size initiale (optionnel).
   */
  defaultPageSize?: number;
};

function clampInt(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parsePageFromQuery(query: string | string[] | undefined, defaultPage: number): number {
  const raw = Array.isArray(query) ? query[0] : query;
  const n = raw ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(n) || n < 1) return defaultPage;
  return n;
}

export function useTablePaginationQueryString(options: Options = {}) {
  const param = options.param ?? 'page';
  const defaultPage = options.defaultPage ?? 1;
  const cleanDefault = options.cleanDefault ?? true;
  const defaultPageSize = options.defaultPageSize ?? 10;

  const route = useRoute();
  const router = useRouter();

  // TanStack est 0-based: pageIndex=0 => page 1
  // Initialiser immédiatement avec la valeur de l'URL
  const initialPage = clampInt(parsePageFromQuery(route.query[param] as string, defaultPage), 1, Number.MAX_SAFE_INTEGER);

  // Un seul ref contenant l'objet PaginationState complet
  const pagination = ref<PaginationState>({
    pageIndex: initialPage - 1,
    pageSize: defaultPageSize,
  });

  const writePageToUrl = (page1Based: number) => {
    const newQuery = { ...route.query };

    if (cleanDefault && page1Based === defaultPage) {
      delete newQuery[param];
    } else {
      newQuery[param] = String(page1Based);
    }

    router.replace({ query: newQuery });
  };

  const onPaginationChange = (updater: Updater<PaginationState>) => {
    const next = typeof updater === 'function' ? updater(pagination.value) : updater;
    pagination.value = next;

    // Écrire dans l'URL immédiatement après un changement utilisateur
    writePageToUrl(next.pageIndex + 1);
  };

  // Synchroniser quand la route change (back/forward, navigation externe)
  watch(
    () => route.query[param],
    (newPageQuery) => {
      const page1 = clampInt(parsePageFromQuery(newPageQuery as string, defaultPage), 1, Number.MAX_SAFE_INTEGER);
      const nextIndex = page1 - 1;
      if (nextIndex !== pagination.value.pageIndex) {
        pagination.value = {
          ...pagination.value,
          pageIndex: nextIndex,
        };
      }
    }
  );

  return {
    pagination,
    onPaginationChange,
  };
}