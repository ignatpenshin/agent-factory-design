# Agent Factory Designer

**One-liner:** Pick your agent role → get the best open-source model → see the GPU config. Done.

---

## Problem

Every team building multi-agent systems asks the same three questions:
1. What roles do I need?
2. Which model for each role?
3. How many GPUs do I need?

Today you spend weeks researching across HuggingFace, LMSYS Arena, Reddit, and docs. No single tool connects roles → models → hardware.

## Solution

An interactive configurator that maps **agent roles** to **benchmark-matched open-source LLMs** to **GPU deployment layouts** — in one place.

### Three layers, one tool:

```
[9 Agent Roles] → [30+ Ranked Models] → [GPU Layout Export]
 Orchestrator       Qwen3.5-397B          "4x A100: here's
 Builder            Qwen2.5-Coder-32B      your docker-compose"
 Tester             Devstral-24B
 ...                ...
```

## Key Features

- **Pipeline Visualizer** — interactive agent team diagram. Click any role → see recommended models with benchmark scores
- **Model Leaderboard** — filterable by role, size, license. Radar charts: coding vs reasoning vs tool-use. Updated weekly from live benchmarks
- **GPU Configurator** — select your hardware → get an optimized model-to-GPU layout with VRAM calculations. Export as Docker Compose / Helm
- **Playground** (v2) — type a request, watch 9 agents build an AI agent in real-time on our cluster

## Why Now

- Open-source models hit proprietary parity (MiniMax M2.5: SWE-bench 80.2% vs Claude 80.9%)
- MoE architecture makes frontier models runnable on commodity hardware (17B active params from 397B total)
- 72% of enterprise AI projects now use multi-agent architectures
- No existing tool connects the role → model → infra stack

## Traction

- Research complete: 30+ models benchmarked across 12 leaderboards
- Infrastructure live: 8x A100 80GB cluster with 3 models running
- Deployment plan validated for 9-agent team on 5 GPUs (109 GB / 640 GB available)

## Ask

Feedback on the concept. Is this a tool you'd use?
