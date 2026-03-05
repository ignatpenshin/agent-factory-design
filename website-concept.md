# Agent Factory — Website Concept

> Interactive research showcase + configurator for building multi-agent systems from open-source LLMs.

---

## Core Idea

**"Agent Factory Designer"** — веб-приложение, где пользователь описывает задачу, а система показывает:
1. Какую команду агентов нужно собрать
2. Какие open-source модели использовать для каждой роли
3. Сколько GPU потребуется и как разложить по железу
4. Готовый deployment config для запуска

Это одновременно **research showcase** (наша аналитика) и **практический инструмент** (конфигуратор).

---

## Структура сайта

### Page 1: Landing / Hero

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│              AGENT FACTORY                                   │
│              Build AI Agent Teams from Open-Source LLMs       │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │  "Build me a customer support agent with Jira..."    │   │
│   │                                          [Generate →]│   │
│   └──────────────────────────────────────────────────────┘   │
│                                                              │
│   ── or explore the research ──                              │
│                                                              │
│   [Team Roles]   [Model Leaderboard]   [GPU Calculator]     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Hero-блок:** Анимированная визуализация — пользовательский запрос "падает" в фабрику, проходит через цепочку агентов (Orchestrator → Analyst → Architect → Builder → Tester → ...), и на выходе появляется готовый агент. Каждый узел пульсирует при "активации".

---

### Page 2: Interactive Pipeline Visualizer

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  USER REQUEST ──→ [Orchestrator] ──→ [Req. Analyst] ──→     │
│                        │                    │                │
│                   Qwen3.5-397B         Qwen3-8B             │
│                   17B active            8B                   │
│                   GPQA 88.4            IFEval 91.2           │
│                        │                    │                │
│                        ▼                    ▼                │
│               [Researcher] ──→ [Architect] ──→ [Builder]    │
│                                     │             │          │
│                              QwQ-32B     Qwen2.5-Coder-32B  │
│                              MATH 94.3   HumanEval 92.7     │
│                                     │             │          │
│                                     ▼             ▼          │
│                              [Tester] ◄──► [Critic]         │
│                                               │              │
│                              [Security] ──→ OUTPUT           │
│                                                              │
│  ─── Click any node to explore ───                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Интерактивная схема пайплайна:**
- Клик на любой узел (роль) — раскрывает карточку с описанием роли, рекомендованными моделями, бенчмарками
- Анимация потока данных (артефакты) между узлами
- Feedback loops (Builder ↔ Tester) анимируются отдельно
- Toggle: MVP (5 агентов) / Quality (7) / Production (9) / Self-Improving (12) — схема перестраивается

---

### Page 3: Model Leaderboard (Live Data)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  OPEN-SOURCE LLM LEADERBOARD — March 2026                   │
│                                                              │
│  Filter by: [Role ▼] [Size ▼] [Benchmark ▼] [License ▼]    │
│                                                              │
│  ┌────┬──────────────────┬───────┬────────┬────────┬──────┐ │
│  │ #  │ Model            │Active │SWE-ben │GPQA    │VRAM  │ │
│  ├────┼──────────────────┼───────┼────────┼────────┼──────┤ │
│  │ 1  │ Kimi K2.5        │ 32B   │ 76.8   │ 87.6   │125GB │ │
│  │ 2  │ Qwen3.5-397B     │ 17B   │ 76.4   │ 88.4   │ 50GB │ │
│  │ 3  │ GLM-5            │ 40B   │ 77.8   │ 86.0   │ 93GB │ │
│  │ 4  │ DeepSeek V3.2    │ 37B   │ 73.1   │ 79.9   │ 85GB │ │
│  │ 5  │ MiniMax M2.5     │~10B   │ 80.2   │  --    │ 29GB │ │
│  │ ...│ ...              │ ...   │ ...    │ ...    │ ...  │ │
│  └────┴──────────────────┴───────┴────────┴────────┴──────┘ │
│                                                              │
│  [Radar chart comparing top 5]  [Size vs Quality scatter]   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Фичи таблицы:**
- Сортировка по любому бенчмарку (SWE-bench, GPQA, HumanEval, AIME, BFCL, IFEval, LiveCodeBench)
- Фильтр по роли — показывает только модели, подходящие для выбранной роли, отсортированные по релевантному бенчмарку
- Фильтр по размеру (Tiny/Small/Medium/Large/XL)
- Фильтр по лицензии (MIT / Apache 2.0 / Llama / Other)
- **Radar chart** — наложение профилей моделей (coding vs reasoning vs tool-use vs instruction-following)
- **Scatter plot** — Active Params vs Quality Score, чтобы визуально найти "sweet spot"

---

### Page 4: GPU Configurator

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  GPU CONFIGURATOR                                            │
│                                                              │
│  Your hardware:                                              │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────────┐       │
│  │ GPU Type  ▼  │  │ Count ▼  │  │ Quantization  ▼  │       │
│  │ A100 80GB    │  │ 8        │  │ INT4 (AWQ)       │       │
│  └──────────────┘  └──────────┘  └──────────────────┘       │
│                                                              │
│  Team size: ○ MVP (5)  ● Full (9)  ○ Extended (12)          │
│                                                              │
│  ═══════════════════════════════════════════════             │
│                                                              │
│  RECOMMENDED LAYOUT:                                         │
│                                                              │
│  ┌─GPU 1──────┐ ┌─GPU 2──────┐ ┌─GPU 3──────┐ ┌─GPU 4───┐ │
│  │Qwen3.5-397B│ │Coder-32B   │ │QwQ-32B     │ │Ministr14│ │
│  │Orchestrator│ │Builder     │ │Architect   │ │Critic   │ │
│  │50GB / 80GB │ │16GB+12GB   │ │16GB+4GB    │ │7GB+4GB  │ │
│  └────────────┘ │Devstral-24B│ │DS-R1-8B    │ │Falcon7B │ │
│                 │Tester      │ │SecAuditor  │ │Evaluator│ │
│                 └────────────┘ └────────────┘ └─────────┘ │
│                                                              │
│  ┌─GPU 5──────┐ ┌─GPU 6-8────────────────────────────────┐ │
│  │Qwen small  │ │ FREE — experiments, fine-tuning, A/B   │ │
│  │Router      │ │ Available: 240 GB                       │ │
│  └────────────┘ └─────────────────────────────────────────┘ │
│                                                              │
│  Total VRAM used: 109 GB / 640 GB (17%)                     │
│  Estimated tok/s: ~850 (orchestrator) | ~1200 (builder)     │
│                                                              │
│  [Export Docker Compose]  [Export Helm Chart]  [Copy Config] │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**GPU Configurator features:**
- Выбор типа GPU, количества, квантизации
- Выбор размера команды (MVP / Full / Extended)
- Автоматическая раскладка моделей по GPU с учётом VRAM, совместимости, model sharing
- Визуальная схема GPU с заполненностью
- Экспорт готовых конфигов (Docker Compose, Helm, SGLang/vLLM configs)
- Warning если не хватает VRAM или конфиг неоптимален
- Slider: "Quality ← → Efficiency" — сдвигает выбор моделей (frontier vs budget)

---

### Page 5: Role Deep Dive (per-role pages)

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ROLE: BUILDER                                               │
│  Generates agent code and configuration files                │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │ RESPONSIBILITIES     │  │ RECOMMENDED MODELS           │ │
│  │                      │  │                              │ │
│  │ • Implement agent    │  │  Best: Qwen2.5-Coder-32B    │ │
│  │   code from TDD      │  │  ████████████████████ 92.7   │ │
│  │ • Tool integrations  │  │                              │ │
│  │ • State management   │  │  Good: Qwen3-Coder-Next     │ │
│  │ • Error handling     │  │  ██████████████████░░ 70.6   │ │
│  │ • Config files       │  │                              │ │
│  │                      │  │  Budget: Qwen2.5-Coder-7B   │ │
│  │ Inputs: TDD, Prompts │  │  ████████████████░░░░ 88.4   │ │
│  │ Outputs: Source code │  │                              │ │
│  └──────────────────────┘  │  [Compare models →]         │ │
│                             └──────────────────────────────┘ │
│                                                              │
│  KEY BENCHMARKS FOR THIS ROLE:                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  HumanEval ──── most important for code generation     │  │
│  │  SWE-bench ──── real-world software engineering        │  │
│  │  Aider ──────── multi-file editing capability          │  │
│  │  LiveCodeBench ─ competitive programming               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  EXAMPLE SYSTEM PROMPT:                                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  You are the Builder agent in an Agent Factory...      │  │
│  │  ...                                                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### Page 6: Live Demo / Playground

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  AGENT FACTORY PLAYGROUND                                    │
│                                                              │
│  Describe the agent you want to build:                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  "Build a Telegram bot that monitors GitHub PRs,     │   │
│  │   summarizes changes, and posts updates to a         │   │
│  │   Slack channel"                                     │   │
│  │                                           [Build →]  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ LIVE PIPELINE ─────────────────────────────────────────┐ │
│  │                                                         │ │
│  │  [✓] Orchestrator    — Parsed request, 3 integrations   │ │
│  │  [✓] Req. Analyst    — ARD generated (12 requirements)  │ │
│  │  [✓] Researcher      — Found: github API, slack SDK...  │ │
│  │  [►] Architect       — Designing component structure... │ │
│  │  [ ] Prompt Engineer — Waiting                          │ │
│  │  [ ] Builder         — Waiting                          │ │
│  │  [ ] Tester          — Waiting                          │ │
│  │  [ ] Critic          — Waiting                          │ │
│  │  [ ] Security Audit  — Waiting                          │ │
│  │                                                         │ │
│  │  ┌─ Current artifact ──────────────────────────────┐    │ │
│  │  │  # Technical Design Document                    │    │ │
│  │  │                                                 │    │ │
│  │  │  ## Components                                  │    │ │
│  │  │  1. GitHub Webhook Listener (FastAPI)           │    │ │
│  │  │  2. PR Diff Summarizer (LLM-powered)            │    │ │
│  │  │  3. Slack Notifier (slack_sdk)                  │    │ │
│  │  │  4. Telegram Bot (python-telegram-bot)          │    │ │
│  │  │  ...                                            │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Playground features:**
- Реальный запуск пайплайна на нашем кластере (8x A100)
- Стриминг прогресса каждого агента
- Показ промежуточных артефактов (ARD, TDD, код, тесты)
- Просмотр "мыслей" каждого агента (chain-of-thought)
- Скачивание результата как ZIP (код + конфиги + документация)
- Rate-limited для публичного доступа, полный доступ по API key

---

## Tech Stack

```
Frontend:
├── Next.js 15 (App Router)
├── React Flow — интерактивные схемы пайплайна
├── Recharts / D3 — графики бенчмарков, radar charts, scatter plots
├── Tailwind CSS + shadcn/ui
├── Framer Motion — анимации потока данных
└── MDX — контент страниц ролей из наших .md файлов

Backend:
├── FastAPI (Python) — API для конфигуратора и playground
├── SGLang / vLLM — inference engine (обёртка над внутренним движком)
├── Redis — очередь задач playground, кэш конфигураций
├── PostgreSQL — хранение бенчмарк-данных, пользовательских конфигов
└── WebSocket — стриминг прогресса playground

Data:
├── agent-team-roles.md → контент для Role Deep Dive pages
├── model-selection.md → данные для Model Leaderboard
├── deployment-plan.md → данные для GPU Configurator presets
└── Scrapers: периодический парсинг LiveBench, LMSYS Arena, BFCL
    для обновления таблиц (cron, раз в неделю)

Infra:
├── Kubernetes на SberCloud / internal
├── 8x A100 80GB — inference backend
├── Отдельный pod для frontend (не на GPU)
└── Monitoring: Grafana + Prometheus (GPU utilization, tok/s, latency)
```

---

## Data Flow Architecture

```
                    ┌──────────────┐
                    │   Browser    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Next.js    │
                    │   Frontend   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼───┐ ┌─────▼─────┐ ┌───▼──────────┐
     │ Static     │ │ Config    │ │ Playground   │
     │ Pages      │ │ API       │ │ API          │
     │ (SSG/ISR)  │ │ (FastAPI) │ │ (FastAPI+WS) │
     └────────────┘ └─────┬─────┘ └───┬──────────┘
                          │           │
                    ┌─────▼─────┐   ┌─▼───────────────┐
                    │ PostgreSQL│   │ Agent Pipeline   │
                    │ (configs, │   │ (Orchestrator →  │
                    │ benchmarks│   │  9 agents on     │
                    │  cache)   │   │  8x A100 cluster)│
                    └───────────┘   └─────────────────┘
```

---

## MVP Scope (v1)

**Что делаем первым (2-3 недели):**

| Page | Сложность | Приоритет | Зависимости |
|------|:---------:|:---------:|-------------|
| Landing + Hero | Low | P0 | Дизайн |
| Pipeline Visualizer (статичный) | Medium | P0 | React Flow |
| Model Leaderboard (таблица) | Medium | P0 | Данные из наших .md |
| Role Deep Dive (9 страниц) | Low | P1 | Контент готов |
| GPU Configurator | High | P1 | FastAPI backend |
| Playground (live demo) | Very High | P2 | Рабочий кластер + pipeline код |

**v1 = Landing + Pipeline Visualizer + Model Leaderboard + Role pages**
Это уже самоценный research showcase, который можно показать руководству и команде.

**v2 = + GPU Configurator**
Практический инструмент для команд, планирующих свои agent factory.

**v3 = + Playground**
Полноценная демонстрация работающей фабрики.

---

## Уникальность

Существующие ресурсы покрывают отдельные аспекты:
- **HuggingFace Open LLM Leaderboard** — бенчмарки, но без привязки к ролям
- **LMSYS Arena** — рейтинги, но без GPU калькулятора
- **CrewAI / LangGraph docs** — фреймворки, но без model selection

**Наш сайт — единственный, который связывает все три слоя:**
```
Роль агента → Лучшая модель → Конфигурация железа
```

Это ответ на вопрос, который задаёт каждая команда, строящая multi-agent систему:
*"Какую модель взять для какой задачи и сколько GPU мне нужно?"*
