from app.services.ml_pipeline import compute_ndvi

if __name__ == "__main__":
    compute_ndvi(
        red_path="data/raw/scene_RED.tif",
        nir_path="data/raw/scene_NIR.tif",
        output_path="data/processed/ndvi2.tif",
        preview_path="data/processed/ndvi_preview2.png"
    )
