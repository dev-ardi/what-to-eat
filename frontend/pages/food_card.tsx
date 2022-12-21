import {  Paper } from "@mui/material";
import React, { useState } from "react";

export default function Food_Card({
	img,
	number,
}: {
	img: string;
	number: number;
}) {
	const [src, setSrc] = useState(img);
	return (
		<Paper
			onClick={async () => {
				let next = await requestNextImage(number);
				setSrc(next);
			}}
			className="card"
		>
			<img src={src} />
		</Paper>
	);
}

// Api calls
declare global {
	var id: string | null;
}

function genID() {
	globalThis.id = Math.round(new Date().getTime() * Math.random()).toString();
}
function criticalError(e: string) {
	// TODO
	alert(e);
	//location.reload();
}

async function fetchJson(url: string): Promise<any> {
	console.log(url);
	let res = await fetch(`https://food-chooser.com/${url}`, {
		method: "POST",
		mode: "cors",
	});
	console.log("2");
	if (!res.ok) criticalError(await res.text());
	return res.json();
}

export async function requestFirstImage(): Promise<[string, string]> {
	genID();
	let json = await fetchJson(`getfirst/${globalThis.id}`);
	console.log(json);
	return [json.img1, json.img2];
}
// Must be 0 or 1!!
export async function requestNextImage(card: number): Promise<string> {
	let json = await fetchJson(`getnext/${globalThis.id}/${card}`);

	if (json.done === true) "TODO trigger ending sequence";
	return json.img;
}
