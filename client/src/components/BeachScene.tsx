export function BeachScene() {
  return (
    <div className="beach-scene" aria-hidden="true">
      <div className="beach-sun" />
      <svg
        className="beach-wave beach-wave-back"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,120 C240,180 480,60 720,110 C960,160 1200,80 1440,130 L1440,220 L0,220 Z" />
      </svg>
      <svg
        className="beach-wave beach-wave-front"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,140 C220,90 460,170 720,130 C980,90 1220,170 1440,120 L1440,220 L0,220 Z" />
      </svg>
      <svg
        className="beach-sand"
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,60 C240,20 480,90 720,50 C960,10 1200,70 1440,40 L1440,140 L0,140 Z" />
      </svg>
    </div>
  );
}
