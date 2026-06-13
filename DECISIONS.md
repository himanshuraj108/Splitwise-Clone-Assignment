# DECISIONS: Architecture & Design Decision Log

This document records the major engineering and product decisions made during the development of FairShare.

---

## 1. Monolithic `core` Django App vs. Multiple Micro-Apps

*   **Options Considered**:
    *   **Multiple Apps**: Creating separate Django apps (`users`, `groups`, `expenses`, `payments`).
    *   **Unified Core App**: Putting all models, serializers, and views in a single `core` app.
*   **Decision**: **Unified Core App**.
*   **Rationale**: 
    With time-aware memberships, our tables are highly inter-dependent (e.g. expenses depend on group memberships, splits depend on active ranges, and csv imports create both expenses and payments). A unified app eliminates circular dependency issues in Python, simplifies migrations, and makes the project structure much easier to navigate during live code reviews.

---

## 2. Dynamic Membership Timeline vs. Static Group Lists

*   **Options Considered**:
    *   **Static Lists**: Manually selecting who splits each expense at creation time.
    *   **Date-bounded Memberships**: Storing `joined_at` and `left_at` on the `GroupMembership` table and using the expense's date to compute split eligibility.
*   **Decision**: **Date-bounded Memberships**.
*   **Rationale**:
    This is the only way to satisfy Sam's requirement ("Why would March electricity affect my balance?") and Meera's requirement ("Meera moved out at the end of March") without forcing the user to manually edit splits. The system automatically computes the active members on the day of the expense.

---

## 3. Greedy Matching for Debt Simplification (Aisha's View)

*   **Options Considered**:
    *   **Linear Programming / Network Flow**: Implementing a maximum flow network algorithm.
    *   **Greedy debtor/creditor matching**: Matching the largest debtor with the largest creditor iteratively.
*   **Decision**: **Greedy matching**.
*   **Rationale**:
    Greedy matching is simple to implement (around 30 lines of code), highly performant for typical group sizes (4-10 flatmates), and produces the minimal set of transfer payments. It is easily explainable during a live review session.

---

## 4. Double-entry Auditing for Rohan's View

*   **Options Considered**:
    *   **Aggregated relationship sums**: Storing a cache of net peer balances.
    *   **Line-item reconstruction**: Scanning all active expenses and payments to build the peer-to-peer relationship list dynamically.
*   **Decision**: **Line-item reconstruction**.
*   **Rationale**:
    Rohan requested "No magic numbers... I want to see exactly which expenses make that up." Reconstructing the balances dynamically from source data ensures 100% auditing transparency and guarantees that no database anomalies can create discrepancy states.
