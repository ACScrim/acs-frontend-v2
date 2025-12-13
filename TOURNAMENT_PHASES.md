# Tournament Phases Feature

## Overview

The tournament phases feature allows tournament administrators to create structured tournament brackets with support for multiple phases (up to 2 phases per tournament).

## Features

### Tournament Formats

Five tournament formats are supported:

1. **Single Elimination** - One loss eliminates a team
2. **Double Elimination** - Two losses are needed to be eliminated
3. **Round Robin** - All teams play against each other
4. **Swiss System** - Pairing based on current rankings
5. **Group Stage** - Teams divided into groups with playoffs

### Phase Management

- **Multiple Phases**: Support for up to 2 phases per tournament
- **Flexible Addition**: Can add a second phase even after the first phase has started
- **Phase States**: Each phase can be in one of three states:
  - `not-started` - Phase hasn't begun yet
  - `in-progress` - Phase is currently running
  - `completed` - Phase has finished

### UI Components

- **Arbre Tab**: New tab in tournament details for bracket management
- **Phase Creation Modal**: User-friendly interface to create/edit phases
- **Delete Confirmation**: Custom modal for phase deletion confirmation

## Usage

### Creating a Tournament Phase

1. Navigate to the tournament details page in admin
2. Click on the "Arbre" tab
3. Click "Ajouter une phase" button
4. Fill in the phase details:
   - Name (e.g., "Phase 1", "Playoffs", "Finale")
   - Select tournament format
5. Click "Créer la phase"

### Editing a Phase

1. In the "Arbre" tab, find the phase you want to edit
2. Click the pencil icon
3. Modify the phase details
4. Click "Mettre à jour"

### Deleting a Phase

1. Only phases with status `not-started` can be deleted
2. Click the trash icon on the phase card
3. Confirm deletion in the modal

## API Endpoints

The following API endpoints are called by the frontend:

- `POST /admin/tournaments/:tournamentId/phases` - Create a new phase
- `PATCH /admin/tournaments/:tournamentId/phases/:phaseId` - Update an existing phase
- `DELETE /admin/tournaments/:tournamentId/phases/:phaseId` - Delete a phase

## Type Definitions

### TournamentFormat

```typescript
type TournamentFormat = 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss' | 'group-stage';
```

### TournamentPhase

```typescript
interface TournamentPhase {
  id?: string;
  name: string;
  format: TournamentFormat;
  status: 'not-started' | 'in-progress' | 'completed';
  teams: Team[];
  matches: Match[];
  startDate?: string;
  endDate?: string;
  order: number;
}
```

### Match

```typescript
interface Match {
  id?: string;
  round: number;
  matchNumber: number;
  team1?: { id?: string; name: string; score?: number };
  team2?: { id?: string; name: string; score?: number };
  winner?: { id?: string; name: string };
  status: 'pending' | 'in-progress' | 'completed';
  nextMatchId?: string;
}
```

## Implementation Notes

- Phases are limited to 2 per tournament to keep the interface manageable
- The order field is automatically calculated based on the current number of phases
- Phase IDs are assigned by the backend after creation
- Phases cannot be deleted once they've started (status is not 'not-started')

## Future Enhancements

Potential future enhancements could include:

- Visual bracket display showing match tree
- Automatic bracket generation based on format
- Team assignment to matches
- Match score tracking
- Live updates during tournament
- More than 2 phases support
- Phase templates for quick setup
