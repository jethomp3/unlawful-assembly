# UNLAWFUL ASSEMBLY: THE GAME
## Complete Development Specification v2.0

### For Claude Code / Cursor / Replit Agent

---

# OVERVIEW

A hybrid text adventure + mini-game experience inspired by Oregon Trail. Players navigate the collapse of American democracy through branching narrative choices punctuated by skill-based mini-games at critical moments.

**Core Innovation:** The visual style evolves from amber monochrome (political unawareness) to full 8-bit color (political awakening) as the player progresses.

---

# VISUAL EVOLUTION SYSTEM

## Phase 1: The Amber Age (Scenes 1-5)
- **Palette:** Amber monochrome (#FFB000 on #1A1400)
- **Meaning:** Player is disconnected, viewing events through a screen
- **Aesthetic:** Old terminal, detached, comfortable ignorance

```css
.phase-amber {
  --primary: #FFB000;
  --bg: #1A1400;
  --dim: #805800;
  filter: sepia(100%) saturate(300%) hue-rotate(0deg);
}
```

## Phase 2: The Awakening (Scenes 6-12)
- **Palette:** Amber + Green added (#FFB000 + #00FF00)
- **Meaning:** Player sees "the other side" - allies, hope
- **Trigger:** First time player chooses to help someone

## Phase 3: Blood in the Water (Scenes 13-20)
- **Palette:** Add Red (#FF0000)
- **Meaning:** Violence enters, stakes become real
- **Trigger:** First witness of police brutality or character injury

## Phase 4: Full Spectrum (Scenes 21+)
- **Palette:** Full NES 8-bit palette (54 colors)
- **Meaning:** Fully awake, seeing the world in all its complexity
- **Trigger:** Player commits to the movement (major choice point)

```
COLOR UNLOCKS:
Scene 1-5:   ██ Amber only
Scene 6-12:  ██ ██ Amber + Green  
Scene 13-20: ██ ██ ██ Amber + Green + Red
Scene 21+:   Full NES palette
```

---

# CHARACTER CLASSES

Like Oregon Trail's professions, each class changes difficulty and starting stats.

## 1. THE ENGINEER (Easy Mode)
- **Description:** White, middle-class, employed at a tech company
- **Starting Stats:** Democracy 70, Legitimacy 60, Press 50, Fascism 30
- **Advantage:** "Privilege Shield" - First arrest is always released with warning
- **Disadvantage:** Can lose job if identified at protests (special event)
- **Special Ability:** "Livestream Setup" - +20% Press from documentation mini-games

## 2. THE TEACHER (Medium Mode)
- **Description:** Union member, diverse school, politically aware
- **Starting Stats:** Democracy 65, Legitimacy 55, Press 40, Fascism 35
- **Advantage:** "Community Connections" - Starts with 3 allies in network
- **Disadvantage:** Students at risk if you're arrested (emotional stakes)
- **Special Ability:** "Inspire" - Can recruit NPCs more easily

## 3. THE STUDENT (Medium Mode)
- **Description:** College activist, no dependents, flexible schedule
- **Starting Stats:** Democracy 60, Legitimacy 50, Press 45, Fascism 35
- **Advantage:** "Nothing to Lose" - No job/family consequences
- **Disadvantage:** Low starting resources, easily dismissed as "radical"
- **Special Ability:** "Social Native" - Signal Boost mini-game is easier

## 4. THE VETERAN (Medium-Hard Mode)
- **Description:** Served overseas, sees parallels to occupied territories
- **Starting Stats:** Democracy 65, Legitimacy 45, Press 35, Fascism 40
- **Advantage:** "Tactical Training" - Kettle Escape mini-game much easier
- **Disadvantage:** PTSD triggered by tear gas (random stat penalties)
- **Special Ability:** "Command Presence" - Can de-escalate police encounters

## 5. THE IMMIGRANT (Hard Mode)
- **Description:** Latino, documented but targeted anyway
- **Starting Stats:** Democracy 50, Legitimacy 40, Press 30, Fascism 50
- **Advantage:** "Community Intel" - Always knows about raids in advance
- **Disadvantage:** 
  - Arrest = immediate deportation hearing (game over possible)
  - Police aggression starts at 2x
  - Can't use "check papers" defense
  - Family members can be taken as leverage
- **Special Ability:** "Whistle Network" - Mini-game is easier, network larger

## 6. THE PASTOR (Hard Mode)
- **Description:** Black church leader, legacy of civil rights movement
- **Starting Stats:** Democracy 55, Legitimacy 65, Press 35, Fascism 45
- **Advantage:** "Sanctuary" - Church is a safe house, can't be raided (yet)
- **Disadvantage:** Congregation at risk, every choice affects others
- **Special Ability:** "Moral Authority" - Can convert conflicted cops

---

# MAIN GAME LOOP (Oregon Trail Style)

## The Travel Screen

```
╔══════════════════════════════════════════════════════════════╗
║  ░░▓▓░░ U N L A W F U L   A S S E M B L Y ░░▓▓░░             ║
║  Day 4 - March to City Hall                                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║         ┌──────────────────────────────────────┐              ║
║         │    🏛️                                │              ║
║         │        ████  ←POLICE LINE            │              ║
║         │                                      │              ║
║         │   ☻☻☻☻☻☻☻☻  ←YOUR MARCH              │              ║
║         │   ════════════════════════           │              ║
║         │          M A I N   S T               │              ║
║         └──────────────────────────────────────┘              ║
║                                                               ║
║  ⚠ ALERT: Counter-protesters spotted on Pine St               ║
║                                                               ║
╠══════════════════════════════════════════════════════════════╣
║  DEMOCRACY ████████░░ 72    FASCISM   ███░░░░░░░ 31          ║
║  LEGITIMACY ██████░░░░ 58    PRESS     █████░░░░░ 48          ║
╠══════════════════════════════════════════════════════════════╣
║  SUPPLIES: Water[████] Medkits[██░░] Bail Fund[$2,400]       ║
╠══════════════════════════════════════════════════════════════╣
║  [1] Continue March        [3] Check Supplies                 ║
║  [2] Stop and Organize     [4] Talk to Allies                 ║
║                            [5] Scout Ahead                    ║
╚══════════════════════════════════════════════════════════════╝
```

## Random Events While Marching

Like Oregon Trail's "You found wild berries" or "Thief stole supplies":

**Positive Events:**
- "A local business owner brings water for the marchers" (+Supplies)
- "A cop you talked to earlier lets your group pass" (+Legitimacy)
- "Your livestream just hit 100K views" (+Press)
- "Off-duty nurses join your medic team" (+Medkits)

**Negative Events:**
- "Police drone spotted overhead - they're documenting faces" (+Fascism)
- "Counter-protesters slashed tires on the supply van" (-Supplies)
- "A plant threw a brick - news is blaming you" (-Legitimacy, +Press)
- "City shut off water fountains along march route" (-Supplies)

**Choice Events:**
- "A family is being raided one block over. Intervene?"
- "Reporter wants an interview. Risk identification?"
- "Undercover cop identified in crowd. Expose them?"

---

# MINI-GAMES (Critical Moments Only)

## MINI-GAME 1: "The Kettle" (Escape/Maze)

### Trigger
Police begin encirclement maneuver during march.

### Setup
```
╔════════════════════════════════════════╗
║  !!! KETTLE ALERT !!!                  ║
║  Police forming perimeter              ║
║  Find exit before trapped              ║
║                                        ║
║  ████████████████████████████████      ║
║  █                              █      ║
║  █  ☻☻☻     ████                █      ║
║  █  ☻☻☻        ████             █      ║
║  █  ☻YOU           ████         █      ║
║  █                     ████     ░ EXIT ║
║  █  ████                   ████ █      ║
║  █      ████                    █      ║
║  ████████████████████████████████      ║
║                                        ║
║  Arrow keys to move                    ║
║  SPACE to rally followers              ║
║  Time: 00:45                           ║
╚════════════════════════════════════════╝
```

### Mechanics
- Top-down maze view
- Police lines (████) closing in from edges
- You control main character (☻)
- Other protesters follow you (escort mission)
- Some paths blocked, some have allies who open gates
- Timer countdown (45 seconds on Normal)

### Difficulty Scaling
- **Easy:** 60 seconds, fewer police, more exits
- **Normal:** 45 seconds, standard
- **Hard:** 30 seconds, more police, one exit
- **Immigrant Mode:** 25 seconds, police move faster toward you specifically

### Outcomes
**Success:** Escape with followers
- +10 Legitimacy ("organized retreat")
- Followers become permanent allies
- Continue story

**Partial:** You escape, some followers don't
- +5 Press (dramatic footage)
- -5 Legitimacy (left people behind)
- Random follower arrested

**Failure:** Kettled
- Mass arrest scene (not game over, but costly)
- -$500 Bail Fund per person
- -15 Legitimacy
- Skip to jail processing scene

---

## MINI-GAME 2: "Whistle Network" (Memory/Simon Says)

### Trigger
ICE raid detected in neighborhood. Must warn families.

### Setup
```
╔════════════════════════════════════════╗
║  !!! ICE RAID INCOMING !!!             ║
║  Warn the network before it's too late ║
║                                        ║
║  Learn the pattern:                    ║
║                                        ║
║     ♪ ♪ ♪───                           ║
║    (short short looong)                ║
║                                        ║
║  Houses to warn: 8                     ║
║  Time until raid: 02:30                ║
║                                        ║
║  [SPACE] = Short whistle               ║
║  [HOLD SPACE] = Long whistle           ║
║                                        ║
║  ┌───┐ ┌───┐ ┌───┐ ┌───┐              ║
║  │ 🏠 │ │ 🏠 │ │ 🏠 │ │ 🏠 │              ║
║  └───┘ └───┘ └───┘ └───┘              ║
║    ░     ░     ░     ░   ← unwarned   ║
╚════════════════════════════════════════╝
```

### Mechanics
- Pattern starts simple: ♪ ♪ ♪─── (two short, one long)
- Each successful warning makes pattern longer
- Houses light up when warned (░ → █)
- Wrong pattern = confusion, house doesn't pass it on
- Timer represents ICE arrival

### Pattern Progression
```
Round 1: ♪ ♪ ♪───
Round 2: ♪ ♪ ♪─── ♪
Round 3: ♪ ♪ ♪─── ♪ ♪───
Round 4: ♪ ♪ ♪─── ♪ ♪─── ♪ ♪
...etc
```

### THE DARK ENDING (Failure)

If you fail to warn enough houses:

```
╔════════════════════════════════════════╗
║                                        ║
║  The vans arrive.                      ║
║                                        ║
║  House 3 wasn't warned.                ║
║                                        ║
║  You hear the door break.              ║
║  You hear the screaming.               ║
║  You hear a child crying for mama.     ║
║                                        ║
║  The Hernandezes are gone.             ║
║                                        ║
║  Their daughter Sofia, age 6,          ║
║  is now in the system.                 ║
║  You'll never know where.              ║
║                                        ║
║  ┌───┐ ┌───┐ ┌───┐ ┌───┐              ║
║  │ █ │ │ █ │ │ ░ │ │ █ │              ║
║  └───┘ └───┘ └─X─┘ └───┘              ║
║              TAKEN                     ║
║                                        ║
║  You got the pattern wrong.            ║
║  They paid for it.                     ║
║                                        ║
║  [CONTINUE]                            ║
╚════════════════════════════════════════╝
```

### Outcomes
**Full Success (8/8):** 
- All families escape
- +15 Legitimacy
- +10 Democracy
- Network grows (+2 allies)

**Partial (5-7/8):**
- Most escape, some taken
- +5 Legitimacy
- Dark scene shows who was taken
- Their names added to memorial

**Failure (0-4/8):**
- Mass raid succeeds
- -10 Democracy
- -10 Legitimacy  
- Brutal scene of families separated
- If playing as Immigrant: family member can be taken

---

## MINI-GAME 3: "Documentation" (Photography)

### Trigger
Police brutality occurring - need evidence.

### Setup
```
╔════════════════════════════════════════════════╗
║  DOCUMENT THE EVIDENCE                          ║
║  Get clear shots before they see you            ║
╠════════════════════════════════════════════════╣
║  ┌──────────────────────────────────────┐      ║
║  │ [VIEWFINDER]                         │      ║
║  │                                      │      ║
║  │      ┌─────┐                         │      ║
║  │      │BADGE│ ← need this             │      ║
║  │      │#4471│                         │      ║
║  │      └─────┘                         │      ║
║  │           ☻ OFFICER                  │      ║
║  │            \                         │      ║
║  │             🦯 ← BEATING             │      ║
║  │              \                       │      ║
║  │               ☻ VICTIM               │      ║
║  │              (on ground)             │      ║
║  │                                      │      ║
║  └──────────────────────────────────────┘      ║
║                                                ║
║  CHECKLIST:          DANGER: ██░░░░░░░░        ║
║  [ ] Badge Number    (they'll see you soon)    ║
║  [ ] Officer Face                              ║
║  [ ] Action (strike)                           ║
║  [ ] Victim                                    ║
║                                                ║
║  Arrow keys: Pan    Z/X: Zoom    SPACE: Snap   ║
╚════════════════════════════════════════════════╝
```

### Mechanics
- Camera viewfinder overlay
- Pan around scene with arrow keys
- Zoom with Z/X keys
- SPACE to take photo
- Each required element must be in frame AND in focus
- "Danger meter" fills as you linger - they'll spot you
- Blurry photos = inadmissible

### Photo Quality System
```
FOCUS CHECK:
- Too zoomed out = "Image too unclear for identification"
- Too zoomed in = "Missing context"  
- Sweet spot = "CLEAR - ADMISSIBLE"

REQUIRED SHOTS:
1. Badge number (zoomed in)
2. Officer face (medium)
3. The action/strike (wide)
4. Victim's condition (medium)
```

### Outcomes
**Full Documentation (4/4 clear):**
- Evidence package complete
- +20 Press
- +15 Legitimacy
- Officer later identified (news event)
- Can be used in court scene later

**Partial (2-3/4):**
- Some evidence
- +10 Press
- "Footage inconclusive, no charges"

**Failure/Caught:**
- Phone confiscated
- -10 Press
- You become the victim (injury)
- If Immigrant: arrest triggered

---

## MINI-GAME 4: "Ballot Guardian" (Tower Defense/Photography Hybrid)

### Trigger
Election Day - protecting ballot drop box

### Setup
```
╔════════════════════════════════════════════════╗
║  BALLOT BOX GUARDIAN - ELECTION DAY            ║
║  Protect the box. Document threats. Help voters║
╠════════════════════════════════════════════════╣
║                                                ║
║    ← THREAT LANE                               ║
║   🛻💨        →→→        ┌─────┐               ║
║   [MAGA TRUCK]           │ 📫  │  ← DROP BOX  ║
║                          │VOTES│               ║
║    ← VOTER LANE          └─────┘               ║
║   👤 →→→  👤 →→→                 ☻ YOU         ║
║   [VOTERS approaching]                         ║
║                                                ║
╠════════════════════════════════════════════════╣
║  BOX HEALTH: ████████░░                        ║
║  VOTERS HELPED: 12                             ║
║  THREATS DOCUMENTED: 3                         ║
║  TIME UNTIL POLLS CLOSE: 04:30                 ║
╠════════════════════════════════════════════════╣
║  [SPACE] = Take photo of threat (stops them)   ║
║  [E] = Escort nearby voter to box              ║
║  [Q] = Call for backup (limited uses)          ║
╚════════════════════════════════════════════════╝
```

### Mechanics
- Two lanes: threats from left, voters from right
- **Trucks with Trump flags** approach the box
  - If they reach it: they damage box (spray paint, intimidation, physical damage)
  - Taking their photo STOPS them (they flee, afraid of documentation)
  - Photo must be taken BEFORE they reach the box
  
- **Voters** approach nervously
  - Some turn back if intimidated (truck nearby)
  - Escorting them (press E when near) guarantees their vote
  - Each successful vote = +1 Democracy at end
  
- **Backup** = limited ally calls
  - Brings another guardian for 30 seconds
  - Only 3 uses total

### Threat Types
```
🛻 TRUCK: Slow, will damage box, scared of cameras
🏍️ BIKE: Fast, will intimidate voters, circles back
👤 POLL WATCHER: Stands near box, scares voters, legal (can't photo)
   - Must ESCORT voters past them instead
🔥 MOLOTOV: Rare, fast, destroys box if not caught (hard mode only)
```

### Outcomes
**Victory (Box survives + 20+ voters):**
- +20 Democracy
- +10 Legitimacy
- "Your district held. Others didn't."

**Pyrrhic (Box survives + <10 voters):**
- +5 Democracy
- "The box made it. The voters didn't."

**Failure (Box destroyed):**
- -15 Democracy
- +15 Fascism
- "The footage you took wasn't enough. They came back at night."
- Dark scene: charred box, scattered ballots

---

## MINI-GAME 5: "The Orange Menace" (Final Boss)

### Trigger
Endgame confrontation (metaphorical/satirical boss fight)

### Setup
```
╔════════════════════════════════════════════════╗
║  THE GOLDEN IDOL RISES                         ║
║  "Nobody's ever seen anything like it, folks"  ║
╠════════════════════════════════════════════════╣
║                                                ║
║              📱← SWATTING PHONE                ║
║             \                                  ║
║         ┌────────────┐                         ║
║         │  👔        │                         ║
║         │ 🟠        │  ← THE ORANGE ONE       ║
║         │ ████████  │    (inflated, golden)   ║
║         │ ████████  │                         ║
║         └────────────┘                         ║
║              │                                 ║
║         [PODIUM]                               ║
║                                                ║
║    📄📄📄 ← YOUR AMMO (Epstein files)         ║
║                                                ║
║    ☻ YOU                                       ║
║                                                ║
╠════════════════════════════════════════════════╣
║  PHONE STATUS: [SWATTING] / [TWEETING]         ║
║  When TWEETING = throw files!                  ║
║  When SWATTING = he blocks! wait!              ║
║                                                ║
║  BOSS HEALTH: ████████████████████ 100%       ║
║  FILES STUCK: 0 / 10 needed                    ║
║                                                ║
║  [SPACE] = Throw Epstein File                  ║
╚════════════════════════════════════════════════╝
```

### Mechanics
- Boss cycles between two states:
  - **TWEETING:** Phone down, typing angrily, VULNERABLE
  - **SWATTING:** Phone up, blocking, IMMUNE
  
- You throw **Epstein Files** (📄)
  - Files that hit during TWEETING = STICK to him
  - Files that hit during SWATTING = blocked, wasted
  
- Each stuck file:
  - Makes him slightly smaller (deflating)
  - Triggers a rage tweet shown on screen (comedy)
  
- He has **counter-attacks:**
  - "FAKE NEWS BEAM" - must dodge
  - "LAWSUIT SWARM" - papers fly at you, reduce your ammo
  - "RALLY CRY" - summons MAGA minions briefly

### The Phone Pattern
```
State: TWEETING (3 seconds) → SWATTING (2 seconds) → repeat

Visual tells:
- TWEETING: Phone tilted down, thumbs moving, "..." speech bubble
- SWATTING: Phone raised like shield, angry face

Audio tells (if implemented):
- TWEETING: keyboard clicks
- SWATTING: whoosh/block sound
```

### Rage Tweets (displayed when hit)
```
HIT 1: "The FAKE NEWS media is throwing LIES at me! SAD!"
HIT 2: "I barely knew Epstein. Many people knew him. I knew him the least."
HIT 3: "This is a WITCH HUNT worse than Salem!"
HIT 4: "Why isn't anyone talking about HUNTER'S LAPTOP???"
HIT 5: "I am the most PERSECUTED person in HISTORY. More than Jesus!"
HIT 6: "The files are AI FAKES created by the DEEP STATE!"
HIT 7: "Nobody's ever seen a more UNFAIR attack. Nobody."
HIT 8: "I will RELEASE my own files. Very soon. Very powerful files."
HIT 9: "STOP THE STEAL!" (wrong context but he's panicking)
HIT 10: "I... I hardly remember... look, everyone makes mistakes..."
```

### Victory Sequence
When 10 files stuck:
```
╔════════════════════════════════════════════════╗
║                                                ║
║  The files stick.                              ║
║                                                ║
║  The golden surface can't shake them.          ║
║                                                ║
║  For once, the deflection doesn't work.        ║
║                                                ║
║         ┌────────────┐                         ║
║         │📄 👔 📄    │                         ║
║         │📄 🟠 📄   │                         ║
║         │📄📄📄📄📄│ ← covered in files       ║
║         │  ████████  │                         ║
║         └────────────┘                         ║
║          *psssssssss* ← deflating              ║
║                                                ║
║  The crowd stops cheering.                     ║
║  The cameras keep rolling.                     ║
║  He gets smaller.                              ║
║  And smaller.                                  ║
║                                                ║
║  Not with a bang.                              ║
║  Just a quiet, pathetic hiss of escaping air.  ║
║                                                ║
║  [CONTINUE TO ENDING]                          ║
╚════════════════════════════════════════════════╝
```

---

# STORY STRUCTURE

## ACT 1: AMBER (Awakening)
*Color: Amber monochrome only*

### Scene 1: The Wake-Up Call
- Helicopters outside
- Maria's text about the Garcias
- First choice: engage or ignore?

### Scene 2: The Choice
- Delete text → bad ending path
- Respond → continue

### Scene 3-5: Investigation
- Learn about the raids
- Meet the network
- First hint of larger movement

**ACT 1 ENDS:** Player commits to attending protest
**COLOR UNLOCK:** Green added (allies visible)

---

## ACT 2: GREEN (The Movement)
*Color: Amber + Green*

### Scene 6-8: Downtown Arrival
- "Mob" is actually families
- Meet the factions (Dads, Medics, Front Line)
- Choose your role

### Scene 9-12: The March
- Oregon Trail travel mode begins
- Random events
- Build toward confrontation

**MINI-GAME TRIGGER:** "The Kettle" (Scene 10 or 11)

**ACT 2 ENDS:** Police line confrontation begins
**COLOR UNLOCK:** Red added (blood, violence, stakes)

---

## ACT 3: RED (The Cost)
*Color: Amber + Green + Red*

### Scene 13-15: The Line
- Tear gas deployed
- Hold or break choice
- Possible arrest

### Scene 16-18: The Night
- Jail or vigil (depending on path)
- Marcus's death (teacher character)
- The human cost becomes real

**MINI-GAME TRIGGER:** "Documentation" (Scene 14)
**MINI-GAME TRIGGER:** "Whistle Network" (Scene 17 - if raid event)

**ACT 3 ENDS:** Grief transforms into resolve
**COLOR UNLOCK:** Full 8-bit palette

---

## ACT 4: FULL COLOR (The Long Game)
*Color: Full NES palette*

### Scene 19-22: The Movement Grows
- Time skip: weeks/months
- Building infrastructure
- Coalition forming

### Scene 23-25: Election Day
**MINI-GAME TRIGGER:** "Ballot Guardian"

### Scene 26-28: The Reckoning
- Results and aftermath
- Building toward final confrontation

### Scene 29-30: The Boss
**MINI-GAME TRIGGER:** "The Orange Menace"

---

## ENDINGS (Based on Final Stats)

### Ending A: "Defiant" (Democracy > 70, Fascism < 40)
- Democracy wounded but alive
- Movement continues
- Ends with Greenland joke: "And now they want to invade Greenland..."

### Ending B: "Pyrrhic" (Democracy 40-70, Fascism 40-60)
- Unclear who won
- Exhausted but standing
- "We didn't win. But we didn't lose. Yet."

### Ending C: "The Fall" (Democracy < 40)
- Institutions collapsed
- Underground resistance
- Dark but thread of hope

### Ending D: "Fascism" (Fascism > 80)
- Overt authoritarian rule
- "Temporary emergency measures"
- Chilling final scene

### Ending E: "Complicit" (Never engaged)
- You stayed safe
- Now the knock comes for you
- "First they came..."

---

# TECHNICAL SPECIFICATIONS

## File Structure
```
/unlawful-assembly/
├── index.html          # Main game file (single page app)
├── style.css           # All styles (or inline)
├── game.js            # Main engine
├── scenes.js          # All scene data
├── minigames/
│   ├── kettle.js      # Escape maze
│   ├── whistle.js     # Simon says
│   ├── document.js    # Photography
│   ├── ballot.js      # Tower defense
│   └── boss.js        # Final boss
└── assets/
    └── (optional sprites/sounds)
```

## Core Engine Pseudocode
```javascript
const GameState = {
  democracy: 65,
  legitimacy: 50,
  press: 40,
  fascism: 35,
  day: 1,
  supplies: { water: 100, medkits: 50, bail: 2000 },
  allies: [],
  memorial: [], // Names of the lost
  phase: 'amber', // amber → green → red → full
  character: null, // Selected class
  flags: {} // Story flags
};

function updateColors(phase) {
  document.body.className = `phase-${phase}`;
  // CSS handles the rest
}

function triggerMinigame(gameId, difficulty) {
  // Pause main game
  // Load minigame module
  // Run minigame
  // Return results to main game
  // Apply stat changes
}

function checkEnding() {
  if (GameState.democracy <= 0) return 'fall';
  if (GameState.fascism >= 100) return 'fascism';
  // etc
}
```

## Responsive Design
- Desktop: Full ASCII art display
- Mobile: Simplified graphics, larger touch targets
- Mini-games must work on touch screens

---

# CONTENT WARNINGS

Display at game start:
```
This game contains:
- Depictions of state violence and police brutality
- Family separation and deportation
- Character death
- References to real political events and figures (satirized)

It is intended as political satire and commentary.
It may be distressing. That's partly the point.

[BEGIN] [CONTENT SETTINGS]
```

Content settings allow:
- Skip mini-games (auto-resolve with average outcome)
- Reduce violence descriptions
- Hide death scenes (summarize instead)

---

# DEVELOPMENT PRIORITY

## Phase 1: Core Loop
1. Main travel screen (Oregon Trail style)
2. Scene system with branching choices
3. Stat tracking and display
4. Color phase system

## Phase 2: Story Content
5. Write all Act 1-2 scenes
6. Implement random events
7. Write all Act 3-4 scenes
8. Implement endings

## Phase 3: Mini-Games
9. The Kettle (maze escape)
10. Whistle Network (simon says)
11. Documentation (photography)
12. Ballot Guardian (tower defense)
13. The Orange Menace (boss fight)

## Phase 4: Polish
14. Character class selection
15. Difficulty settings
16. Sound (optional)
17. Mobile optimization
18. Playtesting and balance

---

# FINAL NOTES

This game should make players uncomfortable—not through gratuitous content, but through recognition. The horror is how familiar it feels.

The color evolution isn't just aesthetic. It's the thesis: political awareness is painful, but necessary. You can't go back to amber once you've seen in full color.

Every playthrough should end with the player thinking about Greenland. Because the absurdity never stops. And neither can we.

---

*"The only thing necessary for the triumph of evil is for good people to do nothing."*

*This is a game about doing something.*
