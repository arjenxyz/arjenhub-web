export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className="brand-mark"
      height={size}
      src="/arjenhub-icon.png"
      width={size}
    />
  );
}
