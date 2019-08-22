const reWebSocket = /^(wss|ws):\/\/(\w|-|\.)*(:\d{1,5})?$/;

export function isWebSocketURL(text: string): boolean {
  return !!reWebSocket.exec(text);
}
