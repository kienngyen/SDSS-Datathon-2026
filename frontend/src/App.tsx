import React from 'react'
import './App.css'
import MapContainer from './components/MapContainer'

function App() {
  return (
    <>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-white">
          Airline Tickets – US Flight Map
        </h1>
        <MapContainer />
      </div>
    </>
  )
}

export default App
