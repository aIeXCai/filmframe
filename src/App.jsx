import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowsOutCardinal,
  Check,
  CheckCircle,
  DownloadSimple,
  ImageSquare,
  LockKey,
  Minus,
  Plus,
  ShieldCheck,
  Sparkle,
  Trash,
  UploadSimple,
  X,
} from "@phosphor-icons/react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { EXPORT_PNG_OPTIONS, prepareExportNode } from "./export-image.js";

const TEMPLATE_DATA = {
  A: {
    name: "Classic Negative",
    description: "Full sprocket holes and mechanical edge markings",
    src: "/assets/style-a-clean.png",
    previewSrc: "/assets/style-a.png",
    window: { left: "5.1%", top: "17.8%", width: "90.6%", height: "69.1%" },
  },
  B: {
    name: "Archival Carrier",
    description: "A restrained, professional scan archive look",
    src: "/assets/style-b-clean.png",
    previewSrc: "/assets/style-b.png",
    window: { left: "15.7%", top: "19.4%", width: "67.8%", height: "58.5%" },
  },
  C: {
    name: "Lightbox Positive",
    description: "Warm, luminous travel storytelling",
    src: "/assets/style-c-clean.png",
    previewSrc: "/assets/style-c.png",
    window: { left: "13.7%", top: "15.6%", width: "72.7%", height: "65.1%" },
  },
  D: {
    name: "Mounted Slide",
    description: "Cool lightbox tones and professional slide mounting",
    src: "/assets/style-d-lightbox-v2.png",
    previewSrc: "/assets/style-d-preview-v2.png",
    window: { left: "21.15%", top: "23.15%", width: "62.9%", height: "50.8%" },
  },
};

const FILM_STOCKS = [
  { id: "kodak-ektachrome-100d", name: "KODAK EKTACHROME 100D", code: "5294" },
  { id: "kodak-portra-160", name: "KODAK PORTRA 160", code: "P160" },
  { id: "kodak-portra-400", name: "KODAK PORTRA 400", code: "P400" },
  { id: "kodak-portra-800", name: "KODAK PORTRA 800", code: "P800" },
  { id: "kodak-ektar-100", name: "KODAK EKTAR 100", code: "E100" },
  { id: "kodak-gold-200", name: "KODAK GOLD 200", code: "G200" },
  { id: "kodak-ultramax-400", name: "KODAK ULTRAMAX 400", code: "U400" },
  { id: "kodak-trix-400", name: "KODAK TRI-X 400", code: "TX400" },
  { id: "kodak-tmax-100", name: "KODAK T-MAX 100", code: "TMX100" },
  { id: "ilford-hp5", name: "ILFORD HP5 PLUS", code: "HP5" },
  { id: "ilford-fp4", name: "ILFORD FP4 PLUS", code: "FP4" },
  { id: "ilford-delta-100", name: "ILFORD DELTA 100", code: "D100" },
  { id: "ilford-delta-400", name: "ILFORD DELTA 400", code: "D400" },
  { id: "kentmere-400", name: "KENTMERE PAN 400", code: "K400" },
  { id: "fujifilm-200", name: "FUJIFILM 200", code: "F200" },
  { id: "fujifilm-provia", name: "FUJICHROME PROVIA 100F", code: "RDP III" },
  { id: "fujifilm-velvia", name: "FUJICHROME VELVIA 50", code: "RVP50" },
  { id: "fujifilm-acros", name: "FUJIFILM ACROS II", code: "ACROS II" },
  { id: "cinestill-400d", name: "CINESTILL 400D", code: "400D" },
  { id: "cinestill-800t", name: "CINESTILL 800T", code: "800T" },
];

const makeItem = (id, overrides = {}) => ({
  id,
  name: `frame-${id}.jpg`,
  src: "/assets/sample-original.jpg",
  style: "A",
  filmStockId: "",
  filmCode: "",
  rollNumber: "",
  location: "",
  date: "",
  zoom: 100,
  x: 0,
  y: 0,
  rotation: 0,
  ...overrides,
});

const initialItems = [];

function twoDigits(index) {
  return String(index + 1).padStart(2, "0");
}

function metadataForItem(item) {
  const filmStock = FILM_STOCKS.find((film) => film.id === item?.filmStockId);
  return {
    filmStock: filmStock?.name || "",
    filmCode: item?.filmCode || "",
    rollNumber: item?.rollNumber || "",
    location: item?.location || "",
    date: item?.date || "",
  };
}

function FilmSurface({ item, frameNumber, metadata, interactive = false, onDragStart, surfaceRef }) {
  const template = TEMPLATE_DATA[item.style];
  const windowStyle = template.window;
  const displayFrame = `${frameNumber}A`;
  return (
    <div className={`film-surface style-${item.style.toLowerCase()}`} ref={surfaceRef}>
      <img className="template-image" src={template.src} alt={`${template.name} template`} draggable="false" />
      {item.style === "D" && <div className="slide-mount" aria-hidden="true" />}
      <div
        className={`photo-window ${interactive ? "is-interactive" : ""}`}
        style={windowStyle}
        onPointerDown={interactive ? onDragStart : undefined}
      >
        <img
          src={item.src}
          alt={item.name}
          draggable="false"
          style={{
            transform: `translate(${item.x}%, ${item.y}%) scale(${item.zoom / 100}) rotate(${item.rotation}deg)`,
          }}
        />
        {interactive && (
          <div className="drag-hint"><ArrowsOutCardinal size={15} weight="bold" /> Drag to reposition</div>
        )}
      </div>
      <div className="film-metadata" aria-label="Film edge metadata">
        <span className="edge-stock">{metadata.filmStock}</span>
        <span className="edge-code">{metadata.filmCode}</span>
        <span className="edge-code-secondary">{metadata.filmCode}</span>
        <span className="edge-roll">{metadata.rollNumber}</span>
        <span className="edge-frame">{displayFrame}</span>
        <span className="edge-location">{metadata.location}</span>
        <span className="edge-date">{metadata.date}</span>
      </div>
    </div>
  );
}

function Home({ onStart }) {
  return (
    <div className="home-page">
      <header className="home-nav">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>FILMFRAME <span>135</span></button>
        <nav aria-label="Main navigation">
          <a href="#styles">Film Styles</a>
          <a href="#workflow">Workflow</a>
          <a href="#privacy">Privacy</a>
        </nav>
        <button className="nav-cta" onClick={onStart}>Open Editor <ArrowRight weight="bold" /></button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span /> PRESERVE THE PHYSICALITY OF FILM</div>
            <h1>No need to redraw.<em>Just the right frame.</em></h1>
            <p>Upload a photograph, place it in an authentic 135 film structure, then refine the crop and edge metadata. No AI, no filters—everything stays in your browser.</p>
            <div className="hero-actions">
              <button className="primary-action" onClick={onStart}>Start Creating <ArrowRight weight="bold" /></button>
              <a className="text-action" href="#styles">Explore Four Styles</a>
            </div>
            <div className="trust-row">
              <span><ShieldCheck weight="fill" /> Local Processing</span>
              <span><ImageSquare weight="fill" /> Original Preserved</span>
              <span><LockKey weight="fill" /> No Sign-in</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Classic negative effect preview">
            <div className="hero-index">FRAME / 01</div>
            <img src="/assets/style-a.png" alt="Photograph presented in a classic 135 negative frame" />
            <div className="hero-caption"><span>ZHAGANA · 2026.07</span><span>FILMFRAME 135 / LOCAL EDITION</span></div>
          </div>
        </section>

        <section className="statement">
          <p>NOT A FILTER.</p>
          <h2>We do not imitate film color.<br />We restore film as a physical object.</h2>
        </section>

        <section className="styles-section" id="styles">
          <div className="section-heading">
            <span>01 / FOUR FORMS</span>
            <div><h2>Four Film Structures</h2><p>Give every photograph its own distinct form.</p></div>
          </div>
          <div className="style-showcase">
            {Object.entries(TEMPLATE_DATA).map(([key, template]) => (
              <article className="style-card" key={key}>
                <div className="style-image-wrap"><img src={template.previewSrc} alt={`${key} ${template.name}`} /></div>
                <div className="style-meta"><strong>{key}</strong><div><h3>{template.name}</h3><p>{template.description}</p></div></div>
              </article>
            ))}
          </div>
        </section>

        <section className="workflow-section" id="workflow">
          <div className="section-heading">
            <span>02 / WORKFLOW</span>
            <div><h2>From Original to Final in Three Steps</h2><p>A consistent structure and focused controls keep every frame cohesive.</p></div>
          </div>
          <div className="steps">
            <article><b>01</b><UploadSimple /><h3>Upload Photos</h3><p>Add up to 12 JPEG, PNG, or WebP files at once.</p></article>
            <article><b>02</b><Sparkle /><h3>Choose Each Style</h3><p>Switch A, B, C, or D independently while preserving each crop.</p></article>
            <article><b>03</b><DownloadSimple /><h3>Review and Export</h3><p>Frame numbers update automatically, with batch exports packed as a ZIP.</p></article>
          </div>
        </section>

        <section className="privacy-section" id="privacy">
          <div className="privacy-mark"><LockKey weight="duotone" /></div>
          <div><span>LOCAL BY DEFAULT</span><h2>Your photos never leave your device.</h2></div>
          <p>Decoding, cropping, compositing, and exporting all happen in your browser. We never analyze your photos or use them to train a model.</p>
          <button onClick={onStart}>Enter the Local Editor <ArrowRight /></button>
        </section>
      </main>

      <footer><div className="brand">FILMFRAME <span>135</span></div><p>Built for photographs, not algorithms.</p><span>© 2026</span></footer>
    </div>
  );
}

function Editor({ onHome }) {
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef(null);
  const exportRefs = useRef(new Map());
  const dragState = useRef(null);

  const selectedIndex = Math.max(0, items.findIndex((item) => item.id === selectedId));
  const selected = items[selectedIndex];
  const metadata = metadataForItem(selected);

  const changeFilmStock = (event) => {
    const next = FILM_STOCKS.find((film) => film.id === event.target.value);
    if (!next) return;
    updateSelected({ filmStockId: next.id, filmCode: next.code });
  };

  useEffect(() => {
    const onPaste = (event) => {
      const files = [...event.clipboardData.files].filter((file) => file.type.startsWith("image/"));
      if (files.length) addFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  };

  const updateSelected = (updates) => {
    setItems((current) => current.map((item) => item.id === selectedId ? { ...item, ...updates } : item));
  };

  const addFiles = (fileList) => {
    const accepted = [...fileList].filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    const slots = 12 - items.length;
    if (slots <= 0) return flash("A project can contain up to 12 photos");
    const additions = accepted.slice(0, slots).map((file) => ({
      ...makeItem(`${Date.now()}-${file.name}-${Math.random()}`),
      name: file.name,
      src: URL.createObjectURL(file),
    }));
    if (!additions.length) return flash("Choose JPEG, PNG, or WebP images");
    setItems((current) => [...current, ...additions]);
    setSelectedId(additions[0].id);
    if (accepted.length > slots) flash(`Added ${slots} photos—the project limit is 12`);
  };

  const removeSelected = () => {
    if (!selected) return;
    const next = items.filter((item) => item.id !== selected.id);
    setItems(next);
    setSelectedId(next[Math.min(selectedIndex, next.length - 1)]?.id || "");
  };

  const moveSelected = (direction) => {
    const target = selectedIndex + direction;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[selectedIndex], next[target]] = [next[target], next[selectedIndex]];
      return next;
    });
  };

  const onDragStart = (event) => {
    if (!selected) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = { pointerX: event.clientX, pointerY: event.clientY, x: selected.x, y: selected.y };
  };

  const onPointerMove = (event) => {
    if (!dragState.current || !selected) return;
    const dx = (event.clientX - dragState.current.pointerX) / 4;
    const dy = (event.clientY - dragState.current.pointerY) / 4;
    updateSelected({ x: Math.max(-40, Math.min(40, dragState.current.x + dx)), y: Math.max(-40, Math.min(40, dragState.current.y + dy)) });
  };

  const onPointerUp = () => { dragState.current = null; };

  const exportProject = async () => {
    if (!items.length || exporting) return;
    setExporting(true);
    try {
      await document.fonts?.ready;
      if (items.length === 1) {
        const node = await prepareExportNode(exportRefs.current.get(items[0].id));
        const dataUrl = await toPng(node, EXPORT_PNG_OPTIONS);
        const link = document.createElement("a");
        link.download = `${projectName || "FILMFRAME"}_${twoDigits(0)}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const zip = new JSZip();
        for (let index = 0; index < items.length; index += 1) {
          const item = items[index];
          const node = await prepareExportNode(exportRefs.current.get(item.id));
          const dataUrl = await toPng(node, EXPORT_PNG_OPTIONS);
          zip.file(`${projectName || "FILMFRAME"}_${item.style}_${twoDigits(index)}.png`, dataUrl.split(",")[1], { base64: true });
        }
        const blob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.download = `${projectName || "FILMFRAME"}_ALL.zip`;
        link.href = URL.createObjectURL(blob);
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }
      flash(items.length > 1 ? `Exported ${items.length} finished frames` : "Finished frame exported");
    } catch (error) {
      console.error("FilmFrame export failed", error);
      flash(error instanceof Error ? error.message : "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="editor-page" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <header className="editor-topbar">
        <button className="editor-brand" onClick={onHome}>FILMFRAME <b>135</b></button>
        <label className="project-name"><span>Project</span><input value={projectName} onChange={(event) => setProjectName(event.target.value)} maxLength={24} placeholder="Enter a project name" /></label>
        <div className="topbar-spacer" />
        <div className="local-badge"><span /> LOCAL · PRIVATE</div>
        <button className="export-button" onClick={exportProject} disabled={!items.length || exporting}>
          {exporting ? <span className="spinner" /> : <DownloadSimple weight="bold" />}
          {exporting ? "Rendering" : items.length > 1 ? "Export All" : "Export Frame"}
        </button>
        <button className="close-editor" onClick={onHome} aria-label="Return to home"><X /></button>
      </header>

      <main className="editor-layout">
        <aside className="template-panel panel">
          <div className="panel-title"><span>Film Templates</span><small>Current Photo</small></div>
          <div className="template-list">
            {Object.entries(TEMPLATE_DATA).map(([key, template]) => (
              <button key={key} className={`template-option ${selected?.style === key ? "selected" : ""}`} onClick={() => selected && updateSelected({ style: key })} disabled={!selected}>
                <div><img src={template.previewSrc} alt="" />{selected?.style === key && <span className="selected-check"><Check weight="bold" /></span>}</div>
                <strong><b>{key}</b> {template.name}</strong>
                <small>{template.description}</small>
              </button>
            ))}
          </div>
          <div className="per-photo-note"><CheckCircle weight="fill" /><p><strong>Independent per photo</strong><br />Changing a template affects only the current photo.</p></div>
        </aside>

        <section className="canvas-column">
          <div className="canvas-toolbar">
            <div><span>Photo {items.length ? twoDigits(selectedIndex) : "--"}</span><small>{selected?.name || "No photo added"}</small></div>
            {selected && <div className="style-tag">STYLE {selected.style} · {TEMPLATE_DATA[selected.style].name}</div>}
          </div>

          <div className="canvas-stage">
            {selected ? (
              <FilmSurface item={selected} frameNumber={twoDigits(selectedIndex)} metadata={metadata} interactive onDragStart={onDragStart} />
            ) : (
              <button className="empty-canvas" onClick={() => fileInputRef.current?.click()}><UploadSimple /><strong>Upload a photo to begin</strong><span>JPEG, PNG, or WebP · Up to 12 photos</span><small>Photos are processed only in this browser</small></button>
            )}
          </div>

          <div className="canvas-controls">
            <button onClick={() => selected && updateSelected({ rotation: (selected.rotation - 90) % 360 })} disabled={!selected}>Rotate Left 90°</button>
            <button onClick={() => selected && updateSelected({ rotation: (selected.rotation + 90) % 360 })} disabled={!selected}>Rotate Right 90°</button>
            <button onClick={() => selected && updateSelected({ zoom: 100, x: 0, y: 0, rotation: 0 })} disabled={!selected}>Reset Image</button>
            <span />
            <Minus />
            <input aria-label="Zoom" type="range" min="100" max="200" value={selected?.zoom || 100} onChange={(event) => updateSelected({ zoom: Number(event.target.value) })} disabled={!selected} />
            <Plus />
            <output>{selected?.zoom || 100}%</output>
          </div>
        </section>

        <aside className="settings-panel panel">
          <div className="settings-section">
            <div className="panel-title"><span>Edge Metadata</span><small>Current Photo</small></div>
            <label className="film-stock-field"><span>Film Stock</span><select className={!selected?.filmStockId ? "is-placeholder" : ""} value={selected?.filmStockId || ""} onChange={changeFilmStock} disabled={!selected}>
              <option value="" disabled>Select a film stock</option>
              {FILM_STOCKS.map((film) => <option key={film.id} value={film.id}>{film.name}</option>)}
            </select></label>
            <label><span>Edge Code</span><input value={selected?.filmCode || ""} onChange={(event) => updateSelected({ filmCode: event.target.value.toUpperCase() })} maxLength={10} placeholder="Enter text" disabled={!selected} /></label>
            <label><span>Roll No.</span><input value={selected?.rollNumber || ""} onChange={(event) => updateSelected({ rollNumber: event.target.value.toUpperCase() })} maxLength={12} placeholder="Enter text" disabled={!selected} /></label>
            <label><span>Location</span><input value={selected?.location || ""} onChange={(event) => updateSelected({ location: event.target.value.toUpperCase() })} maxLength={18} placeholder="Enter text" disabled={!selected} /></label>
            <label><span>Date</span><input value={selected?.date || ""} onChange={(event) => updateSelected({ date: event.target.value })} maxLength={10} placeholder="Enter text" disabled={!selected} /></label>
            <label className="locked-field"><span>Frame No.</span><div><LockKey weight="fill" /><output>{items.length ? twoDigits(selectedIndex) : "--"}</output></div></label>
            <div className="auto-number-note"><span>AUTO</span><p>Frame numbers follow the photo order and stay continuous after reordering or deletion.</p></div>
          </div>

          <div className="settings-section crop-summary">
            <div className="panel-title"><span>Current Crop</span><small>Original color preserved</small></div>
            <dl><div><dt>Zoom</dt><dd>{selected?.zoom || 100}%</dd></div><div><dt>X Position</dt><dd>{Math.round(selected?.x || 0)}</dd></div><div><dt>Y Position</dt><dd>{Math.round(selected?.y || 0)}</dd></div><div><dt>Rotation</dt><dd>{selected?.rotation || 0}°</dd></div></dl>
          </div>

          <div className="settings-actions">
            <button onClick={() => moveSelected(-1)} disabled={!selected || selectedIndex === 0}><ArrowLeft /> Move Earlier</button>
            <button onClick={() => moveSelected(1)} disabled={!selected || selectedIndex === items.length - 1}>Move Later <ArrowRight /></button>
            <button className="delete-button" onClick={removeSelected} disabled={!selected}><Trash /> Delete Current Photo</button>
          </div>
        </aside>

        <section className="thumbnail-rail">
          <div className="rail-heading"><div><strong>{items.length} {items.length === 1 ? "Photo" : "Photos"}</strong><span>Frame numbers follow the current order</span></div><button onClick={() => fileInputRef.current?.click()} disabled={items.length >= 12}><Plus /> Add Photos</button></div>
          <div className="thumbnails">
            {items.map((item, index) => (
              <button key={item.id} className={`thumbnail ${item.id === selectedId ? "selected" : ""}`} onClick={() => setSelectedId(item.id)}>
                <img src={item.src} alt={item.name} /><span className="thumb-number">{twoDigits(index)}</span><span className="thumb-style">{item.style}</span>
              </button>
            ))}
            {items.length < 12 && <button className="add-thumbnail" onClick={() => fileInputRef.current?.click()}><Plus /><span>Add Photos</span></button>}
          </div>
        </section>
      </main>

      <input ref={fileInputRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} />
      {notice && <div className="toast"><CheckCircle weight="fill" />{notice}</div>}

      <div className="export-render-area" aria-hidden="true">
        {items.map((item, index) => (
          <FilmSurface key={item.id} item={item} frameNumber={twoDigits(index)} metadata={metadataForItem(item)} surfaceRef={(node) => node ? exportRefs.current.set(item.id, node) : exportRefs.current.delete(item.id)} />
        ))}
      </div>
    </div>
  );
}

export function App() {
  const [screen, setScreen] = useState(() => window.location.hash === "#editor" ? "editor" : "home");
  const goEditor = () => { window.location.hash = "editor"; setScreen("editor"); window.scrollTo(0, 0); };
  const goHome = () => { window.location.hash = ""; setScreen("home"); window.scrollTo(0, 0); };
  return screen === "home" ? <Home onStart={goEditor} /> : <Editor onHome={goHome} />;
}
