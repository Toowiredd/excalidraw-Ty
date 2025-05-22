import {
  DiagramToCodePlugin,
  exportToBlob,
  getTextFromElements,
  MIME_TYPES,
  TTDDialog,
} from "@excalidraw/excalidraw";
import { getDataURL } from "@excalidraw/excalidraw/data/blob";
import { safelyParseJSON } from "@excalidraw/common";
import AIService from "../services/aiService";
import React, { useState } from "react";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

export const AIComponents = ({
  excalidrawAPI,
}: {
  excalidrawAPI: ExcalidrawImperativeAPI;
}) => {
  const [nlpResult, setNlpResult] = useState<any>(null);
  const [nlpError, setNlpError] = useState<string | null>(null);
  const [imageRecResult, setImageRecResult] = useState<any>(null);
  const [imageRecError, setImageRecError] = useState<string | null>(null);

  const handleNLPTask = async (text: string) => {
    setNlpResult(null);
    setNlpError(null);
    if (!text.trim()) {
      setNlpError("Input text cannot be empty.");
      return;
    }
    try {
      const result = await AIService.performNLPTask(text);
      setNlpResult(result.entities); // Assuming result has entities property
      console.log("NLP Task Result:", result);
    } catch (error: any) {
      setNlpError(error.message || "An unexpected error occurred.");
      console.error("NLP Task Error:", error);
    }
  };

  const handleImageRecognition = async (image: HTMLImageElement) => {
    setImageRecResult(null);
    setImageRecError(null);
    if (!image) {
      setImageRecError("No image provided.");
      return;
    }
    try {
      const result = await AIService.performImageRecognition(image);
      setImageRecResult(result.objects); // Assuming result has objects property
      console.log("Image Recognition Result:", result);
    } catch (error: any) {
      setImageRecError(error.message || "An unexpected error occurred.");
      console.error("Image Recognition Error:", error);
    }
  };

  return (
    <>
      <DiagramToCodePlugin
        generate={async ({ frame, children }) => {
          const appState = excalidrawAPI.getAppState();

          const blob = await exportToBlob({
            elements: children,
            appState: {
              ...appState,
              exportBackground: true,
              viewBackgroundColor: appState.viewBackgroundColor,
            },
            exportingFrame: frame,
            files: excalidrawAPI.getFiles(),
            mimeType: MIME_TYPES.jpg,
          });

          const dataURL = await getDataURL(blob);

          const textFromFrameChildren = getTextFromElements(children);

          const response = await fetch(
            `${
              import.meta.env.VITE_APP_AI_BACKEND
            }/v1/ai/diagram-to-code/generate`,
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                texts: textFromFrameChildren,
                image: dataURL,
                theme: appState.theme,
              }),
            },
          );

          if (!response.ok) {
            const text = await response.text();
            const errorJSON = safelyParseJSON(text);

            if (!errorJSON) {
              throw new Error(text);
            }

            if (errorJSON.statusCode === 429) {
              return {
                html: `<html>
                <body style="margin: 0; text-align: center">
                <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; height: 100vh; padding: 0 60px">
                  <div style="color:red">Too many requests today,</br>please try again tomorrow!</div>
                  </br>
                  </br>
                  <div>You can also try <a href="${
                    import.meta.env.VITE_APP_PLUS_LP
                  }/plus?utm_source=excalidraw&utm_medium=app&utm_content=d2c" target="_blank" rel="noopener">Excalidraw+</a> to get more requests.</div>
                </div>
                </body>
                </html>`,
              };
            }

            throw new Error(errorJSON.message || text);
          }

          try {
            const { html } = await response.json();

            if (!html) {
              throw new Error("Generation failed (invalid response)");
            }
            return {
              html,
            };
          } catch (error: any) {
            throw new Error("Generation failed (invalid response)");
          }
        }}
      />

      <TTDDialog
        onTextSubmit={async (input) => {
          try {
            const response = await fetch(
              `${
                import.meta.env.VITE_APP_AI_BACKEND
              }/v1/ai/text-to-diagram/generate`,
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: input }),
              },
            );

            const rateLimit = response.headers.has("X-Ratelimit-Limit")
              ? parseInt(response.headers.get("X-Ratelimit-Limit") || "0", 10)
              : undefined;

            const rateLimitRemaining = response.headers.has(
              "X-Ratelimit-Remaining",
            )
              ? parseInt(
                  response.headers.get("X-Ratelimit-Remaining") || "0",
                  10,
                )
              : undefined;

            const json = await response.json();

            if (!response.ok) {
              if (response.status === 429) {
                return {
                  rateLimit,
                  rateLimitRemaining,
                  error: new Error(
                    "Too many requests today, please try again tomorrow!",
                  ),
                };
              }

              throw new Error(json.message || "Generation failed...");
            }

            const generatedResponse = json.generatedResponse;
            if (!generatedResponse) {
              throw new Error("Generation failed...");
            }

            return { generatedResponse, rateLimit, rateLimitRemaining };
          } catch (err: any) {
            throw new Error("Request failed");
          }
        }}
      />

      <div>
        <h3>AI Tools</h3>
        <div>
          <label htmlFor="nlpInput">NLP Task:</label>
          <input
            type="text"
            id="nlpInput"
            placeholder="Enter text for NLP task"
            onBlur={(e) => handleNLPTask(e.target.value)}
          />
          {nlpError && <div style={{ color: 'red' }}>Error: {nlpError}</div>}
          {nlpResult && <div>Result: {JSON.stringify(nlpResult)}</div>}
        </div>
        <div>
          <label htmlFor="imageInput">Image Recognition:</label>
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => handleImageRecognition(img);
              }
            }}
          />
          {imageRecError && <div style={{ color: 'red' }}>Error: {imageRecError}</div>}
          {imageRecResult && <div>Result: {JSON.stringify(imageRecResult)}</div>}
        </div>
      </div>
    </>
  );
};
