# PRD Quality Rules — R5: No Filler (P0 — same as OD's anti-slop)

Never pad a PRD with:

- Lorem ipsum or placeholder text
- Fictional metrics ("3× faster", "10× more productive")
- Generic filler like "the system shall be robust and scalable"
- Requirements that sound important but lack testability
- "Feature One / Feature Two" / "Feature A / Feature B" placeholder names
- "TBD" without a concrete plan for when it will be determined

## When you don't have a real value

Leave an honest placeholder: `[NEEDS CLARIFICATION — ask user]` or `—` (em dash). An honest gap is better than a fabricated number.

## Linter patterns

```
/\bfeature\s+(one|two|three|1|2|3)\b/i        — placeholder names
/\blorem\s+ipsum\b/i                            — dummy text
/\bdolor\s+sit\s+amet\b/i                       — dummy text
/\bplaceholder\s+text\b/i                       — self-explanatory
/\bTBD\b/i                                       — unresolved placeholder
/\b3×\s+faster\b/i                              — invented metric
/\b10×\s+(faster|better|easier|more)\b/i        — invented metric
/\b99\.\d+%\s+uptime\b/i                        — invented metric
/\bthe system shall be robust/i                  — filler
```