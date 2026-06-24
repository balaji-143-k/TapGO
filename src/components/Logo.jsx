import React from 'react';

export default function Logo({ className = "h-10", showText = true }) {
  // Renders the real brand logo uploaded by the user
  return (
    <div className="flex items-center gap-2 select-none cursor-pointer">
      <div className={`relative flex items-center justify-center overflow-hidden rounded-xl ${className}`}>
        <img 
          src="/logo.jpg" 
          alt="TapGo Logo" 
          className="h-full w-auto object-contain scale-110"
          onError={(e) => {
            // Fallback to text initials if image fails to load
            e.target.style.display = 'none';
          }}
        />
      </div>
      
      {showText && (
        <span className="font-extrabold text-2xl tracking-tight font-outfit">
          <span className="text-emerald-600">Tap</span>
          <span className="text-slate-900">Go</span>
        </span>
      )}
    </div>
  );
}
