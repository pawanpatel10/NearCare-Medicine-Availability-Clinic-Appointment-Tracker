import { useEffect, useState } from "react";
import { analyzeShelfImage } from "../services/aiService";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function InventoryScanner() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scannedItems, setScannedItems] = useState([]); // Stores the AI results
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageUpload = async (e) => {
    const originalFile = e.target.files[0];
    if (!originalFile) return;

    try {
      setLoading(true); // Start loading immediately

      // 1. COMPRESS THE IMAGE FIRST (Crucial for Mobile)
      console.log("Compressing image...");
      const compressedFile = await compressImage(originalFile);

      // 2. Set Preview with the small image (lightweight)
      setPreviewUrl(URL.createObjectURL(compressedFile));
      setImage(compressedFile);

      // 3. Send the SMALL file to AI
      const result = await analyzeShelfImage(compressedFile);
      setScannedItems(result);
    } catch (error) {
      console.error("Scan failed:", error);
      alert("Failed to scan. Try a smaller image.");
    } finally {
      setLoading(false);
    }
  };

  //   useEffect(() => {
  //     // Run this directly in browser console or a temporary component
  // const checkModels = async () => {
  //   const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  //   const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  //   try {
  //     const response = await fetch(url);
  //     const data = await response.json();
  //     console.log("✅ AVAILABLE MODELS:", data.models);
  //   } catch (error) {
  //     console.error("❌ Error listing models:", error);
  //   }
  // };

  // checkModels();
  //     }, []);

  const saveToInventory = async () => {
    if (!auth.currentUser) return;

    try {
      // Loop through all scanned items and save to Firestore
      const inventoryRef = collection(db, "pharmacy_inventory");

      const promises = scannedItems.map((item) =>
        addDoc(inventoryRef, {
          pharmacyId: auth.currentUser.uid,
          name: item.name,
          dosage: item.dosage,
          quantity: item.estimated_stock,
          type: item.type,
          lastUpdated: new Date(),
        })
      );

      await Promise.all(promises);
      alert("Inventory Updated Successfully!");
      navigate("/pharmacy-dashboard");
    } catch (error) {
      console.error("Save Error:", error);
      alert("Error saving data");
    }
  };

  // Helper: Resize image to max 800px width/height to save memory
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800; // Much smaller than a 4000px phone photo
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert back to File
          canvas.toBlob(
            (blob) => {
              const resizedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            },
            "image/jpeg",
            0.7
          ); // 70% Quality
        };
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        📸 AI Stock Scanner
      </h2>

      {/* 1. Camera Input */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-dashed border-gray-300 text-center">
        <input
          type="file"
          accept="image/*"
          capture="environment" // Opens rear camera on mobile
          onChange={handleImageUpload}
          className="hidden"
          id="cameraInput"
        />
        <label
          htmlFor="cameraInput"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <div className="bg-teal-50 p-4 rounded-full text-4xl">📷</div>
          <span className="text-teal-700 font-semibold">Tap to Snap Photo</span>
          <span className="text-xs text-gray-400">
            Takes a photo of your medicine strip or shelf
          </span>
        </label>
      </div>

      {/* 2. Image Preview */}
      {previewUrl && (
        <div className="mt-6 flex justify-center">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-48 rounded-lg shadow-md object-cover"
          />
        </div>
      )}

      {/* 3. Loading State */}
      {loading && (
        <div className="mt-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-2"></div>
          <p className="text-gray-600 animate-pulse">
            AI is reading the labels...
          </p>
        </div>
      )}

      {/* NEW: Handle "No Items" Case */}
      {!loading && previewUrl && scannedItems.length === 0 && (
        <div className="mt-8 p-4 bg-yellow-50 text-yellow-700 rounded-lg text-center border border-yellow-200">
          <p className="font-bold">⚠️ No medicines detected</p>
          <p className="text-sm">
            Try moving closer or ensuring better lighting.
          </p>
        </div>
      )}

      {/* 4. Results List (Editable) */}
      {scannedItems.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-gray-700 mb-4">
            We found these medicines:
          </h3>
          <div className="space-y-3">
            {scannedItems.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.dosage} • {item.type}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Qty:</span>
                  <input
                    type="number"
                    defaultValue={item.estimated_stock}
                    className="w-16 border rounded p-1 text-center"
                    // Ideally, you'd update state here on change
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={saveToInventory}
            className="w-full mt-6 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition"
          >
            Confirm & Add to Inventory
          </button>
        </div>
      )}
    </div>
  );
}
