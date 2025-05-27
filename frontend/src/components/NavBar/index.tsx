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
import { useState, useEffect } from "react";
import axios from "axios";
import { useBBox } from "../../context/BBoxContext";
import ThumbnailViewer from "../ThumbnailViewer/ThumbnailViewer";
import OverlayManualPanel from "../OverlayManualPanel/OverlayManualPanel";
import {
  NavBar,
  Top,
  NavButton,
  Bottom,
  FilterPanel,
  ScrollContainer,
  CloseButton,
  InputWrapper,
  SearchIcon,
  InputCustom,
  InputCustom2,
  InputUser,
  InputWithIcon,
  ButtonCustom,
  ButtonCustom2,
  SelectCustom,
  OptionDiv,
  Options,
  EyeButton,
} from "./styles";

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
  const [showOverlayManual, setShowOverlayManual] = useState(false);

  useEffect(() => {
    if (showFilter || showExport || showSettings || showOverlayManual) {
      setIsLoading(true);
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [showFilter, showExport, showSettings, showOverlayManual]);

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
      const response = await axios.post(
        "http://localhost:8000/buscar-imagens",
        payload
      );
      setImagensFiltradas(response.data.dados);
      setMostrarResultados(true);
    } catch (error) {
      console.error("Erro ao buscar imagens:", error);
      alert("Erro ao buscar imagens. Veja o console para mais detalhes.");
    }
  };

  return (
    <NavBar>
      {showOverlayManual && (
        <OverlayManualPanel
          onClose={() => {
            setShowOverlayManual(false);
          }}
        />
      )}
      {showFilter &&
        (mostrarResultados ? (
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
                <ButtonCustom
                  onClick={() => {
                    setShowFilter(false);
                    setSelectingBBox(true);
                  }}
                >
                  Selecionar Área
                </ButtonCustom>
              )}

              {bbox && (
                <>
                  <OptionDiv>
                    <InputCustom2 value={bbox[0]} readOnly />
                  </OptionDiv>
                  <OptionDiv>
                    <InputCustom2 value={bbox[1]} readOnly />
                  </OptionDiv>
                  <OptionDiv>
                    <InputCustom2 value={bbox[2]} readOnly />
                  </OptionDiv>
                  <OptionDiv>
                    <InputCustom2 value={bbox[3]} readOnly />
                  </OptionDiv>
                </>
              )}

              <OptionDiv>
                <Options>Coleção/Satelite</Options>
                <SelectCustom
                  value={colecaoSelecionada}
                  onChange={(e) => setColecaoSelecionada(e.target.value)}
                >
                  <option value="" disabled hidden>
                    Selecione a Coleção
                  </option>
                  {colecoes.map((colecaoId) => (
                    <option key={colecaoId} value={colecaoId}>
                      {colecaoId}
                    </option>
                  ))}
                </SelectCustom>
              </OptionDiv>

              <OptionDiv>
                <Options>Data Início (UTC)</Options>
                <InputCustom
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </OptionDiv>

              <OptionDiv>
                <Options>Data Fim (UTC)</Options>
                <InputCustom
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </OptionDiv>
            </ScrollContainer>
            <ButtonCustom2 onClick={aplicarFiltros}>
              Aplicar Filtros
            </ButtonCustom2>
          </FilterPanel>
        ))}

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
            <OptionDiv>
              <InputCustom2 placeholder="Limite Esquerdo Inferior" />
            </OptionDiv>
            <OptionDiv>
              <InputCustom2 placeholder="Limite Esquerdo Superior" />
            </OptionDiv>
            <OptionDiv>
              <InputCustom2 placeholder="Limite Direito Superior" />
            </OptionDiv>
            <OptionDiv>
              <InputCustom2 placeholder="Limite Direito Inferior" />
            </OptionDiv>

            <OptionDiv>
              <Options>Coleção/Satelite</Options>
              <SelectCustom defaultValue="">
                <option value="" disabled hidden>
                  Selecione a Coleção
                </option>
                {colecoes.map((colecaoId) => (
                  <option key={colecaoId} value={colecaoId}>
                    {colecaoId}
                  </option>
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
                  <InputUser
                    value={user.name}
                    readOnly={user.role !== "admin"}
                  />
                </OptionDiv>
                <OptionDiv>
                  <Options>Cargo</Options>
                  <InputUser value={user.role} readOnly />
                </OptionDiv>
                <OptionDiv>
                  <Options>Email</Options>
                  <InputUser
                    value={user.email}
                    readOnly={user.role !== "admin"}
                  />
                </OptionDiv>
                <OptionDiv>
                  <Options>Senha</Options>
                  <InputWrapper>
                    <EyeButton onClick={togglePasswordVisibility}>
                      <img
                        src={showPassword ? eyeOpenIcon : eyeCloseIcon}
                        alt="Mostrar senha"
                      />
                    </EyeButton>
                    <InputUser
                      type={showPassword ? "text" : "password"}
                      value={user.password}
                      readOnly={user.role !== "admin"}
                    />
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
                setShowOverlayManual(false);
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
                setShowOverlayManual(false);
              }
              return !prev;
            });
          }}
        >
          <img src={showExport ? openExportIcon : exportIcon} alt="Export" />
        </NavButton>
        <NavButton
          title="Overlay Manual"
          onClick={() => {
            setShowOverlayManual((prev) => {
              if (!prev) {
                setShowFilter(false);
                setShowExport(false);
                setShowSettings(false);
              }
              return !prev;
            });
          }}
        >
          <img src={exportIcon} alt="Overlay Manual" />
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
          <img
            src={showSettings ? openSettingsIcon : settings}
            alt="Configurações"
          />
        </NavButton>
      </Bottom>
    </NavBar>
  );
}
