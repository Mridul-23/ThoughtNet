import React from 'react';

const Info = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white pt-8 pb-20 px-4 md:px-8 max-w-5xl mx-auto font-sans">
            <header className="mb-12 text-center">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4 py-2">
                    About ThoughtNet
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    A next-generation research engine that visualizes the hidden connections between ideas.
                </p>
            </header>

            <div className="grid gap-12">
                
                {/* Usage Guide */}
                <section className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 text-blue-300">
                        <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-lg">🚀</span>
                        Usage Guide
                    </h2>
                    <div className="space-y-6 text-gray-300">
                        <div className="flex gap-4">
                            <div className="font-bold text-white bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center shrink-0">1</div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Enter a Query</h3>
                                <p>Type any complex topic (e.g., "Impact of AI on Healthcare") into the search bar.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="font-bold text-white bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center shrink-0">2</div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Explore the Graph</h3>
                                <p>The engine builds a knowledge graph. <strong className="text-purple-400">Root</strong> is your topic. <strong className="text-purple-400">Sub-topics</strong> are key areas.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="font-bold text-white bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center shrink-0">3</div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Expand Clouds</h3>
                                <p>Click on <span className="text-orange-400">Thought Clouds</span> ☁️ to reveal evidence nodes.</p>
                            </div>
                        </div>
                         <div className="flex gap-4">
                            <div className="font-bold text-white bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center shrink-0">4</div>
                            <div>
                                <h3 className="font-semibold text-white mb-1">Read Evidence</h3>
                                <p>Click on teal <span className="text-cyan-400">Evidence Nodes</span> to open the detail modal and read sources.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Limitations */}
                <section className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 text-yellow-300">
                        <span className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-lg">⚠️</span>
                        Current Limitations / Beta
                    </h2>
                    <ul className="space-y-3 text-gray-400 list-disc pl-6">
                        <li>
                            <strong>Performance:</strong> Complex queries may take 10-20 seconds to fully fetch and cluster.
                        </li>
                        <li>
                            <strong>Desktop Only:</strong> The force-directed graph is optimized for mouse interaction. Mobile touch support is experimental.
                        </li>
                        <li>
                            <strong>Source Limits:</strong> Currently fetches from DuckDuckGo, Reddit, NewsAPI, and Hacker News. More coming soon.
                        </li>
                    </ul>
                </section>

                {/* Easter Egg / Glitch */}
                <section className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-2xl p-8 relative overflow-hidden group hover:border-purple-400/50 transition-colors">
                   <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-xs">
                       D3_FORCE_SIM_ERROR_404
                   </div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-6 text-pink-400 font-mono">
                        <span className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-lg animate-pulse">👾</span>
                        The "Zoom Glitch"
                    </h2>
                    <div className="text-gray-300 space-y-4">
                        <p>
                            You may have noticed a warning about pressing <kbd className="bg-gray-800 px-2 py-1 rounded text-white border border-gray-600">Ctrl</kbd> + <kbd className="bg-gray-800 px-2 py-1 rounded text-white border border-gray-600">+/-</kbd>.
                        </p>
                        <p>
                            This is a known interaction between the browser's DOM zoom and the HTML5 Canvas coordinate system.
                            When you browser-zoom, the canvas scales visually, but the mouse hit-detection coordinates drift, causing the physics engine to "miss" your grabs.
                        </p>
                        <div className="bg-black/50 p-4 rounded-lg border-l-4 border-purple-500">
                            <strong>Use the scroll wheel</strong> to zoom into the graph properly. This uses the internal camera zoom, keeping physics intact.
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Info;
