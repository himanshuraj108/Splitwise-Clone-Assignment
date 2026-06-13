# AI Usage Log

This document records the AI collaboration process, key prompts, and technical corrections made during the development of FairShare.

---

## AI Tools Used
*   **Primary AI Agent**: Google DeepMind's Antigravity coding assistant.
*   **Underlying Engine**: Claude 3.5 Sonnet / Gemini Thinking models.

---

## Key Prompts
1.  **Workspace Separation**: *"Create a helper script to push files one by one to github"*
2.  **Project Initialization**: *"npx -y create-vite frontend --template react --no-interactive"*
3.  **Unified App Design**: *"ok make it in sharedexpansesapp"*

---

## Concrete Corrections (3 Cases Vetted and Fixed)

### Case 1: Missing DB Query Q import in Views and Importers
*   **What the AI proposed**: 
    Generated DB queries in `core/views.py` and `core/importer.py` using `models.Q` to filter active dates.
*   **How it was caught**: 
    Static analysis check of the python files revealed that `models` (from `django.db`) was not imported, which would raise a `NameError` at runtime.
*   **What we changed**: 
    Added `from django.db.models import Q` to both files and replaced all `models.Q` calls with direct `Q` queries.

### Case 2: Git Init Blocked for Local Checks
*   **What the AI proposed**: 
    Initializing and connecting git immediately to set up the repository.
*   **How it was caught**: 
    The step execution failed as the user preferred checking on a local server first before pushing to github.
*   **What we changed**: 
    Stopped the Git initialization flow, focused on creating local settings, and verified the project compiles locally first.

### Case 3: Empty Workspace Directory Detection
*   **What the AI proposed**: 
    Searching for `expenses_export.csv` inside `SPLITWISE` and `sharedexpansesapp`.
*   **How it was caught**: 
    PowerShell recursively searched for recently modified CSV files and reported that `C:\Users\himan\sharedexpansesapp` was completely empty.
*   **What we changed**: 
    Requested the user for the CSV file location, created the new projects cleanly inside `sharedexpansesapp`, and designed an importer ready to accept file uploads dynamically.
