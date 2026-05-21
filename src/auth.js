const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks.readonly',
].join(' ')

let tokenClient = null
let accessToken = null

export function initGoogleAuth() {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            accessToken = response.access_token
            localStorage.setItem('gAccessToken', response.access_token)
            localStorage.setItem('gTokenExpiry', Date.now() + (response.expires_in * 1000))
          }
        },
      })
      resolve()
    }
    document.head.appendChild(script)
  })
}

export function requestAccessToken() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) { reject('Auth not initialized'); return }
    tokenClient.callback = (response) => {
      if (response.error) { reject(response.error); return }
      accessToken = response.access_token
      localStorage.setItem('gAccessToken', response.access_token)
      localStorage.setItem('gTokenExpiry', Date.now() + (response.expires_in * 1000))
      resolve(response.access_token)
    }
    tokenClient.requestAccessToken({ prompt: '' })
  })
}

export function getStoredToken() {
  const token = localStorage.getItem('gAccessToken')
  const expiry = localStorage.getItem('gTokenExpiry')
  if (token && expiry && Date.now() < parseInt(expiry)) {
    accessToken = token
    return token
  }
  return null
}

export function getAccessToken() {
  return accessToken || getStoredToken()
}

export function signOut() {
  if (accessToken) {
    window.google?.accounts.oauth2.revoke(accessToken)
  }
  accessToken = null
  localStorage.removeItem('gAccessToken')
  localStorage.removeItem('gTokenExpiry')
}
