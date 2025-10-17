// src/App.tsx
import { ref, set, push } from "firebase/database";
import { db } from "./firebase";

function App() {
  const handleWrite = async () => {
    try {
      // Option 1: Write to a fixed location
      await set(ref(db, "users/testUser"), {
        username: "Ethan",
        age: 23,
      });

      // Option 2: Add a new item under a collection (push creates a unique key)
      const newRef = push(ref(db, "messages"));
      await set(newRef, {
        text: "Hello Firebase!",
        timestamp: Date.now(),
      });

      console.log("Data written successfully!");
    } catch (error) {
      console.error("Error writing data:", error);
    }
  };

  return (
    <div className="p-4">
      <button onClick={handleWrite}>Write to Database</button>
    </div>
  );
}

export default App;
