import { CaretLeft, CaretRight } from "phosphor-react";
import {
	CalendarActions,
	CalendarBody,
	CalendarContainer,
	CalendarDay,
	CalendarHeader,
	CalendarTitle,
} from "./styles";
import { getWeekDay } from "@/utils/get-week-days";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useRouter } from "next/router";

interface ICalendarWeek {
	week: number;
	days: Array<{
		date: dayjs.Dayjs;
		disabled: boolean;
	}>;
}
type CalendarWeeks = ICalendarWeek[];

interface ICalendarProps {
	selectedDate?: Date | null;
	onDateSelected: (date: Date) => void;
}

interface IBlockedDates {
	blockedWeekDays: number[];
}

export function Calendar({ selectedDate, onDateSelected }: ICalendarProps) {
	const [currentDate, setCurrentDate] = useState(() => {
		return dayjs().set("date", 1);
	});

	const router = useRouter();

	function handlePreviousMonth() {
		const previousMonthDate = currentDate.subtract(1, "month");

		setCurrentDate(previousMonthDate);
	}
	function handleNextMonth() {
		const previousMonthDate = currentDate.add(1, "month");

		setCurrentDate(previousMonthDate);
	}

	const currentMonth = currentDate.format("MMMM");
	const currentYear = currentDate.format("YYYY");
	const shortWeekDays = getWeekDay({ short: true });

	const username = String(router.query.username);

	const { data: blockedDates } = useQuery<IBlockedDates>({
		queryKey: [
			"blocked-dates",
			currentDate.get("year"),
			currentDate.get("month"),
		],
		queryFn: async () => {
			const response = await api.get(`/users/${username}/blocked-dates`, {
				params: {
					year: currentDate.get("year"),
					month: currentDate.get("month"),
				},
			});

			return response.data;
		},
	});

	const calendarWeeks = useMemo(() => {
		if (!blockedDates) {
			return [];
		}

		const daysInMonthArray = Array.from({
			length: currentDate.daysInMonth(),
		}).map((_, i) => {
			return currentDate.set("date", i + 1);
		});

		//para pegar o dia da semana do objeto data currentDate.
		//lembrando que "day" é o dia da semana e "date" é o dia do mes.
		const firstWeekDay = currentDate.get("day"); //retornar o índice do dia da semana. EX: hoje é sexta, vai retornar 5 (lembrando q índice incia em 0)

		//2º)p/visualizarmos os dias do mes anterior q completa nosso calendário
		const previousMonthFillArray = Array.from({
			//cria um array cujo tamanho é o índice do dia do currentDate
			//pois o dia da semana (firstweekDay) sempre vai nos retornar qntos dias faltaram para preacher a linha
			length: firstWeekDay,
		})
			.map((_, i) => {
				return currentDate.subtract(i + 1, "day");
			})
			.reverse();

		//3º)p/pegar os dias do mes seguinte para completar o nosso calendário atual, caso necessário.

		//retorna o índice o ultimo dia do mes
		const lastDayInCurrentMonth = currentDate.set(
			"date",
			currentDate.daysInMonth()
		);
		//retorna o índice (e ñ o dia) do ultimo dia do mes. no caso cai numa terça; e terça no dia da semana o indice é 2 (domingo=0, segunda=1, terça=2)
		const lastWeekDay = lastDayInCurrentMonth.get("day");
		//retorna os dias do mes seguinte para completar o calendário
		const nextMonthFillArray = Array.from({
			length: 7 - (lastWeekDay + 1),
		}).map((_, i) => {
			return lastDayInCurrentMonth.add(i + 1, "day");
		});

		//vamos somar tudo isso acima para parecer no nosso calendário: os dias do mes atual; os dias do mes anterior necessário para completar nosso calendário; os dias do mes posterior para completar nosso calendário
		const calendarDays = [
			//esse map é para desabilitar os dias anteriores para completar nosso calendário
			...previousMonthFillArray.map((date) => {
				return { date, disabled: true };
			}),
			...daysInMonthArray.map((date) => {
				return {
					date,
					disabled:
						date.endOf("day").isBefore(new Date()) ||
						blockedDates.blockedWeekDays.includes(date.get("day")),
				};
				//esse método ".endOf" retorna o horario 23:59:59, ou seja, se o dia ja passou. mas para isso precisamos ter a referencia do dia (fica: se 23:59:59 desse dia passado como argumento)
			}),
			...nextMonthFillArray.map((date) => {
				return { date, disabled: true };
			}),
		];

		//4º)separar isso acima em semanas para ser mais fácil de trabalharmos em nossa tabela.
		const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
			(weeks, _, i, original) => {
				const isNewWeek = i % 7 === 0; //se o índice ñ for divisível por 7, significa q ñ chegamos no momento que quebramos a semana (para podermos ir para a proxima semana)

				if (isNewWeek) {
					weeks.push({
						week: i / 7 + 1, //temos de 4 a 5 semanas no mes, isso vai indicar o nº da semana q estamos
						days: original.slice(i, i + 7),
					});
				}

				return weeks;
			},
			[]
		);

		return calendarWeeks;
	}, [currentDate, blockedDates]);
	console.log(calendarWeeks);

	return (
		<CalendarContainer>
			<CalendarHeader>
				<CalendarTitle>
					{currentMonth} <span>{currentYear}</span>
				</CalendarTitle>
				<CalendarActions>
					<button onClick={handlePreviousMonth} title="Previous month">
						<CaretLeft />
					</button>
					<button onClick={handleNextMonth} title="Next month">
						<CaretRight />
					</button>
				</CalendarActions>
			</CalendarHeader>

			<CalendarBody>
				<thead>
					<tr>
						{shortWeekDays.map((weekDay) => (
							<th key={weekDay}>{weekDay}.</th>
						))}
					</tr>
				</thead>
				<tbody>
					{calendarWeeks.map(({ week, days }) => {
						return (
							<tr key={week}>
								{days.map(({ date, disabled }) => {
									return (
										<td key={date.toString()}>
											<CalendarDay
												onClick={() => onDateSelected(date.toDate())}
												disabled={disabled}
											>
												{date.get("date")}
											</CalendarDay>
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</CalendarBody>
		</CalendarContainer>
	);
}
