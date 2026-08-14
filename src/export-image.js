export const EXPORT_PNG_OPTIONS = Object.freeze({ pixelRatio: 2 });

function imageSource(image) {
  return image.currentSrc || image.src || "未知图片";
}

function waitForImage(image) {
  if (image.complete) {
    if (image.naturalWidth > 0) return Promise.resolve();
    return Promise.reject(new Error(`图片加载失败：${imageSource(image)}`));
  }

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      image.removeEventListener("load", onLoad);
      image.removeEventListener("error", onError);
    };
    const onLoad = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error(`图片加载失败：${imageSource(image)}`));
    };

    image.addEventListener("load", onLoad);
    image.addEventListener("error", onError);
  });
}

export async function prepareExportNode(node) {
  if (!node) throw new Error("导出画布尚未准备完成");
  await Promise.all([...node.querySelectorAll("img")].map(waitForImage));
  return node;
}
