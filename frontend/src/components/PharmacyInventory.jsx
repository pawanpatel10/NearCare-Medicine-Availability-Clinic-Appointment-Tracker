import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { 
  collection, query, where, onSnapshot, 
  addDoc, deleteDoc, updateDoc, doc 
} from "firebase/firestore";
import Navbar from "./Navbar";

export default function PharmacyInventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for "Add Manual" Form
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    dosage: "", // e.g., 500mg
    price: "",
    stock: "",
    expiry: "",
    type: "Tablet" // Default
  });

  // 1. Listen to Real-Time Inventory Updates
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return navigate("/login");

    const q = query(
      collection(db, "pharmacy_inventory"),
      where("pharmacyId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inventoryList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(inventoryList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // 2. Handle Manual Add
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, "pharmacy_inventory"), {
        ...newItem,
        pharmacyId: auth.currentUser.uid,
        price: Number(newItem.price),
        stock: Number(newItem.stock),
        updatedAt: new Date()
      });
      setShowForm(false);
      setNewItem({ name: "", dosage: "", price: "", stock: "", expiry: "", type: "Tablet" });
      alert("Medicine added!");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  // 3. Handle Delete (Remove Expired)
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      await deleteDoc(doc(db, "pharmacy_inventory", id));
    }
  };

  // 4. Handle Quick Update (Price/Stock)
  const handleUpdate = async (id, field, value) => {
    const itemRef = doc(db, "pharmacy_inventory", id);
    await updateDoc(itemRef, {
      [field]: Number(value)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
            <p className="text-gray-500 text-sm">Track stock, update prices, and remove expired items.</p>
          </div>
          
          <div className="flex gap-3">
            {/* Button 1: AI Scanner */}
            <button 
              onClick={() => navigate("/inventory-scanner")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition shadow-md"
            >
              <span>📸</span> Scan with AI
            </button>
            
            {/* Button 2: Manual Add */}
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition shadow-md"
            >
              <span>➕</span> Add Manually
            </button>
          </div>
        </div>

        {/* --- ADD NEW ITEM FORM (Toggleable) --- */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-teal-100 mb-8 animate-fade-in-down">
            <h3 className="font-bold text-gray-700 mb-4">Add New Medicine</h3>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <input 
                type="text" placeholder="Medicine Name (e.g. Dolo)" 
                className="border p-2 rounded" required
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
              />
              <input 
                type="text" placeholder="Dosage (e.g. 650mg)" 
                className="border p-2 rounded"
                value={newItem.dosage}
                onChange={e => setNewItem({...newItem, dosage: e.target.value})}
              />
              <select 
                className="border p-2 rounded"
                value={newItem.type}
                onChange={e => setNewItem({...newItem, type: e.target.value})}
              >
                <option>Tablet</option>
                <option>Syrup</option>
                <option>Injection</option>
                <option>Cream</option>
              </select>

              <input 
                type="number" placeholder="Price (₹)" 
                className="border p-2 rounded" required
                value={newItem.price}
                onChange={e => setNewItem({...newItem, price: e.target.value})}
              />
              <input 
                type="number" placeholder="Stock Quantity" 
                className="border p-2 rounded" required
                value={newItem.stock}
                onChange={e => setNewItem({...newItem, stock: e.target.value})}
              />
              <input 
                type="date" placeholder="Expiry Date" 
                className="border p-2 rounded"
                value={newItem.expiry}
                onChange={e => setNewItem({...newItem, expiry: e.target.value})}
              />

              <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                <button 
                  type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 font-medium"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- INVENTORY LIST TABLE --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
             <div className="p-8 text-center text-gray-500">Loading inventory...</div>
          ) : items.length === 0 ? (
             <div className="p-12 text-center">
               <div className="text-4xl mb-3">📦</div>
               <h3 className="text-gray-800 font-bold">Your Inventory is Empty</h3>
               <p className="text-gray-500 text-sm">Use the Scanner or Manual Add to get started.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4">Medicine Name</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Stock (Qty)</th>
                    <th className="p-4">Price (₹)</th>
                    <th className="p-4">Expiry</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      
                      {/* Name & Dosage */}
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.dosage}</div>
                      </td>
                      
                      {/* Type Badge */}
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                          {item.type}
                        </span>
                      </td>

                      {/* Editable Stock */}
                      <td className="p-4">
                        <input 
                          type="number" 
                          defaultValue={item.stock}
                          onBlur={(e) => handleUpdate(item.id, 'stock', e.target.value)}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-center focus:border-teal-500 focus:outline-none"
                        />
                      </td>

                      {/* Editable Price */}
                      <td className="p-4">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-1">₹</span>
                          <input 
                            type="number" 
                            defaultValue={item.price}
                            onBlur={(e) => handleUpdate(item.id, 'price', e.target.value)}
                            className="w-20 border border-gray-300 rounded px-2 py-1 focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                      </td>

                      {/* Expiry Date (Highlight if expired) */}
                      <td className="p-4">
                        <div className={`text-sm ${new Date(item.expiry) < new Date() ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                           {item.expiry || "N/A"}
                           {new Date(item.expiry) < new Date() && <span className="block text-xs">EXPIRED</span>}
                        </div>
                      </td>

                      {/* Delete Action */}
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition"
                          title="Remove Item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}