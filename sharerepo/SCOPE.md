# SCOPE: Anomaly Log & Database Schema

## Database Schema

We use a normalized relational schema built in SQLite/PostgreSQL:

1.  **User (`core_user`)**
    *   `id` (UUID, Primary Key)
    *   `username` (string, unique)
    *   `email` (string)
    *   `avatar_color` (string, HSL/Hex)
2.  **Group (`core_group`)**
    *   `id` (UUID, Primary Key)
    *   `name` (string)
    *   `created_at` (datetime)
3.  **GroupMembership (`core_groupmembership`)**
    *   `id` (UUID, Primary Key)
    *   `group_id` (Foreign Key)
    *   `user_id` (Foreign Key)
    *   `joined_at` (date)
    *   `left_at` (date, nullable)
4.  **Expense (`core_expense`)**
    *   `id` (UUID, Primary Key)
    *   `group_id` (Foreign Key)
    *   `description` (string)
    *   `amount` (decimal)
    *   `currency` (string, default 'INR')
    *   `exchange_rate` (decimal, default 1.0)
    *   `paid_by_id` (Foreign Key)
    *   `date` (date)
    *   `split_type` (string, default 'EQUAL')
    *   `status` (string, default 'ACTIVE')
5.  **ExpenseSplit (`core_expensesplit`)**
    *   `id` (UUID, Primary Key)
    *   `expense_id` (Foreign Key)
    *   `user_id` (Foreign Key)
    *   `amount_owed` (decimal)
6.  **Payment / Settlement (`core_payment`)**
    *   `id` (UUID, Primary Key)
    *   `group_id` (Foreign Key)
    *   `payer_id` (Foreign Key)
    *   `payee_id` (Foreign Key)
    *   `amount` (decimal)
    *   `currency` (string)
    *   `exchange_rate` (decimal)
    *   `date` (date)
7.  **CSVImport (`core_csvimport`)**
    *   `id` (UUID, Primary Key)
    *   `uploaded_at` (datetime)
    *   `uploaded_by_id` (Foreign Key)
    *   `status` (string, default 'PENDING')
    *   `filename` (string)
8.  **CSVAnomaly (`core_csvanomaly`)**
    *   `id` (UUID, Primary Key)
    *   `import_log_id` (Foreign Key)
    *   `row_index` (integer)
    *   `raw_data` (JSON)
    *   `anomaly_type` (string)
    *   `description` (text)
    *   `suggested_action` (string)
    *   `status` (string, default 'PENDING')

---

## Anomaly Log (12 Spreadsheet Problems Handled)

Here are the 12 deliberate data problems our ingestion engine detects and manages:

| # | Anomaly / Problem Detected | Detection Rule | Policy / Handling Action |
|---|---|---|---|
| 1 | **Duplicate Row** | Same Date, Description, Amount, and Payer logged multiple times. | Flag row; save as `pending_review` in UI. Let the user select "Keep" or "Skip". |
| 2 | **Negative Amount** | Amount column is less than 0. | Flag row. If approved, convert to a positive refund expense (reversing split credits). |
| 3 | **Settlement Logged as Expense** | Description matches settlement terms (e.g. "Rohan paid Aisha") or type is transfer. | Flag row. If approved, convert to a `Payment` object rather than an `Expense` object. |
| 4 | **Unconverted USD Spending** | Description contains "USD", "$", "trip" or amount is disproportionately small for travel. | Flag row. Apply USD-to-INR conversion (e.g., USD amount * 83.0) on approval. |
| 5 | **Inactive Member (Meera)** | Expense date is in April or later (after Meera left group). | Flag row. Exclude Meera from splits; divide expense equally only among active members. |
| 6 | **Inactive Member (Sam)** | Expense date is in March or earlier (before Sam joined group). | Flag row. Exclude Sam from splits; divide expense equally only among active members. |
| 7 | **Invalid Date Format** | Date doesn't match standard `YYYY-MM-DD` or `MM/DD/YYYY`. | Parse dynamically using multiple patterns. If parsing fails, flag for manual entry. |
| 8 | **Non-Numeric Amount** | Amount contains alphabet characters or corrupt values. | Flag row. Require manual validation or default to 0.0. |
| 9 | **Spelling Typos in Names** | Paid by matches common typo list (e.g., `Ayesha` vs `Aisha`). | Map names automatically using a fuzzy normalization lookup table. |
| 10 | **Rounding Discrepancies** | Total amount does not equal sum of equal splits. | Distribute the rounding remainder (e.g. 1-2 paise) to the payer or first split member. |
| 11 | **Completely Empty Row** | Blank row in middle of sheet export. | Silently discard rows with no date and description to avoid cluttering. |
| 12 | **Duplicate Settlement Log** | Same payment logged twice in one day. | Flag as double payment warning; let user confirm if it's separate or duplicate. |
