var OUTLINES = false;
window.hotSpots = [];

var content = document.getElementById("dmotion");
var lastImageData;
var canvasSource = document.getElementById("canvas-source");
var canvasBlended = document.getElementById("canvas-blended");

// Tăng tốc độ đọc pixel từ canvas khi sử dụng getImageData().
// Tránh tối ưu hóa không mong muốn của trình duyệt, vốn có thể làm chậm hoặc chặn getImageData().
// Hữu ích đặc biệt khi cập nhật canvas mỗi frame như trong phát hiện chuyển động.
var contextSource = canvasSource.getContext("2d", { willReadFrequently: true });
var contextBlended = canvasBlended.getContext("2d", {
  willReadFrequently: true,
});

var video;
var sensitivity = 5; // Điều chỉnh độ nhạy (càng cao càng ít nhạy)

function startMotion() {
  console.log("Motion detection started.");
  video = document.getElementById("remoteVideo");

  start();
}
startMotion();

function start() {
  document.getElementById("hotSpots").style.display = "block";
  requestAnimationFrame(update);
}

function update() {
  drawVideo();
  blend();
  checkAreas();
  requestAnimationFrame(update);
}

function drawVideo() {
  contextSource.drawImage(video, 0, 0, video.width, video.height);
}

function blend() {
  var width = canvasSource.width;
  var height = canvasSource.height;
  var sourceData = contextSource.getImageData(0, 0, width, height);

  if (!lastImageData) {
    lastImageData = contextSource.getImageData(0, 0, width, height);
    return;
  }

  var blendedData = contextSource.createImageData(width, height);
  differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);

  contextBlended.putImageData(blendedData, 0, 0);
  lastImageData = sourceData;
}

function fastAbs(value) {
  return (value ^ (value >> 31)) - (value >> 31);
}

function threshold(value) {
  return value > sensitivity ? 0xff : 0;
}

function differenceAccuracy(target, data1, data2) {
  if (data1.length !== data2.length) return null;

  for (var i = 0; i < data1.length * 0.25; i++) {
    var avg1 = (data1[i * 4] + data1[i * 4 + 1] + data1[i * 4 + 2]) / 3;
    var avg2 = (data2[i * 4] + data2[i * 4 + 1] + data2[i * 4 + 2]) / 3;
    var diff = threshold(fastAbs(avg1 - avg2));

    target[i * 4] = diff;
    target[i * 4 + 1] = diff;
    target[i * 4 + 2] = diff;
    target[i * 4 + 3] = 255;
  }
}

function checkAreas() {
  var blendedData = contextBlended.getImageData(
    0,
    0,
    canvasBlended.width,
    canvasBlended.height
  );
  var motionPixels = 0;

  for (var i = 0; i < blendedData.data.length; i += 4) {
    if (blendedData.data[i] > 200) {
      motionPixels++;
    }
  }

  if (motionPixels > 400) {
    // Giới hạn số pixel thay đổi để tránh báo sai
    console.log("🚨 Motion detected!");
    // alert("Motion detected!");
    
  }
}
