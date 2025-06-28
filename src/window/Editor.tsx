/* global navigator, ClipboardItem, HTMLCanvasElement */
/// <reference lib="dom" />
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { HexColorPicker } from 'react-colorful';
import { useSettings } from '../sidebar/hooks/useSettings';

const Editor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const { settings } = useSettings();
  const [selectedTool, setSelectedTool] = useState<
    'select' | 'text' | 'arrow' | 'shape' | 'highlight'
  >('select');
  const [color, setColor] = useState('#3b82f6');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const loadImageData = useCallback(async () => {
    try {
      // Get window ID to retrieve image data
      const windowId = window.location.search.match(/windowId=(\d+)/)?.[1];
      if (windowId) {
        const result = await chrome.storage.local.get(`window_${windowId}_imageData`);
        const data = result[`window_${windowId}_imageData`];
        if (data) {
          setImageData(data);
          loadImageToCanvas(data);
        }
      }
    } catch (error) {
      console.error('Failed to load image data:', error);
    }
  }, []);

  useEffect(() => {
    // Initialize fabric.js canvas
    if (canvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
      });

      // Load image data from storage
      loadImageData();
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, [loadImageData]);

  const loadImageToCanvas = (dataUrl: string) => {
    if (!fabricCanvasRef.current) return;

    fabric.Image.fromURL(dataUrl, (img) => {
      // Scale image to fit canvas
      const canvas = fabricCanvasRef.current!;
      const scale = Math.min(canvas.width! / img.width!, canvas.height! / img.height!);

      img.scale(scale);
      img.set({
        left: (canvas.width! - img.width! * scale) / 2,
        top: (canvas.height! - img.height! * scale) / 2,
      });

      canvas.clear();
      canvas.add(img);
      canvas.renderAll();
    });
  };

  const handleToolChange = (tool: typeof selectedTool) => {
    setSelectedTool(tool);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = false;
      fabricCanvasRef.current.selection = tool === 'select';
    }
  };

  const addText = () => {
    if (!fabricCanvasRef.current) return;

    const text = new fabric.IText('Double click to edit', {
      left: 100,
      top: 100,
      fontFamily: 'Inter',
      fontSize: 16,
      fill: color,
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  const addArrow = () => {
    if (!fabricCanvasRef.current) return;

    const arrow = new fabric.Path('M 0 0 L 50 0 L 45 -5 M 50 0 L 45 5', {
      left: 100,
      top: 100,
      stroke: color,
      strokeWidth: 2,
      fill: 'transparent',
    });

    fabricCanvasRef.current.add(arrow);
    fabricCanvasRef.current.setActiveObject(arrow);
    fabricCanvasRef.current.renderAll();
  };

  const addShape = () => {
    if (!fabricCanvasRef.current) return;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 60,
      fill: 'transparent',
      stroke: color,
      strokeWidth: 2,
    });

    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  };

  const addHighlight = () => {
    if (!fabricCanvasRef.current) return;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 60,
      fill: color + '40', // 40% opacity
      stroke: color,
      strokeWidth: 1,
    });

    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  };

  const copyToClipboard = async () => {
    if (!fabricCanvasRef.current) return;

    try {
      const dataUrl = fabricCanvasRef.current.toDataURL({
        format: settings.format,
        quality: settings.quality === 'high' ? 1 : settings.quality === 'medium' ? 0.7 : 0.4,
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      console.log('Image copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const saveImage = async () => {
    if (!fabricCanvasRef.current) return;

    try {
      const dataUrl = fabricCanvasRef.current.toDataURL({
        format: settings.format,
        quality: settings.quality === 'high' ? 1 : settings.quality === 'medium' ? 0.7 : 0.4,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `screenshot_${Date.now()}.${settings.format}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  };

  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.clear();
    if (imageData) {
      loadImageToCanvas(imageData);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="toolbar flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Screen Capture Editor
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={copyToClipboard} className="btn-primary">
            Copy to Clipboard
          </button>
          <button onClick={saveImage} className="btn-secondary">
            Save Image
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Tools Panel */}
        <div className="panel w-64 p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Tools</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleToolChange('select')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedTool === 'select'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Select
              </button>
              <button
                onClick={() => handleToolChange('text')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedTool === 'text'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Text
              </button>
              <button
                onClick={() => handleToolChange('arrow')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedTool === 'arrow'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Arrow
              </button>
              <button
                onClick={() => handleToolChange('shape')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedTool === 'shape'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Shape
              </button>
              <button
                onClick={() => handleToolChange('highlight')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  selectedTool === 'highlight'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Highlight
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Color</h3>
            <div className="relative">
              <button
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: color }}
              />
              {isColorPickerOpen && (
                <div className="absolute top-12 left-0 z-10">
                  <HexColorPicker color={color} onChange={setColor} />
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Actions</h3>
            <div className="space-y-2">
              <button onClick={addText} className="w-full btn-secondary text-sm">
                Add Text
              </button>
              <button onClick={addArrow} className="w-full btn-secondary text-sm">
                Add Arrow
              </button>
              <button onClick={addShape} className="w-full btn-secondary text-sm">
                Add Shape
              </button>
              <button onClick={addHighlight} className="w-full btn-secondary text-sm">
                Add Highlight
              </button>
              <button onClick={clearCanvas} className="w-full btn-danger text-sm">
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-4">
          <div className="canvas-container w-full h-full flex items-center justify-center">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
