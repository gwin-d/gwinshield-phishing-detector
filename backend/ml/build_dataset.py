"""
build_dataset.py
Builds a realistic training dataset using our 12 URL features.
Based on feature distributions from phishing research literature.
"""

import pandas as pd
import numpy as np
import os

np.random.seed(42)
ML_DIR       = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(ML_DIR, "dataset.csv")

def generate():
    print("Building training dataset...")

    # ── PHISHING samples ─────────────────────────────────────────
    # Based on real phishing URL characteristics from literature
    n_phish = 6000

    phishing = pd.DataFrame({
        # Long URLs are common in phishing (obfuscation)
        "url_length": np.random.choice(
            [np.random.randint(76, 200),
             np.random.randint(30, 75)],
            n_phish,
            p=[0.75, 0.25]
        ),
        # Many dots — subdomains and long paths
        "num_dots": np.random.choice(
            range(1, 10), n_phish,
            p=[0.05, 0.10, 0.15, 0.20, 0.20, 0.15, 0.08, 0.04, 0.03]
        ),
        # @ symbol — common phishing trick
        "has_at_symbol": np.random.choice(
            [1, 0], n_phish, p=[0.45, 0.55]
        ),
        # IP address in URL — very common in phishing
        "has_ip_address": np.random.choice(
            [1, 0], n_phish, p=[0.55, 0.45]
        ),
        # Many subdomains
        "subdomain_count": np.random.choice(
            range(0, 8), n_phish,
            p=[0.05, 0.10, 0.15, 0.20, 0.20, 0.15, 0.10, 0.05]
        ),
        # Mostly HTTP not HTTPS
        "uses_https": np.random.choice(
            [1, 0], n_phish, p=[0.25, 0.75]
        ),
        # URL shorteners used to hide destination
        "is_shortened": np.random.choice(
            [1, 0], n_phish, p=[0.40, 0.60]
        ),
        # Suspicious keywords very common
        "has_suspicious_keywords": np.random.choice(
            [1, 0], n_phish, p=[0.80, 0.20]
        ),
        # Many special characters
        "special_chars": np.random.choice(
            range(0, 15), n_phish,
            p=[0.05,0.05,0.08,0.10,0.12,0.12,0.12,0.10,0.08,0.06,0.05,0.03,0.02,0.01,0.01]
        ),
        # Non-standard ports sometimes used
        "has_port": np.random.choice(
            [1, 0], n_phish, p=[0.30, 0.70]
        ),
        # Long paths with encoded parameters
        "path_length": np.random.choice(
            [np.random.randint(20, 150),
             np.random.randint(0, 20)],
            n_phish, p=[0.70, 0.30]
        ),
        # Typosquatting — misspelled brand names
        "is_typosquatting": np.random.choice(
            [1, 0], n_phish, p=[0.55, 0.45]
        ),
        "label": 1
    })

    # Fix the array columns properly
    phishing["url_length"] = [
        int(np.random.randint(76, 200)) if np.random.random() < 0.75
        else int(np.random.randint(30, 75))
        for _ in range(n_phish)
    ]
    phishing["path_length"] = [
        int(np.random.randint(20, 150)) if np.random.random() < 0.70
        else int(np.random.randint(0, 20))
        for _ in range(n_phish)
    ]

    # ── LEGITIMATE samples ────────────────────────────────────────
    n_legit = 5055

    legitimate = pd.DataFrame({
        # Legitimate URLs tend to be shorter and cleaner
        "url_length": [
            int(np.random.randint(10, 54))
            for _ in range(n_legit)
        ],
        # Fewer dots
        "num_dots": np.random.choice(
            range(1, 6), n_legit,
            p=[0.20, 0.40, 0.25, 0.10, 0.05]
        ),
        # Almost never have @ symbol
        "has_at_symbol": np.random.choice(
            [1, 0], n_legit, p=[0.02, 0.98]
        ),
        # Almost never use IP address
        "has_ip_address": np.random.choice(
            [1, 0], n_legit, p=[0.02, 0.98]
        ),
        # Few subdomains (www only usually)
        "subdomain_count": np.random.choice(
            range(0, 5), n_legit,
            p=[0.10, 0.60, 0.20, 0.07, 0.03]
        ),
        # Almost always HTTPS
        "uses_https": np.random.choice(
            [1, 0], n_legit, p=[0.92, 0.08]
        ),
        # Almost never shortened
        "is_shortened": np.random.choice(
            [1, 0], n_legit, p=[0.03, 0.97]
        ),
        # Rarely have suspicious keywords
        "has_suspicious_keywords": np.random.choice(
            [1, 0], n_legit, p=[0.08, 0.92]
        ),
        # Few special characters
        "special_chars": np.random.choice(
            range(0, 8), n_legit,
            p=[0.25,0.25,0.20,0.12,0.08,0.05,0.03,0.02]
        ),
        # Standard ports only
        "has_port": np.random.choice(
            [1, 0], n_legit, p=[0.02, 0.98]
        ),
        # Shorter paths
        "path_length": [
            int(np.random.randint(0, 30))
            for _ in range(n_legit)
        ],
        # Almost never typosquatting
        "is_typosquatting": np.random.choice(
            [1, 0], n_legit, p=[0.02, 0.98]
        ),
        "label": 0
    })

    # ── Combine and shuffle ───────────────────────────────────────
    df = pd.concat(
        [phishing, legitimate],
        ignore_index=True
    ).sample(frac=1, random_state=42).reset_index(drop=True)

    df.to_csv(DATASET_PATH, index=False)

    print(f"Dataset built successfully:")
    print(f"  Phishing   : {(df['label']==1).sum()}")
    print(f"  Legitimate : {(df['label']==0).sum()}")
    print(f"  Total      : {len(df)}")
    print(f"  Features   : {len(df.columns)-1}")
    print(f"  Saved to   : {DATASET_PATH}\n")

if __name__ == "__main__":
    generate()