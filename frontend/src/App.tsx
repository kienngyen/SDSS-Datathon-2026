import './App.css'
import MapContainer from './components/MapContainer'

function App() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">
        US Domestic Airfare Explorer
      </h1>
      <p className="text-slate-400 text-sm mb-8">
        Interactive route map — SDSS Datathon 2026
      </p>
      <MapContainer />
    </div>
  )
}

export default App
