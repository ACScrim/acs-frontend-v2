# Copilot Instructions for ACS Frontend V2

## Project Overview

This is a Vue 3 + TypeScript + Vite application for the ACS Gaming Community tournament management system. The application is a Progressive Web App (PWA) that allows users to view tournaments, participate in competitions, and manage gaming-related activities.

## Tech Stack

- **Framework**: Vue 3 with Composition API and `<script setup>` syntax
- **Language**: TypeScript with strict mode enabled
- **Build Tool**: Vite
- **State Management**: Pinia with persisted state plugin
- **Routing**: Vue Router
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios with custom interceptors
- **Database**: Dexie (IndexedDB wrapper)
- **Icons**: @kalimahapps/vue-icons
- **Utilities**: VueUse composables

## Code Style & Conventions

### Vue Components

- Always use `<script setup lang="ts">` syntax for all Vue components
- Use TypeScript interfaces for props with `defineProps<Props>()`
- Prefer composition API and composables over options API
- Import types using `import type { ... }` syntax
- Component names should use PascalCase in file names (e.g., `UserProfile.vue`)

### TypeScript

- Strict mode is enabled - avoid using `any` when possible
- Use explicit type annotations for function parameters and return types
- Prefer interfaces over type aliases for object shapes
- Use the `@/` alias for imports from the `src` directory (configured in tsconfig and vite config)

### State Management

- Use Pinia stores following the pattern: `export const useXxxStore = defineStore('acs-xxx', { ... })`
- Store IDs should be prefixed with `acs-` (e.g., `'acs-user'`, `'acs-tournament'`)
- Organize stores in `/src/stores/` with descriptive names ending in `Store.ts`
- Use the toast store (`useToastStore()`) for user-facing error messages

### API Communication

- Use the centralized API client from `@/utils/api` (Axios instance)
- API responses follow the pattern: `ApiResponse<T>` wrapper type
- API calls should use try-catch blocks and handle errors with toast notifications
- The API client includes automatic loading state tracking via interceptors

### Styling

- Use Tailwind CSS utility classes for styling
- Custom color palette includes: `ink` (dark grays), `foam` (light grays), `accent` (primary colors)
- Use gradient backgrounds: `from-ink-800/70 to-ink-900/70` for consistent UI elements
- Apply `v-tw-merge` directive when components accept custom classes
- Responsive design: mobile-first approach with `md:` and `lg:` breakpoints

### File Organization

```
src/
├── components/          # Reusable components
│   ├── global/         # App-wide components (Sidebar, Container, etc.)
│   ├── ui/             # Reusable UI components (buttons, inputs, etc.)
│   ├── tournaments/    # Tournament-specific components
│   └── games/          # Game-specific components
├── views/              # Page components (route views)
├── stores/             # Pinia state stores
├── router/             # Vue Router configuration
├── services/           # Business logic and API services
├── composables/        # Vue composables
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── db/                 # Dexie database configuration
```

### Component Patterns

- Keep components focused and single-purpose
- Extract reusable logic into composables in `/src/composables/`
- Use props for parent-to-child communication
- Use emits for child-to-parent communication: `defineEmits<{ 'eventName': [param: Type] }>()`
- Prefer computed properties over methods for derived state

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (Vite + HMR)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Build Configuration

- Target: ES2020
- Minifier: esbuild
- Manual chunk splitting for vendor libraries:
  - `vendor-vue`: Vue core libraries (vue, vue-router, pinia)
  - `vendor-ui`: VueUse libraries
  - `vendor-utils`: Axios and Dexie

## Important Features

### Tournament Bracket System

- Integrated with Challonge API (backend required)
- Admin features for bracket management
- Public display with embedded Challonge iframe
- **Note**: API keys must be stored on backend, never in frontend

### Authentication

- Uses cookie-based authentication with `withCredentials: true`
- User state managed via `useUserStore()`
- Role-based permissions: `superadmin`, `admin`, `card` roles
- Check authentication status using store getters: `isAdmin`, `isSuperAdmin`, `isLoggedIn`

### Progressive Web App

- Service worker with NetworkOnly strategy (no precaching)
- Manifest configured for standalone mode
- Optimized for portrait orientation
- Shortcuts to tournaments and leaderboard

## Environment Variables

- `VITE_API_URL`: Backend API base URL
- `VITE_ACSDLE_CRYPTO_KEY`: Encryption key for ACSDLE game feature

Environment variables should be prefixed with `VITE_` to be accessible in the app via `import.meta.env.VITE_*`.

## Deployment

- Automatic deployment on push to `main` branch via GitHub Actions
- Build artifacts deployed to production server via SFTP
- Atomic swap deployment strategy (zero-downtime)

## Best Practices

1. **Error Handling**: Always use try-catch blocks for async operations and provide user feedback via toast notifications
2. **Loading States**: API calls automatically tracked; use `useLoadingState()` composable for custom loading indicators
3. **Type Safety**: Leverage TypeScript's type system; define interfaces for all data models in `/src/types/models.ts`
4. **Reactivity**: Use `ref()` for primitive values and `reactive()` for objects; prefer `computed()` for derived state
5. **Performance**: Lazy-load routes and heavy components; optimize images and assets
6. **Accessibility**: Use semantic HTML and ARIA attributes where appropriate
7. **Code Comments**: Add comments only when code intent is not obvious; prefer self-documenting code with clear names

## Common Patterns

### API Call Pattern

```typescript
async fetchData() {
  try {
    const response = await api.get<ApiResponse<DataType>>("/endpoint");
    this.data = response.data.data;
  } catch (error: any) {
    useToastStore().error("Error message:", error.message || error);
  }
}
```

### Component Props Pattern

```typescript
interface Props {
  required: string;
  optional?: number;
  withDefault?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  optional: 0,
  withDefault: true
});
```

### Emit Pattern

```typescript
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'close': []
  'submit': [data: FormData]
}>();
```

## Testing

Currently, there is no testing infrastructure in this project. When adding tests:
- Consider using Vitest (Vite-native test framework)
- Follow Vue Testing Library patterns
- Test user interactions and component behavior, not implementation details

## Notes

- The application uses French language for UI text and comments in some areas
- Color scheme: dark theme with slate/ink background and cyan/foam accents
- Mobile-responsive design is a priority
- IndexedDB used for offline data persistence via Dexie
