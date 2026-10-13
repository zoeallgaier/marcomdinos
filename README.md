# The Dinosaurs of MarCom

A field guide to the IA MarCom team, identified down to the species. Interactive deck with live audience voting.

- **Deck:** https://zoeallgaier.github.io/marcomdinos/
- **Ballot (what the QR code opens):** https://zoeallgaier.github.io/marcomdinos/vote.html

## Running it

Open the deck on the presenting machine. The room scans the QR code on the title slide before you start.

| Key | Does |
| --- | --- |
| → / space / click / clicker | Next clue (one at a time), then reveal the name, then next slide |
| ← | Hide the last clue, then previous slide |
| R | Toggle the reveal |
| F | Fullscreen |

Keep one deck tab open while presenting. It's what tells phones which dinosaur is up.

Move the mouse for the toolbar: reveal, fullscreen, **reset votes** (clears the room after a rehearsal) and connection status.

Phones follow the presenter automatically.

Rehearse at `index.html?practice`. Everything works locally and nothing is sent, so rehearsals don't touch the live room or its limits.

## How the voting works

There's no server of our own. Every vote, reveal and slide change is a small JSON message on a shared list. The deck and every phone replay the same list, so everyone sees the same live results. `assets/data.js` picks the relay:

- **Firebase Realtime Database** (`CONFIG.firebase`, recommended). No daily caps. Create a free project, add a Realtime Database in test mode, and paste its URL into `CONFIG.firebase`. **reset votes** deletes the room. Test-mode rules expire after 30 days.
- **ntfy.sh** (used when `CONFIG.firebase` is empty). Free, no account, but capped at 250 messages a day per IP address, resetting at midnight UTC. Messages expire after about 12 hours.
- Anyone who knows the topic name can read or post to it. To start a completely fresh room, change `CONFIG.topic`.

The answer key lives only in `assets/deck.js`. Phones learn each name at the reveal.

## Files

```
index.html        deck
vote.html         phone ballot
assets/data.js    config, roster, dinosaurs + clues
assets/live.js    shared vote stream
assets/deck.js    slides, answer key, presenter controls
assets/vote.js    ballot
```
