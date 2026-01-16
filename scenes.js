/**
 * UNLAWFUL ASSEMBLY - Scene Data
 * All story scenes and branching narrative
 */

const Scenes = {
    // ==========================================
    // ACT 1: AMBER (The Awakening) - Scenes 1-5
    // ==========================================

    scene1: {
        day: 1,
        location: 'Your Apartment',
        art: `
    ╔════════════════════════════════════════╗
    ║  3:47 AM                               ║
    ║                                        ║
    ║     ┌─────────┐    ___                 ║
    ║     │ ░░░░░░░ │   /   \\               ║
    ║     │ ░░░░░░░ │  │ ☻  │  ← you        ║
    ║     │ window  │   \\___/               ║
    ║     └─────────┘    ═══  bed           ║
    ║                                        ║
    ║     *THWUP THWUP THWUP*                ║
    ║           helicopters                  ║
    ╚════════════════════════════════════════╝`,
        text: `<p>You wake to the sound of helicopters.</p>
               <p>Not the distant drone of news choppers. These are low. Close. The kind that shake your windows.</p>
               <p>Your phone buzzes. Then again. Then doesn't stop.</p>
               <p>It's 3:47 AM.</p>
               <p class="dialogue"><span class="speaker">Maria (text):</span> They took the Garcias. ICE. The whole family. Kids too.</p>
               <p class="dialogue"><span class="speaker">Maria (text):</span> Sofia is 6.</p>
               <p class="dialogue"><span class="speaker">Maria (text):</span> Are you awake? We need to do something.</p>`,
        choices: [
            {
                text: 'Respond to Maria',
                effects: { democracy: 5 },
                setFlag: 'engaged',
                next: 'scene2_respond'
            },
            {
                text: 'Put the phone down. Go back to sleep.',
                effects: { fascism: 5 },
                next: 'scene2_ignore'
            },
            {
                text: 'Check the news first',
                next: 'scene2_news'
            }
        ]
    },

    scene2_respond: {
        day: 1,
        location: 'Your Apartment',
        text: `<p>Your fingers hover over the keyboard. What do you even say?</p>
               <p class="dialogue"><span class="speaker">You:</span> I'm awake. What happened? Where are they taking them?</p>
               <p>The typing indicator appears. Disappears. Appears again.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> Processing center downtown. There's already people gathering outside.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> Some of us are going. To witness. To document.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> I know it's a lot to ask.</p>
               <p>Outside, another helicopter passes. The searchlight sweeps across your ceiling like a accusation.</p>`,
        effects: { legitimacy: 5 },
        choices: [
            {
                text: '"I\'ll meet you there."',
                effects: { democracy: 10, legitimacy: 5 },
                setFlag: 'went_to_center',
                next: 'scene3_center'
            },
            {
                text: '"What can I actually do?"',
                next: 'scene2_hesitate'
            },
            {
                text: '"I need to think about this."',
                effects: { fascism: 3 },
                next: 'scene2_delay'
            }
        ]
    },

    scene2_ignore: {
        day: 1,
        location: 'Your Apartment',
        text: `<p>You put the phone face-down on the nightstand.</p>
               <p>The helicopters fade. Your heartbeat slows.</p>
               <p>It's not your problem. You have work tomorrow. You need sleep.</p>
               <p>The Garcias... you met them once, maybe twice. The daughter waved at you from the stairwell.</p>
               <p>She was shy. Had a backpack with a cartoon dog on it.</p>
               <p>You pull the covers up.</p>
               <p class="text-dim">The phone buzzes three more times before falling silent.</p>`,
        effects: { fascism: 10, legitimacy: -5 },
        choices: [
            {
                text: 'Try to sleep',
                next: 'scene2_sleep'
            },
            {
                text: 'Pick the phone back up',
                setFlag: 'engaged',
                next: 'scene2_respond'
            }
        ]
    },

    scene2_news: {
        day: 1,
        location: 'Your Apartment',
        art: `
    ╔════════════════════════════════════════╗
    ║  BREAKING NEWS           ▓▓▓ LIVE      ║
    ╠════════════════════════════════════════╣
    ║                                        ║
    ║  "ICE conducts routine enforcement     ║
    ║   operations across metro area"        ║
    ║                                        ║
    ║  - 47 individuals detained             ║
    ║  - Operations "proceeding smoothly"    ║
    ║  - Minor traffic disruptions expected  ║
    ║                                        ║
    ╚════════════════════════════════════════╝`,
        text: `<p>The news ticker scrolls past in the familiar amber of your phone screen.</p>
               <p>"Routine enforcement operations."</p>
               <p>The anchor's voice is calm. Professional. They cut to traffic.</p>
               <p>47 individuals. Just a number. They don't mention Sofia's backpack with the cartoon dog. They don't mention that "detained" means separated. Caged.</p>
               <p>Maria's messages keep piling up on the notification bar.</p>`,
        effects: { press: 5 },
        choices: [
            {
                text: 'Respond to Maria now',
                setFlag: 'engaged',
                next: 'scene2_respond'
            },
            {
                text: 'Keep watching the news',
                effects: { fascism: 5 },
                next: 'scene2_watch_news'
            }
        ]
    },

    scene2_hesitate: {
        day: 1,
        location: 'Your Apartment',
        text: `<p class="dialogue"><span class="speaker">Maria:</span> Honestly? Probably nothing.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> But if enough of us show up, they'll know they're being watched.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> The lawyers need witnesses. The press needs footage.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> And the families inside need to know someone gives a damn.</p>
               <p>You think about Sofia. Six years old. Probably doesn't understand what's happening. Probably asking where her mom is.</p>`,
        choices: [
            {
                text: '"Okay. I\'m coming."',
                effects: { democracy: 10, legitimacy: 5 },
                setFlag: 'went_to_center',
                next: 'scene3_center'
            },
            {
                text: '"I can\'t risk it. I\'m sorry."',
                effects: { fascism: 5 },
                next: 'scene2_refuse'
            }
        ]
    },

    scene2_delay: {
        day: 1,
        location: 'Your Apartment',
        text: `<p class="dialogue"><span class="speaker">Maria:</span> Think fast. They're moving them at dawn.</p>
               <p>You stare at the ceiling. The helicopter spotlight has moved on to someone else's window.</p>
               <p>Minutes pass. Then an hour.</p>
               <p>When you finally check your phone again, the sun is coming up.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> They're gone. Buses left at 5:30.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> We got some footage. Not enough.</p>
               <p class="text-dim">You missed it. But there will be more opportunities. There are always more.</p>`,
        effects: { fascism: 5, democracy: -5 },
        next: 'scene3_morning'
    },

    scene2_sleep: {
        day: 2,
        location: 'Your Apartment',
        text: `<p>You sleep. Poorly, but you sleep.</p>
               <p>In the morning, the news has moved on. There's a celebrity scandal. A sports score.</p>
               <p>47 individuals are somewhere in the system now. But that's not the headline.</p>
               <p>Maria hasn't texted since last night.</p>
               <p class="text-dim">You go to work. You come home. The apartment feels different somehow.</p>`,
        effects: { fascism: 10, democracy: -10 },
        choices: [
            {
                text: 'Text Maria to apologize',
                setFlag: 'engaged',
                next: 'scene3_apologize'
            },
            {
                text: 'Move on with your life',
                next: 'scene_complicit_path'
            }
        ]
    },

    scene2_refuse: {
        day: 1,
        location: 'Your Apartment',
        text: `<p class="dialogue"><span class="speaker">Maria:</span> I understand.</p>
               <p>But you can hear the disappointment even through text.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> Take care of yourself.</p>
               <p>The typing indicator appears one more time, then nothing.</p>
               <p>You lie back down. The helicopters have moved on. The night is quiet now.</p>
               <p>Somewhere across town, Sofia is crying for her mother.</p>
               <p class="text-dim">But not here. Here it's quiet.</p>`,
        effects: { fascism: 8, democracy: -5 },
        next: 'scene3_morning'
    },

    scene2_watch_news: {
        day: 1,
        location: 'Your Apartment',
        text: `<p>You watch for another hour. The coverage is sparse. Antiseptic.</p>
               <p>"The operations were conducted professionally and without incident."</p>
               <p>No mention of children. No names. No faces.</p>
               <p>Just numbers. Just "individuals."</p>
               <p>When you finally look at your phone, Maria's last message was 45 minutes ago.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> I guess you're not coming.</p>`,
        effects: { fascism: 5, press: -5 },
        choices: [
            {
                text: 'Text her back, apologize',
                setFlag: 'engaged',
                next: 'scene3_late'
            },
            {
                text: 'She\'ll understand',
                next: 'scene3_morning'
            }
        ]
    },

    // ===== SCENE 3 BRANCHES =====

    scene3_center: {
        day: 1,
        location: 'ICE Processing Center',
        art: `
    ╔════════════════════════════════════════╗
    ║                                        ║
    ║     ┌──────────────────────────┐       ║
    ║     │   ICE PROCESSING CENTER  │       ║
    ║     │      ████████████████    │       ║
    ║     │      █   ░░░░░░░░   █    │       ║
    ║     │      █              █    │       ║
    ║     └──────────────────────────┘       ║
    ║                                        ║
    ║     ☻☻☻☻☻☻☻☻  ← crowd forming          ║
    ║     ════════════════════════           ║
    ║           parking lot                  ║
    ╚════════════════════════════════════════╝`,
        text: `<p>The processing center is a gray building in an industrial district. The kind of place you'd never notice unless you were looking.</p>
               <p>About thirty people are already gathered outside. Some hold signs. Some hold phones. A few hold candles that flicker against the pre-dawn dark.</p>
               <p>Maria finds you in the crowd.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> You came.</p>
               <p>She looks exhausted. Her eyes are red. But she's smiling.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> The buses are still inside. We can hear them. They haven't left yet.</p>`,
        effects: { democracy: 5, legitimacy: 10 },
        addAlly: 'Maria',
        choices: [
            {
                text: 'Start recording with your phone',
                effects: { press: 10 },
                setFlag: 'documented_center',
                next: 'scene3_record'
            },
            {
                text: 'Talk to the lawyers here',
                effects: { legitimacy: 5 },
                next: 'scene3_lawyers'
            },
            {
                text: 'Join the candlelight vigil',
                effects: { democracy: 5 },
                next: 'scene3_vigil'
            }
        ]
    },

    scene3_record: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>You hold up your phone. The screen shows what your eyes already see - but now there's a record.</p>
               <p>A woman near you notices.</p>
               <p class="dialogue"><span class="speaker">Legal Observer:</span> Good. Keep filming. Make sure you get badge numbers if they come out.</p>
               <p>She hands you a card. "National Lawyers Guild - Legal Observer."</p>
               <p class="dialogue"><span class="speaker">Legal Observer:</span> If they arrest anyone, this footage could be the difference between charges sticking or not.</p>
               <p>Your hands are shaking slightly. But you keep filming.</p>`,
        effects: { press: 10, legitimacy: 5 },
        setFlag: 'has_footage',
        choices: [
            {
                text: 'Focus on the building entrance',
                next: 'scene4_entrance'
            },
            {
                text: 'Document the crowd, the signs, the mood',
                next: 'scene4_crowd'
            }
        ]
    },

    scene3_lawyers: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>A cluster of people in suits stand near a folding table covered in papers. One of them looks up as you approach.</p>
               <p class="dialogue"><span class="speaker">Immigration Attorney:</span> Are you here to help or do you have a family member inside?</p>
               <p>You explain Maria told you to come.</p>
               <p class="dialogue"><span class="speaker">Immigration Attorney:</span> Good. We need witness statements. If anything happens, documentation matters.</p>
               <p>She hands you a clipboard.</p>
               <p class="dialogue"><span class="speaker">Immigration Attorney:</span> The system runs on bureaucracy. Sometimes that's our weapon too.</p>`,
        effects: { legitimacy: 10 },
        addAlly: 'Elena (Attorney)',
        choices: [
            {
                text: 'Take the clipboard and start documenting',
                effects: { legitimacy: 5 },
                next: 'scene4_document'
            },
            {
                text: 'Ask what happened to the Garcias specifically',
                next: 'scene4_garcias'
            }
        ]
    },

    scene3_vigil: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>The candles cast flickering shadows on the faces around you. Someone is singing softly in Spanish. A hymn you don't recognize but somehow understand.</p>
               <p>A man hands you a candle without a word.</p>
               <p class="dialogue"><span class="speaker">Older Man:</span> My grandson is in there. Eight years old. Born here. Citizen. Doesn't matter to them.</p>
               <p>He stares at the building like he could will the walls to crumble.</p>
               <p class="dialogue"><span class="speaker">Older Man:</span> At least he'll know someone was outside. Someone cared enough to stand.</p>`,
        effects: { democracy: 10 },
        choices: [
            {
                text: 'Stand with him in silence',
                effects: { legitimacy: 5 },
                next: 'scene4_silence'
            },
            {
                text: 'Ask his grandson\'s name',
                effects: { democracy: 5 },
                next: 'scene4_name'
            }
        ]
    },

    scene3_morning: {
        day: 2,
        location: 'Your Apartment',
        text: `<p>Morning comes. The world continues.</p>
               <p>The news cycle has moved on. "47 individuals" are now a statistic in someone's spreadsheet.</p>
               <p>You go through your day. Work. Lunch. Work. Home.</p>
               <p>But something has shifted. You notice things now that you didn't before. The unmarked vans. The nervous looks on some faces. The way certain people seem to disappear from your neighborhood.</p>
               <p>Maria texts you that evening.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> There's a community meeting tomorrow night. St. Augustine's. You should come.</p>`,
        choices: [
            {
                text: 'Tell her you\'ll be there',
                setFlag: 'engaged',
                next: 'scene5_meeting'
            },
            {
                text: 'Make an excuse',
                effects: { fascism: 5 },
                next: 'scene_complicit_path'
            }
        ]
    },

    scene3_late: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>You get there just as the sun is rising. The buses are already leaving.</p>
               <p>A few people stand in the parking lot, watching them go. Maria is among them.</p>
               <p>She doesn't say anything when she sees you. Just nods.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> We got some footage. Some names. It's something.</p>
               <p>The buses turn a corner and disappear.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> There's a community meeting tomorrow. St. Augustine's. If you're interested.</p>`,
        effects: { legitimacy: 5 },
        choices: [
            {
                text: '"I\'ll be there. I\'m sorry I was late."',
                setFlag: 'engaged',
                next: 'scene5_meeting'
            },
            {
                text: '"I\'ll try."',
                effects: { fascism: 3 },
                next: 'scene4_maybe'
            }
        ]
    },

    scene3_apologize: {
        day: 2,
        location: 'Your Apartment',
        text: `<p class="dialogue"><span class="speaker">You:</span> Maria, I'm sorry about last night. I froze. I didn't know what to do.</p>
               <p>The response takes a while.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> I get it. This stuff is scary.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> The Garcias are in detention now. Don't know for how long.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> But there's a community meeting tomorrow at St. Augustine's. Maybe you could come to that instead?</p>
               <p class="dialogue"><span class="speaker">Maria:</span> Baby steps are still steps.</p>`,
        choices: [
            {
                text: '"I\'ll be there."',
                setFlag: 'engaged',
                next: 'scene5_meeting'
            },
            {
                text: '"Let me think about it."',
                next: 'scene4_maybe'
            }
        ]
    },

    // ===== SCENE 4 BRANCHES =====

    scene4_entrance: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>You point your camera at the entrance. The doors are heavy steel. No windows.</p>
               <p>A guard notices you filming. He talks into his radio. Doesn't approach, but doesn't look away either.</p>
               <p>Minutes pass. Then the doors open.</p>
               <p>Officers emerge, escorting people in handcuffs. Men. Women. A teenager.</p>
               <p>Your phone captures it all. Badge numbers. Faces. The way they push a man who stumbles.</p>
               <p class="dialogue"><span class="speaker">Maria (whisper):</span> Keep filming. Don't stop.</p>`,
        effects: { press: 15, fascism: 5 },
        setFlag: 'documented_brutality',
        choices: [
            {
                text: 'Zoom in on the badge numbers',
                effects: { press: 5 },
                next: 'scene5_badges'
            },
            {
                text: 'Try to talk to the detainees',
                effects: { legitimacy: 5 },
                next: 'scene5_talk'
            }
        ]
    },

    scene4_crowd: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>You pan across the crowd. A tapestry of faces.</p>
               <p>An elderly woman holding a rosary. A young man with a megaphone he hasn't used yet. A mother with a toddler on her hip.</p>
               <p>You capture the signs. "NO HUMAN IS ILLEGAL." "FAMILIES BELONG TOGETHER." "ABOLISH ICE."</p>
               <p>You capture the candles. The tears. The determination.</p>
               <p>This is what resistance looks like at 5 AM. Tired. Scared. Present.</p>`,
        effects: { democracy: 10, press: 5 },
        choices: [
            {
                text: 'Interview some of the protesters',
                effects: { press: 10 },
                next: 'scene5_interviews'
            },
            {
                text: 'Turn your camera back to the building',
                next: 'scene4_entrance'
            }
        ]
    },

    scene4_document: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>The clipboard feels heavier than it should. Each line is a person.</p>
               <p>Name. Date of Birth. Country of Origin. Last Known Status.</p>
               <p>You move through the crowd, collecting information. Some people are eager to talk. Others are too scared - they came to witness, not to be witnessed.</p>
               <p>You fill three pages before sunrise.</p>`,
        effects: { legitimacy: 15 },
        setFlag: 'has_witness_statements',
        choices: [
            {
                text: 'Return the clipboard to the lawyers',
                next: 'scene5_return_docs'
            },
            {
                text: 'Keep documenting as the buses leave',
                next: 'scene5_buses_leave'
            }
        ]
    },

    scene4_garcias: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>The attorney checks a list on her phone.</p>
               <p class="dialogue"><span class="speaker">Immigration Attorney:</span> Garcia family... yes. Carlos and Elena Garcia. Two children, Sofia and Miguel.</p>
               <p>She scrolls further. Her expression tightens.</p>
               <p class="dialogue"><span class="speaker">Immigration Attorney:</span> They were separated during processing. The parents are here. The children...</p>
               <p>She pauses.</p>
               <p class="dialogue"><span class="speaker">Immigration Attorney:</span> The children are in HHS custody. Different facility. We're trying to locate them.</p>
               <p>Different facility. Different city. Maybe different state. Sofia with her cartoon dog backpack, somewhere in the system.</p>`,
        effects: { democracy: -5 },
        choices: [
            {
                text: '"How can I help find them?"',
                effects: { legitimacy: 10 },
                setFlag: 'tracking_sofia',
                next: 'scene5_help_find'
            },
            {
                text: 'This is too much. Step away.',
                effects: { fascism: 5 },
                next: 'scene5_overwhelmed'
            }
        ]
    },

    scene4_silence: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>You stand with him as the sky lightens. Words feel insufficient.</p>
               <p>The candle burns down. You light another from its dying flame.</p>
               <p>Around you, the vigil continues. Some people leave for work. Others arrive to take their place.</p>
               <p>When the buses finally roll out, the old man raises his hand. Not a wave. A salute. A promise.</p>
               <p class="dialogue"><span class="speaker">Older Man:</span> He'll know someone was here. That's what matters.</p>`,
        effects: { democracy: 10, legitimacy: 5 },
        next: 'scene5_aftermath'
    },

    scene4_name: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p class="dialogue"><span class="speaker">You:</span> What's your grandson's name?</p>
               <p>He looks at you. Really looks.</p>
               <p class="dialogue"><span class="speaker">Older Man:</span> Diego. Diego Reyes. Eight years old. Loves dinosaurs. Wants to be a paleontologist.</p>
               <p>He pulls out his phone, shows you a photo. A gap-toothed smile. A T-Rex t-shirt.</p>
               <p class="dialogue"><span class="speaker">Older Man:</span> He asked me yesterday if the dinosaurs were scared when the asteroid came. I said probably. He said "then someone should have warned them."</p>
               <p>The man's voice breaks.</p>
               <p class="dialogue"><span class="speaker">Older Man:</span> I couldn't warn him.</p>`,
        effects: { democracy: 10 },
        addMemorial: 'Diego Reyes, 8',
        next: 'scene5_aftermath'
    },

    scene4_maybe: {
        day: 2,
        location: 'Your Apartment',
        text: `<p>You tell yourself you'll decide tomorrow.</p>
               <p>Tomorrow comes. You're tired. There's work. There's life.</p>
               <p>The meeting comes and goes. Maria doesn't text again.</p>
               <p>Days pass. Weeks. The raids continue. They become background noise.</p>
               <p>You almost forget about the Garcias. Almost.</p>
               <p>Sometimes at night you think about Sofia's backpack.</p>`,
        effects: { fascism: 10, democracy: -10 },
        next: 'scene_complicit_path'
    },

    // ===== SCENE 5: COMMUNITY MEETING / AFTERMATH =====

    scene5_meeting: {
        day: 3,
        location: 'St. Augustine\'s Church',
        art: `
    ╔════════════════════════════════════════╗
    ║                 †                      ║
    ║            ┌───┴───┐                   ║
    ║            │       │                   ║
    ║        ┌───┤  ST.  ├───┐               ║
    ║        │   │ AUG'S │   │               ║
    ║        │   └───────┘   │               ║
    ║        │ ░░░░░░░░░░░░░ │               ║
    ║        └───────────────┘               ║
    ║                                        ║
    ║     ☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻                 ║
    ║         community gathers              ║
    ╚════════════════════════════════════════╝`,
        text: `<p>The church basement is packed. Folding chairs arranged in rows, most of them full. The air is thick with body heat and tension.</p>
               <p>Maria waves you over to a seat she's saved.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> Glad you made it.</p>
               <p>At the front, a woman is speaking. Pastor Williams, according to the banner.</p>
               <p class="dialogue"><span class="speaker">Pastor Williams:</span> We cannot wait for others to act. The time for waiting is over. Our neighbors are being taken. Our families are being torn apart.</p>
               <p>She pauses, scanning the crowd.</p>
               <p class="dialogue"><span class="speaker">Pastor Williams:</span> There is a march planned for Saturday. To City Hall. To make our voices heard. Who will stand with us?</p>`,
        effects: { democracy: 10, legitimacy: 10 },
        alert: 'This is the beginning. The movement is forming.',
        choices: [
            {
                text: 'Raise your hand',
                effects: { democracy: 10 },
                setFlag: 'joined_march',
                next: 'scene6_committed'
            },
            {
                text: 'Stay quiet, but keep listening',
                effects: { legitimacy: -5 },
                next: 'scene5_listen'
            },
            {
                text: 'Volunteer to help organize',
                effects: { democracy: 15, legitimacy: 10 },
                setFlag: 'is_organizer',
                next: 'scene6_organize'
            }
        ]
    },

    scene5_listen: {
        day: 3,
        location: 'St. Augustine\'s Church',
        text: `<p>You don't raise your hand. Not yet. But you listen.</p>
               <p>Others speak. A father whose wife was taken. A teacher whose student disappeared. A shop owner whose employees live in fear.</p>
               <p>Story after story. Each one a life. Each one a choice you didn't have to make.</p>
               <p>By the end of the meeting, you understand something you didn't before.</p>
               <p>This isn't about politics. It's about people.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> So? Saturday?</p>`,
        effects: { democracy: 5 },
        choices: [
            {
                text: '"I\'ll be there."',
                setFlag: 'joined_march',
                next: 'scene6_committed'
            },
            {
                text: '"I need to think about it."',
                effects: { fascism: 5 },
                next: 'scene5_delay_again'
            }
        ]
    },

    scene5_aftermath: {
        day: 2,
        location: 'ICE Processing Center',
        text: `<p>The sun is fully up now. The crowd thins as people head to jobs they can't afford to lose.</p>
               <p>Maria finds you.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> There's a community meeting tomorrow night. St. Augustine's.</p>
               <p>She looks at the now-empty parking lot.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> This isn't the end. It's just the beginning. They're going to keep doing this until we stop them.</p>`,
        choices: [
            {
                text: '"I\'ll be at the meeting."',
                setFlag: 'engaged',
                next: 'scene5_meeting'
            },
            {
                text: '"What can we actually do?"',
                next: 'scene5_what_now'
            }
        ]
    },

    scene5_what_now: {
        day: 2,
        location: 'ICE Processing Center',
        text: `<p class="dialogue"><span class="speaker">Maria:</span> Fight. Organize. Show up. Document everything.</p>
               <p>She counts on her fingers.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> Know your rights workshops. Legal aid. Sanctuary networks. Bail funds. Media pressure.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> And when that's not enough? We march. We make them look us in the eye.</p>
               <p>She hands you a flyer for the meeting.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> Rome wasn't built in a day. Neither was the resistance.</p>`,
        effects: { democracy: 5, legitimacy: 5 },
        choices: [
            {
                text: 'Take the flyer. "I\'ll be there."',
                setFlag: 'engaged',
                next: 'scene5_meeting'
            },
            {
                text: 'Take the flyer but make no promises',
                next: 'scene5_delay_again'
            }
        ]
    },

    scene5_delay_again: {
        day: 3,
        location: 'Your Apartment',
        text: `<p>You go home. You think about it. You don't go to the meeting.</p>
               <p>Maria stops texting.</p>
               <p>The march happens on Saturday. You see it on the news. Thousands of people. Signs. Chants. Hope.</p>
               <p>You weren't there.</p>
               <p>The next week, the raids intensify. "Routine enforcement operations."</p>
               <p>You start to understand: there is no neutral ground. Silence is a choice.</p>`,
        effects: { fascism: 15, democracy: -10 },
        choices: [
            {
                text: 'Reach out to Maria again',
                setFlag: 'engaged',
                next: 'scene6_second_chance'
            },
            {
                text: 'Keep your head down',
                next: 'scene_complicit_path'
            }
        ]
    },

    // ===== SCENE 6: ACT 2 BEGINS - GREEN PHASE =====

    scene6_committed: {
        day: 4,
        location: 'Downtown - March Gathering Point',
        art: `
    ╔════════════════════════════════════════╗
    ║  ░░▓▓░░ THE MARCH BEGINS ░░▓▓░░        ║
    ╠════════════════════════════════════════╣
    ║                                        ║
    ║         ┌────────────────┐             ║
    ║         │    CITY HALL   │             ║
    ║         │   ████████████ │ ← target    ║
    ║         └────────────────┘             ║
    ║                │                       ║
    ║                │  2.4 mi               ║
    ║                │                       ║
    ║    ☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻               ║
    ║    ☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻☻  ← you       ║
    ║    START POINT - THE PLAZA             ║
    ╚════════════════════════════════════════╝`,
        text: `<p>The plaza is a sea of people. More than you expected. More than the news will report.</p>
               <p>Signs bob above the crowd like a forest of resistance. The chants start somewhere in the back and roll forward like a wave.</p>
               <p class="dialogue">"NO BAN! NO WALL! SANCTUARY FOR ALL!"</p>
               <p>Maria appears beside you, grinning despite everything.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> This is it. This is what hope looks like.</p>
               <p>You see the groups the meeting mentioned - the Dads in neon vests, the Street Medics with red crosses, the Legal Observers in green hats.</p>`,
        effects: { democracy: 15, legitimacy: 10, press: 5 },
        alert: 'Color unlocked: You can see allies now.',
        choices: [
            {
                text: 'Join the front line',
                effects: { fascism: 5, democracy: 10 },
                next: 'scene7_frontline'
            },
            {
                text: 'Stay with the medic team',
                effects: { legitimacy: 10 },
                next: 'scene7_medics'
            },
            {
                text: 'Help the legal observers document',
                effects: { press: 10, legitimacy: 5 },
                next: 'scene7_document'
            }
        ]
    },

    scene6_organize: {
        day: 4,
        location: 'Downtown - March Staging Area',
        text: `<p>You've been here since dawn, helping set up. Water stations. First aid posts. Legal observer briefings.</p>
               <p>Pastor Williams approaches you.</p>
               <p class="dialogue"><span class="speaker">Pastor Williams:</span> You're {CHARACTER}, right? Maria said you've been solid.</p>
               <p>She hands you a walkie-talkie.</p>
               <p class="dialogue"><span class="speaker">Pastor Williams:</span> I need eyes in the crowd. Someone who can move between groups. Can you do that?</p>
               <p>The responsibility weighs on you. But you nod.</p>`,
        effects: { democracy: 15, legitimacy: 15 },
        addAlly: 'Pastor Williams',
        setFlag: 'has_radio',
        next: 'scene7_coordinator'
    },

    scene6_second_chance: {
        day: 7,
        location: 'Coffee Shop',
        text: `<p>Maria agrees to meet you. Her coffee sits untouched.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> Look, I get it. This is scary. But people are counting on us.</p>
               <p>She slides a flyer across the table. Another march. This Saturday.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> There's going to be more of them. Bigger. The movement is growing.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> You can join us now, or you can keep watching from the sidelines.</p>
               <p>She stands up.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> Your choice.</p>`,
        effects: { democracy: 5 },
        choices: [
            {
                text: '"I\'m in. For real this time."',
                setFlag: 'joined_march',
                next: 'scene6_committed'
            },
            {
                text: '"I\'m not cut out for this."',
                next: 'scene_complicit_path'
            }
        ]
    },

    // ===== COMPLICIT PATH (BAD ENDING ROUTE) =====

    scene_complicit_path: {
        day: 30,
        location: 'Your Apartment',
        text: `<p>Weeks pass. Months.</p>
               <p>You watch the news. You shake your head at the injustice. You do nothing.</p>
               <p>The raids continue. The marches happen without you. The movement grows, but you're not part of it.</p>
               <p>One night, you hear a knock at your door. 3 AM.</p>
               <p>Heavy boots. Official voices.</p>
               <p>They've come for you. For something. For anything. It doesn't matter.</p>
               <p class="text-dim">There's no one left to stand outside your door with candles.</p>`,
        effects: { fascism: 30 },
        next: 'ending_complicit'
    },

    ending_complicit: {
        day: 30,
        location: 'Unknown',
        text: `<p>You stayed safe. You kept your head down.</p>
               <p>You chose comfort over conscience.</p>
               <p>And now the knock comes for you.</p>
               <p class="dialogue">"First they came for the socialists..."</p>`,
        choices: [
            {
                text: '[THE END]',
                next: 'show_ending_complicit'
            }
        ]
    },

    show_ending_complicit: {
        onLoad: function() {
            Game.showEnding('complicit');
        }
    },

    // Placeholder for Act 2+ scenes
    scene7_frontline: {
        day: 4,
        location: 'Downtown - March in Progress',
        text: `<p>The front line is where the energy is. And the danger.</p>
               <p>You link arms with strangers who become allies. The chants are louder here.</p>
               <p>Ahead, you can see the police line forming.</p>
               <p class="text-dim">To be continued in Phase 2 content...</p>`,
        alert: 'Act 2 content coming in Phase 2 development.',
        choices: [
            {
                text: 'Continue march (placeholder)',
                next: 'scene6_committed'
            }
        ]
    },

    scene7_medics: {
        day: 4,
        location: 'Downtown - March in Progress',
        text: `<p>The medics are calm professionals. They've done this before.</p>
               <p class="dialogue"><span class="speaker">Street Medic:</span> Stay close. When things go bad, they go bad fast. We need to move quick.</p>
               <p>They hand you a water bottle and some bandages.</p>
               <p class="dialogue"><span class="speaker">Street Medic:</span> Hope for the best. Prepare for the worst.</p>
               <p class="text-dim">To be continued in Phase 2 content...</p>`,
        alert: 'Act 2 content coming in Phase 2 development.',
        choices: [
            {
                text: 'Continue march (placeholder)',
                next: 'scene6_committed'
            }
        ]
    },

    scene7_document: {
        day: 4,
        location: 'Downtown - March in Progress',
        text: `<p>Your phone is your weapon now. Every badge number. Every face. Every act of aggression.</p>
               <p>The legal observers brief you quickly.</p>
               <p class="dialogue"><span class="speaker">Legal Observer:</span> Stay back. Stay safe. Stay filming. If you get arrested, this footage needs to survive.</p>
               <p>They show you how to stream directly to a server, so the footage can't be deleted.</p>
               <p class="text-dim">To be continued in Phase 2 content...</p>`,
        alert: 'Act 2 content coming in Phase 2 development.',
        choices: [
            {
                text: 'Continue march (placeholder)',
                next: 'scene6_committed'
            }
        ]
    },

    scene7_coordinator: {
        day: 4,
        location: 'Downtown - March in Progress',
        text: `<p>The walkie crackles to life.</p>
               <p class="dialogue"><span class="speaker">Radio:</span> All units, march is stepping off. Keep channels clear for emergencies.</p>
               <p>You move through the crowd, checking in with each group. The Dads. The Medics. The Legal team.</p>
               <p>You're part of something bigger now. Something organized. Something that might actually work.</p>
               <p class="text-dim">To be continued in Phase 2 content...</p>`,
        alert: 'Act 2 content coming in Phase 2 development.',
        choices: [
            {
                text: 'Continue coordinating (placeholder)',
                next: 'scene6_committed'
            }
        ]
    },

    // Additional placeholder scenes for documentation
    scene5_badges: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>You zoom in. Badge #4471. Badge #2289. Badge #5103.</p>
               <p>Each number is evidence. Each face is accountable.</p>
               <p>The footage is shaky but clear. Usable.</p>`,
        effects: { press: 10 },
        next: 'scene5_aftermath'
    },

    scene5_talk: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>You try to get close enough to say something. Anything.</p>
               <p>An officer blocks you.</p>
               <p class="dialogue"><span class="speaker">Officer:</span> Step back. This is a federal operation.</p>
               <p>But you see one of the detainees look at you. A woman, mid-thirties. She mouths something.</p>
               <p>"Tell my children."</p>
               <p>Then she's gone, loaded onto a bus.</p>`,
        effects: { democracy: 10, legitimacy: 5 },
        next: 'scene5_aftermath'
    },

    scene5_interviews: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>You talk to people. Record their stories.</p>
               <p>A grandmother who hasn't seen her daughter in six months. A father who came here legally and now fears every knock.</p>
               <p>Each story is a piece of the larger picture. A system designed to terrorize.</p>`,
        effects: { press: 15, democracy: 5 },
        next: 'scene5_aftermath'
    },

    scene5_return_docs: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>You return the clipboard to Elena the attorney.</p>
               <p class="dialogue"><span class="speaker">Elena:</span> This is good. Really good. Every name here is someone we might be able to help.</p>
               <p>She looks exhausted but grateful.</p>
               <p class="dialogue"><span class="speaker">Elena:</span> Come to the meeting tomorrow. We need people like you.</p>`,
        effects: { legitimacy: 10 },
        addAlly: 'Elena (Attorney)',
        next: 'scene5_aftermath'
    },

    scene5_buses_leave: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>You keep writing as the buses pull out. License plates. Bus numbers. Time stamps.</p>
               <p>It all goes into the record. Every detail might matter later.</p>
               <p>The sun is up by the time you hand back the clipboard. Your hand aches from writing.</p>`,
        effects: { legitimacy: 15, press: 5 },
        next: 'scene5_aftermath'
    },

    scene5_help_find: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>Elena hands you a phone number.</p>
               <p class="dialogue"><span class="speaker">Elena:</span> Call this. It's a network of lawyers tracking family separations. They need volunteers to make calls, file FOIA requests, pressure HHS.</p>
               <p class="dialogue"><span class="speaker">Elena:</span> It's not glamorous work. But it's how we find the Sofias.</p>
               <p>You pocket the number.</p>`,
        effects: { legitimacy: 15, democracy: 5 },
        setFlag: 'tracking_sofia',
        next: 'scene5_aftermath'
    },

    scene5_overwhelmed: {
        day: 1,
        location: 'ICE Processing Center',
        text: `<p>You step back. It's too much. The weight of it.</p>
               <p>Maria finds you sitting on the curb, head in hands.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> It's okay. It hits everyone like this the first time.</p>
               <p>She sits beside you.</p>
               <p class="dialogue"><span class="speaker">Maria:</span> The feeling doesn't go away. You just learn to carry it.</p>`,
        effects: { legitimacy: -5 },
        next: 'scene5_aftermath'
    }
};
