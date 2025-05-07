import segmentation_models_pytorch as smp

def get_unet_model(num_classes):
    return smp.Unet(
        encoder_name="resnet34",
        encoder_weights="imagenet",
        in_channels=1,
        classes=num_classes,
    )
