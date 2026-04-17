"use client";

export default function GalleryLoading() {
  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center gap-4">
      <div className="accent-square w-12 h-12 animate-pulse" />
      <p className="section-label animate-pulse">Initializing Systems</p>
    </div>
  );
}
