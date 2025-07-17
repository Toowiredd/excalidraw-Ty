# Excalidraw AI API

The Excalidraw AI API allows you to programmatically interact with the Excalidraw editor. You can use it to create, read, update, and delete elements in the scene, start and stop collaboration sessions, and more.

## Getting Started

To get started, you need to get an instance of the `aiApi` object from the `window` object.

```javascript
const aiApi = window.aiApi;
```

Once you have an instance of the `aiApi` object, you can call the methods on it to interact with the editor.

## API Reference

### Scene Manipulation

#### `getSceneElements()`

Returns an array of all the elements in the scene.

```javascript
const elements = await aiApi.getSceneElements();
```

#### `getAppState()`

Returns the current app state.

```javascript
const appState = await aiApi.getAppState();
```

#### `updateScene(scene)`

Updates the scene with the given elements, app state, and files.

```javascript
await aiApi.updateScene({
  elements: [
    {
      type: "rectangle",
      x: 100,
      y: 100,
      width: 100,
      height: 100,
    },
  ],
  appState: {
    viewBackgroundColor: "#ffffff",
  },
});
```

### Collaboration

#### `startCollaboration()`

Starts a new collaboration session.

```javascript
const { roomId, roomKey } = await aiApi.startCollaboration();
```

#### `stopCollaboration()`

Stops the current collaboration session.

```javascript
await aiApi.stopCollaboration();
```

### File Management

#### `exportToBackend(elements, appState, files)`

Exports the scene to the backend and returns a shareable link.

```javascript
const { url } = await aiApi.exportToBackend(elements, appState, files);
```

#### `loadScene(id, privateKey, localDataState)`

Loads a scene from the backend.

```javascript
const scene = await aiApi.loadScene(id, privateKey, localDataState);
```

### AI Services

#### `performNLPTask(text)`

Performs an NLP task on the given text.

```javascript
const result = await aiApi.performNLPTask("Hello, world!");
```

#### `performImageRecognition(image)`

Performs image recognition on the given image.

```javascript
const result = await aiApi.performImageRecognition(image);
```
