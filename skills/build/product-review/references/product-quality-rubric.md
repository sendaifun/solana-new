# Product Quality Rubric — 8-Dimension Evaluation

Use this framework to evaluate any crypto product's quality. Score each dimension 1-10 with specific evidence. Be balanced — note strengths and weaknesses.

## Dimensions

### 1. Onboarding Flow

How quickly does a new user reach the core value? What's the path from landing page to first meaningful action?

**Evaluate**:
- Time from first visit to understanding the product (< 5 seconds is ideal)
- Steps from landing to first meaningful action
- Wallet connection friction (required upfront vs. deferred)
- Explanation quality for crypto concepts
- Progressive disclosure (value preview before commitment)

**Scoring**:
- **1-3**: Confusing, no clear path, wallet required before any value, jargon-heavy
- **4-6**: Path exists but has friction, some steps are unclear, decent explanations
- **7-8**: Smooth flow, clear value prop, wallet deferred until needed, good help text
- **9-10**: Exceptional onboarding, delightful first experience, guided tour, instant value

### 2. Core Experience

Does the main feature work well? Is it fast, intuitive, and satisfying?

**Evaluate**:
- Does the primary use case work end-to-end?
- Is the interaction intuitive or does it require documentation?
- Response time for core actions
- Feedback quality (did the action succeed? what changed?)
- Does it deliver on the value proposition?

**Scoring**:
- **1-3**: Core feature broken, extremely slow, or confusing
- **4-6**: Works but clunky, some friction, feedback is poor
- **7-8**: Smooth core experience, good feedback, delivers on promise
- **9-10**: Exceptional — fast, intuitive, satisfying, exceeds expectations

### 3. Error Handling

What happens when things go wrong? Does the user know what to do?

**Evaluate**:
- Transaction failure messages (human-readable vs. raw error codes)
- Recovery guidance (what to try next)
- Network error handling (RPC down, connection lost)
- Input validation (bad addresses, amounts exceeding balance)
- Edge cases (zero balance, empty states, rate limits)

**Scoring**:
- **1-3**: Crashes, silent failures, raw error codes, no recovery guidance
- **4-6**: Shows errors but messages are vague, some recovery options
- **7-8**: Clear error messages, good recovery guidance, graceful degradation
- **9-10**: Anticipates errors, prevents them where possible, excellent recovery

### 4. Information Architecture

Is the navigation clear? Can users find what they need?

**Evaluate**:
- Navigation structure (flat vs. deep, discoverable vs. hidden)
- Page hierarchy (clear headings, logical grouping)
- Search/filter functionality where needed
- Breadcrumbs or back navigation
- Content density (too much on one page vs. too many clicks)

**Scoring**:
- **1-3**: Lost immediately, can't find key features, navigation is confusing
- **4-6**: Findable with effort, some pages too dense or too sparse
- **7-8**: Clear navigation, logical structure, easy to find things
- **9-10**: Intuitive IA, everything exactly where expected, great search

### 5. Visual Design & Polish

Does it look professional? Is it consistent?

**Evaluate**:
- Visual consistency (spacing, typography, colors)
- Professional appearance (does it inspire trust?)
- Responsive design (mobile, tablet, desktop)
- Dark/light mode handling
- Micro-interactions (hover states, transitions, loading animations)

**Scoring**:
- **1-3**: Looks unfinished, inconsistent styling, broken on mobile
- **4-6**: Acceptable but generic, some inconsistencies, mostly responsive
- **7-8**: Professional, consistent, responsive, good attention to detail
- **9-10**: Beautiful, distinctive, polished, delightful micro-interactions

### 6. Performance

Is it fast? Does it respect the user's time?

**Evaluate**:
- Initial page load time (< 2 seconds ideal)
- Transaction confirmation speed and feedback
- Data freshness (real-time vs. stale)
- Loading states (informative vs. empty spinners)
- Performance on slower connections

**Scoring**:
- **1-3**: Slow page loads, no loading states, stale data, freezes
- **4-6**: Acceptable speed but some slow spots, basic loading states
- **7-8**: Fast, real-time data, good loading states, consistent performance
- **9-10**: Instant feel, optimistic updates, real-time everywhere, performant on all connections

### 7. Accessibility

Can everyone use this product?

**Evaluate**:
- Mobile usability (touch targets, responsive layout)
- Screen reader compatibility
- Keyboard navigation
- Color contrast and readability
- Font sizes and scaling
- Internationalization readiness

**Scoring**:
- **1-3**: Desktop-only, no keyboard nav, poor contrast, tiny text
- **4-6**: Mobile works but awkward, basic accessibility, readable
- **7-8**: Good mobile experience, keyboard navigable, accessible colors
- **9-10**: Fully accessible, excellent mobile, WCAG compliant, i18n ready

### 8. Feature Completeness

Does it do everything the target user needs?

**Evaluate**:
- Core features present and working
- Missing features that competitors have
- Features that would make users switch from alternatives
- Settings/customization where needed
- Integration with ecosystem (wallets, other protocols, explorers)

**Scoring**:
- **1-3**: Missing critical features, feels like a demo, not usable for real tasks
- **4-6**: Core features work but gaps exist, some workarounds needed
- **7-8**: Complete for the core use case, good ecosystem integration
- **9-10**: Feature-complete, covers edge cases, better than alternatives

## Overall Score Calculation

Average of all 8 dimensions, rounded to one decimal.

| Overall Score | Verdict |
|---------------|---------|
| 9-10 | Exceptional — polish and scale |
| 7-8 | Strong — fix the gaps and you're competitive |
| 5-6 | Needs work — focus on the lowest-scoring dimensions |
| 3-4 | Significant issues — prioritize the top 3 improvements |
| 1-2 | Not ready — fundamental rethink needed |
