import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
// App.css is no longer needed as we've moved styles to a dedicated styles directory
// and they are imported in the styles/index.ts file, which App.tsx imports

createRoot(document.getElementById("root")!).render(<App />);
