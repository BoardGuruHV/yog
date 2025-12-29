# Yoga Asana App - 50 New Features Roadmap

## Current State Summary
The app currently has:
- 35+ yoga asanas with SVG illustrations
- Filtering by category, difficulty, body parts
- Search functionality
- Program builder with drag-and-drop
- Multiple programs with edit/duplicate
- Medical contraindications and modifications
- PostgreSQL database with Prisma ORM

---

# FEATURE CATEGORIES

## Category 1: AI-Powered Features (1-8)
## Category 2: User Management & Personalization (9-16)
## Category 3: Learning & Education (17-24)
## Category 4: Practice & Session Management (25-32)
## Category 5: Progress Tracking & Analytics (33-38)
## Category 6: Social & Community (39-44)
## Category 7: Accessibility & Internationalization (45-48)
## Category 8: Integrations & Export (49-50)

---

# DETAILED FEATURE SPECIFICATIONS

---

## CATEGORY 1: AI-POWERED FEATURES

### Feature 1: AI Yoga Assistant Chatbot
**Description:** Conversational AI that answers yoga-related questions, suggests poses, and provides guidance.

**Implementation Plan:**
1. **API Integration:**
   - Create `/api/chat/route.ts` endpoint
   - Integrate OpenAI/Claude API with streaming responses
   - Build system prompt with yoga knowledge context

2. **Database Changes:**
   ```prisma
   model ChatSession {
     id        String   @id @default(cuid())
     userId    String?
     messages  ChatMessage[]
     createdAt DateTime @default(now())
   }

   model ChatMessage {
     id        String      @id @default(cuid())
     sessionId String
     session   ChatSession @relation(fields: [sessionId], references: [id])
     role      String      // "user" | "assistant"
     content   String
     createdAt DateTime    @default(now())
   }
   ```

3. **Components:**
   - `components/ChatWidget.tsx` - Floating chat button + modal
   - `components/ChatMessage.tsx` - Individual message bubbles
   - `components/ChatInput.tsx` - Input with send button

4. **Features:**
   - Context-aware responses using asana database
   - Suggest asanas based on user queries
   - Answer "how to do X pose" questions
   - Provide breathing instructions
   - Recommend programs based on goals

5. **Files to Create:**
   - `app/api/chat/route.ts`
   - `components/chat/ChatWidget.tsx`
   - `components/chat/ChatMessage.tsx`
   - `components/chat/ChatInput.tsx`
   - `lib/ai/prompts.ts`
   - `context/ChatContext.tsx`

---

### Feature 2: AI-Generated Personalized Programs
**Description:** AI creates custom yoga programs based on user's goals, fitness level, time availability, and health conditions.

**Implementation Plan:**
1. **API Endpoint:**
   - Create `/api/ai/generate-program/route.ts`
   - Input: goals, duration, difficulty, conditions, focus areas
   - Output: Structured program with asana sequence

2. **User Flow:**
   - Wizard-style form collecting preferences
   - AI generates program in real-time
   - User can regenerate or modify
   - Save generated program

3. **Components:**
   - `components/ProgramWizard.tsx` - Multi-step form
   - `components/AIGeneratingState.tsx` - Loading animation
   - `components/GeneratedProgramPreview.tsx`

4. **AI Logic:**
   ```typescript
   interface ProgramRequest {
     goals: string[];        // "flexibility", "strength", "relaxation"
     duration: number;       // minutes
     difficulty: number;     // 1-5
     conditions: string[];   // medical conditions to avoid
     focusAreas: string[];   // body parts to target
     experienceLevel: string; // "beginner", "intermediate", "advanced"
   }
   ```

5. **Files to Create:**
   - `app/api/ai/generate-program/route.ts`
   - `app/generate/page.tsx`
   - `components/wizard/ProgramWizard.tsx`
   - `components/wizard/StepGoals.tsx`
   - `components/wizard/StepDuration.tsx`
   - `components/wizard/StepConditions.tsx`
   - `lib/ai/program-generator.ts`

---

### Feature 3: AI Pose Alignment Checker (Camera)
**Description:** Use device camera to analyze user's pose and provide real-time feedback on alignment.

**Implementation Plan:**
1. **Technology Stack:**
   - TensorFlow.js with PoseNet/MoveNet model
   - WebRTC for camera access
   - Canvas overlay for skeleton visualization

2. **Database Changes:**
   ```prisma
   model AsanaPoseData {
     id              String @id @default(cuid())
     asanaId         String @unique
     asana           Asana  @relation(fields: [asanaId], references: [id])
     keyPoints       Json   // Expected pose keypoints
     tolerances      Json   // Acceptable angle ranges
     commonMistakes  Json   // Mistake patterns to detect
   }
   ```

3. **Components:**
   - `components/PoseCamera.tsx` - Camera feed with overlay
   - `components/PoseOverlay.tsx` - Skeleton drawing
   - `components/AlignmentFeedback.tsx` - Real-time tips
   - `components/PoseComparison.tsx` - Side-by-side view

4. **Algorithm:**
   - Detect 17 body keypoints
   - Calculate joint angles
   - Compare with reference pose
   - Provide feedback: "Lift your arms higher", "Bend knees more"

5. **Files to Create:**
   - `app/practice/camera/page.tsx`
   - `components/camera/PoseCamera.tsx`
   - `components/camera/PoseOverlay.tsx`
   - `components/camera/AlignmentFeedback.tsx`
   - `lib/pose/detector.ts`
   - `lib/pose/analyzer.ts`
   - `lib/pose/feedback.ts`

---

### Feature 4: Voice-Guided Practice Sessions
**Description:** AI-generated voice instructions for guided yoga sessions with customizable voice and pace.

**Implementation Plan:**
1. **Technology:**
   - Web Speech API (SpeechSynthesis)
   - OR OpenAI TTS API for natural voices
   - Background audio mixing

2. **Database Changes:**
   ```prisma
   model AsanaVoiceScript {
     id          String @id @default(cuid())
     asanaId     String
     asana       Asana  @relation(fields: [asanaId], references: [id])
     phase       String // "enter", "hold", "exit"
     script      String
     breathCues  String[]
   }
   ```

3. **Features:**
   - Enter/hold/exit instructions for each pose
   - Breathing cues ("Inhale... Exhale...")
   - Transition phrases between poses
   - Adjustable speech rate
   - Multiple voice options

4. **Components:**
   - `components/VoicePlayer.tsx` - Audio controls
   - `components/VoiceSettings.tsx` - Voice/pace settings
   - `components/GuidedSession.tsx` - Full session player

5. **Files to Create:**
   - `app/practice/guided/[programId]/page.tsx`
   - `components/practice/VoicePlayer.tsx`
   - `components/practice/VoiceSettings.tsx`
   - `lib/voice/speech.ts`
   - `lib/voice/scripts.ts`

---

### Feature 5: AI Breathing Pattern Analyzer
**Description:** Analyze breathing patterns through microphone and provide feedback for pranayama practice.

**Implementation Plan:**
1. **Technology:**
   - Web Audio API for microphone access
   - Audio analysis for breath detection
   - Pattern matching for breathing rhythms

2. **Features:**
   - Detect inhale/exhale cycles
   - Count breath duration
   - Guide specific patterns (4-7-8, Box breathing)
   - Visualize breath as animated graphics

3. **Components:**
   - `components/BreathAnalyzer.tsx`
   - `components/BreathVisualizer.tsx` - Animated circle/wave
   - `components/BreathGuide.tsx` - Pattern instructions
   - `components/PranayamaSession.tsx`

4. **Pranayama Patterns:**
   - Ujjayi (Ocean breath)
   - Nadi Shodhana (Alternate nostril)
   - Kapalabhati (Skull shining)
   - Box breathing (4-4-4-4)

5. **Files to Create:**
   - `app/practice/breathing/page.tsx`
   - `components/breathing/BreathAnalyzer.tsx`
   - `components/breathing/BreathVisualizer.tsx`
   - `lib/audio/breath-detector.ts`

---

### Feature 6: Smart Pose Recommendations
**Description:** AI suggests next poses based on current pose, session flow, and user preferences.

**Implementation Plan:**
1. **Algorithm:**
   - Build pose transition graph
   - Score transitions based on: anatomical flow, difficulty progression, category balance
   - Learn from user's program history

2. **Database Changes:**
   ```prisma
   model PoseTransition {
     id          String @id @default(cuid())
     fromAsanaId String
     toAsanaId   String
     fromAsana   Asana  @relation("FromAsana", fields: [fromAsanaId], references: [id])
     toAsana     Asana  @relation("ToAsana", fields: [toAsanaId], references: [id])
     score       Float  // 0-1 flow quality
     notes       String?
   }
   ```

3. **Components:**
   - `components/PoseRecommendations.tsx`
   - Show 3-5 recommended next poses
   - Explain why each is recommended

4. **Files to Create:**
   - `app/api/recommendations/route.ts`
   - `components/PoseRecommendations.tsx`
   - `lib/recommendations/engine.ts`

---

### Feature 7: Natural Language Program Search
**Description:** Search programs and poses using natural language queries like "gentle morning routine for back pain".

**Implementation Plan:**
1. **Technology:**
   - OpenAI Embeddings API
   - Vector database (Pinecone/pgvector)
   - Semantic search

2. **Database Changes:**
   ```prisma
   model AsanaEmbedding {
     id        String @id @default(cuid())
     asanaId   String @unique
     asana     Asana  @relation(fields: [asanaId], references: [id])
     embedding Float[] // Vector embedding
   }
   ```

3. **Features:**
   - "Show me relaxing poses for evening"
   - "Hip openers for runners"
   - "Quick energy boost sequence"

4. **Components:**
   - `components/SmartSearch.tsx`
   - Show intent interpretation
   - Display matching results with relevance

5. **Files to Create:**
   - `app/api/search/semantic/route.ts`
   - `components/SmartSearch.tsx`
   - `lib/search/embeddings.ts`
   - `scripts/generate-embeddings.ts`

---

### Feature 8: AI Injury Prevention Alerts
**Description:** AI monitors user's practice patterns and warns about potential overuse or risky combinations.

**Implementation Plan:**
1. **Analysis:**
   - Track repeated high-difficulty poses
   - Detect inadequate warm-up sequences
   - Monitor body part stress patterns
   - Flag risky transitions

2. **Database Changes:**
   ```prisma
   model PracticeSession {
     id        String   @id @default(cuid())
     userId    String
     programId String?
     asanas    Json     // Array of practiced asanas
     duration  Int
     createdAt DateTime @default(now())
   }
   ```

3. **Alerts:**
   - "You've done 5 backbends this week. Consider more forward folds for balance."
   - "Starting with inversions without warm-up may strain your neck."

4. **Files to Create:**
   - `app/api/safety/analyze/route.ts`
   - `components/SafetyAlert.tsx`
   - `lib/safety/analyzer.ts`

---

## CATEGORY 2: USER MANAGEMENT & PERSONALIZATION

### Feature 9: User Authentication & Profiles
**Description:** User accounts with profiles, preferences, and data sync across devices.

**Implementation Plan:**
1. **Technology:**
   - NextAuth.js for authentication
   - OAuth providers (Google, Apple, Email)
   - JWT sessions

2. **Database Changes:**
   ```prisma
   model User {
     id            String    @id @default(cuid())
     email         String    @unique
     name          String?
     image         String?
     emailVerified DateTime?
     accounts      Account[]
     sessions      Session[]
     profile       UserProfile?
     programs      Program[]
     createdAt     DateTime  @default(now())
   }

   model UserProfile {
     id              String   @id @default(cuid())
     userId          String   @unique
     user            User     @relation(fields: [userId], references: [id])
     age             Int?
     experienceLevel String?  // beginner, intermediate, advanced
     goals           String[]
     conditions      String[]
     preferredDuration Int?   // minutes
   }

   model Account {
     id                String  @id @default(cuid())
     userId            String
     type              String
     provider          String
     providerAccountId String
     refresh_token     String?
     access_token      String?
     expires_at        Int?
     token_type        String?
     scope             String?
     id_token          String?
     session_state     String?
     user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
     @@unique([provider, providerAccountId])
   }

   model Session {
     id           String   @id @default(cuid())
     sessionToken String   @unique
     userId       String
     expires      DateTime
     user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
   }
   ```

3. **Pages:**
   - `/login` - Sign in page
   - `/register` - Sign up page
   - `/profile` - User profile management
   - `/settings` - App settings

4. **Files to Create:**
   - `app/api/auth/[...nextauth]/route.ts`
   - `app/login/page.tsx`
   - `app/register/page.tsx`
   - `app/profile/page.tsx`
   - `components/auth/LoginForm.tsx`
   - `components/auth/UserMenu.tsx`
   - `lib/auth.ts`

---

### Feature 10: Health Profile & Medical Conditions
**Description:** Comprehensive health profile to automatically filter contraindicated poses.

**Implementation Plan:**
1. **User Flow:**
   - Onboarding wizard for health info
   - Select from condition list
   - Auto-apply filters to library
   - Warning badges on risky poses

2. **Database Changes:**
   ```prisma
   model UserCondition {
     id          String    @id @default(cuid())
     userId      String
     user        User      @relation(fields: [userId], references: [id])
     conditionId String
     condition   Condition @relation(fields: [conditionId], references: [id])
     severity    String?   // mild, moderate, severe
     notes       String?
   }
   ```

3. **Features:**
   - Pregnancy tracker (trimester-specific)
   - Injury recovery timeline
   - Chronic condition management

4. **Files to Create:**
   - `app/onboarding/health/page.tsx`
   - `components/health/ConditionSelector.tsx`
   - `components/health/HealthWarningBadge.tsx`
   - `lib/health/filter.ts`

---

### Feature 11: Personalized Dashboard
**Description:** Customizable home dashboard with widgets for progress, recommendations, and quick actions.

**Implementation Plan:**
1. **Widgets:**
   - Today's practice suggestion
   - Streak counter
   - Weekly progress chart
   - Quick start buttons
   - Favorite programs
   - Recent activity

2. **Components:**
   - `components/dashboard/DashboardGrid.tsx`
   - `components/dashboard/StreakWidget.tsx`
   - `components/dashboard/ProgressWidget.tsx`
   - `components/dashboard/QuickStartWidget.tsx`
   - `components/dashboard/RecommendationWidget.tsx`

3. **Customization:**
   - Drag-and-drop widget arrangement
   - Show/hide widgets
   - Widget size options

4. **Files to Create:**
   - `app/dashboard/page.tsx`
   - `components/dashboard/*.tsx` (6-8 widget components)
   - `context/DashboardContext.tsx`

---

### Feature 12: Goal Setting & Tracking
**Description:** Set yoga goals (flexibility, strength, consistency) and track progress toward them.

**Implementation Plan:**
1. **Goal Types:**
   - Practice frequency (X times/week)
   - Total practice time (X minutes/week)
   - Specific pose mastery
   - Streak goals
   - Body-specific goals (touch toes, splits)

2. **Database Changes:**
   ```prisma
   model Goal {
     id          String   @id @default(cuid())
     userId      String
     user        User     @relation(fields: [userId], references: [id])
     type        String   // frequency, duration, pose, streak
     target      Int
     current     Int      @default(0)
     unit        String   // sessions, minutes, days
     deadline    DateTime?
     completed   Boolean  @default(false)
     createdAt   DateTime @default(now())
   }
   ```

3. **Components:**
   - `components/goals/GoalCreator.tsx`
   - `components/goals/GoalCard.tsx`
   - `components/goals/GoalProgress.tsx`

4. **Files to Create:**
   - `app/goals/page.tsx`
   - `app/api/goals/route.ts`
   - `components/goals/*.tsx`

---

### Feature 13: Practice Reminders & Scheduling
**Description:** Set daily/weekly practice reminders with smart scheduling based on calendar.

**Implementation Plan:**
1. **Technology:**
   - Web Push Notifications API
   - Service Worker for background notifications
   - Optional calendar integration

2. **Database Changes:**
   ```prisma
   model Reminder {
     id        String   @id @default(cuid())
     userId    String
     user      User     @relation(fields: [userId], references: [id])
     time      String   // "07:00"
     days      String[] // ["mon", "wed", "fri"]
     programId String?
     enabled   Boolean  @default(true)
   }

   model PushSubscription {
     id           String @id @default(cuid())
     userId       String
     user         User   @relation(fields: [userId], references: [id])
     endpoint     String
     keys         Json
   }
   ```

3. **Features:**
   - Daily reminder notifications
   - Pre-practice notification (15 min before)
   - Missed practice nudges
   - Smart time suggestions

4. **Files to Create:**
   - `app/api/notifications/subscribe/route.ts`
   - `app/api/notifications/send/route.ts`
   - `components/reminders/ReminderSettings.tsx`
   - `public/sw.js` (Service Worker)

---

### Feature 14: Favorites & Collections
**Description:** Save favorite asanas and organize them into custom collections.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model Favorite {
     id        String   @id @default(cuid())
     userId    String
     user      User     @relation(fields: [userId], references: [id])
     asanaId   String
     asana     Asana    @relation(fields: [asanaId], references: [id])
     createdAt DateTime @default(now())
     @@unique([userId, asanaId])
   }

   model Collection {
     id          String            @id @default(cuid())
     userId      String
     user        User              @relation(fields: [userId], references: [id])
     name        String
     description String?
     asanas      CollectionAsana[]
     createdAt   DateTime          @default(now())
   }

   model CollectionAsana {
     id           String     @id @default(cuid())
     collectionId String
     collection   Collection @relation(fields: [collectionId], references: [id])
     asanaId      String
     asana        Asana      @relation(fields: [asanaId], references: [id])
     order        Int
   }
   ```

2. **Components:**
   - `components/FavoriteButton.tsx` - Heart icon toggle
   - `components/CollectionCard.tsx`
   - `components/AddToCollectionModal.tsx`

3. **Pages:**
   - `/favorites` - All favorited asanas
   - `/collections` - User's collections
   - `/collections/[id]` - Single collection view

4. **Files to Create:**
   - `app/favorites/page.tsx`
   - `app/collections/page.tsx`
   - `app/api/favorites/route.ts`
   - `app/api/collections/route.ts`

---

### Feature 15: Practice History & Journal
**Description:** Log practice sessions with notes, mood tracking, and reflections.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model PracticeLog {
     id          String   @id @default(cuid())
     userId      String
     user        User     @relation(fields: [userId], references: [id])
     programId   String?
     program     Program? @relation(fields: [programId], references: [id])
     duration    Int      // actual minutes practiced
     moodBefore  Int?     // 1-5
     moodAfter   Int?     // 1-5
     energyLevel Int?     // 1-5
     notes       String?
     poses       Json     // Array of practiced poses
     createdAt   DateTime @default(now())
   }
   ```

2. **Features:**
   - Quick log after practice
   - Mood/energy tracking
   - Free-form journal notes
   - Photo upload option
   - Tag system

3. **Components:**
   - `components/journal/PracticeLogger.tsx`
   - `components/journal/MoodSelector.tsx`
   - `components/journal/JournalEntry.tsx`
   - `components/journal/JournalTimeline.tsx`

4. **Files to Create:**
   - `app/journal/page.tsx`
   - `app/api/journal/route.ts`
   - `components/journal/*.tsx`

---

### Feature 16: Custom Pose Notes & Tags
**Description:** Add personal notes and tags to any asana for future reference.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model UserAsanaNote {
     id        String   @id @default(cuid())
     userId    String
     user      User     @relation(fields: [userId], references: [id])
     asanaId   String
     asana     Asana    @relation(fields: [asanaId], references: [id])
     note      String
     tags      String[]
     updatedAt DateTime @updatedAt
     @@unique([userId, asanaId])
   }
   ```

2. **Features:**
   - Personal notes on detail page
   - Custom tags (e.g., "morning", "pre-run")
   - Filter library by personal tags
   - Note history

3. **Components:**
   - `components/notes/PersonalNote.tsx`
   - `components/notes/TagInput.tsx`
   - `components/notes/NoteHistory.tsx`

4. **Files to Create:**
   - `app/api/notes/route.ts`
   - `components/notes/*.tsx`

---

## CATEGORY 3: LEARNING & EDUCATION

### Feature 17: Step-by-Step Pose Tutorials
**Description:** Detailed tutorials breaking down each pose into entry, hold, and exit phases.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model AsanaTutorial {
     id          String         @id @default(cuid())
     asanaId     String         @unique
     asana       Asana          @relation(fields: [asanaId], references: [id])
     steps       TutorialStep[]
     tips        String[]
     commonErrors String[]
   }

   model TutorialStep {
     id          String        @id @default(cuid())
     tutorialId  String
     tutorial    AsanaTutorial @relation(fields: [tutorialId], references: [id])
     order       Int
     phase       String        // "preparation", "entry", "hold", "exit"
     instruction String
     breathCue   String?       // "inhale", "exhale", "hold"
     duration    Int?          // seconds
     imagePath   String?
   }
   ```

2. **Components:**
   - `components/tutorial/TutorialPlayer.tsx`
   - `components/tutorial/StepCard.tsx`
   - `components/tutorial/BreathIndicator.tsx`
   - `components/tutorial/ProgressBar.tsx`

3. **Features:**
   - Auto-advance through steps
   - Manual navigation
   - Repeat step option
   - Breath sync indicators

4. **Files to Create:**
   - `app/learn/[asanaId]/page.tsx`
   - `components/tutorial/*.tsx`
   - `app/api/tutorials/[asanaId]/route.ts`

---

### Feature 18: Sanskrit Pronunciation Guide
**Description:** Audio pronunciation of Sanskrit names with phonetic breakdown.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model Pronunciation {
     id          String @id @default(cuid())
     asanaId     String @unique
     asana       Asana  @relation(fields: [asanaId], references: [id])
     phonetic    String // "ta-DA-sa-na"
     audioPath   String // Path to audio file
     syllables   Json   // [{text: "ta", stress: false}, ...]
   }
   ```

2. **Features:**
   - Play audio pronunciation
   - Highlight syllables as spoken
   - Slow-motion playback
   - Record and compare user's pronunciation

3. **Components:**
   - `components/pronunciation/AudioPlayer.tsx`
   - `components/pronunciation/SyllableBreakdown.tsx`
   - `components/pronunciation/PronunciationCard.tsx`

4. **Files to Create:**
   - `public/audio/pronunciation/*.mp3`
   - `components/pronunciation/*.tsx`
   - `app/api/pronunciation/route.ts`

---

### Feature 19: Yoga Anatomy Viewer
**Description:** Interactive anatomy diagrams showing muscles engaged in each pose.

**Implementation Plan:**
1. **Technology:**
   - SVG-based interactive anatomy
   - Highlight muscles on hover/click
   - Layer system (skeleton, muscles, pose)

2. **Database Changes:**
   ```prisma
   model AsanaAnatomy {
     id             String   @id @default(cuid())
     asanaId        String   @unique
     asana          Asana    @relation(fields: [asanaId], references: [id])
     primaryMuscles String[] // Muscles actively engaged
     secondaryMuscles String[] // Supporting muscles
     stretchedMuscles String[] // Muscles being stretched
   }
   ```

3. **Components:**
   - `components/anatomy/AnatomyViewer.tsx`
   - `components/anatomy/MuscleOverlay.tsx`
   - `components/anatomy/AnatomyLegend.tsx`

4. **Files to Create:**
   - `public/anatomy/body-front.svg`
   - `public/anatomy/body-back.svg`
   - `components/anatomy/*.tsx`
   - `lib/anatomy/muscles.ts`

---

### Feature 20: Pose Comparison Tool
**Description:** Compare two poses side-by-side to understand differences and similarities.

**Implementation Plan:**
1. **Features:**
   - Select two poses to compare
   - Side-by-side image view
   - Comparison table (difficulty, benefits, muscles)
   - Common vs. unique benefits
   - Transition guidance between them

2. **Components:**
   - `components/compare/PoseSelector.tsx`
   - `components/compare/ComparisonView.tsx`
   - `components/compare/DifferenceTable.tsx`

3. **Files to Create:**
   - `app/compare/page.tsx`
   - `components/compare/*.tsx`

---

### Feature 21: Yoga Philosophy & History
**Description:** Educational content about yoga history, philosophy, and the eight limbs.

**Implementation Plan:**
1. **Content Structure:**
   - History timeline
   - Eight limbs of yoga
   - Chakra system
   - Yoga sutras
   - Famous yogis

2. **Database Changes:**
   ```prisma
   model Article {
     id          String   @id @default(cuid())
     slug        String   @unique
     title       String
     category    String   // "history", "philosophy", "anatomy"
     content     String   // Markdown content
     coverImage  String?
     readTime    Int      // minutes
     publishedAt DateTime @default(now())
   }
   ```

3. **Components:**
   - `components/learn/ArticleCard.tsx`
   - `components/learn/ArticleContent.tsx`
   - `components/learn/ReadingProgress.tsx`

4. **Files to Create:**
   - `app/learn/page.tsx`
   - `app/learn/articles/[slug]/page.tsx`
   - `content/articles/*.md`

---

### Feature 22: Video Demonstrations
**Description:** Video tutorials for each asana with professional demonstrations.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model AsanaVideo {
     id          String @id @default(cuid())
     asanaId     String
     asana       Asana  @relation(fields: [asanaId], references: [id])
     type        String // "full", "quick", "modification"
     url         String // YouTube/Vimeo/S3 URL
     duration    Int    // seconds
     thumbnail   String?
   }
   ```

2. **Technology:**
   - Video.js or React Player
   - YouTube/Vimeo embed support
   - Self-hosted option (S3)

3. **Components:**
   - `components/video/VideoPlayer.tsx`
   - `components/video/VideoGallery.tsx`
   - `components/video/VideoThumbnail.tsx`

4. **Files to Create:**
   - `components/video/*.tsx`
   - `lib/video/player.ts`

---

### Feature 23: 3D Pose Viewer
**Description:** Interactive 3D models of yoga poses that can be rotated and zoomed.

**Implementation Plan:**
1. **Technology:**
   - Three.js with React Three Fiber
   - GLTF/GLB 3D models
   - OrbitControls for interaction

2. **Features:**
   - 360° rotation
   - Zoom in/out
   - Multiple angle presets
   - Skeleton overlay option
   - Comparison with user photo

3. **Components:**
   - `components/3d/PoseViewer3D.tsx`
   - `components/3d/ModelControls.tsx`
   - `components/3d/AnglePresets.tsx`

4. **Files to Create:**
   - `public/models/*.glb`
   - `components/3d/*.tsx`
   - `lib/three/setup.ts`

---

### Feature 24: Quiz & Knowledge Tests
**Description:** Interactive quizzes to test yoga knowledge and pose recognition.

**Implementation Plan:**
1. **Quiz Types:**
   - Pose identification (image → name)
   - Sanskrit matching
   - Benefit matching
   - Category sorting
   - Contraindication awareness

2. **Database Changes:**
   ```prisma
   model Quiz {
     id        String         @id @default(cuid())
     title     String
     category  String
     questions QuizQuestion[]
   }

   model QuizQuestion {
     id        String   @id @default(cuid())
     quizId    String
     quiz      Quiz     @relation(fields: [quizId], references: [id])
     type      String   // "multiple_choice", "matching", "image"
     question  String
     options   String[]
     answer    String
     explanation String?
   }

   model QuizAttempt {
     id        String   @id @default(cuid())
     userId    String
     quizId    String
     score     Int
     answers   Json
     createdAt DateTime @default(now())
   }
   ```

3. **Components:**
   - `components/quiz/QuizCard.tsx`
   - `components/quiz/QuestionView.tsx`
   - `components/quiz/ResultsView.tsx`

4. **Files to Create:**
   - `app/quiz/page.tsx`
   - `app/quiz/[id]/page.tsx`
   - `components/quiz/*.tsx`

---

## CATEGORY 4: PRACTICE & SESSION MANAGEMENT

### Feature 25: Live Practice Timer
**Description:** Full-screen timer mode for practicing programs with visual and audio cues.

**Implementation Plan:**
1. **Features:**
   - Full-screen mode
   - Current pose display
   - Time remaining countdown
   - Next pose preview
   - Pause/resume/skip controls
   - Audio bells for transitions
   - Keep screen awake

2. **Components:**
   - `components/timer/PracticeTimer.tsx`
   - `components/timer/TimerDisplay.tsx`
   - `components/timer/PoseTransition.tsx`
   - `components/timer/TimerControls.tsx`

3. **Audio:**
   - Bell sounds for transitions
   - Optional background music
   - Breath cue sounds

4. **Files to Create:**
   - `app/practice/[programId]/page.tsx`
   - `components/timer/*.tsx`
   - `public/sounds/*.mp3`
   - `lib/timer/engine.ts`

---

### Feature 26: Rest Day Recommendations
**Description:** Suggest gentle restorative practices on rest days based on recent activity.

**Implementation Plan:**
1. **Algorithm:**
   - Analyze last 7 days of practice
   - Identify overworked body parts
   - Suggest counter-poses
   - Recommend restorative sequences

2. **Components:**
   - `components/rest/RestDayCard.tsx`
   - `components/rest/RecoveryPoses.tsx`
   - `components/rest/BodyHeatmap.tsx`

3. **Files to Create:**
   - `app/api/rest-recommendations/route.ts`
   - `components/rest/*.tsx`
   - `lib/recovery/analyzer.ts`

---

### Feature 27: Warm-up & Cool-down Generator
**Description:** Auto-generate appropriate warm-up and cool-down sequences for any program.

**Implementation Plan:**
1. **Algorithm:**
   - Analyze program's main poses
   - Select preparatory poses
   - Add joint mobility movements
   - Generate Savasana variations

2. **Features:**
   - One-click add warm-up
   - One-click add cool-down
   - Customizable duration
   - Preview before adding

3. **Components:**
   - `components/program/WarmupGenerator.tsx`
   - `components/program/CooldownGenerator.tsx`
   - `components/program/SequencePreview.tsx`

4. **Files to Create:**
   - `app/api/generate/warmup/route.ts`
   - `app/api/generate/cooldown/route.ts`
   - `components/program/*.tsx`
   - `lib/sequence/generator.ts`

---

### Feature 28: Program Templates Library
**Description:** Pre-made program templates for common goals (morning yoga, desk stretch, etc.)

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model ProgramTemplate {
     id          String   @id @default(cuid())
     name        String
     description String
     category    String   // "morning", "evening", "office", "athletic"
     duration    Int
     difficulty  Int
     goals       String[]
     asanas      Json     // Template asana sequence
     thumbnail   String?
     featured    Boolean  @default(false)
   }
   ```

2. **Template Categories:**
   - Morning Energizer
   - Evening Relaxation
   - Desk Worker Relief
   - Pre-Run Warm-up
   - Post-Workout Recovery
   - Stress Relief
   - Better Sleep
   - Core Strength

3. **Components:**
   - `components/templates/TemplateCard.tsx`
   - `components/templates/TemplateGrid.tsx`
   - `components/templates/TemplateDetail.tsx`

4. **Files to Create:**
   - `app/templates/page.tsx`
   - `app/api/templates/route.ts`
   - `prisma/seed-templates.ts`

---

### Feature 29: Interval Training Mode
**Description:** HIIT-style interval mode alternating between active poses and rest.

**Implementation Plan:**
1. **Features:**
   - Configurable work/rest intervals
   - Round counter
   - Heart rate zone guidance
   - Intense pose selection
   - Audio motivation cues

2. **Settings:**
   - Work duration (30s - 2min)
   - Rest duration (10s - 60s)
   - Number of rounds
   - Rest poses selection

3. **Components:**
   - `components/interval/IntervalTimer.tsx`
   - `components/interval/IntervalSettings.tsx`
   - `components/interval/RoundIndicator.tsx`

4. **Files to Create:**
   - `app/practice/interval/page.tsx`
   - `components/interval/*.tsx`

---

### Feature 30: Meditation Timer & Modes
**Description:** Dedicated meditation timer with various meditation styles.

**Implementation Plan:**
1. **Meditation Types:**
   - Mindfulness (silent timer)
   - Guided (with audio)
   - Mantra (with chants)
   - Breath-focused
   - Body scan

2. **Database Changes:**
   ```prisma
   model Meditation {
     id          String @id @default(cuid())
     name        String
     type        String
     duration    Int    // seconds
     audioPath   String?
     description String
   }

   model MeditationLog {
     id           String   @id @default(cuid())
     userId       String
     meditationId String?
     duration     Int
     createdAt    DateTime @default(now())
   }
   ```

3. **Components:**
   - `components/meditation/MeditationTimer.tsx`
   - `components/meditation/MeditationPicker.tsx`
   - `components/meditation/AmbientSounds.tsx`

4. **Files to Create:**
   - `app/meditation/page.tsx`
   - `components/meditation/*.tsx`
   - `public/audio/ambient/*.mp3`

---

### Feature 31: Practice Streak System
**Description:** Gamified streak tracking to encourage daily practice.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model Streak {
     id            String   @id @default(cuid())
     userId        String   @unique
     user          User     @relation(fields: [userId], references: [id])
     currentStreak Int      @default(0)
     longestStreak Int      @default(0)
     lastPractice  DateTime?
     freezesLeft   Int      @default(2) // Monthly streak freezes
   }
   ```

2. **Features:**
   - Daily streak counter
   - Streak freeze (2 per month)
   - Streak milestones (7, 30, 100 days)
   - Streak recovery challenges
   - Calendar visualization

3. **Components:**
   - `components/streak/StreakCounter.tsx`
   - `components/streak/StreakCalendar.tsx`
   - `components/streak/StreakMilestone.tsx`

4. **Files to Create:**
   - `app/api/streak/route.ts`
   - `components/streak/*.tsx`

---

### Feature 32: Offline Mode & PWA
**Description:** Full offline functionality as a Progressive Web App.

**Implementation Plan:**
1. **Technology:**
   - Service Worker for caching
   - IndexedDB for offline data
   - next-pwa package
   - Background sync

2. **Cached Resources:**
   - All SVG illustrations
   - Program data
   - User's favorite asanas
   - Downloaded programs
   - Audio files

3. **Features:**
   - Install as app
   - Work offline
   - Sync when online
   - Download programs for offline

4. **Files to Create:**
   - `next.config.mjs` (PWA config)
   - `public/manifest.json`
   - `public/sw.js`
   - `lib/offline/sync.ts`
   - `lib/offline/storage.ts`

---

## CATEGORY 5: PROGRESS TRACKING & ANALYTICS

### Feature 33: Practice Statistics Dashboard
**Description:** Detailed analytics on practice habits, duration, and patterns.

**Implementation Plan:**
1. **Metrics:**
   - Total practice time (daily/weekly/monthly)
   - Practice frequency
   - Favorite poses
   - Category distribution
   - Time of day patterns
   - Consistency score

2. **Visualizations:**
   - Line chart (practice over time)
   - Bar chart (by category)
   - Heatmap (activity calendar)
   - Pie chart (body part focus)

3. **Technology:**
   - Recharts or Chart.js
   - React-based charts

4. **Components:**
   - `components/stats/StatsOverview.tsx`
   - `components/stats/PracticeChart.tsx`
   - `components/stats/ActivityHeatmap.tsx`
   - `components/stats/CategoryBreakdown.tsx`

5. **Files to Create:**
   - `app/stats/page.tsx`
   - `app/api/stats/route.ts`
   - `components/stats/*.tsx`

---

### Feature 34: Pose Mastery Tracking
**Description:** Track progress on individual poses from beginner to mastered.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model PoseMastery {
     id          String   @id @default(cuid())
     userId      String
     user        User     @relation(fields: [userId], references: [id])
     asanaId     String
     asana       Asana    @relation(fields: [asanaId], references: [id])
     level       Int      @default(1) // 1-5
     practiceCount Int    @default(0)
     holdDuration Int     @default(0) // max seconds held
     lastPracticed DateTime?
     @@unique([userId, asanaId])
   }
   ```

2. **Mastery Levels:**
   1. Learning - First 5 practices
   2. Practicing - 5-20 practices
   3. Comfortable - 20-50 practices
   4. Proficient - 50-100 practices
   5. Mastered - 100+ practices

3. **Components:**
   - `components/mastery/MasteryBadge.tsx`
   - `components/mastery/MasteryProgress.tsx`
   - `components/mastery/MasteryGrid.tsx`

4. **Files to Create:**
   - `app/mastery/page.tsx`
   - `components/mastery/*.tsx`
   - `app/api/mastery/route.ts`

---

### Feature 35: Flexibility Progress Tracker
**Description:** Track flexibility improvements with photo comparisons over time.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model FlexibilityLog {
     id          String   @id @default(cuid())
     userId      String
     user        User     @relation(fields: [userId], references: [id])
     asanaId     String
     asana       Asana    @relation(fields: [asanaId], references: [id])
     measurement Float?   // cm or degrees
     photoPath   String?
     notes       String?
     createdAt   DateTime @default(now())
   }
   ```

2. **Features:**
   - Photo upload for pose snapshots
   - Side-by-side comparison
   - Measurement tracking (reach distance, angle)
   - Progress timeline

3. **Components:**
   - `components/flexibility/PhotoCapture.tsx`
   - `components/flexibility/ProgressComparison.tsx`
   - `components/flexibility/MeasurementInput.tsx`

4. **Files to Create:**
   - `app/progress/flexibility/page.tsx`
   - `components/flexibility/*.tsx`
   - `app/api/flexibility/route.ts`

---

### Feature 36: Weekly/Monthly Reports
**Description:** Automated reports summarizing practice and progress.

**Implementation Plan:**
1. **Report Contents:**
   - Total practice time
   - Sessions completed
   - Streak status
   - Top poses practiced
   - Body areas focused
   - Goals progress
   - Recommendations

2. **Delivery:**
   - In-app report page
   - Email summary (optional)
   - PDF export

3. **Components:**
   - `components/reports/WeeklyReport.tsx`
   - `components/reports/ReportChart.tsx`
   - `components/reports/Insights.tsx`

4. **Files to Create:**
   - `app/reports/page.tsx`
   - `app/api/reports/generate/route.ts`
   - `lib/reports/generator.ts`

---

### Feature 37: Body Part Focus Map
**Description:** Visual body map showing which areas have been worked recently.

**Implementation Plan:**
1. **Visualization:**
   - SVG body outline (front and back)
   - Color intensity based on focus
   - Click to see poses for each area
   - Balance indicator

2. **Components:**
   - `components/bodymap/BodyMap.tsx`
   - `components/bodymap/BodyPart.tsx`
   - `components/bodymap/FocusLegend.tsx`

3. **Files to Create:**
   - `public/body/body-front.svg`
   - `public/body/body-back.svg`
   - `components/bodymap/*.tsx`
   - `lib/bodymap/analyzer.ts`

---

### Feature 38: Achievement System
**Description:** Unlockable achievements for milestones and challenges.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model Achievement {
     id          String @id @default(cuid())
     key         String @unique
     name        String
     description String
     icon        String
     category    String // "streak", "mastery", "exploration"
     requirement Json   // Condition to unlock
   }

   model UserAchievement {
     id            String      @id @default(cuid())
     userId        String
     user          User        @relation(fields: [userId], references: [id])
     achievementId String
     achievement   Achievement @relation(fields: [achievementId], references: [id])
     unlockedAt    DateTime    @default(now())
     @@unique([userId, achievementId])
   }
   ```

2. **Achievement Examples:**
   - First Practice
   - 7-Day Streak
   - 30-Day Warrior
   - Pose Collector (try all poses)
   - Early Bird (morning practices)
   - Night Owl (evening practices)
   - Balanced Practitioner (all categories)

3. **Components:**
   - `components/achievements/AchievementCard.tsx`
   - `components/achievements/AchievementGrid.tsx`
   - `components/achievements/UnlockAnimation.tsx`

4. **Files to Create:**
   - `app/achievements/page.tsx`
   - `components/achievements/*.tsx`
   - `lib/achievements/checker.ts`

---

## CATEGORY 6: SOCIAL & COMMUNITY

### Feature 39: Program Sharing
**Description:** Share programs with unique links and social media.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model SharedProgram {
     id          String   @id @default(cuid())
     programId   String
     program     Program  @relation(fields: [programId], references: [id])
     shareCode   String   @unique // Short URL code
     isPublic    Boolean  @default(true)
     views       Int      @default(0)
     copies      Int      @default(0)
     createdAt   DateTime @default(now())
   }
   ```

2. **Features:**
   - Generate share link
   - Social media buttons (Twitter, Facebook, WhatsApp)
   - QR code generation
   - View/copy counts
   - Make private option

3. **Components:**
   - `components/share/ShareModal.tsx`
   - `components/share/SocialButtons.tsx`
   - `components/share/QRCode.tsx`

4. **Files to Create:**
   - `app/shared/[code]/page.tsx`
   - `app/api/share/route.ts`
   - `components/share/*.tsx`

---

### Feature 40: Community Program Gallery
**Description:** Browse and copy programs shared by the community.

**Implementation Plan:**
1. **Features:**
   - Browse public programs
   - Filter by goal/duration/difficulty
   - Sort by popularity/recent
   - Copy to own library
   - Feature staff picks

2. **Components:**
   - `components/community/ProgramGallery.tsx`
   - `components/community/ProgramFilters.tsx`
   - `components/community/CopyButton.tsx`

3. **Pages:**
   - `/community` - Gallery home
   - `/community/program/[id]` - Program detail

4. **Files to Create:**
   - `app/community/page.tsx`
   - `app/community/program/[id]/page.tsx`
   - `components/community/*.tsx`

---

### Feature 41: Pose Ratings & Reviews
**Description:** Rate and review asanas to help others.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model AsanaReview {
     id        String   @id @default(cuid())
     userId    String
     user      User     @relation(fields: [userId], references: [id])
     asanaId   String
     asana     Asana    @relation(fields: [asanaId], references: [id])
     rating    Int      // 1-5 stars
     review    String?
     helpful   Int      @default(0)
     createdAt DateTime @default(now())
     @@unique([userId, asanaId])
   }
   ```

2. **Components:**
   - `components/reviews/StarRating.tsx`
   - `components/reviews/ReviewForm.tsx`
   - `components/reviews/ReviewList.tsx`

3. **Files to Create:**
   - `app/api/reviews/route.ts`
   - `components/reviews/*.tsx`

---

### Feature 42: Instructor Profiles
**Description:** Featured instructor profiles with their recommended programs.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model Instructor {
     id          String    @id @default(cuid())
     name        String
     bio         String
     photoUrl    String?
     credentials String[]
     specialties String[]
     socialLinks Json
     programs    Program[]
     featured    Boolean   @default(false)
   }
   ```

2. **Components:**
   - `components/instructors/InstructorCard.tsx`
   - `components/instructors/InstructorProfile.tsx`
   - `components/instructors/InstructorPrograms.tsx`

3. **Pages:**
   - `/instructors` - Instructor listing
   - `/instructors/[id]` - Profile page

4. **Files to Create:**
   - `app/instructors/page.tsx`
   - `app/instructors/[id]/page.tsx`
   - `components/instructors/*.tsx`

---

### Feature 43: Practice Challenges
**Description:** Time-limited community challenges (30-day yoga challenge).

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model Challenge {
     id           String              @id @default(cuid())
     name         String
     description  String
     startDate    DateTime
     endDate      DateTime
     type         String              // "daily", "weekly", "total"
     goal         Int                 // sessions/minutes required
     programId    String?             // Optional linked program
     participants ChallengeParticipant[]
   }

   model ChallengeParticipant {
     id          String    @id @default(cuid())
     challengeId String
     challenge   Challenge @relation(fields: [challengeId], references: [id])
     userId      String
     user        User      @relation(fields: [userId], references: [id])
     progress    Int       @default(0)
     completed   Boolean   @default(false)
     joinedAt    DateTime  @default(now())
     @@unique([challengeId, userId])
   }
   ```

2. **Features:**
   - Browse active challenges
   - Join challenge
   - Track progress
   - Leaderboard
   - Completion badges

3. **Components:**
   - `components/challenges/ChallengeCard.tsx`
   - `components/challenges/ChallengeProgress.tsx`
   - `components/challenges/Leaderboard.tsx`

4. **Files to Create:**
   - `app/challenges/page.tsx`
   - `app/challenges/[id]/page.tsx`
   - `components/challenges/*.tsx`

---

### Feature 44: Friend System & Activity Feed
**Description:** Connect with friends and see their practice activity.

**Implementation Plan:**
1. **Database Changes:**
   ```prisma
   model Friendship {
     id          String   @id @default(cuid())
     userId      String
     user        User     @relation("UserFriends", fields: [userId], references: [id])
     friendId    String
     friend      User     @relation("FriendOf", fields: [friendId], references: [id])
     status      String   // "pending", "accepted"
     createdAt   DateTime @default(now())
     @@unique([userId, friendId])
   }

   model ActivityFeed {
     id        String   @id @default(cuid())
     userId    String
     user      User     @relation(fields: [userId], references: [id])
     type      String   // "practice", "achievement", "streak"
     data      Json
     createdAt DateTime @default(now())
   }
   ```

2. **Features:**
   - Send/accept friend requests
   - View friends' activity
   - Privacy controls
   - Cheer/encourage friends

3. **Components:**
   - `components/social/FriendsList.tsx`
   - `components/social/ActivityFeed.tsx`
   - `components/social/FriendRequest.tsx`

4. **Files to Create:**
   - `app/friends/page.tsx`
   - `app/api/friends/route.ts`
   - `components/social/*.tsx`

---

## CATEGORY 7: ACCESSIBILITY & INTERNATIONALIZATION

### Feature 45: Multi-Language Support
**Description:** Full app translation in multiple languages.

**Implementation Plan:**
1. **Languages:**
   - English (default)
   - Spanish
   - Hindi
   - French
   - German
   - Japanese
   - Portuguese

2. **Technology:**
   - next-intl or react-i18next
   - Locale-based routing
   - RTL support for Arabic

3. **Translation Scope:**
   - UI strings
   - Pose names (keep Sanskrit)
   - Descriptions
   - Instructions

4. **Files to Create:**
   - `messages/en.json`
   - `messages/es.json`
   - `messages/hi.json`
   - `lib/i18n.ts`
   - `middleware.ts` (locale detection)

---

### Feature 46: Screen Reader Optimization
**Description:** Full ARIA support and screen reader compatibility.

**Implementation Plan:**
1. **Improvements:**
   - Semantic HTML throughout
   - ARIA labels on all interactive elements
   - Skip navigation links
   - Focus management
   - Keyboard navigation
   - Image alt texts

2. **Testing:**
   - VoiceOver (macOS/iOS)
   - NVDA (Windows)
   - TalkBack (Android)

3. **Files to Modify:**
   - All component files (add ARIA)
   - `components/accessibility/SkipLink.tsx`
   - `lib/accessibility/announcer.ts`

---

### Feature 47: High Contrast & Color Blind Modes
**Description:** Alternative color themes for visual accessibility.

**Implementation Plan:**
1. **Modes:**
   - High contrast (black/white)
   - Deuteranopia (red-green)
   - Protanopia (red-green)
   - Tritanopia (blue-yellow)

2. **Implementation:**
   - CSS custom properties
   - Theme context
   - Persist preference

3. **Components:**
   - `components/accessibility/ThemeToggle.tsx`
   - `components/accessibility/ColorModeSelector.tsx`

4. **Files to Create:**
   - `styles/themes/high-contrast.css`
   - `styles/themes/colorblind.css`
   - `context/ThemeContext.tsx`

---

### Feature 48: Voice Control
**Description:** Navigate and control the app with voice commands.

**Implementation Plan:**
1. **Technology:**
   - Web Speech API (SpeechRecognition)
   - Command matching

2. **Commands:**
   - "Start practice"
   - "Next pose"
   - "Pause"
   - "Show [pose name]"
   - "Go to programs"
   - "Search [query]"

3. **Components:**
   - `components/voice/VoiceControl.tsx`
   - `components/voice/VoiceIndicator.tsx`
   - `components/voice/CommandHelp.tsx`

4. **Files to Create:**
   - `lib/voice/recognition.ts`
   - `lib/voice/commands.ts`
   - `components/voice/*.tsx`

---

## CATEGORY 8: INTEGRATIONS & EXPORT

### Feature 49: Calendar Integration
**Description:** Sync practice schedule with Google/Apple Calendar.

**Implementation Plan:**
1. **Features:**
   - Export scheduled practices to calendar
   - ICS file download
   - Google Calendar API integration
   - Apple Calendar support
   - Recurring events

2. **Technology:**
   - Google Calendar API
   - ICS file generation

3. **Components:**
   - `components/calendar/CalendarSync.tsx`
   - `components/calendar/SchedulePicker.tsx`
   - `components/calendar/ExportButton.tsx`

4. **Files to Create:**
   - `app/api/calendar/export/route.ts`
   - `lib/calendar/ics.ts`
   - `lib/calendar/google.ts`

---

### Feature 50: Health App Integration
**Description:** Sync practice data with Apple Health, Google Fit, and fitness wearables.

**Implementation Plan:**
1. **Platforms:**
   - Apple Health (HealthKit)
   - Google Fit
   - Fitbit
   - Garmin
   - Strava

2. **Data Synced:**
   - Workout duration
   - Calories burned (estimated)
   - Mindful minutes
   - Heart rate (if available)

3. **Technology:**
   - OAuth for each platform
   - Platform-specific APIs
   - Background sync

4. **Components:**
   - `components/integrations/HealthConnect.tsx`
   - `components/integrations/IntegrationCard.tsx`
   - `components/integrations/SyncStatus.tsx`

5. **Files to Create:**
   - `app/settings/integrations/page.tsx`
   - `app/api/integrations/[provider]/route.ts`
   - `lib/integrations/apple-health.ts`
   - `lib/integrations/google-fit.ts`

---

# IMPLEMENTATION PRIORITY

## Phase 1: Foundation (Features 9, 11, 14, 15, 25)
User auth, dashboard, favorites, journal, practice timer

## Phase 2: AI Core (Features 1, 2, 4, 6)
Chatbot, AI programs, voice guidance, recommendations

## Phase 3: Learning (Features 17, 18, 22, 24)
Tutorials, pronunciation, videos, quizzes

## Phase 4: Progress (Features 31, 33, 34, 38)
Streaks, stats, mastery, achievements

## Phase 5: Social (Features 39, 40, 43, 44)
Sharing, community, challenges, friends

## Phase 6: Advanced AI (Features 3, 5, 7, 8)
Camera pose check, breathing, NLP search, safety

## Phase 7: Polish (Features 45, 46, 47, 48, 49, 50)
i18n, accessibility, integrations

---

# TECHNICAL DEPENDENCIES

```json
{
  "ai": ["openai", "@anthropic-ai/sdk"],
  "auth": ["next-auth", "@prisma/client"],
  "camera": ["@tensorflow/tfjs", "@tensorflow-models/pose-detection"],
  "charts": ["recharts", "react-chartjs-2"],
  "3d": ["three", "@react-three/fiber", "@react-three/drei"],
  "pwa": ["next-pwa", "workbox"],
  "i18n": ["next-intl"],
  "calendar": ["ical-generator"],
  "voice": ["react-speech-recognition"]
}
```
