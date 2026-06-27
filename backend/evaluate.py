from runtime_graph import app as agent_app
from soc_dataset import SOC_DATASET


def evaluate(dataset):
    correct = 0
    total = len(dataset)

    print("\n==============================")
    print(f"TOTAL EMAILS: {total}")
    print("==============================\n")

    for item in dataset:
        result = agent_app.invoke({
            "email": item["email"]
        })

        pred = result["verdict"]
        expected = item["label"]

        if pred == expected:
            correct += 1

        print("==============================")
        print("EMAIL:\n")
        print(item["email"])
        print(f"EXPECTED: {expected}")
        print(f"PREDICTED: {pred}")
        print("==============================\n")

    accuracy = correct / total

    print("==============================")
    print("FINAL RESULTS")
    print("==============================")
    print(f"Accuracy: {accuracy:.3f}")


if __name__ == "__main__":
    evaluate(SOC_DATASET)