import { Heading, styled, Text } from "@ignite-ui/react";

export const Container = styled("div", {
	maxWidth: 852,
	padding: "0 $4",
	margin: "$20 auto $4",
	//border: "1px solid red",
});

export const UserHeader = styled("div", {
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",

	[`> ${Heading}`]: {
		//estilize somente o heading dentro de UserHeader
		lineHeight: "$base",
		marginTop: "$2",
	},

	[`> ${Text}`]: {
		color: "$gray200",
	},
});
//
