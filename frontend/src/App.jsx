import { useContext } from "react";
import OfflineIndicator from "./components/OfflineIndicator";
import { AuthProvider } from "./context/AuthContext"
import { UIProvider } from "./context/UIContext"
import { UIContext } from "./context/UIContextValue"
import Router from "./router";

function AppContent() {
    const { darkMode } = useContext(UIContext)

    return (
        <div className={darkMode ? "dark" : ""}>
            {/* Global utilities live above the route tree so they stay available everywhere. */}
            <OfflineIndicator />
            <Router />
        </div>
    )
}

function App() {
    return (
        //Auth wraps UI so every page can read both session and layout/theme state from one app shell
        <AuthProvider>
            <UIProvider>
                <AppContent />
            </UIProvider>
        </AuthProvider>
    )
}

export default App
