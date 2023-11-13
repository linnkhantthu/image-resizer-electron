const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

function loadImage(e) {
  const file = e.target.files[0];
  if (!isFileImage(file)) {
    alert("Please select an image", "red");
    return;
  }

  // Get Original dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  form.style.display = "block";
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), "imageresizer");
}

// Send Image data to Main
function sendImage(e) {
  e.preventDefault();
  const width = widthInput.value;
  const height = widthInput.value;
  const imgPath = img.files[0].path;

  if (!img.files[0]) {
    alert("Please upload an image", "red");
    return;
  }
  if (width === "" || height === "") {
    alert("Please fill in a height and width", "red");
    return;
  }
  // Send to main using ipcRenderer
  ipcRenderer.send("image:resize", {
    imgPath,
    width,
    height,
  });
}

// catch the image:done event
ipcRenderer.on("image:done", () => {
  alert(`Image resized to ${widthInput.value} x ${heightInput.value}`);
});

// Check File is Image
function isFileImage(file) {
  const acceptedImageTypes = ["image/gif", "image/png", "image/jpeg"];

  return file && acceptedImageTypes.includes(file.type);
}

function alert(message, category) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: category,
      color: "white",
      textAlign: "center",
    },
  });
}

img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);
