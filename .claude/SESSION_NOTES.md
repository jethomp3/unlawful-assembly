# Unlawful Assembly - Development Session Notes

## Session 1 - 2026-01-16

### Project Status: STARTING PHASE 1

### What Was Done:
- Read GAME_SPEC.md (comprehensive game design doc)
- Initialized git repository
- Created .claude folder for session tracking
- Beginning Phase 1: Core Loop implementation

### Game Overview:
- Oregon Trail-style text adventure about political resistance
- Visual evolution: Amber → +Green → +Red → Full NES palette
- 6 character classes with different difficulties
- 5 mini-games at critical story moments
- 4 acts, 30 scenes, multiple endings

### Phase 1 Priorities (Current Focus):
1. Main travel screen (Oregon Trail style)
2. Scene system with branching choices
3. Stat tracking and display
4. Color phase system

### File Structure Being Created:
```
/unlawful-assembly/
├── index.html          # Main game file
├── style.css           # Styles with color phases
├── game.js             # Main engine
├── scenes.js           # Scene data
├── minigames/          # (Phase 3)
└── .claude/
    └── SESSION_NOTES.md
```

### Key Technical Details:
- GameState tracks: democracy, legitimacy, press, fascism, supplies, allies, memorial, phase
- Color phases: 'amber', 'green', 'red', 'full'
- Stats displayed as progress bars in travel screen

### Next Session Should:
- Continue from wherever Phase 1 left off
- Check git log for latest commits
- Review this file for context

### Current Progress:
- [ ] index.html structure
- [ ] style.css with color phases
- [ ] game.js core engine
- [ ] scenes.js scene system
- [ ] Travel screen UI
- [ ] Branching choices
- [ ] Stat tracking
