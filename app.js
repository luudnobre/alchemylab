/* =========================================
   Coding House • Alchemy Run — APP
   ========================================= */

   (() => {
    // ---- Data pools (teu simbólico)
    const THEMES = [
      "Esperança em tempos difíceis",
      "Cidade invisível que abriga sonhos",
      "Água que lembra memórias",
      "Fé que se faz caminho",
      "Tecnologia com coração",
      "Exílio e volta pra casa",
      "Ritmos do corpo e da mente",
      "Cartas ao futuro",
      "Silêncio que fala alto",
      "Luz em corredores escuros",
      "A casa que aprende",
      "O nome secreto das coisas",
      "Mares do Nordeste",
      "Conversas com o tempo",
      "O quarto das janelas abertas"
    ];
  
    const MEDIUMS = [
      "poema narrativo",
      "mini jogo web",
      "sermão temático em 3 pontos",
      "canção acústica (2 versos + refrão)",
      "vídeo curto de 45s (roteiro)",
      "thread no X (7 passos)",
      "post carrossel (5 telas)",
      "conto de 500 palavras",
      "pitch de produto (90s)",
      "aula-relâmpago (slide único)",
      "cena de teatro (2 personagens)",
      "oração/declaração guiada",
      "ensaio visual (paleta & formas)",
      "boletim de laboratório criativo",
      "cartas devocionais (3 cartas)"
    ];
  
    const TWISTS = [
      "usar apenas palavras concretas",
      "começar pelo final",
      "incluir 1 metáfora culinária",
      "inverter luz/sombra no clímax",
      "ter 1 pergunta que não se responde",
      "usar aliteração em 1 parte",
      "citar um objeto doméstico como símbolo",
      "ter 3 frases com exatamente 7 palavras",
      "misturar linguagem técnica e poética",
      "usar 2 idiomas (pt + en)",
      "conter um momento de silêncio (…) ",
      "aparecer um mapa desenhado com palavras",
      "ter um ‘bug’ proposital (glitch)",
      "usar a estrutura A→B→A'",
      "fechar com uma benção curta"
    ];
  
    const FOCOS = ["voz","ritmo","imagem","pergunta","silencio"];
    const TONS  = ["sereno","urgente","contemplativo","jocoso","profético"];
    const HOUSEHOLD = ["janela","copo","cadeira","mesa","porta","lâmpada","pão","toalha","espelho","colher"];
  
    // ---- DOM
    const el = (id) => document.getElementById(id);
    const briefMedium = el("briefMedium");
    const briefTheme  = el("briefTheme");
    const briefTwist  = el("briefTwist");
    const briefFocus  = el("briefFocus");
    const briefTone   = el("briefTone");
    const listConstraints = el("constraintList");
    const checks = el("checks");
    const ideaBox = el("ideaBox");
    const scoreEl = el("score");
    const highScoreEl = el("highScore");
    const timerText = el("timerText");
    const timerPath = document.querySelector("#timerPath");
  
    // ---- Config
    const cfg = {
      difficulty: el("cfgDifficulty"),
      chaos: el("cfgChaos"),
      seconds: el("cfgSeconds"),
      focusPref: el("cfgFocusPref"),
      bible: el("cfgBible"),
      smart: el("cfgSmart"),
    };
  
    // ---- State
    let state = {
      pack: null,
      constraints: [],
      running: false,
      endsAt: 0,
      tickId: 0,
      score: 0,
      hi: Number(localStorage.getItem("ch_hi") || 0),
      lastFails: [],
      seed: Math.random(),
    };
    highScoreEl.textContent = state.hi;
  
    // ---- Utils
    const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const sample = (arr) => arr[r(0, arr.length - 1)];
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  
    function weightedPick(items, prefer) {
      if (!prefer || prefer === "auto") return sample(items);
      // bias toward preferred item when present in list
      const bias = items.map(it => it === prefer ? 3 : 1);
      const sum = bias.reduce((a,b)=>a+b,0);
      let t = Math.random() * sum;
      for (let i=0;i<items.length;i++){
        t -= bias[i];
        if (t <= 0) return items[i];
      }
      return sample(items);
    }
  
    // ---- Presets (quatro ideias criativas)
    const PRESETS = {
      "filha-fogo": {
        theme: "Filha & Fogo (Romanos 8, herança e liberdade)",
        palette: ["#ffd28a","#ff62a8","#ffc27a"],
        focusBias: "voz",
        tone: "profético",
        sonic: [261.63, 329.63, 392.00, 523.25], // C arpeggio
        extraConstraint: "fechar com uma benção curta"
      },
      "silencio-cidade": {
        theme: "Silêncio & Cidade Invisível (janelas abertas, ar cítrico)",
        palette: ["#a4c9ff","#c2b7ff","#b0ffe3"],
        focusBias: "silencio",
        tone: "contemplativo",
        sonic: [220.00, 277.18, 329.63, 415.30], // A minor-ish
        extraConstraint: "conter um momento de silêncio (…) "
      },
      "ritmo-mar": {
        theme: "Ritmo & Mar do Nordeste (samba gospel + vento)",
        palette: ["#7be0ff","#79ffcf","#a2b6ff"],
        focusBias: "ritmo",
        tone: "sereno",
        sonic: [196.00, 246.94, 329.63, 392.00], // G-ish
        extraConstraint: "usar aliteração em 1 parte"
      },
      "codigo-cura": {
        theme: "Código & Cura (psicanálise + tecnologia com coração)",
        palette: ["#9bffb1","#ffe58d","#b19bff"],
        focusBias: "imagem",
        tone: "sereno",
        sonic: [233.08, 293.66, 349.23, 466.16], // Bb color
        extraConstraint: "misturar linguagem técnica e poética"
      }
    };
  
    // ---- Background theme swap
    function applyThemePreset(key){
      document.body.classList.remove("theme-filha-fogo","theme-silencio-cidade","theme-ritmo-mar","theme-codigo-cura");
      const cls = {
        "filha-fogo":"theme-filha-fogo",
        "silencio-cidade":"theme-silencio-cidade",
        "ritmo-mar":"theme-ritmo-mar",
        "codigo-cura":"theme-codigo-cura",
      }[key];
      if (cls) document.body.classList.add(cls);
      // shift sigils positions a bit (alchemy vibe)
      document.querySelectorAll(".sigil").forEach((s,i)=>{
        s.style.setProperty("--x", `${20 + (i*18)%50}%`);
        s.style.setProperty("--y", `${20 + (i*23)%60}%`);
        s.style.setProperty("--s", 0.8 + i*0.15);
      });
    }
  
    // ---- Pack generation
    function generatePack(presetKey=null){
      const chaos = Number(cfg.chaos.value)/100;
      const medium = sample(MEDIUMS);
      const theme  = presetKey ? PRESETS[presetKey].theme : sample(THEMES);
      const tone   = weightedPick(TONS, presetKey ? PRESETS[presetKey].tone : null);
      const focus  = weightedPick(FOCOS, (cfg.focusPref.value!=="auto" ? cfg.focusPref.value : (presetKey ? PRESETS[presetKey].focusBias:null)));
      const twist  = sample(TWISTS);
  
      // smart bias: if we failed some constraint last round, try including it again
      let bonusTwist = null;
      if (cfg.smart.checked && state.lastFails.length){
        bonusTwist = sample(state.lastFails);
      } else if (presetKey) {
        bonusTwist = PRESETS[presetKey].extraConstraint;
      }
  
      const pack = {
        medium, theme, twist, focus, tone,
        bonus: bonusTwist
      };
  
      // choose constraints set
      const base = [
        "bilíngue (pt + en)",
        "menciona objeto doméstico",
        "uma linha com 7 palavras exatas",
        "inclui '…' (silêncio)",
        "benção final curtíssima",
      ];
      const extra = [
        "aliteração (ex.: mar manso move manhã)",
        "metáfora culinária",
        "glitch proposital (escreva um err0 intencional)",
        "um mapa com palavras (NORTE, LESTE…)",
      ];
  
      const pool = shuffle([...base, ...extra]);
      const count = {easy:2, normal:3, hard:4, prophet:5}[cfg.difficulty.value] || 3;
      let chosen = pool.slice(0, count);
  
      // add bias from pack bonus if not already
      if (pack.bonus && !chosen.includes(mapBonusToConstraint(pack.bonus))) {
        chosen.pop(); chosen.push(mapBonusToConstraint(pack.bonus));
      }
  
      // chaos nudges
      if (Math.random()<chaos) chosen = shuffle(chosen);
  
      state.pack = pack;
      state.constraints = chosen;
      updateUI();
    }
  
    function mapBonusToConstraint(b){
      if (!b) return "benção final curtíssima";
      if (b.includes("silêncio")) return "inclui '…' (silêncio)";
      if (b.includes("bilíngue")) return "bilíngue (pt + en)";
      if (b.includes("aliteração")) return "aliteração (ex.: mar manso move manhã)";
      if (b.includes("técnica e poética")) return "glitch proposital (escreva um err0 intencional)";
      return "benção final curtíssima";
    }
  
    // ---- UI sync
    function updateUI(){
      if (!state.pack) return;
      briefMedium.textContent = state.pack.medium;
      briefTheme.textContent  = state.pack.theme;
      briefTwist.textContent  = state.pack.twist + (state.pack.bonus ? ` + ${state.pack.bonus}` : "");
      briefFocus.textContent  = state.pack.focus;
      briefTone.textContent   = state.pack.tone;
  
      listConstraints.innerHTML = "";
      state.constraints.forEach(c=>{
        const li = document.createElement("li");
        li.textContent = c;
        listConstraints.appendChild(li);
      });
  
      checks.innerHTML = "";
      scoreEl.textContent = String(state.score);
      highScoreEl.textContent = String(state.hi);
    }
  
    // ---- Timer
    function startRound(){
      if (!state.pack) generatePack();
      const secs = Math.max(10, Math.min(180, Number(cfg.seconds.value)||30));
      state.running = true;
      state.endsAt = performance.now() + secs*1000;
      tick();
    }
  
    function tick(){
      if (!state.running) return;
      const now = performance.now();
      const left = Math.max(0, state.endsAt - now);
      const secs = Math.ceil(left/1000);
      timerText.textContent = `00:${String(secs).padStart(2,"0")}`;
  
      const pct = (left / (Number(cfg.seconds.value)*1000));
      timerPath.setAttribute("stroke-dasharray", `${Math.max(0, pct*100)} 100`);
  
      if (left <= 0){
        state.running = false;
        feedback(false, "⏳ Tempo esgotado! Tenta de novo (chaos +5).");
        cfg.chaos.value = String(Math.min(100, Number(cfg.chaos.value)+5));
        return;
      }
      state.tickId = requestAnimationFrame(tick);
    }
  
    // ---- Validation (inteligente)
    function validateIdea(text){
      const lines = text.trim().split(/\n+/).map(s=>s.trim()).filter(Boolean);
      const res = [];
  
      function ok(msg){ res.push({ok:true, msg}); }
      function bad(msg){ res.push({ok:false, msg}); }
  
      const hasEn = /[A-Za-z]{3,}/.test(text);
      const hasPt = /[áéíóúâêôãõç]|[^\x00-\x7F]/.test(text) || /\b(eu|você|paz|Deus|amor)\b/i.test(text);
      const hasSilence = /…/.test(text);
      const hasBless = /(amém|shalom|a paz|que assim seja)\b/i.test(text);
      const hasHouse = HOUSEHOLD.some(w=> new RegExp(`\\b${w}\\b`, "i").test(text));
      const sevenWordLine = lines.some(ln => ln.split(/\s+/).filter(Boolean).length === 7);
      const hasAlliteration = /(^|\s)([bcdfghjklmnpqrstvwxyzç])\w*(\s+\2\w*){2,}/i.test(text); // rough
      const hasCulinary = /(pão|sal|açúcar|fermento|forno|panela|tempero|caldo|sopa|salmão)/i.test(text);
      const hasGlitch = /(err0|gl1tch|###|@@@@)/i.test(text);
      const hasMap = /(NORTE|SUL|LESTE|OESTE)/.test(text);
  
      const need = new Set(state.constraints);
      const fails = [];
  
      function requireCheck(flag, label, good, badMsg){
        if (need.has(label)){
          if (flag) ok(`✓ ${good}`); else { bad(`✗ ${badMsg}`); fails.push(label); }
        }
      }
  
      requireCheck(hasEn && hasPt, "bilíngue (pt + en)", "Tem PT + EN", "Falta bilíngue (escreve algo em inglês também)");
      requireCheck(hasHouse, "menciona objeto doméstico", "Tem objeto doméstico", "Menciona um objeto doméstico (ex.: janela, copo)");
      requireCheck(sevenWordLine, "uma linha com 7 palavras exatas", "Linha com 7 palavras OK", "Cria uma linha com exatamente 7 palavras");
      requireCheck(hasSilence, "inclui '…' (silêncio)", "Contém silêncio (…)", "Inclui reticências especiais … para marcar silêncio");
      requireCheck(hasBless, "benção final curtíssima", "Benção final detectada", "Fecha com benção curtíssima (ex.: Shalom.)");
      requireCheck(hasAlliteration, "aliteração (ex.: mar manso move manhã)", "Aliteração presente", "Faz aliteração (mesma inicial repetida)");
      requireCheck(hasCulinary, "metáfora culinária", "Toque culinário presente", "Inclui metáfora culinária (pão, sal, forno…)");
      requireCheck(hasGlitch, "glitch proposital (escreva um err0 intencional)", "Glitch artificial OK", "Insere err0/gl1tch/@@@@ como falha intencional");
      requireCheck(hasMap, "um mapa com palavras (NORTE, LESTE…)", "Mapa verbal detectado", "Inclui NORTE/LESTE/SUL/OESTE em caixa alta");
  
      return { res, fails };
    }
  
    function renderChecks(items){
      checks.innerHTML = "";
      items.forEach(it=>{
        const div = document.createElement("div");
        div.className = it.ok ? "ok" : "bad";
        div.textContent = it.msg;
        checks.appendChild(div);
      });
    }
  
    // ---- Scoring + Feedback
    function submitIdea(){
      const t = ideaBox.value.trim();
      if (!t){ feedback(false, "Escreve algo antes de submeter ✍️"); return; }
  
      const {res, fails} = validateIdea(t);
      renderChecks(res);
  
      // score: +10 per success, +bonus if all
      const okCount = res.filter(x=>x.ok).length;
      const needed = state.constraints.length;
      const pts = okCount * 10 + (okCount===needed ? 15 : 0);
      state.score += pts;
      scoreEl.textContent = String(state.score);
  
      // smart remember fails
      state.lastFails = fails;
  
      if (state.score > state.hi){
        state.hi = state.score;
        localStorage.setItem("ch_hi", String(state.hi));
        highScoreEl.textContent = String(state.hi);
      }
  
      const doneAll = okCount===needed;
      feedback(doneAll, doneAll ? "🔥 Perfeito alquímico — todos desafios cumpridos!" : `+${pts} pontos • ${okCount}/${needed} desafios`);
      if (doneAll) state.running = false;
    }
  
    function feedback(good, msg){
      const div = document.createElement("div");
      div.className = good ? "ok" : "bad";
      div.textContent = msg;
      checks.prepend(div);
    }
  
    // ---- Audio tone (WebAudio arpeggio)
    let audioCtx = null;
    function tone(presetKey="ritmo-mar"){
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = audioCtx;
        const notes = (PRESETS[presetKey]?.sonic) || [261.63,329.63,392.00,523.25];
        let t = ctx.currentTime;
        notes.forEach((f,i)=>{
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.16, t+0.05);
          g.gain.exponentialRampToValueAtTime(0.0001, t+0.35);
          o.connect(g).connect(ctx.destination);
          o.start(t);
          o.stop(t+0.36);
          t += 0.10 + i*0.02;
        });
      } catch(e) {}
    }
  
    // ---- Export
    function exportJSON(){
      const data = {
        when: new Date().toISOString(),
        pack: state.pack,
        constraints: state.constraints,
        settings: {
          difficulty: cfg.difficulty.value,
          chaos: Number(cfg.chaos.value),
          seconds: Number(cfg.seconds.value),
          focusPref: cfg.focusPref.value,
          bible: cfg.bible.checked,
          smart: cfg.smart.checked
        },
        score: state.score
      };
      const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `alchemy-run-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  
    // ---- Events
    document.getElementById("btnRoll").addEventListener("click", ()=>{
      generatePack();
      tone();
    });
    document.getElementById("btnStart").addEventListener("click", ()=>{
      state.score = 0; scoreEl.textContent = "0";
      generatePack();
      startRound();
      tone();
    });
    document.getElementById("btnSubmit").addEventListener("click", submitIdea);
    document.getElementById("btnClear").addEventListener("click", ()=>{ ideaBox.value=""; checks.innerHTML=""; });
    document.getElementById("btnExport").addEventListener("click", exportJSON);
    document.getElementById("btnTone").addEventListener("click", ()=> tone());
  
    // Preset chips
    document.querySelectorAll(".chip").forEach(ch=>{
      ch.addEventListener("click", ()=>{
        const key = ch.dataset.preset;
        applyThemePreset(key);
        generatePack(key);
        tone(key);
      });
    });
  
    // Persist some config
    const saved = JSON.parse(localStorage.getItem("ch_cfg") || "{}");
    ["difficulty","chaos","seconds","focusPref","bible","smart"].forEach(k=>{
      if (saved[k]!==undefined){
        if (cfg[k].type==="checkbox") cfg[k].checked = !!saved[k];
        else cfg[k].value = String(saved[k]);
      }
      cfg[k].addEventListener("input", ()=>{
        const current = JSON.parse(localStorage.getItem("ch_cfg") || "{}");
        current[k] = (cfg[k].type==="checkbox") ? cfg[k].checked : cfg[k].value;
        localStorage.setItem("ch_cfg", JSON.stringify(current));
      });
    });
  
    // Boot
    applyThemePreset("ritmo-mar");
    generatePack("ritmo-mar");
  
  })();
  