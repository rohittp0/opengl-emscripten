

// Utililty function to trigger camera texture creation event and access texture data
const eventDispatch = (name, data) => {
    const e = new CustomEvent(name, {detail: data})
    window.dispatchEvent(e)
}



const runXR = (frame) => {
    // Pose provides extrinsic, linear velocity, angular velocity and views
    const pose = frame.getViewerPose(refSpace);
    if (!pose) {
        return;
    } // Not guaranteed that pose be available for every XRFrame

    // Query different views in pose, for AR view.camera contains the camera texture
    for (const view of pose.views) {
        if (view.camera) {

            const {baseLayer} = session.renderState

            const viewport = baseLayer.getViewport(view)

            const {width, height} = viewport
            // Raw Camera Access is implemented with getCameraImage()
            const cameraTexture = glBinding.getCameraImage(view.camera);


            // window can listen to this event to access cameraTexture


            eventDispatch('newCameraTexture', {tex: cameraTexture})
            eventDispatch('parameters', {glctx: ctx, height: height, width: width})
            render(cameraTexture);
        }
    }


}

const requestSession = async () => {
    // Session type and features
    const sessionType = 'immersive-ar'
    const sessionInit = {
        requiredFeatures: ['local', 'camera-access']
    }

    // Request Session and update baselayer
    session = await navigator.xr.requestSession(sessionType, sessionInit)
    session.updateRenderState({
        baseLayer: new XRWebGLLayer(session, ctx)
    })

    refSpace = await session.requestReferenceSpace(sessionInit.requiredFeatures[0]);
    // XRWebGLBinding interface is used to create layers that have a GPU backend
    glBinding = new XRWebGLBinding(session, ctx)
    const renderLoop = (time, frame) => {
        session.requestAnimationFrame(renderLoop)

        runXR(frame)

    }

    session.requestAnimationFrame(renderLoop)
}

const startWebXRSession = () => {
    // Check if WebXR supported
    if (navigator.xr) {
        // Check if AR supported
        navigator.xr.isSessionSupported('immersive-ar')
            .then((supported) => supported ? requestSession() : console.log("AR not supported"))
    } else console.log("WebXR not supported")
}

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('webgl', {xrCompatible: true})


function render(image) {
    // this line is not needed if you don't
    // care that the canvas drawing buffer size
    // matches the canvas display size
    twgl.resizeCanvasToDisplaySize(ctx.canvas);

    ctx.viewport(0, 0, 200, 200);
    ctx.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(ctx, programInfo, bufferInfo);

    const canvasAspect = ctx.canvas.clientWidth / ctx.canvas.clientHeight;
    const imageAspect = image.width / image.height;
    let scaleX;
    let scaleY;


    scaleY = 1;
    scaleX = imageAspect / canvasAspect;
    if (scaleX > 1) {
        scaleY = 1 / scaleX;
        scaleX = 1;
    }


    twgl.setUniforms(programInfo, {
        u_matrix: [
            scaleX, 0, 0, 0,
            0, -scaleY, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ],
    });
    ctx.drawArrays(ctx.TRIANGLES, 0, 6);
}

let glBinding = null
let refSpace = null
let session = null
const button = document.getElementById('ar')
button.onclick = () => startWebXRSession()


