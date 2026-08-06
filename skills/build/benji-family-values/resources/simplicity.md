# Simplicity

Simplicity here means reducing cognitive load without reducing capability. The interface should feel easy to enter, while still supporting depth when the user needs it.

## Main Principle

Keep the essentials immediately available. Reveal everything else only when it becomes relevant to the current decision.

## Gradual Revelation

Use progressive disclosure when:

- the flow has many branches or edge cases
- the user needs context before committing
- a warning or confirmation should appear at the moment of action
- the full feature set would overwhelm a newcomer

Avoid progressive disclosure when:

- the hidden information is required to understand the current screen
- the user needs persistent side-by-side comparison
- repeated access to the same controls would become tedious

## Dynamic Tray Pattern

The article's tray system generalizes into a broader pattern for contextual overlays, sheets, drawers, trays, or compact step surfaces.

Use a tray-like surface when:

- the action is transient
- the user should remain anchored to the originating screen
- the step is a confirmation, warning, explanation, checklist, or short decision
- the flow benefits from feeling lightweight rather than like a full commitment

Escalate to a full screen when:

- the task needs sustained focus
- the content is dense enough that compact framing harms clarity
- the user must edit or inspect substantial information
- the flow has outgrown a transient surface

## Tray Rules

- One tray should carry one main idea or one main action.
- Users should be able to tell where the tray came from.
- Consecutive trays should feel distinct enough that progression is obvious.
- Titles should orient the user instantly.
- The leading control should clearly mean either dismiss or back.
- Visual theme can adapt to local context if that strengthens continuity.
- Trays should be allowed to lead into larger flows when necessary.

## Why This Works

Context preservation matters. A full-screen jump often makes the user feel displaced. A contextual surface lets the user act without losing the mental connection to where the action started.

Compact steps also change the emotional cost of a task. A short contextual step feels easier to begin than a new full-screen commitment.

## Applied Guidance

When redesigning a complex flow:

1. List everything currently shown at once.
2. Mark which items are necessary for the first decision.
3. Move secondary choices, edge cases, and explanations into later contextual steps.
4. Ensure each step has a clear title and a single focal action.
5. Check that the user never loses sight of their origin or current stage.

## Failure Modes

- Too many options in one transient surface
- Hidden information that should have been visible earlier
- Trays that feel arbitrary rather than contextual
- Steps that are visually too similar to distinguish
- Compact surfaces used for tasks that actually need a real workspace

## Review Prompts

- What is the smallest useful first step?
- Which options can appear later with no loss of understanding?
- Does the current flow intimidate because it looks bigger than it is?
- Would a contextual surface preserve trust better than a screen replacement?
