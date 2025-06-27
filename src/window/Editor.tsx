import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { HexColorPicker } from 'react-colorful';
import { getSettings, saveSettings } from '@utils/storage';

interface EditorProps {}

interface Annotation {
  id: string;
  type: 'text' | 'arrow' | 'shape' | 'highlight';
  data: unknown;
}

const Editor: React.FC<EditorProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    backgroundType: 'gradient',
    theme: 'light',
    quality: 'high',
    format: 'png',
  });
  const [selectedTool, setSelectedTool] = useState<
    'select' | 'text' | 'arrow' | 'shape' | 'highlight'
  >('select');
  const [color, setColor] = useState('#3b82f6');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    // Initialize fabric.js canvas
    if (canvasRef.current) {
      fabricCanvasRef.current = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
      });

      // Load settings
      loadSettings();

      // Load image data from storage
      loadImageData();
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadImageData = async () => {
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
  };

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

  // Capture Area
  const handleCaptureArea = async () => {
    setIsCapturing(true);
    // Send message to content script to start area selection
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id!, { action: 'startAreaSelection' }, async (response) => {
      if (response?.success && response.imageData) {
        setImageData(response.imageData);
        loadImageToCanvas(response.imageData);
      }
      setIsCapturing(false);
    });
  };

  // Capture Element
  const handleCaptureElement = async () => {
    setIsCapturing(true);
    // Send message to content script to start element selection
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id!, { action: 'startElementSelection' }, async (response) => {
      if (response?.success && response.imageData) {
        setImageData(response.imageData);
        loadImageToCanvas(response.imageData);
      }
      setIsCapturing(false);
    });
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
          <button onClick={handleCaptureArea} disabled={isCapturing} className="btn-primary">
            Capture Area
          </button>
          <button onClick={handleCaptureElement} disabled={isCapturing} className="btn-primary">
            Capture Element
          </button>
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
