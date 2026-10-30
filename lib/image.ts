// 업로드한 이미지를 브라우저에서 줄여 JPEG data URL로 변환 (원본 그대로 DB에 넣으면 용량이 커지고 Vercel 요청 크기 제한에도 걸림)
// square: 가운데 기준 정사각형으로 잘라 maxSize × maxSize (프로필 사진)
// 아니면 비율 그대로 긴 변이 maxSize 이하가 되게 줄임 (프로젝트 썸네일)
export async function toJpeg(file: File, { maxSize, square = false }: { maxSize: number; square?: boolean }): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const side = Math.min(bitmap.width, bitmap.height);
  const srcW = square ? side : bitmap.width;
  const srcH = square ? side : bitmap.height;
  const scale = Math.min(1, maxSize / Math.max(srcW, srcH));
  const outW = Math.round(srcW * scale);
  const outH = Math.round(srcH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  ctx.drawImage(bitmap, (bitmap.width - srcW) / 2, (bitmap.height - srcH) / 2, srcW, srcH, 0, 0, outW, outH);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
