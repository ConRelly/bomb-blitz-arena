
// THIS FILE IS AUTOGENERATED WHEN PAGES ARE UPDATED
import { lazy } from "react";
import { RouteObject } from "react-router";


import { UserGuard } from "app";


const App = lazy(() => import("./pages/App.tsx"));
const Game = lazy(() => import("./pages/Game.tsx"));
const HowToPlay = lazy(() => import("./pages/HowToPlay.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Logout = lazy(() => import("./pages/Logout.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));

export const userRoutes: RouteObject[] = [

	{ path: "/", element: <App />},
	{ path: "/game", element: <UserGuard><Game /></UserGuard>},
	{ path: "/how-to-play", element: <UserGuard><HowToPlay /></UserGuard>},
	{ path: "/howtoplay", element: <UserGuard><HowToPlay /></UserGuard>},
	{ path: "/login", element: <Login />},
	{ path: "/logout", element: <UserGuard><Logout /></UserGuard>},
	{ path: "/profile", element: <UserGuard><Profile /></UserGuard>},
	{ path: "/settings", element: <UserGuard><Settings /></UserGuard>},

];
