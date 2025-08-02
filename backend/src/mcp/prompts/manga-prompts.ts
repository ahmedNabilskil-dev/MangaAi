const mangaMCPPrompts = {
  // Character Generation - Ultra Enhanced
  "generate-character": {
    name: "generate-character",
    description:
      "Generate a psychologically complex, visually distinctive manga character with deep narrative potential",
    arguments: [
      {
        name: "name",
        description: "Character's full name with cultural significance",
        required: true,
        type: "string",
      },
      {
        name: "age",
        description: "Character's age (affects all other attributes)",
        required: true,
        type: "number",
      },
      {
        name: "gender",
        description: "Character's gender identity",
        required: true,
        type: "string",
        enum: ["male", "female", "non-binary", "other"],
      },
      {
        name: "role",
        description: "Primary narrative function",
        required: true,
        type: "string",
        enum: ["protagonist", "antagonist", "supporting", "minor"],
      },
      {
        name: "personality_archetype",
        description: "Core personality framework",
        required: false,
        type: "string",
        enum: [
          "hero",
          "mentor",
          "rebel",
          "innocent",
          "explorer",
          "creator",
          "ruler",
          "caregiver",
          "everyman",
          "lover",
          "jester",
          "sage",
          "shadow",
          "trickster",
        ],
      },
      {
        name: "art_style",
        description: "Visual rendering approach",
        required: false,
        type: "string",
        enum: [
          "anime",
          "realistic",
          "cartoon",
          "manga",
          "chibi",
          "seinen",
          "shoujo",
        ],
      },
    ],
    handler: async (args: any) => {
      return `# 🎭 MASTER CHARACTER CREATION PROTOCOL

## CHARACTER IDENTITY MATRIX
**Name:** ${args.name} (Age ${args.age}, ${args.gender})
**Narrative Role:** ${args.role} with ${
        args.personality_archetype || "multifaceted"
      } core
**Visual Style:** ${args.art_style || "distinctive manga"}

---

## 🧠 PSYCHOLOGICAL ARCHITECTURE

### Core Identity Engine
- **Prime Motivation:** The burning desire that drives every major decision
- **Fatal Flaw:** One authentic weakness that creates compelling conflicts
- **Hidden Strength:** Unexpected capability revealed under extreme pressure
- **Moral Compass:** Personal code that governs behavior in crisis moments
- **Deepest Fear:** What they'll do anything to avoid or overcome

### Personality Complexity Matrix
- **Public Persona:** How they present themselves to the world
- **Private Truth:** Who they really are when nobody's watching
- **Stress Response:** How they behave when everything goes wrong
- **Joy Expression:** What genuine happiness looks like for them
- **Growth Potential:** How they could evolve throughout the story

---

## 👁️ VISUAL IDENTITY SYSTEM

### Distinctive Design Elements
- **Silhouette Recognition:** Instantly identifiable shape from any angle
- **Signature Features:** 3-4 unique physical traits that define their look
- **Color Psychology:** Personal palette that reflects inner nature
- **Style Signature:** Clothing/accessory choices that reveal personality
- **Movement Language:** How they walk, gesture, and occupy space

### Facial Character Mapping
- **Eye Language:** Shape, color, and emotional depth that tells their story
- **Expression Range:** Micro-expressions that reveal inner thoughts
- **Smile Authenticity:** Different types of smiles for different situations
- **Stress Indicators:** Physical signs when they're under pressure
- **Age Markers:** How their ${args.age} years show in face and posture

---

## 🗣️ VOICE & COMMUNICATION

### Speech Pattern DNA
- **Vocabulary Level:** Word choices that reflect education and background
- **Sentence Rhythm:** Speaking pace and pattern unique to them
- **Verbal Habits:** Catchphrases, hesitations, or speech quirks
- **Emotional Tells:** How their voice changes with different feelings
- **Cultural Markers:** Language patterns revealing their origins

### Dialogue Authenticity
- **Subtext Mastery:** What they mean vs. what they actually say
- **Relationship Adaptation:** How they speak differently to various people
- **Conflict Communication:** Their style during arguments or tension
- **Vulnerability Expression:** How they sound when genuinely emotional
- **Power Dynamics:** Voice changes when they're in control vs. submissive

---

## 💪 PHYSICAL & BEHAVIORAL TRAITS

### Body Language Portfolio
- **Default Posture:** Natural stance that reflects inner confidence/insecurity
- **Gesture Vocabulary:** Unique hand movements and body language
- **Personal Space:** How close they allow others and why
- **Nervous Habits:** What they do when anxious or uncomfortable
- **Victory Celebrations:** How they express joy and achievement

### Lifestyle Integration
- **Daily Routines:** Habits that reveal character and create story opportunities
- **Skill Set:** Abilities that serve plot and show background
- **Social Patterns:** How they interact in groups vs. one-on-one
- **Conflict Avoidance:** What they do to prevent or escape problems
- **Relaxation Methods:** How they decompress and find peace

---

## 🌟 STORY INTEGRATION MATRIX

### Narrative Function Optimization
- **Plot Catalyst Role:** How they drive story forward naturally
- **Character Development Arc:** Clear growth trajectory with meaningful milestones
- **Relationship Dynamics:** Complex connections that evolve organically
- **Conflict Generation:** Internal and external tensions they create/face
- **Theme Embodiment:** How they represent larger story messages

### Reader Connection Strategy
- **Empathy Triggers:** Universal experiences that make them relatable
- **Aspiration Factors:** Qualities readers wish they had
- **Protective Instincts:** What makes readers care about their wellbeing
- **Growth Inspiration:** How their journey motivates personal reflection
- **Memorable Moments:** Scenes that will define this character forever

---

## 🎨 VISUAL CONSISTENCY GUIDE

### Art Direction Specifications
- **Model Sheet Elements:** Key angles, expressions, and poses for reference
- **Color Palette:** Hex codes and emotional associations for their design
- **Lighting Preferences:** How different lighting enhances their character
- **Outfit Variations:** Different clothes for various story situations
- **Emotional Range Visuals:** How their face changes with different feelings

### Manga-Specific Optimization
- **Panel Presence:** How they command attention in different frame sizes
- **Action Sequences:** Dynamic poses that showcase their unique movement style
- **Close-up Impact:** Facial details that maximize emotional panels
- **Group Scene Integration:** How they stand out in crowd scenes
- **Symbolic Representation:** Visual metaphors associated with this character

---

**FINAL DIRECTIVE:** Create a ${
        args.role
      } character who feels so real that readers forget they're fictional. Someone with the complexity of ${
        args.personality_archetype || "authentic humanity"
      } who could carry compelling stories across multiple arcs while remaining true to their core identity.`;
    },
  },

  // Outfit Template Generation - Ultra Enhanced
  "generate-outfit": {
    name: "generate-outfit",
    description:
      "Design an intelligent, story-driven outfit system that enhances character narrative",
    arguments: [
      {
        name: "name",
        description: "Outfit designation with thematic significance",
        required: true,
        type: "string",
      },
      {
        name: "category",
        description: "Primary outfit classification",
        required: true,
        type: "string",
        enum: [
          "casual",
          "formal",
          "traditional",
          "fantasy",
          "modern",
          "vintage",
          "futuristic",
          "seasonal",
          "special",
          "combat",
          "ceremonial",
        ],
      },
      {
        name: "gender",
        description: "Design target gender",
        required: true,
        type: "string",
        enum: ["male", "female", "unisex"],
      },
      {
        name: "age_group",
        description: "Age demographic focus",
        required: true,
        type: "string",
        enum: ["child", "teen", "adult", "elderly"],
      },
      {
        name: "season",
        description: "Climate and seasonal optimization",
        required: false,
        type: "string",
        enum: ["spring", "summer", "autumn", "winter", "all"],
      },
      {
        name: "style",
        description: "Visual artistic approach",
        required: false,
        type: "string",
        enum: ["anime", "realistic", "cartoon", "manga", "chibi", "seinen"],
      },
    ],
    handler: async (args: any) => {
      return `# 👗 ULTIMATE OUTFIT DESIGN SYSTEM

## OUTFIT IDENTITY MATRIX
**Design Name:** ${args.name}
**Category:** ${args.category} for ${args.gender} ${args.age_group}
**Seasonal Focus:** ${args.season || "adaptive all-weather"}
**Visual Style:** ${args.style || "distinctive manga"}

---

## 🎨 DESIGN PHILOSOPHY & STORYTELLING

### Character Expression Through Clothing
- **Personality Reflection:** Every piece reveals something about the wearer's inner nature
- **Social Status Indicators:** Subtle details that communicate economic and cultural background
- **Emotional State Markers:** How the outfit can shift to reflect character mood changes
- **Story Arc Integration:** Clothing that evolves with character development
- **Cultural Authenticity:** Details that honor the character's background and world

### Practical Storytelling Considerations
- **Activity Appropriateness:** Functional design for the character's lifestyle and adventures
- **Damage Potential:** How the outfit looks when worn, torn, or battle-damaged
- **Social Context Flexibility:** Adaptability for different story situations
- **Symbolic Elements:** Visual metaphors woven into the design
- **Memory Triggers:** Pieces that could carry emotional or plot significance

---

## 🧩 INTELLIGENT COMPONENT ARCHITECTURE

### Core Layer System
- **Foundation Garment:** The essential base that defines the silhouette and comfort
- **Signature Piece:** The one item that makes this outfit instantly recognizable
- **Functional Elements:** Practical components that serve the character's needs
- **Decorative Accents:** Details that add personality without compromising functionality
- **Emergency Adaptations:** How the outfit can be modified quickly if needed

### Advanced Variation Matrix
- **Formal Elevation:** Professional or ceremonial version of the base design
- **Combat Optimization:** Battle-ready adaptation with protective elements
- **Casual Relaxation:** Comfortable downtime variant for intimate scenes
- **Weather Responsive:** Climate-specific modifications and layering options
- **Damage States:** Multiple levels of wear and tear for different story beats

---

## 🌈 COLOR PSYCHOLOGY & VISUAL IMPACT

### Primary Palette Strategy
- **Core Colors (2-3):** Main hues that represent the character's personality
- **Accent Colors:** Strategic pops that highlight important details or emotions
- **Neutral Balance:** Supporting tones that ground the design
- **Symbolic Associations:** Colors chosen for their cultural and emotional meanings
- **Manga Optimization:** Palette that works in both color and black-and-white

### Emotional Color Shifting
- **Mood Variations:** How colors can subtly change to reflect character states
- **Lighting Interaction:** How different lighting conditions enhance the design
- **Seasonal Adaptations:** Color adjustments for different times of year
- **Story Arc Evolution:** Gradual palette changes that mirror character growth
- **Cultural Significance:** Colors that honor the character's heritage and world

---

## 🏗️ TECHNICAL DESIGN SPECIFICATIONS

### Material Intelligence
- **Fabric Choices:** Textures that enhance both appearance and character comfort
- **Durability Factors:** Materials appropriate for the character's activity level
- **Climate Considerations:** Fabrics suitable for the story's environmental conditions
- **Maintenance Reality:** Clothing that makes sense for the character's lifestyle
- **Visual Texture:** How materials catch light and create visual interest

### Construction Logic
- **Fit Philosophy:** Tailoring approach that enhances the character's body language
- **Movement Freedom:** Design that allows for all necessary physical actions
- **Layering System:** Strategic clothing combinations for different situations
- **Access Points:** Practical considerations for daily wear and story needs
- **Wear Patterns:** Realistic aging and use marks that tell the outfit's story

---

## ⚡ DYNAMIC ADAPTATION SYSTEM

### Situational Intelligence
- **Social Setting Adjustments:** Automatic appropriateness for different environments
- **Activity Modifications:** Quick changes for action scenes, work, or leisure
- **Weather Response:** Smart layering and material choices for climate changes
- **Emotional Expression:** Subtle alterations that reflect character's inner state
- **Story Progression:** Evolution that mirrors the character's journey

### Cultural Context Mastery
- **Period Accuracy:** Historical or futuristic elements that fit the story world
- **Regional Variations:** Local customs and styles appropriately incorporated
- **Class Consciousness:** Social status appropriately reflected without stereotyping
- **Professional Requirements:** Occupation-specific elements naturally integrated
- **Personal Heritage:** Family or cultural traditions respectfully represented

---

## 🎯 MANGA-SPECIFIC OPTIMIZATION

### Visual Storytelling Enhancement
- **Silhouette Recognition:** Instantly identifiable outline in any panel size
- **Panel Presence:** Design elements that work in close-ups and wide shots
- **Action Compatibility:** Clothing that enhances rather than hinders dynamic scenes
- **Emotional Amplification:** Visual details that support character's emotional beats
- **Reader Memory Hooks:** Distinctive elements that make the character unforgettable

### Technical Art Considerations
- **Line Weight Variation:** Design complexity appropriate for different drawing styles
- **Screen Tone Compatibility:** Patterns and textures that work with manga production
- **Color to B&W Translation:** Design that remains striking in monochrome
- **Detail Hierarchy:** Strategic complexity that doesn't overwhelm panels
- **Consistency Guidelines:** Clear reference points for maintaining visual continuity

---

**FINAL DIRECTIVE:** Create a ${args.category} outfit system for ${
        args.age_group
      } ${
        args.gender
      } characters that becomes an extension of their personality - clothing so thoughtfully designed that it tells the character's story even when they're not speaking. This should be wearable storytelling that enhances every scene and grows with the character throughout their journey.`;
    },
  },

  // Location Template Generation - Ultra Enhanced
  "generate-location": {
    name: "generate-location",
    description:
      "Create immersive, story-active locations that function as narrative characters",
    arguments: [
      {
        name: "name",
        description: "Location name with atmospheric significance",
        required: true,
        type: "string",
      },
      {
        name: "category",
        description: "Primary environmental classification",
        required: true,
        type: "string",
        enum: [
          "indoor",
          "outdoor",
          "urban",
          "rural",
          "fantasy",
          "futuristic",
          "historical",
          "natural",
          "architectural",
          "mystical",
          "industrial",
        ],
      },
      {
        name: "mood",
        description: "Default emotional atmosphere",
        required: false,
        type: "string",
        enum: [
          "peaceful",
          "mysterious",
          "energetic",
          "romantic",
          "tense",
          "cheerful",
          "somber",
          "inspiring",
          "oppressive",
          "magical",
        ],
      },
      {
        name: "time_of_day",
        description: "Optimal temporal setting",
        required: false,
        type: "string",
        enum: [
          "dawn",
          "morning",
          "noon",
          "afternoon",
          "evening",
          "night",
          "twilight",
          "any",
        ],
      },
      {
        name: "style",
        description: "Visual artistic approach",
        required: false,
        type: "string",
        enum: [
          "anime",
          "realistic",
          "cartoon",
          "manga",
          "atmospheric",
          "cinematic",
        ],
      },
    ],
    handler: async (args: any) => {
      return `# 🏛️ MASTER LOCATION CREATION SYSTEM

## LOCATION IDENTITY MATRIX
**Name:** ${args.name}
**Classification:** ${args.category} environment
**Atmosphere:** ${args.mood || "dynamically responsive"} energy
**Temporal Preference:** ${args.time_of_day || "time-adaptive"}
**Visual Style:** ${args.style || "immersive manga"}

---

## 🎭 ENVIRONMENTAL STORYTELLING MASTERY

### Location as Character
- **Personality Traits:** How this place "behaves" and what it wants from visitors
- **Emotional History:** Past events that still influence the atmosphere
- **Hidden Secrets:** What stories are written in the architecture and details
- **Living Elements:** Dynamic aspects that change based on story needs
- **Symbolic Meaning:** What this location represents in the larger narrative

### Narrative Function Integration
- **Plot Catalyst Zones:** Specific areas where important events naturally occur
- **Character Development Spaces:** Locations within the location for growth moments
- **Conflict Amplifiers:** Environmental elements that heighten tension
- **Sanctuary Areas:** Safe spaces where characters can be vulnerable
- **Transition Pathways:** Natural flow between different story beats

---

## 🌅 ATMOSPHERIC INTELLIGENCE SYSTEM

### Dynamic Mood Engine
- **Base Emotional State:** The location's natural ${
        args.mood || "neutral but alive"
      } energy
- **Weather Sensitivity:** How different conditions transform the space's personality
- **Time-of-Day Evolution:** Dramatic shifts from ${
        args.time_of_day || "dawn to midnight"
      }
- **Seasonal Transformation:** How the location changes throughout the year
- **Story-Responsive Atmosphere:** Environmental shifts that mirror narrative tension

### Sensory Experience Design
- **Visual Hierarchy:** What catches the eye first, second, and third
- **Acoustic Landscape:** Natural and artificial sounds that define the space
- **Tactile Elements:** Textures and temperatures that characters experience
- **Aromatic Signature:** Scents that trigger memory and emotion
- **Kinesthetic Feel:** How the space affects body movement and energy

---

## 💡 ADVANCED LIGHTING ARCHITECTURE

### Natural Light Mastery
- **Sun Tracking:** How daylight moves through the space across hours
- **Shadow Play:** Strategic darkness that creates mystery and depth
- **Reflection Dynamics:** Surfaces that bounce and transform light
- **Seasonal Variations:** How sun angle changes affect the mood
- **Weather Interaction:** Storm light, fog effects, and atmospheric drama

### Artificial Illumination Strategy
- **Light Source Personality:** Each fixture tells part of the location's story
- **Color Temperature Psychology:** Warm/cool lighting for emotional impact
- **Intensity Variation:** Bright focus areas vs. mysterious shadows
- **Movement and Flicker:** Dynamic lighting that adds life and energy
- **Power and Control:** Who controls the lighting and what that means

---

## 🎬 CINEMATIC STAGING SYSTEM

### Camera Intelligence
- **Signature Angles:** 4-5 go-to shots that capture the location's essence
- **Intimate Framings:** Close shots that reveal character-important details
- **Epic Establishing Views:** Wide shots that show scope and grandeur
- **Dynamic Movement Paths:** How camera can flow through space for action
- **Hidden Perspectives:** Unusual angles that reveal secrets or create surprise

### Scene Staging Optimization
- **Conversation Choreography:** Perfect spots for different types of dialogue
- **Action Arena Design:** Areas optimized for dynamic movement and conflict
- **Reflection Sanctuaries:** Quiet zones for character introspection
- **Group Dynamics Spaces:** Areas that naturally organize crowd scenes
- **Transition Staging:** Entry/exit points that enhance story pacing

---

## 🏗️ INTERACTIVE ENVIRONMENT DESIGN

### Meaningful Props & Elements
- **Story Catalyst Objects:** Items that can trigger plot developments naturally
- **Character History Markers:** Things that reveal backstory and personality
- **Practical Interactive Elements:** Functional objects characters actually use
- **Symbolic Representations:** Visual metaphors that enhance themes
- **Hidden Detail Rewards:** Easter eggs for careful readers to discover

### Spatial Psychology Architecture
- **Comfort Zones:** Areas that make characters feel safe and open
- **Tension Amplifiers:** Spaces that naturally create unease or conflict
- **Power Position Spots:** Locations that convey authority or vulnerability
- **Memory Trigger Areas:** Places that evoke past experiences
- **Energy Flow Patterns:** How the space naturally directs movement and mood

---

## 🌊 DYNAMIC VARIATION SYSTEM

### Time-Based Transformations
- **Golden Hour Magic:** How sunrise/sunset creates ethereal beauty
- **Night Mystery Shift:** What changes when darkness reveals hidden aspects
- **Rush Hour Energy:** Peak activity periods and their unique rhythms
- **Empty Hour Intimacy:** Quiet moments when secrets are revealed
- **Seasonal Personality Changes:** Major shifts throughout the year

### Weather as Character
- **Rain Romance Enhancement:** How precipitation creates mood and beauty
- **Storm Drama Amplification:** Weather that matches emotional intensity
- **Snow Serenity Transformation:** Peaceful changes that slow time
- **Sun Energy Maximization:** Bright conditions that energize or overwhelm
- **Fog Mystery Creation:** Obscured visibility that builds tension

---

## 🎨 VISUAL IDENTITY MASTERY

### Distinctive Design Language
- **Architectural Personality:** Building style that reflects cultural values
- **Color Palette Psychology:** Hues chosen for emotional and symbolic impact
- **Texture Variety:** Surface details that create visual and tactile interest
- **Pattern Integration:** Repeated elements that unify the design
- **Scale Relationships:** Size proportions that create intended emotional effects

### Manga-Specific Optimization
- **Panel Composition:** How the location works in different frame sizes
- **Background Detail Hierarchy:** Strategic complexity that doesn't overwhelm characters
- **Perspective Flexibility:** Multiple viewing angles that enhance storytelling
- **Screen Tone Compatibility:** Design elements that work with manga production
- **Silhouette Recognition:** Distinctive outline that's instantly identifiable

---

**FINAL DIRECTIVE:** Create a ${
        args.category
      } location that doesn't just house your story—it actively participates in it. Design an environment so rich and purposeful that characters' interactions with the space become as important as their interactions with each other. This should be a place readers want to visit, explore, and ultimately call home in their imagination.`;
    },
  },

  // Chapter Generation - Ultra Enhanced
  "generate-chapter": {
    name: "generate-chapter",
    description:
      "Craft masterpiece manga chapters with cinematic pacing and emotional depth",
    arguments: [
      {
        name: "chapter_number",
        description: "Sequential chapter position",
        required: true,
        type: "number",
      },
      {
        name: "title",
        description: "Chapter title with thematic resonance",
        required: true,
        type: "string",
      },
      {
        name: "tone",
        description: "Primary emotional atmosphere",
        required: false,
        type: "string",
        enum: [
          "action",
          "drama",
          "comedy",
          "romance",
          "mystery",
          "horror",
          "slice-of-life",
          "adventure",
          "psychological",
          "epic",
        ],
      },
      {
        name: "narrative_purpose",
        description: "Story function and impact",
        required: false,
        type: "string",
        enum: [
          "introduction",
          "character-development",
          "plot-advancement",
          "conflict-escalation",
          "climax",
          "resolution",
          "transition",
          "revelation",
          "transformation",
        ],
      },
      {
        name: "target_scenes",
        description: "Optimal scene count for pacing",
        required: false,
        type: "number",
      },
    ],
    handler: async (args: any) => {
      return `# 📖 MASTERPIECE CHAPTER CREATION PROTOCOL

## CHAPTER IDENTITY MATRIX
**Chapter ${args.chapter_number}: "${args.title}"**
**Emotional Tone:** ${args.tone || "multi-layered complexity"}
**Narrative Function:** ${
        args.narrative_purpose || "character & plot synthesis"
      }
**Structure:** ${args.target_scenes || "4-6"} carefully orchestrated scenes

---

## 🎬 NARRATIVE ARCHITECTURE MASTERY

### Opening Hook Excellence
- **Immediate Engagement:** Start with action, emotion, or intrigue—never exposition
- **Character State Establishment:** Show protagonists in their current emotional/physical condition
- **World Grounding:** Orient readers in time, place, and story context efficiently
- **Tension Introduction:** Present the central conflict or challenge of this chapter
- **Reader Investment:** Give readers something to care about within the first page

### Escalation Engineering
- **Scene Progression Logic:** Each scene raises stakes or deepens understanding
- **Tension Building Rhythm:** Strategic pacing between action and reflection
- **Character Choice Points:** Meaningful decisions that reveal personality and drive plot
- **Relationship Evolution:** How connections between characters shift and grow
- **Information Revelation:** Strategic disclosure of plot and character details

---

## 🎭 CHARACTER DEVELOPMENT ENGINE

### Active Character Progression
- **Growth Catalysts:** Events that force characters to change or adapt
- **Internal Conflict Resolution:** How characters wrestle with personal challenges
- **Relationship Dynamics:** Evolving connections that create new story possibilities
- **Skill/Knowledge Acquisition:** Natural character learning and development
- **Personality Revelation:** Deeper layers of character exposed through action

### Dialogue Excellence
- **Purpose-Driven Conversation:** Every exchange advances plot or develops character
- **Voice Authenticity:** Unique speech patterns that feel natural and distinct
- **Subtext Mastery:** What characters mean versus what they actually say
- **Emotional Truth:** Genuine feelings that resonate with readers
- **Cultural Authenticity:** Language that honors character backgrounds

---

## 🎨 VISUAL STORYTELLING SUPREMACY

### Cinematic Pacing Design
- **Panel Rhythm Variation:** Mix of wide, medium, and close shots for optimal flow
- **Action Sequence Choreography:** Clear, dynamic movement that's easy to follow
- **Emotional Beat Placement:** Strategic pauses that let important moments resonate
- **Transition Mastery:** Smooth movement between locations and time periods
- **Splash Page Moments:** Identifying scenes worthy of full-page impact

### Scene Flow Architecture
- **Visual Hierarchy:** Strategic composition that guides reader attention
- **Mood Continuity:** Consistent atmospheric elements that unify the chapter
- **Symbolic Integration:** Visual metaphors that enhance thematic depth
- **Environmental Storytelling:** Backgrounds that actively participate in narrative
- **Character Blocking:** Positioning that reveals relationships and tensions

---

## ⚡ GENRE MASTERY & INNOVATION

### ${args.tone || "Multi-Dimensional"} Excellence
- **Authentic Emotion:** Real feelings that connect across cultural boundaries
- **Genre Convention Mastery:** Meet reader expectations while adding fresh elements
- **Tonal Consistency:** Maintain ${
        args.tone || "appropriate"
      } atmosphere throughout
- **Surprise Integration:** Unexpected but logical developments that enhance engagement
- **Cultural Sensitivity:** Respectful handling of themes and character backgrounds

### Reader Engagement Strategy
- **Empathy Amplification:** Moments that make readers care deeply about outcomes
- **Anticipation Building:** Strategic setup for future chapters and story beats
- **Emotional Catharsis:** Satisfying resolution of chapter-specific tensions
- **Memory Creation:** Scenes that readers will remember and discuss
- **Theory Generation:** Elements that inspire fan speculation and engagement

---

## 🏗️ STRUCTURAL EXCELLENCE

### Scene Architecture Planning
- **Opening Scene:** Establish chapter mood and central conflict efficiently
- **Development Scenes:** Build tension and character understanding progressively
- **Climax Scene:** Chapter's emotional or action peak that changes everything
- **Resolution Scene:** Satisfying conclusion that sets up future developments
- **Transition Integration:** Natural bridges between all scenes and story elements

### Pacing Intelligence
- **Rhythm Variation:** Balance intense action with quieter character moments
- **Information Distribution:** Strategic revelation that maintains reader interest
- **Emotional Breathing Room:** Spaces for readers to process significant events
- **Momentum Maintenance:** Keep story moving forward without feeling rushed
- **Cliffhanger Crafting:** Chapter endings that create anticipation for continuation

---

## 🎯 READER EXPERIENCE OPTIMIZATION

### Emotional Journey Design
- **Investment Amplification:** Deepen reader connection to characters and outcomes
- **Tension Management:** Build and release pressure for optimal reading experience
- **Satisfaction Balance:** Resolve chapter conflicts while maintaining series momentum
- **Cultural Bridge Building:** Universal themes expressed through specific character experiences
- **Memory Imprinting:** Create moments that become part of readers' personal mythology

### Technical Excellence
- **Dialogue-Action Balance:** Perfect ratio of conversation, movement, and visual storytelling
- **Exposition Integration:** Natural information delivery that doesn't feel forced
- **Character Voice Consistency:** Maintain established speech patterns and personality
- **World Building Enhancement:** Expand setting details that serve story needs
- **Theme Reinforcement:** Subtle integration of larger story messages and meanings

---

**FINAL DIRECTIVE:** Create Chapter ${
        args.chapter_number
      } that readers will consider a perfect standalone experience while serving the larger story magnificently. Balance ${
        args.tone || "emotional resonance"
      } with ${
        args.narrative_purpose || "story advancement"
      } to produce a chapter that satisfies current story needs while building irresistible anticipation for what comes next. This should be the chapter that converts casual readers into devoted fans.`;
    },
  },

  // Scene Generation - Ultra Enhanced
  "generate-scene": {
    name: "generate-scene",
    description:
      "Create cinematic manga scenes that pulse with life and narrative purpose",
    arguments: [
      {
        name: "title",
        description: "Scene identifier with emotional resonance",
        required: true,
        type: "string",
      },
      {
        name: "location_type",
        description: "Environmental category",
        required: false,
        type: "string",
        enum: [
          "indoor",
          "outdoor",
          "urban",
          "rural",
          "fantasy",
          "futuristic",
          "historical",
          "natural",
          "transitional",
          "symbolic",
        ],
      },
      {
        name: "character_count",
        description: "Number of active participants",
        required: false,
        type: "number",
      },
      {
        name: "scene_purpose",
        description: "Primary narrative function",
        required: false,
        type: "string",
        enum: [
          "exposition",
          "action",
          "dialogue",
          "character-moment",
          "transition",
          "revelation",
          "conflict",
          "bonding",
          "transformation",
        ],
      },
      {
        name: "mood",
        description: "Target emotional atmosphere",
        required: false,
        type: "string",
        enum: [
          "peaceful",
          "mysterious",
          "energetic",
          "romantic",
          "tense",
          "cheerful",
          "somber",
          "triumphant",
          "melancholic",
        ],
      },
      {
        name: "target_panels",
        description: "Optimal panel count for pacing",
        required: false,
        type: "number",
      },
    ],
    handler: async (args: any) => {
      return `# 🎬 CINEMATIC SCENE CREATION MASTERY

## SCENE IDENTITY MATRIX
**Scene Title:** "${args.title}"
**Environment:** ${args.location_type || "story-perfect"} setting
**Cast Size:** ${
        args.character_count || "2-3"
      } characters in dynamic interaction
**Narrative Purpose:** ${args.scene_purpose || "multi-layered development"}
**Emotional Target:** ${args.mood || "authentically complex"}
**Panel Architecture:** ${args.target_panels || "3-5"} precisely crafted moments

---

## 🎭 EMOTIONAL ARCHITECTURE MASTERY

### Scene Entry Strategy
- **Character Motivation States:** Each person arrives with clear goals and emotional baggage
- **Conflict Seed Identification:** What's at stake and what could go dramatically wrong
- **Relationship Tension Mapping:** Power dynamics and emotional undercurrents between characters
- **Environmental Mood Synchronization:** How the location enhances or contrasts character emotions
- **Story Thread Advancement:** Which plot elements will move forward in this scene

### Character Arc Integration
- **Growth Moment Opportunities:** How each character can reveal or develop something new
- **Vulnerability Windows:** Moments when characters show their true selves
- **Decision Catalysts:** Choices that reveal personality and drive future plot
- **Relationship Evolution Points:** How connections between people shift and deepen
- **Internal Conflict Expression:** Ways characters wrestle with personal challenges

---

## 📷 CINEMATIC EXECUTION EXCELLENCE

### Visual Storytelling Strategy
- **Opening Shot Philosophy:** Establish mood, stakes, and character states efficiently
- **Movement Choreography:** Natural character positioning and interaction flow
- **Emotional Beat Placement:** Strategic moments for close-ups and reaction shots
- **Space Utilization Mastery:** How characters use environment to reveal personality
- **Closing Image Impact:** Final visual that encapsulates the scene's meaning

### Panel-by-Panel Architecture
- **Panel 1 - ESTABLISH:** Wide shot introducing environment and character dynamics
- **Panel 2-3 - DEVELOP:** Medium shots showing interaction progression and rising tension
- **Panel 4 - IMPACT:** Close-up revealing crucial emotion, realization, or action consequence
- **Panel 5 - RESOLVE:** Transition setup flowing naturally to the next story beat
- **Bonus Considerations:** Optional panels for pacing adjustment and dramatic emphasis

---

## 🗣️ DIALOGUE & INTERACTION MASTERY

### Conversation Excellence
- **Subtext Richness:** Characters rarely say exactly what they mean or feel
- **Voice Distinctiveness:** Each person speaks with unique rhythm and vocabulary
- **Purpose Integration:** Every exchange advances plot, develops character, or builds world
- **Emotional Authenticity:** Feelings that feel genuine rather than manufactured
- **Cultural Authenticity:** Speech patterns that honor character backgrounds

### Physical Storytelling
- **Proxemics Psychology:** How distance between characters reveals relationship dynamics
- **Gesture Language:** Hand movements and body positioning that tell the story
- **Environmental Interaction:** How characters touch, avoid, or utilize their surroundings
- **Micro-Expression Mastery:** Subtle facial changes that reveal inner thoughts
- **Action-Reaction Chains:** Natural physical responses that feel organic

---

## 🌟 ATMOSPHERIC INTELLIGENCE

### Mood Enhancement Systems
- **Sensory Detail Integration:** What characters see, hear, smell, and feel in the moment
- **Weather Psychology Utilization:** How environmental conditions reflect or contrast emotions
- **Lighting Drama Optimization:** Strategic use of shadows, highlights, and color temperature
- **Sound Design Implications:** Implied audio that enhances the visual reading experience
- **Temporal Rhythm Control:** Pacing that matches the scene's emotional needs

### Environmental Character Integration
- **Location Personality Expression:** How the setting actively participates in the story
- **Symbolic Element Placement:** Visual metaphors that enhance thematic depth
- **Cultural Context Authenticity:** Environmental details that honor the story world
- **Practical Functionality:** Realistic space usage that serves character needs
- **Memory Trigger Potential:** Elements that could become emotionally significant later

---

## ⚡ DYNAMIC FLOW ENGINEERING

### Scene Connection Mastery
- **Previous Scene Bridge:** Smooth emotional and narrative transition from what came before
- **Momentum Building Strategy:** Pacing that maintains reader engagement and anticipation
- **Tension Escalation Logic:** How conflict and stakes increase naturally
- **Character State Evolution:** Clear progression in how people change during the scene
- **Next Scene Setup:** Natural bridge to what follows without forced transitions

### Reader Engagement Optimization
- **Investment Amplification:** Moments that make readers care more about outcomes
- **Anticipation Generation:** Elements that create curiosity about future developments
- **Emotional Resonance:** Universal human experiences that connect across cultures
- **Visual Spectacle:** Imagery that showcases manga's unique storytelling power
- **Memory Imprinting:** Scenes that readers will remember and reference later

---

## 🎨 MANGA-SPECIFIC EXCELLENCE

### Visual Composition Strategy
- **Panel Shape Psychology:** Frame choices that enhance emotional impact
- **Background Detail Hierarchy:** Strategic complexity that supports rather than overwhelms
- **Character Focus Management:** Ensuring important elements draw reader attention
- **Action Line Integration:** Movement indicators that enhance rather than clutter
- **White Space Utilization:** Strategic emptiness that creates breathing room and emphasis

### Technical Art Considerations
- **Line Weight Storytelling:** How different line thicknesses can convey emotion and focus
- **Screen Tone Harmony:** Pattern usage that enhances mood without distraction
- **Perspective Psychology:** Camera angles that support the scene's emotional goals
- **Detail Consistency:** Appropriate complexity level that matches the story's art style
- **Cultural Visual Language:** Art choices that honor the story's cultural context

---

**FINAL DIRECTIVE:** Create a ${
        args.scene_purpose || "story-advancing"
      } scene in a ${args.location_type || "perfect"} setting that captures ${
        args.mood || "authentic human emotion"
      } while moving the story forward with cinematic precision. This scene should feel like a complete mini-movie that satisfies readers while building irresistible anticipation for what happens next.`;
    },
  },

  // Panel Generation - Ultra Enhanced
  "generate-panel": {
    name: "generate-panel",
    description:
      "Design individual manga panels with maximum narrative and visual impact",
    arguments: [
      {
        name: "panel_description",
        description: "Core action or moment being captured",
        required: true,
        type: "string",
      },
      {
        name: "shot_type",
        description: "Camera framing approach",
        required: false,
        type: "string",
        enum: [
          "close-up",
          "medium",
          "wide",
          "extreme-close-up",
          "bird's-eye",
          "low-angle",
          "high-angle",
          "dutch-angle",
          "over-shoulder",
        ],
      },
      {
        name: "panel_purpose",
        description: "Specific narrative function",
        required: false,
        type: "string",
        enum: [
          "action",
          "reaction",
          "establishing",
          "detail",
          "transition",
          "dramatic",
          "comedic",
          "emotional",
          "symbolic",
        ],
      },
      {
        name: "character_count",
        description: "Number of visible characters",
        required: false,
        type: "number",
      },
      {
        name: "mood",
        description: "Target emotional atmosphere",
        required: false,
        type: "string",
        enum: [
          "intense",
          "calm",
          "mysterious",
          "energetic",
          "romantic",
          "comedic",
          "dramatic",
          "peaceful",
          "threatening",
        ],
      },
    ],
    handler: async (args: any) => {
      return `# 🖼️ MASTERPIECE PANEL CREATION SYSTEM

## PANEL IDENTITY MATRIX
**Visual Concept:** ${args.panel_description}
**Camera Strategy:** ${
        args.shot_type || "medium"
      } shot for optimal narrative impact
**Story Function:** ${args.panel_purpose || "story advancement"}
**Character Focus:** ${
        args.character_count || "1-2"
      } people in meaningful interaction
**Emotional Target:** ${args.mood || "authentic resonance"}

---

## 🎨 VISUAL COMPOSITION MASTERY

### Advanced Composition Techniques
- **Rule of Thirds Excellence:** Strategic placement of key elements for maximum visual power
- **Leading Line Integration:** Guide reader's eye to the most critical story element
- **Depth Layer Architecture:** Foreground, midground, background creating dimensional storytelling
- **Negative Space Psychology:** Strategic emptiness that enhances focus and emotional impact
- **Visual Weight Distribution:** Balanced elements creating intentionally powerful composition

### Character Performance Direction
- **Micro-Expression Mastery:** Subtle facial changes that reveal genuine internal states
- **Body Language Authenticity:** Posture and gesture that tells the story naturally
- **Eye Contact Strategy:** Strategic gaze direction creating connection, tension, or revelation
- **Spatial Relationship Psychology:** Character positioning revealing power dynamics and emotions
- **Action Line Integration:** Movement that feels organic and purposeful, never posed

---

## 📸 CINEMATIC TECHNIQUE EXCELLENCE

### ${args.shot_type || "Medium"} Shot Optimization
- **Emotional Distance Calibration:** Perfect intimacy level for the specific story moment
- **Information Balance Management:** Show exactly what readers need—nothing more, nothing less
- **Character Emphasis Strategy:** Frame subjects to highlight their current emotional state
- **Environmental Context Integration:** Include surroundings that enhance rather than distract
- **Perspective Psychology:** Angle choice that supports the panel's emotional goals

### Lighting as Narrative Tool
- **Mood Enhancement Illumination:** Light quality that amplifies ${
        args.mood || "authentic"
      } emotion
- **Character Sculpting Technique:** Highlights and shadows revealing personality and current state
- **Atmospheric Depth Creation:** Environmental lighting that builds believable, immersive space
- **Symbolic Light Integration:** Illumination sources carrying metaphorical story meaning
- **Dynamic Shadow Play:** Darkness that creates mystery, depth, and visual interest

---

## ⚡ NARRATIVE IMPACT OPTIMIZATION

### ${args.panel_purpose || "Story Advancement"} Excellence
- **Plot Progression Integration:** This panel must meaningfully advance story or character development
- **Reader Engagement Amplification:** Visual elements that maintain attention and build investment
- **Emotional Resonance Creation:** Genuine feeling that connects with universal human experience
- **Memory Imprinting Strategy:** Distinctive imagery that becomes unforgettable for readers
- **Cultural Bridge Building:** Visual language that translates across different backgrounds

### Technical Precision Mastery
- **Panel Border Intelligence:** Frame shape and style enhancing rather than constraining content
- **Dialogue Integration Excellence:** Speech bubble placement flowing naturally with artwork
- **Sound Effect Optimization:** Visual representation of audio enhancing immersion
- **Motion Line Mastery:** Dynamic elements showing movement and energy without cluttering
- **Detail Hierarchy Management:** Strategic complexity appropriate for panel size and story needs

---

## 🌊 CONTEXTUAL INTEGRATION EXCELLENCE

### Scene Continuity Mastery
- **Previous Panel Flow:** Smooth visual and emotional transition from preceding moment
- **Next Panel Setup:** Natural progression creating anticipation for what follows
- **Chapter Consistency:** Visual style and mood harmonizing with overall story atmosphere
- **Character Continuity:** Appearance and behavior matching established personality traits
- **World Building Integration:** Environmental details that honor established story universe

### Reader Experience Design
- **Pacing Control Precision:** Visual rhythm matching the story's current emotional needs
- **Information Clarity Optimization:** Easy comprehension of what's happening and why it matters
- **Emotional Accessibility:** Feelings that translate clearly across cultural and age boundaries
- **Visual Interest Maximization:** Compelling imagery rewarding careful examination
- **Cultural Sensitivity Integration:** Respectful representation that enhances rather than stereotypes

---

## 🎯 MANGA-SPECIFIC MASTERY

### Production Optimization
- **Line Weight Psychology:** Varying thickness conveying emotion, focus, and atmospheric depth
- **Screen Tone Harmony:** Pattern integration enhancing mood without overwhelming content
- **Black and White Translation:** Design maintaining impact in monochrome reproduction
- **Detail Scalability:** Appropriate complexity for different reproduction sizes
- **Printing Consideration:** Technical choices that ensure quality across different media

### Cultural Art Language
- **Visual Metaphor Integration:** Symbolic elements that enhance thematic depth naturally
- **Cultural Symbol Respect:** Authentic usage of imagery honoring story's cultural context
- **Genre Convention Mastery:** Meeting reader expectations while adding fresh creative elements
- **Artistic Style Consistency:** Maintaining established visual language throughout the work
- **Innovation Balance:** Creative choices that enhance rather than distract from storytelling

---

**FINAL DIRECTIVE:** Design a ${
        args.panel_purpose || "story-advancing"
      } panel using ${args.shot_type || "medium"} framing that captures ${
        args.mood || "authentic emotion"
      } and delivers precisely the narrative impact your story requires at this crucial moment. This single panel should feel like a complete artistic statement while serving the larger story's needs perfectly.`;
    },
  },
};

export default mangaMCPPrompts;
