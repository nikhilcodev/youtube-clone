import { createContext } from "react";

// Keeping the raw context in its own file avoids the Fast Refresh warning in the provider module.
export const AuthContext = createContext()