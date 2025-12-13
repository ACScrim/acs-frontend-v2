# Challonge Backend Implementation Guide

Ce fichier décrit l'implémentation backend nécessaire pour l'intégration Challonge.

## Configuration

### Variables d'environnement
```env
CHALLONGE_API_KEY=your_api_key_here
CHALLONGE_USERNAME=your_username_here
```

### Installation des dépendances
```bash
npm install axios
# ou avec un client Challonge existant
npm install challonge
```

## Endpoints à implémenter

### 1. POST `/admin/tournaments/:tournamentId/challonge/create`

Crée un nouveau bracket Challonge pour le tournoi.

#### Request Body
```typescript
{
  tournamentType?: 'single elimination' | 'double elimination' | 'round robin' | 'swiss';
  showRounds?: boolean;
  privateOnly?: boolean;
  notifyUsersWhenMatchesOpen?: boolean;
  notifyUsersWhenTheTournamentEnds?: boolean;
  sequentialPairings?: boolean;
  signupCap?: number;
  startAt?: string; // ISO 8601 format
  checkInDuration?: number; // minutes
  description?: string;
}
```

#### Response
```typescript
{
  success: boolean;
  data: {
    challongeUrl: string;        // e.g., "https://challonge.com/your_tournament_url"
    challongeTournamentId: string; // e.g., "12345678"
    bracketUrl: string;           // e.g., "https://challonge.com/your_tournament_url"
  }
}
```

#### Appel Challonge API
```javascript
// Endpoint: POST https://api.challonge.com/v1/tournaments.json
// Documentation: https://api.challonge.com/v1/documents/tournaments/create

const axios = require('axios');

async function createChallongeTournament(tournament, settings) {
  const response = await axios.post(
    'https://api.challonge.com/v1/tournaments.json',
    {
      api_key: process.env.CHALLONGE_API_KEY,
      tournament: {
        name: tournament.name,
        url: `tournament_${tournament.id}`, // URL personnalisée
        tournament_type: settings.tournamentType || 'single elimination',
        description: settings.description || tournament.description,
        open_signup: false, // Géré par votre système
        hold_third_place_match: false,
        pts_for_match_win: 1.0,
        pts_for_match_tie: 0.5,
        pts_for_game_win: 0.0,
        pts_for_game_tie: 0.0,
        pts_for_bye: 1.0,
        swiss_rounds: 0,
        ranked_by: 'match wins',
        rr_pts_for_match_win: 3.0,
        rr_pts_for_match_tie: 1.0,
        rr_pts_for_game_win: 0.0,
        rr_pts_for_game_tie: 0.0,
        accept_attachments: false,
        hide_forum: true,
        show_rounds: settings.showRounds !== false,
        private: settings.privateOnly || false,
        notify_users_when_matches_open: settings.notifyUsersWhenMatchesOpen !== false,
        notify_users_when_the_tournament_ends: settings.notifyUsersWhenTheTournamentEnds !== false,
        sequential_pairings: settings.sequentialPairings || false,
        signup_cap: settings.signupCap || null,
        start_at: settings.startAt || null,
        check_in_duration: settings.checkInDuration || null
      }
    }
  );

  const challongeTournament = response.data.tournament;
  
  // Ajouter les participants (équipes ou joueurs)
  await addParticipants(challongeTournament.id, tournament);
  
  // Mettre à jour le tournoi dans la base de données
  await updateTournamentWithChallongeData(tournament.id, {
    challongeUrl: challongeTournament.full_challonge_url,
    challongeTournamentId: challongeTournament.id.toString()
  });

  return {
    challongeUrl: challongeTournament.full_challonge_url,
    challongeTournamentId: challongeTournament.id.toString(),
    bracketUrl: challongeTournament.full_challonge_url
  };
}

async function addParticipants(challongeTournamentId, tournament) {
  // Ajouter chaque équipe comme participant
  for (const team of tournament.teams) {
    await axios.post(
      `https://api.challonge.com/v1/tournaments/${challongeTournamentId}/participants.json`,
      {
        api_key: process.env.CHALLONGE_API_KEY,
        participant: {
          name: team.name,
          seed: team.ranking || null,
          misc: JSON.stringify({
            teamId: team.id,
            players: team.users.map(u => u.username)
          })
        }
      }
    );
  }
}
```

---

### 2. POST `/admin/tournaments/:tournamentId/challonge/update`

Met à jour le bracket Challonge avec les données actuelles du tournoi (participants, équipes, etc.).

#### Response
```typescript
{
  success: boolean;
  data: {
    challongeUrl: string;
    challongeTournamentId: string;
    bracketUrl: string;
  }
}
```

#### Appel Challonge API
```javascript
// Endpoint: PUT https://api.challonge.com/v1/tournaments/:tournament.json
// Endpoint: POST/DELETE participants pour mise à jour

async function updateChallongeTournament(tournament) {
  const challongeTournamentId = tournament.challongeTournamentId;
  
  // Récupérer les participants existants
  const existingParticipants = await axios.get(
    `https://api.challonge.com/v1/tournaments/${challongeTournamentId}/participants.json`,
    { params: { api_key: process.env.CHALLONGE_API_KEY } }
  );

  // Synchroniser les participants
  const currentTeams = tournament.teams.map(t => t.name);
  const existingTeams = existingParticipants.data.map(p => p.participant.name);

  // Ajouter nouveaux participants
  for (const team of tournament.teams) {
    if (!existingTeams.includes(team.name)) {
      await axios.post(
        `https://api.challonge.com/v1/tournaments/${challongeTournamentId}/participants.json`,
        {
          api_key: process.env.CHALLONGE_API_KEY,
          participant: {
            name: team.name,
            seed: team.ranking || null
          }
        }
      );
    }
  }

  // Supprimer participants qui n'existent plus
  for (const participant of existingParticipants.data) {
    if (!currentTeams.includes(participant.participant.name)) {
      await axios.delete(
        `https://api.challonge.com/v1/tournaments/${challongeTournamentId}/participants/${participant.participant.id}.json`,
        { params: { api_key: process.env.CHALLONGE_API_KEY } }
      );
    }
  }

  return {
    challongeUrl: tournament.challongeUrl,
    challongeTournamentId: tournament.challongeTournamentId,
    bracketUrl: tournament.challongeUrl
  };
}
```

---

### 3. POST `/admin/tournaments/:tournamentId/challonge/start`

Démarre le tournoi sur Challonge (lance le bracket).

#### Response
```typescript
{
  success: boolean;
  data: null
}
```

#### Appel Challonge API
```javascript
// Endpoint: POST https://api.challonge.com/v1/tournaments/:tournament/start.json
// Documentation: https://api.challonge.com/v1/documents/tournaments/start

async function startChallongeTournament(tournament) {
  await axios.post(
    `https://api.challonge.com/v1/tournaments/${tournament.challongeTournamentId}/start.json`,
    {
      api_key: process.env.CHALLONGE_API_KEY,
      include_participants: 0,
      include_matches: 0
    }
  );

  return { success: true };
}
```

---

### 4. POST `/admin/tournaments/:tournamentId/challonge/finalize`

Finalise le tournoi sur Challonge (termine le bracket et calcule les classements finaux).

#### Response
```typescript
{
  success: boolean;
  data: null
}
```

#### Appel Challonge API
```javascript
// Endpoint: POST https://api.challonge.com/v1/tournaments/:tournament/finalize.json
// Documentation: https://api.challonge.com/v1/documents/tournaments/finalize

async function finalizeChallongeTournament(tournament) {
  await axios.post(
    `https://api.challonge.com/v1/tournaments/${tournament.challongeTournamentId}/finalize.json`,
    {
      api_key: process.env.CHALLONGE_API_KEY,
      include_participants: 0,
      include_matches: 0
    }
  );

  return { success: true };
}
```

---

### 5. DELETE `/admin/tournaments/:tournamentId/challonge`

Supprime le bracket Challonge.

#### Response
```typescript
{
  success: boolean;
  data: null
}
```

#### Appel Challonge API
```javascript
// Endpoint: DELETE https://api.challonge.com/v1/tournaments/:tournament.json
// Documentation: https://api.challonge.com/v1/documents/tournaments/destroy

async function deleteChallongeTournament(tournament) {
  await axios.delete(
    `https://api.challonge.com/v1/tournaments/${tournament.challongeTournamentId}.json`,
    { params: { api_key: process.env.CHALLONGE_API_KEY } }
  );

  // Mettre à jour le tournoi dans la base de données
  await updateTournamentWithChallongeData(tournament.id, {
    challongeUrl: null,
    challongeTournamentId: null
  });

  return { success: true };
}
```

---

### 6. POST `/admin/tournaments/:tournamentId/challonge/sync`

Synchronise les résultats depuis Challonge vers le système local.

#### Response
```typescript
{
  success: boolean;
  data: null
}
```

#### Appel Challonge API
```javascript
// Endpoint: GET https://api.challonge.com/v1/tournaments/:tournament.json
// Endpoint: GET https://api.challonge.com/v1/tournaments/:tournament/participants.json

async function syncChallongeResults(tournament) {
  // Récupérer les informations du tournoi
  const tournamentData = await axios.get(
    `https://api.challonge.com/v1/tournaments/${tournament.challongeTournamentId}.json`,
    { 
      params: { 
        api_key: process.env.CHALLONGE_API_KEY,
        include_participants: 1,
        include_matches: 1
      } 
    }
  );

  const challongeTournament = tournamentData.data.tournament;
  
  // Récupérer les participants avec leur classement final
  const participants = challongeTournament.participants;

  // Mettre à jour les équipes dans la base de données
  for (const participant of participants) {
    const teamName = participant.participant.name;
    const finalRank = participant.participant.final_rank;
    
    // Trouver l'équipe correspondante
    const team = tournament.teams.find(t => t.name === teamName);
    if (team) {
      await updateTeamResults(tournament.id, team.id, {
        ranking: finalRank,
        score: participant.participant.matches_won || 0
      });
    }
  }

  // Si le tournoi est finalisé sur Challonge, marquer comme terminé
  if (challongeTournament.state === 'complete') {
    await updateTournamentStatus(tournament.id, { finished: true });
  }

  return { success: true };
}
```

---

## Exemple d'implémentation Express.js complète

```javascript
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configuration Challonge
const CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY;
const CHALLONGE_BASE_URL = 'https://api.challonge.com/v1';

// Helper function pour les appels Challonge
async function challongeRequest(method, endpoint, data = {}) {
  const config = {
    method,
    url: `${CHALLONGE_BASE_URL}${endpoint}`,
    params: method === 'GET' || method === 'DELETE' ? { api_key: CHALLONGE_API_KEY } : {},
    data: method !== 'GET' && method !== 'DELETE' ? { api_key: CHALLONGE_API_KEY, ...data } : {}
  };
  
  return await axios(config);
}

// 1. CREATE
router.post('/admin/tournaments/:tournamentId/challonge/create', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const settings = req.body;
    
    // Récupérer le tournoi depuis la base de données
    const tournament = await getTournamentById(tournamentId);
    
    if (!tournament.teamsPublished) {
      return res.json({ 
        success: false, 
        error: { message: 'Teams must be published before creating bracket' } 
      });
    }

    // Créer le tournoi sur Challonge
    const response = await challongeRequest('POST', '/tournaments.json', {
      tournament: {
        name: tournament.name,
        url: `acs_${tournament.id}`,
        tournament_type: settings.tournamentType || 'single elimination',
        description: settings.description || tournament.description,
        open_signup: false,
        show_rounds: settings.showRounds !== false,
        private: settings.privateOnly || false,
        notify_users_when_matches_open: settings.notifyUsersWhenMatchesOpen !== false,
        notify_users_when_the_tournament_ends: settings.notifyUsersWhenTheTournamentEnds !== false,
        sequential_pairings: settings.sequentialPairings || false,
        signup_cap: settings.signupCap || null,
        start_at: settings.startAt || null,
        check_in_duration: settings.checkInDuration || null
      }
    });

    const challongeTournament = response.data.tournament;

    // Ajouter les participants
    for (const team of tournament.teams) {
      await challongeRequest('POST', `/tournaments/${challongeTournament.id}/participants.json`, {
        participant: {
          name: team.name,
          seed: team.ranking || null
        }
      });
    }

    // Sauvegarder dans la base de données
    await updateTournament(tournamentId, {
      challongeUrl: challongeTournament.full_challonge_url,
      challongeTournamentId: challongeTournament.id.toString()
    });

    res.json({
      success: true,
      data: {
        challongeUrl: challongeTournament.full_challonge_url,
        challongeTournamentId: challongeTournament.id.toString(),
        bracketUrl: challongeTournament.full_challonge_url
      }
    });
  } catch (error) {
    console.error('Error creating Challonge bracket:', error);
    res.json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
});

// 2. UPDATE
router.post('/admin/tournaments/:tournamentId/challonge/update', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await getTournamentById(tournamentId);

    if (!tournament.challongeTournamentId) {
      return res.json({ 
        success: false, 
        error: { message: 'No Challonge bracket found' } 
      });
    }

    // Récupérer les participants existants
    const existingResponse = await challongeRequest(
      'GET', 
      `/tournaments/${tournament.challongeTournamentId}/participants.json`
    );
    const existingParticipants = existingResponse.data;

    // Synchroniser les participants
    const currentTeamNames = tournament.teams.map(t => t.name);
    const existingTeamNames = existingParticipants.map(p => p.participant.name);

    // Ajouter nouveaux participants
    for (const team of tournament.teams) {
      if (!existingTeamNames.includes(team.name)) {
        await challongeRequest(
          'POST', 
          `/tournaments/${tournament.challongeTournamentId}/participants.json`,
          { participant: { name: team.name, seed: team.ranking || null } }
        );
      }
    }

    // Supprimer participants qui n'existent plus
    for (const participant of existingParticipants) {
      if (!currentTeamNames.includes(participant.participant.name)) {
        await challongeRequest(
          'DELETE',
          `/tournaments/${tournament.challongeTournamentId}/participants/${participant.participant.id}.json`
        );
      }
    }

    res.json({
      success: true,
      data: {
        challongeUrl: tournament.challongeUrl,
        challongeTournamentId: tournament.challongeTournamentId,
        bracketUrl: tournament.challongeUrl
      }
    });
  } catch (error) {
    console.error('Error updating Challonge bracket:', error);
    res.json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
});

// 3. START
router.post('/admin/tournaments/:tournamentId/challonge/start', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await getTournamentById(tournamentId);

    await challongeRequest(
      'POST',
      `/tournaments/${tournament.challongeTournamentId}/start.json`
    );

    res.json({ success: true, data: null });
  } catch (error) {
    console.error('Error starting Challonge tournament:', error);
    res.json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
});

// 4. FINALIZE
router.post('/admin/tournaments/:tournamentId/challonge/finalize', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await getTournamentById(tournamentId);

    await challongeRequest(
      'POST',
      `/tournaments/${tournament.challongeTournamentId}/finalize.json`
    );

    res.json({ success: true, data: null });
  } catch (error) {
    console.error('Error finalizing Challonge tournament:', error);
    res.json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
});

// 5. DELETE
router.delete('/admin/tournaments/:tournamentId/challonge', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await getTournamentById(tournamentId);

    await challongeRequest(
      'DELETE',
      `/tournaments/${tournament.challongeTournamentId}.json`
    );

    // Mettre à jour la base de données
    await updateTournament(tournamentId, {
      challongeUrl: null,
      challongeTournamentId: null
    });

    res.json({ success: true, data: null });
  } catch (error) {
    console.error('Error deleting Challonge tournament:', error);
    res.json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
});

// 6. SYNC
router.post('/admin/tournaments/:tournamentId/challonge/sync', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await getTournamentById(tournamentId);

    // Récupérer les données du tournoi
    const response = await challongeRequest(
      'GET',
      `/tournaments/${tournament.challongeTournamentId}.json?include_participants=1&include_matches=1`
    );

    const challongeTournament = response.data.tournament;
    const participants = challongeTournament.participants;

    // Mettre à jour les résultats des équipes
    for (const participant of participants) {
      const teamName = participant.participant.name;
      const team = tournament.teams.find(t => t.name === teamName);
      
      if (team) {
        await updateTeamInTournament(tournamentId, team.id, {
          ranking: participant.participant.final_rank,
          score: participant.participant.matches_won || 0
        });
      }
    }

    // Marquer comme terminé si nécessaire
    if (challongeTournament.state === 'complete') {
      await updateTournament(tournamentId, { finished: true });
    }

    res.json({ success: true, data: null });
  } catch (error) {
    console.error('Error syncing Challonge results:', error);
    res.json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
});

module.exports = router;
```

---

## Notes importantes

1. **Authentification**: Tous les appels Challonge nécessitent `api_key` dans les paramètres ou le body
2. **Rate limiting**: Challonge limite à 1 requête par seconde. Implémenter un rate limiter si nécessaire
3. **Gestion d'erreurs**: Gérer les erreurs Challonge appropriées (401, 404, 422, etc.)
4. **URL tournoi**: Utiliser un préfixe unique (ex: `acs_${tournamentId}`) pour éviter les conflits
5. **Participants**: Les participants doivent être ajoutés AVANT de démarrer le tournoi
6. **Webhook**: Considérer l'ajout de webhooks Challonge pour des mises à jour en temps réel

## Ressources

- Documentation API Challonge: https://api.challonge.com/v1
- Npm package: https://www.npmjs.com/package/challonge
- Community wrapper: https://github.com/Tidwell/node-challonge
