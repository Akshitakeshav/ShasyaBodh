import sys
import os
import json
import numpy as np
from PIL import Image

def load_labels(labels_path):
    with open(labels_path, 'r') as f:
        return [line.strip() for line in f.readlines() if line.strip()]

def parse_label(label):
    # Parse labels like "Tomato_Early_blight" or "Tomato_healthy" into Crop and Disease
    # Some labels have prefix like "Cherry_(including_sour)_" or "Corn_(maize)_"
    crop = "Unknown"
    disease = "Unknown"
    
    if not label:
        return crop, disease

    # Standardize common prefixes
    if label.startswith("Cherry_(including_sour)_"):
        crop = "Cherry"
        disease = label.replace("Cherry_(including_sour)_", "")
    elif label.startswith("Corn_(maize)_"):
        crop = "Corn"
        disease = label.replace("Corn_(maize)_", "")
    elif label.startswith("Pepper_bell_"):
        crop = "Pepper Bell"
        disease = label.replace("Pepper_bell_", "")
    else:
        parts = label.split("_", 1)
        if len(parts) == 2:
            crop = parts[0]
            disease = parts[1]
        else:
            crop = label
            disease = "Healthy"
            
    # Clean up display strings
    crop = crop.replace("_", " ").title()
    disease = disease.replace("_", " ").title()
    
    if disease == "Healthy":
        disease = "Healthy"
        
    return crop, disease

def get_treatment(disease, crop):
    # Simple hardcoded treatment advisor based on crop/disease
    treatments = {
        "Early Blight": [
            "Apply Mancozeb 75% WP",
            "Dose: 2g per litre of water",
            "Spray in evening",
            "Repeat after 7 days"
        ],
        "Late Blight": [
            "Apply Ridomil Gold (Metalaxyl + Mancozeb)",
            "Dose: 2.5g per litre of water",
            "Improve air circulation in crop field",
            "Remove infected lower leaves"
        ],
        "Black Rot": [
            "Apply copper-based fungicide",
            "Prune infected branches and destroy them",
            "Maintain clean field environment"
        ],
        "Cedar Apple Rust": [
            "Apply Myclobutanil or Copper fungicide",
            "Remove nearby cedar plants if possible",
            "Prune galls in early spring"
        ],
        "Powdery Mildew": [
            "Apply wettable sulfur or Neem oil",
            "Water plants at the base, not overhead",
            "Ensure plants receive adequate sunlight"
        ],
        "Bacterial Spot": [
            "Apply copper hydroxide mixed with mancozeb",
            "Avoid overhead watering to reduce spread",
            "Use certified disease-free seeds"
        ],
        "Leaf Mold": [
            "Apply Chlorothalonil or copper fungicide",
            "Reduce humidity and improve ventilation",
            "Keep foliage dry"
        ],
        "Septoria Leaf Spot": [
            "Apply Copper fungicide or Chlorothalonil",
            "Keep soil mulched to prevent spores splashing",
            "Water at the base of the plant"
        ],
        "Spider Mites": [
            "Apply Abamectin or Miticide",
            "Use Neem oil or insecticidal soap",
            "Increase humidity around foliage"
        ],
        "Target Spot": [
            "Apply Azoxystrobin or Chlorothalonil",
            "Improve plant spacing for airflow",
            "Remove crop debris after harvest"
        ],
        "Yellow Leaf Curl Virus": [
            "Control Whiteflies using Imidacloprid",
            "Use yellow sticky traps to catch vectors",
            "Remove infected plants immediately"
        ],
        "Mosaic Virus": [
            "No chemical cure exists for viruses",
            "Remove and destroy infected plants immediately",
            "Control insect vectors (aphids/thrips)",
            "Sanitize tools and wash hands frequently"
        ]
    }
    
    # Check for substring matches in disease name
    for key, value in treatments.items():
        if key.lower() in disease.lower():
            return value
            
    if "healthy" in disease.lower():
        return [
            "No treatment needed.",
            "Maintain current watering schedule.",
            "Keep monitoring for pests."
        ]
        
    return [
        "Consult local agriculture extension service.",
        "Monitor plant closely for spread.",
        "Avoid overhead irrigation."
    ]

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided."}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    
    # Paths
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, "DenseNet169.tfliteQuant")
    labels_path = os.path.join(model_dir, "Labels.txt")
    
    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image file not found: {image_path}"}))
        sys.exit(1)
        
    try:
        # Load labels
        labels = load_labels(labels_path)
        
        # Load TFLite model using tensorflow interpreter
        import tensorflow as tf
        interpreter = tf.lite.Interpreter(model_path=model_path)
        interpreter.allocate_tensors()
        
        # Get input and output tensors details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        # Preprocess image
        # MobileNet expects 224x224 float32 input [0, 1]
        img = Image.open(image_path).convert('RGB')
        img = img.resize((224, 224), Image.Resampling.NEAREST)
        
        input_data = np.array(img, dtype=np.float32)
        input_data = input_data / 255.0
        input_data = np.expand_dims(input_data, axis=0) # Add batch dimension
        
        # Set input tensor
        interpreter.set_tensor(input_details[0]['index'], input_data)
        
        # Run inference
        interpreter.invoke()
        
        # Get predictions
        output_data = interpreter.get_tensor(output_details[0]['index'])[0]
        
        # Get top predictions
        top_indices = np.argsort(output_data)[::-1][:3]
        
        results = []
        for idx in top_indices:
            score = float(output_data[idx])
            raw_label = labels[idx] if idx < len(labels) else "Unknown"
            crop, disease = parse_label(raw_label)
            results.append({
                "raw_label": raw_label,
                "crop": crop,
                "disease": disease,
                "confidence": round(score * 100, 2)
            })
            
        # Select best prediction
        best = results[0]
        treatment = get_treatment(best["disease"], best["crop"])
        
        # Format alternatives
        alternatives = [f"{r['disease']} ({r['confidence']:.1f}%)" for r in results[1:]]
        
        output = {
            "crop": best["crop"],
            "disease": best["disease"],
            "confidence": best["confidence"],
            "severity": "Moderate" if "healthy" not in best["disease"].lower() else "None",
            "treatment": treatment,
            "alternatives": alternatives,
            "all_predictions": results
        }
        
        print(json.dumps(output))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
