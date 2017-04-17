let privateParam = window.location.search.substr(1).split('=');
let room;
if (privateParam.length >= 2) {
    if (privateParam.includes('private')) {
        room = prompt('Enter room name!');
        const privateLink = document.querySelector('#privateLink');
        privateLink.innerHTML = '<h3>Videochat room: <b>' + room + '</b></h3>';
    } else {
        room = 'default';
    }
} else {
    room = 'default';
}


// create our webrtc connection
const webRTC = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'localVideo',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: '',
    // immediately ask for camera access
    autoRequestMedia: true,
    debug: false,
    detectSpeakingEvents: true,
    autoAdjustMic: false,
    url: 'https://localhost:8888', // By default, SimpleWebRTC uses Google's public STUN server (stun.l.google.com:19302)
    nick: getCookie('username')
});

webRTC.on('readyToCall', () => {
    if (room) webRTC.joinRoom(room);
});

const showVolume = (el, volume) => {
    if (!el) return;
    if (volume < -45) volume = -45; // -45 to -20 is
    if (volume > -20) volume = -20; // a good range
    el.value = volume;
}

// we got access to the camera
webRTC.on('localStream', (stream) => {
    const button = document.querySelector('form>button');
    if (button) button.removeAttribute('disabled');
    $('#localVolume').show();
});
// we did not get access to the camera
webRTC.on('localMediaError', (err) => {
    console.log('No access to the camera');
});

// local screen obtained
webRTC.on('localScreenAdded', (video) => {
    video.onclick = () => {
        video.style.width = video.videoWidth + 'px';
        video.style.height = video.videoHeight + 'px';
    };
    document.getElementById('localScreenContainer').appendChild(video);
    $('#localScreenContainer').show();
});
// local screen removed
webRTC.on('localScreenRemoved', (video) => {
    document.getElementById('localScreenContainer').removeChild(video);
    $('#localScreenContainer').hide();
});

// a peer video has been added
webRTC.on('videoAdded', (video, peer) => {
    console.log('video added', peer);
    const remotes = document.getElementById('remotes');
    if (remotes) {
        const container = document.createElement('div');
        container.className = 'videoContainer';
        container.id = 'container_' + webRTC.getDomId(peer);
        container.appendChild(video);

        // suppress contextmenu
        video.oncontextmenu = () => {
            return false;
        };

        // resize the video on click
        video.onclick = () => {
            container.style.width = video.videoWidth + 'px';
            container.style.height = video.videoHeight + 'px';
        };

        // show the remote volume
        const vol = document.createElement('meter');
        vol.id = 'volume_' + peer.id;
        vol.className = 'volume';
        vol.min = -45;
        vol.max = -20;
        vol.low = -40;
        vol.high = -25;
        container.appendChild(vol);

        // show the ice connection state
        if (peer && peer.pc) {
            const connstate = document.createElement('div');
            connstate.className = 'connectionstate';
            container.appendChild(connstate);
            peer.pc.on('iceConnectionStateChange', (event) => {
                switch (peer.pc.iceConnectionState) {
                    case 'checking':
                        connstate.innerText = 'Connecting to peer...';
                        break;
                    case 'connected':
                    case 'completed': // on caller side
                        $(vol).show();
                        connstate.innerText = getCookie('username');
                        break;
                    case 'disconnected':
                        connstate.innerText = 'Disconnected.';
                        break;
                    case 'failed':
                        connstate.innerText = 'Connection failed.';
                        break;
                    case 'closed':
                        connstate.innerText = 'Connection closed.';
                        break;
                }
            });
        }
        remotes.appendChild(container);
    }
});
// a peer was removed
webRTC.on('videoRemoved', (video, peer) => {
    console.log('video removed ', peer);
    const remotes = document.getElementById('remotes');
    const el = document.getElementById(peer ? 'container_' + webRTC.getDomId(peer) : 'localScreenContainer');
    if (remotes && el) {
        remotes.removeChild(el);
    }
});

// local volume has changed
webRTC.on('volumeChange', (volume, treshold) => {
    showVolume(document.getElementById('localVolume'), volume);
});
// remote volume has changed
webRTC.on('remoteVolumeChange', (peer, volume) => {
    showVolume(document.getElementById('volume_' + peer.id), volume);
});

// local p2p/ice failure
webRTC.on('iceFailed', (peer) => {
    const connstate = document.querySelector('#container_' + webRTC.getDomId(peer) + ' .connectionstate');
    console.log('local fail', connstate);
    if (connstate) {
        connstate.innerText = 'Connection failed.';
        fileinput.disabled = 'disabled';
    }
});

// remote p2p/ice failure
webRTC.on('connectivityError', (peer) => {
    const connstate = document.querySelector('#container_' + webRTC.getDomId(peer) + ' .connectionstate');
    console.log('remote fail', connstate);
    if (connstate) {
        connstate.innerText = 'Connection failed.';
        fileinput.disabled = 'disabled';
    }
});


$('body').addClass('active');

const startButton = document.querySelector("#startButton");
const stopButton = document.querySelector("#stopButton");
const muteButton = document.querySelector("#muteButton");
const unmuteButton = document.querySelector("#unmuteButton");

startButton.onclick = () => {
    console.log("yes");
    webRTC.resumeVideo();
};

stopButton.onclick = () => {
    console.log("no");

    webRTC.pauseVideo();
};

muteButton.onclick = () => {
    console.log("mute");

    webRTC.mute();
};

unmuteButton.onclick = () => {
    console.log("unmute");

    webRTC.unmute();
};

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}