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

const TEMPLATE_DATA = {
  A: {
    name: "经典底片",
    description: "完整齿孔与机械片边字",
    src: "/assets/style-a-clean.png",
    previewSrc: "/assets/style-a.png",
    window: { left: "5.1%", top: "17.8%", width: "90.6%", height: "69.1%" },
  },
  B: {
    name: "扫描片夹",
    description: "克制、专业的扫描档案感",
    src: "/assets/style-b-clean.png",
    previewSrc: "/assets/style-b.png",
    window: { left: "15.7%", top: "19.4%", width: "67.8%", height: "58.5%" },
  },
  C: {
    name: "灯箱正片",
    description: "温暖通透的旅行叙事",
    src: "/assets/style-c-clean.png",
    previewSrc: "/assets/style-c.png",
    window: { left: "13.7%", top: "15.6%", width: "72.7%", height: "65.1%" },
  },
  D: {
    name: "幻灯片灯箱",
    description: "冷调灯箱与专业正片装帧",
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
      <img className="template-image" src={template.src} alt={`${template.name}模板`} draggable="false" />
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
          <div className="drag-hint"><ArrowsOutCardinal size={15} weight="bold" /> 拖动画面</div>
        )}
      </div>
      <div className="film-metadata" aria-label="胶片片边信息">
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
        <nav aria-label="主页导航">
          <a href="#styles">胶片风格</a>
          <a href="#workflow">使用方式</a>
          <a href="#privacy">隐私</a>
        </nav>
        <button className="nav-cta" onClick={onStart}>打开工作台 <ArrowRight weight="bold" /></button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span /> 为数码照片保留胶片的载体感</div>
            <h1>照片不需要被重绘。<em>它只需要一个好画框。</em></h1>
            <p>上传照片，套用真实感 135 胶片结构，调整构图与片边信息。没有 AI，没有滤镜，所有处理都留在你的浏览器里。</p>
            <div className="hero-actions">
              <button className="primary-action" onClick={onStart}>开始制作 <ArrowRight weight="bold" /></button>
              <a className="text-action" href="#styles">查看四种风格</a>
            </div>
            <div className="trust-row">
              <span><ShieldCheck weight="fill" /> 本地处理</span>
              <span><ImageSquare weight="fill" /> 原图保真</span>
              <span><LockKey weight="fill" /> 无需登录</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="经典底片效果预览">
            <div className="hero-index">FRAME / 01</div>
            <img src="/assets/style-a.png" alt="照片套用经典 135 底片的效果" />
            <div className="hero-caption"><span>ZHAGANA · 2026.07</span><span>FILMFRAME 135 / LOCAL EDITION</span></div>
          </div>
        </section>

        <section className="statement">
          <p>NOT A FILTER.</p>
          <h2>我们不模拟胶片颜色，<br />只还原胶片作为物件的存在感。</h2>
        </section>

        <section className="styles-section" id="styles">
          <div className="section-heading">
            <span>01 / FOUR FORMS</span>
            <div><h2>四种胶片结构</h2><p>每张照片都可以独立选择自己的表达方式。</p></div>
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
            <div><h2>从原图到成品，三步完成</h2><p>固定结构，有限调整，让批量制作也保持一致。</p></div>
          </div>
          <div className="steps">
            <article><b>01</b><UploadSimple /><h3>上传照片</h3><p>一次添加最多 12 张 JPEG、PNG 或 WebP。</p></article>
            <article><b>02</b><Sparkle /><h3>逐张选择风格</h3><p>A、B、C、D 可按照片独立切换，裁切参数彼此保留。</p></article>
            <article><b>03</b><DownloadSimple /><h3>检查并导出</h3><p>帧号跟随顺序自动更新，批量打包为 ZIP。</p></article>
          </div>
        </section>

        <section className="privacy-section" id="privacy">
          <div className="privacy-mark"><LockKey weight="duotone" /></div>
          <div><span>LOCAL BY DEFAULT</span><h2>照片不离开你的设备。</h2></div>
          <p>解码、裁切、合成和导出全部在浏览器本地进行。我们不分析照片，也不拿它训练任何模型。</p>
          <button onClick={onStart}>进入本地工作台 <ArrowRight /></button>
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
    if (slots <= 0) return flash("一个项目最多添加 12 张照片");
    const additions = accepted.slice(0, slots).map((file) => ({
      ...makeItem(`${Date.now()}-${file.name}-${Math.random()}`),
      name: file.name,
      src: URL.createObjectURL(file),
    }));
    if (!additions.length) return flash("请选择 JPEG、PNG 或 WebP 图片");
    setItems((current) => [...current, ...additions]);
    setSelectedId(additions[0].id);
    if (accepted.length > slots) flash(`已添加 ${slots} 张，项目上限为 12 张`);
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
      await document.fonts.ready;
      const images = [...document.images];
      await Promise.all(images.map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; })));
      if (items.length === 1) {
        const dataUrl = await toPng(exportRefs.current.get(items[0].id), { pixelRatio: 2, cacheBust: true });
        const link = document.createElement("a");
        link.download = `${projectName || "FILMFRAME"}_${twoDigits(0)}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        const zip = new JSZip();
        for (let index = 0; index < items.length; index += 1) {
          const item = items[index];
          const dataUrl = await toPng(exportRefs.current.get(item.id), { pixelRatio: 2, cacheBust: true });
          zip.file(`${projectName || "FILMFRAME"}_${item.style}_${twoDigits(index)}.png`, dataUrl.split(",")[1], { base64: true });
        }
        const blob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.download = `${projectName || "FILMFRAME"}_ALL.zip`;
        link.href = URL.createObjectURL(blob);
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }
      flash(items.length > 1 ? `已导出 ${items.length} 张成品` : "成品已导出");
    } catch (error) {
      console.error(error);
      flash("导出失败，请稍后重试");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="editor-page" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <header className="editor-topbar">
        <button className="editor-brand" onClick={onHome}>FILMFRAME <b>135</b></button>
        <label className="project-name"><span>项目</span><input value={projectName} onChange={(event) => setProjectName(event.target.value)} maxLength={24} placeholder="请输入项目名称" /></label>
        <div className="topbar-spacer" />
        <div className="local-badge"><span /> LOCAL · PRIVATE</div>
        <button className="export-button" onClick={exportProject} disabled={!items.length || exporting}>
          {exporting ? <span className="spinner" /> : <DownloadSimple weight="bold" />}
          {exporting ? "正在生成" : items.length > 1 ? "导出全部" : "导出作品"}
        </button>
        <button className="close-editor" onClick={onHome} aria-label="返回主页"><X /></button>
      </header>

      <main className="editor-layout">
        <aside className="template-panel panel">
          <div className="panel-title"><span>胶片模板</span><small>当前照片</small></div>
          <div className="template-list">
            {Object.entries(TEMPLATE_DATA).map(([key, template]) => (
              <button key={key} className={`template-option ${selected?.style === key ? "selected" : ""}`} onClick={() => selected && updateSelected({ style: key })} disabled={!selected}>
                <div><img src={template.previewSrc} alt="" />{selected?.style === key && <span className="selected-check"><Check weight="bold" /></span>}</div>
                <strong><b>{key}</b> {template.name}</strong>
                <small>{template.description}</small>
              </button>
            ))}
          </div>
          <div className="per-photo-note"><CheckCircle weight="fill" /><p><strong>逐张独立选择</strong><br />切换模板只影响当前照片。</p></div>
        </aside>

        <section className="canvas-column">
          <div className="canvas-toolbar">
            <div><span>照片 {items.length ? twoDigits(selectedIndex) : "--"}</span><small>{selected?.name || "尚未添加照片"}</small></div>
            {selected && <div className="style-tag">STYLE {selected.style} · {TEMPLATE_DATA[selected.style].name}</div>}
          </div>

          <div className="canvas-stage">
            {selected ? (
              <FilmSurface item={selected} frameNumber={twoDigits(selectedIndex)} metadata={metadata} interactive onDragStart={onDragStart} />
            ) : (
              <button className="empty-canvas" onClick={() => fileInputRef.current?.click()}><UploadSimple /><strong>上传照片开始制作</strong><span>支持 JPEG、PNG、WebP，最多 12 张</span><small>照片只在当前浏览器本地处理</small></button>
            )}
          </div>

          <div className="canvas-controls">
            <button onClick={() => selected && updateSelected({ rotation: (selected.rotation - 90) % 360 })} disabled={!selected}>左转 90°</button>
            <button onClick={() => selected && updateSelected({ rotation: (selected.rotation + 90) % 360 })} disabled={!selected}>右转 90°</button>
            <button onClick={() => selected && updateSelected({ zoom: 100, x: 0, y: 0, rotation: 0 })} disabled={!selected}>重置画面</button>
            <span />
            <Minus />
            <input aria-label="缩放" type="range" min="100" max="200" value={selected?.zoom || 100} onChange={(event) => updateSelected({ zoom: Number(event.target.value) })} disabled={!selected} />
            <Plus />
            <output>{selected?.zoom || 100}%</output>
          </div>
        </section>

        <aside className="settings-panel panel">
          <div className="settings-section">
            <div className="panel-title"><span>片边信息</span><small>当前照片</small></div>
            <label className="film-stock-field"><span>胶卷型号</span><select className={!selected?.filmStockId ? "is-placeholder" : ""} value={selected?.filmStockId || ""} onChange={changeFilmStock} disabled={!selected}>
              <option value="" disabled>请选择胶卷型号</option>
              {FILM_STOCKS.map((film) => <option key={film.id} value={film.id}>{film.name}</option>)}
            </select></label>
            <label><span>片边编号</span><input value={selected?.filmCode || ""} onChange={(event) => updateSelected({ filmCode: event.target.value.toUpperCase() })} maxLength={10} placeholder="请输入文字" disabled={!selected} /></label>
            <label><span>卷号</span><input value={selected?.rollNumber || ""} onChange={(event) => updateSelected({ rollNumber: event.target.value.toUpperCase() })} maxLength={12} placeholder="请输入文字" disabled={!selected} /></label>
            <label><span>地点</span><input value={selected?.location || ""} onChange={(event) => updateSelected({ location: event.target.value.toUpperCase() })} maxLength={18} placeholder="请输入文字" disabled={!selected} /></label>
            <label><span>日期</span><input value={selected?.date || ""} onChange={(event) => updateSelected({ date: event.target.value })} maxLength={10} placeholder="请输入文字" disabled={!selected} /></label>
            <label className="locked-field"><span>帧号</span><div><LockKey weight="fill" /><output>{items.length ? twoDigits(selectedIndex) : "--"}</output></div></label>
            <div className="auto-number-note"><span>AUTO</span><p>帧号跟随底部照片顺序自动生成，排序或删除后会连续更新。</p></div>
          </div>

          <div className="settings-section crop-summary">
            <div className="panel-title"><span>当前构图</span><small>不改变原图色彩</small></div>
            <dl><div><dt>缩放</dt><dd>{selected?.zoom || 100}%</dd></div><div><dt>横向位置</dt><dd>{Math.round(selected?.x || 0)}</dd></div><div><dt>纵向位置</dt><dd>{Math.round(selected?.y || 0)}</dd></div><div><dt>旋转</dt><dd>{selected?.rotation || 0}°</dd></div></dl>
          </div>

          <div className="settings-actions">
            <button onClick={() => moveSelected(-1)} disabled={!selected || selectedIndex === 0}><ArrowLeft /> 向前移动</button>
            <button onClick={() => moveSelected(1)} disabled={!selected || selectedIndex === items.length - 1}>向后移动 <ArrowRight /></button>
            <button className="delete-button" onClick={removeSelected} disabled={!selected}><Trash /> 删除当前照片</button>
          </div>
        </aside>

        <section className="thumbnail-rail">
          <div className="rail-heading"><div><strong>{items.length} 张照片</strong><span>帧号按当前顺序自动生成</span></div><button onClick={() => fileInputRef.current?.click()} disabled={items.length >= 12}><Plus /> 添加照片</button></div>
          <div className="thumbnails">
            {items.map((item, index) => (
              <button key={item.id} className={`thumbnail ${item.id === selectedId ? "selected" : ""}`} onClick={() => setSelectedId(item.id)}>
                <img src={item.src} alt={item.name} /><span className="thumb-number">{twoDigits(index)}</span><span className="thumb-style">{item.style}</span>
              </button>
            ))}
            {items.length < 12 && <button className="add-thumbnail" onClick={() => fileInputRef.current?.click()}><Plus /><span>添加照片</span></button>}
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
