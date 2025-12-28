import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeShelfImage = async (imageFile) => {
  try {
    const base64Data = await fileToGenerativePart(imageFile);
    // Use the model that worked for you (gemini-flash-latest)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Analyze this image of a pharmacy shelf or medicine strip.
      Identify the medicine names, potential dosage (mg), and estimated quantity.
      Return strictly a JSON array.
      Format: [{"name": "Dolo", "dosage": "650mg", "type": "Tablet", "estimated_stock": 10}]
    `;

    const result = await model.generateContent([prompt, base64Data]);
    const response = await result.response;
    const text = response.text();
    
    console.log("📝 RAW AI RESPONSE:", text); // <--- Check your Console for this!

    // ROBUST JSON PARSING: Find the first '[' and last ']'
    const firstBracket = text.indexOf("[");
    const lastBracket = text.lastIndexOf("]");

    if (firstBracket === -1 || lastBracket === -1) {
       // If AI didn't return a list, force an empty array to avoid crash
       console.warn("No JSON array found in response");
       return [];
    }

    const cleanJson = text.substring(firstBracket, lastBracket + 1);
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("AI Scan Error:", error);
    throw error;
  }
};
// Helper: Convert file to Base64 for Gemini
async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: { data: base64Data, mimeType: file.type },
      });
    };
    reader.onerror = reject;
  });
}