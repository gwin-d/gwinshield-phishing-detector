from ml.features import extract_features
import urllib.parse

# ── Extended brand list ───────────────────────────────────────────
BRANDS = [
    # Financial
    "paypal", "chase", "wellsfargo", "citibank",
    "bankofamerica", "hsbc", "barclays", "natwest", "santander",
    "halifax", "lloyds", "nationwide", "usbank", "capitalone",
    "americanexpress", "amex", "discover", "mastercard", "visa",
    # Tech
    "google", "gmail", "youtube", "microsoft", "outlook", "hotmail",
    "apple", "icloud", "itunes", "appstore", "amazon", "amazonaws",
    "facebook", "instagram", "whatsapp", "twitter", "linkedin",
    "netflix", "spotify", "dropbox", "github", "adobe", "zoom",
    "ebay", "alibaba", "aliexpress", "shopify", "wordpress",
    # Nigerian / African banks
    "gtbank", "accessbank", "zenithbank", "firstbank", "uba",
    "sterlingbank", "fidelitybank", "unionbank", "ecobank",
    # Crypto
    "binance", "coinbase", "blockchain", "metamask", "trustwallet",
    # Others
    "dhl", "fedex", "ups", "usps", "royalmail", "netflix",
    "steam", "epicgames", "roblox", "playstation", "xbox",
    "yahoo", "aol", "protonmail", "telegram", "signal",
]

# ── Heuristic rules and weights ───────────────────────────────────
# Total MAX = 1.30 — normalise by dividing raw score by 1.30
RULES = {
    "has_ip_address":           0.25,
    "has_at_symbol":            0.20,
    "brand_impersonation":      0.35,   # NEW — brand in URL but wrong domain
    "is_typosquatting":         0.20,   # increased from 0.15
    "url_length":               0.10,   # triggers if > 75
    "subdomain_count":          0.10,   # triggers if > 3
    "no_https":                 0.10,   # fixed from 0.15
    "has_suspicious_keywords":  0.10,
    "is_shortened":             0.05,   # reduced
}

MAX_RAW_SCORE = 1.45  # sum of all weights


def check_brand_impersonation(url: str, domain: str) -> bool:
    """
    Check if a known brand name appears in the URL
    but the actual domain does not belong to that brand.

    Example:
      http://paypal-secure.com/login  → brand 'paypal' in URL,
      domain is paypal-secure.com not paypal.com → IMPERSONATION
    """
    url_lower    = url.lower()
    domain_lower = domain.lower()

    for brand in BRANDS:
        # Brand appears somewhere in the URL
        if brand in url_lower:
            # Check if the domain actually IS the brand's official domain
            # Official domain pattern: brand.com, brand.co.uk etc.
            is_official = (
                domain_lower == f"{brand}.com"                    or
                domain_lower == f"www.{brand}.com"               or
                domain_lower.endswith(f".{brand}.com")           or
                domain_lower == f"{brand}.co.uk"                 or
                domain_lower == f"www.{brand}.co.uk"             or
                domain_lower == f"{brand}.org"                   or
                domain_lower == f"{brand}.net"                   or
                domain_lower == f"{brand}.io"                    or
                domain_lower == f"{brand}.com.ng"                or
                domain_lower == f"www.{brand}.com.ng"
            )
            if not is_official:
                return True
    return False


def run_heuristics(url: str) -> dict:
    """
    Apply all heuristic rules to a URL.
    Returns normalised score, triggered flags, and raw score.
    """
    try:
        parsed     = urllib.parse.urlparse(url)
        domain     = parsed.netloc.lower()
        if ":" in domain:
            domain = domain.split(":")[0]
    except Exception:
        domain = ""

    features  = extract_features(url)
    raw_score = 0.0
    flags     = []

    # Rule 1 — IP address in URL
    if features["has_ip_address"]:
        raw_score += RULES["has_ip_address"]
        flags.append("IP address found in URL")

    # Rule 2 — @ symbol
    if features["has_at_symbol"]:
        raw_score += RULES["has_at_symbol"]
        flags.append("@ symbol detected in URL")

    # Rule 3 — Brand impersonation (NEW)
    if check_brand_impersonation(url, domain):
        raw_score += RULES["brand_impersonation"]
        flags.append("Brand name impersonation detected in URL")

    # Rule 4 — Typosquatting
    if features["is_typosquatting"]:
        raw_score += RULES["is_typosquatting"]
        flags.append("Domain closely resembles a known brand (typosquatting)")

    # Rule 5 — URL too long
    if features["url_length"] > 75:
        raw_score += RULES["url_length"]
        flags.append(f"URL is excessively long ({features['url_length']} characters)")

    # Rule 6 — Too many subdomains
    if features["subdomain_count"] > 3:
        raw_score += RULES["subdomain_count"]
        flags.append(f"Excessive subdomains detected ({features['subdomain_count']})")

    # Rule 7 — No HTTPS
    if not features["uses_https"]:
        raw_score += RULES["no_https"]
        flags.append("Site does not use HTTPS")

    # Rule 8 — Suspicious keywords
    if features["has_suspicious_keywords"]:
        raw_score += RULES["has_suspicious_keywords"]
        flags.append("Suspicious keywords found in URL")

    # Rule 9 — URL shortener
    if features["is_shortened"]:
        raw_score += RULES["is_shortened"]
        flags.append("URL shortener service detected")

    # Normalise to [0.0 - 1.0]
    normalised = round(raw_score / MAX_RAW_SCORE, 4)

    return {
        "heuristic_score": normalised,
        "flags":           flags,
        "raw_score":       round(raw_score, 4),
    }