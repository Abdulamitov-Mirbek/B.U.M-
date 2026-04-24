from pathlib import Path

import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression


MODELS_DIR = Path("models")
MODEL_PATH = MODELS_DIR / "model.pkl"


def main() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    x_train = np.array(
        [
            [42, 12000, 20000, 24, 10, 1500, 8, 1],
            [25, 4000, 30000, 48, 2, 3500, 1, 2],
            [35, 9000, 25000, 24, 7, 1200, 5, 1],
            [22, 3000, 35000, 60, 1, 2800, 1, 3],
            [45, 15000, 15000, 12, 15, 700, 12, 0],
            [31, 7000, 20000, 24, 5, 1500, 4, 1],
            [21, 2500, 25000, 48, 0.5, 2100, 0.5, 2],
            [39, 11000, 18000, 18, 9, 1000, 7, 1],
        ]
    )
    y_train = np.array([1, 0, 1, 0, 1, 1, 0, 1])

    model = LogisticRegression(max_iter=1000)
    model.fit(x_train, y_train)
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()
