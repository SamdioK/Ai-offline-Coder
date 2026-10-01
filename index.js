(() => {
  "use strict";
  if (typeof document === "undefined") {
    console.info("CodeForge Offline UI requires a browser DOM; the workspace is available in index.html.");
    return;
  }

  const STORAGE_KEY = "codeforge.offline.workspace.v1";
  const DEFAULT_FILES = {
    "README.md": "# My CodeForge Project\n\nA local-first workspace. Your files are stored in this browser on this device.\n",
    "hello.js": 'function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("CodeForge"));\n'
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  const style = document.createElement("style");
  style.textContent = `
    :root{color-scheme:dark;--bg:#111318;--panel:#191c23;--panel2:#20242d;--border:#2b303b;--text:#e7eaf0;--muted:#969eae;--accent:#72a7ff;--green:#55d6a3;--red:#ff7474;--editor:#13161c;--hover:#282e39;font:13px/1.45 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--safe-bottom:env(safe-area-inset-bottom,0px)}
    :root[data-theme="light"]{color-scheme:light;--bg:#f3f5f8;--panel:#fff;--panel2:#f6f7fa;--border:#dfe3ea;--text:#202633;--muted:#687386;--accent:#2769c7;--green:#11845f;--red:#c63838;--editor:#fff;--hover:#edf1f6}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);height:100vh;min-width:0;overflow:hidden}button,input,select,textarea{font:inherit;color:inherit}button{border:1px solid var(--border);background:var(--panel2);border-radius:5px;padding:6px 10px;cursor:pointer}button:hover{background:var(--hover)}button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:1px}button.primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}.app{height:100vh;display:flex;flex-direction:column}.topbar{height:48px;display:flex;align-items:center;gap:14px;padding:0 14px;border-bottom:1px solid var(--border);background:var(--panel);flex:none}.brand{font-weight:750;letter-spacing:.35px}.brand-mark{color:var(--accent);font-size:17px;margin-right:7px}.top-project{color:var(--muted);border-left:1px solid var(--border);padding-left:14px}.spacer{flex:1}.status{color:var(--muted);font-size:12px;white-space:nowrap}.dot{color:var(--green);margin-right:5px}.model{color:var(--muted)}.layout{flex:1;min-height:0;display:grid;grid-template-columns:230px minmax(260px,1fr) 300px}.sidebar,.assistant{background:var(--panel);min-height:0;display:flex;flex-direction:column}.sidebar{border-right:1px solid var(--border)}.assistant{border-left:1px solid var(--border)}.section-head{height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;color:var(--muted);font-weight:700;font-size:11px;letter-spacing:.7px}.section-actions{display:flex;gap:4px}.icon-btn{padding:3px 7px;border:0;background:transparent;color:var(--muted)}.explorer{overflow:auto;padding:2px 8px 12px;flex:1}.file-row{display:flex;align-items:center;gap:8px;min-height:28px;padding:4px 7px;border-radius:4px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.file-row:hover,.file-row.active{background:var(--hover)}.file-row.active{color:var(--accent)}.file-icon{color:var(--muted);width:15px;text-align:center}.welcome-side{padding:12px;color:var(--muted);font-size:12px}.center{min-width:0;display:flex;flex-direction:column;background:var(--editor)}.toolbar{height:40px;display:flex;align-items:center;gap:6px;padding:0 10px;border-bottom:1px solid var(--border);background:var(--panel2)}.toolbar button{padding:4px 9px;font-size:12px}.tabs{height:37px;display:flex;overflow:auto;border-bottom:1px solid var(--border);background:var(--panel)}.tab{padding:8px 13px;border-right:1px solid var(--border);color:var(--muted);cursor:pointer;white-space:nowrap}.tab.active{background:var(--editor);color:var(--text);border-top:2px solid var(--accent);padding-top:6px}.dirty{color:var(--accent);margin-left:5px}.editor-wrap{display:flex;flex:1;min-height:0;overflow:hidden}.gutter{width:48px;padding:14px 10px 14px 0;text-align:right;color:var(--muted);opacity:.65;overflow:hidden;user-select:none;white-space:pre;line-height:1.6;background:var(--editor);font:13px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace}.editor{flex:1;resize:none;border:0;outline:0!important;background:var(--editor);color:var(--text);padding:14px 16px;line-height:1.6;tab-size:2;white-space:pre;overflow:auto;font:13px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace}.empty-editor{margin:auto;text-align:center;color:var(--muted);padding:30px}.assistant-content{display:flex;flex-direction:column;min-height:0;flex:1;padding:10px}.assistant-intro{color:var(--muted);font-size:12px;margin:0 0 10px}.chat-log{flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px;padding:2px 1px 12px}.message{border:1px solid var(--border);border-radius:7px;padding:9px 10px;white-space:pre-wrap;overflow-wrap:anywhere}.message.user{background:var(--panel2);align-self:flex-end;max-width:95%}.message.assistant{align-self:stretch;color:var(--text)}.message-label{font-size:10px;text-transform:uppercase;color:var(--muted);letter-spacing:.5px;margin-bottom:4px}.chat-compose{display:flex;flex-direction:column;gap:7px}.chat-compose textarea{resize:vertical;min-height:72px;max-height:180px;border:1px solid var(--border);border-radius:5px;background:var(--editor);padding:9px}.chat-actions{display:flex;justify-content:space-between;align-items:center}.chat-actions span{color:var(--muted);font-size:10px}.bottom{height:205px;min-height:110px;border-top:1px solid var(--border);display:flex;flex-direction:column;background:var(--panel)}.bottom-tabs{display:flex;height:37px;align-items:stretch;border-bottom:1px solid var(--border)}.bottom-tab{padding:9px 13px;color:var(--muted);cursor:pointer;font-size:12px}.bottom-tab.active{color:var(--text);border-bottom:2px solid var(--accent)}.panel-content{padding:9px 13px;overflow:auto;flex:1;font:12px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:pre-wrap}.log-line{margin:2px 0}.error{color:var(--red)}.success{color:var(--green)}.problem-row{padding:4px 0;color:var(--red)}.footer{height:23px;display:flex;align-items:center;gap:15px;padding:0 10px;background:#2769c7;color:white;font-size:11px;flex:none}.footer span:last-child{margin-left:auto}.modal-backdrop{position:fixed;inset:0;background:#0009;display:grid;place-items:center;z-index:5}.modal{width:min(430px,90vw);padding:20px;background:var(--panel);border:1px solid var(--border);border-radius:9px;box-shadow:0 18px 60px #0008}.modal h2{font-size:17px;margin:0 0 15px}.field{display:flex;flex-direction:column;gap:5px;margin:12px 0;color:var(--muted)}.field input,.field select{background:var(--editor);border:1px solid var(--border);border-radius:5px;padding:8px}.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.notice{position:fixed;right:18px;bottom:35px;background:var(--panel2);border:1px solid var(--border);border-radius:6px;padding:9px 13px;z-index:8;box-shadow:0 5px 20px #0005}.hidden{display:none!important}.open-input{display:none}@media(max-width:1000px){.layout{grid-template-columns:190px minmax(250px,1fr)}.assistant{display:none}}@media(max-height:620px){.bottom{height:145px}}
    .mobile-nav{display:none}
    @media(max-width:720px){
      body{height:100dvh;min-width:0}.app{height:100dvh}.topbar{height:48px;padding:0 9px;gap:8px}.brand{font-size:12px}.brand-mark{font-size:15px;margin-right:4px}.top-project{display:none}.model{display:none}#settings-button{padding:5px 8px;font-size:11px}.status{font-size:10px}.layout{display:block;position:relative;min-height:0;overflow:hidden}.center{height:100%;min-height:0}.toolbar{height:42px;padding:0 7px;gap:4px}.toolbar button{padding:5px 8px}.tabs{height:36px}.tab{padding-left:10px;padding-right:10px}.editor-wrap{min-height:0}.gutter{width:38px;padding-right:7px}.editor{padding:12px 10px;font-size:16px!important}.assistant,.sidebar{display:none}.bottom{height:23vh;min-height:100px;max-height:32vh}.bottom-tabs{overflow-x:auto;flex:none}.bottom-tab{white-space:nowrap;padding:9px 10px}.panel-content{padding:8px 10px}.mobile-nav{display:flex;flex:none;height:56px;padding:4px 5px calc(4px + var(--safe-bottom));gap:4px;background:var(--panel);border-top:1px solid var(--border)}.mobile-nav button{flex:1;min-width:0;border:0;background:transparent;color:var(--muted);padding:5px 2px;font-size:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}.mobile-nav button span:first-child{font-size:16px}.mobile-nav button.active{color:var(--accent);background:var(--hover)}.app.mobile-explorer .sidebar,.app.mobile-assistant .assistant{display:flex;position:absolute;z-index:4;inset:0 0 0 0;width:100%;border:0;box-shadow:0 10px 35px #0008}.app.mobile-assistant .assistant{overflow:hidden}.app.mobile-assistant .assistant-content{padding:10px; padding-bottom:calc(10px + var(--safe-bottom))}.app.mobile-assistant .chat-compose textarea{font-size:16px}.app.mobile-panel .bottom{height:42vh;max-height:48vh}.app.mobile-panel .center{height:calc(100% - 19vh)}.app.mobile-panel .editor-wrap{min-height:80px}.footer{height:21px;font-size:10px;padding:0 7px}.empty-editor{padding:18px;font-size:12px}
    }
    @media(max-width:380px){.brand{font-size:10px}.status#save-status{display:none}.toolbar button{font-size:11px;padding:5px 6px}.language-label{display:none}}
  `;
  document.head.appendChild(style);
  document.title = "CodeForge Offline";
  document.body.innerHTML = `
    <main class="app">
      <header class="topbar"><div class="brand"><span class="brand-mark">◆</span>CODEFORGE <span style="font-weight:400">OFFLINE</span></div><div class="top-project" id="project-name">No project open</div><div class="spacer"></div><div class="status" id="network-status"><span class="dot">●</span>Checking…</div><div class="model">AI · Development mock</div><div class="status" id="save-status">No changes</div><button id="settings-button" aria-label="Open settings">⚙ Settings</button></header>
      <section class="layout">
        <aside class="sidebar"><div class="section-head"><span>EXPLORER</span><div class="section-actions"><button class="icon-btn" id="new-file" aria-label="Create file" title="New file">＋</button><button class="icon-btn" id="rename-file" aria-label="Rename selected file" title="Rename selected file">✎</button><button class="icon-btn" id="delete-file" aria-label="Delete selected file" title="Delete selected file">×</button><button class="icon-btn" id="open-folder" aria-label="Open project folder" title="Import folder">▣</button></div></div><div class="section-head" style="height:30px;font-weight:500;letter-spacing:0">PROJECT FILES</div><div class="explorer" id="explorer"></div><div style="padding:10px;border-top:1px solid var(--border);display:flex;gap:6px"><button id="create-project" style="flex:1">＋ New project</button><button id="open-project">Open</button></div><input class="open-input" id="folder-input" type="file" webkitdirectory multiple aria-label="Choose a project folder"></aside>
        <section class="center"><div class="toolbar"><button class="primary" id="run-button">▶ Run</button><button id="save-button">Save</button><button id="export-button">Export</button><div class="spacer"></div><span class="status" id="language-label">No file selected</span></div><div class="tabs" id="editor-tabs"></div><div class="editor-wrap" id="editor-area"><div class="empty-editor">Create or open a project to start working.</div></div></section>
        <aside class="assistant"><div class="section-head"><span>CODEFORGE ASSISTANT</span><span style="color:var(--green);font-size:10px">LOCAL UI</span></div><div class="assistant-content"><p class="assistant-intro">Development mock provider · project code stays in this browser.</p><div class="chat-log" id="chat-log"><div class="message assistant"><div class="message-label">CodeForge mock</div>I can help explore the current file in this development build. Responses are rule-based and are not generated by an AI model.</div></div><div class="chat-compose"><textarea id="chat-input" aria-label="Ask CodeForge" placeholder="Ask about your code…"></textarea><div class="chat-actions"><span>Mock provider · no network request</span><button class="primary" id="send-chat">Ask</button></div></div></div></aside>
      </section>
      <nav class="mobile-nav" aria-label="Workspace views"><button class="active" data-mobile-view="code" aria-label="Editor"><span>⌘</span><span>Code</span></button><button data-mobile-view="explorer" aria-label="Project explorer"><span>▣</span><span>Files</span></button><button data-mobile-view="assistant" aria-label="AI assistant"><span>✦</span><span>Assistant</span></button><button data-mobile-view="panel" aria-label="Output panel"><span>▤</span><span>Panel</span></button></nav>
      <section class="bottom"><div class="bottom-tabs"><div class="bottom-tab active" data-panel="terminal">Terminal</div><div class="bottom-tab" data-panel="problems">Problems <span id="problem-count"></span></div><div class="bottom-tab" data-panel="output">Output</div><div class="bottom-tab" data-panel="activity">AI Activity</div></div><div class="panel-content" id="panel-content" role="log" aria-live="polite">CodeForge local workspace ready. Create a project or open a folder to begin.\n</div></section>
      <footer class="footer"><span>CodeForge Offline · local workspace</span><span id="footer-file">Ready</span></footer>
    </main><div id="modal-root"></div><div id="notice-root"></div>`;

  const state = { projects: {}, projectId: null, project: null, active: null, openFiles: [], dirty: new Set(), problems: [], panel: "terminal", output: "", settings: { theme: "dark", fontSize: 13, autosave: true } };

  // Browser-local backend adapter. Keeping storage access here makes it possible
  // to replace localStorage with IndexedDB or a desktop database later.
  const workspaceBackend = {
    load() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      } catch (error) {
        console.warn("Could not read local workspace data", error);
        return null;
      }
    },
    save(data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  };

  function loadWorkspace() {
    const data = workspaceBackend.load();
    if (data && typeof data === "object") {
      state.settings = { ...state.settings, ...(data.settings || {}) };
      state.projects = data.projects && typeof data.projects === "object" ? data.projects : {};
      if (!Object.keys(state.projects).length && data.project?.files) state.projects.legacy = data.project;
      state.projectId = data.activeProjectId in state.projects ? data.activeProjectId : (Object.keys(state.projects)[0] || null);
      state.project = state.projectId ? state.projects[state.projectId] : null;
      if (state.project?.files && typeof state.project.files === "object") {
        state.openFiles = Array.isArray(data.openFiles) ? data.openFiles.filter((path) => path in state.project.files) : [];
        state.active = data.active in state.project.files ? data.active : (Object.keys(state.project.files).sort()[0] || null);
        if (state.active && !state.openFiles.includes(state.active)) state.openFiles.push(state.active);
      } else { state.project = null; state.projectId = null; }
    }
    applyTheme(); render();
  }
  function persist() {
    if (state.project && state.projectId) state.projects[state.projectId] = state.project;
    try {
      workspaceBackend.save({ projects: state.projects, activeProjectId: state.projectId, settings: state.settings, active: state.active, openFiles: state.openFiles });
      $("#save-status").textContent = state.dirty.size ? "Unsaved changes" : "Saved locally";
    } catch (error) { toast("Local storage is full; export your work to keep a backup."); console.error(error); }
  }
  function applyTheme() { document.documentElement.dataset.theme = state.settings.theme === "light" ? "light" : "dark"; }
  function setPanel(panel) {
    state.panel = panel;
    document.querySelectorAll(".bottom-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.panel === panel));
    renderPanel();
  }
  function appendOutput(text, className = "") {
    state.output += `${text}\n`;
    if (state.panel === "terminal" || state.panel === "output") renderPanel();
    if (className) { const line = $("#panel-content").lastElementChild; if (line) line.classList.add(className); }
  }
  function renderPanel() {
    const target = $("#panel-content");
    if (state.panel === "problems") {
      target.innerHTML = state.problems.length ? state.problems.map((p) => `<div class="problem-row">${escapeHtml(p.message)}${p.file ? ` — ${escapeHtml(p.file)}` : ""}</div>`).join("") : "No problems detected.";
    } else if (state.panel === "activity") target.textContent = "AI Activity\nThe development mock has no background actions. Ask a question to record a chat response.";
    else target.textContent = state.output || (state.panel === "terminal" ? "Terminal output will appear here. Use Run to execute the active JavaScript file." : "No output yet.");
    target.scrollTop = target.scrollHeight;
  }
  function languageFor(path) {
    const ext = path.split(".").pop().toLowerCase();
    return ({ js: "JavaScript", mjs: "JavaScript", cjs: "JavaScript", ts: "TypeScript", html: "HTML", css: "CSS", py: "Python", json: "JSON", sql: "SQL", md: "Markdown" })[ext] || "Plain Text";
  }
  function render() {
    $("#project-name").textContent = state.project ? state.project.name : "No project open";
    const explorer = $("#explorer");
    if (!state.project) explorer.innerHTML = `<div class="welcome-side">No project is open.<br><br>Create a local workspace or import an existing folder. Work is saved in this browser's local storage.</div>`;
    else {
      const files = Object.keys(state.project.files).sort((a, b) => a.localeCompare(b));
      explorer.innerHTML = files.length ? files.map((path) => `<div class="file-row ${state.active === path ? "active" : ""}" data-path="${escapeHtml(path)}" title="${escapeHtml(path)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(path)}"><span class="file-icon">${path.endsWith(".md") ? "▤" : "◇"}</span><span>${escapeHtml(path)}</span><span class="spacer"></span></div>`).join("") : `<div class="welcome-side">This project has no files. Use ＋ to create one.</div>`;
    }
    $("#editor-tabs").innerHTML = state.openFiles.map((path) => `<div class="tab ${path === state.active ? "active" : ""}" data-tab="${escapeHtml(path)}">${escapeHtml(path.split("/").pop())}${state.dirty.has(path) ? `<span class="dirty">●</span>` : ""}</div>`).join("");
    const editorArea = $("#editor-area");
    if (state.active && state.project?.files[state.active] !== undefined) {
      const content = state.project.files[state.active];
      const lines = Math.max(1, content.split("\n").length);
      editorArea.innerHTML = `<div class="gutter" id="gutter">${Array.from({ length: lines }, (_, i) => i + 1).join("\n")}</div><textarea class="editor" id="code-editor" spellcheck="false" aria-label="Code editor for ${escapeHtml(state.active)}" autocapitalize="off" autocomplete="off">${escapeHtml(content)}</textarea>`;
      $("#language-label").textContent = languageFor(state.active);
      $("#footer-file").textContent = `${state.active} · ${languageFor(state.active)}`;
      $("#code-editor").style.fontSize = `${Number(state.settings.fontSize) || 13}px`;
      $("#code-editor").addEventListener("input", onEditorInput);
      $("#code-editor").addEventListener("scroll", () => { $("#gutter").scrollTop = $("#code-editor").scrollTop; });
      $("#code-editor").addEventListener("keydown", onEditorKeydown);
    } else {
      editorArea.innerHTML = `<div class="empty-editor">${state.project ? "Choose a file from the explorer, or create one." : "Create or open a project to start working."}</div>`;
      $("#language-label").textContent = "No file selected";
      $("#footer-file").textContent = state.project ? "No file selected" : "Ready";
    }
    $("#problem-count").textContent = state.problems.length ? `(${state.problems.length})` : "";
    renderPanel();
  }
  function onEditorInput(event) {
    const editor = event.currentTarget, path = state.active;
    state.project.files[path] = editor.value;
    state.dirty.add(path);
    $("#save-status").textContent = "Editing…";
    const count = editor.value.split("\n").length;
    $("#gutter").textContent = Array.from({ length: count }, (_, i) => i + 1).join("\n");
    $("#problem-count").textContent = state.problems.length ? `(${state.problems.length})` : "";
    if (state.settings.autosave) {
      clearTimeout(onEditorInput.timer);
      onEditorInput.timer = setTimeout(() => { state.dirty.delete(path); persist(); renderTabsOnly(); }, 2000);
    }
  }
  function renderTabsOnly() {
    $("#editor-tabs").innerHTML = state.openFiles.map((path) => `<div class="tab ${path === state.active ? "active" : ""}" data-tab="${escapeHtml(path)}">${escapeHtml(path.split("/").pop())}${state.dirty.has(path) ? `<span class="dirty">●</span>` : ""}</div>`).join("");
  }
  function onEditorKeydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); saveActive(); }
    if (event.key === "Tab") { event.preventDefault(); const input = event.currentTarget; const start = input.selectionStart; input.setRangeText("  ", start, input.selectionEnd, "end"); input.dispatchEvent(new Event("input", { bubbles: true })); }
  }
  function saveActive() {
    if (!state.project) return;
    if (state.active && $("#code-editor")) state.project.files[state.active] = $("#code-editor").value;
    state.dirty.clear(); persist(); renderTabsOnly(); toast("Saved to this browser on this device.");
  }
  function exportProject() {
    if (!state.project) { toast("Create or open a project first."); return; }
    if (state.active && $("#code-editor")) state.project.files[state.active] = $("#code-editor").value;
    const data = new Blob([JSON.stringify(state.project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(data), link = document.createElement("a");
    link.href = url; link.download = `${state.project.name.replace(/[^a-z0-9_-]+/gi, "-") || "codeforge-project"}.codeforge.json`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast("Project backup downloaded as JSON.");
  }
  function activate(path) {
    if (!state.project?.files || !(path in state.project.files)) return;
    if (state.active && $("#code-editor")) state.project.files[state.active] = $("#code-editor").value;
    state.active = path;
    if (!state.openFiles.includes(path)) state.openFiles.push(path);
    render();
  }
  function safePath(path) {
    const normalized = String(path).replace(/\\/g, "/").trim();
    return normalized && !normalized.startsWith("/") && !normalized.split("/").some((part) => part === ".." || part === "") && !/^[a-zA-Z]:/.test(normalized) ? normalized : null;
  }
  function askModal(title, label, initial = "") {
    return new Promise((resolve) => {
      const root = $("#modal-root");
      root.innerHTML = `<div class="modal-backdrop"><form class="modal"><h2>${escapeHtml(title)}</h2><label class="field">${escapeHtml(label)}<input id="modal-value" required value="${escapeHtml(initial)}" autocomplete="off"></label><div class="modal-actions"><button type="button" id="modal-cancel">Cancel</button><button class="primary" type="submit">Continue</button></div></form></div>`;
      const form = $("form", root), input = $("#modal-value", root);
      form.addEventListener("submit", (event) => { event.preventDefault(); root.innerHTML = ""; resolve(input.value.trim() || null); });
      $("#modal-cancel", root).addEventListener("click", () => { root.innerHTML = ""; resolve(null); });
      root.addEventListener("click", (event) => { if (event.target.classList.contains("modal-backdrop")) { root.innerHTML = ""; resolve(null); } });
      input.focus();
    });
  }
  function toast(text) {
    const root = $("#notice-root"); root.innerHTML = `<div class="notice">${escapeHtml(text)}</div>`;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { root.innerHTML = ""; }, 2800);
  }
  async function createProject() {
    const name = await askModal("Create a local project", "Project name", "My Project");
    if (!name) return;
    saveActive();
    state.projectId = `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    state.project = { name, files: { ...DEFAULT_FILES }, createdAt: new Date().toISOString() };
    state.projects[state.projectId] = state.project;
    state.active = "hello.js"; state.openFiles = ["hello.js"]; state.dirty.clear(); state.problems = [];
    state.output = `Created local project: ${name}\n`; persist(); render();
  }
  async function createFile() {
    if (!state.project) { toast("Create or open a project first."); return; }
    const raw = await askModal("Create file", "Relative file path (for example src/app.js)", "");
    if (!raw) return;
    const path = safePath(raw);
    if (!path) { toast("Use a safe relative path without '..' segments."); return; }
    if (path in state.project.files) { toast("A file with that path already exists."); return; }
    state.project.files[path] = ""; persist(); activate(path);
  }
  async function renameFile(path) {
    const raw = await askModal("Rename file", "New relative file path", path);
    if (!raw || raw === path) return;
    const next = safePath(raw);
    if (!next || next in state.project.files) { toast("That path is invalid or already exists."); return; }
    state.project.files[next] = state.project.files[path]; delete state.project.files[path];
    state.openFiles = state.openFiles.map((file) => file === path ? next : file);
    if (state.dirty.has(path)) { state.dirty.delete(path); state.dirty.add(next); }
    if (state.active === path) state.active = next;
    persist(); render();
  }
  async function deleteFile(path) {
    if (!window.confirm(`Delete ${path} from this local project?`)) return;
    delete state.project.files[path]; state.openFiles = state.openFiles.filter((file) => file !== path);
    state.dirty.delete(path); if (state.active === path) state.active = state.openFiles.at(-1) || null;
    persist(); render();
  }
  function openSavedProject() {
    const entries = Object.entries(state.projects);
    if (!entries.length) { toast("No saved projects yet. Use Import folder to open existing files."); return; }
    const root = $("#modal-root");
    root.innerHTML = `<div class="modal-backdrop"><form class="modal" id="project-form"><h2>Open saved project</h2><label class="field">Project<select name="project">${entries.map(([id, project]) => `<option value="${escapeHtml(id)}">${escapeHtml(project.name)}</option>`).join("")}</select></label><div class="modal-actions"><button type="button" id="project-cancel">Cancel</button><button class="primary" type="submit">Open project</button></div></form></div>`;
    const form = $("#project-form", root);
    if (state.projectId) form.elements.project.value = state.projectId;
    form.addEventListener("submit", (event) => {
      event.preventDefault(); saveActive();
      state.projectId = form.elements.project.value; state.project = state.projects[state.projectId];
      state.openFiles = []; state.active = Object.keys(state.project.files).sort()[0] || null;
      if (state.active) state.openFiles.push(state.active);
      state.dirty.clear(); state.problems = []; state.output += `Opened local project: ${state.project.name}\n`;
      root.innerHTML = ""; persist(); render();
    });
    $("#project-cancel", root).addEventListener("click", () => { root.innerHTML = ""; });
  }
  function importFolder(fileList) {
    if (!fileList.length) return;
    const accepted = [...fileList].filter((file) => {
      const relative = file.webkitRelativePath ? file.webkitRelativePath.split("/").slice(1).join("/") : file.name;
      const ignored = /(^|\/)(\.git|node_modules|venv|\.venv|__pycache__|dist|build)(\/|$)/i.test(relative);
      const binary = /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|woff2?|ttf|mp[34]|exe|dll|so|bin|sqlite|db)$/i.test(relative) || file.type === "application/octet-stream";
      return safePath(relative) && !ignored && !binary && file.size <= 1024 * 1024;
    });
    Promise.all(accepted.map(async (file) => [safePath(file.webkitRelativePath ? file.webkitRelativePath.split("/").slice(1).join("/") : file.name), await file.text()]))
      .then((entries) => {
        const rootName = fileList[0].webkitRelativePath?.split("/")[0] || "Imported Project";
        saveActive();
        state.projectId = `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        state.project = { name: rootName, files: Object.fromEntries(entries.filter(([path]) => path)), createdAt: new Date().toISOString() };
        state.projects[state.projectId] = state.project;
        state.openFiles = []; state.active = Object.keys(state.project.files).sort()[0] || null;
        if (state.active) state.openFiles.push(state.active);
        state.problems = []; state.dirty.clear(); state.output = `Imported ${entries.length} text files from ${rootName}.\n`;
        persist(); render(); toast("Folder imported into this browser's local workspace.");
      }).catch((error) => toast(`Could not import folder: ${error.message}`));
  }
  function runActive() {
    if (!state.active || !state.project) { toast("Open a project file first."); return; }
    const code = $("#code-editor")?.value ?? state.project.files[state.active];
    state.project.files[state.active] = code;
    const language = languageFor(state.active);
    if (language !== "JavaScript") {
      state.problems = [{ message: `Execution for ${language} is not available in this browser-only build.`, file: state.active }];
      state.output += `Cannot run ${language}: this workspace does not include a local runtime.\n`;
      setPanel("problems"); render(); return;
    }
    state.problems = [];
    state.output += `> Run ${state.active} (isolated browser sandbox)\n`;
    setPanel("terminal");
    const token = `${Date.now()}-${Math.random()}`;
    const frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-scripts"); frame.title = "Isolated JavaScript execution";
    frame.style.cssText = "display:none";
    const csp = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; connect-src 'none'; img-src data:; style-src 'unsafe-inline'; form-action 'none'";
    const serializedCode = JSON.stringify(code).replace(/</g, "\\u003c");
    frame.srcdoc = `<!doctype html><meta http-equiv="Content-Security-Policy" content="${csp}"><script>
      const token=${JSON.stringify(token)};
      const send=(kind,args)=>parent.postMessage({source:'codeforge-runner',token,kind,args},'*');
      const format=(value)=>{try{return typeof value==='string'?value:JSON.stringify(value)}catch(_){return String(value)}};
      ['log','info','warn','error'].forEach(kind=>console[kind]=(...args)=>send(kind,args.map(format)));
      addEventListener('error',e=>{send('error',[e.message+' at line '+e.lineno]);e.preventDefault()});
      addEventListener('unhandledrejection',e=>send('error',['Unhandled promise rejection: '+format(e.reason)]));
      try{(0,eval)(${serializedCode});send('done',[])}catch(e){send('error',[e.name+': '+e.message]);send('done',[])}
    <\/script>`;
    let finished = false;
    const finish = () => { if (finished) return; finished = true; frame.remove(); window.removeEventListener("message", listener); };
    const timer = setTimeout(() => { state.problems = [{ message: "Execution stopped after the 3-second limit.", file: state.active }]; state.output += "Execution timed out (3 seconds).\n"; render(); finish(); }, 3000);
    const listener = (event) => {
      if (event.source !== frame.contentWindow || event.data?.source !== "codeforge-runner" || event.data.token !== token) return;
      const { kind, args = [] } = event.data;
      if (kind === "done") { clearTimeout(timer); state.output += "Execution completed.\n"; renderPanel(); finish(); return; }
      const line = `${kind === "error" ? "Error" : kind === "warn" ? "Warning" : ""}${kind === "error" || kind === "warn" ? ": " : ""}${args.join(" ")}`;
      state.output += `${line}\n`;
      if (kind === "error") { state.problems.push({ message: args.join(" "), file: state.active }); $("#problem-count").textContent = `(${state.problems.length})`; }
      renderPanel();
    };
    window.addEventListener("message", listener); document.body.appendChild(frame);
  }
  class AIProvider {
    async initialize() {}
    async chat() { throw new Error("No AI provider has been configured."); }
  }
  class DevelopmentMockProvider extends AIProvider {
    async chat(request) { return mockAnswer(request.question); }
  }
  const aiProvider = new DevelopmentMockProvider();

  async function sendChat() {
    const input = $("#chat-input"), question = input.value.trim(); if (!question) return;
    input.value = "";
    const log = $("#chat-log"), user = document.createElement("div"); user.className = "message user"; user.innerHTML = `<div class="message-label">You</div>${escapeHtml(question)}`; log.appendChild(user);
    const assistant = document.createElement("div"); assistant.className = "message assistant"; assistant.innerHTML = `<div class="message-label">Development mock</div>Thinking…`; log.appendChild(assistant); log.scrollTop = log.scrollHeight;
    try {
      const response = await aiProvider.chat({ question, projectName: state.project?.name, currentFile: state.active });
      assistant.innerHTML = `<div class="message-label">Development mock</div>${escapeHtml(response)}`;
    } catch (error) {
      assistant.innerHTML = `<div class="message-label">Provider error</div>${escapeHtml(error.message)}`;
    }
    log.scrollTop = log.scrollHeight;
  }
  function mockAnswer(question) {
    const path = state.active, code = path && state.project?.files[path];
    if (/explain|what does|describe/i.test(question) && code) return `Current file: ${path} (${languageFor(path)}). It contains ${code.split("\n").length} lines and ${code.length} characters. This development mock cannot perform semantic code analysis; use the selected code as context when reviewing it.`;
    if (/error|problem|bug/i.test(question) && state.problems.length) return `The latest recorded problem is: ${state.problems[0].message}. This mock does not diagnose or modify code. Review the Problems and Terminal panels, then make and run a fix yourself.`;
    if (!code) return "Open a project file and ask about it. This is a development mock, not a connected AI model, so it will not generate patches or claim to have run tests.";
    return `I received: “${question}”\n\nCurrent context is ${path} (${languageFor(path)}). The Version 0.1 development mock does not generate or apply code changes. No files were modified.`;
  }
  function openSettings() {
    const root = $("#modal-root");
    root.innerHTML = `<div class="modal-backdrop"><form class="modal" id="settings-form"><h2>Settings</h2><label class="field">Theme<select name="theme"><option value="dark">Dark</option><option value="light">Light</option></select></label><label class="field">Editor font size<select name="fontSize"><option>12</option><option>13</option><option>14</option><option>16</option><option>18</option></select></label><label class="field" style="flex-direction:row;align-items:center"><input type="checkbox" name="autosave"> Autosave after 2 seconds</label><div class="modal-actions"><button type="button" id="settings-cancel">Close</button><button class="primary" type="submit">Save settings</button></div></form></div>`;
    const form = $("#settings-form", root); form.elements.theme.value = state.settings.theme; form.elements.fontSize.value = String(state.settings.fontSize); form.elements.autosave.checked = Boolean(state.settings.autosave);
    form.addEventListener("submit", (event) => { event.preventDefault(); state.settings = { theme: form.elements.theme.value, fontSize: Number(form.elements.fontSize.value), autosave: form.elements.autosave.checked }; applyTheme(); persist(); root.innerHTML = ""; render(); });
    $("#settings-cancel", root).addEventListener("click", () => { root.innerHTML = ""; });
  }
  function updateNetwork() {
    const online = navigator.onLine;
    $("#network-status").innerHTML = `<span class="dot" style="color:${online ? "var(--green)" : "var(--red)"}">●</span>${online ? "ONLINE" : "OFFLINE MODE"}`;
    $("#network-status").title = "Browser connectivity indicator; does not verify access to a specific service.";
  }

  document.addEventListener("click", (event) => {
    const mobileButton = event.target.closest("[data-mobile-view]");
    if (mobileButton) {
      const app = $(".app"), view = mobileButton.dataset.mobileView;
      app.classList.remove("mobile-explorer", "mobile-assistant", "mobile-panel");
      if (view === "explorer") app.classList.add("mobile-explorer");
      if (view === "assistant") app.classList.add("mobile-assistant");
      if (view === "panel") app.classList.add("mobile-panel");
      document.querySelectorAll("[data-mobile-view]").forEach((button) => {
        const selected = button === mobileButton;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      return;
    }
    const fileRow = event.target.closest(".file-row"); if (fileRow) { activate(fileRow.dataset.path); $(".app").classList.remove("mobile-explorer"); $("[data-mobile-view=code]").click(); return; }
    const tab = event.target.closest(".tab"); if (tab) { activate(tab.dataset.tab); return; }
    const bottomTab = event.target.closest(".bottom-tab"); if (bottomTab) { setPanel(bottomTab.dataset.panel); return; }
    if (event.target.closest("#create-project")) createProject();
    if (event.target.closest("#open-project")) openSavedProject();
    if (event.target.closest("#open-folder")) $("#folder-input").click();
    if (event.target.closest("#new-file")) createFile();
    if (event.target.closest("#run-button")) runActive();
    if (event.target.closest("#save-button")) saveActive();
    if (event.target.closest("#export-button")) exportProject();
    if (event.target.closest("#settings-button")) openSettings();
    if (event.target.closest("#send-chat")) sendChat();
    if (event.target.closest("#rename-file")) { if (state.active) renameFile(state.active); else toast("Select a file first."); }
    if (event.target.closest("#delete-file")) { if (state.active) deleteFile(state.active); else toast("Select a file first."); }
  });
  document.addEventListener("dblclick", (event) => {
    const row = event.target.closest(".file-row");
    if (row) renameFile(row.dataset.path);
  });
  document.addEventListener("keydown", (event) => {
    const row = event.target.closest(".file-row");
    if (row && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); activate(row.dataset.path); }
    if (row && event.key === "Delete") { event.preventDefault(); deleteFile(row.dataset.path); }
  });
  $("#folder-input").addEventListener("change", (event) => { importFolder(event.target.files); event.target.value = ""; });
  $("#chat-input").addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendChat(); } });
  document.addEventListener("contextmenu", (event) => {
    const row = event.target.closest(".file-row"); if (!row) return;
    event.preventDefault(); renameFile(row.dataset.path);
  });
  document.addEventListener("keydown", (event) => { if (!event.defaultPrevented && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); saveActive(); } });
  window.addEventListener("online", updateNetwork); window.addEventListener("offline", updateNetwork);
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => console.warn("Offline app-shell caching is unavailable in this hosting environment.", error));
  }
  updateNetwork(); loadWorkspace();
})();
