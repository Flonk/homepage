import { useState, type CSSProperties } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

interface ZoomableImageProps {
  src: string;
  alt: string;
  initialZoom?: number;
}

const buttonStyle: CSSProperties = {
  padding: "8px 16px",
  cursor: "pointer",
  border: "1px solid #ffa200",
  borderRadius: "0",
  background: "transparent",
  color: "white",
  fontFamily: "monospace",
};

export default function ZoomableImage({
  src,
  alt,
  initialZoom = 1,
}: ZoomableImageProps) {
  const [panningDisabled, setPanningDisabled] = useState(false);

  return (
    <div style={{ padding: "0 2em" }}>
      <TransformWrapper
        initialScale={initialZoom}
        initialPositionX={0}
        initialPositionY={0}
        panning={{ disabled: panningDisabled }}
      >
        {({ resetTransform }) => (
          <>
            <div
              style={{
                marginBottom: "10px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button onClick={() => resetTransform()} style={buttonStyle}>
                Reset
              </button>
              <button
                onClick={() => setPanningDisabled(!panningDisabled)}
                style={buttonStyle}
              >
                {panningDisabled ? "Enable Panning" : "Disable Panning"}
              </button>
            </div>
            <div
              style={{
                boxShadow: "0 0 0.5rem rgba(0,0,0,0.5)",
              }}
            >
              <TransformComponent>
                <img
                  src={src}
                  alt={alt}
                  style={{ border: "0px solid transparent !important" }}
                />
              </TransformComponent>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
