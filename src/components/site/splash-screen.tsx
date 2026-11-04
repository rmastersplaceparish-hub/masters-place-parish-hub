import logo from "@/assets/logo.png";

export function SplashScreen() {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="splash-stage animate-splash-out pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      <span className="splash-curtain splash-curtain-left" />
      <span className="splash-curtain splash-curtain-right" />
      <span className="splash-horizon" />

      <div className="splash-content">
        <div className="splash-emblem">
          <span className="splash-aura" />

          <div className="splash-orbit splash-orbit-outer">
            <span className="splash-orbit-runner" />
          </div>

          <div className="splash-orbit splash-orbit-middle">
            <span className="splash-orbit-runner splash-orbit-runner-secondary" />
          </div>

          <div className="splash-orbit splash-orbit-inner">
            <span className="splash-orbit-runner splash-orbit-runner-inner" />
          </div>

          <div className="splash-logo-frame">
            <span className="splash-logo-halo" />
            <img src={logo} alt="" className="splash-logo" />
          </div>
        </div>

        <div className="splash-copy text-center">
          <span className="splash-prelude">RCCG</span>
          <p className="splash-title">The Master&apos;s Place</p>
          <span className="splash-divider">
            <i />
          </span>
          <p className="splash-tagline">
            <span>Worship</span>
            <b aria-hidden="true" />
            <span>Word</span>
            <b aria-hidden="true" />
            <span>Transformation</span>
          </p>
        </div>
      </div>

      <span className="splash-finale" />
    </div>
  );
}
