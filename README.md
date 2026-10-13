# The Dinosaurs of MarCom

A field guide to the IA MarCom team, identified down to the species. Interactive deck with live audience voting.

- **Deck:** https://zoeallgaier.github.io/marcomdinos/
- **Ballot (what the QR code opens):** https://zoeallgaier.github.io/marcomdinos/vote.html

## Running it

Open the deck on the presenting machine. The room scans the QR code on the title slide before you start.

| Key | Does |
| --- | --- |
| → / space / clicker | Reveal the name, then next slide |
| ← | Previous slide |
| R | Toggle the reveal |
| F | Fullscreen |

Move the mouse for the toolbar: reveal, fullscreen, **reset votes** (clears the room after a rehearsal) and connection status.

On first scan, phones ask who you are. Your own name is hidden as an option, and your vote on your own dinosaur doesn't count. Votes stay anonymous. Phones show the room's results after each reveal; the live count is on the big screen.

Phones follow the presenter automatically. People can browse other dinosaurs from the chips at the bottom and tap "back to live" to rejoin.

## How the voting works

There's no server. Every vote, reveal and slide change is a small JSON message on a public [ntfy.sh](https://ntfy.sh) topic (set in `assets/data.js`). The deck and every phone replay the same stream, so everyone sees the same live results.

- Messages expire from ntfy.sh after about 12 hours, so yesterday's rehearsal votes won't show up. Use **reset votes** to clear a same-day rehearsal.
- Free ntfy.sh limits are per IP address. A room of ~15 on the same Wi-Fi is fine. For a much bigger crowd, ask people to use cellular.
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
