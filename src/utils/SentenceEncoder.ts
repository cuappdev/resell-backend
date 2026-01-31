import "@tensorflow/tfjs-node";
import use = require("@tensorflow-models/universal-sentence-encoder");

let loadedModel: use.UniversalSentenceEncoder | null = null;

async function loadModel(): Promise<void> {
  const model = await use.load();
  loadedModel = model;
}

export async function getLoadedModel(): Promise<use.UniversalSentenceEncoder> {
  if (!loadedModel) {
    await loadModel();
  }
  if (!loadedModel) {
    throw new Error("Failed to load sentence encoder model");
  }
  return loadedModel;
}
