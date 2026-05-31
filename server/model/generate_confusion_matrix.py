import argparse
import csv
import os
import sys
from pathlib import Path

LOCAL_DEPS = Path(__file__).with_name("eval_deps")
if LOCAL_DEPS.exists():
    sys.path.insert(0, str(LOCAL_DEPS))

import numpy as np
from PIL import Image, ImageDraw, ImageFont


DEFAULT_MODEL = Path(__file__).with_name("DenseNet169.tfliteQuant")
DEFAULT_LABELS = Path(__file__).with_name("Labels.txt")
DEFAULT_DATASET = Path(__file__).resolve().parents[2] / "test_dataset"
DEFAULT_OUTPUT = Path(__file__).with_name("confusion_matrix.png")
DEFAULT_CSV = Path(__file__).with_name("confusion_matrix_predictions.csv")
DEFAULT_METRICS = Path(__file__).with_name("classification_metrics.txt")

IMAGE_SIZE = (224, 224)
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def load_tflite_interpreter(model_path):
    try:
        import tensorflow as tf

        return tf.lite.Interpreter(model_path=str(model_path))
    except ImportError:
        try:
            from tflite_runtime.interpreter import Interpreter

            return Interpreter(model_path=str(model_path))
        except ImportError as exc:
            raise RuntimeError(
                "No TFLite runtime found. Install either tensorflow or tflite-runtime."
            ) from exc


def load_labels(labels_path):
    with open(labels_path, "r", encoding="utf-8") as file:
        return [line.strip() for line in file if line.strip()]


def collect_images(dataset_dir, labels):
    label_set = set(labels)
    samples = []
    skipped_folders = []

    for class_dir in sorted(Path(dataset_dir).iterdir()):
        if not class_dir.is_dir():
            continue
        if class_dir.name not in label_set:
            skipped_folders.append(class_dir.name)
            continue
        for image_path in sorted(class_dir.rglob("*")):
            if image_path.is_file() and image_path.suffix.lower() in IMAGE_EXTENSIONS:
                samples.append((image_path, class_dir.name))

    return samples, skipped_folders


def preprocess_image(image_path, input_details):
    input_info = input_details[0]
    input_shape = input_info["shape"]
    input_dtype = input_info["dtype"]

    height = int(input_shape[1]) if len(input_shape) >= 3 else IMAGE_SIZE[1]
    width = int(input_shape[2]) if len(input_shape) >= 3 else IMAGE_SIZE[0]

    image = Image.open(image_path).convert("RGB").resize((width, height), Image.Resampling.NEAREST)

    if input_dtype == np.float32:
        data = np.asarray(image, dtype=np.float32) / 255.0
    else:
        data = np.asarray(image, dtype=input_dtype)

    return np.expand_dims(data, axis=0)


def predict_label(interpreter, input_details, output_details, image_path, labels):
    input_data = preprocess_image(image_path, input_details)
    interpreter.set_tensor(input_details[0]["index"], input_data)
    interpreter.invoke()

    output = interpreter.get_tensor(output_details[0]["index"])[0]
    predicted_index = int(np.argmax(output))
    confidence = float(output[predicted_index])

    return labels[predicted_index], confidence


def build_confusion_matrix(y_true, y_pred, labels):
    label_to_index = {label: index for index, label in enumerate(labels)}
    matrix = np.zeros((len(labels), len(labels)), dtype=np.int32)

    for actual, predicted in zip(y_true, y_pred):
        matrix[label_to_index[actual], label_to_index[predicted]] += 1

    return matrix


def active_labels_from_matrix(matrix, labels):
    active = []
    for index, label in enumerate(labels):
        if matrix[index, :].sum() > 0 or matrix[:, index].sum() > 0:
            active.append(label)
    return active


def calculate_metrics(matrix, labels):
    total = int(matrix.sum())
    correct = int(np.trace(matrix))
    accuracy = correct / total if total else 0.0

    rows = []
    precisions = []
    f1_scores = []
    supports = []

    for index, label in enumerate(labels):
        tp = int(matrix[index, index])
        fp = int(matrix[:, index].sum() - tp)
        fn = int(matrix[index, :].sum() - tp)
        support = int(matrix[index, :].sum())

        if support == 0 and int(matrix[:, index].sum()) == 0:
            continue

        precision = tp / (tp + fp) if (tp + fp) else 0.0
        recall = tp / (tp + fn) if (tp + fn) else 0.0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0.0

        rows.append(
            {
                "label": label,
                "precision": precision,
                "f1_score": f1,
                "support": support,
            }
        )
        precisions.append(precision)
        f1_scores.append(f1)
        supports.append(support)

    macro_precision = float(np.mean(precisions)) if precisions else 0.0
    macro_f1 = float(np.mean(f1_scores)) if f1_scores else 0.0
    weighted_precision = (
        float(np.average(precisions, weights=supports)) if sum(supports) else 0.0
    )
    weighted_f1 = float(np.average(f1_scores, weights=supports)) if sum(supports) else 0.0

    return {
        "total": total,
        "correct": correct,
        "accuracy": accuracy,
        "macro_precision": macro_precision,
        "macro_f1": macro_f1,
        "weighted_precision": weighted_precision,
        "weighted_f1": weighted_f1,
        "rows": rows,
    }


def write_metrics_report(metrics, metrics_path):
    metrics_path.parent.mkdir(parents=True, exist_ok=True)
    with open(metrics_path, "w", encoding="utf-8") as file:
        file.write("Classification Metrics\n")
        file.write("======================\n\n")
        file.write(f"Total images: {metrics['total']}\n")
        file.write(f"Correct predictions: {metrics['correct']}\n")
        file.write(f"Accuracy: {metrics['accuracy']:.4f} ({metrics['accuracy'] * 100:.2f}%)\n")
        file.write(f"Macro precision: {metrics['macro_precision']:.4f}\n")
        file.write(f"Macro F1-score: {metrics['macro_f1']:.4f}\n")
        file.write(f"Weighted precision: {metrics['weighted_precision']:.4f}\n")
        file.write(f"Weighted F1-score: {metrics['weighted_f1']:.4f}\n\n")
        file.write(f"{'Class':60} {'Precision':>10} {'F1-score':>10} {'Support':>10}\n")
        file.write("-" * 95 + "\n")

        for row in metrics["rows"]:
            file.write(
                f"{row['label'][:60]:60} "
                f"{row['precision']:10.4f} "
                f"{row['f1_score']:10.4f} "
                f"{row['support']:10d}\n"
            )


def draw_confusion_matrix(matrix, labels, output_path, metrics=None):
    active_labels = active_labels_from_matrix(matrix, labels)
    active_indices = [labels.index(label) for label in active_labels]
    display_matrix = matrix[np.ix_(active_indices, active_indices)]

    cell = 56
    left_margin = 330
    top_margin = 310
    right_margin = 80
    bottom_margin = 120
    n = len(active_labels)

    width = left_margin + n * cell + right_margin
    height = top_margin + n * cell + bottom_margin

    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)

    try:
        font = ImageFont.truetype("arial.ttf", 18)
        small_font = ImageFont.truetype("arial.ttf", 14)
        title_font = ImageFont.truetype("arial.ttf", 30)
    except OSError:
        font = ImageFont.load_default()
        small_font = ImageFont.load_default()
        title_font = ImageFont.load_default()

    draw.text((left_margin, 28), "Confusion Matrix", fill=(20, 35, 60), font=title_font)
    if metrics:
        summary = (
            f"Accuracy: {metrics['accuracy'] * 100:.2f}% | "
            f"Precision: {metrics['weighted_precision']:.4f} | "
            f"F1-score: {metrics['weighted_f1']:.4f}"
        )
        draw.text((left_margin, 64), summary, fill=(20, 35, 60), font=font)
    draw.text((left_margin + n * cell // 2 - 70, 86), "Predicted Label", fill=(20, 35, 60), font=font)
    draw.text((26, top_margin + n * cell // 2 - 20), "True Label", fill=(20, 35, 60), font=font)

    max_value = int(display_matrix.max()) if display_matrix.size else 0
    max_value = max(max_value, 1)

    for row in range(n):
        for col in range(n):
            value = int(display_matrix[row, col])
            intensity = int(245 - (value / max_value) * 180)
            fill = (intensity, intensity + 5 if intensity < 250 else 250, 255)
            x0 = left_margin + col * cell
            y0 = top_margin + row * cell
            x1 = x0 + cell
            y1 = y0 + cell
            draw.rectangle([x0, y0, x1, y1], fill=fill, outline=(210, 220, 235))
            text = str(value)
            bbox = draw.textbbox((0, 0), text, font=font)
            draw.text(
                (x0 + (cell - (bbox[2] - bbox[0])) / 2, y0 + (cell - (bbox[3] - bbox[1])) / 2),
                text,
                fill=(10, 25, 45),
                font=font,
            )

    for index, label in enumerate(active_labels):
        y = top_margin + index * cell + cell // 2
        draw.text((18, y - 8), label, fill=(20, 35, 60), font=small_font)

        x = left_margin + index * cell + cell // 2
        label_img = Image.new("RGBA", (260, 24), (255, 255, 255, 0))
        label_draw = ImageDraw.Draw(label_img)
        label_draw.text((0, 0), label, fill=(20, 35, 60), font=small_font)
        label_img = label_img.rotate(60, expand=True)
        image.paste(label_img, (x - 12, top_margin - 235), label_img)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path)


def write_predictions_csv(rows, csv_path):
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with open(csv_path, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["image_path", "actual_label", "predicted_label", "confidence"])
        writer.writerows(rows)


def parse_args():
    parser = argparse.ArgumentParser(description="Generate a confusion matrix for a local TFLite model.")
    parser.add_argument("--model", default=str(DEFAULT_MODEL), help="Path to .tflite or .tfliteQuant model.")
    parser.add_argument("--labels", default=str(DEFAULT_LABELS), help="Path to Labels.txt.")
    parser.add_argument("--dataset", default=str(DEFAULT_DATASET), help="Path to labeled dataset folder.")
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT), help="Output confusion matrix PNG path.")
    parser.add_argument("--csv", default=str(DEFAULT_CSV), help="Output predictions CSV path.")
    parser.add_argument("--metrics", default=str(DEFAULT_METRICS), help="Output metrics report path.")
    return parser.parse_args()


def main():
    args = parse_args()
    model_path = Path(args.model)
    labels_path = Path(args.labels)
    dataset_dir = Path(args.dataset)
    output_path = Path(args.output)
    csv_path = Path(args.csv)
    metrics_path = Path(args.metrics)

    labels = load_labels(labels_path)
    samples, skipped_folders = collect_images(dataset_dir, labels)

    if skipped_folders:
        print("Skipped unknown folders:")
        for folder in skipped_folders:
            print(f"  - {folder}")

    if not samples:
        raise RuntimeError(f"No supported images found in {dataset_dir}")

    interpreter = load_tflite_interpreter(model_path)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    y_true = []
    y_pred = []
    prediction_rows = []

    for index, (image_path, actual_label) in enumerate(samples, start=1):
        predicted_label, confidence = predict_label(
            interpreter,
            input_details,
            output_details,
            image_path,
            labels,
        )
        y_true.append(actual_label)
        y_pred.append(predicted_label)
        prediction_rows.append([str(image_path), actual_label, predicted_label, f"{confidence:.8f}"])

        if index % 10 == 0 or index == len(samples):
            print(f"Processed {index}/{len(samples)} images")

    matrix = build_confusion_matrix(y_true, y_pred, labels)
    metrics = calculate_metrics(matrix, labels)
    draw_confusion_matrix(matrix, labels, output_path, metrics)
    write_predictions_csv(prediction_rows, csv_path)
    write_metrics_report(metrics, metrics_path)

    print(f"Confusion matrix saved to: {output_path}")
    print(f"Predictions CSV saved to: {csv_path}")
    print(f"Metrics report saved to: {metrics_path}")
    print(f"Accuracy: {metrics['accuracy'] * 100:.2f}%")
    print(f"Weighted precision: {metrics['weighted_precision']:.4f}")
    print(f"Weighted F1-score: {metrics['weighted_f1']:.4f}")


if __name__ == "__main__":
    main()
