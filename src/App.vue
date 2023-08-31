<script setup>
import { fabric } from 'fabric';
import {onMounted, ref} from 'vue';
import img from './assets/印章1.jpg';
// import {read} from "fs";

function convertTo2DArray(arr, size) {
	const res = [];
	for (let i = 0; i < arr.length; i += size) {
		res.push(arr.slice(i, i + size));
	}
	return res;
}

function convertTo3DArray(arr, size) {
	const res = [];
	for (let i = 0; i < arr.length; i += size) {
		res.push(arr.slice(i, i + size));
	}
	return res;
}

function isPixelWhite(pixel) {
	return pixel[0] === 128 && pixel[1] === 128 && pixel[2] === 128 && pixel[3] === 255;
}

function isRowWhite(arr, rowIndex) {
	const row = arr[rowIndex];
	for (const pixel of row) {
		if (!isPixelWhite(pixel)) {
			return false;
		}
	}
	return true;
}

function isColWhite(arr, colIndex) {
	const col = [];
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


function download() {
	const canvas = document.querySelector('#canvas');
	const preview = document.querySelector('#preview');
	preview.width = canvas.width;
	preview.height = canvas.height;
	const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
	preview.getContext('2d').putImageData(imageData, 0, 0);
	const link = document.createElement('a');
	link.download = 'canvas.png';
	// link.href = dataURL;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

const input = ref(null);

onMounted(() => {
	const inputDOM = input.value;
	new Promise(resolve => {
		inputDOM.addEventListener('change', () => {
			console.log('上传文件');
			resolve(inputDOM.files.item(0));
		}, false);
	}).then(file => {
		if (file) {
			return file;
		}
	}).then(file => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		console.log('读取文件');
		return new Promise(resolve => {
			reader.onload = () => resolve(reader.result);
		});
	}).then(src => {
		const image = new Image();
		image.src = src;
		return new Promise(resolve => {
			image.onload = () => resolve(image);
		});
	}).then(image => {
		const preview = document.querySelector('#preview');
		preview.height = image.height;
		const context = preview.getContext('2d');
		context.drawImage(image, 0, 0);
		return image;
	}).then(img => {
		const canvas = new fabric.Canvas('process', {
			width: 1200,
			height: img.height,
			backgroundColor: 'grey'
		});
		const image = new fabric.Image(img, {
			scaleX: 0.5,
			scaleY: 0.5,
			top: 0,
			left: 0
		});
		image.filters.push(new fabric.Image.filters.Contrast({contrast: 0.5}));
		image.filters.push(new fabric.Image.filters.RemoveColor({distance: 0.5}));
		image.filters.push(new fabric.Image.filters.Saturation({saturation: 1}));
		image.applyFilters();
		canvas.add(image);
		return new Promise(resolve => {
			setTimeout(() => { resolve(); }, 0);
		});
	}).then(() => {
		const canvas = document.querySelector('#process');
		const result = document.querySelector('#result');
		// result.width = 1200;
		// result.height = canvas.height;
		const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
		// result.getContext('2d').putImageData(imageData, 0, 0);
		// 拿到图像一维像素矩阵
		const oneDimensionalMatrix = imageData.data;
		// 将一维矩阵转化为二维矩阵
		const twoDimensionalMatrix = convertTo2DArray(Array.from(oneDimensionalMatrix), 4);
		// 将二维矩阵转化为三维矩阵
		const threeDimensionalMatrix = convertTo3DArray(twoDimensionalMatrix, canvas.width);

		console.log(threeDimensionalMatrix);

		const rows = [];
		for (let i = 0; i < threeDimensionalMatrix.length; i++) {
			if (!isRowWhite(threeDimensionalMatrix, i)) {
				rows.push(i);
			}
		}

		const cols = [];
		for (let i = 0; i < threeDimensionalMatrix[0].length; i++) {
			if (!isColWhite(threeDimensionalMatrix, i)) {
				cols.push(i);
			}
		}

		result.width = cols[cols.length - 1] - cols[0]; result.height = rows[rows.length - 1] - rows[0];
		// 将图片填入canvas内
		result.getContext('2d').putImageData(imageData, -cols[0], -rows[0]);

	});
});

// onMounted(() => {
// 	new Promise(resolve => {
// 		const canvas = new fabric.Canvas('canvas', {
// 			width: 1000,
// 			height: 1000,
// 			background: '#EEE'
// 		});
// 		const image = new Image();
// 		image.src = img;
// 		image.onload = () => {
// 			const i = new fabric.Image(image, {
// 				scaleX: 0.5,
// 				scaleY: 0.5,
// 				angle: 0,
// 				top: 0,
// 				left: 0
// 			});
// 			i.filters.push(new fabric.Image.filters.Contrast({
// 				contrast: 0.5
// 			}));
// 			i.filters.push(new fabric.Image.filters.RemoveColor({
// 				distance: 0.5
// 			}));
// 			i.filters.push(new fabric.Image.filters.Saturation({
// 				saturation: 1
// 			}));
// 			i.applyFilters();
// 			canvas.add(i);
// 			const result = canvas.toObject();
// 			console.log(result);
// 			resolve();
// 		};
// 	}).then(() => {
// 		setTimeout(() => {
// 			download();
// 		}, 0);
// 	});
// });


</script>

<template>
	<div class="container">
		<h4>上传文件</h4>
		<div class="upload">
			<input ref="input" type="file" accept="image/*"/>
		</div>
		<h4>预览文件</h4>
		<div class="preview">
			<canvas id="preview" width="1200px"></canvas>
		</div>
		<h4>图像处理</h4>
		<div class="process">
			<canvas id="process" width="1200px"></canvas>
		</div>
		<h4>最终结果</h4>
		<div class="result">
			<canvas id="result" width="1200px"></canvas>
		</div>
		<h4>下载图片</h4>
		<div class="download">
			<button>下载</button>
		</div>
	</div>
</template>

<style>
html, body, #app {
	width: 100%;
}
.container {
	width: 1200px;
	margin: 0 auto;
	background-color: grey;
}
div {
	margin: 8px 0;
}
</style>
