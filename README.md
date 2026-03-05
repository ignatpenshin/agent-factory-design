# Agent Factory Designer

> **[Live Demo](https://ignatpenshin.github.io/agent-factory-design/)** | Интерактивный дашборд для проектирования мульти-агентных систем на open-source LLM

---

## Что это

**Agent Factory** — мульти-агентная система, которая генерирует кастомных AI-агентов по запросу пользователя. Пользователь описывает задачу, а фабрика из 9 специализированных агентов проектирует, строит, тестирует и выдаёт готового агента.

Этот репозиторий содержит:
- Исследование ролей агентной команды
- Бенчмарк-анализ 30+ open-source моделей (март 2026)
- Маппинг лучших моделей на каждую роль
- План развёртывания на кластере 8x A100 80GB
- Интерактивный веб-дашборд

---

## Почему open-source модели

Open-source модели в марте 2026 достигли паритета с проприетарными:

| Метрика | Лучшая open-source | Лучшая проприетарная | Разрыв |
|---------|-------------------|---------------------|--------|
| SWE-bench Verified | MiniMax M2.5 **80.2%** | Claude Opus 4.5 80.9% | 0.7% |
| HumanEval | Kimi K2.5 **99.0%** | GPT-5.2 98.5% | open лидирует |
| GPQA Diamond | Qwen3.5-397B **88.4%** | Gemini-3-Pro 89.1% | 0.7% |
| AIME 2025 | Kimi K2.5 **96.1%** | Claude Opus 4.5 97.0% | 0.9% |

Ключевой фактор — **MoE-архитектура**: модели с 397B-1T параметров активируют только 17-37B за один токен. Это даёт frontier-качество при доступных вычислительных затратах.

---

## 9 ролей агентной команды

```
User Request
     │
     ▼
[Оркестратор] ──► [Аналитик требований] ──► [Исследователь]
     │                                            │
     ▼                                            ▼
[Промпт-инженер] ◄── [Архитектор] ◄──────────────┘
     │
     ▼
[Билдер] ──► [Тестировщик] ◄──► feedback loop
     │              │
     ▼              ▼
[Аудитор безопасности] ◄── [Критик]
```

| # | Роль | Задача | Критический бенчмарк |
|---|------|--------|---------------------|
| 1 | **Оркестратор** | Координация, декомпозиция задач, маршрутизация | GPQA, IFEval |
| 2 | **Аналитик требований** | Превращение запроса в структурированную спецификацию | IFEval |
| 3 | **Исследователь** | Сбор контекста: API, документация, существующие решения | MMLU-Pro |
| 4 | **Архитектор** | Техническая архитектура генерируемого агента | SWE-bench, GPQA |
| 5 | **Промпт-инженер** | Создание системных промптов, guardrails, tool configs | IFEval |
| 6 | **Билдер** | Генерация кода агента и конфигураций | HumanEval, Aider |
| 7 | **Тестировщик** | Юнит/интеграционные/e2e тесты, edge cases | SWE-bench |
| 8 | **Критик** | Целостная оценка качества, ревью промптов | tau-bench |
| 9 | **Аудитор безопасности** | Prompt injection, утечки данных, права доступа | MMLU-Pro |

---

## Маппинг модель → роль

### Почему именно эти модели

| Роль | Модель | Active Params | Почему именно она | VRAM (INT4) |
|------|--------|:---:|---|:---:|
| **Оркестратор** | Qwen3.5-397B | 17B | Лучший GPQA (88.4) + IFEval (92.6). Точнее всех следует инструкциям и глубже всех рассуждает — критично для координатора. | 50 GB |
| **Аналитик** | Qwen3-8B | 8B | Thinking/non-thinking mode для адаптивного диалога. Достаточно для структурированного вывода, экономит GPU. | 4 GB |
| **Исследователь** | Qwen3.5-397B | 17B | Shared с оркестратором (работают последовательно). Широкая база знаний для анализа. | shared |
| **Архитектор** | DeepSeek V3.2 | 37B | Сильнейший all-around: MMLU-Pro 85.0 + SWE-bench 73.1. Понимает и код, и архитектуру. | 85 GB |
| **Промпт-инженер** | Qwen3.5-397B | 17B | Лучший IFEval (92.6) = лучше всех понимает, что делает инструкции эффективными. | shared |
| **Билдер** | Qwen2.5-Coder-32B | 32B | HumanEval 92.7 (= GPT-4o), Aider 73.7. Золотой стандарт для локальной кодогенерации. | 16 GB |
| **Тестировщик** | Devstral Small 2 | 24B | SWE-bench 68.0 — понимает реальные кодовые базы, а не только toy-примеры. | 12 GB |
| **Критик** | GLM-4.7 | 32B | tau-bench 87.4 (лучший tool-use eval). Оценивает агент-специфичное качество. | 44 GB |
| **Аудитор** | DeepSeek V3.2 | 37B | Shared с архитектором. Широкие знания + понимание кода для поиска уязвимостей. | shared |

### Ключевой инсайт: 9 агентов = 3-4 модели

Роли работают **последовательно** в пайплайне. Агенты, которые никогда не запускаются одновременно, разделяют одну модель:

| Shared-инстанс | Роли | Почему можно шарить |
|-----------------|------|---------------------|
| Qwen3.5-397B | Оркестратор, Аналитик, Исследователь, Промпт-инженер | Оркестратор делегирует и ждёт — эти роли не пересекаются |
| Qwen2.5-Coder-32B / Devstral | Билдер, Тестировщик, Аудитор | Билдер заканчивает до старта тестов |
| GLM-4.7 / Ministral | Критик, Оценщик | Оба делают quality assessment, не одновременно |

---

## Развёртывание на 8x A100 80GB

```
8x A100 80GB — 640 GB Total VRAM
═══════════════════════════════════════════════════════

GPU 1 ▌ Qwen3.5-397B (INT4, ~50 GB)               ▐
       ▌ → Оркестратор + Аналитик                   ▐
       ▌ → Промпт-инженер + Исследователь (shared)  ▐

GPU 2 ▌ Qwen2.5-Coder-32B (INT4, ~16 GB)          ▐
       ▌ → Билдер                                   ▐
       ▌ + Devstral Small 2 24B (INT4, ~12 GB)     ▐
       ▌ → Тестировщик                              ▐

GPU 3 ▌ QwQ-32B (INT4, ~16 GB)                     ▐
       ▌ → Архитектор                               ▐
       ▌ + DeepSeek-R1-Qwen3-8B (INT4, ~4 GB)     ▐
       ▌ → Аудитор безопасности                     ▐

GPU 4 ▌ Ministral 14B (INT4, ~7 GB)                ▐
       ▌ → Критик                                   ▐
       ▌ + Falcon H1R-7B (INT4, ~4 GB)             ▐
       ▌ → Оценщик                                  ▐

GPU 5 ▌ Qwen малая модель (existing)               ▐
       ▌ → Router / Knowledge Manager               ▐

GPU 6-8 ▌ СВОБОДНЫ                                 ▐
        ▌ → A/B тесты, fine-tuning, нагрузка       ▐
```

**9 агентов, 8 моделей, 5 GPU задействованы. Утилизация VRAM: 109 GB / 640 GB (17%).**

---

## Квантизация

A100 не поддерживает FP8 нативно. Стратегия:

| Роль модели | Метод | Качество | Зачем |
|-------------|-------|:---:|---|
| Оркестратор, Критик | AWQ INT4 + Marlin | ~95% | Quality-critical роли. AWQ лучше GPTQ на 2-3%. |
| Билдер, Тестировщик | GPTQ INT4 + Marlin | ~93% | Throughput-critical. GPTQ чуть быстрее. |
| Малые модели (7-14B) | AWQ INT4 | ~95% | Разница между AWQ/GPTQ минимальна при <14B. |

Marlin kernels дают **10.9x ускорение** на A100 для INT4 инференса.

---

## Tier S: лидеры open-source (март 2026)

| Модель | Total / Active | Сильнейший результат | Лицензия |
|--------|:---:|---|:---:|
| **Kimi K2.5** | 1T / 32B | HumanEval 99.0, AIME 96.1, MATH 98.0 | MIT |
| **MiniMax M2.5** | 230B / 10B | SWE-bench **80.2** (лучший open-source) | Open |
| **GLM-5** | 744B / 40B | Arena Elo 1451 (топ среди open) | MIT |
| **DeepSeek V3.2** | 685B / 37B | MMLU-Pro 85.0, LiveCodeBench 83.3 | MIT |
| **Qwen3.5-397B** | 397B / 17B | GPQA **88.4**, IFEval **92.6** | Apache 2.0 |
| **GLM-4.7** | 355B / 32B | tau-bench **87.4** (лучший tool use) | Open |

---

## Принципы проектирования

1. **Точная делегация.** Каждый агент получает: цель, формат вывода, доступные инструменты, границы задачи. Размытая делегация проваливается (исследование Anthropic).

2. **Spec-driven, не code-driven.** Спецификации (ARD, TDD) — первичные артефакты. Код — производный.

3. **Обязательные feedback loops.** Builder ↔ Tester и Builder ↔ Critic — неотключаемые циклы. Ни один артефакт не финальный до ревью.

4. **Минимальный доступ.** Каждый агент получает только необходимые права. Security Auditor это контролирует.

5. **Fail fast.** Агент сообщает о неудаче немедленно, а не производит низкокачественный результат.

---

## Фазы внедрения

| Фаза | Агентов | Роли |
|------|:---:|---|
| **MVP** | 5 | Оркестратор, Аналитик, Архитектор, Билдер, Тестировщик |
| **Quality** | 7 | + Промпт-инженер, Критик |
| **Production** | 9 | + Исследователь, Аудитор безопасности |
| **Self-Improving** | 12 | + Deployer, Evaluator, Knowledge Manager |

---

## Источники

### Лидерборды
- [LMSYS Chatbot Arena](https://arena.ai/leaderboard)
- [LiveBench](https://livebench.ai/)
- [LiveCodeBench](https://livecodebench.github.io/leaderboard.html)
- [Berkeley Function Calling Leaderboard V4](https://gorilla.cs.berkeley.edu/leaderboard.html)
- [SWE-bench Verified](https://epoch.ai/benchmarks/swe-bench-verified)
- [Aider LLM Leaderboards](https://aider.chat/docs/leaderboards/)

### Архитектура мульти-агентных систем
- [Anthropic: Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system) — orchestrator-worker, 90% improvement
- [MetaGPT (ICLR 2024)](https://arxiv.org/html/2308.00352v6) — `Code = SOP(Team)`
- [Agentsway (arXiv)](https://arxiv.org/html/2510.23664v1) — Prompting Agent, Fine-Tuning Agent
- [metaswarm](https://github.com/dsifry/metaswarm) — `IMPLEMENT → VALIDATE → ADVERSARIAL REVIEW → COMMIT`

### Модели
- [Kimi K2.5](https://huggingface.co/moonshotai/Kimi-K2.5) | [MiniMax M2.5](https://huggingface.co/MiniMaxAI/MiniMax-M2.5) | [GLM-5](https://huggingface.co/zai-org/GLM-5)
- [DeepSeek V3.2](https://huggingface.co/deepseek-ai/) | [Qwen3.5](https://github.com/QwenLM/Qwen3.5) | [GLM-4.7](https://huggingface.co/zai-org/)
- [Qwen2.5-Coder-32B](https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct) | [Devstral Small 2](https://mistral.ai/news/devstral-2-vibe-cli)

---

## Запуск локально

```bash
cd website
npm install
npm run dev
```

## Деплой на GitHub Pages

```bash
cd website
npm run deploy
```

Сайт: **https://ignatpenshin.github.io/agent-factory-design/**
