const API = 'http://127.0.0.1:8000'

const $ = id => document.getElementById(id)

function show(id) { $(id).style.display = 'block' }
function hide(id) { $(id).style.display = 'none'  }

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
    const r = await fetch(`${API}/api/health`)
    const ok = r.ok
    $('statusDot').className  = ok ? 'dot' : 'dot offline'
    $('statusText').textContent = ok ? 'API Online' : 'API Offline'
    $('statusText').style.color = ok ? '#00C896' : '#FF3B3B'
    return ok
  } catch {
    $('statusDot').className  = 'dot offline'
    $('statusText').textContent = 'API Offline'
    $('statusText').style.color = '#FF3B3B'
    return false
  }
}

function renderVerdict(result) {
  const isPhishing = result.verdict === 'Phishing'

  hide('loadingState')
  hide('errorState')
  show('verdictState')

  // Card
  $('verdictCard').className = `verdict-card ${isPhishing ? 'phishing' : 'safe'}`

  // Emoji and text
  $('verdictEmoji').textContent = isPhishing ? '🚨' : '✅'
  $('verdictText').textContent  = isPhishing ? 'PHISHING DETECTED' : 'SAFE'
  $('verdictText').className    = `verdict-text ${isPhishing ? 'phishing' : 'safe'}`

  // Threat badge
  const threat = getThreatLevel(result.hybrid_score)
  $('threatBadge').textContent = `${threat.label} Risk`
  $('threatBadge').className   = `threat-badge ${threat.cls}`

  // Score bars — animate
  setTimeout(() => {
    const h  = Math.round(result.hybrid_score    * 100)
    const m  = Math.round(result.ml_score        * 100)
    const hr = Math.round(result.heuristic_score * 100)

    $('hybridBar').style.width       = `${h}%`
    $('hybridBar').style.background  = getBarColor(result.hybrid_score)
    $('hybridPct').textContent       = `${h}%`
    $('hybridPct').style.color       = getBarColor(result.hybrid_score)

    $('mlBar').style.width  = `${m}%`
    $('mlPct').textContent  = `${m}%`

    $('hBar').style.width  = `${hr}%`
    $('hPct').textContent  = `${hr}%`
  }, 150)

  // Flags
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

  // Time
  const t = result.scanned_at || result.checkedAt
  if (t) {
    $('scanMeta').textContent =
      new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

function renderError(msg) {
  hide('loadingState')
  hide('verdictState')
  show('errorState')
  $('errorMsg').textContent = msg
}

async function init() {
  checkHealth()

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

  chrome.runtime.sendMessage({ type: 'GET_RESULT', tabId: tab.id }, cached => {
    if (cached) { renderVerdict(cached); return }

    chrome.runtime.sendMessage({ type: 'CHECK_URL', url }, res => {
      if (res?.success && res.result) {
        renderVerdict(res.result)
      } else {
        renderError(
          'Could not connect to GwinShield API.\n' +
          'Make sure uvicorn is running on port 8000.'
        )
      }
    })
  })

  $('retryBtn').addEventListener('click', () => {
    hide('errorState')
    show('loadingState')
    chrome.runtime.sendMessage({ type: 'CHECK_URL', url }, res => {
      if (res?.success && res.result) renderVerdict(res.result)
      else renderError('Still could not connect. Is the API running?')
    })
  })
}

document.addEventListener('DOMContentLoaded', init)