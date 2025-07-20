# ADL Tracker Feature Implementation Specification

## Project Context
CnaGenius.com is a healthcare documentation platform that helps CNAs (Certified Nursing Assistants) create professional incident reports. We're expanding to include daily care documentation features, starting with an ADL (Activities of Daily Living) tracker.

## Feature Overview: ADL Tracker

### What are ADLs?
Activities of Daily Living (ADLs) are basic self-care tasks that CNAs must document for every patient, multiple times per day. These include:
- **Bathing/Personal Hygiene** - Showering, brushing teeth, grooming
- **Dressing** - Getting dressed, assistance level needed
- **Eating/Nutrition** - Meal consumption, assistance required
- **Mobility** - Walking, transferring, wheelchair use
- **Toileting** - Bathroom assistance, continence status
- **Communication** - Patient interactions, cognitive status

### Business Problem
CNAs spend 40-60% of their time on documentation. Current ADL documentation is:
- Time-consuming (paper forms or clunky software)
- Repetitive (same patient info entered multiple times)
- Error-prone (handwriting, lost forms)
- Disconnected from other systems

### Solution Goals
1. **Speed**: Reduce ADL documentation time by 70%
2. **Accuracy**: AI-assisted entries reduce errors
3. **Compliance**: Auto-generate Medicare-compliant reports
4. **Mobile-first**: Works on phones/tablets at bedside
5. **Integration**: Connects with existing incident reporting system

## Technical Requirements

### Database Schema Changes

Create new tables in your existing PostgreSQL database:

```sql
-- Patients table
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  admission_date DATE NOT NULL,
  care_level VARCHAR(50) NOT NULL, -- skilled, assisted, independent
  dietary_restrictions TEXT,
  mobility_aids TEXT, -- wheelchair, walker, etc.
  cognitive_status VARCHAR(50), -- alert, confused, dementia
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADL Categories table
CREATE TABLE adl_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- bathing, dressing, eating, etc.
  description TEXT,
  required_fields JSON, -- specific fields for each category
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ADL Entries table  
CREATE TABLE adl_entries (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  cna_name VARCHAR(255) NOT NULL,
  shift_type VARCHAR(50) NOT NULL, -- morning, day, evening, night
  entry_date DATE NOT NULL,
  entry_time TIME NOT NULL,
  category_id INTEGER REFERENCES adl_categories(id),
  assistance_level VARCHAR(50) NOT NULL, -- independent, supervision, minimal_assist, moderate_assist, maximum_assist, total_dependence
  completion_percentage INTEGER, -- 0-100 for eating, bathing, etc.
  notes TEXT,
  patient_response TEXT, -- what patient said or did
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily ADL Summary table (for reports)
CREATE TABLE daily_adl_summaries (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  summary_date DATE NOT NULL,
  cna_name VARCHAR(255) NOT NULL,
  shift_type VARCHAR(50) NOT NULL,
  generated_summary TEXT, -- AI-generated daily summary
  total_entries INTEGER,
  flags JSON, -- any concerns or alerts
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

Add these routes to your existing Express server (`server/routes.ts`):

```typescript
// GET /api/patients - List all patients for current facility
// GET /api/patients/:id - Get specific patient details
// POST /api/patients - Add new patient
// PUT /api/patients/:id - Update patient information

// GET /api/adl-categories - List all ADL categories
// POST /api/adl-entries - Create new ADL entry
// GET /api/adl-entries/patient/:patientId/date/:date - Get day's entries for patient
// PUT /api/adl-entries/:id - Update existing entry
// DELETE /api/adl-entries/:id - Delete entry

// POST /api/adl-summary/generate - Generate AI summary for patient/date
// GET /api/adl-summary/patient/:patientId/date/:date - Get daily summary
```

### Frontend Components

Create these new React components in `client/src/components/adl/`:

#### 1. ADLDashboard.tsx
- Main landing page for ADL features
- Patient list with quick status indicators
- Shift handoff summary
- Navigation to other ADL features

#### 2. PatientSelector.tsx  
- Searchable patient list
- Filter by room, care level, etc.
- Show pending ADL tasks for each patient

#### 3. ADLQuickEntry.tsx
- Mobile-optimized quick entry form
- Touch-friendly buttons for common values
- Voice input integration (future)
- Offline capability

#### 4. ADLDetailEntry.tsx
- Detailed entry form for complex situations
- Text area for detailed notes
- Photo upload capability (future)
- Patient response recording

#### 5. DailySummary.tsx
- AI-generated summary of day's ADL activities
- Export to PDF capability
- Share with supervisors
- Compliance checker

## User Experience Flow

### Primary Workflow: Quick ADL Entry
1. **Patient Selection**: CNA opens app, selects patient from list
2. **Category Selection**: Choose ADL category (bathing, eating, etc.)
3. **Quick Entry**: Tap assistance level, completion percentage
4. **Optional Notes**: Add brief notes if needed
5. **Save & Next**: Auto-saves, moves to next patient or ADL

### Secondary Workflow: Detailed Entry
1. **Access from Dashboard**: "Detailed Entry" button
2. **Full Form**: Complete form with all fields
3. **Patient Response**: Record what patient said/did
4. **Review**: Preview AI-generated summary
5. **Submit**: Save with timestamp

### Reporting Workflow
1. **Generate Summary**: AI creates daily summary
2. **Review**: CNA reviews for accuracy
3. **Export**: PDF or print for records
4. **Share**: Send to supervisor/nurse

## Integration Points

### Existing Codebase Integration
- **Reuse Authentication**: Same user system as incident reports
- **Shared UI Components**: Use existing Shadcn/UI components
- **Database Connection**: Use existing Drizzle ORM setup
- **AI Integration**: Extend existing OpenAI integration

### New AI Prompts for OpenAI

Add to `server/openai.ts`:

```typescript
export async function generateADLSummary(adlEntries: any[]): Promise<string> {
  const prompt = `Generate a professional daily ADL summary for a nursing home patient based on these entries:
  
  ${adlEntries.map(entry => 
    `${entry.category}: ${entry.assistance_level}, ${entry.completion_percentage}% complete. Notes: ${entry.notes}`
  ).join('\n')}
  
  Create a paragraph summarizing the patient's ADL performance, assistance needs, and any concerns. Use professional healthcare terminology.`;
  
  // Implementation similar to existing generateReport function
}
```

## Mobile Optimization Requirements

### Touch-Friendly Design
- Minimum 44px touch targets
- Large, clear buttons
- Swipe gestures for navigation
- Pull-to-refresh functionality

### Offline Capability
- Store entries locally when offline
- Sync when connection restored
- Visual indicators for sync status
- Conflict resolution for simultaneous edits

### Performance Optimization
- Lazy loading for patient lists
- Image compression for photos
- Efficient caching strategies
- Background sync capabilities

## Compliance & Security

### HIPAA Compliance
- Encrypted data transmission
- Audit logging for all actions
- Session timeouts
- No PHI in URLs or logs

### Medicare Documentation Requirements
- Timestamp all entries
- Digital signatures where required
- Retention policies
- Export capabilities for audits

## Testing Requirements

### Unit Tests
- ADL entry validation
- AI summary generation
- Patient data handling
- Date/time calculations

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flow
- Report generation

### User Acceptance Tests
- Mobile device testing
- Workflow timing tests
- Error handling scenarios
- Accessibility compliance

## Implementation Priority

### Phase 1: Core Functionality (Week 1-2)
1. Database schema implementation
2. Basic API endpoints
3. Patient management
4. Simple ADL entry form

### Phase 2: Enhanced UX (Week 3)
1. Mobile optimization
2. Quick entry interface
3. AI summary generation
4. Basic reporting

### Phase 3: Advanced Features (Week 4)
1. Offline capability
2. Advanced reporting
3. Export functionality
4. Performance optimization

## Success Metrics

### Technical Metrics
- Page load time < 2 seconds
- 99% uptime
- < 100ms API response times
- Successful offline sync rate > 95%

### User Experience Metrics
- Time to complete ADL entry < 30 seconds
- User satisfaction score > 4.5/5
- Error rate < 1%
- Mobile usage > 70%

### Business Metrics
- 70% reduction in documentation time
- 90% accuracy in AI summaries
- 50% increase in user engagement
- Medicare compliance rate 100%

## Technical Notes for Implementation

1. **Use existing TypeScript setup** - Maintain type safety throughout
2. **Follow existing code patterns** - Match current architectural style
3. **Reuse UI components** - Leverage Shadcn/UI component library
4. **Mobile-first approach** - Design for phones, enhance for desktop
5. **Progressive enhancement** - Core functionality works without JavaScript

## Files to Create/Modify

### New Files
- `client/src/components/adl/` (entire directory)
- `client/src/pages/ADLDashboard.tsx`
- `server/routes/adl.ts`
- `server/routes/patients.ts`
- `shared/adl-schema.ts`

### Modified Files
- `server/routes.ts` (add new route imports)
- `server/db.ts` (add new table schemas)
- `client/src/App.tsx` (add new routes)
- `server/openai.ts` (add ADL summary function)

## Questions for Clarification

Before implementing, please confirm:
1. Should we support multiple facilities/organizations?
2. What's the preferred photo storage solution?
3. Are there specific Medicare documentation templates to follow?
4. Should voice input be included in Phase 1?
5. What level of offline functionality is required?

This specification provides a comprehensive foundation for implementing the ADL Tracker feature while maintaining consistency with the existing CnaGenius.com platform.