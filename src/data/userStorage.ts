import { User } from "../types";

// Helper to merge two lists of users, keeping the latest scores and accounts
export function mergeUsers(localUsers: User[], serverUsers: User[]): User[] {
  const mergedMap = new Map<string, User>();

  // Add all server users first
  serverUsers.forEach(u => {
    mergedMap.set(u.username.toLowerCase(), u);
  });

  // Merge local users
  localUsers.forEach(localUser => {
    const key = localUser.username.toLowerCase();
    const serverUser = mergedMap.get(key);

    if (!serverUser) {
      // User only exists locally, add it
      mergedMap.set(key, localUser);
    } else {
      // User exists in both, merge their scores
      const mergedScores = { ...serverUser.scores };

      Object.entries(localUser.scores).forEach(([moduleId, localScore]) => {
        const serverScore = serverUser.scores[moduleId];
        // If server doesn't have it, or local has a higher score, or local is newer, keep local
        if (!serverScore || localScore.score > serverScore.score || (localScore.updatedAt > serverScore.updatedAt)) {
          mergedScores[moduleId] = localScore;
        }
      });

      const mergedAnswers = {
        ...(serverUser.answers || {}),
        ...(localUser.answers || {})
      };

      mergedMap.set(key, {
        ...serverUser,
        scores: mergedScores,
        answers: mergedAnswers,
        // Keep password of local user if server user has default admin or matches
        password: localUser.password || serverUser.password,
        role: (serverUser.role === "admin" || localUser.role === "admin") ? "admin" : "user",
        createdAt: localUser.createdAt < serverUser.createdAt ? localUser.createdAt : serverUser.createdAt
      });
    }
  });

  return Array.from(mergedMap.values());
}

// Fetch users from server and fallback to local storage, merging them to prevent data loss
export async function getStoredUsers(): Promise<User[]> {
  let localList: User[] = [];
  const local = localStorage.getItem("engiexam_users");
  if (local) {
    try {
      localList = JSON.parse(local);
    } catch (e) {
      console.error("Failed to parse local users:", e);
    }
  }

  let serverList: User[] = [];
  try {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        serverList = data;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch users from server, using local list:", err);
  }

  if (serverList.length === 0) {
    return localList.length > 0 ? localList : getDefaultAdminList();
  }

  // Merge the two lists so local registrations and scores are restored to the server
  const mergedList = mergeUsers(localList, serverList);

  // Update local storage
  localStorage.setItem("engiexam_users", JSON.stringify(mergedList));

  // If the server list was missing local users, push them back to the server in the background
  const listsAreEqual = JSON.stringify(mergedList) === JSON.stringify(serverList);
  if (!listsAreEqual) {
    saveUsers(mergedList).catch(err => console.error("Background sync failed:", err));
  }

  return mergedList;
}

function getDefaultAdminList(): User[] {
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
