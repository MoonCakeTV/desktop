import { useState } from "react";
import { DoubanTags } from "./components/douban/tags";

// import { Greet } from "../wailsjs/go/main/App";

export default function App() {
  return (
    <div className="flex items-center h-screen">
      <div className="h-screen w-50 bg-gray-100">Sidebar</div>
      <div className="flex-1 bg-gray-200 h-screen overflow-y-auto">
        <DoubanTags />
      </div>
    </div>
  );
}
