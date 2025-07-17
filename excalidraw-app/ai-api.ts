import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { CollabAPI } from "./collab/Collab";
import AIService from "./services/aiService";
import { exportToBackend, loadScene } from "./data";
import { resolvablePromise } from "@excalidraw/common/utils";

class AiApi {
  private excalidrawAPI: ExcalidrawImperativeAPI | null = null;
  private collabAPI: CollabAPI | null = null;
  private apiReady = resolvablePromise<void>();

  public initialize(
    excalidrawAPI: ExcalidrawImperativeAPI,
    collabAPI: CollabAPI,
  ) {
    this.excalidrawAPI = excalidrawAPI;
    this.collabAPI = collabAPI;
    this.apiReady.resolve();
  }

  public async getSceneElements() {
    await this.apiReady;
    return this.excalidrawAPI?.getSceneElements();
  }

  public async getAppState() {
    await this.apiReady;
    return this.excalidrawAPI?.getAppState();
  }

  public async updateScene(scene: {
    elements?: any[];
    appState?: any;
    files?: any;
  }) {
    await this.apiReady;
    this.excalidrawAPI?.updateScene(scene);
  }

  public async startCollaboration() {
    await this.apiReady;
    return this.collabAPI?.startCollaboration(null);
  }

  public async stopCollaboration() {
    await this.apiReady;
    this.collabAPI?.stopCollaboration(false);
  }

  public async exportToBackend(elements: any[], appState: any, files: any) {
    return exportToBackend(elements, appState, files);
  }

  public async loadScene(id: string, privateKey: string, localDataState: any) {
    return loadScene(id, privateKey, localDataState);
  }

  public async performNLPTask(text: string) {
    return AIService.performNLPTask(text);
  }

  public async performImageRecognition(image: HTMLImageElement) {
    return AIService.performImageRecognition(image);
  }
}

export const aiApi = new AiApi();
