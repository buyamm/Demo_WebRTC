const callBtn = document.getElementById("call-btn");
const endCallBtn = document.getElementById("end-call-btn");
const muteBtn = document.getElementById("mute-btn");
const videoBtn = document.getElementById("video-btn");

const socket = io();
const userEmail = localStorage.getItem("userEmail");
let localStream;
let caller = [];
let isMuted = false;
let isVideoOff = false;

// Initialize Applicaiton
const startApp = (function () {
  socket.emit("join-user", userEmail);
})();

// initialize audio & video
const startMyVideo = async () => {
  try {
    // Từ khóa await sẽ khiến hàm phải đợi cho đến khi navigator.mediaDevices.getUserMedia trả về kết quả (hoặc lỗi).
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    console.log({ stream });
    localStream = stream;
    localVideo.srcObject = stream;
  } catch (error) {}
};

startMyVideo();

const PeerConnection = (function () {
  let peerConnection;

  const createPeerConnection = () => {
    const config = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    };

    peerConnection = new RTCPeerConnection(config);

    // add local stream to peer connection
    localStream.getTracks().forEach((element) => {
      peerConnection.addTrack(element, localStream); // đối số 1: là mỗi track (audio/video) - đối số 2: là nguồn stream đã lấy
    });
    // listen to remote stream and add to peer connection
    // ontrack là một sự kiện trong RTCPeerConnection. Nó được kích hoạt khi một track mới được nhận từ đối tác peer (người dùng khác trong kết nối WebRTC).
    peerConnection.ontrack = function (event) {
      remoteVideo.srcObject = event.streams[0]; // lấy ra stream của đối tác peer đầu tiên
    };
    // listen for ice candidate
    // send ice candidate to server
    peerConnection.onicecandidate = function (event) {
      if (event.candidate) {
        socket.emit("icecandidate", event.candidate);
      }
    };

    return peerConnection;
  };

  return {
    // getInstance: Khi phương thức này được gọi, nó sẽ kiểm tra xem đã có instance nào được tạo chưa.
    // Nếu chưa, nó sẽ gọi createInstance để tạo ra một instance mới và lưu vào instance.
    // Nếu đã có instance, nó sẽ trả về instance đó mà không tạo thêm mới.
    getInstance: () => {
      if (!peerConnection) {
        peerConnection = createPeerConnection();
      }
      return peerConnection;
    },
  };
})();

// ================================ Handle browser events ============================
const startCall = async (user) => {
  const pc = PeerConnection.getInstance();
  console.log({ pc });
  console.log(`da nhan nut call den ${user}`);

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.emit("offer", {
    from: userEmail,
    to: user,
    offer: pc.localDescription,
  });
};

endCallBtn.addEventListener("click", (e) => {
  socket.emit("call-ended", caller);
});

muteBtn.addEventListener("click", (e) => {
  const audioTrack = localStream.getAudioTracks()[0];
  console.log({ audioTrack });

  if (isMuted) {
    audioTrack.enabled = true;
    muteBtn.innerHTML = '<i class="fas fa-microphone"></i>'; // Icon microphone on
  } else {
    audioTrack.enabled = false;
    muteBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>'; // Icon microphone off
  }

  isMuted = !isMuted;

  socket.emit("mute", { userEmail, isMuted });
});

videoBtn.addEventListener("click", () => {
  const videoTrack = localStream.getVideoTracks()[0];

  if (isVideoOff) {
    videoTrack.enabled = true;
    videoBtn.innerHTML = '<i class="fas fa-video"></i>'; // Icon video on
  } else {
    videoTrack.enabled = false;
    videoBtn.innerHTML = '<i class="fas fa-video-slash"></i>'; // Icon video off
  }

  isVideoOff = !isVideoOff;

  socket.emit("video", { userEmail, isVideoOff });
});

//  =================== Handle socket events ==============================
socket.on("joined", (allUsers) => {
  for (const user in allUsers) {
    if (user !== userEmail) {
      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("button-container");

      const callButton = document.createElement("button");
      callButton.id = "call-btn";
      callButton.addEventListener("click", (e) => {
        startCall(user);
      });

      const buttonImage = document.createElement("img");
      buttonImage.src = "/images/phone.png";
      buttonImage.alt = "Call";

      callButton.appendChild(buttonImage);
      buttonContainer.appendChild(callButton);

      const videoStream = document.getElementById("video-stream-remote");
      videoStream.appendChild(buttonContainer);
    }
  }
});

socket.on("offer", async ({ from, to, offer }) => {
  const pc = PeerConnection.getInstance();
  // set remote description
  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  caller = [from, to];
  socket.emit("answer", { from, to, answer: pc.localDescription });
});

socket.on("answer", async ({ from, to, answer }) => {
  const pc = PeerConnection.getInstance();
  await pc.setRemoteDescription(answer);

  endCallBtn.style.display = "block";
  socket.emit("end-call-btn", { from, to });
  caller = [from, to];
});

socket.on("end-call-btn", ({ from, to }) => {
  endCallBtn.style.display = "block";
});

socket.on("icecandidate", async (candidate) => {
  const pc = PeerConnection.getInstance();
  await pc.addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on("call-ended", (caller) => {
  endCall();
});

socket.on("userDisconnected", (username) => {});

// End call method
const endCall = () => {
  const pc = PeerConnection.getInstance();
  if (pc) {
    pc.close();
    endCallBtn.style.display = "none";
  }
};

// Lắng nghe sự kiện "beforeunload" để xóa trên client
window.addEventListener("beforeunload", () => {
  // Gửi thông báo tới server rằng người dùng đã rời đi
  socket.emit("userDisconnected", username.value);
});
