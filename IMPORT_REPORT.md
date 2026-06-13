# Ingestion Import Report

**Filename:** expenses_export.csv
**Import ID:** 774c7662-5cca-4792-bd12-24b7fe62eb4e
**Ingestion Date:** 2026-06-13 18:00:55
**Status:** PROCESSED

## Summary of Ingestion
- **Total Anomalies Detected:** 12
- **Clean Rows Auto-Imported:** 31
- **Total Rows Processed:** 43

## Anomalies Log & Resolution Actions

| Row | Anomaly Type | Description | Resolution Policy | Action Taken |
| --- | --- | --- | --- | --- |
| 5 | **DUPLICATE** | Row 5: Duplicate of a previous row (same Date, Description, Amount, Payer). | Discard duplicates | Rejected/Skipped |
| 10 | **MISSING_DATA** | Row 10: Payer 'Priya S' is not recognized. | Discard missing/corrupt values or correct typos | Approved & Resolved |
| 12 | **MISSING_DATA** | Row 12: Payer '' is not recognized. | Discard missing/corrupt values or correct typos | Rejected/Skipped |
| 13 | **SETTLEMENT_DISGUISED_AS_EXPENSE** | Row 13: Expense appears to be a debt settlement: 'Rohan paid Aisha back' | Convert to Payment settlement object | Approved & Resolved |
| 19 | **CURRENCY_MISMATCH** | Row 19: Spent in US Dollars but recorded without conversion: 'Goa villa booking' | Convert USD to INR at rate of 83.0 | Approved & Resolved |
| 20 | **CURRENCY_MISMATCH** | Row 20: Spent in US Dollars but recorded without conversion: 'Beach shack lunch' | Convert USD to INR at rate of 83.0 | Approved & Resolved |
| 22 | **CURRENCY_MISMATCH** | Row 22: Spent in US Dollars but recorded without conversion: 'Parasailing' | Convert USD to INR at rate of 83.0 | Approved & Resolved |
| 25 | **NEGATIVE_AMOUNT** | Row 25: Negative expense amount (-30). | Convert to Payment refund | Approved & Resolved |
| 35 | **MEMBERSHIP_OUT_OF_BOUNDS** | Row 35: Expense dated 2026-04-02 lies outside active membership ranges for Meera. | Exclude inactive members based on timeline | Approved & Resolved |
| 37 | **MEMBERSHIP_OUT_OF_BOUNDS** | Row 37: Expense dated 2026-04-08 lies outside active membership ranges for Sam. | Exclude inactive members based on timeline | Approved & Resolved |
| 38 | **MEMBERSHIP_OUT_OF_BOUNDS** | Row 38: Expense dated 2026-04-10 lies outside active membership ranges for Sam. | Exclude inactive members based on timeline | Approved & Resolved |
| 39 | **MEMBERSHIP_OUT_OF_BOUNDS** | Row 39: Expense dated 2026-04-12 lies outside active membership ranges for Sam. | Exclude inactive members based on timeline | Approved & Resolved |

## Database Ingestion Audit Trail
All resolving transactions (Expenses and Payments) were committed with 100% data integrity auditing trails. Inactive timeline members were successfully excluded, and USD exchange conversions were applied where necessary.
