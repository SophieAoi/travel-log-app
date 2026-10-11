interface FlagImageProps {
  code: string;
  className?: string;
}

// Flags with an asymmetric canton/emblem in the top-left corner get cropped
// off-center by a plain center cover-crop, so shift the crop window left to
// keep that detail in frame. Flags not listed here just center normally.
const LEFT_WEIGHTED_FLAGS = new Set([
  "MY", "US", "AU", "NZ", "CL", "TW", "BN", "LR", "MM", "WS",
]);

export function FlagImage({ code, className }: FlagImageProps) {
  const position = LEFT_WEIGHTED_FLAGS.has(code.toUpperCase()) ? "25% center" : "center";
  return (
    <img
      className={className}
      style={{ objectPosition: position }}
      src={`https://flagcdn.com/w160/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w320/${code.toLowerCase()}.png 2x`}
      alt=""
      loading="lazy"
    />
  );
}
