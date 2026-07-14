import { User } from "../types";

// Fetch users from server and fallback to local storage
export async function getStoredUsers(): Promise<User[]> {
  try {
    const res = await fetch("/api/users");
    if (res.ok) {
      const users = await res.json();
      if (Array.isArray(users) && users.length > 0) {
        localStorage.setItem("engiexam_users", JSON.stringify(users));
        return users;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch users from server, falling back to local storage:", err);
  }
  
  const local = localStorage.getItem("engiexam_users");
  if (!local) {
    // Default fallback list
    const defaultList: User[] = [
      {
        username: "admin",
        password: "admin",
        role: "admin",
        createdAt: new Date().toISOString(),
        scores: {}
      }
    ];
    localStorage.setItem("engiexam_users", JSON.stringify(defaultList));
    return defaultList;
  }
  return JSON.parse(local);
}

// Save users to both server and local storage
export async function saveUsers(users: User[]): Promise<void> {
  localStorage.setItem("engiexam_users", JSON.stringify(users));
  try {
    await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(users),
    });
  } catch (err) {
    console.error("Failed to sync users with server:", err);
  }
}
