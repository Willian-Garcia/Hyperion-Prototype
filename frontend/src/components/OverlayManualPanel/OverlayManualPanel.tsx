import { useEffect, useState } from "react";
import axios from "axios";
import { useBBox } from "../../context/BBoxContext";
import { Button, Input, Panel, Select, Title } from "./styles";

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
