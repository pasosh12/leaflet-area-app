import React, { useMemo, useRef, useState } from 'react';
import './App.css';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import ReactModal from 'react-modal';

type AreaCoordinates = number[][]; // [ [lat, lng], ... ]

type DrawControllerProps = {
  onAreaSelected: (coords: AreaCoordinates) => void;
};

const DrawController: React.FC<DrawControllerProps> = ({ onAreaSelected }) => {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  // Use useRef to store the draw control instance
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  React.useEffect(() => {
    // Only initialize if not already initialized
    if (!drawControlRef.current) {
      // Create a feature group to store drawn items
      drawnItemsRef.current = new L.FeatureGroup();
      map.addLayer(drawnItemsRef.current);
      
      // Initialize draw control with only rectangle enabled
      drawControlRef.current = new L.Control.Draw({
        position: 'topleft',
        draw: {
          polygon: false,
          rectangle: {
            shapeOptions: {
              color: '#3388ff',
              weight: 4,
              opacity: 0.5,
              fillOpacity: 0.2
            }
          },
          circle: false,
          marker: false,
          circlemarker: false,
          polyline: false
        }
      });
      
      // Add the control to the map
      map.addControl(drawControlRef.current);
    }
    
    const onCreated = (e: any) => {
      const layer = e.layer as L.Rectangle;
      
      // Clear existing layers before adding new one
      if (drawnItemsRef.current) {
        drawnItemsRef.current.clearLayers();
        drawnItemsRef.current.addLayer(layer);
      }

      try {
        const bounds = layer.getBounds();
        const nw = bounds.getNorthWest();
        const ne = bounds.getNorthEast();
        const se = bounds.getSouthEast();
        const sw = bounds.getSouthWest();
        
        const coordinates: AreaCoordinates = [
          [nw.lat, nw.lng],
          [ne.lat, ne.lng],
          [se.lat, se.lng],
          [sw.lat, sw.lng],
          [nw.lat, nw.lng] // Close the polygon
        ];
        
        console.log('Rectangle coordinates:', coordinates);
        onAreaSelected(coordinates);
      } catch (error) {
        console.error('Error processing drawn shape:', error);
      }
    };

    // Add event listener
    map.on('draw:created', onCreated);

    // Cleanup function
    return () => {
      map.off('draw:created', onCreated);
      
      // Clean up draw control if it exists
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
      
      // Remove drawn items
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current);
        drawnItemsRef.current = null;
      }
    };
  }, [map, onAreaSelected]);

  return null;
};

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
        contentLabel="Выделенная область"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Координаты выделенной области</h2>
        {coords.length === 0 ? (
          <p>Нет данных</p>
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
          <button onClick={() => setModalOpen(false)}>Закрыть</button>
        </div>
      </ReactModal>
    </div>
  )
}

export default App;