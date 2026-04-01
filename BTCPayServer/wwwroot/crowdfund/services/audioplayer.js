function playSound(path) {
    // audio supported?
    if (typeof window.Audio === 'function') {
        const audioElem = new Audio(path);

        audioElem.play().catch(function(){
        })
    }
}

function playRandomSound(){
    const sound  =  srvModel.sounds[Math.floor((Math.random() *  srvModel.sounds.length) )];
    playSound(sound);
}
