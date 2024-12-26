import { Box, styled, Text } from "@ignite-ui/react";

export const IntervalBox = styled(Box, {
	marginTop: "$6",
	display: "flex",
	flexDirection: "column",
	gap: "$4",
});

export const IntervalsContainer = styled("div", {
	border: "1px solid $gray600",
	borderRadius: "$sm",
	//marginBottom:"$4" //mas ja apliquei esse espaço no gap do container
});

export const IntervalItem = styled("div", {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	padding: "$3 $4",

	//aplicar uma estilização somente no intervalItem (&) q tiver um intervalItem antes dele (+ &)
	"& + &": {
		borderTop: "1px solid $gray600",
	},
});

export const IntervalDay = styled("div", {
	display: "flex",
	alignItems: "center",
	gap: "$3",
});

export const IntervalInputs = styled("div", {
	display: "flex",
	alignItems: "center",
	gap: "$2",

	"input::-webkit-calendar-picker-indicator": {
		//esse é o nome para selecionarmos a estilização do icone
		//para aplicar a cor temos q usar a propriedade CSS filter (no caso ñ podemos usar diretamente "color" ou "background[e seu derivado]")
		filter: "invert(100%) brightness(30%) saturate(0%)", //vai inverter a cor do icone "relogio" p/branco
		//a gente usa saturate(0%) para tirar a cor (para deixar preto e branco)
	},
});

export const FormError = styled(Text, {
	color: "#f75a68",
	marginBottom: "$4",
});
