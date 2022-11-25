import { Card, CardMedia, Paper } from "@mui/material";
export default function Food_Card() {
	return (
		<Paper onClick={getNextImg} className="card">
			<img src="https://play-lh.googleusercontent.com/IeNJWoKYx1waOhfWF6TiuSiWBLfqLb18lmZYXSgsH1fvb8v1IYiZr5aYWe0Gxu-pVZX3" />
		</Paper>
	);
}
function getNextImg() {}
