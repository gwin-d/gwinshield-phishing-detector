import re
import urllib.parse

SHORTENERS = [
    "bit.ly", "tinyurl.com", "goo.gl", "ow.ly", "t.co",
    "is.gd", "buff.ly", "rebrand.ly", "shorte.st", "tiny.cc",
    "cutt.ly", "shorturl.at", "rb.gy"
]

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "update", "account",
    "banking", "confirm", "password", "signin", "webscr",
    "submit", "redirect", "recover", "unlock", "validate",
    "credential", "authenticate", "payment", "billing"
]

KNOWN_BRANDS = [
    "google", "facebook", "paypal", "apple", "microsoft",
    "amazon", "netflix", "instagram", "twitter", "youtube",
    "yahoo", "gmail", "outlook", "linkedin", "whatsapp",
    "dropbox", "ebay", "chase", "wellsfargo", "citibank",
    "hsbc", "barclays", "bankofamerica", "steam", "adobe"
]


def levenshtein_distance(s1, s2):
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions    = previous_row[j + 1] + 1
            deletions     = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


def check_typosquatting(domain: str) -> bool:
    """
    Check if any part of the domain closely resembles a known brand.
    Splits domain by both '.' and '-' to catch cases like
    'paypa1-secure-login.com' where 'paypa1' is the typosquat.
    """
    # Remove TLD parts (last two segments like .com, .co.uk)
    parts = domain.split(".")
    # Get the main domain segments without TLD
    main_parts = parts[:-1] if len(parts) > 1 else parts

    # Further split each part by hyphens
    tokens = []
    for part in main_parts:
        tokens.extend(part.split("-"))

    # Check each token against known brands
    for token in tokens:
        token = token.lower().strip()
        if len(token) < 3:
            continue
        for brand in KNOWN_BRANDS:
            # Exact substring match — brand fully inside token
            if brand in token and token != brand:
                return True
            # Levenshtein distance of 1 or 2
            if abs(len(token) - len(brand)) <= 2:
                dist = levenshtein_distance(token, brand)
                if 0 < dist <= 2:
                    return True
    return False


def extract_features(url: str) -> dict:
    """
    Extract 12 features from a URL.
    Returns a dictionary of feature name → numeric value.
    """
    try:
        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc.lower()
        # Remove port from domain if present
        if ":" in domain:
            domain = domain.split(":")[0]
        path = parsed.path.lower()
        full = url.lower()
    except Exception:
        domain = ""
        path   = ""
        full   = url.lower()

    # 1. URL length
    url_length = len(url)

    # 2. Number of dots
    num_dots = url.count(".")

    # 3. @ symbol
    has_at_symbol = 1 if "@" in url else 0

    # 4. IP address in domain
    ip_pattern = re.compile(r"^(\d{1,3}\.){3}\d{1,3}$")
    has_ip_address = 1 if ip_pattern.match(domain) else 0

    # 5. Subdomain count
    # Remove www prefix first
    clean_domain = domain
    if clean_domain.startswith("www."):
        clean_domain = clean_domain[4:]
    parts = clean_domain.split(".")
    # Subdomains = parts minus the main domain and TLD
    subdomain_count = max(0, len(parts) - 2)

    # 6. Uses HTTPS
    uses_https = 1 if parsed.scheme == "https" else 0

    # 7. URL shortener
    is_shortened = 1 if any(s in domain for s in SHORTENERS) else 0

    # 8. Suspicious keywords
    has_suspicious_keywords = 1 if any(
        kw in full for kw in SUSPICIOUS_KEYWORDS
    ) else 0

    # 9. Special character count
    special_chars = sum(url.count(c) for c in ["-", "_", "%", "=", "~"])

    # 10. Non-standard port
    has_port = 1 if parsed.port and parsed.port not in [80, 443] else 0

    # 11. Path length
    path_length = len(path)

    # 12. Typosquatting — improved check
    is_typosquatting = 1 if check_typosquatting(domain) else 0

    return {
        "url_length":              url_length,
        "num_dots":                num_dots,
        "has_at_symbol":           has_at_symbol,
        "has_ip_address":          has_ip_address,
        "subdomain_count":         subdomain_count,
        "uses_https":              uses_https,
        "is_shortened":            is_shortened,
        "has_suspicious_keywords": has_suspicious_keywords,
        "special_chars":           special_chars,
        "has_port":                has_port,
        "path_length":             path_length,
        "is_typosquatting":        is_typosquatting,
    }