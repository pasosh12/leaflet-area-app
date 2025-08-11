import React, { useMemo, useState } from 'react';
import './App.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import ReactModal from 'react-modal';
import { DrawController } from './components/DrawController/DrawController';

type AreaCoordinates = number[][]; // [ [lat, lng], ... ]

const App: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [coords, setCoords] = useState<AreaCoordinates>([]);

  const center = useMemo<[number, number]>(() => [55.751244, 37.618423], []); // Moscow as default center
  const zoom = 10;

  return (
    <div className="App">
      <h1>Leaflet Area Selector</h1>
      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={zoom}
          className="map-container"
          boxZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DrawController onAreaSelected={(c) => { setCoords(c); setModalOpen(true); }} />
        </MapContainer>
      </div>

      <ReactModal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Coordinates of selected area"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Coordinates of selected area</h2>
        {coords.length === 0 ? (
          <p>No data</p>
        ) : (
          <div className="coords-list">
            {coords.map(([lat, lng], idx) => (
              <div key={idx} className="coord-row">
                <span className="coord-index">{idx + 1}.</span>
                <span className="coord-value">lat: {lat.toFixed(6)}</span>
                <span className="coord-value">lng: {lng.toFixed(6)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <button onClick={() => setModalOpen(false)}>Close</button>
        </div>
      </ReactModal>
    </div>
  )
}

export default App;