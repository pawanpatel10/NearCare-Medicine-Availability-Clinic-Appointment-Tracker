import { useEffect, useState } from "react";
import { analyzeShelfImage } from "../services/aiService";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function InventoryScanner() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // Prevent duplicate submissions
  const [scannedItems, setScannedItems] = useState([]); // Stores the AI results
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...scannedItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setScannedItems(updatedItems);
  };

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

      // Normalize result to match DB schema needs
      const normalizedResult = result.map((item) => ({
        name: item.name || "Unknown",
        dosage: item.dosage || "",
        type: item.type || "Tablet",
        stock: item.estimated_stock || 0,
        price: 0, // Default
        expiry: "", // Default
      }));

      setScannedItems(normalizedResult);
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
    if (!auth.currentUser || saving) return; // Prevent if already saving

    setSaving(true); // Start saving state

    try {
      // Loop through all scanned items and save to Firestore
      const inventoryRef = collection(db, "pharmacy_inventory");

      const promises = scannedItems.map((item) =>
        addDoc(inventoryRef, {
          pharmacyId: auth.currentUser.uid,
          name: item.name,
          name_lower: item.name.trim().toLowerCase(),
          dosage: item.dosage,
          stock: Number(item.stock),
          price: Number(item.price),
          expiry: item.expiry,
          type: item.type,
          updatedAt: new Date(),
        })
      );

      await Promise.all(promises);
      setScannedItems([]); // Clear items after successful save
      alert("Inventory Updated Successfully!");
      navigate("/pharmacy/inventory");
    } catch (error) {
      console.error("Save Error:", error);
      alert("Error saving data");
      setSaving(false); // Reset on error only
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
    <div className="min-h-screen bg-mesh p-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
            <span className="text-2xl">📸</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              AI Stock Scanner
            </h2>
            <p className="text-slate-500 text-sm">
              Snap a photo to auto-detect medicines
            </p>
          </div>
        </div>
      </div>

      {/* 1. Camera Input */}
      <div
        className="max-w-2xl mx-auto glass-card p-8 rounded-2xl text-center animate-fade-in-up"
        style={{ animationDelay: "0.1s" }}
      >
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
          className="cursor-pointer flex flex-col items-center gap-3 group"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            📷
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            Tap to Snap Photo
          </span>
          <span className="text-sm text-slate-400">
            Takes a photo of your medicine strip or shelf
          </span>
        </label>
      </div>

      {/* 2. Image Preview */}
      {previewUrl && (
        <div className="max-w-2xl mx-auto mt-6 flex justify-center animate-fade-in-up">
          <div className="glass-card p-3 rounded-2xl">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-48 rounded-xl shadow-md object-cover"
            />
          </div>
        </div>
      )}

      {/* 3. Loading State */}
      {loading && (
        <div className="max-w-2xl mx-auto mt-8 text-center animate-fade-in-up">
          <div className="glass-card rounded-2xl p-6 inline-block">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
            <p className="text-slate-600 font-medium animate-pulse">
              AI is reading the labels...
            </p>
          </div>
        </div>
      )}

      {/* NEW: Handle "No Items" Case */}
      {!loading && previewUrl && scannedItems.length === 0 && (
        <div className="max-w-2xl mx-auto mt-8 p-5 glass-card rounded-2xl text-center border-2 border-amber-200 animate-fade-in-up">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="font-bold text-amber-700">No medicines detected</p>
          <p className="text-sm text-slate-500 mt-1">
            Try moving closer or ensuring better lighting.
          </p>
        </div>
      )}

      {/* 4. Results List (Editable) */}
      {scannedItems.length > 0 && (
        <div
          className="max-w-2xl mx-auto mt-8 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-sm">
              ✓
            </span>
            We found these medicines:
          </h3>
          <div className="space-y-4">
            {scannedItems.map((item, index) => (
              <div
                key={index}
                className="glass-card p-5 rounded-2xl border border-slate-100 flex flex-col gap-4 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <input
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, "name", e.target.value)
                      }
                      className="font-bold text-slate-800 text-lg bg-transparent border-b-2 border-dashed border-slate-200 focus:border-teal-500 outline-none w-full py-1 transition-colors"
                      placeholder="Medicine Name"
                    />
                    <div className="flex gap-3 mt-3">
                      <input
                        value={item.dosage}
                        onChange={(e) =>
                          handleItemChange(index, "dosage", e.target.value)
                        }
                        placeholder="Dosage"
                        className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-24 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      />
                      <select
                        value={item.type}
                        onChange={(e) =>
                          handleItemChange(index, "type", e.target.value)
                        }
                        className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      >
                        <option>Tablet</option>
                        <option>Syrup</option>
                        <option>Injection</option>
                        <option>Cream</option>
                        <option>Powder</option>
                        <option>Drops</option>
                        <option>Capsule</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-medium">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={item.stock}
                      onChange={(e) =>
                        handleItemChange(index, "stock", e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center font-medium focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-medium">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(index, "price", e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center font-medium focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-medium">
                      Expiry
                    </label>
                    <input
                      type="date"
                      value={item.expiry}
                      onChange={(e) =>
                        handleItemChange(index, "expiry", e.target.value)
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-sm focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={saveToInventory}
            disabled={saving}
            className={`w-full mt-6 bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3
              ${
                saving
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:shadow-xl hover:scale-[1.02]"
              }`}
          >
            {saving ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving to Inventory...
              </>
            ) : (
              "✓ Confirm & Add to Inventory"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
