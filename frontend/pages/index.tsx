import { Box } from "@mui/material";
import Head from "next/head";
import React from "react";
import { requestFirstImage } from "./apicalls";
import Food_Card from "./food_card";
import Header from "./_header";

export default function Index() {
	const [dataReady, setDataReady] = React.useState(false);
	let component;
	requestFirstImage()
	.then(res=>{
		component = CardContainer(res[0],res[1]);
		setDataReady(true);
	})
	.catch(e=>console.error(e));


	return (
		<div>
			<Head_ />
			<Header />
		{dataReady ? component : undefined}
		</div>
	);
}

function CardContainer(img1: string, img2:string){
			<Box className="card_container" >
				<Food_Card img={img1} number={1}/>
				<Food_Card img={img2} number={2}/>
			</Box>

}

function Head_() {
	return (
		<Head>
			<title>What to eat? - easily find out what to eat today</title>
			<meta name="viewport" content="initial-scale=1, width=device-width" />
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
			/>
		</Head>
	);
}
