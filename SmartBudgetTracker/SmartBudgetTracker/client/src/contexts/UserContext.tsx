import { createContext, useContext, ReactNode, useState } from "react";

// Simple user context for the MVP
// In a real app, this would handle authentication

interface User {
  id: number;
  username: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  // For the MVP, we're just hardcoding a user
  const [user] = useState<User>({
    id: 1,
    username: "demo",
  });
  
  const [isLoading] = useState(false);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
