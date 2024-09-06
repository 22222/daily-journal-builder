// export function base64ToUint8Array(base64: string) {
//   const binaryString = atob(base64);
//   const bytes = new Uint8Array(binaryString.length);
//   for (let i = 0; i < binaryString.length; i++) {
//     bytes[i] = binaryString.charCodeAt(i);
//   }
//   return bytes;
// }

export function convertBase64ToArrayBufferAsync(base64: string) {
  const dataUrl = "data:application/octet-binary;base64," + base64;
  return fetch(dataUrl).then((res) => res.arrayBuffer());
}
