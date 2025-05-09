import styled from "styled-components";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Polygon,
  Marker,
  ImageOverlay,
} from "react-leaflet";
import L from "leaflet";
import { useBBox } from "../../context/BBoxContext";
import { useState, useEffect } from "react";

const PageContainer = styled.div`
  height: 92vh;
  width: 96vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #121212;
`;

const MapWrapper = styled.div`
  flex: 1;
  border-radius: 12px;
  margin: 1rem;
  background-color: #ccc;
  position: relative;

  .leaflet-container {
    height: 100%;
    width: 100%;
    border-radius: 12px;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  background-color: #fe5000;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  z-index: 999;

  &:hover {
    background-color: #e24600;
  }
`;

const minimalIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [18, 28],
  iconAnchor: [9, 28],
  popupAnchor: [0, -28],
  shadowUrl: "",
});

function MapClickHandler({
  onClick,
}: {
  onClick: (latlng: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onClick([lat, lng]);
    },
  });
  return null;
}

export default function Home() {
  const {
    polygonPoints,
    setPolygonPoints,
    imagemThumbnail,
    imagemProcessada,
    mostrarThumbnail,
    mostrarProcessada,
    setMostrarThumbnail,
    setMostrarProcessada,
  } = useBBox();

  const handleMapClick = (coords: [number, number]) => {
    setPolygonPoints((prev) => {
      if (prev.length >= 4) return prev;
      return [...prev, coords];
    });
  };

  const clearPolygon = () => {
    setPolygonPoints([]);
  };

  return (
    <PageContainer>
      <MapWrapper>
        <MapContainer center={[-23.55, -46.63]} zoom={8} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleMapClick} />

          {polygonPoints.map((point, index) => (
            <Marker key={index} position={point} icon={minimalIcon} />
          ))}

          {polygonPoints.length > 2 && (
            <Polygon
              positions={polygonPoints}
              pathOptions={{
                color: "blue",
                weight: 2,
                opacity: 0.2,
                fillColor: "blue",
                fillOpacity: 0.2,
              }}
            />
          )}

          {imagemThumbnail && imagemThumbnail.bbox && mostrarThumbnail && (
            <ImageOverlay
              url={imagemThumbnail.thumbnail}
              bounds={[
                [imagemThumbnail.bbox[1], imagemThumbnail.bbox[0]],
                [imagemThumbnail.bbox[3], imagemThumbnail.bbox[2]],
              ]}
              opacity={0.8}
            />
          )}

          {imagemProcessada && imagemProcessada.bbox && mostrarProcessada && (
            <ImageOverlay
              url={imagemProcessada.thumbnail}
              bounds={[
                [imagemProcessada.bbox[1], imagemProcessada.bbox[0]],
                [imagemProcessada.bbox[3], imagemProcessada.bbox[2]],
              ]}
              opacity={0.8}
            />
          )}
        </MapContainer>
        {imagemProcessada && imagemProcessada.bbox && (
          <ClearButton
            style={{ bottom: "6rem", left: "1rem" }}
            onClick={() => setMostrarProcessada((prev) => !prev)}
          >
            {mostrarProcessada ? "Ocultar Processada" : "Mostrar Processada"}
          </ClearButton>
        )}
        {imagemThumbnail && imagemThumbnail.bbox && (
          <ClearButton
            style={{ bottom: "3.5rem", left: "1rem" }}
            onClick={() => setMostrarThumbnail((prev) => !prev)}
          >
            {mostrarThumbnail ? "Ocultar Thumbnail" : "Mostrar Thumbnail"}
          </ClearButton>
        )}
        {polygonPoints.length > 0 && (
          <ClearButton
            style={{ bottom: "1rem", left: "1rem" }}
            onClick={clearPolygon}
          >
            Limpar Polígono
          </ClearButton>
        )}
      </MapWrapper>
    </PageContainer>
  );
}
