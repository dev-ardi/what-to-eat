declare global {
  interface Window { id: number | null; }
}

function genID() {
  window.id = new Date().getTime() * Math.random();
}

export async function requestFirstImage(): Promise<[string, string]>{
  genID();
  let res = await fetch(`apisite.com/requestFirst?id=${window.id}`)
  let json = await res.json();
  if (json.dupeKeyError) return requestFirstImage()
  if (json.error) throw new Error(json.error);
  return [json.img1, json.img2]
}
export async function requestNextImage(card: number): Promise<string> {
  let res = await fetch(`apisite.com/requestNext?id=${genID()}&card=${card}`)
  let json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.img;
}