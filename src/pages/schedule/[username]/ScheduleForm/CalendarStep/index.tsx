import { Calendar } from "@/components/Calendar";
import {
	Container,
	TimePicker,
	TimePickerHeader,
	TimePickerItem,
	TimePickerList,
} from "./styles";
import { useState } from "react";
import dayjs from "dayjs";
import { api } from "@/lib/axios";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

interface IAvailability {
	possibleTimes: number[]; //todos horários possíveis
	availableTimes: number[]; //horários disponíveis
}

export function CalendarStep() {
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	//const [availability, setAvailability] = useState<IAvailability | null>(null);

	const router = useRouter();

	const isDateSelected = !!selectedDate;

	const username = String(router.query.username);

	//poderíamos usar o intl.DateTimeFormat, mas vamos usar a lig dayjs
	const weekDay = selectedDate ? dayjs(selectedDate).format("dddd") : null;
	const describedDate = selectedDate
		? dayjs(selectedDate).format("DD[ de ]MMMM")
		: null;

	const selectedDateWithoutTime = selectedDate
		? dayjs(selectedDate).format("YYYY-MM-DD")
		: null;

	const { data: availability } = useQuery<IAvailability>({
		queryKey: ["availability", selectedDateWithoutTime],
		queryFn: async () => {
			const response = await api.get(`/users/${username}/availability`, {
				params: {
					date: selectedDateWithoutTime,
				},
			});

			return response.data;
		},
		enabled: !!selectedDate,
	});

	/* const { data: availability } = useQuery<IAvailability>(
		["availability", selectedDateWithoutTime],
		async () => {
			const response = await api.get(`/users/${username}/availability`, {
				params: {
					date: selectedDateWithoutTime,
				},
			});

			return response.data;
		},
		 enebled: !!selectedDate
	); */

	/* useEffect(() => {
		if (!selectedDate) {
			return;
		}

		api
			.get(`/users/${username}/availability`, {
				params: {
					date: dayjs(selectedDate).format("YYYY-MM-DD"),
				},
			})
			.then((response) => {
				//console.log(response.data);

				setAvailability(response.data);
			});
	}, [selectedDate, username]); */

	return (
		<Container isTimePickerOpen={isDateSelected}>
			<Calendar selectedDate={selectedDate} onDateSelected={setSelectedDate} />

			{isDateSelected && (
				<TimePicker>
					<TimePickerHeader>
						{weekDay}, <span>{describedDate}</span>
					</TimePickerHeader>
					<TimePickerList>
						{availability?.possibleTimes.map((hour) => {
							return (
								<TimePickerItem
									key={hour}
									disabled={!availability.availableTimes.includes(hour)}
								>
									{String(hour).padStart(2, "0")}:00h
								</TimePickerItem>
							);
						})}
					</TimePickerList>
				</TimePicker>
			)}
		</Container>
	);
}
