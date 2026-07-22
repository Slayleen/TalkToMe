// Prompts user for mic permission, records via MediaRecorder (web + iOS/Android WebView),
// returns Blob when stopped. Simple wrapper for the Speaking session.
let mediaRec: MediaRecorder | null = null;
let chunks: BlobPart[] = [];
let stream: MediaStream | null = null;

export async function startRecording(): Promise<void> {
  if (mediaRec) return;
  chunks = [];
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // Prefer webm/opus (widely supported); fallback to default
  const mime = MediaRecorder.isTypeSupported?.('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : (MediaRecorder.isTypeSupported?.('audio/webm') ? 'audio/webm' : undefined);
  mediaRec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  mediaRec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  mediaRec.start();
}

export async function stopRecording(): Promise<Blob | null> {
  if (!mediaRec) return null;
  return new Promise((resolve) => {
    mediaRec!.onstop = () => {
      const blob = new Blob(chunks, { type: mediaRec!.mimeType || 'audio/webm' });
      // stop mic
      stream?.getTracks().forEach((t) => t.stop());
      mediaRec = null;
      stream = null;
      chunks = [];
      resolve(blob);
    };
    mediaRec!.stop();
  });
}

export function isRecording(): boolean {
  return !!mediaRec && mediaRec.state === 'recording';
}
