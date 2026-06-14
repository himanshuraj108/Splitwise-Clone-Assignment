# AI Usage Report: FairShare

This document outlines the AI tools, key prompts, and collaborative debugging cases utilized during the development of FairShare, in accordance with the assignment requirements.

---

## 1. AI Tools Used
*   **Primary Assistant**: Google DeepMind's Antigravity coding assistant.
*   **Core Models**: Gemini and Claude 3.5 Sonnet.

---

## 2. Key Prompts & Iterations
*   **Database Seeding & Setup**:
    *   *Prompt*: "Create a Django reset script to clean the database and seed the 6 flat users with joined_at dates according to their roommate timelines (Meera active Feb-March, Sam active April 15 onwards)."
*   **Ingestion Engine & Anomaly Resolution**:
    *   *Prompt*: "Write a Django view to upload the expense CSV file, run an ingestion check on all 12 anomalies, and allow interactive resolution (approval or rejection) for each pending anomaly from the frontend."
*   **Greedy Debt Simplification**:
    *   *Prompt*: "Implement a greedy cash-flow simplification algorithm in Django that calculates net balances for all group members and outputs the minimum number of peer-to-peer transfers to settle the debts."
*   **Double-Entry Audit Trails (Rohan's View)**:
    *   *Prompt*: "Create an endpoint that returns all ledger entries, expenses, splits, and payments between any two selected users so Rohan can expand and audit their net balance."
*   **Frontend Redesign**:
    *   *Prompt*: "Redesign the entire application using Vite + React and Tailwind CSS. Implement a premium, minimal light mode theme. Make the dashboard clean and centered. Add a Demo Accounts dropdown in the top-right corner to allow autofilling seeded credentials."

---

## 3. Concrete Cases of AI Errors, Detection, & Resolutions

Here are three concrete instances where the AI generated incorrect code or design patterns, how the issues were identified, and how they were resolved:

### Case 1: Anomaly Resolution 404 Endpoint Bug (Frontend State De-synchronization)
*   **What the AI proposed**: 
    The AI model designed the backend `CSVImportReportView` to serialize the import status report but returned the identifier as `import_id` in the JSON response payload. The frontend React component (in `GroupDetail.jsx`) updated its state using this response, looking for `importLog.id`.
*   **How it was caught**: 
    After resolving an anomaly by clicking "Approve & Import", the frontend attempted to refresh the list of remaining anomalies, resulting in a browser console `404 Not Found` network error at `GET /api/imports/undefined/report/`. The state updater had wiped out the `.id` attribute of the active import log.
*   **What was changed**: 
    *   Modified `CSVImportReportView` in the Django backend views to explicitly return `"id": import_log.id` in the serialized report dictionary.
    *   Updated the frontend state handler `handleResolveAnomaly` to fetch using `importLog.id || importLog.import_id` to prevent `undefined` state updates.

### Case 2: Django Test Discovery Crash due to Standalone Test Script
*   **What the AI proposed**: 
    The AI created a helper script `test_import.py` in the backend root folder to test CSV ingestion against the database. The script was written as a flat, un-gilded file that executed immediately upon loading.
*   **How it was caught**: 
    Running the automated Django test suite using `python manage.py test` failed and crashed. The test runner discovered the standalone script, imported it, and executed the database query block, which crashed because the test runner's database was empty.
*   **What was changed**: 
    Wrapped all execution logic inside `test_import.py` under a standard Python block:
    ```python
    if __name__ == '__main__':
        # Ingestion tests...
    ```
    This successfully isolated the script, preventing the Django test runner from auto-executing it during test suite discovery.

### Case 3: Missing Year Context in CSV Date Parsing (Timeline Violation)
*   **What the AI proposed**: 
    The CSV importer parsed dates using standard formats like `YYYY-MM-DD`. However, for rows in the spreadsheet that used month abbreviations without a year (e.g. `Mar-14` or `14-Mar`), the parser converted them to datetime objects without supplying a year context.
*   **How it was caught**: 
    Python defaulted the year to `1900` (e.g. `1900-03-14`). During auditing, these expenses were incorrectly flagged as `MEMBERSHIP_OUT_OF_BOUNDS` anomalies because they occurred in 1900, which was long before any roommate joined the flat (timeline set for 2026).
*   **What was changed**: 
    Modified `parse_csv_date` in `core/importer.py` to identify month abbreviation formats and explicitly check if the parsed year resolved to `1900`. If so, it replaces the year with `2026` to align with the canonical project timeline:
    ```python
    d = datetime.strptime(date_str, fmt).date()
    if d.year == 1900:
        d = d.replace(year=2026)
    return d
    ```
