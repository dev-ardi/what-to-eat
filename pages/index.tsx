import { Box } from "@mui/material";
import Head from "next/head";
import Food_Card from "./food_card";
import Header from "./_header";

export default function Index() {

	


	return (
		<div>
			<Head_ />
			<Header />
			<Box className="card_container" >
				<Food_Card/>
				<Food_Card/>
			</Box>
		</div>
	);
}

function Head_() {
	return (
		<Head>
			<title>What do you want to eat today?</title>
			<meta name="viewport" content="initial-scale=1, width=device-width" />
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
			/>
		</Head>
	);
}
