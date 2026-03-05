# Agent Factory: Open-Source Model Selection Guide

> **Date:** March 2026
> **Goal:** Map the best open-weight LLM to each agent role, optimizing for GPU-usage / Effectiveness / Quality.
> **Constraint:** All models must have open weights on HuggingFace. No proprietary APIs.

---

## Current Open-Source LLM Landscape (March 2026)

### Tier S -- Frontier Open Models

| Model | Total / Active Params | Architecture | Key Scores | License |
|-------|----------------------|--------------|------------|---------|
| **Kimi K2.5** | 1T / 32B | MoE | HumanEval 99.0, AIME 96.1, MATH-500 98.0, SWE-bench 76.8, IFEval 94.0 | MIT |
| **MiniMax M2.5** | ~230B / ~10B | MoE | SWE-bench **80.2** (highest open), Multi-SWE-Bench 51.3 | Open |
| **GLM-5** | 744B / 40B | MoE | Arena Elo 1451 (top open), SWE-bench 77.8, HLE 50.4 | MIT |
| **DeepSeek V3.2** | 685B / 37B | MoE | MMLU-Pro 85.0, SWE-bench 73.1, LiveCodeBench 83.3, Aider 74.2 | MIT |
| **Qwen3.5-397B** | 397B / 17B | MoE | GPQA **88.4** (best), MMLU-Pro 87.8, IFEval 92.6, SWE-bench 76.4 | Apache 2.0 |
| **GLM-4.7** | 355B / 32B | MoE | tau-bench **87.4** (best tool use), LiveCodeBench 84.9, SWE-bench 73.8 | Open |

### Tier A -- Strong Performers

| Model | Total / Active Params | Key Scores | License |
|-------|----------------------|------------|---------|
| **DeepSeek-R1-0528** | 671B / 37B MoE | MATH-500 97.3, AIME 87.5 | MIT |
| **Qwen3-235B** | 235B / 22B MoE | AIME 81.5, MMLU-Pro 84.4, LiveCodeBench 74.1 | Apache 2.0 |
| **Llama 3.3 70B** | 70B dense | BFCL v2 77.3%, near-405B quality, 128K ctx | Llama |
| **EXAONE 4.0 32B** | 32B dense | Intelligence Index 62 (matches Claude Opus 4), 131K ctx | Open |
| **QwQ-32B** | 32B dense | MMLU-Pro CS 79%, beats Qwen2.5-72B on CS | Apache 2.0 |

### Tier B -- Efficient Specialists

| Model | Size | Specialty | Key Score | License |
|-------|------|-----------|-----------|---------|
| **Qwen3-Coder-Next** | 80B / 3B active MoE | Coding agent | SWE-bench 70.6, Aider 66.2 | Apache 2.0 |
| **Qwen3.5-122B-A10B** | 122B / 10B MoE | Tool calling | BFCL v4 72.2% (beats GPT-5 mini) | Apache 2.0 |
| **Qwen2.5-Coder-32B** | 32B dense | Code gen | HumanEval 92.7, Aider 73.7 | Apache 2.0 |
| **Devstral Small 2** | 24B dense | Agentic coding | SWE-bench 68.0 | Apache 2.0 |
| **Falcon H1R-7B** | 7B dense (hybrid) | Reasoning | AIME 83.1%, out-reasons 7x models | TII |
| **Ministral 14B Reasoning** | 14B dense | Reasoning | AIME ~85%, GPQA 71.2 | Apache 2.0 |
| **DeepSeek-R1-0528-Qwen3-8B** | 8B dense | Reasoning | AIME 87.5 (matches 235B!) | MIT |
| **ToolACE 8B** | 8B dense | Function calling | Surpasses GPT-4 on BFCL | Open |
| **Qwen3-30B-A3B** | 30B / 3B active MoE | General | 32B-class at 3B compute | Apache 2.0 |

---

## Model-to-Role Mapping

### Role 1: Orchestrator

> **Needs:** Complex reasoning, planning, delegation, tool routing, instruction following, long context
> **Critical benchmarks:** GPQA (graduate reasoning), IFEval (instruction following), MMLU-Pro (broad knowledge)

| Priority | Model | Active Params | Why | VRAM (INT4) |
|----------|-------|---------------|-----|-------------|
| **Best** | **Qwen3.5-397B** | 17B | Highest GPQA (88.4), best IFEval (92.6), best MMLU-Pro (87.8). The orchestrator must understand everything and delegate precisely -- this model excels at both. | ~50 GB |
| Good | Kimi K2.5 | 32B | Highest overall reasoning (AIME 96.1), but heavier and IFEval slightly lower. | ~125 GB |
| Budget | QwQ-32B | 32B | Strong reasoning at 32B dense. Fits on 1x A100 at INT4 (~16 GB). | ~16 GB |

**Rationale:** The Orchestrator is the most critical role. It must understand complex user requests, decompose them correctly, and route to specialists. Qwen3.5-397B offers the best combination of reasoning depth (GPQA 88.4) and instruction precision (IFEval 92.6) with only 17B active parameters.

---

### Role 2: Requirements Analyst

> **Needs:** Structured output generation, dialogue management, instruction following, user intent parsing
> **Critical benchmarks:** IFEval, MMLU (broad understanding), structured output accuracy

| Priority | Model | Active Params | Why | VRAM (INT4) |
|----------|-------|---------------|-----|-------------|
| **Best** | **Qwen3-8B** | 8B | Thinking/non-thinking mode for adaptive dialogue. Matches Qwen2.5-14B quality. Excellent structured output. | ~4 GB |
| Good | Qwen3-14B | 14B | More reasoning depth for complex requirements. | ~7.5 GB |
| Budget | Qwen3-4B | 4B | Matches prior-gen 7B, sufficient for structured extraction. | ~2 GB |

**Rationale:** Requirements analysis is primarily about understanding user intent and producing structured documents -- not about deep reasoning or code generation. An 8B model with good instruction following is sufficient and keeps GPU budget for more demanding roles.

---

### Role 3: Researcher

> **Needs:** Long context window, information extraction, summarization, web/API understanding
> **Critical benchmarks:** Long-context performance, summarization quality, context window size

| Priority | Model | Active Params | Why | VRAM (INT4) |
|----------|-------|---------------|-----|-------------|
| **Best** | **Qwen3.5-397B** | 17B | Shared with Orchestrator (same instance). Strong summarization + reasoning. | (shared) |
| Good | Llama 4 Scout | 17B | **10M token context** -- unmatched for processing large documentation sets. | ~55 GB |
| Budget | Qwen3-8B | 8B | 32K context, good summarization, very efficient. | ~4 GB |

**Rationale:** The Researcher needs to process large amounts of documentation and extract relevant information. In practice, this role can share the Orchestrator's model instance since they don't run simultaneously. If massive context is needed, Llama 4 Scout's 10M context window is unmatched.

---

### Role 4: Architect

> **Needs:** Deep reasoning, system design, code understanding, multi-step planning, architectural patterns
> **Critical benchmarks:** GPQA (deep reasoning), MATH (logical thinking), coding benchmarks, SWE-bench

| Priority | Model | Active Params | Why | VRAM (INT4) |
|----------|-------|---------------|-----|-------------|
| **Best** | **DeepSeek V3.2** | 37B | Strongest all-around: MMLU-Pro 85.0, SWE-bench 73.1, LiveCodeBench 83.3. Understands both code and architecture. | ~85 GB |
| Good | Kimi K2.5 | 32B | Highest reasoning scores. Excellent for complex architectural decisions. | ~125 GB |
| Budget | **DeepSeek-R1-Distill-Qwen-32B** | 32B | MATH-500 94.3, CodeForces 1691. Dense model that fits on 1x A100 (INT4 ~16 GB). | ~16 GB |

**Rationale:** Architecture is the highest-stakes intellectual task. The Architect must reason about trade-offs, component interactions, and design patterns. DeepSeek V3.2's balanced excellence across reasoning AND coding makes it ideal.

---

### Role 5: Prompt Engineer

> **Needs:** Meta-reasoning about language, instruction following mastery, creativity, understanding of model behavior
> **Critical benchmarks:** IFEval (instruction following), creative writing, MMLU-Pro (broad knowledge)

| Priority | Model | Active Params | Why | VRAM (INT4) |
|----------|-------|---------------|-----|-------------|
| **Best** | **Qwen3.5-397B** | 17B | Best IFEval (92.6) = best at understanding what makes instructions work. Can share instance with Orchestrator. | (shared) |
| Good | GLM-5 | 40B | Arena Elo 1451, strong at creative and nuanced text generation. | ~93 GB |
| Budget | **Qwen3-14B** | 14B | Good instruction following + thinking mode for iterating on prompts. | ~7.5 GB |

**Rationale:** Prompt engineering requires understanding what makes LLMs follow instructions well. The model with the best instruction-following score (IFEval) is naturally best at crafting instructions for others. In practice, shares instance with Orchestrator since they alternate.

---

### Role 6: Builder (Code Generator)

> **Needs:** Code generation, framework knowledge, tool integration, multi-file coherence
> **Critical benchmarks:** HumanEval, SWE-bench, Aider polyglot, LiveCodeBench

| Priority | Model | Active Params | Why | VRAM (INT4) |
|----------|-------|---------------|-----|-------------|
| **Best** | **Qwen2.5-Coder-32B** | 32B | HumanEval 92.7 (matches GPT-4o), Aider 73.7. Purpose-built for code. Dense = predictable quality. | ~16 GB |
| Good | Qwen3-Coder-Next | 3B active | SWE-bench 70.6 with only 3B active -- insane efficiency. | ~10 GB |
| Budget | **Qwen2.5-Coder-7B** | 7B | HumanEval 88.4, beats CodeStral-22B. Best coding under 10B. | ~4 GB |

**Rationale:** The Builder generates the most code and runs the most often. Qwen2.5-Coder-32B is the gold standard for locally-runnable code generation -- purpose-built, heavily benchmarked, and with a massive fine-tuning community. At INT4, it fits on a single RTX 5090 (32 GB) or A100.

---

### Role 7: Tester

> **Needs:** Test generation, edge case reasoning, code analysis, structured output
> **Critical benchmarks:** Coding benchmarks (understands code to test it), reasoning (finds edge cases)

| Priority | Model | Active Params | Why | VRAM (INT4) |
|----------|-------|---------------|-----|-------------|
| **Best** | **Devstral Small 2** | 24B | SWE-bench 68.0 -- understands real software engineering, not just isolated functions. Apache 2.0. | ~12 GB |
| Good | Qwen2.5-Coder-32B | 32B | Can share with Builder (alternating). Strong code understanding. | (shared) |
| Budget | **Falcon H1R-7B** | 7B | AIME 83.1% reasoning at 7B. Strong logical thinking for edge case discovery. | ~4 GB |

**Rationale:** Testing requires understanding code AND reasoning about what could go wrong. Devstral Small 2 is purpose-built for agentic software engineering tasks and understands real codebases (SWE-bench 68%), not just toy problems.

---

### Role 8: Critic (Quality Reviewer)

> **Needs:** Holistic evaluation, rubric scoring, architectural compliance checking, broad knowledge
> **Critical benchmarks:** GPQA (deep understanding), MMLU-Pro (broad knowledge), IFEval (structured assessment)

| Priority | Model | Active Params | Why | VRAM (INT4) |
|----------|-------|---------------|-----|-------------|
| **Best** | **GLM-4.7** | 32B | tau-bench 87.4 (best agentic evaluation), LiveCodeBench 84.9, strong across all domains. | ~44 GB |
| Good | Qwen3.5-397B | 17B | Shares with Orchestrator. Broad knowledge for holistic review. | (shared) |
| Budget | **Ministral 14B Reasoning** | 14B | AIME ~85%, GPQA 71.2. Strong reasoning for quality assessment at small footprint. | ~7 GB |

**Rationale:** The Critic must evaluate quality across multiple dimensions -- code, prompts, architecture, security. GLM-4.7's exceptional tool-use understanding (tau-bench 87.4) means it can assess agent-specific quality that general models miss.

---

### Role 9: Security Auditor

> **Needs:** Security knowledge, adversarial reasoning, code vulnerability detection, guardrail testing
> **Critical benchmarks:** Coding benchmarks (understands code), reasoning (adversarial thinking)

| Priority | Model | Active Params | Why | VRAM (INT4) |
|----------|-------|---------------|-----|-------------|
| **Best** | **DeepSeek V3.2** | 37B | Broadest knowledge base (MMLU-Pro 85.0) + strong code understanding. Can reason about attack vectors. | ~85 GB |
| Good | Qwen2.5-Coder-32B | 32B | Deep code understanding for vulnerability detection. | ~16 GB |
| Budget | **DeepSeek-R1-0528-Qwen3-8B** | 8B | AIME 87.5 reasoning helps adversarial thinking. Very efficient. | ~4 GB |

**Rationale:** Security auditing requires both code understanding and adversarial reasoning ("how could this be exploited?"). DeepSeek V3.2's combination of broad knowledge and code skills makes it ideal. For budget setups, the 8B distilled reasoning model provides surprisingly strong adversarial thinking.

---

## Optimized Deployment Configurations

### Configuration A: Minimal MVP (1x A100 80GB)

**5 agents, 3 model instances, ~35 GB VRAM**

```
┌─────────────────────────────────────────────────────┐
│                  1x A100 80GB                       │
│                                                     │
│  ┌──────────────────────┐  VRAM: ~16 GB (INT4)     │
│  │  QwQ-32B             │  Roles: Orchestrator,     │
│  │  (32B dense)         │  Requirements Analyst,    │
│  │                      │  Architect (shared)       │
│  └──────────────────────┘                           │
│                                                     │
│  ┌──────────────────────┐  VRAM: ~4 GB (INT4)      │
│  │  Qwen2.5-Coder-7B   │  Role: Builder            │
│  │  (7B dense)          │                           │
│  └──────────────────────┘                           │
│                                                     │
│  ┌──────────────────────┐  VRAM: ~4 GB (INT4)      │
│  │  Falcon H1R-7B       │  Role: Tester             │
│  │  (7B hybrid)         │                           │
│  └──────────────────────┘                           │
│                                                     │
│  Remaining: ~56 GB (KV cache + headroom)            │
└─────────────────────────────────────────────────────┘
```

| Role | Model | Active Params | VRAM |
|------|-------|---------------|------|
| Orchestrator | QwQ-32B | 32B | 16 GB |
| Requirements Analyst | QwQ-32B (shared) | -- | -- |
| Architect | QwQ-32B (shared) | -- | -- |
| Builder | Qwen2.5-Coder-7B | 7B | 4 GB |
| Tester | Falcon H1R-7B | 7B | 4 GB |
| **Total** | **3 instances** | -- | **~24 GB** |

---

### Configuration B: Quality Team (2x A100 80GB)

**7 agents, 4 model instances, ~63 GB VRAM**

```
┌──────────────────────────┐  ┌──────────────────────────┐
│      GPU 1 (80 GB)       │  │      GPU 2 (80 GB)       │
│                          │  │                          │
│  ┌────────────────────┐  │  │  ┌────────────────────┐  │
│  │ Qwen3.5-397B       │  │  │  │ Qwen2.5-Coder-32B  │  │
│  │ 17B active (INT4)  │  │  │  │ 32B dense (INT4)   │  │
│  │ ~50 GB             │  │  │  │ ~16 GB             │  │
│  │                    │  │  │  │                    │  │
│  │ Roles:             │  │  │  │ Roles:             │  │
│  │ - Orchestrator     │  │  │  │ - Builder          │  │
│  │ - Req. Analyst     │  │  │  │ - Tester (shared)  │  │
│  │ - Prompt Engineer  │  │  │  │ - Security Auditor │  │
│  │ - Researcher       │  │  │  │   (shared)         │  │
│  └────────────────────┘  │  │  └────────────────────┘  │
│                          │  │                          │
│  ┌────────────────────┐  │  │  ┌────────────────────┐  │
│  │ Ministral 14B      │  │  │  │ Remaining: ~64 GB  │  │
│  │ Reasoning (INT4)   │  │  │  │ (KV cache)         │  │
│  │ ~7 GB              │  │  │  │                    │  │
│  │ Role: Critic       │  │  │  │                    │  │
│  └────────────────────┘  │  │  └────────────────────┘  │
└──────────────────────────┘  └──────────────────────────┘
```

| Role | Model | GPU | VRAM |
|------|-------|----|------|
| Orchestrator | Qwen3.5-397B | 1 | 50 GB |
| Req. Analyst | Qwen3.5-397B (shared) | 1 | -- |
| Researcher | Qwen3.5-397B (shared) | 1 | -- |
| Prompt Engineer | Qwen3.5-397B (shared) | 1 | -- |
| Architect | Qwen3.5-397B (shared) | 1 | -- |
| Builder | Qwen2.5-Coder-32B | 2 | 16 GB |
| Tester | Qwen2.5-Coder-32B (shared) | 2 | -- |
| Critic | Ministral 14B Reasoning | 1 | 7 GB |
| Security Auditor | Qwen2.5-Coder-32B (shared) | 2 | -- |
| **Total** | **3 instances** | 2 GPUs | **~73 GB** |

---

### Configuration C: Full Production (4x A100 80GB)

**9+ agents, 5-6 model instances, all "Best" picks**

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   GPU 1 (80GB)   │ │   GPU 2 (80GB)   │ │   GPU 3 (80GB)   │ │   GPU 4 (80GB)   │
│                  │ │                  │ │                  │ │                  │
│ Qwen3.5-397B    │ │ DeepSeek V3.2    │ │ Qwen2.5-Coder   │ │ GLM-4.7          │
│ INT4 ~50 GB     │ │ (tensor parallel │ │ -32B INT4 16 GB  │ │ INT4 ~44 GB      │
│                 │ │  across GPU 2)   │ │                  │ │                  │
│ Orchestrator    │ │                  │ │ Builder          │ │ Critic           │
│ Req. Analyst    │ │ Architect        │ │                  │ │                  │
│ Researcher      │ │ Security Auditor │ │ Devstral 24B     │ │ Falcon H1R-7B    │
│ Prompt Engineer │ │                  │ │ INT4 12 GB       │ │ INT4 ~4 GB       │
│                 │ │                  │ │                  │ │                  │
│                 │ │                  │ │ Tester           │ │ Router/Eval      │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
```

| Role | Model | GPU | VRAM |
|------|-------|----|------|
| Orchestrator | Qwen3.5-397B (17B active) | 1 | 50 GB |
| Req. Analyst | Qwen3.5-397B (shared) | 1 | -- |
| Researcher | Qwen3.5-397B (shared) | 1 | -- |
| Prompt Engineer | Qwen3.5-397B (shared) | 1 | -- |
| Architect | DeepSeek V3.2 (37B active) | 2 | 85 GB |
| Security Auditor | DeepSeek V3.2 (shared) | 2 | -- |
| Builder | Qwen2.5-Coder-32B | 3 | 16 GB |
| Tester | Devstral Small 2 24B | 3 | 12 GB |
| Critic | GLM-4.7 (32B active) | 4 | 44 GB |
| Router/Evaluator | Falcon H1R-7B | 4 | 4 GB |
| **Total** | **6 instances** | 4 GPUs | **~211 GB** |

---

### Configuration D: Consumer / Dev Setup (2x RTX 5090 32GB)

**5 agents, 3 model instances, all INT4 quantized**

| Role | Model | VRAM (INT4) |
|------|-------|-------------|
| Orchestrator + Analyst + Architect | QwQ-32B | 16 GB |
| Builder | Qwen2.5-Coder-7B | 4 GB |
| Tester + Critic | Falcon H1R-7B | 4 GB |
| **Total** | **3 instances** | **~24 GB** |

Fits on a single RTX 5090 with room to spare. Second GPU available for parallel inference.

---

## Model Sharing Strategy

Not every role needs a dedicated model instance. Roles that **never run simultaneously** can share:

| Shared Instance | Roles | Rationale |
|-----------------|-------|-----------|
| **Orchestrator model** | Orchestrator, Requirements Analyst, Researcher, Prompt Engineer | These run sequentially in the pipeline. Orchestrator delegates, waits, then processes results. |
| **Coder model** | Builder, Tester, Security Auditor | Builder finishes before Tester starts. Security Auditor runs after both. |
| **Critic model** | Critic, Evaluator | Both do quality assessment, never simultaneously. |

This reduces **9 logical agents to 3-4 physical model instances**.

---

## Key Quantization Recommendations

| GPU Type | Best Quantization | Quality Retention | Notes |
|----------|------------------|-------------------|-------|
| **H100/H200/B200** | FP8 | ~99%+ | Native hardware support. Use this. |
| **A100** | AWQ INT4 + Marlin | ~95% | A100 lacks FP8. Marlin gives 10.9x speedup. |
| **RTX 4090/5090** | GGUF Q4_K_M or Q5_K_M | ~92-95% | Via llama.cpp or Ollama. Q5_K_M for quality-critical roles. |

**Rule of thumb:** Use Q5_K_M (GGUF) for Orchestrator/Architect/Critic (quality-critical). Use Q4_K_M for Builder/Tester (throughput-critical).

---

## Serving Infrastructure

| Engine | Best For | Recommendation |
|--------|----------|----------------|
| **SGLang** | Agent workloads | RadixAttention reuses KV cache across multi-turn agent conversations. **Best for agent factory.** |
| **vLLM** | General production | Broader ecosystem, more stable. Use if SGLang causes issues. |
| **llama.cpp / Ollama** | Consumer GPUs | GGUF quantization. Best for dev/prototyping on RTX cards. |

**Architecture:** Dedicated model per GPU (or MIG partition). Don't try multi-model on single GPU -- tooling is immature. Use CPU offload for idle agents.

---

## Summary: Recommended Model per Role

| # | Role | Best Model | Active Params | Key Strength | VRAM (INT4) |
|---|------|-----------|---------------|-------------|-------------|
| 1 | **Orchestrator** | Qwen3.5-397B | 17B | GPQA 88.4, IFEval 92.6 | 50 GB |
| 2 | **Requirements Analyst** | Qwen3-8B | 8B | Thinking mode, structured output | 4 GB |
| 3 | **Researcher** | Qwen3.5-397B (shared) | 17B | Broad knowledge, summarization | (shared) |
| 4 | **Architect** | DeepSeek V3.2 | 37B | MMLU-Pro 85.0, SWE-bench 73.1 | 85 GB |
| 5 | **Prompt Engineer** | Qwen3.5-397B (shared) | 17B | Best IFEval 92.6 | (shared) |
| 6 | **Builder** | Qwen2.5-Coder-32B | 32B | HumanEval 92.7, Aider 73.7 | 16 GB |
| 7 | **Tester** | Devstral Small 2 | 24B | SWE-bench 68.0, agentic coding | 12 GB |
| 8 | **Critic** | GLM-4.7 | 32B | tau-bench 87.4, LiveCodeBench 84.9 | 44 GB |
| 9 | **Security Auditor** | DeepSeek V3.2 (shared) | 37B | Broad knowledge + code | (shared) |

### Budget Alternative (all roles, 1x A100 80GB)

| # | Role | Budget Model | VRAM (INT4) |
|---|------|-------------|-------------|
| 1 | Orchestrator | QwQ-32B | 16 GB |
| 2 | Req. Analyst | QwQ-32B (shared) | -- |
| 3 | Researcher | QwQ-32B (shared) | -- |
| 4 | Architect | QwQ-32B (shared) | -- |
| 5 | Prompt Engineer | QwQ-32B (shared) | -- |
| 6 | Builder | Qwen2.5-Coder-7B | 4 GB |
| 7 | Tester | Falcon H1R-7B | 4 GB |
| 8 | Critic | Falcon H1R-7B (shared) | -- |
| 9 | Security Auditor | Qwen2.5-Coder-7B (shared) | -- |
| | **Total** | **3 instances** | **~24 GB** |

---

## MoE Efficiency Insight

The biggest finding from this research: **Mixture-of-Experts models make frontier quality surprisingly affordable.**

| Model | Total Params | Active Params | Quality Level | Active VRAM |
|-------|-------------|---------------|---------------|-------------|
| Qwen3.5-397B | 397B | 17B | Matches Claude 3.5 | ~50 GB INT4 |
| Qwen3-Coder-Next | 80B | 3B | SWE-bench 70.6% | ~10 GB INT4 |
| MiniMax M2.5 | ~230B | ~10B | SWE-bench 80.2% | ~29 GB INT4 |

MoE models load all parameters into memory but only activate a fraction per token. This means:
- **VRAM = total params** (you pay for storage)
- **Compute = active params** (you pay less for inference speed)
- **Quality = frontier** (you get the benefit of massive parameter counts)

The trade-off: MoE models need more memory than their quality-equivalent dense models, but less compute per token. For an agent factory where agents run sequentially (not all at once), MoE is ideal.

---

## Critical Takeaways

1. **Chinese labs dominate open-source (March 2026).** Qwen (Alibaba), DeepSeek, GLM (Zhipu), Kimi (Moonshot), MiniMax -- all MIT or Apache 2.0 licensed. Plan around these ecosystems.

2. **3 physical model instances serve 9 logical agents.** Sequential pipeline + model sharing means you don't need 9 GPUs.

3. **INT4 quantization is the production sweet spot.** 95% quality retention at 75% VRAM savings. Use Q5_K_M for quality-critical roles (Orchestrator, Critic).

4. **Qwen2.5-Coder-32B is the coding workhorse.** Nothing else at its size comes close for local code generation. This is your Builder.

5. **Tool calling remains the weakest link.** Best open model scores 87% (GLM-4.7 tau-bench). Consider fine-tuning on your specific tool schemas for production.

6. **Budget for 20-30x token overhead** vs single-model deployment. Multi-agent systems consume tokens aggressively.

---

## Sources

### Leaderboards
- [LMSYS Chatbot Arena](https://arena.ai/leaderboard) -- Feb 2026 rankings
- [LiveBench](https://livebench.ai/) -- Monthly updated benchmarks
- [LiveCodeBench](https://livecodebench.github.io/leaderboard.html) -- Competitive programming
- [Berkeley Function Calling Leaderboard V4](https://gorilla.cs.berkeley.edu/leaderboard.html)
- [SWE-bench Verified](https://epoch.ai/benchmarks/swe-bench-verified)
- [BigCodeBench](https://bigcode-bench.github.io/)
- [EvalPlus / HumanEval](https://evalplus.github.io/leaderboard.html)
- [Aider LLM Leaderboards](https://aider.chat/docs/leaderboards/)

### Model Cards
- [Kimi K2.5](https://huggingface.co/moonshotai/Kimi-K2.5) -- MIT, 1T MoE
- [MiniMax M2.5](https://huggingface.co/MiniMaxAI/MiniMax-M2.5) -- Open weights
- [GLM-5](https://huggingface.co/zai-org/GLM-5) -- MIT, 744B MoE
- [DeepSeek V3.2](https://huggingface.co/deepseek-ai/) -- MIT
- [Qwen3.5](https://github.com/QwenLM/Qwen3.5) -- Apache 2.0
- [GLM-4.7](https://huggingface.co/zai-org/) -- Open
- [Qwen2.5-Coder-32B](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct) -- Apache 2.0
- [Devstral Small 2](https://mistral.ai/news/devstral-2-vibe-cli) -- Apache 2.0
- [Falcon H1R-7B](https://falcon-lm.github.io/blog/falcon-h1r-7b/) -- TII
- [DeepSeek-R1-0528](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528) -- MIT

### Infrastructure
- [SGLang vs vLLM 2026](https://kanerika.com/blogs/sglang-vs-vllm/)
- [vLLM Quantization Guide](https://docs.jarvislabs.ai/blog/vllm-quantization-complete-guide-benchmarks)
- [GGUF vs GPTQ vs AWQ](https://localaimaster.com/blog/quantization-explained)
- [GPU Requirements Cheat Sheet](https://www.spheron.network/blog/gpu-requirements-cheat-sheet-2026/)
- [Multi-Agent Multi-LLM Systems 2026](https://dasroot.net/posts/2026/02/multi-agent-multi-llm-systems-future-ai-architecture-guide-2026/)
