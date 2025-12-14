import React from "react";

const ImageRecognitionResult = ({ result }: { result: any }) => {
  if (!result) {
    return null;
  }

  return (
    <div className="ImageRecognitionResult">
      <h4>Image Recognition Result</h4>
      <ul>
        {result.map((item: any, index: number) => (
          <li key={index}>
            {item.label} - {item.score}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImageRecognitionResult;
