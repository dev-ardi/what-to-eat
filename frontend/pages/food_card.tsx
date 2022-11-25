import { Card, CardMedia, Paper } from "@mui/material";
import React from "react";
import { requestNextImage } from "./apicalls";
import { useAsync } from 'react-async-hook';

export default function Food_Card({img, number}: {img: string, number: number}) {
  const getImgSrc = useAsync(requestNextImage, [number]);
	return (
		<Paper onClick={()=>getImgSrc.result} className="card">
			<img src={img} />
		</Paper>
	);
}
