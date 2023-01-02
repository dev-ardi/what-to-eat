import { Box, Typography } from "@mui/material";
import Head from "next/head";
import React from "react";
import { requestFirstImage } from "./food_card";
import Food_Card from "./food_card";
import Header from "./_header";
import { useAsync } from "react-async-hook";

export  default function Index() {	
	return( <App/>)
}
function App(){

	const x = useAsync(requestFirstImage, []);
	return (
		<>
			<Head_ />
			<Header />
		{
			x.loading ? null : 
			<div className="card_container">
			<Typography
						id="hint"
						variant="h5"
						component="h1"
						sx={{
							display: "flex",
							fontFamily: "sans-serif",
							fontWeight: 600,
							color: "white",
							textAlign: "center",
							whiteSpace: "break-spaces",
							justifyContent: "center",
						}}
			>
			Click the one you prefer
			</Typography>

				<Box sx={{display: "flex", 
				
							justifyContent: "center",
				width: "100%", height: "100%"
			}}>

		<Food_Card img={x.result![0]} number={0} />
		<Food_Card img={x.result![1]} number={1} />
				</Box>
	</div>
	}	
		</>
	);
}
function Head_() {
	return (
		<Head>
			<title>Food chooser - easily find out what to eat today</title>
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
