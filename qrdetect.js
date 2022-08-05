const detect = (data) => {
    if (!ready) return
    
    const cameraTexture = data.tex
    
    gl.bindTexture(gl.TEXTURE_2D, cameraTexture)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, cameraTexture, 0)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    const imageData = new Uint8ClampedArray(pixels)

    const code = false;
    // const code = jsQR(imageData, width, height)

    if (code) {
        console.log("Found QR code", code);
    }
}

const init = (data) => {
    height = data.height
    width = data.width
    gl = data.glctx
    fbo = gl.createFramebuffer()
    pixels = new Uint8Array(height*width*4)
    ready = true
}


let height = null
let width = null
let gl = null
let fbo = null
let pixels = null
let ready = false

window.addEventListener('parameters', (data) => init(data.detail), { once: true })
window.addEventListener('newCameraTexture', (data) => detect(data.detail))