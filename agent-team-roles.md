# Agent Factory: Development Team Roles

## Vision

An **Agent Factory** is a multi-agent system that generates custom AI agents from user requests. The user describes what they need ("build me a customer support agent that integrates with Jira"), and the factory's team of specialized agents collaborates to design, build, test, and deliver a working agent.

This document defines the complete set of roles required for the agent factory team.

---

## Lifecycle Overview

```
User Request
     |
     v
[1. Intake & Clarification]  -->  Orchestrator, Requirements Analyst
     |
     v
[2. Research & Context]      -->  Researcher
     |
     v
[3. Architecture & Design]   -->  Architect
     |
     v
[4. Task Decomposition]      -->  Orchestrator (planning mode)
     |
     v
[5. Prompt & Config Design]  -->  Prompt Engineer
     |
     v
[6. Implementation]          -->  Builder
     |
     v
[7. Testing & QA]            -->  Tester, Critic
     |                              |
     |    <--- feedback loop --------+
     v
[8. Security Review]         -->  Security Auditor
     |
     v
[9. Deployment]              -->  Deployer
     |
     v
[10. Evaluation & Learning]  -->  Evaluator, Knowledge Manager
```

---

## Core Roles (9 agents)

### 1. Orchestrator (Lead Agent)

**Purpose:** Central coordinator. Decomposes user request, delegates to specialists, manages workflow state, synthesizes final result.

**Responsibilities:**
- Parse initial user request and determine complexity level
- Select which agents to involve and in what order
- Route artifacts between agents (specs to Architect, code to Tester, etc.)
- Manage parallel execution of independent tasks
- Handle failures, retries, and escalation
- Aggregate final deliverables for the user

**Inputs:** User request, status updates from all agents
**Outputs:** Task assignments, workflow decisions, final delivery to user

**Key principle:** Delegates with precision. Each sub-agent receives an objective, output format, tool guidance, and clear task boundaries. Vague delegation fails (Anthropic research finding).

---

### 2. Requirements Analyst

**Purpose:** Transforms vague user intent into a structured specification.

**Responsibilities:**
- Conduct clarifying dialogue with user (what does the agent need to do?)
- Identify target capabilities, integrations, constraints
- Define acceptance criteria and success metrics
- Produce a structured Agent Requirement Document (ARD):
  - Agent purpose and persona
  - Target tools and APIs
  - Input/output formats
  - Behavioral constraints and guardrails
  - Performance requirements
  - User stories / usage scenarios

**Inputs:** Raw user request, clarification answers
**Outputs:** Agent Requirement Document (ARD)

**Critical for:** Preventing the factory from building the wrong thing. The most common failure in agent generation is misunderstanding the user's actual need.

---

### 3. Researcher

**Purpose:** Gathers context before design begins.

**Responsibilities:**
- Search for existing agents/solutions that already solve the problem
- Explore relevant APIs, documentation, and tool capabilities
- Assess feasibility of requested integrations
- Identify reference architectures and patterns
- Report findings as a Context Package to the Architect

**Inputs:** ARD from Requirements Analyst
**Outputs:** Context Package (available tools, APIs, reference implementations, constraints discovered)

**Why separate from Architect:** The Architect should design based on facts, not assumptions. The Researcher prevents uninformed architectural choices and avoids reinventing existing solutions.

---

### 4. Architect

**Purpose:** Designs the technical blueprint for the generated agent.

**Responsibilities:**
- Define agent architecture (single agent vs. multi-agent, tool selection)
- Design system prompt structure and persona
- Specify tool configurations and API integrations
- Define data flow, state management, and memory strategy
- Choose framework/runtime (LangChain, CrewAI, Claude Agent SDK, custom, etc.)
- Produce a Technical Design Document (TDD):
  - Component diagram
  - Tool/API specifications
  - Prompt architecture (system prompt, few-shot examples, chain-of-thought strategy)
  - Error handling and fallback strategy
  - Configuration schema

**Inputs:** ARD, Context Package from Researcher
**Outputs:** Technical Design Document (TDD)

---

### 5. Prompt Engineer

**Purpose:** Translates the Architect's design into implementation-ready prompts, tool configurations, and agent persona definitions.

**Responsibilities:**
- Craft system prompts that encode the agent's persona, capabilities, and constraints
- Design few-shot examples and chain-of-thought templates
- Configure tool descriptions and parameter schemas
- Write guardrail instructions (what the agent must not do)
- Optimize prompts for the target model (token efficiency, instruction following)
- Define prompt variants for different scenarios

**Inputs:** TDD from Architect
**Outputs:** Prompt Package (system prompt, tool configs, examples, guardrails)

**Why this role matters:** The quality of a generated agent is primarily determined by its prompts. A dedicated prompt specialist ensures prompts are crafted with precision rather than being an afterthought during implementation.

---

### 6. Builder

**Purpose:** Generates the actual agent code and configuration files.

**Responsibilities:**
- Implement agent code based on TDD and Prompt Package
- Set up tool integrations (API clients, authentication, data connectors)
- Implement state management and memory
- Write configuration files, environment setup
- Follow coding standards and framework conventions
- Implement error handling, logging, observability hooks

**Inputs:** TDD, Prompt Package
**Outputs:** Agent source code, configuration files, dependency manifests

---

### 7. Tester

**Purpose:** Validates the generated agent works correctly.

**Responsibilities:**
- Generate test scenarios from ARD acceptance criteria
- Write and execute unit tests for individual components
- Run integration tests for tool/API interactions
- Perform end-to-end conversation tests (simulate user interactions)
- Test edge cases: malformed input, API failures, rate limits, adversarial prompts
- Measure performance metrics (latency, token usage, accuracy)
- Produce a Test Report with pass/fail status and coverage metrics

**Inputs:** Agent code from Builder, ARD (acceptance criteria), TDD (expected behavior)
**Outputs:** Test Report, bug reports fed back to Builder

**Feedback loop:** When tests fail, Tester sends structured bug reports back to Builder. Builder fixes and re-submits. This loop continues until all acceptance criteria pass.

---

### 8. Critic (Quality Reviewer)

**Purpose:** Reviews the agent holistically -- not just "does it work" but "is it good."

**Responsibilities:**
- Review agent output quality (are responses helpful, accurate, well-formatted?)
- Assess architectural compliance (does implementation match TDD?)
- Check prompt quality (are instructions clear, unambiguous, robust?)
- Evaluate guardrail effectiveness (can the agent be jailbroken or misused?)
- Review code quality (maintainability, readability, best practices)
- Score the agent against a quality rubric
- Provide structured feedback to Builder and Prompt Engineer

**Inputs:** All artifacts (ARD, TDD, Prompt Package, code, Test Report)
**Outputs:** Quality Review with scores, issues, and improvement recommendations

**Distinct from Tester:** Tester checks "does it pass tests." Critic checks "is it actually good." A test-passing agent can still have poor prompt design, verbose responses, or fragile guardrails.

---

### 9. Security Auditor

**Purpose:** Ensures the generated agent is safe to deploy.

**Responsibilities:**
- Review tool permissions (does the agent have minimum necessary access?)
- Test for prompt injection vulnerabilities
- Validate API key handling and secret management
- Check for data leakage risks (does the agent expose sensitive info?)
- Assess guardrail robustness against adversarial inputs
- Review rate limiting and cost controls
- Verify compliance with organizational security policies

**Inputs:** Agent code, Prompt Package, tool configurations
**Outputs:** Security Audit Report (pass/fail with required remediations)

**Non-negotiable:** No agent ships without security review. Agents with tool access and API credentials are high-risk artifacts.

---

## Extended Roles (add for production-grade factory)

### 10. Deployer

**Purpose:** Handles delivery of the finished agent to the user's environment.

**Responsibilities:**
- Package the agent for the target runtime
- Generate deployment configurations (Docker, cloud functions, etc.)
- Set up monitoring and observability
- Configure rollback mechanisms
- Create user documentation and quickstart guide

**Inputs:** Validated agent code, Security Audit Report
**Outputs:** Deployed agent, deployment configs, user documentation

---

### 11. Evaluator

**Purpose:** Assesses the factory's overall performance and drives improvement.

**Responsibilities:**
- Score each generated agent using LLM-as-judge evaluation
- Track factory metrics (success rate, generation time, user satisfaction)
- Identify common failure patterns across generated agents
- Recommend process improvements to Orchestrator
- Benchmark generated agents against baselines

**Inputs:** Generated agents, user feedback, Test Reports, Quality Reviews
**Outputs:** Factory Performance Report, optimization recommendations

---

### 12. Knowledge Manager

**Purpose:** Maintains the factory's institutional memory.

**Responsibilities:**
- Store successful patterns and reusable components
- Index past agents and their designs for reference
- Maintain a library of proven prompts, tool configs, and architectures
- Prevent the factory from re-deriving solutions to previously solved problems
- Track lessons learned from failures

**Inputs:** All artifacts from completed agent generations
**Outputs:** Searchable knowledge base, pattern recommendations

---

## Team Composition by Maturity

| Stage | Agents | Roles |
|-------|--------|-------|
| **MVP (Phase 1)** | 5 | Orchestrator, Requirements Analyst, Architect, Builder, Tester |
| **Quality (Phase 2)** | 7 | + Prompt Engineer, Critic |
| **Production (Phase 3)** | 9 | + Researcher, Security Auditor |
| **Self-Improving (Phase 4)** | 12 | + Deployer, Evaluator, Knowledge Manager |

---

## Communication Patterns

### Artifact-Based Communication
Agents communicate through structured artifacts (ARD, TDD, Prompt Package, etc.), not free-form text. This prevents information loss as work passes through the pipeline (avoids the "telephone game" problem).

### Feedback Loops
```
Builder <---> Tester      (fix-retest loop)
Builder <---> Critic      (quality improvement loop)
Prompt Engineer <--> Critic  (prompt refinement loop)
Evaluator --> Orchestrator   (process improvement loop)
```

### Parallel Execution
Independent stages run in parallel when possible:
- Researcher + Requirements Analyst can work simultaneously on initial analysis
- Tester + Critic + Security Auditor can review in parallel once code is ready

---

## Key Design Principles

1. **Precise delegation over vague instructions.** Each agent gets: objective, output format, tools to use, task boundaries.

2. **Spec-driven, not code-driven.** Specifications (ARD, TDD) are the primary artifacts. Code is a generated output derived from specs.

3. **Mandatory feedback loops.** No agent's output is final until reviewed. The Builder-Tester loop and Builder-Critic loop are non-optional.

4. **Minimum viable access.** Generated agents get only the permissions they need. Security Auditor enforces this.

5. **Artifact persistence.** All intermediate artifacts are stored, not discarded. This enables debugging, rollback, and learning.

6. **Fail fast, escalate early.** If an agent cannot complete its task, it reports failure immediately to the Orchestrator rather than producing low-quality output.

---

## References

- Anthropic: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) -- orchestrator-worker pattern, 90% improvement over single-agent
- MetaGPT (ICLR 2024): `Code = SOP(Team)` -- structured roles with artifact-passing
- CrewAI: Hierarchical process mode with manager delegation
- Agentsway (arXiv): Novel Prompting Agent and Fine-Tuning Agent roles
- GoCodeo: Planner-Coder-Critic loop until success criteria met
- metaswarm: 4-phase `IMPLEMENT -> VALIDATE -> ADVERSARIAL REVIEW -> COMMIT`
- EvoAgentX: Self-evolving agent optimization through TextGrad/AFlow/MIPRO
