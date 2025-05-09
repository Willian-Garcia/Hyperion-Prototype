import { createContext, useContext, useState, ReactNode, useMemo } from "react";

interface Imagem {
  id: string;
  thumbnail: string;
  bbox: number[];
}

interface BBoxContextType {
  polygonPoints: [number, number][];
  setPolygonPoints: React.Dispatch<React.SetStateAction<[number, number][]>>;
  bbox: number[] | null;

  imagemThumbnail: Imagem | null;
  setImagemThumbnail: React.Dispatch<React.SetStateAction<Imagem | null>>;
  mostrarThumbnail: boolean;
  setMostrarThumbnail: React.Dispatch<React.SetStateAction<boolean>>;

  imagemProcessada: Imagem | null;
  setImagemProcessada: React.Dispatch<React.SetStateAction<Imagem | null>>;
  mostrarProcessada: boolean;
  setMostrarProcessada: React.Dispatch<React.SetStateAction<boolean>>;
}

const BBoxContext = createContext<BBoxContextType | undefined>(undefined);

export const BBoxProvider = ({ children }: { children: ReactNode }) => {
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [imagemThumbnail, setImagemThumbnail] = useState<Imagem | null>(null);
  const [imagemProcessada, setImagemProcessada] = useState<Imagem | null>(null);
  const [mostrarThumbnail, setMostrarThumbnail] = useState(true);
  const [mostrarProcessada, setMostrarProcessada] = useState(true);

  const bbox = useMemo(() => {
    if (polygonPoints.length !== 4) return null;
    const lats = polygonPoints.map(([lat]) => lat);
    const lngs = polygonPoints.map(([_, lng]) => lng);
    return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
  }, [polygonPoints]);

  return (
    <BBoxContext.Provider
      value={{
        polygonPoints,
        setPolygonPoints,
        bbox,
        imagemThumbnail,
        setImagemThumbnail,
        mostrarThumbnail,
        setMostrarThumbnail,
        imagemProcessada,
        setImagemProcessada,
        mostrarProcessada,
        setMostrarProcessada,
      }}
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
