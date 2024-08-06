/**
 * 手写签名部分方法封装处理
 * Copyright (c) 2024 XS-SIGNATURE
 * @author smallSun
 */

/*
裁切一半图片并逆时针旋转90度
 */
export const sliceBase64Image = (base64Image) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      const halfWidth = image.width / 2;
      const sliceCanvas = document.createElement("canvas");
      const sliceCtx = sliceCanvas.getContext("2d");
      sliceCanvas.width = halfWidth;
      sliceCanvas.height = image.height;
      sliceCtx.drawImage(
        canvas,
        halfWidth,
        0,
        halfWidth,
        image.height,
        0,
        0,
        halfWidth,
        image.height
      );
      resolve(sliceCanvas.toDataURL());
    };
    image.onerror = (err) => reject(err);
    image.src = base64Image;
  });
};

/*
 src - 图片路径，deg旋转角度
  */
export const rotateBase64Image = async (src, edg) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  let imgW; // 图片宽度
  let imgH; // 图片高度
  let size; // canvas 初始大小
  if (edg % 90 !== 0) {
    console.error("旋转角度必须是 90 的倍数!");
  }
  edg < 0 && (edg = (edg % 360) + 360);
  const quadrant = (edg / 90) % 4; // 旋转象限
  const cutCoor = { sx: 0, sy: 0, ex: 0, ey: 0 }; // 裁剪坐标
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;

  return new Promise((resolve) => {
    image.onload = () => {
      imgW = image.width;
      imgH = image.height;
      size = imgW > imgH ? imgW : imgH;
      canvas.width = size * 2;
      canvas.height = size * 2;
      switch (quadrant) {
        case 0:
          cutCoor.sx = size;
          cutCoor.sy = size;
          cutCoor.ex = size + imgW;
          cutCoor.ey = size + imgH;
          break;
        case 1:
          cutCoor.sx = size - imgH;
          cutCoor.sy = size;
          cutCoor.ex = size;
          cutCoor.ey = size + imgW;
          break;
        case 2:
          cutCoor.sx = size - imgW;
          cutCoor.sy = size - imgH;
          cutCoor.ex = size;
          cutCoor.ey = size;
          break;
        case 3:
          cutCoor.sx = size;
          cutCoor.sy = size - imgW;
          cutCoor.ex = size + imgH;
          cutCoor.ey = size + imgW;
          break;
      }
      ctx.translate(size, size);
      ctx.rotate((edg * Math.PI) / 180);
      ctx.drawImage(image, 0, 0);
      var imgData = ctx.getImageData(
        cutCoor.sx,
        cutCoor.sy,
        cutCoor.ex,
        cutCoor.ey
      );
      if (quadrant % 2 === 0) {
        canvas.width = imgW;
        canvas.height = imgH;
      } else {
        canvas.width = imgH;
        canvas.height = imgW;
      }
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL());
    };
  });
};
