import * as React from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export interface ImageZoomProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  zoomMargin?: number;
}

export function ImageZoom({ zoomMargin = 24, ...props }: ImageZoomProps) {
  return (
    <Zoom zoomMargin={zoomMargin}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...props} />
    </Zoom>
  );
}

export default ImageZoom;
