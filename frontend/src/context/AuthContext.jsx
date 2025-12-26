import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'user', 'clinic', or 'pharmacy'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener runs whenever the user logs in or out
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in, now let's find out WHO they are (Role)
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserRole(userData.role);
            // We combine Auth info + Database info into one object
            setCurrentUser({ ...user, ...userData }); 
          } else {
            // New Google User who hasn't completed profile yet
            setCurrentUser(user);
            setUserRole(null); 
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        // User is logged out
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use this easily in any component
export const useAuth = () => {
  return useContext(AuthContext);
};