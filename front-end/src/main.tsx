import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './app/App'
import { registerSW } from 'virtual:pwa-register' // ← react なしに修正

registerSW({
  onNeedRefresh() {
    console.log('新しいバージョンがあります')
  },
  onOfflineReady() {
    console.log('オフラインで使用可能です')
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)