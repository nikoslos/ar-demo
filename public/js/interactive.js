AFRAME.registerComponent('clickhandler', {
    init: function () {
        this.el.addEventListener('click', function (event) {
            var realPos = new THREE.Vector3();
            event.detail.intersection.object.getWorldPosition(realPos)
            var point = event.detail.intersection.point;
            point.add(realPos.negate())
            var normal = event.detail.intersection.face.normal;

            var secondPointDistance = 2;
            var normal = point.clone();
            var secondPoint = new THREE.Vector3()
            var thirdPoint = event.target.object3D.position.clone();
            thirdPoint.negate()
            normal.add(thirdPoint)
            normal.y *= 0.1;
            normal.normalize()

            // marker, point, secondPoint, intersectionSphere, intersectionSphere2, line are references to html elements with the according id

            secondPoint.add(point);
            secondPoint.addScaledVector(normal, secondPointDistance)

            addLabel(point, secondPoint, "New Point")
        });
    }
});

AFRAME.registerComponent('clickable', {
    init: function () {
        this.el.classList.add("clickable");
    }
});

