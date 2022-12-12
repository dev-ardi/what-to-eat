declare global {
  interface Window { id: number | null; }
}

function genID() {
  window.id = new Date().getTime() * Math.random();
}
function criticalError(){ // TODO
  location.reload();
}


export async function requestFirstImage(): Promise<[string, string]>{
  genID();
  let res = await fetch(`apisite.com/getfirst?id=${window.id}`)
  if (!res.ok) criticalError();
  
  let json = await res.json();
  return [json.img1, json.img2]
}
// Must be 0 or 1!!
export async function requestNextImage(card: number): Promise<string> {
  let res = await fetch(`apisite.com/getnext?id=${genID()}&card=${card}`)
  if (!res.ok) criticalError();
  
  let json = await res.json();
  if (json.done === true) "TODO trigger ending sequence";
  return json.img;
}

