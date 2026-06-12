# Ingestion Import Report

**Filename:** expenses_export.csv
**Import ID:** e0786525-4c53-4b77-b34e-5daccf4a1689
**Ingestion Date:** 2026-06-12 17:23:06
**Status:** PROCESSED

## Summary of Ingestion
- **Total Anomalies Detected:** 9
- **Clean Rows Auto-Imported:** 2
- **Total Rows Processed:** 11

## Anomalies Log & Resolution Actions

| Row | Anomaly Type | Description | Resolution Policy | Action Taken |
| --- | --- | --- | --- | --- |
| 1 | **MEMBERSHIP_OUT_OF_BOUNDS** | Row 1: Expense dated 2024-02-15 lies outside active membership ranges for Sam. | Exclude inactive members based on timeline | Approved & Resolved |
| 2 | **DUPLICATE** | Row 2: Duplicate of a previous row (same Date, Description, Amount, Payer). | Discard duplicates | Rejected/Skipped |
| 3 | **NEGATIVE_AMOUNT** | Row 3: Negative expense amount (-150.00). | Convert to Payment refund | Approved & Resolved |
| 4 | **SETTLEMENT_DISGUISED_AS_EXPENSE** | Row 4: Expense appears to be a debt settlement: 'Rohan paid Aisha' | Convert to Payment settlement object | Approved & Resolved |
| 5 | **CURRENCY_MISMATCH** | Row 5: Spent in US Dollars but recorded without conversion: 'USD trip lunch' | Convert USD to INR at rate of 83.0 | Approved & Resolved |
| 6 | **MEMBERSHIP_OUT_OF_BOUNDS** | Row 6: Expense dated 2024-04-10 lies outside active membership ranges for Sam, Meera. | Exclude inactive members based on timeline | Approved & Resolved |
| 7 | **MEMBERSHIP_OUT_OF_BOUNDS** | Row 7: Expense dated 2024-03-10 lies outside active membership ranges for Sam. | Exclude inactive members based on timeline | Approved & Resolved |
| 8 | **INVALID_DATE** | Row 8: Date '35-12-2024' could not be parsed. | Discard due to invalid format | Rejected/Skipped |
| 9 | **MISSING_DATA** | Row 9: Amount 'two hundred' is not a valid number. | Discard missing/corrupt values | Rejected/Skipped |
| 10 | **MEMBERSHIP_OUT_OF_BOUNDS** | Row 10: Expense dated 2024-02-19 lies outside active membership ranges for Sam. | Exclude inactive members based on timeline | Approved & Resolved |
| 11 | **DUPLICATE** | Row 11: Duplicate of a previous row (same Date, Description, Amount, Payer). | Discard duplicates | Rejected/Skipped |

## Database Ingestion Audit Trail
All resolving transactions (Expenses and Payments) were committed with 100% data integrity auditing trails. Inactive timeline members were successfully excluded, and USD exchange conversions were applied where necessary.
