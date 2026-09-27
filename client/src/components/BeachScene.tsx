export function BeachScene() {
  return (
    <div className="beach-scene beach-scene-aerial" aria-hidden="true">
      <svg
        className="ocean-ripple ripple-1"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,40 C240,80 480,10 720,50 C960,90 1200,20 1440,60" />
      </svg>
      <svg
        className="ocean-ripple ripple-2"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,100 C220,60 460,140 720,100 C980,60 1220,140 1440,100" />
      </svg>
      <svg
        className="ocean-ripple ripple-3"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,150 C260,190 500,120 720,160 C960,200 1200,130 1440,170" />
      </svg>
      <svg
        className="beach-sand beach-sand-bottom"
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,80 C240,40 480,110 720,70 C960,30 1200,90 1440,60 L1440,140 L0,140 Z" />
      </svg>
    </div>
  );
}
