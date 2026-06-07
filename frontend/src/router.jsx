import { Route, Routes } from "react-router-dom"
import ChannelPage from "./pages/ChannelPage"
import CreateChannel from "./pages/CreateChannel"
import Home from "./pages/Home"
import Login from "./pages/Login"
import MyChannels from "./pages/MyChannels"
import Register from "./pages/Register"
import UserDetails from "./pages/UserDetails"
import VideoPlayer from "./pages/VideoPlayer"

function Router() {
    return (
        <Routes>
            {/* public routes for browsing, auth and profile flows. */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<UserDetails />} />
            <Route path="/channel/create" element={<CreateChannel />} />
			<Route path="/my-channels" element={<MyChannels />} />
			<Route path="/video/:id" element={<VideoPlayer />} />
			<Route path="/channel/:id" element={<ChannelPage />} />
        </Routes>
    )
}

export default Router