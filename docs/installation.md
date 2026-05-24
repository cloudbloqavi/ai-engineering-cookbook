# Installation and Setup Guide

This guide walks you through setting up the AI-Native SDLC environment on your machine. We will set up **Spec-Kit** for planning and **Superpowers** for execution.

---

## 🛠 Prerequisites

Before installing the tools, make sure you have the following installed on your system:

- **Git**: Active version control.
- **Node.js** (v18 or higher): Required if you are developing Node-based applications.
- **Python** (v3.10 or higher): Required for Spec-Kit.

---

## 📦 Step-by-step Installation

### 1. Install `uv` (Fast Python Package Manager)
Spec-Kit is distributed as a Python package. We recommend using `uv` to manage Python CLI tools because it is significantly faster and more isolated than standard `pip`.

```bash
# macOS and Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Verify that `uv` is installed:
```bash
uv --version
# Expected: uv x.y.z
```

---

### 2. Install Spec-Kit
Use `uv` to install the Spec-Kit CLI tool globally. This ensures that the CLI and its dependencies are placed in an isolated, dedicated environment.

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```

Verify that Spec-Kit is installed:
```bash
specify --version
# Expected: specify-cli x.y.z
```

---

### 3. Install Superpowers
Superpowers is installed directly inside your AI coding agent (e.g. Claude Code, Cursor, Gemini CLI).

```mermaid
graph TD
    A[Choose AI Agent] --> B(Claude Code)
    A --> C(Cursor)
    A --> D(Gemini CLI)
    A --> E(Codex CLI)

    B --> F["/plugin install superpowers@claude-plugins-official"]
    C --> G["/add-plugin superpowers"]
    D --> H["gemini extensions install https://github.com/obra/superpowers"]
    E --> I["Use /plugins -> Search 'superpowers' -> Click Install"]
```

---

## 🚀 Initializing Your Project

Once the tools are installed globally, you must initialize Spec-Kit in your project root directory.

### Scenario A: Greenfield Project (From Scratch)
If you are starting a completely new project in a blank directory, run:

```bash
mkdir my-new-project
cd my-new-project
specify init . --integration claude
```
> [!NOTE]
> Change `--integration claude` to matches your target agent (e.g. `gemini`, `copilot`, `cursor`).

### Scenario B: Brownfield Project (Existing Codebase)
If you are adding AI-assisted workflows to an existing project, navigate to the project directory and run:

```bash
cd my-existing-project
specify init . --force --integration claude
```
> [!IMPORTANT]
> The `--force` flag is safe to use. It only creates the `.specify/` directory structure and does not modify or delete any of your existing source files.

---

## 🔍 Verifying the Directory Structure

After initialization, you should see a new `.specify/` folder in your project root containing:

```
your-project/
└── .specify/
    ├── memory/
    │   └── constitution.md        # [Editable] Project principles & stack rules
    ├── specs/                     # Contains individual feature specs
    ├── templates/                 # Custom formatting templates
    └── scripts/                   # Integration bash/PowerShell scripts
```

If these files are present, you are successfully set up and ready to create your first specification!

---

### 📖 Next Steps
- Walk through a greenfield project from scratch: [Greenfield Guide](./greenfield.md)
- Walk through a brownfield project setup: [Brownfield Guide](./brownfield.md)
- Explore the AI Observability and Governance Layer: [AI Governance Guide](./governance.md)
