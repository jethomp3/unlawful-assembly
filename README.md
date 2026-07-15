# UNLAWFUL ASSEMBLY

*An American Trail, 2026.* A satirical Oregon Trail homage about the collapse
of American democracy.

You lead a five-person affinity group on a 400-mile protest march from your
hometown to a mass demonstration at the Capital, 40 days out. The pioneers
walked away from civilization to build something; you walk toward the seat of
power to save something. Same mechanics, opposite direction.

## The reskin

| Oregon Trail | Unlawful Assembly |
|---|---|
| The wagon party | Your affinity group (name them; grieve them) |
| Dysentery | *"Rosa has been detained indefinitely."* |
| Rations | **Visibility profile** — loud & visible feeds the movement and the surveillance; gray & quiet starves both |
| Hunting | **Documentation** — a photography mini-game; footage converts to support and donations, capped by the news cycle |
| Bullets | Phone batteries |
| Fording the river | **Checkpoint crossings** — push through / long detour / lawyer escort (the ferry) / wait it out |
| The capsized wagon | The kettle |
| Banker / Carpenter / Farmer | Tech Worker (×1) / Teacher (×2) / Undocumented Organizer (×3) — privilege is the difficulty setting |
| Tombstones on the trail | Roadside memorials that persist across playthroughs |

Two meters drive the world: **Support** (the movement's momentum) and
**Crackdown** (state escalation). Crackdown also rises on its own —
doing nothing is not neutral. That is the thesis in a number.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # engine + scoring suites (vitest)
npm run build    # static dist/ — deploys to Vercel with zero config
```

Keyboard-first (number keys, SPACE BAR), fully clickable, touch-capable in
the mini-game (drag to pan, pinch to zoom). Zero runtime dependencies.

## Status

**Full game**: all 400 miles across three acts, three written checkpoints
(the Interstate 9 Overpass, the Meridian River Bridge, the Capital Beltway
perimeter), ~40 events across three registers, town resupply stores whose
prices climb with Crackdown, and four demonstration endings — Defiant,
Pyrrhic, The Fall, and The Echo (arrive too late) — plus the Complicit
ending for going home. Every road ends at Greenland.

The march auto-continues Oregon Trail-style: press SPACE to walk, and days
roll by (~3 seconds each) until something on the road needs you. Reading
screens always wait; ESC or any menu number halts the column.

The previous implementation lives in `legacy/`; the original design document
is `GAME_SPEC.md` (historical).

## Content note

This game contains depictions of state violence, family separation, and
political persecution, played sometimes for grief and sometimes for satire.
It may be distressing. That is partly the point.

*The only thing necessary for the triumph of evil is for good people to do
nothing. This is a game about doing something.*
