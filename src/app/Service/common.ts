export function getUrl(protocol: string, host: string, port: string, endpoint: string): string {
  return protocol + '://' + host + (port !== '' ? ':' + port : '') + '/' + endpoint;
}
export function getLimitedString(value:string, limit:number){
  if(value.length < limit){
      return value;
  }
  return value.substring(0, limit)+"...";
}