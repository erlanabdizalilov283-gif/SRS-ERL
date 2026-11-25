const zagruzitFayly = document.getElementById('zagruzitFayly');
const spisokTrekovEl = document.getElementById('spisokTrekov');
const playPauzaBtn = document.getElementById('playPauzaBtn');
const predVesh = document.getElementById('predVesh');
const sledVesh = document.getElementById('sledVesh');
const nazvanieTreka = document.getElementById('nazvanieTreka');
const progressPleyera = document.getElementById('progressPleyera');
const audioCanvas = document.getElementById('audioCanvas');
const ctx = audioCanvas.getContext('2d');
let pleshList = [];
let tekuuschiIndex = 0;
let audio = new Audio();
let audioCtx, analizator, istochnik, dostupVizualizatsii = false;
zagruzitFayly.addEventListener('change', function(event) {
    const fayly = event.target.files;   
    for (let i = 0; i < fayly.length; i++) {
        const fayl = fayly[i];
        const urlFayla = URL.createObjectURL(fayl);    
        pleshList.push({
            name: fayl.name,
            url: urlFayla
        });
    }
    otrisovatPleylist();
    if (pleshList.length > 0 && audio.paused && tekuuschiIndex === 0 && audio.src === '') {
        zagruzitTrek(0);
    }
});
function otrisovatPleylist() {
    spisokTrekovEl.innerHTML = '';  
    pleshList.forEach((trec, index) => {
        let li = document.createElement('li');
        li.innerText = (index + 1) + '. ' + trec.name;   
        if (index === tekuuschiIndex) {
            li.classList.add('aktivnyy');
        }
        li.addEventListener('click', function() {
            tekuuschiIndex = index;
            zagruzitTrek(tekuuschiIndex);
            vklyuchitPley();
        });
        spisokTrekovEl.appendChild(li);
    });
}
function zagruzitTrek(index) {
    if (pleshList.length === 0) return;
    audio.src = pleshList[index].url;
    nazvanieTreka.innerText = pleshList[index].name;
    otrisovatPleylist();
}
function vklyuchitPley() {
    if (pleshList.length === 0) return;
    if (!dostupVizualizatsii) {
        nastroitAudioKontekst();
        dostupVizualizatsii = true;
    }
    if (audio.paused) {
        audio.play();
        playPauzaBtn.innerText = '⏸';
    } else {
        audio.pause();
        playPauzaBtn.innerText = '▶';
    }
}
playPauzaBtn.addEventListener('click', vklyuchitPley);
sledVesh.addEventListener('click', function() {
    if (pleshList.length === 0) return;
    tekuuschiIndex = (tekuuschiIndex + 1) % pleshList.length;
    zagruzitTrek(tekuuschiIndex);
    audio.play();
    playPauzaBtn.innerText = '⏸';
});
predVesh.addEventListener('click', function() {
    if (pleshList.length === 0) return;
    tekuuschiIndex = (tekuuschiIndex - 1 + pleshList.length) % pleshList.length;
    zagruzitTrek(tekuuschiIndex);
    audio.play();
    playPauzaBtn.innerText = '⏸';
});
audio.addEventListener('ended', function() {
    sledVesh.click();
});
audio.addEventListener('timeupdate', function() {
    if (audio.duration) {
        let procent = (audio.currentTime / audio.duration) * 100;
        progressPleyera.value = procent;
    }
});
progressPleyera.addEventListener('input', function() {
    if (audio.duration) {
        let vremya = (progressPleyera.value / 100) * audio.duration;
        audio.currentTime = vremya;
    }
});
function nastroitAudioKontekst() {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analizator = audioCtx.createAnalyser();      
        istochnik = audioCtx.createMediaElementSource(audio);
        istochnik.connect(analizator);
        analizator.connect(audioCtx.destination);
        analizator.fftSize = 64;
        risovatVizualizatsiyu();
    } catch (e) {
        console.log("Ошибка аудио контекста: ", e);
    }
}
function risovatVizualizatsiyu() {
    requestAnimationFrame(risovatVizualizatsiyu);
    if (!analizator) return;
    let buferChastot = new Uint8Array(analizator.frequencyBinCount);
    analizator.getByteFrequencyData(buferChastot);
    ctx.clearRect(0, 0, audioCanvas.width, audioCanvas.height);
    let shirinaPolosy = (audioCanvas.width / buferChastot.length) * 2.5;
    let x = 0;
    for (let i = 0; i < buferChastot.length; i++) {
        let vysotaPolosy = buferChastot[i] / 2;
        ctx.fillStyle = 'rgb(13, 110, 253)';
        ctx.fillRect(x, audioCanvas.height - vysotaPolosy, shirinaPolosy, vysotaPolosy);
        x += shirinaPolosy + 2;
    }
}