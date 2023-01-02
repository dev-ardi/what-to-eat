import {  Box, Paper, Typography } from "@mui/material";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import Index from ".";
import App from "./_app";


export default function Food_Card({
	img,
	number,
}: {
	img: string;
	number: number;
}) {
	// Next.js workaround
	img = img ?? "https://food-chooser.com/img/burger.webP";
	number = number ?? 0;

	return (
		<Box sx={{
			display: "flex",
			flexDirection: "column",
			alignItems: "center"
		}}
			onClick={async () => {
				if (window.click_noop == "wait") return;
				if (window.click_noop == "reload") {
					let root = document.getElementById("__next")!;
					unmountComponentAtNode(root);
					render(<Index/>, root );
					window.click_noop = "ready";
				}


				let next = await requestNextImage(number);
				const OtherID = (number === 0 ? 1 : 0).toString();
				const other_img = document.getElementById(OtherID)!;
				
				if (!next) { // HANDLE END OF GAME
					document.getElementById("hint")!.textContent = `You chose ${document.getElementById(`tooltip${number}`)!.textContent}!\nClick the image to play again.\nIf you enjoyed this please share it with your friends`;
					window.click_noop = "wait";
					setTimeout(()=>{
						window.click_noop = "reload"
					}, 1500); // so that the user doesn't accidentally fuck up 
					 other_img.parentElement!.remove()
					genID();
					return;
				}

				other_img.setAttribute("src", next);
				document.getElementById(`tooltip${OtherID}`)!.textContent = getTooltip(next);
			}}
			className="card"
		>
			<img src={img} id={number.toString()}/>
			<Typography
				variant="h6"
				id={`tooltip${number}`}
				color="white">
					{getTooltip(img)}
			</Typography>
		</Box>
	);
}
function getTooltip(str: string): string{
	return str.match("food-chooser\.com\/img\/(.+?)\.webP")![1]
	
}
// Api calls
declare global {
	var id: string | null;
	var click_noop: string;
}

function genID() {
	globalThis.id = Math.round(new Date().getTime() * Math.random()).toString();
}
function criticalError(e: string) {
	// TODO
	console.log(e);
	debugger;
	location.reload();
}

async function fetchJson(url: string): Promise<any> {
	let res = await fetch(`https://food-chooser.com/${url}`, {
		method: "POST",
	});
	if (!res.ok) criticalError(await res.text());
	return res.json();
}

export async function requestFirstImage(): Promise<[string, string]> {
	genID();
	let json = await fetchJson(`getfirst/${globalThis.id}`);
	return [json.img1, json.img2];
}
// Must be 0 or 1!!
export async function requestNextImage(card: number): Promise<string> {
	let json = await fetchJson(`getnext/${globalThis.id}/${card}`);

	if (json.done === true) "TODO trigger ending sequence";
	return json.img;
}
