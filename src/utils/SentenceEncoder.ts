import * as tf from "@tensorflow/tfjs-node";
import * as use from "@tensorflow-models/universal-sentence-encoder";

let loadedModel: any;

async function loadModel() {
    const model = await use.load();
    loadedModel = model;
}

export async function getLoadedModel() {
    if (!loadedModel) {
        await loadModel();
    }
    return loadedModel;
}