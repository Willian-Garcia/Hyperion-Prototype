import styled from "styled-components";
import {
  exportIcon,
  mapIcon,
  opemMapIcon,
  openExportIcon,
  returnIcon,
  searchIcon,
  settings,
  openSettingsIcon,
  eyeCloseIcon,
  eyeOpenIcon,
} from "../../assets";
import { useState, useEffect} from "react";
import axios from "axios";
import { useBBox } from "../../context/BBoxContext";
import ThumbnailViewer from "../ThumbnailViewer/ThumbnailViewer";

// Estilos (mesmo que você enviou, sem alterações)
const NavBar = styled.div`
  position: absolute;
  right: 0rem;
  display: flex;
  flex-direction: column;
  background-color: #222223;
  z-index: 1000;
  height: 92vh;
  width: 4vw;
  min-width: 40px;
  align-items: center;
  position: relative;
`;

const Top = styled.div`
  margin-top: 0.75rem;
  gap: 0.75rem;
  display: flex;
  flex-direction: column;
`;

const NavButton = styled.button`
  background-color: transparent;
  border: none;
  padding: 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const Bottom = styled.div`
  position: absolute;
  bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FilterPanel = styled.div`
  position: absolute;
  top: 0;
  right: 100%;
  width: 280px;
  height: 100%;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 12px 0px 0px 12px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
  z-index: 1500;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;

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

const ScrollContainer = styled.div`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-items: center;
  padding-bottom: 1rem;
  padding-right: 1rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c0c0c0;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const CloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  position: absolute;
  top: 1rem;
  left: 1rem;
  cursor: pointer;

  img {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchIcon = styled.img`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none;
`;

const InputCustom = styled.input`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 25px;
  height: 40px;
  font-size: 18px;
  background-color: #d9d9d9;
`;

const InputCustom2 = styled.input`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 25px;
  height: 40px;
  font-size: 18px;
  background-color: #d9d9d9;
  padding-left: 12px;
`;

const InputUser = styled.input`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 25px;
  height: 40px;
  font-size: 18px;
  background-color: #d9d9d9;
  padding-left: 12px;
  padding-right: 40px;
`;

const InputWithIcon = styled(InputCustom)`
  padding-left: 40px;
`;

const ButtonCustom = styled.button`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 25px;
  height: 40px;
  font-size: 18px;
  background-color: #fe5000;
  color: #ffffff;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease;

  &:hover {
    background-color: #e24600;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ButtonCustom2 = styled.button`
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 25px;
  height: 40px;
  font-size: 18px;
  background-color: #fe5000;
  color: #ffffff;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease;

  &:hover {
    background-color: #e24600;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SelectCustom = styled.select`
  width: 100%;
  padding: 8px 16px;
  border: none;
  border-radius: 25px;
  height: 40px;
  font-size: 18px;
  background-color: #d9d9d9;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23666' stroke-width='2' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 12px;
  cursor: pointer;
`;

const OptionDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 11px;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const Options = styled.label`
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
`;

const EyeButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  img {
    width: 20px;
    height: 20px;
  }
`;

export default function NavigationBar() {
  const [showFilter, setShowFilter] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [colecoes, setColecoes] = useState<string[]>([]);
  const [selectingBBox, setSelectingBBox] = useState(false);
  const [colecaoSelecionada, setColecaoSelecionada] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const { polygonPoints, bbox } = useBBox();
  const [imagensFiltradas, setImagensFiltradas] = useState<any[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  useEffect(() => {
    if (showFilter || showExport || showSettings) {
      setIsLoading(true);
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [showFilter, showExport, showSettings]);

  const [user, setUser] = useState({
    name: "",
    role: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    if (showSettings) {
      setIsLoading(true);
      setTimeout(() => {
        setUser({
          name: "Ana Souza",
          role: "admin",
          email: "ana.souza@email.com",
          password: "123456",
        });
        setIsLoading(false);
      }, 1500);
    }
  }, [showSettings]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/colecoes-suportadas")
      .then((res) => {
        const nomes = res.data.map((colecao: { id: string }) => colecao.id);
        setColecoes(nomes);
      })
      .catch((err) => {
        console.error("Erro ao buscar coleções:", err);
      });
  }, []);

  const aplicarFiltros = async () => {
    if (!bbox || !colecaoSelecionada || !dataInicio || !dataFim) {
      alert("Preencha todos os campos antes de aplicar os filtros.");
      return;
    }

    const payload = {
      bbox: bbox.join(","),
      colecao: colecaoSelecionada,
      data_inicio: dataInicio,
      data_fim: dataFim,
      filtrar_nuvens: false,
    };

    try {
      const response = await axios.post("http://localhost:8000/buscar-imagens", payload);
      setImagensFiltradas(response.data.dados);
      setMostrarResultados(true);
    } catch (error) {
      console.error("Erro ao buscar imagens:", error);
      alert("Erro ao buscar imagens. Veja o console para mais detalhes.");
    }
  };

  return (
    <NavBar>
      {showFilter && (
        mostrarResultados ? (
          <ThumbnailViewer
            imagens={imagensFiltradas}
            onClose={() => {
              setMostrarResultados(false);
              setShowFilter(true);
            }}
          />
        ) : (
          <FilterPanel>
            <CloseButton onClick={() => setShowFilter(false)}>
              <img src={returnIcon} alt="Voltar" />
            </CloseButton>
            <ScrollContainer>
              <h3>Localizar</h3>
              <InputWrapper>
                <SearchIcon src={searchIcon} alt="Buscar" />
                <InputWithIcon type="text" placeholder="Buscar cidade" />
              </InputWrapper>
  
              {!selectingBBox && polygonPoints.length < 4 && (
                <ButtonCustom onClick={() => {
                  setShowFilter(false);
                  setSelectingBBox(true);
                }}>
                  Selecionar Área
                </ButtonCustom>
              )}
  
              {bbox && (
                <>
                  <OptionDiv><InputCustom2 value={bbox[0]} readOnly /></OptionDiv>
                  <OptionDiv><InputCustom2 value={bbox[1]} readOnly /></OptionDiv>
                  <OptionDiv><InputCustom2 value={bbox[2]} readOnly /></OptionDiv>
                  <OptionDiv><InputCustom2 value={bbox[3]} readOnly /></OptionDiv>
                </>
              )}
  
              <OptionDiv>
                <Options>Coleção/Satelite</Options>
                <SelectCustom value={colecaoSelecionada} onChange={(e) => setColecaoSelecionada(e.target.value)}>
                  <option value="" disabled hidden>Selecione a Coleção</option>
                  {colecoes.map((colecaoId) => (
                    <option key={colecaoId} value={colecaoId}>{colecaoId}</option>
                  ))}
                </SelectCustom>
              </OptionDiv>
  
              <OptionDiv>
                <Options>Data Início (UTC)</Options>
                <InputCustom type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              </OptionDiv>
  
              <OptionDiv>
                <Options>Data Fim (UTC)</Options>
                <InputCustom type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
              </OptionDiv>
            </ScrollContainer>
            <ButtonCustom2 onClick={aplicarFiltros}>Aplicar Filtros</ButtonCustom2>
          </FilterPanel>
        )
      )}
  
      {showExport && (
        <FilterPanel>
          <CloseButton onClick={() => setShowExport(false)}>
            <img src={returnIcon} alt="Fechar" />
          </CloseButton>
          <ScrollContainer>
            <h3>Exportar</h3>
            <InputWrapper>
              <SearchIcon src={searchIcon} alt="Buscar" />
              <InputWithIcon type="text" placeholder="Buscar..." />
            </InputWrapper>
            <OptionDiv><InputCustom2 placeholder="Limite Esquerdo Inferior" /></OptionDiv>
            <OptionDiv><InputCustom2 placeholder="Limite Esquerdo Superior" /></OptionDiv>
            <OptionDiv><InputCustom2 placeholder="Limite Direito Superior" /></OptionDiv>
            <OptionDiv><InputCustom2 placeholder="Limite Direito Inferior" /></OptionDiv>
  
            <OptionDiv>
              <Options>Coleção/Satelite</Options>
              <SelectCustom defaultValue="">
                <option value="" disabled hidden>Selecione a Coleção</option>
                {colecoes.map((colecaoId) => (
                  <option key={colecaoId} value={colecaoId}>{colecaoId}</option>
                ))}
              </SelectCustom>
            </OptionDiv>
            <OptionDiv>
              <Options>Data Início (UTC)</Options>
              <InputCustom type="date" />
            </OptionDiv>
            <OptionDiv>
              <Options>Data Fim (UTC)</Options>
              <InputCustom type="date" />
            </OptionDiv>
            <ButtonCustom>Exportar Dados</ButtonCustom>
          </ScrollContainer>
        </FilterPanel>
      )}
  
      {showSettings && (
        <FilterPanel>
          <CloseButton onClick={() => setShowSettings(false)}>
            <img src={returnIcon} alt="Fechar" />
          </CloseButton>
          <ScrollContainer>
            {isLoading ? (
              <p>Carregando...</p>
            ) : (
              <>
                <OptionDiv>
                  <Options>Nome do funcionário</Options>
                  <InputUser value={user.name} readOnly={user.role !== "admin"} />
                </OptionDiv>
                <OptionDiv>
                  <Options>Cargo</Options>
                  <InputUser value={user.role} readOnly />
                </OptionDiv>
                <OptionDiv>
                  <Options>Email</Options>
                  <InputUser value={user.email} readOnly={user.role !== "admin"} />
                </OptionDiv>
                <OptionDiv>
                  <Options>Senha</Options>
                  <InputWrapper>
                    <EyeButton onClick={togglePasswordVisibility}>
                      <img src={showPassword ? eyeOpenIcon : eyeCloseIcon} alt="Mostrar senha" />
                    </EyeButton>
                    <InputUser type={showPassword ? "text" : "password"} value={user.password} readOnly={user.role !== "admin"} />
                  </InputWrapper>
                </OptionDiv>
                {user.role === "admin" && (
                  <>
                    <ButtonCustom>Cadastrar Usuários</ButtonCustom>
                    <ButtonCustom>Editar usuários</ButtonCustom>
                  </>
                )}
              </>
            )}
          </ScrollContainer>
        </FilterPanel>
      )}
  
      <Top>
        <NavButton
          title="Filtro"
          onClick={() => {
            setShowFilter((prev) => {
              if (!prev) {
                setShowExport(false);
                setShowSettings(false);
              }
              return !prev;
            });
          }}
        >
          <img src={showFilter ? opemMapIcon : mapIcon} alt="Filter" />
        </NavButton>
        <NavButton
          title="Exportar"
          onClick={() => {
            setShowExport((prev) => {
              if (!prev) {
                setShowFilter(false);
                setShowSettings(false);
              }
              return !prev;
            });
          }}
        >
          <img src={showExport ? openExportIcon : exportIcon} alt="Export" />
        </NavButton>
      </Top>
      <Bottom>
        <NavButton
          title="Settings"
          onClick={() => {
            setShowSettings((prev) => {
              if (!prev) {
                setShowFilter(false);
                setShowExport(false);
              }
              return !prev;
            });
          }}
        >
          <img src={showSettings ? openSettingsIcon : settings} alt="Configurações" />
        </NavButton>
      </Bottom>
    </NavBar>
  );  
}
