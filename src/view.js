const { desktopCapturer, remote } = require("electron");

const { writeFile } = require("fs");

const { dialog, Menu } = remote;

const recordedChunks = [];

const video = document.querySelector("video");

const start = document.getElementById("start");
start.onclick = (e) => {
  mediaRecorder.start();
};

const stop = document.getElementById("stop");

stop.onclick = (e) => {
  mediaRecorder.stop();
};

const pick = document.getElementById("pick");
pick.onclick = getScreens;

async function getScreens() {
  const inputSources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map((screen) => {
      return {
        label: screen.name,
        click: () => selectScreen(screen),
      };
    })
  );

  videoOptionsMenu.popup();
}

async function selectScreen(screen) {
  pick.innerText = screen.name;

  const options = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: screen.id,
      },
    },
  };

  const view = await navigator.mediaDevices.getUserMedia(options);

  video.srcObject = view;
  video.play();

  const recorder_options = { mimeType: "video/webm; codecs=vp9" };
  mediaRecorder = new MediaRecorder(view, recorder_options);

  mediaRecorder.ondataavailable = data_avail;
  mediaRecorder.onstop = stopit;

}

function data_avail(x) {
  console.log("video data available");
  recordedChunks.push(x.data);
}

async function stopit(x) {
  const blob = new Blob(recordedChunks, {
    type: "video/webm; codecs=vp9",
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: "Save video",
    defaultPath: `vid-${Date.now()}.webm`,
  });

  if (filePath) {
    writeFile(filePath, buffer, () => console.log("video saved successfully!"));
  }
}
