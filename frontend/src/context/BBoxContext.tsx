import { createContext, useContext, useState, ReactNode, useMemo } from "react";

interface ImagemSelecionada {
  id: string;
  thumbnail: string;
  bbox: number[];
}

interface BBoxContextType {
  polygonPoints: [number, number][];
  setPolygonPoints: React.Dispatch<React.SetStateAction<[number, number][]>>;
  bbox: number[] | null;
  imagemSelecionada: ImagemSelecionada | null;
  setImagemSelecionada: React.Dispatch<React.SetStateAction<ImagemSelecionada | null>>;
  mostrarImagem: boolean;
  setMostrarImagem: React.Dispatch<React.SetStateAction<boolean>>;
}

const BBoxContext = createContext<BBoxContextType | undefined>(undefined);

export const BBoxProvider = ({ children }: { children: ReactNode }) => {
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [imagemSelecionada, setImagemSelecionada] = useState<ImagemSelecionada | null>(null);
  const [mostrarImagem, setMostrarImagem] = useState(true);
  
  const bbox = useMemo(() => {
    if (polygonPoints.length !== 4) return null;

    const lats = polygonPoints.map(([lat, _]) => lat);
    const lngs = polygonPoints.map(([_, lng]) => lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return [minLng, minLat, maxLng, maxLat];
  }, [polygonPoints]);

  return (
    <BBoxContext.Provider
      value={{ polygonPoints, setPolygonPoints, bbox, imagemSelecionada, setImagemSelecionada, mostrarImagem, setMostrarImagem }}
    >
      {children}
    </BBoxContext.Provider>
  );
};

export const useBBox = () => {
  const context = useContext(BBoxContext);
  if (!context) {
    throw new Error("useBBox deve ser usado dentro de BBoxProvider");
  }
  return context;
};
