export function useDownload(data: Blob, filename: string) {
  const a = document.createElement('a');
  const url = window.URL.createObjectURL(data);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
