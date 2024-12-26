import { styled, Box, Text } from "@ignite-ui/react";

export const Container = styled(Box, {
	margin: "$6 auto 0",
	padding: 0,
	display: "grid",
	maxWidth: "100%",
	position: "relative",
	variants: {
		isTimePickerOpen: {
			true: {
				gridTemplateColumns: "1fr 280px",
				"@media(max-width: 900px)": {
					gridTemplateColumns: {
						gridTemplateColumns: "1fr",
					},
				},
			},
			false: {
				width: 540,
				gridTemplateColumns: "1fr",
			},
		},
	},
});

export const TimePicker = styled("div", {
	//border: "1px solid red",
	borderLeft: "1px solid $gray600",
	padding: "$6 $6 0",
	display: "flex",
	flexDirection: "column",
	gap: "$3",
	overflowY: "scroll",

	position: "absolute",
	top: 0,
	bottom: 0,
	right: 0,

	width: 280,
});
export const TimePickerHeader = styled(Text, {
	fontWeight: "$medium",

	span: {
		color: "$gray200",
	},
});
export const TimePickerList = styled("div", {
	display: "grid",
	gridTemplateColumns: "1fr",
	gap: "$2",

	//poderíamos usar display: flex tranquilo. mas quando a tela for menor q 900px, vai ter 2 colunas de horários
	"@media(max-width:900px)": {
		gridTemplateColumns: "repeat(2, 1fr)",
	},
});
export const TimePickerItem = styled("button", {
	border: 0,
	backgroundColor: "$gray600",
	padding: "$2 $6",
	cursor: "pointer",
	color: "$gray100",
	borderRadius: "$sm",
	fontSize: "$sm",
	lineHeight: "$base",

	"&:last-child": {
		marginBottom: "$6",
	},

	"&:disabled": {
		background: "none",
		cursor: "default",
		opacity: 0.4,
	},

	"&:not(:disabled):hover": {
		background: "$gray500",
	},

	"&:focus": {
		boxShadow: "0 0 0 2px $color$gray100",
	},
});
