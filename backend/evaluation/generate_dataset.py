import json
import random
from pathlib import Path

# -----------------------------
# ALWAYS SAFE BASE PATH
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

# Ensure data folder exists
DATA_DIR.mkdir(exist_ok=True)

# -----------------------------
# EMAIL GENERATORS
# -----------------------------
def generate_email(label):
    if label == "phishing":
        return {
            "email": f"Urgent: verify your account immediately at http://fake-login-{random.randint(1000,9999)}.com",
            "label": "phishing"
        }

    if label == "legit":
        return {
            "email": "Hey, your meeting is scheduled for tomorrow at 10am. Please find the agenda attached.",
            "label": "legit"
        }

    if label == "edge":
        return {
            "email": "Your account activity requires review. Please check your dashboard for updates.",
            "label": "edge"
        }

# -----------------------------
# BUILD DATASET (400 TOTAL)
# -----------------------------
def build_dataset():
    phishing = [generate_email("phishing") for _ in range(150)]
    legit = [generate_email("legit") for _ in range(150)]
    edge = [generate_email("edge") for _ in range(100)]

    return phishing, legit, edge

# -----------------------------
# SAVE DATASET SAFELY
# -----------------------------
def save_data():
    phishing, legit, edge = build_dataset()

    phishing_path = DATA_DIR / "phishing_samples.json"
    legit_path = DATA_DIR / "legit_samples.json"
    edge_path = DATA_DIR / "edge_cases.json"

    with open(phishing_path, "w", encoding="utf-8") as f:
        json.dump(phishing, f, indent=2)

    with open(legit_path, "w", encoding="utf-8") as f:
        json.dump(legit, f, indent=2)

    with open(edge_path, "w", encoding="utf-8") as f:
        json.dump(edge, f, indent=2)

    print("Dataset generated successfully ✅")
    print(f"Phishing: {len(phishing)}")
    print(f"Legit: {len(legit)}")
    print(f"Edge: {len(edge)}")
    print(f"TOTAL: {len(phishing) + len(legit) + len(edge)}")

# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    save_data()