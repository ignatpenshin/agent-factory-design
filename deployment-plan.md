# Agent Factory: Deployment Plan

> **Кластер:** 8x A100 80GB (SberData), 640 GB VRAM total
> **Уже запущено:** 3 малые модели Qwen на инференсе
> **В ожидании:** B200 серверы (upgrade path)
> **Inference engine:** Внутренний (SberData platform)

---

## Рекомендация: модель-оркестратор

### Qwen3.5-397B — лучший выбор для вашей ситуации

| Критерий | Qwen3.5-397B | DeepSeek V3.2 | Kimi K2.5 |
|----------|:---:|:---:|:---:|
| Active params | **17B** | 37B | 32B |
| Total params | 397B | 685B | ~1T |
| VRAM (INT4) | **~50 GB (1x A100)** | ~85 GB (2x A100) | ~125 GB (2x A100) |
| GPQA Diamond | **88.4** | ~79.9 | 87.6 |
| IFEval | **92.6** | ~85 | 94.0 |
| MMLU-Pro | **87.8** | 85.0 | 87.1 |
| SWE-bench | 76.4 | 73.1 | **76.8** |
| LiveCodeBench | 83.6 | **83.3** | 85.0 |
| Лицензия | Apache 2.0 | MIT | MIT |
| Экосистема Qwen | **Да (единая)** | Нет | Нет |

**Почему Qwen3.5-397B:**

1. **Влезает на 1x A100 80GB** при INT4 (~50 GB + KV cache). DeepSeek V3.2 и Kimi K2.5 требуют 2x A100.
2. **Единая экосистема** с вашими малыми Qwen-моделями — проще ops, общие токенизаторы, совместимые форматы.
3. **17B active params** = самый быстрый инференс среди тройки. При оркестрации скорость критична — оркестратор на критическом пути каждого запроса.
4. **Лучшие IFEval + GPQA** = лучше понимает сложные инструкции и глубоко рассуждает. Это ключевое для оркестратора.

---

## Развёртывание на 8x A100 80GB

### Фаза 1: Быстрый старт (сейчас)

Используем то, что есть + добавляем оркестратор. Минимальный набор для первого рабочего пайплайна.

```
8x A100 80GB — 640 GB Total
═══════════════════════════════════════════════════════

GPU 1 ▌ Qwen3.5-397B (INT4, ~50 GB)               ▐
       ▌ → Orchestrator                             ▐
       ▌ → Requirements Analyst (shared, sequential)▐
       ▌ → Prompt Engineer (shared, sequential)     ▐
       ▌ Свободно: ~30 GB (KV cache)               ▐

GPU 2 ▌ Qwen2.5-Coder-32B (INT4, ~16 GB)          ▐
       ▌ → Builder                                  ▐
       ▌ → Security Auditor (shared, sequential)    ▐
       ▌ Свободно: ~64 GB                          ▐

GPU 3 ▌ Qwen малая модель #1 (уже запущена)        ▐
       ▌ → Tester                                   ▐

GPU 4 ▌ Qwen малая модель #2 (уже запущена)        ▐
       ▌ → Critic / Evaluator                       ▐

GPU 5 ▌ Qwen малая модель #3 (уже запущена)        ▐
       ▌ → Researcher                               ▐

GPU 6-8 ▌ СВОБОДНЫ — для экспериментов, A/B тестов ▐
        ▌ и второй очереди                          ▐
```

**5 агентов, 4 модели (1 новая), 5 GPU задействованы, 3 GPU свободны.**

| Роль | Модель | GPU | VRAM | Статус |
|------|--------|-----|------|--------|
| Orchestrator | Qwen3.5-397B | 1 | ~50 GB | **ЗАГРУЗИТЬ** |
| Req. Analyst | Qwen3.5-397B (shared) | 1 | — | shared |
| Prompt Engineer | Qwen3.5-397B (shared) | 1 | — | shared |
| Builder | Qwen2.5-Coder-32B | 2 | ~16 GB | **ЗАГРУЗИТЬ** |
| Tester | Qwen малая (existing) | 3 | existing | уже есть |
| Critic | Qwen малая (existing) | 4 | existing | уже есть |
| Researcher | Qwen малая (existing) | 5 | existing | уже есть |
| Security Auditor | Qwen2.5-Coder-32B (shared) | 2 | — | shared |

**Действия для старта:**
1. Скачать и квантизировать Qwen3.5-397B (AWQ INT4 + Marlin для A100)
2. Скачать Qwen2.5-Coder-32B-Instruct (AWQ INT4)
3. Поднять инференс на GPU 1 и GPU 2
4. Переназначить существующие малые модели под роли Tester/Critic/Researcher

---

### Фаза 2: Полная команда (через 1-2 недели)

Добавляем специализированные модели для качественного скачка.

```
8x A100 80GB — 640 GB Total
═══════════════════════════════════════════════════════

GPU 1 ▌ Qwen3.5-397B (INT4, ~50 GB)               ▐
       ▌ → Orchestrator + Req. Analyst              ▐
       ▌ → Prompt Engineer + Researcher (shared)    ▐

GPU 2 ▌ Qwen2.5-Coder-32B (INT4, ~16 GB)          ▐
       ▌ → Builder                                  ▐
       ▌ + Devstral Small 2 24B (INT4, ~12 GB)     ▐
       ▌ → Tester (dedicated code tester)           ▐
       ▌ Занято: ~28 GB, свободно: ~52 GB          ▐

GPU 3 ▌ QwQ-32B (INT4, ~16 GB)                     ▐
       ▌ → Architect (deep reasoning)               ▐
       ▌ + DeepSeek-R1-0528-Qwen3-8B (INT4, ~4 GB)▐
       ▌ → Security Auditor (adversarial reasoning) ▐
       ▌ Занято: ~20 GB, свободно: ~60 GB          ▐

GPU 4 ▌ Ministral 14B Reasoning (INT4, ~7 GB)      ▐
       ▌ → Critic (quality reviewer)                ▐
       ▌ + Falcon H1R-7B (INT4, ~4 GB)             ▐
       ▌ → Evaluator (pipeline quality scoring)     ▐
       ▌ Занято: ~11 GB, свободно: ~69 GB          ▐

GPU 5 ▌ Qwen малая модель (existing)               ▐
       ▌ → Router / Intent classifier               ▐
       ▌ → Knowledge Manager                        ▐

GPU 6-8 ▌ СВОБОДНЫ для:                            ▐
        ▌ - A/B тестирование новых моделей          ▐
        ▌ - Fine-tuning на ваших tool schemas       ▐
        ▌ - Пользовательские запросы (нагрузка)     ▐
```

**9 агентов, 8 моделей, 5 GPU, 3 GPU свободны.**

| Роль | Модель | Active Params | GPU | VRAM |
|------|--------|:---:|:---:|:---:|
| Orchestrator | Qwen3.5-397B | 17B | 1 | 50 GB |
| Req. Analyst | Qwen3.5-397B *(shared)* | — | 1 | — |
| Researcher | Qwen3.5-397B *(shared)* | — | 1 | — |
| Prompt Engineer | Qwen3.5-397B *(shared)* | — | 1 | — |
| Builder | Qwen2.5-Coder-32B | 32B | 2 | 16 GB |
| Tester | Devstral Small 2 | 24B | 2 | 12 GB |
| Architect | QwQ-32B | 32B | 3 | 16 GB |
| Security Auditor | DeepSeek-R1-Qwen3-8B | 8B | 3 | 4 GB |
| Critic | Ministral 14B Reasoning | 14B | 4 | 7 GB |
| Evaluator | Falcon H1R-7B | 7B | 4 | 4 GB |
| Router | Qwen малая (existing) | ~3-7B | 5 | existing |
| **Итого** | **8 уникальных моделей** | | **5 GPU** | **~109 GB** |

---

### Фаза 3: B200 Upgrade Path

Когда придут B200 (192 GB HBM3e, 8 TB/s bandwidth):

```
Миграция: A100 → B200
══════════════════════

B200 Преимущества:
• 192 GB VRAM (vs 80 GB) — Qwen3.5-397B в FP8 на 1 GPU
• Native FP8 — 99%+ качества без потерь квантизации
• 8 TB/s bandwidth — 2.4x быстрее A100
• 4.87x быстрее на тяжёлых задачах с tensor parallelism

Что это даёт:
• Переход с INT4 на FP8 = +5-8% качества на всех моделях
• Можно поднять DeepSeek V3.2 (685B MoE) как Architect на 1x B200
• Или GLM-4.7 (355B MoE) как Critic с tau-bench 87.4%
• 1x B200 заменяет ~2x A100 по ёмкости и ~3x по скорости
```

| A100 Plan (сейчас) | B200 Plan (upgrade) | Выигрыш |
|---------------------|---------------------|---------|
| Qwen3.5-397B INT4 на 1x A100 | Qwen3.5-397B **FP8** на 1x B200 | +5% качество, 2x скорость |
| QwQ-32B как Architect | **DeepSeek V3.2 FP8** на 1x B200 | MMLU-Pro 85.0, SWE-bench 73.1 |
| Ministral 14B как Critic | **GLM-4.7 FP8** на 1x B200 | tau-bench 87.4% (tool eval) |
| 5 GPU заняты | 3 B200 заняты (больше мощности) | Освобождение ресурсов |

---

## Квантизация для A100

A100 **не поддерживает FP8 нативно**. Оптимальная стратегия:

| Роль модели | Метод квантизации | Почему |
|-------------|------------------|--------|
| Orchestrator (Qwen3.5-397B) | **AWQ INT4 + Marlin** | Marlin даёт 10.9x ускорение на A100. Качество-критичная роль — AWQ лучше GPTQ на 2-3%. |
| Builder (Qwen2.5-Coder-32B) | **GPTQ INT4 + Marlin** | Throughput-критичная роль, GPTQ чуть быстрее. |
| Малые модели (7-14B) | **AWQ INT4** | При <14B разница между AWQ и GPTQ минимальна. |

**Важно:** Проверьте совместимость Marlin kernels с вашим inference engine. Если внутренний движок не поддерживает Marlin — стандартный AWQ INT4 тоже хорош (~95% качества).

---

## Приоритетный план действий

```
НЕДЕЛЯ 1: Quick Start
├── [1] Скачать Qwen3.5-397B-Instruct AWQ INT4
├── [2] Скачать Qwen2.5-Coder-32B-Instruct AWQ INT4
├── [3] Развернуть на GPU 1 и GPU 2
├── [4] Написать system prompts для Orchestrator и Builder
├── [5] Первый E2E тест: user request → agent generation
│
НЕДЕЛЯ 2: Роли и пайплайн
├── [6] Определить system prompts для всех 9 ролей
├── [7] Реализовать artifact-based коммуникацию между агентами
├── [8] Реализовать Orchestrator → Builder → Tester pipeline
├── [9] Настроить feedback loop (Tester → Builder)
│
НЕДЕЛЯ 3-4: Специализация
├── [10] Добавить QwQ-32B как Architect
├── [11] Добавить Devstral-24B как Tester
├── [12] Добавить Ministral-14B как Critic
├── [13] Benchmark: сравнить качество vs. Фаза 1
│
ДАЛЕЕ: Оптимизация
├── Fine-tune малые модели на ваши tool schemas
├── A/B тесты альтернативных моделей на свободных GPU
├── Миграция на B200 когда серверы будут готовы
```

---

## Стоимость ресурсов (текущий кластер)

| Фаза | GPU заняты | GPU свободны | Утилизация |
|------|:---:|:---:|:---:|
| Quick Start | 5 из 8 | 3 | 62% |
| Полная команда | 5 из 8 | 3 | 62% |
| С fine-tuning | 7 из 8 | 1 | 87% |

**Ключевой инсайт:** Благодаря MoE-архитектуре (Qwen3.5-397B = 17B active) и model sharing (9 агентов на 5 GPU), вся фабрика агентов потребляет **~109 GB из 640 GB доступных** — всего 17% VRAM. Остаток — на KV cache, параллельные запросы, и эксперименты. Ресурсов достаточно с запасом.
