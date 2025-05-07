# app_overlay.py (página de produção para visualizar resultados gerados)
import streamlit as st
import folium
from streamlit_folium import st_folium

st.set_page_config(page_title="Visualizar Resultado ML", layout="wide")
st.title("🛰️ Visualizador de Imagem Processada")

st.markdown("""
Esta página permite visualizar imagens PNG geradas pelo modelo U-Net aplicadas a produtos STAC do INPE.
Escolha abaixo a imagem processada e forneça a BBOX para sobreposição.
""")

# Lista fixa ou pode ser carregada dinamicamente via API futuramente
imagens_processadas = [
    "CBERS_4_AWFI_20240829_161_123_rgb.png",
    "CBERS_4_AWFI_20240824_154_123_rgb.png",
    "CBERS_4_AWFI_20240820_148_122_rgb.png"
]

imagem_selecionada = st.selectbox("Selecione a imagem processada:", imagens_processadas)
bbox_input = st.text_input("BBOX (lon_min,lat_min,lon_max,lat_max)", "-48.72,-22.02,-46.50,-20.75")

if st.button("📍 Exibir resultado"):
    try:
        lon_min, lat_min, lon_max, lat_max = map(float, bbox_input.split(","))
        centro_lat = (lat_min + lat_max) / 2
        centro_lon = (lon_min + lon_max) / 2

        mapa = folium.Map(location=[centro_lat, centro_lon], zoom_start=9)

        folium.Rectangle(
            bounds=[[lat_min, lon_min], [lat_max, lon_max]],
            color="blue", fill=False, popup="BBOX"
        ).add_to(mapa)

        url_overlay = f"http://localhost:8000/output/{imagem_selecionada}"
        folium.raster_layers.ImageOverlay(
            image=url_overlay,
            bounds=[[lat_min, lon_min], [lat_max, lon_max]],
            opacity=0.75,
            interactive=True,
            cross_origin=False,
            zindex=2,
            alt="Overlay model"
        ).add_to(mapa)

        st.success("✅ Imagem sobreposta com sucesso.")
        st_folium(mapa, height=600, width=1000)

    except Exception as e:
        st.error(f"Erro ao processar dados de BBOX: {e}")
