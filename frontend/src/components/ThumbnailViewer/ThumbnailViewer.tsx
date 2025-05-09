import styled from "styled-components";
import { useBBox } from "../../context/BBoxContext";

const Panel = styled.div`
  position: absolute;
  top: 0;
  right: 100%;
  width: 400px;
  max-height: 100%;
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
  margin-top: 0.5rem;
  margin-bottom: 0;
  color: #333;
  text-align: center;
`;

const ImageCountText = styled.p`
  font-size: 14px;
  color: #555;
  margin-top: 0px;
  margin-bottom: 0px;
  text-align: center;
`;

const ScrollContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
`;

const ThumbnailCard = styled.div<{ selected: boolean }>`
  width: 100%;
  background-color: #d9d9d9;
  border-radius: 12px;
  padding: 1rem;
  border: ${({ selected }) => (selected ? "3px solid #fe5000" : "none")};
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 75%;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.75rem;
`;

const InfoText = styled.p`
  margin: 4px 0;
  font-size: 12px;
  color: #333;
  text-align: center;
`;

const SelectButton = styled.button`
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

  &:hover {
    background-color: #e24600;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ButtonVoltar = styled(SelectButton)`
  margin-top: 2rem;
`;

interface ThumbnailViewerProps {
  imagens: {
    id: string;
    thumbnail: string;
    colecao?: string;
    bbox?: number[];
    data?: string;
    bandas?: {
      BAND15?: string;
      BAND16?: string;
    };
  }[];
  onClose: () => void;
}

export default function ThumbnailViewer({ imagens, onClose }: ThumbnailViewerProps) {
  const {
    imagemThumbnail,
    setImagemThumbnail,
    setMostrarThumbnail,
    setImagemProcessada,
    setMostrarProcessada,
  } = useBBox();

  const formatarData = (dataISO?: string) => {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const handleSelecionarImagem = (img: {
    id: string;
    thumbnail: string;
    bbox?: number[];
  }) => {
    if (img.bbox) {
      setImagemThumbnail({
        id: img.id,
        thumbnail: img.thumbnail,
        bbox: img.bbox,
      });
      setMostrarThumbnail(true);
    } else {
      alert("Imagem sem BBOX disponível para visualização.");
    }
  };

  const handleProcessarImagem = async (img: {
    id: string;
    thumbnail: string;
    bbox?: number[];
    bandas?: { [key: string]: string };
  }) => {
    if (!img.bbox || !img.bandas?.BAND15 || !img.bandas?.BAND16) {
      alert("Imagem selecionada não possui BBOX ou bandas necessárias.");
      return;
    }

    const payload = {
      id: img.id,
      band15_url: img.bandas.BAND15,
      band16_url: img.bandas.BAND16,
      bbox: img.bbox,
    };

    try {
      const response = await fetch("http://localhost:8000/processar-imagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro no processamento da imagem.");

      const resultado = await response.json();
      const imagemProcessadaUrl = `http://localhost:8000${resultado.preview_png}`;
      const bboxFinal = resultado.bbox_real ?? resultado.bbox;

      setImagemProcessada({
        id: img.id,
        thumbnail: imagemProcessadaUrl,
        bbox: bboxFinal,
      });

      setMostrarProcessada(true);
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      alert("Erro ao processar imagem.");
    }
  };

  return (
    <Panel>
      <ScrollContainer>
        <Title>Resultados da Busca</Title>
        <ImageCountText>{imagens.length} imagens foram encontradas</ImageCountText>
        {imagens.map((img) => {
          const isSelected = imagemThumbnail?.id === img.id;

          return (
            <ThumbnailCard key={img.id} selected={isSelected}>
              <ThumbnailImage src={img.thumbnail} alt={img.id} />
              <InfoText><strong>Id:</strong> {img.id}</InfoText>
              <InfoText><strong>BBOX:</strong> {img.bbox?.join(", ")}</InfoText>
              <InfoText><strong>Data:</strong> {formatarData(img.data)}</InfoText>

              <SelectButton onClick={() => handleSelecionarImagem(img)}>
                Selecionar
              </SelectButton>

              {isSelected && (
                <SelectButton onClick={() => handleProcessarImagem(img)}>Processar Imagem</SelectButton>
              )}
            </ThumbnailCard>
          );
        })}
        <ButtonVoltar onClick={onClose}>Voltar para Filtros</ButtonVoltar>
      </ScrollContainer>
    </Panel>
  );
}
