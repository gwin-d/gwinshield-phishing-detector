// ── GwinShield Background Service Worker ─────────────────────────
// Intercepts every URL navigation and checks it against the API

const API_URL = 'http://127.0.0.1:8000/api/check-url'

// Cache to avoid checking the same URL repeatedly
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// URLs to skip checking (browser internals, local pages)
const SKIP_PATTERNS = [
  'chrome://',
  'chrome-extension://',
  'moz-extension://',
  'edge://',
  'about:',
  'file://',
  'localhost',
  '127.0.0.1',
  'extension',
]

function shouldSkip(url) {
  return SKIP_PATTERNS.some(pattern => url.startsWith(pattern) || url.includes(pattern))
}

function getCached(url) {
  const entry = cache.get(url)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(url)
    return null
  }
  return entry.result
}

function setCache(url, result) {
  cache.set(url, { result, timestamp: Date.now() })
  // Keep cache small — max 100 entries
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
}

async function checkURL(url) {
  // Check cache first
  const cached = getCached(url)
  if (cached) return cached

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, source: 'extension' }),
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const result = await response.json()
    setCache(url, result)
    return result

  } catch (error) {
    console.error('GwinShield API error:', error)
    return null
  }
}

// ── Listen for navigation events ─────────────────────────────────
chrome.webNavigation.onCompleted.addListener(async (details) => {
  // Only check main frame navigations (not iframes)
  if (details.frameId !== 0) return

  const url = details.url
  if (shouldSkip(url)) return

  const result = await checkURL(url)
  if (!result) return

  // Store the result so popup can read it
  chrome.storage.local.set({
    [`result_${details.tabId}`]: {
      ...result,
      checkedAt: new Date().toISOString(),
    }
  })

  // Update extension icon badge
  if (result.verdict === 'Phishing') {
    // Red badge for phishing
    chrome.action.setBadgeText({
      text: '!',
      tabId: details.tabId
    })
    chrome.action.setBadgeBackgroundColor({
      color: '#FF3B3B',
      tabId: details.tabId
    })

    // Show notification for phishing sites
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'GwinShield - Phishing Detected!',
      message: `Warning: ${url} has been identified as a phishing site. Hybrid score: ${Math.round(result.hybrid_score * 100)}%`,
      priority: 2,
    })

  } else {
    // Green badge for safe
    chrome.action.setBadgeText({
      text: 'OK',
      tabId: details.tabId
    })
    chrome.action.setBadgeBackgroundColor({
      color: '#00C896',
      tabId: details.tabId
    })
  }
})

// ── Listen for messages from popup ───────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_URL') {
    checkURL(message.url)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }))
    return true // keep channel open for async response
  }

  if (message.type === 'GET_RESULT') {
    chrome.storage.local.get(`result_${message.tabId}`, (data) => {
      sendResponse(data[`result_${message.tabId}`] || null)
    })
    return true
  }
})

console.log('GwinShield background service worker started.')