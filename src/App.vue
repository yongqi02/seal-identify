<script setup>
import { fabric } from 'fabric';
import {onMounted} from 'vue';
import img from './assets/印章1.jpg';

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

onMounted(() => {
	new Promise(resolve => {
		const canvas = new fabric.Canvas('canvas', {
			width: 1000,
			height: 1000,
			background: '#EEE'
		});
		const image = new Image();
		image.src = img;
		image.onload = () => {
			const i = new fabric.Image(image, {
				scaleX: 0.5,
				scaleY: 0.5,
				angle: 0,
				top: 0,
				left: 0
			});
			i.filters.push(new fabric.Image.filters.Contrast({
				contrast: 0.5
			}));
			i.filters.push(new fabric.Image.filters.RemoveColor({
				distance: 0.5
			}));
			i.filters.push(new fabric.Image.filters.Saturation({
				saturation: 1
			}));
			i.applyFilters();
			canvas.add(i);
			const result = canvas.toObject();
			console.log(result);
			resolve();
		};
	}).then(() => {
		setTimeout(() => {
			download();
		}, 0);
	});


});
</script>

<template>
	<input type="file" />
	<img src="" alt="" />
	<canvas id="canvas"></canvas>
	<canvas id="preview"></canvas>
	<button @click="download">下载</button>
</template>

<style scoped>
</style>
