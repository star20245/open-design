# Open Design 架构迁移分析：构建 PRD Agent 的复用方案

> 本文档系统分析了 Open Design（OD）的完整架构设计，并逐层/逐系统评估了将其迁移到"需求文档编写 Agent"场景时的复用度、改动量和适配策略。

---

## 目录

1. [OD 设计哲学总览](#1-od-设计哲学总览)
2. [七层 Prompt 架构详解](#2-七层-prompt-架构详解)
3. [PRD Agent 逐层适配](#3-prd-agent-逐层适配)
4. [支持系统复用分析](#4-支持系统复用分析)
5. [改动量评估与优先级](#5-改动量评估与优先级)

---

## 1. OD 设计哲学总览

### 1.1 核心原则

OD 的设计哲学可以凝练为以下几个核心原则：

| 原则 | 含义 | 对 PRD Agent 的适用性 |
|---|---|---|
| **不拥有 Agent** | 委托用户已有的 CLI 工具，不自己实现 agent 循环 | 完全适用——PRD 同样需要调用 Claude Code/Codex 等 |
| **文件即契约** | 所有持久化状态用纯文本文件（Markdown/YAML/JSONL），可 git 版本化 | 完全适用——PRD 文档天然适合 git 管理 |
| **三轴组合** | Skills × Design Systems × Craft 独立演化、按需组合 | 完全适用——映射为 Skills × PRD Schema × Quality Rules |
| **反 AI 套路** | 用 linter 硬性规则兜底，弥补 prompt 的概率性不可靠 | 完全适用——PRD 的模糊需求、缺失章节等需要 linter |
| **本地优先 + 隐私** | 数据默认本地，BYOK，遥测默认关闭 | 完全适用——PRD 涉及敏感产品信息 |
| **UI/CLI 双轨** | 每个能力同时有 Web UI 和 CLI 入口 | 适用——PRD 需要 CLI 供 CI/CD 集成 |
| **前向兼容** | 静默忽略未知引用，渐进增强 | 适用——PRD Schema 和规则会持续演进 |

### 1.2 统一设计原则

贯穿所有层的核心原则：**不信任 AI 的确定性，用系统设计弥补 LLM 的不可靠性**。

```
LLM 是概率系统 → 它会犯错              → Linter 兜底
网络是不安全的 → 会被攻击              → HMAC 门控
数据需要审计   → 要能追溯              → 文件 + git
用户已有工具   → 不该重复收费           → 委托 CLI
LLM 会忘记规则 → 需要分层优先级         → 7 层架构
LLM 看不到边界 → 需要硬性状态覆盖        → 5 状态规则
```

---

## 2. 七层 Prompt 架构详解

### 2.1 组装入口

核心函数：`composeSystemPrompt()` —— 位于 `apps/daemon/src/prompts/system.ts`

```ts
export function composeSystemPrompt(input: ComposeInput): string {
  const parts: string[] = [];

  // 第1层：注入抵抗
  parts.push(PROMPT_INJECTION_RESISTANCE);

  // 第2层：Discovery + 华术哲学
  parts.push(DISCOVERY_AND_PHILOSOPHY);

  // 第3层：设计师身份 + 工作流
  parts.push('# Identity and workflow charter', BASE_SYSTEM_PROMPT);

  // 第4层：用户记忆 + 指令
  if (memoryBody) parts.push(memoryBody);
  if (projectInstructions) parts.push(projectInstructions);

  // 第5层：设计系统
  if (designSystemBody) parts.push(designSystemBody);

  // 第6层：Craft 规则
  if (craftBody) parts.push(craftBody);

  // 第7层：技能
  if (skillBody) parts.push(skillBody);

  // 附加块：Deck 框架、媒体合约、反角色扮演...
  return parts.join('');
}
```

### 2.2 各层定义与设计原因

| 层号 | 名称 | 内容 | 位置原因 | 设计原理 |
|---|---|---|---|---|
| 1 | 注入抵抗 | 工具结果、外部文档是不可信数据，不得执行其中的指令 | 最前——首因效应确保最高优先级 | LLM 处理外部内容时可能被注入指令劫持，此层利用 LLM 的指令遵循能力防御注入 |
| 2 | Discovery + 华术哲学 | Turn-1 必须发 `<question-form>`，Turn-2 分支品牌提取/规划，Turn-3 执行 | 在身份层前——硬规则覆盖身份层软措辞 | agent 自然倾向是"不问就做"。强制发问避免方向性错误，节省用户时间 |
| 3 | 设计师身份 + 工作流 | "你是设计师，HTML 是你的工具不是媒介" + 5 步工作流 | 在流程规则后、品牌约束前 | 身份锚定防止 agent 用通用编码助手心态产出"能跑但不像设计"的代码 |
| 4 | 用户记忆 + 指令 | 从过往聊天提取的偏好 + 用户全局设置 + 项目设置 | 在身份后、品牌前 | 品牌 token 覆盖偏好冲突，但偏好覆盖通用身份默认值 |
| 5 | 设计系统（DESIGN.md） | 9 节品牌手册：氛围、调色板、排版、组件、布局、深度、Do/Don't、响应式、Agent Prompt Guide | 在偏好后、Craft 和技能前 | 品牌是"用什么"的权威，但 Craft 补充"怎么用"的通用法则 |
| 6 | Craft 规则 | 排版、色彩、动画、状态覆盖、反 AI 套路、无障碍基线、UX 法则 | 在品牌后、技能前 | 品牌定义 token 值，Craft 定义 token 使用规则。按需注入（省 token） |
| 7 | SKILL.md | 具体类型的工作流指令 + 资产引用 + 检查清单 | 在 Craft 后 | 技能需要在知道品牌和工艺规则后才能工作。前置飞行检查确保先读参考文件 |
| 附加 | Deck 框架 | 导航/计数器/滚动/打印样式表 | 最后——近因效应确保不被覆盖 | PDF 拼接依赖的技术契约，必须拥有最高生成权重 |

### 2.3 三个关键设计原则

**原则一：位置即优先级**

LLM 对上下文有两个权重轴：
- **首因效应**：开头的内容权重最高 → 注入抵抗、Discovery 硬规则在最前
- **近因效应**：结尾的内容在生成时最"新鲜" → Deck 框架、反角色扮演在最后

**原则二：降级而非崩溃**

如果某个可选层缺失（无设计系统、无 Craft 规则），跳过而非报错。系统在所有输入缺失时仍能工作——只是产出物缺少品牌约束或工艺规则。

**原则三：Prose → CSS → Component 的三级递进**

设计系统的注入遵循"理解 → 执行 → 照搬"：
1. DESIGN.md（prose）→ agent 理解设计系统的灵魂
2. tokens.css（CSS 值）→ agent 把精确值粘贴到 `<style>`
3. components.html（组件形状）→ agent 照搬按钮/卡片/排版的结构

---

## 3. PRD Agent 逐层适配

### 3.1 整体映射

```
Open Design 架构          →   PRD Agent 架构
─────────────────────────     ─────────────────────────
第1层 注入抵抗               → 完全相同，直接复用
第2层 Discovery + 华术哲学    → PRD Discovery（产品探索表单）
第3层 设计师身份 + 工作流     → PM/需求分析师身份 + 工作流
第4层 用户记忆 + 指令         → 公司记忆 + 产品偏好 + PRD 规范指令
第5层 DESIGN.md（品牌）       → PRD Schema（模板/章节结构）
第6层 Craft（工艺规则）       → PRD Quality Rules（需求质量标准）
第7层 SKILL.md（技能）        → PRD Type Skills（文档类型技能）
```

### 3.2 第1层：注入抵抗 — 直接复用，0% 改动

PRD Agent 同样会读取外部文件（竞品分析、用户调研、代码库），同样面临注入风险。内容一字不改。

### 3.3 第2层：Discovery — 重写问题内容，20% 改动

OD 问什么：任务类型、受众、品牌背景、规模、约束。

PRD 需要问什么：

```
Q1: 产品类型？B2C / B2B / 内部工具 / 平台 / API / 其他
Q2: 核心问题？这个产品要解决什么问题？（限一句话）
Q3: 目标用户？使用者画像 — 角色、场景、技术水平
Q4: 现有系统状态？从零开始 / 已有代码库 / 重构/迁移
Q5: PRD 范围？MVP / 完整 V1 / 功能增量
Q6: 文档用途？给工程团队 / 给投资人/管理层 / 给设计师和 PM
Q7: 硬性约束？截止日期、技术栈、合规、预算
```

**差异化设计**：OD 的 Discovery 是强制性的（不做就不知道要做什么）。PRD 需要更智能的跳过逻辑——如果用户输入已包含完整产品描述，则跳过 Discovery。

### 3.4 第3层：身份 + 工作流 — 重写身份定义，50% 改动

OD 的身份：expert designer, HTML is your tool, not your medium.

PRD 的身份：

```
You are an expert product manager and requirements analyst. You produce
precise, actionable, testable product requirements documents. Your output
is structured prose, not code — although you understand technical concepts
deeply enough to distinguish what's feasible from what's wishful thinking.

Every requirement must be testable.
Every user story must follow: "As a [role], I want [goal], so that [reason]".
Distinguish MUST (required), SHOULD (recommended), MAY (optional).

Output format:
<artifact identifier="..." type="text/markdown" title="PRD Title">
...
</artifact>
```

### 3.5 第4层：用户记忆 + 指令 — 改提取内容，30% 改动

OD 存什么：品牌偏好、设计偏好、过去聊过的项目。

PRD 存什么：

```markdown
- [company_acme-corp] → 公司信息、技术栈、合规要求
- [product_omnidb] → 产品名称、类型、目标用户、竞品
- [user_pm-prefs] → 文档格式偏好、必须包含的章节
```

提取 prompt 需要改为：

```
从以下对话中提取与 PRD 相关的长期记忆：
- 公司信息（名称、规模、行业、合规要求）
- 产品信息（名称、类型、目标用户）
- 技术约束（技术栈、性能预算、平台要求）
- 竞品引用（竞品名称、参考功能）
- 用户偏好（文档格式偏好、必须包含的章节）
```

### 3.6 第5层：PRD Schema 模板 — 100% 新设计

这是核心创新点。OD 的 DESIGN.md 定义颜色/排版/组件；PRD 的 SCHEMA.md 定义文档结构。

**10 节 Schema 结构**：

| 节号 | 名称 | 内容 |
|---|---|---|
| 1 | Document Meta | 标题、版本、状态、作者、审批人 |
| 2 | Executive Summary | 一句话 + 一段话：是什么、为什么现在做、改变了什么 |
| 3 | Problem Statement | 当前状态、痛点（谁感受、频率、严重度）、为什么现有方案不够 |
| 4 | User Personas & Stories | 用户画像 + Epic → User Stories + 优先级 |
| 5 | Functional Requirements | 功能需求表：ID、描述、优先级、验收条件 |
| 6 | Non-Functional Requirements | 性能、可访问性、安全、数据 |
| 7 | Out of Scope | 明确不做什么，防止范围蔓延 |
| 8 | Dependencies & Risks | 内部依赖、外部 API、迁移风险 |
| 9 | Success Metrics | SMART 目标：怎么知道成功了 |
| 10 | Agent Prompt Guide | 给 agent 的生成规则：FR-ID 必须映射到用户故事、用主动语态 |

**多模板支持**（类比 OD 的 150 个设计系统）：

- `standard-prd` — 完整 PRD
- `lean-canvas` — 精益画布
- `agile-epic` — Epic + User Stories
- `gdd` — 游戏设计文档（Game Design Document）
- `medical-device` — 医疗器械合规 PRD
- `api-spec` — API 需求文档

### 3.7 第6层：PRD 质量规则 — 规则内容全新，80% 改动

类比 OD 的 6 个 Craft 文件：

| 规则 | 内容 | 对应 OD Craft |
|---|---|---|
| **R0: 无模糊需求** (P0) | 扫描 "user-friendly"/"fast"/"good UX"/"scalable"/"robust"/"intuitive" 等模糊词 | 对应 anti-ai-slop.md |
| **R1: 用户故事完整** (P0) | 每个故事必须有 persona、目标（动词开头）、原因、验收条件 | 对应 state-coverage.md |
| **R2: 范围分级** (P1) | 每个需求必须带 P0/P1/P2 优先级。P0 占比 >30% 是范围膨胀信号 | 对应 color.md 的 accent 上限 |
| **R3: 非功能需求底线** (P1) | 性能预算、可访问性目标、安全考虑必须存在 | 对应 accessibility-baseline.md |
| **R4: Out of Scope 明确** (P1) | 没有 Out of Scope 章节 = 范围蔓延保证 | 对应 typography.md 的 ALL CAPS 规则 |
| **R5: 无填充** (P0) | 不写 "robust and scalable" 类空话、不发明虚构指标 | 对应 anti-ai-slop.md |
| **R6: 依赖具体** (P2) | 每个依赖必须命名外部系统、具体需要什么、没有时怎么办 | 对应 laws-of-ux.md |

**Linter 机制**（复用 `lint-artifact.ts` 框架）：

```ts
// 扫描模糊词
const VAGUE = /user-friendly|fast|good UX|scalable|robust|intuitive/gi;

// 检查用户故事格式
const STORY_FORMAT = /^As (?:a|an) .+?, I want .+?, so that .+\.$/;

// 检查 P0 占比
function checkP0Ratio(md: string): LintFinding | null {
  const total = countRequirements(md);
  const p0 = countP0Requirements(md);
  if (total > 0 && p0 / total > 0.3) {
    return { severity: 'P1', id: 'p0-scope-bloat', ... };
  }
  return null;
}
```

### 3.8 第7层：PRD 类型技能 — 内容全新，60% 改动

类比 OD 的 SKILL.md：

```markdown
# SKILL.md — Greenfield Product PRD

## od
kind: skill
taskKind: prd
mode: greenfield
capabilities: [prompt:inject]

## od.craft
requires: [prd-quality, scope-triage, non-functional-floor]

## Workflow

Pre-flight: Read references/prd-template.md and references/example.md.

### Step 1 — Context gathering
If user hasn't provided: target users, problem, competition → ask.

### Step 2 — Persona development
2-4 concrete personas: name, role, tech level, pain, goal.

### Step 3 — Epic & story mapping
Organize into epics, break into user stories. INVEST principle.

### Step 4 — Write the PRD
Follow SCHEMA.md section by section.

### Step 5 — Self-review
Run quality rules. P0: fix before output. P1: fix or flag. P2: flag.

## Assets
- references/prd-template.md
- references/example.md
- references/user-story-checklist.md
```

---

## 4. 支持系统复用分析

### 4.1 系统全景图

```
                        ┌──────────────────────┐
                        │   七层 Prompt 架构     │  ← 核心引擎
                        └──────────┬───────────┘
                                   │
        ┌──────────┬──────────┬────┴────┬──────────┬──────────┐
        │          │          │         │          │          │
    Agent适配器  Chat/SSE  Artifact   Linter   Critique   Memory
        │          │        Writer+    系统     Theater    系统
        │          │        Store       │        │          │
        │          │          │         │        │          │
    ┌───┴───┐  ┌───┴───┐  ┌───┴───┐ ┌───┴───┐ ┌──┴──┐  ┌──┴──┐
    │22 CLI │  │SSE流  │  │文件存储│ │P0/P1  │ │5评审│  │记忆  │
    │适配器 │  │事件类型│  │JSONL  │ │规则扫描│ │协议 │  │提取  │
    └───────┘  └───────┘  └───────┘ └───────┘ └─────┘  └─────┘

    ───────────────────────────────────────────────────────────

    Plugin/     Connectors    Schema         Media       Project
    Pipeline    (Composio)    Resolver     Generation    Routes
```

### 4.2 逐系统分析

#### 系统 1：Agent 适配器 — 复用度 90%

代理工具（22 个 CLI）的检测和启动。

| 字段 | OD 取值 | PRD 取值 | 说明 |
|---|---|---|---|
| id | claude/codex/gemini... | 完全复用 | 调用同样的 CLI |
| buildArgs | 传 HTML 生成 prompt | 传 PRD 生成 prompt | prompt 内容变更，拼命令行逻辑不变 |
| streamFormat | claude-json/plain | 完全复用 | 输出格式不变 |
| promptViaStdin | true/false | 完全复用 | 物理限制不变 |
| authProbe | 认证探测 | 完全复用 | 认证机制不变 |

**结论**：不需要改框架代码。prompt 内容变了不影响适配器。

#### 系统 2：Chat Routes + SSE 流 — 复用度 85%

HTTP endpoint `/api/chat`，接收请求，组装 prompt，spawn agent，SSE 流式返回。

| 事件类型 | 是否复用 | 说明 |
|---|---|---|
| text_delta | 复用 | PRD 输出也是文本流 |
| tool_use | 复用 | agent 照样读代码库、写文件 |
| thinking | 复用 | 思考过程对 PRD 同样有价值 |
| live_artifact | 需要改 | 检测从 text/html 扩展为 text/markdown |
| status | 复用 | "正在分析竞品..." 同样是状态 |
| usage | 复用 | token 统计不变 |

**关键修改**：artifact 检测逻辑从只识别 `.html` 扩展为也识别 `.md`。

#### 系统 3：Artifact Writer + Artifact Store — 复用度 75%

解析 agent 输出中的 `<artifact>` 标签，写入文件系统。

**好消息**：`text/markdown` 已在 MIME 白名单中：

```ts
const ARTIFACT_MIME_EXTENSIONS = {
  'text/html': 'html',
  'text/markdown': 'md',    // 已有
  // ...
};
```

PRD 的 artifact 标记：

```
<artifact identifier="payment-prd" type="text/markdown" title="Payment System PRD">
# Product Requirements Document
...
</artifact>
```

**需要改什么**：基本不用改。可选增强：多文件 artifact 支持、PDF/DOCX 导出。

#### 系统 4：Lint 系统 — 复用模式，内容全新（80%）

agent 产出后自动运行 grep 式规则扫描，P0 发现回传给 agent 自修正。

OD 的 linter 扫描：靛蓝色、双停渐变、emoji 图标。

PRD 的 linter 扫描：模糊词、用户故事格式、P0 占比、缺失章节。

**结论**：linter 框架（扫描 → 分类 → 回传 → 自修正）完全复用。只替换规则内容。

#### 系统 5：Memory 系统 — 复用度 90%

文件系统上的 Markdown 记忆存储，自动从聊天中提取用户偏好。

| 维度 | OD 提取 | PRD 提取 |
|---|---|---|
| 公司信息 | 不提取 | 名称、规模、行业、合规 |
| 产品信息 | 不提取 | 名称、类型、用户、竞品 |
| 技术约束 | 部分提取 | 技术栈、性能预算、平台 |
| 设计偏好 | 提取颜色/字体 | 提取文档格式、章节偏好 |

**需要改什么**：提取 prompt 替换为产品上下文提取逻辑。

#### 系统 6：Critique Theater — 复用度 70%

agent 作为多位评委自我评审，多轮迭代改进产出。

| OD 评委 | PRD 评委 | 评审维度 |
|---|---|---|
| DESIGNER | PM | 产出 PRD（不评分） |
| CRITIC | ENGINEER | 实现可行性、API 合理性、边界情况 |
| BRAND | DESIGNER | 用户故事质量、Persona 准确度、验收条件 |
| A11Y | QA | 可测试性、状态覆盖、非功能需求 |
| COPY | STAKEHOLDER | 商业对齐、成功指标、范围、风险 |

**协议骨架**（CRITIQUE_RUN / ROUND / PANELIST / MUST_FIX / SHIP）完全相同。
只替换 panelist 定义、DIM 维度名称、评分权重。

#### 系统 7：Plugin/Pipeline — 复用度 60%

多阶段插件执行系统。

| OD 的管道阶段 | PRD 的管道阶段 |
|---|---|
| Discovery | Research（代码分析、竞品审查、用户调研） |
| Draft | Structure（Persona 开发、Epic 映射） |
| Build | Writing（功能规格、非功能规格、用户故事） |
| Review | Review（自评、质量检查、利益相关者审查） |

管道框架完全复用。原子内容从"生成 HTML 按钮"改为"写功能规格段落"。

#### 系统 8：Connectors/Composio — 复用度 90%

通过 Composio 连接外部服务。

| 连接器 | OD 用途 | PRD 用途 |
|---|---|---|
| GitHub | 读取代码参考 | **读取现有代码库，分析架构和接口** |
| Jira | 不常用 | **读取已有 issue/epic，作为需求输入** |
| Notion | 设计文档 | **读取产品 spec、会议纪要、用户调研** |
| Slack | 不常用 | **读取产品讨论、用户反馈频道** |
| Linear | 不常用 | **读取已有任务，了解上下文** |

连接器框架完全复用。只增加 PRD 场景的目标服务类型。

#### 系统 9：Schema Resolver — 替代 Design System Resolver（100% 新）

```
prd-schemas/                    ← 替代 design-systems/
├── standard/
│   ├── SCHEMA.md               ← 替代 DESIGN.md
│   └── example.md
├── lean-canvas/
│   ├── SCHEMA.md
│   └── example.md
├── agile-epic/
│   ├── SCHEMA.md
│   └── example.md
├── gdd/
│   └── SCHEMA.md
└── medical-device/
    └── SCHEMA.md
```

解析逻辑和注入逻辑相同：读到 SCHEMA.md 全文件内容 → 注入到第 5 层。

#### 系统 10：Media Generation — 替换为文档导出（100% 新）

OD 通过 fal/Replicate 生成图片/视频/音频。PRD 不需要。

替换为文档导出：`POST /api/export?format=pdf|docx&source=prd.md`

可复用部分：异步任务调度机制（`media generate` + `media wait` 循环）。

#### 系统 11：Project Routes — 复用度 85%

| 路由 | 改动 |
|---|---|
| POST /api/projects | 增加 kind: "prd" 类型 |
| GET /api/projects/:id/files | 默认显示 .md 文件 |
| POST /api/projects/:id/files | 支持 PDF/DOCX 参考文件 |
| 项目元数据 | 增加 prdType、schemaId、targetAudience |

#### 系统 12：Realtime Events (SSE) — 复用度 95%

新增事件类型：

```
linter_findings    → PRD 质量检查结果
schema_changed     → 用户切换了 PRD 模板
review_round       → Critique Theater 新评审轮次
```

事件框架不变，增加少量事件类型。

---

## 5. 改动量评估与优先级

### 5.1 改动量总览

```
                         ┌──────────────────────────┐
                         │    七层 Prompt 架构        │
                         │  (改各层常量内容)          │
                         └────────────┬─────────────┘
                                      │
    ┌─────────────┬──────────────┬────┴────┬──────────────┬──────────────┐
    │             │              │         │              │              │
Agent适配器     Chat/SSE      Artifact   Linter        Critique      Memory
完全复用       artifact检测     Store    规则内容全新    Theater      提取逻辑改
              .html→.md       .md已有   框架复用        评委+维度重定义  公司/产品事实
    │             │              │         │              │              │
    └─────────────┴──────────────┴────┬────┴──────────────┴──────────────┘
                                      │
    ┌─────────────┬──────────────┬────┴────┬──────────────┐
    │             │              │         │              │
Plugin/        Connectors     Schema     Media          Project
Pipeline       GitHub/Jira    Resolver   Generation     Routes
原子内容改     增加PRD场景    DESIGN→    替换为         增加kind:
发现→研究       复用框架      SCHEMA     文档导出       "prd"
草稿→写作
评审→审查
```

### 5.2 改动量统计

| 系统 | 状态 | 改动程度 | 说明 |
|---|---|---|---|
| Agent 适配器 | 直接复用 | 0% | prompt 内容变化不影响适配器 |
| Chat Routes + SSE | 小幅扩展 | 5% | artifact 检测扩展 .md |
| Artifact Store | 基本复用 | 5% | .md 已在白名单 |
| Lint 系统 | 规则全新 | 80% 内容 / 0% 框架 | 框架完全复用 |
| Memory 系统 | 小幅修改 | 30% | 提取 prompt 重写 |
| Critique Theater | 定义重写 | 60% | 评委/维度重定义，协议骨架不变 |
| Plugin/Pipeline | 内容替换 | 40% | 原子内容替换 |
| Connectors | 小幅扩展 | 10% | 增加 PRD 场景类型 |
| Schema Resolver | 全新系统 | 100% | 替代 Design System Resolver |
| Media Generation | 替换为新系统 | 100% | 替换为文档导出 |
| Project Routes | 小幅扩展 | 15% | 增加 prd kind |
| Realtime Events | 小幅扩展 | 5% | 增加事件类型 |

### 5.3 实施优先级建议

**Phase 1 — 核心可用（最小可行）**

1. 七层 Prompt 内容替换（第 1-7 层全部重写）
2. Schema Resolver（新增第 5 层数据源）
3. Lint 规则（P0 规则优先）
4. Artifact 检测扩展 .md

**Phase 2 — 质量保障**

5. Critique Theater 评委/维度重定义
6. Memory 系统提取逻辑
7. Quality Rules 完整规则集

**Phase 3 — 生态完善**

8. 多 Schema 模板
9. 多 PRD 类型技能
10. Connectors 深度集成（GitHub/Jira/Notion）
11. 文档导出（PDF/DOCX）

**Phase 4 — 运维增强**

12. Pipeline 管道优化
13. Realtime Events 扩展
14. CLI 入口完善

### 5.4 复用总结

12 个支持系统中：
- **5 个几乎不需要改动**：Agent 适配器、Chat/SSE、Artifact Store、Connectors、Realtime Events
- **4 个只需改内容/定义**：Lint 系统、Memory 系统、Critique Theater、Plugin/Pipeline
- **2 个需要新增系统**：Schema Resolver、文档导出
- **1 个小幅扩展**：Project Routes

**核心洞察**：OD 最聪明的设计决策是**框架和内容解耦**。七层架构的组装逻辑、linter 的扫描机制、Critique Theater 的协议——这些都不绑定设计领域。迁移到 PRD 场景，只需要替换每层的内容，不需要重写框架。

---

## 附录：关键文件索引

| 文件 | 角色 | PRD 对应 |
|---|---|---|
| `apps/daemon/src/prompts/system.ts` | 7 层组装入口 | 完全复用框架 |
| `apps/daemon/src/prompts/official-system.ts` | 第 3 层：身份 | 重写为 PM 身份 |
| `apps/daemon/src/prompts/discovery.ts` | 第 2 层：Discovery | 重写问题内容 |
| `apps/daemon/src/prompts/panel.ts` | Critique Theater 渲染 | 重定义评委/维度 |
| `apps/daemon/src/prompts/deck-framework.ts` | Deck 框架 | 不需要 |
| `apps/daemon/src/lint-artifact.ts` | Linter 引擎 | 替换规则内容 |
| `apps/daemon/src/memory.ts` | 记忆存储 | 改提取 prompt |
| `apps/daemon/src/design-systems.ts` | 设计系统解析 | 替代为 Schema Resolver |
| `apps/daemon/src/plugins/pipeline-runner.ts` | 管道执行 | 替换原子内容 |
| `apps/daemon/src/connectors/service.ts` | 连接器服务 | 增加 PRD 类型 |
| `packages/contracts/src/index.ts` | 共享类型 | 增加 PRD 类型 |
| `packages/contracts/src/plugins/manifest.ts` | 插件清单 | 增加 PRD 模式 |
| `packages/sidecar-proto/src/index.ts` | 进程间通信 | 不需要改动 |
| `design-systems/*/DESIGN.md` | 设计系统定义 | 映射为 `prd-schemas/*/SCHEMA.md` |
| `craft/*.md` | 工艺规则 | 映射为 `prd-rules/*.md` |