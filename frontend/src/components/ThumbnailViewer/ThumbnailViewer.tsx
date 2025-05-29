import { useBBox } from "../../context/BBoxContext";
import { useState, useRef } from "react";
import {
  Panel,
  Title,
  ImageCountText,
  ScrollContainer,
  ThumbnailCard,
  ThumbnailImage,
  InfoText,
  SelectButton,
  ButtonVoltar,
} from "./styles";

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

export default function ThumbnailViewer({
  imagens,
  onClose,
}: ThumbnailViewerProps) {
  const {
    imagemThumbnail,
    setImagemThumbnail,
    setMostrarThumbnail,
    setImagemProcessada,
    setMostrarProcessada,
  } = useBBox();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [tempoEstimado, setTempoEstimado] = useState<number | null>(null);
  const [tempoEstimadoTotal, setTempoEstimadoTotal] = useState<number | null>(null);
  const intervaloTempoRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

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
    if (processingId) return;

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
      setProcessingId(img.id);
      abortControllerRef.current = new AbortController();

      const start = Date.now();
      intervaloTempoRef.current = setInterval(async () => {
        const elapsed = (Date.now() - start) / 1000;
        setTempoEstimado(elapsed);

        try {
          const progressoRes = await fetch(`http://localhost:8000/status-processamento/${img.id}`);
          const progressoData = await progressoRes.json();
          const progresso = progressoData.progresso;

          if (progresso > 0) {
            const estimadoTotal = elapsed / progresso;
            setTempoEstimadoTotal(estimadoTotal);
          } else {
            setTempoEstimadoTotal(null);
          }
        } catch (err) {
          console.error("Erro ao buscar progresso:", err);
        }
      }, 1000);

      fetch("http://localhost:8000/processar-imagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch("http://localhost:8000/processed-list/");
          if (!res.ok) return;

          const data = await res.json();
          const arquivos: string[] = data.arquivos;
          const encontrada = arquivos.find((nome) => nome.includes(img.id));

          if (encontrada) {
            const imagemProcessadaUrl = `http://localhost:8000/output/${encontrada.replace(
              "_classes.tif",
              ".png"
            )}`;

            if (!img.bbox) {
              console.warn("Imagem sem bbox ao definir imagem processada");
              return;
            }

            setImagemProcessada({
              id: img.id,
              thumbnail: imagemProcessadaUrl,
              bbox: img.bbox,
            });

            setMostrarProcessada(true);
            setProcessingId(null);
            setTempoEstimado(null);
            setTempoEstimadoTotal(null);
            clearInterval(pollingRef.current!);
            if (intervaloTempoRef.current)
              clearInterval(intervaloTempoRef.current);
          }
        } catch (err) {
          console.error("Erro durante polling de imagem processada:", err);
        }
      }, 15000);
    } catch (error) {
      console.error("Erro ao iniciar processamento:", error);
      alert("Erro ao processar imagem.");
      setProcessingId(null);
      setTempoEstimado(null);
      setTempoEstimadoTotal(null);
      if (intervaloTempoRef.current) clearInterval(intervaloTempoRef.current);
    }
  };

  const cancelarProcessamentoFrontend = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const cancelarProcessamentoBackend = async (id: string) => {
    try {
      console.log("📡 Enviando POST para /cancelar-processamento?id=" + id);

      const res = await fetch(
        `http://localhost:8000/cancelar-processamento?id=${id}`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        console.warn("⚠️ Backend retornou erro:", msg);
        throw new Error("Falha ao cancelar no backend");
      }

      console.log("✅ Backend confirmou o cancelamento.");
    } catch (err) {
      console.error("❌ Erro ao cancelar no backend:", err);
    }
  };

  const cancelarAmbos = (id: string) => {
    cancelarProcessamentoFrontend();
    cancelarProcessamentoBackend(id);
    setProcessingId(null);
    setTempoEstimado(null);
    setTempoEstimadoTotal(null);

    if (intervaloTempoRef.current) {
      clearInterval(intervaloTempoRef.current);
      intervaloTempoRef.current = null;
    }

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  return (
    <Panel>
      <ScrollContainer>
        <Title>Resultados da Busca</Title>
        <ImageCountText>
          {imagens.length} imagens foram encontradas
        </ImageCountText>
        {imagens.map((img) => {
          const isSelected = imagemThumbnail?.id === img.id;
          const estaProcessando = processingId === img.id;

          return (
            <ThumbnailCard key={img.id} selected={isSelected}>
              <ThumbnailImage src={img.thumbnail} alt={img.id} />
              <InfoText>
                <strong>Id:</strong> {img.id}
              </InfoText>
              <InfoText>
                <strong>BBox:</strong> {img.bbox?.join(", ")}
              </InfoText>
              <InfoText>
                <strong>Data:</strong> {formatarData(img.data)}
              </InfoText>

              <SelectButton onClick={() => handleSelecionarImagem(img)}>
                Selecionar
              </SelectButton>

              {isSelected && !estaProcessando && (
                <SelectButton
                  onClick={() => handleProcessarImagem(img)}
                  disabled={!!processingId}
                >
                  Processar Imagem
                </SelectButton>
              )}

              {estaProcessando && (
                <>
                  <SelectButton
                    onClick={() => {
                      console.log("🛑 Enviando cancelamento... ID:", img.id);
                      cancelarAmbos(img.id);
                    }}
                    disabled={!processingId}
                  >
                    Cancelar Processamento
                  </SelectButton>
                  {tempoEstimado !== null && (
                    <InfoText>
                      Tempo decorrido: {tempoEstimado.toFixed(1)}s
                    </InfoText>
                  )}
                  {tempoEstimadoTotal !== null && (
                    <InfoText>
                      Estimativa total: {tempoEstimadoTotal.toFixed(1)}s
                    </InfoText>
                  )}
                </>
              )}
            </ThumbnailCard>
          );
        })}
        <ButtonVoltar onClick={onClose}>Voltar para Filtros</ButtonVoltar>
      </ScrollContainer>
    </Panel>
  );
}
