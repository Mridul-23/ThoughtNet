import React from "react";

const Modal = ({ isOpen, onClose, title, content, link, source, type }) => {
  if (!isOpen) return null;

  // Determine badge color based on source/type
  const sourceColor = 
    source === 'Reddit' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
    source === 'NewsAPI' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
    source === 'HackerNews' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
    'bg-purple-500/20 text-purple-300 border-purple-500/30'; // Web/Default

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div 
        className="relative z-10 w-full max-w-2xl mx-4 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glassmorphism Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gray-900/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-xl p-1">
            
            {/* Header / Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70" />

            <div className="px-8 py-8">
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Meta Badges */}
                <div className="flex gap-2 mb-4">
                    {source && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${sourceColor} uppercase tracking-wider`}>
                            {source}
                        </span>
                    )}
                    {type && (
                         <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300 border border-gray-600/50 uppercase tracking-wider">
                            {type.replace('_', ' ')}
                         </span>
                    )}
                </div>

                <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans tracking-tight">
                    {title}
                </h2>

                <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                     {/* If content is just text, render paragraph. If it looks structured (unlikely from this pipeline), render as is. */}
                     {content ? (
                         <div className="prose prose-invert prose-lg text-gray-300 leading-relaxed opacity-90">
                             {content.split('\n\n').map((para, i) => (
                                 <p key={i} className="mb-4 text-justify">{para}</p>
                             ))}
                         </div>
                     ) : (
                         <div className="flex flex-col items-center justify-center py-12 text-gray-500 opacity-60">
                             <span className="text-5xl mb-4">🕸️</span>
                             <p>No text content available.</p>
                         </div>
                     )}
                </div>

                {link && (
                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-400/50 text-blue-300 hover:text-blue-100 transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20"
                        >
                          <span>Read Source</span>
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
