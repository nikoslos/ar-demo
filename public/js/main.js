function vector3ToString(vector3) {
    return `${vector3.x} ${vector3.y} ${vector3.z}`
}

function getModelIdIndexFromId(modelId) {
    var modelIndex = -1
    viewModel.models().forEach((val, index) => {
        if (val.id === modelId) {
            modelIndex = index
        }
    })
    return modelIndex
}

function ViewModel() {
    this.models = ko.observableArray([
        {
            src: "models/ammo1.glb",
            id: "ammonitModel1",
            text: "Ammonit 1"
        },
        {
            src: "models/Rock.glb",
            id: "rock",
            text: "Stein"
        },

        {
            src: "models/Ammonit2.glb",
            id: "ammonitModel2",
            text: "Ammonit 2"
        },
        {
            src: "models/Brachiopode.glb",
            id: "brachiopodeModel",
            text: "Brachiopode"
        }]),
        this.labels = ko.observableArray([
            {
                point1: "0 0.7 0",
                point2: "1 1 1",
                text: "An dieser Stelle gibt es viel zu sehen!"
            },
            {
                point1: "4 0 4",
                point2: "6 0 6",
                text: "An dieser Stelle gibt es viel zu sehen!"
            },
        ]),
        this.currentModelIndex = ko.observable(0),
        this.color = ko.observable("red"),
        this.hasModels = ko.computed(function () {
            return this.models().length > 0;
        }, this),
        this.currentModel = ko.computed(function () {
            return this.models()[this.currentModelIndex()]?.id;
        }, this)
}
var viewModel = new ViewModel();
ko.applyBindings(viewModel);

/**
  * We need to change the model with DOM because using a model binds it to an a-entity forever. 
  * Changing the model via data binding causes warnings and doesn't work. So instead of figuring
  * a way how to deal with the binding we delete the a-entity with the model and and add a new 
  * a-entity with the new model to it.
  */
function setCurrentModel(modelId) {
    var newChild = currentModel.cloneNode(false);
    var parent = currentModel.parentNode;
    currentModel.remove();
    parent.appendChild(newChild)
    currentModel.setAttribute("gltf-model", "#" + modelId)
}
// When updating currentModel -> execute function setCurrentModel
viewModel.currentModel.subscribe((newVal) => setCurrentModel(newVal))
viewModel.models.subscribe((newVal) => (circleDisplay()))

/**
 * Handle Connection to server
 **/
var socket = io();

socket.on('add label', label => {
    viewModel.labels.push(label);
});

// Recieve all labels
socket.on('labels', labels => {
    viewModel.labels(labels);
});

socket.on('current model', function (modelId) {
    var modelIndex = getModelIdIndexFromId(modelId)
    viewModel.currentModelIndex(modelIndex)
});
