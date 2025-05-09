import { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useBBox } from "../../context/BBoxContext";

const Panel = styled.div`
  position: absolute;
  top: 0;
  right: 100%;
  width: 400px;
  height: 100%;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 12px 0px 0px 12px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
  z-index: 1500;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  @media (max-width: 1024px) {
    width: 320px;
  }

  @media (max-width: 768px) {
    width: 80vw;
    border-radius: 0px;
    right: 0;
  }

  @media (max-width: 480px) {
    width: 100vw;
    height: 100vh;
    padding-top: 2rem;
    border-radius: 0px;
    right: 0;
  }
`;

const Title = styled.h3`
  margin-bottom: 1rem;
  text-align: center;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 25px;
  height: 36px;
  font-size: 16px;
  background-color: #fe5000;
  color: #ffffff;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.2s ease, transform 0.15s ease;
  margin-bottom: 0.5rem;

  &:hover {
    background-color: #e24600;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

interface Props {
  onClose: () => void;
}

export default function OverlayManualPanel({ onClose }: Props) {
  const {
    setImagemProcessada,
    setMostrarProcessada,
  } = useBBox();

  const [arquivos, setArquivos] = useState<string[]>([]);
  const [tifSelecionado, setTifSelecionado] = useState("");
  const [bbox, setBbox] = useState("");
  const [pngUrl, setPngUrl] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/processed-list/")
      .then((res) => {
        setArquivos(res.data.arquivos || []);
      })
      .catch((err) => {
        console.error("Erro ao buscar arquivos processados:", err);
      });
  }, []);

  useEffect(() => {
    if (tifSelecionado) {
      axios
        .get("http://localhost:8000/bbox-from-tif/", {
          params: { filename: tifSelecionado },
        })
        .then((res) => {
          const b = res.data.bbox;
          if (b) {
            setBbox(`${b[0]},${b[1]},${b[2]},${b[3]}`);
            setPngUrl(`http://localhost:8000/output/${tifSelecionado.replace("_classes.tif", "_rgb.png")}`);
          }
        })
        .catch((err) => {
          console.error("Erro ao buscar BBOX:", err);
        });
    }
  }, [tifSelecionado]);

  const handleMostrar = () => {
    const coords = bbox.split(",").map(Number);
    if (coords.length !== 4 || coords.some(isNaN)) {
      alert("BBOX inválido.");
      return;
    }

    setImagemProcessada({
      id: tifSelecionado,
      thumbnail: pngUrl,
      bbox: coords,
    });

    setMostrarProcessada(true);
  };

  const handleOcultar = () => {
    setMostrarProcessada(false);
  };

  return (
    <Panel>
      <Title>Overlay Manual</Title>

      <Select value={tifSelecionado} onChange={(e) => setTifSelecionado(e.target.value)}>
        <option value="">Selecione um arquivo TIF</option>
        {arquivos.map((file) => (
          <option key={file} value={file}>
            {file}
          </option>
        ))}
      </Select>

      <Input
        type="text"
        placeholder="URL da imagem RGB"
        value={pngUrl}
        onChange={(e) => setPngUrl(e.target.value)}
      />

      <Input
        type="text"
        placeholder="BBOX: lon_min,lat_min,lon_max,lat_max"
        value={bbox}
        onChange={(e) => setBbox(e.target.value)}
      />

      <Button onClick={handleMostrar}>Mostrar Overlay</Button>
      <Button onClick={handleOcultar}>Ocultar Overlay</Button>
      <Button onClick={onClose}>Voltar</Button>
    </Panel>
  );
}
