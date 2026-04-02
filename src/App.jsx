import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar, { MobileNav } from './components/Sidebar';
import Overview from './pages/Overview';
import Arbitrage from './pages/Arbitrage';
import Leaderboard from './pages/Leaderboard';
import Charts from './pages/Charts';
import Payments from './pages/Payments';
import Outliers from './pages/Outliers';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 max-w-6xl">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/arbitrage" element={<Arbitrage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/outliers" element={<Outliers />} />
          </Routes>
        </main>
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}
