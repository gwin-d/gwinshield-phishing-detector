const API = 'http://127.0.0.1:8000'
const $   = id => document.getElementById(id)

function show(id) { $(id).style.display = 'block' }
function hide(id) { $(id).style.display = 'none'  }

function loadTheme() {
  chrome.storage.local.get('theme', data => {
    applyTheme(data.theme || 'dark')
  })
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light')
    $('themeBtn').innerHTML = moonSVG()
  } else {
    document.body.classList.remove('light')
    $('themeBtn').innerHTML = sunSVG()
  }
}

function toggleTheme() {
  const isLight  = document.body.classList.contains('light')
  const newTheme = isLight ? 'dark' : 'light'
  chrome.storage.local.set({ theme: newTheme })
  applyTheme(newTheme)
}

function sunSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
    viewBox="0 0 24 24" fill="none" stroke="#F4A261"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41
      M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>`
}

function moonSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15"
    viewBox="0 0 24 24" fill="none" stroke="#1565C0"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>`
}

function getThreatLevel(score) {
  if (score >= 0.75) return { label: 'Critical', cls: 'threat-critical' }
  if (score >= 0.50) return { label: 'High',     cls: 'threat-high'     }
  if (score >= 0.25) return { label: 'Medium',   cls: 'threat-medium'   }
  return                     { label: 'Low',      cls: 'threat-low'      }
}

function getBarColor(score) {
  if (score >= 0.7) return '#FF3B3B'
  if (score >= 0.4) return '#F4A261'
  return '#00C896'
}

async function checkHealth() {
  try {
    const r  = await fetch(`${API}/api/health`, { signal: AbortSignal.timeout(3000) })
    const ok = r.ok
    $('statusDot').className    = ok ? 'dot' : 'dot offline'
    $('statusText').textContent = ok ? 'Online' : 'Offline'
    return ok
  } catch {
    $('statusDot').className    = 'dot offline'
    $('statusText').textContent = 'Offline'
    return false
  }
}

async function callAPIDirect(url) {
  const response = await fetch(`${API}/api/check-url`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ url, source: 'extension' }),
    signal:  AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  return response.json()
}

function showSkeleton() {
  $('loadingState').style.display = 'block'
  $('loadingState').innerHTML = `
    <div style="padding:16px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
        <div class="skeleton" style="width:50px;height:50px;border-radius:50%"></div>
        <div style="flex:1">
          <div class="skeleton" style="height:12px;width:60%;margin-bottom:8px;border-radius:4px"></div>
          <div class="skeleton" style="height:18px;width:80%;border-radius:4px"></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[1,2,3].map(() => `
          <div style="display:flex;align-items:center;gap:8px">
            <div class="skeleton" style="width:100px;height:10px;border-radius:4px"></div>
            <div class="skeleton" style="flex:1;height:6px;border-radius:3px"></div>
            <div class="skeleton" style="width:28px;height:10px;border-radius:4px"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

function renderVerdict(result) {
  const isPhishing = result.verdict === 'Phishing'

  // ── CRITICAL FIX: hide loading, hide error, show verdict ──
  hide('loadingState')
  hide('errorState')
  show('verdictState')

  $('verdictCard').className    = `verdict-card ${isPhishing ? 'phishing' : 'safe'}`
  $('verdictEmoji').textContent = isPhishing ? '🚨' : '✅'
  $('verdictText').textContent  = isPhishing ? 'PHISHING DETECTED' : 'SAFE'
  $('verdictText').className    = `verdict-text ${isPhishing ? 'phishing' : 'safe'}`

  const threat = getThreatLevel(result.hybrid_score)
  $('threatBadge').textContent = `${threat.label} Risk`
  $('threatBadge').className   = `threat-badge ${threat.cls}`

  setTimeout(() => {
    const h  = Math.round(result.hybrid_score    * 100)
    const m  = Math.round(result.ml_score        * 100)
    const hr = Math.round(result.heuristic_score * 100)

    $('hybridBar').style.width      = `${h}%`
    $('hybridBar').style.background = getBarColor(result.hybrid_score)
    $('hybridPct').textContent      = `${h}%`
    $('hybridPct').style.color      = getBarColor(result.hybrid_score)
    $('mlBar').style.width  = `${m}%`
    $('mlPct').textContent  = `${m}%`
    $('hBar').style.width   = `${hr}%`
    $('hPct').textContent   = `${hr}%`
  }, 150)

  const fw = $('flagsWrap')
  if (result.flags && result.flags.length > 0) {
    fw.innerHTML = `
      <div class="flags-title">
        ⚠ ${result.flags.length} Warning${result.flags.length > 1 ? 's' : ''}
      </div>
      ${result.flags.map(f => `<div class="flag">${f}</div>`).join('')}
    `
  } else {
    fw.innerHTML = `<div class="no-flags">✓ No suspicious indicators detected</div>`
  }

  const t = result.scanned_at || result.checkedAt
  if (t) {
    let d = new Date(t)
    if (d > new Date()) d = new Date(d.getTime() - 60 * 60 * 1000)
    $('scanMeta').textContent = 'Scanned ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

function renderError(msg) {
  hide('loadingState')
  hide('verdictState')
  show('errorState')
  $('errorMsg').textContent = msg
}

async function init() {
  loadTheme()
  checkHealth()
  $('themeBtn').addEventListener('click', toggleTheme)

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab) { renderError('Could not get current tab.'); return }

  const url = tab.url || ''
  $('currentUrl').textContent = url

  const skip = ['chrome://', 'chrome-extension://', 'moz-extension://',
                'edge://', 'about:', 'file://']
  if (skip.some(s => url.startsWith(s))) {
    renderError('Navigate to a website to check it.')
    return
  }

  showSkeleton()

  const backgroundTimeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), 4000)
  )

  const backgroundCheck = new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({ type: 'GET_RESULT', tabId: tab.id }, cached => {
        if (chrome.runtime.lastError) { reject(chrome.runtime.lastError); return }
        if (cached) { resolve(cached); return }
        chrome.runtime.sendMessage({ type: 'CHECK_URL', url }, res => {
          if (chrome.runtime.lastError) { reject(chrome.runtime.lastError); return }
          if (res?.success) resolve(res.result)
          else reject(new Error('failed'))
        })
      })
    } catch (e) { reject(e) }
  })

  try {
    const result = await Promise.race([backgroundCheck, backgroundTimeout])
    renderVerdict(result)
  } catch {
    try {
      const result = await callAPIDirect(url)
      renderVerdict(result)
    } catch {
      renderError(
        'Could not reach GwinShield API.\n' +
        'Make sure uvicorn is running on port 8000.'
      )
    }
  }

  $('retryBtn').addEventListener('click', async () => {
    hide('errorState')
    showSkeleton()
    try {
      const result = await callAPIDirect(url)
      renderVerdict(result)
    } catch {
      renderError('Still could not connect. Is the API running?')
    }
  })
}

document.addEventListener('DOMContentLoaded', init)