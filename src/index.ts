declare global { interface Window { upload: () => void } }

function convertTo2DArray(arr: number[], size: number) {
    const res: number[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        res.push(arr.slice(i, i + size));
    }
    return res;
}

function convertTo3DArray(arr: number[][], size: number) {
    const res: number[][][] = [];
    for (let i = 0; i < arr.length; i += size) {
        res.push(arr.slice(i, i + size));
    }
    return res;
}

function reconvertTo2DArray(arr: number[][][]) {
    const result: number[][] = [];
    for (let row = 0; row < arr.length; row++) {
        for (let col = 0; col < arr[0].length; col++) {
            result.push(arr[row][col]);
        }
    }
    return result;
}

function reconvertTo1DArray(arr: number[][]) {
    const result: number[] = [];
    for (let row = 0; row < arr.length; row++) {
        for (let col = 0; col < arr[0].length; col++) {
            result.push(arr[row][col]);
        }
    }
    return result;
}

function convolutionMatrix(input: ImageData, kernel: number[]) {
    let w = input.width, h = input.height;
    let iD = input.data;
    let output: number[] = [];
    for (let y = 1; y < h - 1; y += 1) {
        for (let x = 1; x < w - 1; x += 1) {
            for (let c = 0; c < 3; c += 1) {
                let i = (y * w + x) * 4 + c;
                output[i] = kernel[0] * iD[i - w * 4 - 4] +
                        kernel[1] * iD[i - w * 4] +
                        kernel[2] * iD[i - w * 4 + 4] +
                        kernel[3] * iD[i - 4] +
                        kernel[4] * iD[i] +
                        kernel[5] * iD[i + 4] +
                        kernel[6] * iD[i + w * 4 - 4] +
                        kernel[7] * iD[i + w * 4] +
                        kernel[8] * iD[i + w * 4 + 4];
            }
            output[(y * w + x) * 4 + 3] = 255;
        }
    }
    return output;
}

function isPixelWhite(pixel: number[]) {
    const red = pixel[0]; const green = pixel[0]; const blue = pixel[0];
    const isRedOk = red <= 255 && red >= 240;
    const isGreenOk = green <= 255 && green >= 240;
    const isBlueOk = blue <= 255 && blue >= 240;
    return isRedOk && isGreenOk && isBlueOk;
}

function isRowWhite(arr: number[][][], rowIndex: number) {
    const row = arr[rowIndex];
    for (const pixel of row) {
        if (!isPixelWhite(pixel)) {
            return false;
        }
    }
    return true;
}

function isColWhite(arr: number[][][], colIndex: number) {
    const col: number[][] = [];
    for (const row of arr) {
        col.push(row[colIndex]);
    }
    for (const pixel of col) {
        if (!isPixelWhite(pixel)) {
            return false;
        }
    }
    return true;
}

window.upload = async () => {
    // 获取input内上传的文件
    const file = (document.querySelector('input[type=file]') as HTMLInputElement).files.item(0);
    if (!file) { return; }
    // 新建文件阅读器对象reader
    const reader = new FileReader();
    // 以base64格式读取文件
    reader.readAsDataURL(file);
    // 拿到base64格式编码的数据
    const src = await new Promise<string>(resolve => {
        reader.onload = () => resolve(reader.result as string);
    });
    // 获取img的dom节点
    const preview = document.querySelector('img') as HTMLImageElement;
    // 设置img的src属性用于预览
    preview.src = src;
    // 新建Image对象
    const _image = new Image();
    // 设置Image对象的src为base64码
    _image.src = src;
    // 拿到图片加载完毕的Image对象
    const image = await new Promise<HTMLImageElement>(resolve => {
        _image.onload = () => resolve(_image);
    });
    // 新建canvas画布节点
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    // 设置画布宽高
    canvas.width = image.width; canvas.height = image.height;
    // 获取画布2D上下文
    const context = canvas.getContext('2d');
    // 将image对象绘制在画布上
    context.drawImage(image, 0, 0);
    // 获取imageData对象
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    // 拿到图像一维像素矩阵
    const oneDimensionalMatrix = imageData.data;
    for (let i = 0; i < oneDimensionalMatrix.length; i += 4) {
        const red = oneDimensionalMatrix[i];
        const green = oneDimensionalMatrix[i + 1];
        const blue = oneDimensionalMatrix[i + 2];
        if (isPixelWhite([red, green, blue])) {
            oneDimensionalMatrix[i + 3] = 0;
        }
    }
    // 将一维矩阵转化为二维矩阵
    const twoDimensionalMatrix = convertTo2DArray(Array.from(oneDimensionalMatrix), 4);
    // 将二维矩阵转化为三维矩阵
    const threeDimensionalMatrix = convertTo3DArray(twoDimensionalMatrix, canvas.width);


    const kernel = [-100, -1, -1, -1, 9, -1, -1, -1, -1];
    const result = convolutionMatrix(imageData, kernel);
    console.log(imageData.data.length, result.length);

    for (let i = 0; i < result.length; i++) {
        imageData.data[i] = result[i];
    }

    // 将处理后的三维矩阵展开
    const processImageData = reconvertTo1DArray(reconvertTo2DArray(threeDimensionalMatrix));
    // 将处理后数据替换原数据
    for (let i = 0; i < processImageData.length; i++) {
        imageData.data[i] = processImageData[i];
    }
    // 创建canvas节点
    const canvasNew = document.createElement('canvas') as HTMLCanvasElement;
    // 设置canvas宽高
    canvasNew.width = image.width; canvasNew.height = image.height;
    // 将图片填入canvas内
    canvasNew.getContext('2d').putImageData(imageData, 0, 0);
    // 将新canvas节点加入body节点内
    document.body.appendChild(canvasNew);
};

export {};
