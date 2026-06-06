import { createContext } from "react";

//raw context lives separately so the provider module can stay fast refresh friendly
export const UIContext = createContext()