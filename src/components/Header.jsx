import React from "react";


export const Header = () => {
    return (
        <header className="flex items-center justify-between p-4 bg-blue-600 text-white">
            <h1>Block Debugger</h1>
            <nav className="flex flex-row">
                <a href="/home" className="mx-2 hover:underline">Home</a>
                <a href="/debug" className="mx-2 hover:underline">Debug</a>
                <a href="/learn" className="mx-2 hover:underline">Learn</a>
            </nav>
        </header>
    );
}