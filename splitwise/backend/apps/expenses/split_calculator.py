from decimal import Decimal, ROUND_HALF_UP


def calculate_equal_splits(total_amount, user_ids):
    """Split total equally among users. Handles rounding with remainder on first user."""
    n = len(user_ids)
    if n == 0:
        return {}
    base_amount = (Decimal(str(total_amount)) / n).quantize(
        Decimal('0.01'), rounding=ROUND_HALF_UP
    )
    splits = {uid: base_amount for uid in user_ids}
    # Adjust for rounding errors
    total_split = base_amount * n
    diff = Decimal(str(total_amount)) - total_split
    if diff != 0:
        first_user = user_ids[0]
        splits[first_user] += diff
    return splits


def calculate_unequal_splits(user_amounts):
    """
    user_amounts: dict {user_id: amount}
    Returns dict {user_id: amount} (validated that sums match total).
    """
    return {uid: Decimal(str(amt)).quantize(Decimal('0.01')) for uid, amt in user_amounts.items()}


def calculate_percentage_splits(total_amount, user_percentages):
    """
    user_percentages: dict {user_id: percentage_float}
    Returns dict {user_id: amount}
    """
    total = Decimal(str(total_amount))
    splits = {}
    for uid, pct in user_percentages.items():
        amount = (total * Decimal(str(pct)) / 100).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        splits[uid] = amount
    # Adjust rounding
    diff = total - sum(splits.values())
    if diff != 0 and splits:
        first_uid = list(splits.keys())[0]
        splits[first_uid] += diff
    return splits


def calculate_share_splits(total_amount, user_shares):
    """
    user_shares: dict {user_id: share_count}
    Returns dict {user_id: amount}
    """
    total = Decimal(str(total_amount))
    total_shares = sum(Decimal(str(s)) for s in user_shares.values())
    if total_shares == 0:
        return {}
    splits = {}
    for uid, shares in user_shares.items():
        amount = (total * Decimal(str(shares)) / total_shares).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        splits[uid] = amount
    # Adjust rounding
    diff = total - sum(splits.values())
    if diff != 0 and splits:
        first_uid = list(splits.keys())[0]
        splits[first_uid] += diff
    return splits
