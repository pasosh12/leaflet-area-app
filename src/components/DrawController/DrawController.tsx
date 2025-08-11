import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';

type AreaCoordinates = number[][];

type DrawControllerProps = {
  onAreaSelected: (coords: AreaCoordinates) => void;
};

export const DrawController: React.FC<DrawControllerProps> = ({ onAreaSelected }) => {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);

  useEffect(() => {
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

export default DrawController;
