"""
train.py — Train Random Forest on our 12 URL features
"""

import pandas as pd
import numpy as np
import os, sys
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score,
    recall_score, f1_score, confusion_matrix
)

ML_DIR       = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(ML_DIR, "dataset.csv")
MODEL_PATH   = os.path.join(ML_DIR, "model.pkl")


def train():
    print("=" * 55)
    print("   HYBRID PHISHING DETECTION — MODEL TRAINING")
    print("=" * 55 + "\n")

    # 1. Check dataset exists
    if not os.path.exists(DATASET_PATH):
        print("Dataset not found. Building it first...")
        from build_dataset import generate
        generate()

    # 2. Load
    print("Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    print(f"Loaded: {df.shape[0]} rows x {df.shape[1]} columns\n")

    X = df.drop(columns=["label"])
    y = df["label"]
    feature_names = list(X.columns)

    print(f"Phishing   : {(y==1).sum()}")
    print(f"Legitimate : {(y==0).sum()}\n")

    # 3. Split 80/20
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )
    print(f"Training : {len(X_train)} samples")
    print(f"Testing  : {len(X_test)} samples\n")

    # 4. Train
    print("Training Random Forest (100 trees)...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    print("Done.\n")

    # 5. Evaluate
    y_pred    = model.predict(X_test)
    accuracy  = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall    = recall_score(y_test, y_pred, zero_division=0)
    f1        = f1_score(y_test, y_pred, zero_division=0)
    cm        = confusion_matrix(y_test, y_pred)

    print("=" * 55)
    print("         MODEL PERFORMANCE RESULTS")
    print("=" * 55)
    print(f"  Accuracy  : {accuracy  * 100:.2f}%")
    print(f"  Precision : {precision * 100:.2f}%")
    print(f"  Recall    : {recall    * 100:.2f}%")
    print(f"  F1-Score  : {f1        * 100:.2f}%")
    print("=" * 55)

    print(f"\nConfusion Matrix:")
    print(f"  True Negatives  : {cm[0][0]}")
    print(f"  False Positives : {cm[0][1]}")
    print(f"  False Negatives : {cm[1][0]}")
    print(f"  True Positives  : {cm[1][1]}")

    # 6. Feature importance
    importances = pd.Series(
        model.feature_importances_,
        index=feature_names
    ).sort_values(ascending=False)

    print(f"\nFeature Importances:")
    print(f"  {'Feature':<30} Importance")
    print(f"  {'-'*42}")
    for feat, imp in importances.items():
        bar = "█" * int(imp * 60)
        print(f"  {feat:<30} {imp:.4f}  {bar}")

    # 7. Save
    joblib.dump({
        "model":         model,
        "feature_names": feature_names,
        "accuracy":      round(accuracy  * 100, 2),
        "precision":     round(precision * 100, 2),
        "recall":        round(recall    * 100, 2),
        "f1_score":      round(f1        * 100, 2),
        "n_training":    len(X_train),
        "n_testing":     len(X_test),
        "dataset":       "URL Feature Dataset (Phishing + Legitimate)",
    }, MODEL_PATH)

    print(f"\nModel saved → {MODEL_PATH}")
    print("\n" + "=" * 55)
    print("  RECORD THESE FOR CHAPTER 4:")
    print("=" * 55)
    print(f"  Accuracy  : {accuracy  * 100:.2f}%")
    print(f"  Precision : {precision * 100:.2f}%")
    print(f"  Recall    : {recall    * 100:.2f}%")
    print(f"  F1-Score  : {f1        * 100:.2f}%")
    print(f"  Training  : {len(X_train)} samples")
    print(f"  Testing   : {len(X_test)} samples")
    print("=" * 55)
    print("\nNext: uvicorn main:app --reload\n")


if __name__ == "__main__":
    train()