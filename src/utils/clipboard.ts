export async function copyImageToClipboard(imageData: string): Promise<void> {
  try {
    // Convert data URL to blob
    const response = await fetch(imageData);
    const blob = await response.blob();

    // Copy to clipboard using Clipboard API
    type ClipboardItemType = { new (items: Record<string, Blob>): object };
    const nav = window.navigator as {
      clipboard?: { write?: (data: unknown[]) => Promise<void> };
    };
    const ClipboardItemClass = (window as unknown as { ClipboardItem?: ClipboardItemType })
      .ClipboardItem;
    if (nav.clipboard && nav.clipboard.write && ClipboardItemClass) {
      const clipboardItem = new ClipboardItemClass({
        [blob.type]: blob,
      });
      await nav.clipboard.write([clipboardItem]);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = imageData;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw new Error('Failed to copy image to clipboard');
  }
}
