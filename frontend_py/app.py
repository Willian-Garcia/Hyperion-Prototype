import streamlit as st
from streamlit_folium import st_folium
import folium
from folium.plugins import Draw
from datetime import date
import requests

st.title("Busca de Imagens STAC - INPE")

st.sidebar.header("Parâmetros de Busca")
data_inicio = st.sidebar.date_input("Data Início", value=date(2024, 11, 1))
data_fim = st.sidebar.date_input("Data Fim", value=date(2024, 11, 30))

colecoes_disponiveis = [
    "CB4A-WFI-L2-DN-1", "CBERS4-WFI-16D-2", "CBERS-WFI-8D-1", "CB4-WFI-L2-DN-1",
    "CB4A-WFI-L4-DN-1", "AMZ1-WFI-L4-SR-1", "CB4-WFI-L4-DN-1",
    "AMZ1-WFI-L4-DN-1", "AMZ1-WFI-L2-DN-1", "CB4A-WFI-L4-SR-1", "CB4-WFI-L4-SR-1"
]

colecao = st.sidebar.selectbox("Selecione a Coleção", colecoes_disponiveis)
filtrar_nuvens = st.sidebar.checkbox("Filtrar por nuvens (< 10%)", value=False)

st.subheader("Selecione uma área no mapa (Retângulo)")
m = folium.Map(
    location=[-10, -52],
    zoom_start=4,
    tiles='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr='Esri'
)
draw = Draw(export=True)
draw.add_to(m)
map_data = st_folium(m, height=500, width=700)

if map_data and map_data.get("last_active_drawing"):
    bbox = map_data["last_active_drawing"]["geometry"]["coordinates"][0]
    lons = [coord[0] for coord in bbox]
    lats = [coord[1] for coord in bbox]
    bbox_str = f"{min(lons)},{min(lats)},{max(lons)},{max(lats)}"

    st.session_state["last_bbox"] = (min(lons), min(lats), max(lons), max(lats))
    st.success(f"BBox selecionado: `{bbox_str}`")

    if st.button("🔍 Buscar imagens"):
        with st.spinner("Buscando imagens..."):
            payload = {
                "data_inicio": str(data_inicio),
                "data_fim": str(data_fim),
                "bbox": bbox_str,
                "colecao": colecao,
                "filtrar_nuvens": filtrar_nuvens,
                "limite": 100
            }

            try:
                response = requests.post("http://localhost:8000/buscar-imagens", json=payload)
                response.raise_for_status()
                imagens = response.json()["dados"]
                st.session_state["imagens"] = imagens
                if imagens:
                    st.success(f"{len(imagens)} imagem(ns) encontrada(s).")
                else:
                    st.info("Nenhuma imagem encontrada.")
            except Exception as e:
                st.error(f"Erro ao buscar imagens: {e}")
else:
    st.warning("⚠️ Desenhe um retângulo no mapa para iniciar a busca.")

if "imagens" in st.session_state and st.session_state["imagens"]:
    st.subheader("🖼️ Visualização de imagens encontradas")

    for img in st.session_state["imagens"]:
        st.markdown(f"### 🛁 ID: `{img['id']}`")

        thumbnail = img.get("thumbnail", "")
        bbox = img.get("bbox", [])
        bandas = img.get("bandas", {})
        cmask_url = img.get("cmask", "")

        if not thumbnail or not bbox:
            st.warning("Thumbnail ou BBOX ausente nesta imagem.")
            continue

        lon_min, lat_min, lon_max, lat_max = bbox
        centro_lat = (lat_min + lat_max) / 2
        centro_lon = (lon_min + lon_max) / 2

        mapa = folium.Map(location=[centro_lat, centro_lon], zoom_start=9)

        folium.Rectangle(
            bounds=[[lat_min, lon_min], [lat_max, lon_max]],
            color="green",
            fill=False,
            popup=f"BBOX: {bbox}"
        ).add_to(mapa)

        folium.raster_layers.ImageOverlay(
            image=thumbnail,
            bounds=[[lat_min, lon_min], [lat_max, lon_max]],
            opacity=0.6,
            interactive=True,
            cross_origin=False,
            zindex=1,
            alt="Thumbnail"
        ).add_to(mapa)

        if st.button(f"⚙️ Processar imagem `{img['id']}`"):
            with st.spinner(f"🔬 Processando `{img['id']}`..."):
                payload_ml = {
                    "id": img["id"],
                    "band15_url": bandas.get("BAND15"),
                    "band16_url": bandas.get("BAND16"),
                    "bbox": bbox
                }

                try:
                    ml_response = requests.post("http://localhost:8000/processar-imagem", json=payload_ml)
                    ml_response.raise_for_status()
                    resultado_ml = ml_response.json()

                    st.session_state["bbox_real"] = resultado_ml.get("bbox", bbox)

                    result_overlay = f"http://localhost:8000{resultado_ml['preview_png']}"
                    folium.raster_layers.ImageOverlay(
                        image=result_overlay,
                        bounds=[[lat_min, lon_min], [lat_max, lon_max]],
                        opacity=0.7,
                        interactive=True,
                        cross_origin=False,
                        zindex=2,
                        alt="Resultado do modelo"
                    ).add_to(mapa)

                    st.success("✅ Resultado sobreposto ao mapa.")
                except Exception as e:
                    st.error(f"Erro ao processar imagem `{img['id']}`: {e}")

        st_folium(mapa, height=500, width=700)

        if bandas:
            st.markdown("**📅 Bandas disponíveis para download:**")
            for banda, url in bandas.items():
                if url:
                    st.markdown(f"- [{banda}]({url}) - [📀 Baixar]({url})", unsafe_allow_html=True)

        if cmask_url:
            st.markdown(f"[📦 Baixar Cmask]({cmask_url})", unsafe_allow_html=True)

        st.markdown("---")

with st.expander("🧚 Teste Manual de Overlay"):
    st.markdown("Use esta opção para testar manualmente uma imagem gerada.")

    if "mostrar_overlay" not in st.session_state:
        st.session_state["mostrar_overlay"] = True

    try:
        resp = requests.get("http://localhost:8000/processed-list/")
        resp.raise_for_status()
        arquivos = resp.json().get("arquivos", [])
    except Exception as e:
        st.error(f"Erro ao buscar arquivos processados: {e}")
        arquivos = []

    if arquivos:
        ndvi_arquivo = st.selectbox("Selecione um NDVI processado:", arquivos)

        if ndvi_arquivo:
            selected_id = ndvi_arquivo.replace("_classes.tif", "")
            tif_name = ndvi_arquivo
            st.session_state["selected_id"] = selected_id
            st.session_state["tif_name"] = tif_name
            png_url = f"http://localhost:8000/output/{selected_id}_rgb.png"
            
            # Buscar BBOX real ao selecionar
            try:
                bbox_resp = requests.get("http://localhost:8000/bbox-from-tif/", params={"filename": tif_name})
                bbox_resp.raise_for_status()
                bbox = bbox_resp.json().get("bbox", None)
                if bbox:
                    st.session_state["bbox_real"] = bbox
                    st.success("📦 BBOX carregado do GeoTIFF.")
                else:
                    st.warning("⚠️ BBOX não encontrado para o TIF.")
            except Exception as e:
                st.error(f"Erro ao buscar BBOX: {e}")
    else:
        st.warning("Nenhum arquivo encontrado.")

    png_url = f"http://localhost:8000/output/{st.session_state.get('selected_id', '')}_rgb.png"

    bbox_default = "-54.0,-12.0,-52.0,-10.0"
    if "bbox_real" in st.session_state:
        bbox = st.session_state["bbox_real"]
        bbox_default = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"
    elif "last_bbox" in st.session_state:
        bbox = st.session_state["last_bbox"]
        bbox_default = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"

    teste_url = st.text_input("URL da imagem RGB (gerada pelo modelo)", png_url)
    bbox_input = st.text_input("BBOX no formato: lon_min,lat_min,lon_max,lat_max", bbox_default)

    col1, col2 = st.columns(2)
    with col1:
        if st.button("🧪 Exibir Overlay"):
            st.session_state["mostrar_overlay"] = True
    with col2:
        if st.button("❌ Ocultar Overlay"):
            st.session_state["mostrar_overlay"] = False

    try:
        lon_min, lat_min, lon_max, lat_max = map(float, bbox_input.strip().split(","))
        centro_lat = (lat_min + lat_max) / 2
        centro_lon = (lon_min + lon_max) / 2

        mapa_manual = folium.Map(location=[centro_lat, centro_lon], zoom_start=9)

        folium.Rectangle(
            bounds=[[lat_min, lon_min], [lat_max, lon_max]],
            color="blue",
            fill=False,
            popup="BBOX Manual"
        ).add_to(mapa_manual)

        if st.session_state.get("mostrar_overlay", False):
            folium.raster_layers.ImageOverlay(
                image=teste_url,
                bounds=[[lat_min, lon_min], [lat_max, lon_max]],
                opacity=0.75,
                interactive=True,
                cross_origin=False,
                zindex=2,
                alt="Overlay manual"
            ).add_to(mapa_manual)

        st_folium(mapa_manual, height=500, width=700)
    except Exception as e:
        st.error(f"Erro ao interpretar a BBOX: {e}")
