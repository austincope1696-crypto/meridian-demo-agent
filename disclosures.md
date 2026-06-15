# Compliance & Disclosure Notes

## TCPA / AI Voice Consent
This is an **inbound demo line**. Callers initiate contact — the FCC's AI-voice consent rules
for *outbound* calls do not apply here. Do NOT repurpose Savannah for cold outbound dialing of
consumers without prior express written consent. That is a separate, regulated build.

## AI Disclosure
Savannah self-discloses as an AI if directly asked. This is current best practice and keeps us
ahead of emerging state laws (CA, CO, IL) trending toward mandatory AI disclosure. No action
needed — already baked into the prompt.

## HIPAA / Health Businesses
Any dental, medical, or health-adjacent client requires:
1. A signed Business Associate Agreement (BAA) before deployment.
2. A HIPAA-compliant tech stack review (Vapi + storage layer).
3. No PHI stored in call logs without appropriate safeguards.
Savannah is trained to route health-business prospects to the discovery call rather than
promise a plug-and-play setup.

## State AI-Disclosure Tracker (stub — update as laws pass)
| State | Status | Requirement |
|-------|--------|-------------|
| CA    | Pending | Disclose AI in real-time voice interactions |
| CO    | Pending | Similar to CA |
| IL    | Pending | Similar to CA |
| TX    | No law  | — |
| FL    | No law  | — |

Savannah's self-disclosure already satisfies anticipated requirements in all states above.
