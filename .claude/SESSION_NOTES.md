# Unlawful Assembly - Development Session Notes

## Session 1 - 2026-01-16

### STATUS: PHASE 1 COMPLETE

### What Was Done:
- Read GAME_SPEC.md (comprehensive game design doc)
- Initialized git repository
- Created .claude folder for session tracking
- **Completed all Phase 1: Core Loop implementation**

### Files Created:

| File | Purpose | Status |
|------|---------|--------|
| `index.html` | Main game structure with all screens | Complete |
| `style.css` | Color phase system (amber/green/red/full) | Complete |
| `game.js` | Core engine with GameState, stats, choices | Complete |
| `scenes.js` | ~30 branching scenes for Act 1 | Complete |
| `.gitignore` | Standard ignores | Complete |

### Game Overview:
- Oregon Trail-style text adventure about political resistance
- Visual evolution: Amber -> +Green -> +Red -> Full NES palette
- 6 character classes with different difficulties
- 5 mini-games at critical story moments (Phase 3)
- 4 acts, 30 scenes, multiple endings

### Phase 1 Implementation Details:

#### 1. Main Travel Screen (Oregon Trail style)
- Header with title bar, day/location display
- Scene display area with ASCII art support
- Alert system for notifications
- Stats panel with progress bars
- Supplies display (water, medkits, bail fund)
- Choice buttons with keyboard shortcuts (1-9)

#### 2. Scene System with Branching Choices
- Full scene data structure in `scenes.js`
- Support for: text, ASCII art, effects, alerts, flags, allies
- Conditional choices based on requirements
- ~30 unique scenes covering Act 1 (Amber phase)
- Multiple narrative paths:
  - Engage immediately -> join movement
  - Hesitate -> second chances
  - Ignore -> complicit ending path

#### 3. Stat Tracking and Display
- Democracy, Legitimacy, Press, Fascism (0-100)
- Visual progress bars with color coding
- Supplies: Water, Medkits, Bail Fund
- Allies array, Memorial array (for the lost)
- Real-time updates on stat changes

#### 4. Color Phase System
- CSS custom properties for each phase
- Phase transitions triggered by scene numbers:
  - Scenes 1-5: Amber only
  - Scenes 6-12: +Green (allies visible)
  - Scenes 13-20: +Red (stakes real)
  - Scenes 21+: Full NES palette
- Alert shown on phase transitions

### Implemented Features:
- [x] Content warning screen with settings
- [x] Character selection (6 classes)
- [x] Class-specific starting stats and abilities
- [x] Scene loading with branching choices
- [x] Stat effects from choices
- [x] Flag system for story tracking
- [x] Ally management
- [x] Memorial for lost characters
- [x] Random events framework
- [x] Minigame outcome placeholders
- [x] Multiple ending support
- [x] Save/load to localStorage
- [x] Keyboard controls (1-9 for choices)
- [x] Responsive CSS for mobile

### Git Commits:
```
b0e7f4e feat: implement Phase 1 core game loop
749ad31 chore: ignore local claude settings
76d4c2c feat: implement Kettle escape mini-game
```

---

## Session 1 (continued) - Kettle Mini-Game

### Kettle Mini-Game Implemented:
- **File:** `minigames/kettle.js` (~500 lines)
- **Gameplay:** Timed escape maze where police close in from all sides
- **Mechanics:**
  - Grid-based movement (arrow keys)
  - Police perimeter closes in over time
  - Followers you must rally (SPACE) and escort to exit
  - Timer countdown (varies by difficulty)
  - Three outcomes: success, partial escape, kettled (failure)

### Difficulty Scaling:
| Class | Difficulty | Time | Notes |
|-------|-----------|------|-------|
| Engineer | Easy | 60s | More exits, slower police |
| Veteran | Easy | 60s | Tactical training bonus |
| Teacher/Student | Normal | 45s | Standard |
| Pastor | Normal | 45s | Standard |
| Immigrant | Hard | 25s | Police target player directly |

### New Story Scenes Added:
- `scene7_frontline` - March reaches police line
- `scene8_kettle` - Triggers the Kettle mini-game
- `scene8_hold` - Alternative: stand ground and face tear gas
- `scene9_after_kettle` - Escape aftermath
- `scene9_arrest` - Arrest path
- `scene10_aftermath` - Community response next day
- `scene10_home` - Go home to process
- `scene10_jail` - Jail holding cell
- `scene11_release` - Released on bail

### Integration:
- `game.js` updated with minigame triggering logic
- CSS styles for kettle game grid and UI
- Scene `minigame: 'kettle'` property triggers game

---

## Session 1 (continued) - Documentation Mini-Game

### Documentation Mini-Game Implemented:
- **File:** `minigames/document.js` (~650 lines)
- **Gameplay:** Photography game - capture evidence of police brutality

### Key Mechanics:
- **Moving targets:** 3 officers with different patrol patterns:
  - Horizontal, vertical, circular, random movement
- **Camera controls:**
  - Arrow keys: Pan viewport
  - Z/X: Zoom in/out
  - SPACE: Take photo
- **Zoom requirements for each shot type:**
  - Badge: 2.5-3x zoom (high detail)
  - Face: 1.75-2.5x zoom (medium)
  - Action: 1-1.75x zoom (wide, needs victim in frame too)
- **Occlusion:** Officers can block each other
- **Danger meter:** Fills faster when zoomed in

### Difficulty Scaling:
| Class | Time | Officer Speed | Danger Rate |
|-------|------|---------------|-------------|
| Engineer | 90s | Slow | Low |
| Normal | 60s | Medium | Medium |
| Hard | 45s | Fast | High |
| Immigrant | 40s | Very Fast | Very High |

### New Story Scenes:
- `scene12_brutality` - Triggers documentation minigame
- `scene13_after_doc` - Aftermath choices
- `scene13_show_footage` - Share evidence with legal observer
- `scene13_shock` - Too traumatized to speak

### Git Commit:
```
f094074 feat: implement Documentation photography mini-game
```

---

## Next Session Should:

### Phase 2: Story Content
1. Write Act 2 scenes (scenes 7-12) - The March
2. Write Act 3 scenes (scenes 13-20) - The Cost
3. Write Act 4 scenes (scenes 21-30) - The Long Game
4. Implement all 5 endings with full text
5. Add more random events for each phase

### Phase 3: Mini-Games
1. ~~The Kettle (maze escape) - `minigames/kettle.js`~~ DONE
2. Whistle Network (Simon says) - `minigames/whistle.js`
3. ~~Documentation (photography) - `minigames/document.js`~~ DONE
4. Ballot Guardian (tower defense) - `minigames/ballot.js`
5. The Orange Menace (boss fight) - `minigames/boss.js`

### Phase 4: Polish
1. Character class special abilities
2. Difficulty settings
3. Mobile optimization
4. Sound (optional)
5. Playtesting and balance

---

## Quick Start for Next Session:

```bash
# Open game in browser
start index.html

# Or use a local server
npx serve .
```

### Key Files to Edit:
- `scenes.js` - Add more story scenes
- `game.js` - Add new features/mechanics
- `style.css` - Adjust visuals
- `minigames/` - Create mini-game modules (Phase 3)

### Architecture Notes:
- `Game` object is global, contains all state and methods
- `Scenes` object is global, contains all scene data
- Scenes reference each other by ID (e.g., 'scene2_respond')
- Effects are applied automatically: `{democracy: 10, fascism: -5}`
- Flags track story state: `setFlag: 'went_to_center'`
- Requirements gate choices: `requires: {flag: 'engaged'}`
