# Curated Community Extensions Guide

This guide covers the 20 curated community extensions selected from the Spec-Kit catalog. These extensions plug into specific points in the Spec-Kit and Superpowers workflow to enhance security, detect scope creep, generate test fixtures, and analyze side effects.

---

## 🗺️ Extension Placement Map

The diagram below shows where each curated extension integrates into the standard AI-Native workflow.

```mermaid
graph TD
    subgraph Pre-Spec Setup
        A[MemoryLint]
        B[Brownfield Bootstrap]
        C[BrownKit]
        D[Project Health Check]
    end

    subgraph Spec Phase
        E[Memory Loader]
        F[Red Team]
        G[Spec Critique]
    end

    subgraph Plan Phase
        H[OWASP LLM Threat Model]
        I[Spec Scope]
        J[Architect Impact Previewer]
        K[Version Guard]
    end

    subgraph Implementation
        L[SpecTest]
        M[Checkpoint Extension]
        N[Iterate]
    end

    subgraph Post-Implementation
        O[Verify Extension]
        P[Verify Tasks]
        Q[Cleanup Extension]
        R[Ripple]
        S[Security Review]
        T[Reconcile]
    end

    Pre-Spec Setup --> Spec Phase
    Spec Phase --> Plan Phase
    Plan Phase --> Implementation
    Implementation --> Post-Implementation
```

---

## 📦 Extension Directory Tables

### 1. Pre-Spec & Setup Extensions
Run these before starting the specification to establish architectural baselines.

| Extension | Fit | Where in Workflow | Skip When |
| :--- | :---: | :--- | :--- |
| **MemoryLint** | Both | After modifying `constitution.md` | Greenfield day 0 (no memory exists yet) |
| **Brownfield Bootstrap** | BF | Before `/speckit.constitution` | Codebase is small and you can write it yourself |
| **BrownKit** | BF | After Bootstrap, before constitution | Low-risk internal tool with no security profile |
| **Project Health Check**| Both | At the start of a brownfield feature | Brand new greenfield project |

---

### 2. Spec Phase Extensions
Run these after `/speckit.clarify` but before `/speckit.plan` to harden the spec.

| Extension | Fit | Where in Workflow | Skip When |
| :--- | :---: | :--- | :--- |
| **Memory Loader** | Both | Before any `/speckit.*` command | Auto-loading is already configured |
| **Red Team** | Both | After clarify, before plan | Minor bug fixes or cosmetic refactors |
| **Spec Critique** | Both | After clarify, before plan | Time-boxed spikes where the spec is incomplete |

---

### 3. Plan Phase Extensions
Run these after `/speckit.plan` but before `/speckit.tasks` to identify scope creep and security risks.

| Extension | Fit | Where in Workflow | Skip When |
| :--- | :---: | :--- | :--- |
| **OWASP LLM Threat Model** | Both | After `/speckit.plan` | App does not call, route, or consume LLMs |
| **Spec Scope** | Both | After `/speckit.plan`, before tasks | Rapid prototypes where scope is unbounded |
| **Architect Impact Previewer**| Both | After `/speckit.tasks` | Simple features with no cross-cutting concerns |
| **Version Guard** | Both | After `/speckit.plan` | Non-JS/TS stacks; lockfiles already verified |

---

### 4. Implementation Phase Extensions
Integrate these directly into the Superpowers TDD loop (`RED ➔ GREEN ➔ REFACTOR`).

| Extension | Fit | Where in Workflow | Skip When |
| :--- | :---: | :--- | :--- |
| **SpecTest** | Both | Before the RED phase | Simple tasks where you can write the test yourself |
| **Checkpoint Extension** | Both | After each task's TDD cycle | Tasks so small that git history gets bloated |
| **Iterate** | Both | When requirements change mid-coding | Specifications are stable |

---

### 5. Post-Implementation & Review Extensions
Run these after all tasks are completed to enforce safety gates.

| Extension | Fit | Where in Workflow | Skip When |
| :--- | :---: | :--- | :--- |
| **Verify Extension** | Both | After final task, before code review | Non-production prototypes |
| **Verify Tasks** | Both | Before `finishing-a-development-branch`| Checklist is short enough to audit in 1 min |
| **Cleanup Extension** | Both | After each task refactor | Tasks smaller than 20 lines of code |
| **Ripple** | Both | After all tasks complete | Greenfield projects with no legacy code dependencies |
| **Security Review** | Both | Before finishing branch | Internal prototypes or simple frontend styling |
| **Reconcile** | Both | On branches open for > 1 week | Short-lived branches merged within 24 hours |

---

## 🛠️ Situation-Based Decision Matrix

Use this matrix to quickly select which extensions to run on a new feature or project:

| If your situation is... | Add these extensions... |
| :--- | :--- |
| **Starting a new brownfield project** | `Brownfield Bootstrap` ➔ `BrownKit` ➔ `MemoryLint` |
| **Building an LLM/RAG application** | `OWASP LLM Threat Model` + `Security Review` |
| **Requirements changed in the middle of coding**| `Iterate` |
| **Working in a complex legacy database** | `Ripple` + `Architect Impact Previewer` |
| **Worried the subagent skipped tasks** | `Verify Tasks` |
| **Long-running branch with merge conflicts** | `Reconcile` |

---

### 📖 Next Steps
- Learn how to install uv and tools: [Installation Guide](./installation.md)
- Walk through a greenfield project: [Greenfield Guide](./greenfield.md)
- View the 5-minute setup cheatsheet: [Quickstart Guide](../QUICKSTART.md)
