const mvCustom = {
    data() {
        return {
            mouseMoved: false,
            pressed: false,
            panning: false,
            modelViewer: undefined,
            panX: undefined,
            panY: undefined,
            metersPerPixel: undefined,
            startX: undefined,
            startY: undefined,
            lastX: undefined,
            lastY: undefined,
            modelSrc: this.src
        }
    },
    emits: ['hit'],
    props: {
        src: String,
    },
    methods: {
        startPan() {
            const orbit = this.modelViewer.getCameraOrbit();
            const { theta, phi, radius } = orbit;
            const psi = theta - this.modelViewer.turntableRotation;
            this.metersPerPixel = 0.75 * radius / this.modelViewer.getBoundingClientRect().height;
            this.panX = [-Math.cos(psi), 0, Math.sin(psi)];
            this.panY = [
                -Math.cos(phi) * Math.sin(psi),
                Math.sin(phi),
                -Math.cos(phi) * Math.cos(psi)
            ];
            this.modelViewer.interactionPrompt = 'none';
        },
        movePan(thisX, thisY) {
            const dx = (thisX - this.lastX) * this.metersPerPixel;
            const dy = (thisY - this.lastY) * this.metersPerPixel;
            this.lastX = thisX;
            this.lastY = thisY;

            const target = this.modelViewer.getCameraTarget();
            target.x += dx * this.panX[0] + dy * this.panY[0];
            target.y += dx * this.panX[1] + dy * this.panY[1];
            target.z += dx * this.panX[2] + dy * this.panY[2];
            this.modelViewer.cameraTarget = `${target.x}m ${target.y}m ${target.z}m`;
        },
        hitAddAnnotation(event) {
            const hit = this.modelViewer.positionAndNormalFromPoint(event.clientX, event.clientY);
            if (hit != null) {
                this.$emit('hit', hit)
            }
        },
        handleMouseDown(event) {
            this.pressed = true;
            this.startX = event.clientX;
            this.startY = event.clientY;
            this.panning = event.button === 2 || event.ctrlKey || event.metaKey ||
                event.shiftKey;
            if (!this.panning)
                return;
            this.lastX = this.startX;
            this.lastY = this.startY;
            this.startPan()
            event.stopPropagation();
        },
        handleMouseMove(event) {
            if (!this.mouseMoved && this.pressed) {
                this.mouseMoved = true;
            }
            if (!this.panning) return;
            this.movePan(event.clientX, event.clientY);
            event.stopPropagation();
        },
        handleMouseUp(event) {
            if (!this.mouseMoved && !this.panning) {
                this.hitAddAnnotation(event);
            }
            this.mouseMoved = false;
            this.pressed = false;
            this.panning = false;
        },
        handleTouchStart(event) {
            const { targetTouches, touches } = event;
            this.startX = targetTouches[0].clientX;
            this.startY = targetTouches[0].clientY;
            this.panning = targetTouches.length === 2 && targetTouches.length === touches.length;
            if (!this.panning)
                return;

            this.lastX = 0.5 * (targetTouches[0].clientX + targetTouches[1].clientX);
            this.lastY = 0.5 * (targetTouches[0].clientY + targetTouches[1].clientY);
            this.startPan();
        },
        handleTouchMove(event) {
            console.log("Touchmove");

            if (!this.panning || event.targetTouches.length !== 2)
                return;
            const { targetTouches } = event;
            const thisX = 0.5 * (targetTouches[0].clientX + targetTouches[1].clientX);
            const thisY = 0.5 * (targetTouches[0].clientY + targetTouches[1].clientY);
            this.movePan(thisX, thisY);

        },
        handleTouchEnd(event) {
            if (event.targetTouches.length === 0) {
                this.hitAddAnnotation(event.changedTouches[0]);
            }
            this.mouseMoved = false;
            this.pressed = false;
            this.panning = false;
        }
    },
    mounted() {
        this.modelViewer = this.$refs.modelviewer;
        console.log("MOunted Component")
        self.addEventListener('mousedown', this.handleMouseDown, true);
        self.addEventListener('mousemove', this.handleMouseMove, true);
        self.addEventListener('mouseup', this.handleMouseUp, true)

        this.modelViewer.addEventListener("touchstart", this.handleTouchStart, true);
        this.modelViewer.addEventListener("touchmove", this.handleTouchMove, true);
        this.modelViewer.addEventListener("touchend", this.handleTouchEnd, true);
    },
    template: `
    <model-viewer ref="modelviewer" bounds="tight" alt="Model-Viewer Raycast Annotation Test"
    :src="modelSrc" ar="" ar-modes="webxr scene-viewer quick-look" camera-controls=""
    poster="res/poster.png" seamless-poster="" shadow-intensity="5.3" shadow-softness="1"
    ar-status="not-presenting">  
    <!-- AR Overlays -->
    <button slot="ar-button" id="ar-button">
        View in your space
    </button>

    <div id="ar-prompt">
        <img src="res/ar_hand_prompt.png">
    </div>

    <button id="ar-failure">
        AR is not tracking!
    </button>
    <slot></slot>
    </model-viewer>
    `
}
