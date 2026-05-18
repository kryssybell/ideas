import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Arrow, Transformer } from 'react-konva';
import useImage from 'use-image';
import { v4 as uuidv4 } from 'uuid';
import type { Annotation, ArrowAnnotation, TextAnnotation, ToolMode } from './types';

interface Props {
  imageDataUrl: string;
  annotations: Annotation[];
  onChange: (annotations: Annotation[]) => void;
  tool: ToolMode;
  selectedColor: string;
  readOnly?: boolean;
}

function BgImage({ src }: { src: string }) {
  const [image] = useImage(src);
  return <KonvaImage image={image} />;
}

export default function AnnotationCanvas({
  imageDataUrl,
  annotations,
  onChange,
  tool,
  selectedColor,
  readOnly = false,
}: Props) {
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawingArrow, setDrawingArrow] = useState<{ x1: number; y1: number } | null>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const maxW = containerRef.current?.clientWidth ?? 800;
      const scale = Math.min(1, maxW / img.width);
      setStageDimensions({ width: img.width * scale, height: img.height * scale });
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  useEffect(() => {
    if (!transformerRef.current) return;
    if (selectedId) {
      const node = stageRef.current?.findOne(`#${selectedId}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  function handleStageMouseDown(e: any) {
    if (readOnly) return;
    const pos = stageRef.current.getPointerPosition();

    if (tool === 'text') {
      const text = prompt('Enter annotation text:');
      if (!text) return;
      const newAnnotation: TextAnnotation = {
        id: uuidv4(),
        type: 'text',
        x: pos.x,
        y: pos.y,
        text,
        color: selectedColor,
      };
      onChange([...annotations, newAnnotation]);
      return;
    }

    if (tool === 'arrow') {
      if (!drawingArrow) {
        setDrawingArrow({ x1: pos.x, y1: pos.y });
      } else {
        const newAnnotation: ArrowAnnotation = {
          id: uuidv4(),
          type: 'arrow',
          points: [drawingArrow.x1, drawingArrow.y1, pos.x, pos.y],
          color: selectedColor,
        };
        onChange([...annotations, newAnnotation]);
        setDrawingArrow(null);
      }
      return;
    }

    if (tool === 'select') {
      if (e.target === e.target.getStage()) {
        setSelectedId(null);
      }
    }
  }

  function handleDelete() {
    if (!selectedId) return;
    onChange(annotations.filter((a) => a.id !== selectedId));
    setSelectedId(null);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        handleDelete();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, annotations]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {drawingArrow && !readOnly && (
        <div style={{
          position: 'absolute', top: 4, left: 4, background: '#f59e0b',
          color: '#fff', fontSize: 12, padding: '2px 8px', borderRadius: 4, zIndex: 10,
        }}>
          Click to set arrow end point
        </div>
      )}
      <Stage
        ref={stageRef}
        width={stageDimensions.width}
        height={stageDimensions.height}
        onMouseDown={handleStageMouseDown}
        style={{ cursor: tool === 'text' ? 'text' : tool === 'arrow' ? 'crosshair' : 'default' }}
      >
        <Layer>
          <BgImage src={imageDataUrl} />
          {annotations.map((ann) => {
            if (ann.type === 'text') {
              return (
                <Text
                  key={ann.id}
                  id={ann.id}
                  x={ann.x}
                  y={ann.y}
                  text={ann.text}
                  fill={ann.color}
                  fontSize={16}
                  fontStyle="bold"
                  draggable={!readOnly && tool === 'select'}
                  onClick={() => !readOnly && tool === 'select' && setSelectedId(ann.id)}
                  onDragEnd={(e) => {
                    const updated = annotations.map((a) =>
                      a.id === ann.id ? { ...a, x: e.target.x(), y: e.target.y() } : a
                    );
                    onChange(updated);
                  }}
                  shadowColor="black"
                  shadowBlur={3}
                  shadowOpacity={0.5}
                />
              );
            }
            if (ann.type === 'arrow') {
              return (
                <Arrow
                  key={ann.id}
                  id={ann.id}
                  points={ann.points}
                  stroke={ann.color}
                  strokeWidth={3}
                  fill={ann.color}
                  pointerLength={12}
                  pointerWidth={10}
                  onClick={() => !readOnly && tool === 'select' && setSelectedId(ann.id)}
                />
              );
            }
            return null;
          })}
          {!readOnly && <Transformer ref={transformerRef} />}
        </Layer>
      </Stage>
    </div>
  );
}
