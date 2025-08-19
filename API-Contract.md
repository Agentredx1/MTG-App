# MTG‑App API Contract

This contract documents the public endpoints exposed by the **MTG‑App** server. The API uses Express and communicates over JSON. All paths below are relative to the /api/v1 base route.

**Note**: Many statistics endpoints support both collection queries (all items) and specific item queries using path parameters (e.g., `/stats/players/win-rate` vs `/stats/players/win-rate/:name`).

## Base URL

/api/v1

## Endpoints Overview

| Endpoint | Method | Description |
| --- | --- | --- |
| /games | POST | Create a new game and its player records[\[1\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/gamesController.mjs#L6-L21). |
| /stats/most-played | GET | Top eight commanders (last 30 days)[\[2\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L3-L18). |
| /stats/commanders/win-rate | GET | Overall win counts per commander[\[3\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L25-L38). |
| /stats/commanders/win-rate/:name | GET | Win rates for specific commander by name[\[3\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L25-L38). |
| /stats/players/win-rate | GET | Win rates per player[\[4\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L45-L80). |
| /stats/players/win-rate/:name | GET | Win rates for specific player by name[\[4\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L45-L80). |
| /stats/colors/frequency | GET | Color identity frequency across commanders[\[5\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L88-L103). |
| /stats/colors/frequency/:name | GET | Color identity frequency for specific commander[\[5\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L88-L103). |

## POST /api/v1/games – Create a game

Creates a new game entry and inserts all participating players. The request body must contain:
```json
{  
"date": "YYYY-MM-DD", // date string of when the game occurred  
"turns": 10, // integer count of turns taken  
"wincon": "combat damage", // win condition description  
"winner": "Alice", // name of the player who won (must match one of the players)  
"players": [{  

    "name": "Alice", // player’s name  
    "commander": "Atraxa", // commander’s name (nullable)  
    "turnOrder": 1 // first-turn order  
    },  
    {  
    "name": "Bob",  
    "commander": "Muldrotha",  
    "turnOrder": 2  
}]  
}
```
- The server requires at least two players and validates that date, turns (must be integer) and wincon are present[\[6\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/gamesController.mjs#L6-L11). Invalid payloads return 400 Bad Request with { "error": "Invalid payload" }.
- All commanders referenced are ensured to exist in the commanders table via Scryfall lookups[\[7\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/gamesController.mjs#L14-L16).
- After inserting players, the server matches the winner name to the inserted players; if found, it updates winner_player_id, winner_name and commander_name on the game record[\[8\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/services/gameService.mjs#L21-L34).

### Response

On success the API returns:
```json
{  
"gameId": 42, // generated game identifier  
"playersInserted": 2, // number of players inserted  
"winnerSet": true // true if winner name matched a player  
}
```

- 201 Created is returned when the game is created successfully.
- Errors: 400 Bad Request for invalid payloads; 500 Internal Server Error when an unexpected error occurs.

## GET /api/v1/stats/most-played

Returns the top eight commanders with the highest number of games played in the last 30 days[\[2\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L3-L18). Each result contains:

- commander_name: the commander’s name.
- image: URL to an image of the commander.
- games_played: number of games in which the commander appeared.

Example response:

```json  
{ "commander_name": "Atraxa", "image": "https://…", "games_played": 5 },  
{ "commander_name": "Muldrotha", "image": "https://…", "games_played": 4 }  
```

Errors: - 500 Internal Server Error if the database query fails[\[9\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L18-L21).

## GET /api/v1/stats/commanders/win-rate

Returns a list of commanders with their total wins and games played[\[3\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L25-L38). Each object includes:

- commander_name: the commander’s name.
- wins: number of games won by players using that commander.
- games: total number of games played with that commander.

Example:

```json 
{ "commander_name": "Atraxa", "wins": 2, "games": 5 },  
{ "commander_name": "Muldrotha", "wins": 1, "games": 4 }  
```

Errors: - 500 Internal Server Error on query failure[\[10\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L38-L42).

## GET /api/v1/stats/players/win-rate

Returns win statistics for players. Can be called in two ways:

- name (string) – If provided, the API returns statistics for only that player; otherwise, it returns all players sorted by win count[\[4\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L45-L80).

Each result (or the single object) contains: - player_name - wins – total games won - games – total games played - win_rate – percentage of games won, rounded to two decimals[\[11\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L51-L57)

### Examples

1. **All players** (GET /api/v1/stats/players/win-rate):

```json
{ "player_name": "Alice", "wins": 2, "games": 5, "win_rate": 40.0 },  
{ "player_name": "Bob", "wins": 1, "games": 4, "win_rate": 25.0 }  
```

1. **Single player** (GET /api/v1/stats/players/win-rate/Alice):
```json
{ "player_name": "Alice", "wins": 2, "games": 5, "win_rate": 40.0 }
```
- If the requested player is not found, the API returns { "error": "Player not found" }[\[12\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L77-L78).
- Errors: 500 Internal Server Error when the query fails[\[13\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L82-L85).

## GET /api/v1/stats/colors/frequency

Returns the frequency of each color identity across all commanders[\[5\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L88-L103). The colors follow the Magic: the Gathering color codes W, U, B, R, G. Each result has:

- color: the color letter.
- freq: number of occurrences of that color in commander color identities.

Example response:

```json
{ "color": "W", "freq": 12 },  
{ "color": "U", "freq": 8 },  
{ "color": "B", "freq": 7 },  
{ "color": "R", "freq": 5 },  
{ "color": "G", "freq": 9 }  
```

Errors: - 500 Internal Server Error if the database query fails[\[14\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L104-L107).

## Error Handling Summary

- **400 Bad Request** – Invalid POST payload for /game (missing fields or wrong types)[\[6\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/gamesController.mjs#L6-L11).
- **500 Internal Server Error** – Database or unexpected server error[\[15\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/server.mjs#L22-L25)[\[9\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L18-L21).
- **404 Not Found** – Unknown endpoint or player not found in playerWinRate[\[12\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L77-L78).


Use this contract when integrating with the MTG‑App server to ensure correct request formatting and response handling.

[\[1\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/gamesController.mjs#L6-L21) [\[6\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/gamesController.mjs#L6-L11) [\[7\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/gamesController.mjs#L14-L16) GitHub

<https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/gamesController.mjs>

[\[2\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L3-L18) [\[3\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L25-L38) [\[4\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L45-L80) [\[5\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L88-L103) [\[9\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L18-L21) [\[10\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L38-L42) [\[11\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L51-L57) [\[12\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L77-L78) [\[13\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L82-L85) [\[14\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs#L104-L107) GitHub

<https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/controllers/statsController.mjs>

[\[8\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/services/gameService.mjs#L21-L34) GitHub

<https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/services/gameService.mjs>

[\[15\]](https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/server.mjs#L22-L25) GitHub

<https://github.com/Agentredx1/MTG-App/blob/d8349b42ab60a0d4f5436bafd508d96e30f84680/Server/src/server.mjs>