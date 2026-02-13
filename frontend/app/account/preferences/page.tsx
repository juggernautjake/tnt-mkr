// "use client";

// import { useAuthContext } from "../../../context/AuthContext";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { API, BEARER } from "../../../src/constant";

// interface Preferences {
//   theme?: string;
//   // Add other preference fields as needed
// }

// export default function PreferencesPage(): JSX.Element {
//   const { user, isAuthenticated, updateUser } = useAuthContext();
//   const [preferences, setPreferences] = useState<Preferences>(user?.preferences || {});
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     setPreferences(user?.preferences || {});
//   }, [user]);

//   const handleSave = async () => {
//     if (!isAuthenticated || !user) return;

//     try {
//       const token = localStorage.getItem("authToken");
//       if (!token) throw new Error("No auth token found.");

//       // Update using the user's ID instead of /users/me
//       const response = await axios.put(
//         `${API}/users/${user.id}`,
//         { preferences },
//         { headers: { Authorization: `${BEARER} ${token}` } }
//       );
//       setMessage("Preferences saved successfully!");
//       if (response.data) {
//         updateUser(response.data);
//       }
//     } catch (error: unknown) {
//       console.error("Error saving preferences:", error);
//       setMessage("Failed to save preferences.");
//     }
//   };

//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-navy p-10 text-black dark:text-white">
//       <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md max-w-md w-full">
//         <h1 className="text-2xl font-bold mb-4 text-orange-500">My Preferences</h1>
//         <div className="mb-4">
//           <label className="block mb-2">Theme:</label>
//           <select
//             value={preferences.theme || "light"}
//             onChange={(e) =>
//               setPreferences({ ...preferences, theme: e.target.value })
//             }
//             className="border border-gray-300 dark:border-gray-700 rounded p-2 w-full text-black dark:text-white bg-gray-50 dark:bg-gray-700"
//           >
//             <option value="light">Light</option>
//             <option value="dark">Dark</option>
//             {/* Add more options as needed */}
//           </select>
//         </div>
//         <button
//           onClick={handleSave}
//           className="mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded font-bold transition-colors duration-200"
//         >
//           Save Preferences
//         </button>
//         {message && <p className="mt-2 text-green-500">{message}</p>}
//       </div>
//     </main>
//   );
// }

export default function PreferencesPage(): JSX.Element {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-navy p-10 text-black dark:text-white">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-orange-500">My Preferences</h1>
        <p>Preferences functionality is temporarily disabled.</p>
      </div>
    </main>
  );
}