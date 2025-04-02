// pages/_app.js
import '../styles/globals.css'
import '../styles/custom.css'  // カスタムCSSをインポート

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp