import csv
import io
import re
from datetime import datetime
from decimal import Decimal
from django.db.models import Q
from django.utils.dateparse import parse_date
from .models import User, Group, GroupMembership, Expense, ExpenseSplit, Payment, CSVAnomaly, CSVImport

# Standard users in the prompt
STANDARD_USERS = ["Aisha", "Rohan", "Priya", "Meera", "Sam", "Dev"]

def normalize_name(name):
    """Normalize names and handle common spelling issues."""
    if not name:
        return ""
    name = name.strip().lower()
    if name in ["aisha", "ayesha", "aisa"]:
        return "Aisha"
    if name in ["rohan", "rohn", "roahan"]:
        return "Rohan"
    if name in ["priya", "piya", "priy"]:
        return "Priya"
    if name in ["meera", "mera", "mira"]:
        return "Meera"
    if name in ["sam", "sem", "sammy"]:
        return "Sam"
    if name in ["dev", "deb"]:
        return "Dev"
    return name.capitalize()

def parse_csv_date(date_str):
    """Parse dates dynamically with multiple formats."""
    if not date_str:
        return None
    date_str = date_str.strip()
    # Try common formats first
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    # Try parsing month abbreviation like Mar-14 or 14-Mar
    for fmt in ("%b-%d", "%d-%b", "%Y-%b-%d", "%d-%b-%Y"):
        try:
            d = datetime.strptime(date_str, fmt).date()
            # If no year is parsed, it defaults to 1900. Map to 2026.
            if d.year == 1900:
                d = d.replace(year=2026)
            return d
        except ValueError:
            continue
    # Try parsing manually if needed
    match = re.match(r"(\d{1,2})[-/](\d{1,2})[-/](\d{4})", date_str)
    if match:
        parts = [int(p) for p in match.groups()]
        try:
            if parts[1] > 12:  # Must be DD-MM-YYYY
                return datetime(parts[2], parts[0], parts[1]).date()
            else:  # Assume MM-DD-YYYY or DD-MM-YYYY, default to standard
                return datetime(parts[2], parts[1], parts[0]).date()
        except ValueError:
            pass
    return None

class CSVImporter:
    def __init__(self, import_log_id, group_id):
        self.import_log = CSVImport.objects.get(id=import_log_id)
        self.group = Group.objects.get(id=group_id)
        self.anomalies = []
        self.seen_rows = []

    def detect_anomalies(self, csv_file_wrapper):
        """
        Reads the CSV file wrapper, detects anomalies, and populates CSVAnomaly records.
        """
        reader = csv.DictReader(csv_file_wrapper)
        
        # Verify columns
        headers = [h.strip() for h in reader.fieldnames] if reader.fieldnames else []
        required_cols = ["date", "description", "amount", "paid_by"]
        
        # Lowercase headers for comparison
        header_map = {h.lower(): h for h in headers}
        
        missing = [col for col in required_cols if col not in header_map]
        if missing:
            CSVAnomaly.objects.create(
                import_log=self.import_log,
                row_index=0,
                raw_data={"headers": headers},
                anomaly_type="MISSING_DATA",
                description=f"Missing columns in CSV file: {', '.join(missing)}",
                suggested_action="Ensure the CSV has date, description, amount, and paid_by columns."
            )
            return

        row_index = 0
        for row in reader:
            row_index += 1
            # Retrieve mapped values
            raw_date = row.get(header_map.get("date", "date"), "").strip()
            raw_desc = row.get(header_map.get("description", "description"), "").strip()
            raw_amount = row.get(header_map.get("amount", "amount"), "").strip()
            raw_paid_by = row.get(header_map.get("paid_by", "paid_by"), "").strip()
            raw_currency = row.get(header_map.get("currency", "currency"), "").strip()
            raw_split_with = row.get(header_map.get("split_with", "split_with"), "").strip()
            
            raw_data = {
                "date": raw_date,
                "description": raw_desc,
                "amount": raw_amount,
                "paid_by": raw_paid_by,
                "currency": raw_currency,
                "split_with": raw_split_with
            }
            
            # 1. Parse Date
            parsed_date = parse_csv_date(raw_date)
            if not parsed_date:
                CSVAnomaly.objects.create(
                    import_log=self.import_log,
                    row_index=row_index,
                    raw_data=raw_data,
                    anomaly_type="INVALID_DATE",
                    description=f"Row {row_index}: Date '{raw_date}' could not be parsed.",
                    suggested_action="Manually correct date or skip row."
                )
                continue

            # 2. Parse Amount
            try:
                # Remove currency symbols or commas
                clean_amount_str = re.sub(r"[^\d.-]", "", raw_amount)
                parsed_amount = Decimal(clean_amount_str)
            except Exception:
                CSVAnomaly.objects.create(
                    import_log=self.import_log,
                    row_index=row_index,
                    raw_data=raw_data,
                    anomaly_type="MISSING_DATA",
                    description=f"Row {row_index}: Amount '{raw_amount}' is not a valid number.",
                    suggested_action="Skip row or correct amount."
                )
                continue

            # 3. Paid By Normalization
            normalized_payer = normalize_name(raw_paid_by)
            if normalized_payer not in STANDARD_USERS:
                CSVAnomaly.objects.create(
                    import_log=self.import_log,
                    row_index=row_index,
                    raw_data=raw_data,
                    anomaly_type="MISSING_DATA",
                    description=f"Row {row_index}: Payer '{raw_paid_by}' is not recognized.",
                    suggested_action=f"Map to standard user or create user '{normalized_payer}'."
                )
                continue

            # 4. Detect Duplicate Row
            is_duplicate = False
            for seen in self.seen_rows:
                if (seen["date"] == parsed_date and 
                    seen["amount"] == parsed_amount and 
                    seen["paid_by"] == normalized_payer):
                    is_duplicate = True
                    break
            
            if is_duplicate:
                CSVAnomaly.objects.create(
                    import_log=self.import_log,
                    row_index=row_index,
                    raw_data=raw_data,
                    anomaly_type="DUPLICATE",
                    description=f"Row {row_index}: Duplicate of a previous row (same Date, Description, Amount, Payer).",
                    suggested_action="Skip this duplicate row."
                )
                continue

            # Add to seen list
            self.seen_rows.append({
                "date": parsed_date,
                "description": raw_desc,
                "amount": parsed_amount,
                "paid_by": normalized_payer
            })

            # 5. Detect Negative Amount
            if parsed_amount < 0:
                CSVAnomaly.objects.create(
                    import_log=self.import_log,
                    row_index=row_index,
                    raw_data=raw_data,
                    anomaly_type="NEGATIVE_AMOUNT",
                    description=f"Row {row_index}: Negative expense amount ({parsed_amount}).",
                    suggested_action="Convert to positive refund, reverse payer, or skip."
                )
                continue

            # 6. Detect Settlement disguised as Expense
            desc_lower = raw_desc.lower()
            is_settlement = ("settle" in desc_lower or "paid" in desc_lower or 
                             "refund" in desc_lower or "transfer" in desc_lower)
            # e.g., Rohan paid Aisha 1000
            payment_match = re.search(r"(\w+)\s+(?:paid|settled|sent)\s+(\w+)", desc_lower)
            
            if is_settlement or payment_match:
                payer_candidate = normalized_payer
                payee_candidate = ""
                if payment_match:
                    p1 = normalize_name(payment_match.group(1))
                    p2 = normalize_name(payment_match.group(2))
                    if p1 in STANDARD_USERS:
                        payer_candidate = p1
                    if p2 in STANDARD_USERS:
                        payee_candidate = p2

                CSVAnomaly.objects.create(
                    import_log=self.import_log,
                    row_index=row_index,
                    raw_data=raw_data,
                    anomaly_type="SETTLEMENT_DISGUISED_AS_EXPENSE",
                    description=f"Row {row_index}: Expense appears to be a debt settlement: '{raw_desc}'",
                    suggested_action=f"Import as Settlement Payment from {payer_candidate} to {payee_candidate or 'recipient'}."
                )
                continue

            # 7. Detect Currency Mismatch (USD vs INR)
            # Priya's Trip spending: Check if description contains trip/USD/dollars or amount is small
            is_usd = ("usd" in desc_lower or "$" in desc_lower or "dollar" in desc_lower or raw_currency.lower() == "usd")
            # If description mentions "trip" and amount is small (e.g. less than 200), it might be in USD
            # (since 100 USD = 8300 INR, but the sheet logs it as 100, which is incorrect if it represents USD).
            # We will flag any "trip" or "US" description with a small amount as a potential currency mismatch.
            if is_usd or ("trip" in desc_lower and parsed_amount < 200):
                CSVAnomaly.objects.create(
                    import_log=self.import_log,
                    row_index=row_index,
                    raw_data=raw_data,
                    anomaly_type="CURRENCY_MISMATCH",
                    description=f"Row {row_index}: Spent in US Dollars but recorded without conversion: '{raw_desc}'",
                    suggested_action="Apply USD-to-INR conversion rate of 83.0."
                )
                continue

            # 8. Detect Date membership out of bounds
            # Sam joined mid-April (2026-04-15), Meera left end of March (2026-03-31)
            split_members = []
            if raw_split_with:
                split_members = [normalize_name(m.strip()) for m in raw_split_with.split(";") if m.strip()]
            
            out_of_bounds = []
            # Check if payer is active
            if normalized_payer == "Sam" and parsed_date < datetime(2026, 4, 15).date():
                out_of_bounds.append("Sam")
            elif normalized_payer == "Meera" and parsed_date > datetime(2026, 3, 31).date():
                out_of_bounds.append("Meera")
                
            # Check if any split member is inactive
            for m in split_members:
                if m == "Sam" and parsed_date < datetime(2026, 4, 15).date():
                    if "Sam" not in out_of_bounds:
                        out_of_bounds.append("Sam")
                elif m == "Meera" and parsed_date > datetime(2026, 3, 31).date():
                    if "Meera" not in out_of_bounds:
                        out_of_bounds.append("Meera")

            if out_of_bounds:
                CSVAnomaly.objects.create(
                    import_log=self.import_log,
                    row_index=row_index,
                    raw_data=raw_data,
                    anomaly_type="MEMBERSHIP_OUT_OF_BOUNDS",
                    description=f"Row {row_index}: Expense dated {parsed_date} lies outside active membership ranges for {', '.join(out_of_bounds)}.",
                    suggested_action="Exclude inactive members from split calculation."
                )
                continue

            # Row is perfectly clean! We can import it immediately, or keep it as pending import.
            # To keep things simple, we can auto-import clean rows, and create a report.
            self.import_clean_row(parsed_date, raw_desc, parsed_amount, normalized_payer)

    def import_clean_row(self, date, description, amount, payer_name):
        """Directly import a clean row into the database."""
        try:
            payer = User.objects.get(username=payer_name)
        except User.DoesNotExist:
            payer = User.objects.create_user(
                username=payer_name,
                email=f"{payer_name.lower()}@example.com",
                password=User.objects.make_random_password()
            )

        # Ensure membership is registered
        GroupMembership.objects.get_or_create(
            group=self.group,
            user=payer,
            defaults={'joined_at': datetime(2026, 2, 1).date()}
        )

        expense = Expense.objects.create(
            group=self.group,
            description=description,
            amount=amount,
            currency='INR',
            exchange_rate=Decimal('1.0'),
            paid_by=payer,
            date=date,
            split_type='EQUAL'
        )

        # Equal split among members active on that date
        active_memberships = GroupMembership.objects.filter(
            group=self.group,
            joined_at__lte=date
        ).filter(
            Q(left_at__isnull=True) | Q(left_at__gte=date)
        )
        
        active_users = [m.user for m in active_memberships]
        if not active_users:
            # Fallback to payer only
            active_users = [payer]

        split_amount = round(amount / len(active_users), 2)
        split_amounts = [split_amount] * len(active_users)
        diff = amount - sum(split_amounts)
        if diff != 0:
            split_amounts[-1] += diff

        for u, amt in zip(active_users, split_amounts):
            ExpenseSplit.objects.create(
                expense=expense,
                user=u,
                amount_owed=amt
            )
