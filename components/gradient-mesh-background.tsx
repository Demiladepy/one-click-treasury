// Soft radial blobs — CSS transform-only animation for 60fps (no filter: blur)
export function GradientMeshBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="mesh-blob mesh-blob-purple" />
      <div className="mesh-blob mesh-blob-mint" />
    </div>
  );
}
