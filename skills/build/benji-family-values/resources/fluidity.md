# Fluidity

Fluidity means the interface feels continuous rather than fragmented. Users should feel guided through change, not teleported between unrelated states.

## Main Principle

Any element can transform into another if the transition has a clear rationale and preserves orientation.

## Physical-Space Model

Treat the product as if it obeys stable physical rules:

- direction should mean something
- depth should mean something
- entry and exit should have logic
- elements that persist should behave like the same object across states

If a transition cannot be explained spatially or semantically, it probably should not exist in an expressive form.

## What Motion Should Explain

Good motion should help the user understand:

- where they came from
- where they are going
- what changed
- whether an action became more committed or more reversible
- where a pending or completed state can now be found

## Strong Patterns

### Directional transitions

If the destination has spatial meaning, the motion should reflect that meaning. Lateral moves should feel lateral. Forward progression should feel forward.

### Morphing persistent elements

If a control, card, or label exists before and after a transition, keep it continuous where possible instead of fading out one version and fading in another.

### Semantic text transitions

When a label changes from one intent to another, especially in critical flows, let the change feel authored. This helps the user notice the shift in meaning.

### Continuity of destination indicators

When an action creates a pending state elsewhere, show how the result travels to that destination. This increases comprehension and trust.

## Avoid Redundant Animation

Do not duplicate an on-screen object just to animate it. If the same object persists conceptually, preserve its identity.

Redundant duplication weakens continuity and makes motion feel ornamental.

## Trust-Sensitive Flows

Fluidity matters most when:

- money is moving
- irreversible actions are being confirmed
- state changes have consequences
- onboarding asks for commitment or trust

In these moments, continuity functions as reassurance. The user should be able to see that the app understands the action they are taking.

## Practical Implementation Guidance

When specifying or reviewing a transition:

1. Name the origin state.
2. Name the destination state.
3. List which elements persist.
4. List which elements change meaning.
5. Decide what the motion needs to communicate.
6. Remove any animation that does not serve that communication goal.

## Small Details Matter

Fluidity is cumulative. Tiny transitions compound:

- directional flashes on tab changes
- icon orientation changes
- evolving button text
- stable sentence fragments in empty states
- cards traveling between views

A product does not feel fluid because of one impressive animation. It feels fluid because discontinuity is repeatedly avoided.

## Failure Modes

- static swaps that hide meaningful state changes
- expressive motion with no semantic purpose
- duplicated elements during transitions
- disconnected screens that feel like separate apps
- abrupt label changes in critical steps
- inconsistent navigation logic across similar flows

## Review Prompts

- What should visibly carry across the boundary between these states?
- Does the transition clarify commitment, hierarchy, or direction?
- Would removing this motion make the action harder to understand?
- Does this flow feel like movement through one system or jumping between fragments?
