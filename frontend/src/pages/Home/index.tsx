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
  const { polygonPoints, setPolygonPoints, imagemSelecionada } = useBBox();

  const [mostrarImagem, setMostrarImagem] = useState(true);

  const handleMapClick = (coords: [number, number]) => {
    setPolygonPoints((prev) => {
      if (prev.length >= 4) return prev;
      return [...prev, coords];
    });
  };

  const clearPolygon = () => {
    setPolygonPoints([]);
  };

  // Sempre mostrar a nova imagem quando for selecionada
  useEffect(() => {
    if (imagemSelecionada) {
      setMostrarImagem(true);
    }
  }, [imagemSelecionada]);

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
              color: "blue",       // Cor da borda
              weight: 2,              // Espessura da linha
              opacity: 0.2,           // Transparência da borda
              fillColor: "blue",   // Cor de preenchimento
              fillOpacity: 0.2        // Transparência do preenchimento
            }}
            />
          )}

          {imagemSelecionada && imagemSelecionada.bbox && mostrarImagem && (
            <ImageOverlay
              url={imagemSelecionada.thumbnail}
              bounds={[
                [imagemSelecionada.bbox[1], imagemSelecionada.bbox[0]],
                [imagemSelecionada.bbox[3], imagemSelecionada.bbox[2]],
              ]}
              opacity={0.8}
            />
          )}
        </MapContainer>

        {imagemSelecionada && imagemSelecionada.bbox && (
          <ClearButton
            style={{ bottom: "4rem", left: "1rem" }}
            onClick={() => setMostrarImagem((prev) => !prev)}
          >
            {mostrarImagem ? "Ocultar Imagem" : "Mostrar Imagem"}
          </ClearButton>
        )}

        {polygonPoints.length > 0 && (
          <ClearButton style={{ bottom: "1rem", left: "1rem" }} onClick={clearPolygon}>
            Limpar Polígono
          </ClearButton>
        )}
      </MapWrapper>
    </PageContainer>
  );
}
