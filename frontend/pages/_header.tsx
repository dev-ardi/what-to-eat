import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import avatar from "../public/avatar.webp";
// TODO fix responsive in computer
const settings = [
	["Contact", "mailto:oriongonza@gmail.com"],
	["My GitHub", "https://github.com/Dev-ardi"],
];

export default function Header() {
	const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
		null,
	);

	const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	return (
		<AppBar position="static" sx={{
			backgroundColor: "#e63946"

		}}>
			<Container maxWidth="xl" >
				<Toolbar disableGutters sx={{
					justifyContent: "space-between",
					padding: "20px",
				}}
				>
					<Typography
						variant="h6"
						noWrap
						component="a"
						href="/"
						sx={{
							fontFamily: "monospace",
							fontWeight: 700,
							letterSpacing: ".2rem",
							color: "inherit",
							textDecoration: "none",
						}}
					>
						FOOD CHOOSER
					</Typography>


					<Box >
						<Tooltip title="Open settings">
							<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
								<Avatar alt="Ardi" src="/avatar.webp" />
							</IconButton>
						</Tooltip>
						<Menu
							sx={{ mt: "45px" }}
							id="menu-appbar"
							anchorEl={anchorElUser}
							anchorOrigin={{
								vertical: "top",
								horizontal: "right",
							}}
							keepMounted
							transformOrigin={{
								vertical: "top",
								horizontal: "right",
							}}
							open={Boolean(anchorElUser)}
							onClose={handleCloseUserMenu}
						>
							{settings.map((setting) => (
								<MenuItem key={setting[0]}>
									<a href={setting[1]}>
										<Typography textAlign="center">{setting[0]}</Typography>
									</a>
								</MenuItem>
							))}
						</Menu>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
}
