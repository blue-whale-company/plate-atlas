"use client";

import {
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  Gauge,
  Globe2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CROATIAN_AREAS,
  DEFAULT_PLATE,
  isCroatianAreaCode,
  isCroatianPlateValid,
  sanitizeDigits,
  sanitizeLetters,
  type CroatianPlateValue,
} from "@/lib/croatia";
import {
  createPlateDownload,
  renderCroatianPlate,
  TESLA_MAX_BYTES,
} from "@/lib/render-plate";

const UPCOMING_COUNTRIES = [
  { flag: "🇸🇮", name: "Slovenia" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇦🇹", name: "Austria" },
  { flag: "🇮🇹", name: "Italy" },
] as const;

interface ExportState {
  readonly status: "idle" | "working" | "success" | "error";
  readonly message?: string;
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function PlateStudio() {
  const [plate, setPlate] = useState<CroatianPlateValue>(DEFAULT_PLATE);
  const [exportState, setExportState] = useState<ExportState>({
    status: "idle",
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isValid = isCroatianPlateValid(plate);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const previewScale = Math.max(
      2,
      Math.min(3, window.devicePixelRatio || 1),
    );
    void renderCroatianPlate(canvasRef.current, plate, {
      scale: previewScale,
    });
  }, [plate]);

  function updateArea(event: ChangeEvent<HTMLSelectElement>) {
    const area = event.target.value;
    if (!isCroatianAreaCode(area)) {
      return;
    }

    setPlate((current) => ({
      ...current,
      area,
    }));
    setExportState({ status: "idle" });
  }

  function updateDigits(event: ChangeEvent<HTMLInputElement>) {
    const digits = sanitizeDigits(event.target.value);
    setPlate((current) => ({ ...current, digits }));
    setExportState({ status: "idle" });
  }

  function updateLetters(event: ChangeEvent<HTMLInputElement>) {
    const letters = sanitizeLetters(event.target.value);
    setPlate((current) => ({ ...current, letters }));
    setExportState({ status: "idle" });
  }

  async function downloadPlate() {
    if (!isValid || exportState.status === "working") {
      return;
    }

    setExportState({ status: "working" });

    try {
      const { blob, filename } = await createPlateDownload(plate);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1_000);

      const sizeLabel = formatBytes(blob.size);
      setExportState({
        status: "success",
        message:
          blob.size <= TESLA_MAX_BYTES
            ? `${filename} · ${sizeLabel} · Tesla-ready`
            : `${filename} · ${sizeLabel} · above the 50 KB target`,
      });
    } catch {
      setExportState({
        status: "error",
        message: "Something went wrong while creating the PNG.",
      });
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="PlateAtlas home">
          <span className="brand-mark" aria-hidden="true">
            PA
          </span>
          <span>PlateAtlas</span>
        </a>

        <div className="header-actions">
          <span className="status-pill">
            <span className="status-dot" aria-hidden="true" />
            Croatia preview
          </span>
          <a className="header-link" href="#how-it-works">
            How it works
          </a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={15} strokeWidth={2.2} />
            Made for Tesla Paint Shop
          </div>
          <h1>
            Your place.
            <br />
            <span>Your plate.</span>
          </h1>
          <p>
            Build the complete licence plate Tesla can&apos;t—correct region,
            crest, spacing, and text, all baked into one ready-to-use image.
          </p>
        </div>

        <div className="hero-stats" aria-label="Plate export specifications">
          <div>
            <span>01</span>
            <strong>Choose a region</strong>
          </div>
          <div>
            <span>02</span>
            <strong>Set your registration</strong>
          </div>
          <div>
            <span>03</span>
            <strong>Download the PNG</strong>
          </div>
        </div>
      </section>

      <section className="studio-shell" aria-labelledby="studio-title">
        <div className="studio-sidebar">
          <div className="sidebar-heading">
            <div>
              <span className="step-number">01</span>
              <h2 id="studio-title">Choose country</h2>
            </div>
            <Globe2 size={20} />
          </div>

          <button className="country-card country-card-active" type="button">
            <span className="country-flag" aria-hidden="true">
              🇭🇷
            </span>
            <span>
              <strong>Croatia</strong>
              <small>34 registration areas</small>
            </span>
            <Check className="country-check" size={17} />
          </button>

          <div className="coming-soon">
            <span>Next on the map</span>
            <div className="country-chips">
              {UPCOMING_COUNTRIES.map((country) => (
                <span key={country.name} title={country.name}>
                  {country.flag}
                </span>
              ))}
              <span className="more-chip">+12</span>
            </div>
          </div>

          <div className="privacy-note">
            <LockKeyhole size={17} />
            <div>
              <strong>Private by design</strong>
              <p>Your registration stays in this browser.</p>
            </div>
          </div>
        </div>

        <div className="studio-main">
          <div className="preview-heading">
            <div>
              <span className="step-number">02</span>
              <p>Live preview</p>
            </div>
            <span className="digital-badge">
              <span aria-hidden="true" />
              Digital display only
            </span>
          </div>

          <div className="plate-stage">
            <div className="stage-glow" aria-hidden="true" />
            <canvas
              ref={canvasRef}
              className="plate-canvas"
              aria-label={`Croatian licence plate ${plate.area} ${plate.digits}-${plate.letters}`}
            />
            <span className="stage-caption">
              Tesla export · 420 × 100 px
            </span>
          </div>

          <div className="builder">
            <div className="builder-heading">
              <div>
                <span className="step-number">03</span>
                <h2>Build your registration</h2>
              </div>
              <button className="help-button" type="button" aria-label="Format help">
                <CircleHelp size={18} />
              </button>
            </div>

            <div className="fields">
              <label className="field field-region">
                <span>Registration area</span>
                <span className="select-wrap">
                  <MapPin size={17} />
                  <select value={plate.area} onChange={updateArea}>
                    {CROATIAN_AREAS.map((area) => (
                      <option key={area.code} value={area.code}>
                        {area.name} — {area.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="select-chevron" size={17} />
                </span>
              </label>

              <label className="field">
                <span>Numbers</span>
                <input
                  inputMode="numeric"
                  maxLength={4}
                  onChange={updateDigits}
                  placeholder="1987"
                  value={plate.digits}
                />
                <small>3–4 digits</small>
              </label>

              <label className="field">
                <span>Letters</span>
                <input
                  autoCapitalize="characters"
                  maxLength={2}
                  onChange={updateLetters}
                  placeholder="JG"
                  value={plate.letters}
                />
                <small>1–2 letters</small>
              </label>
            </div>

            <div className="export-row">
              <div className="format-status">
                <ShieldCheck size={20} />
                <div>
                  <strong>
                    {isValid ? "Valid Croatian format" : "Complete the registration"}
                  </strong>
                  <span>
                    {plate.area} {plate.digits || "000"}-
                    {plate.letters || "A"}
                  </span>
                </div>
              </div>

              <button
                className="download-button"
                disabled={!isValid || exportState.status === "working"}
                onClick={downloadPlate}
                type="button"
              >
                <Download size={19} strokeWidth={2.2} />
                {exportState.status === "working"
                  ? "Creating PNG…"
                  : "Download Tesla PNG"}
              </button>
            </div>

            {exportState.message ? (
              <p
                className={`export-message export-message-${exportState.status}`}
                role="status"
              >
                {exportState.message}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="details-section" id="how-it-works">
        <div className="details-intro">
          <span className="section-kicker">From browser to dashboard</span>
          <h2>Made to fit the Tesla workflow.</h2>
          <p>
            PlateAtlas renders every detail into the background itself. That
            means Tesla&apos;s text limit no longer decides where the crest goes.
          </p>
        </div>

        <div className="details-grid">
          <article>
            <Gauge size={22} />
            <span>01</span>
            <h3>Pixel-perfect output</h3>
            <p>Exports at Tesla&apos;s European plate ratio with a compact PNG.</p>
          </article>
          <article>
            <MapPin size={22} />
            <span>02</span>
            <h3>Region-aware</h3>
            <p>Every Croatian registration area is ready to select.</p>
          </article>
          <article>
            <ShieldCheck size={22} />
            <span>03</span>
            <h3>Crest included</h3>
            <p>The national crest and registration are one finished image.</p>
          </article>
        </div>
      </section>

      <section className="install-section">
        <div>
          <span className="section-kicker section-kicker-light">
            Once downloaded
          </span>
          <h2>Three steps to your Tesla.</h2>
        </div>
        <ol>
          <li>
            <span>1</span>
            <p>
              Create a <strong>LicensePlate</strong> folder on your USB drive.
            </p>
          </li>
          <li>
            <span>2</span>
            <p>Copy the PlateAtlas PNG into that folder.</p>
          </li>
          <li>
            <span>3</span>
            <p>Open Paint Shop and select your custom plate image.</p>
          </li>
        </ol>
      </section>

      <footer>
        <a className="brand brand-footer" href="#top">
          <span className="brand-mark" aria-hidden="true">
            PA
          </span>
          <span>PlateAtlas</span>
        </a>
        <p>
          Independent project. Not affiliated with or endorsed by Tesla, Inc.
          For digital vehicle visualization only.
        </p>
        <span>Built in Croatia · Going everywhere</span>
      </footer>
    </main>
  );
}
