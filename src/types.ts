export type ToolMode = 'select' | 'text' | 'arrow';

export interface TextAnnotation {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  color: string;
}

export interface ArrowAnnotation {
  id: string;
  type: 'arrow';
  points: [number, number, number, number]; // x1, y1, x2, y2
  color: string;
}

export type Annotation = TextAnnotation | ArrowAnnotation;

export interface Review {
  id: string;
  imageDataUrl: string;
  imageName: string;
  annotations: Annotation[];
  createdAt: number;
  reviewerFeedback?: ReviewerComment[];
}

export interface ReviewerComment {
  id: string;
  annotationId?: string;
  text: string;
  createdAt: number;
}
