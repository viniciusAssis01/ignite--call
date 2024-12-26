/* ñ vamos criar um array do tipo:
[0:domingo, 1:segunda...] */

interface IGetWeekDayParams {
	short?: boolean;
}

export function getWeekDay({ short = false }: IGetWeekDayParams = {}) {
	const formatter = new Intl.DateTimeFormat("pt-BR", {
		weekday: "long", //vai dar o dia da semana por extenso
	});

	return Array.from(Array(7).keys()) // isso retorna [0,1,2,3,4,5,6]
		.map(
			(day) => formatter.format(new Date(Date.UTC(2021, 5, day)))
			//mes 5 é o mes de junho, pois começa a contar do 0.
			//o dia do mês começa a contar em 1,  se colocar 0 como dia,  ele retorna o último dia do mes anterior.
			//EX: 2021, 05, 0 (q é o caso acima) ele vai retornar dia 31 de maio (mes 05), q é uma segunda feira.
			//então ficaria [segunda, terça, quarta, quinta, sexta, sabado domingo]
			//mas como tem o Date.UTC parece que coloca em ordem [domingo, segunda, terça, quarta, quinta, sexta, sabado]
		)
		.map((weekDay) => {
			if (short) {
				return weekDay.substring(0, 3).toUpperCase();
			}
			return weekDay.substring(0, 1).toUpperCase().concat(weekDay.substring(1));
			// vai a 1ºletra do nome do dia e vai colocar a 1ºletra em maiuscula
			//vamos concatenar essa primeira letra com a 2ºletra em diante do nome do dia.
		});
}
//essa função vai retornar um array com os dias da semana: ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"]
