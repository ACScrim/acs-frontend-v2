# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Features

### Tournament Bracket System with Challonge

The application includes a tournament bracket creation system integrated with the Challonge API. This feature allows administrators to:

- Create tournament brackets with configurable settings
- Start and finalize tournaments
- Synchronize results from Challonge
- Display brackets to users

#### Admin Features

Administrators can access the bracket management interface from the tournament details page (admin view) in the "Bracket" tab. Available actions include:

- **Create Bracket**: Configure and create a new Challonge bracket with options for:
  - Tournament type (single/double elimination, round robin, swiss)
  - Participant limit
  - Notification settings
  - Privacy settings
- **Update Bracket**: Sync local tournament data with Challonge
- **Start Tournament**: Begin the tournament on Challonge
- **Finalize Tournament**: Mark the tournament as complete
- **Sync Results**: Pull final results from Challonge back to the local system
- **Delete Bracket**: Remove the Challonge bracket

#### Public Display

When a bracket is created, it automatically appears on the public tournament details page, allowing all users to view the tournament progression in real-time through an embedded Challonge iframe.

#### Backend Requirements

**Important**: This frontend implementation requires a backend API to handle Challonge API authentication and requests. The backend should implement the following endpoints:

- `POST /admin/tournaments/:tournamentId/challonge/create` - Create bracket
- `POST /admin/tournaments/:tournamentId/challonge/update` - Update bracket
- `POST /admin/tournaments/:tournamentId/challonge/start` - Start tournament
- `POST /admin/tournaments/:tournamentId/challonge/finalize` - Finalize tournament
- `DELETE /admin/tournaments/:tournamentId/challonge` - Delete bracket
- `POST /admin/tournaments/:tournamentId/challonge/sync` - Sync results

API keys for Challonge should be stored securely on the backend and never exposed to the frontend.

