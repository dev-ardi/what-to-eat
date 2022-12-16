import { Box } from "@mui/material";
import Head from "next/head";
import React from "react";
import { requestFirstImage } from "./food_card";
import Food_Card from "./food_card";
import Header from "./_header";
import { useAsync } from "react-async-hook";

export  default function Index() {
	const x = useAsync(requestFirstImage, []);
	return (
		<div>
			<Head_ />
			<Header />
		{
			x.loading ? null : 
			<Box className="card_container">
		<Food_Card img={x.result![0]} number={0} />
		<Food_Card img={x.result![1]} number={1} />
	</Box>
	}	
		</div>
	);
}

function CardContainer(img1: string, img2: string) {
}

function Head_() {
	return (
		<Head>
			<title>What to eat? - easily find out what to eat today</title>
			<meta
				name="viewport"
				content="initial-scale=1, width=device-width"
			/>
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
			/>
		</Head>
	);
}
