export async function profilePhoto(file: File): Promise<string> {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  )
    throw new Error("Usa una imagen JPG, PNG o WebP de hasta 5 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const size = Math.min(image.width, image.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la foto.");
    context.drawImage(
      image,
      (image.width - size) / 2,
      (image.height - size) / 2,
      size,
      size,
      0,
      0,
      200,
      200,
    );
    return canvas.toDataURL("image/webp", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}
