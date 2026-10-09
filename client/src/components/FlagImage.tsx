interface FlagImageProps {
  code: string;
  className?: string;
}

export function FlagImage({ code, className }: FlagImageProps) {
  return (
    <img
      className={className}
      src={`https://flagcdn.com/w160/${code.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w320/${code.toLowerCase()}.png 2x`}
      alt=""
      loading="lazy"
    />
  );
}
