# PRD Quality Rules — R6: Dependencies Are Concrete (P2)

Every dependency MUST name:

1. The external system/team
2. The specific thing needed (API endpoint, design spec, migration, sign-off)
3. What happens if it's not ready (fallback, delay, scope cut)

## Required format

```
## N. Dependencies & Risks

### Internal Dependencies
| Dependency | Owner Team | What's Needed | Fallback if Not Ready |
|---|---|---|---|
| Authentication service | Platform team | OAuth 2.0 endpoint for Google/GitHub | Use mock auth for MVP, defer social login |
| Design system | Design team | Button, form, modal components | Use unstyled HTML, apply design later |

### External Dependencies
| Dependency | Provider | What's Needed | Fallback if Not Ready |
|---|---|---|---|
| Payment processing | Stripe | API keys, webhook setup | Use Stripe test mode for MVP |
| Email delivery | SendGrid | API key, template approval | Use console.log for MVP, add email later |

### Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Stripe API changes | Low | High | Pin API version, monitor changelog |
| GDPR compliance delay | Medium | High | Engage legal team by Sprint 2 |
```

## Anti-patterns

- ❌ "Depends on the backend team" — too vague
- ❌ "Needs design review" — by whom? by when? what if not done?
- ❌ "External API" — which API? what endpoint? what fallback?

## Linter check

```
if "depends on" without a specific name → P2: "Name the dependency concretely"
if "external API" without endpoint → P2: "Specify the API endpoint"
```