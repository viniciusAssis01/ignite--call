export function convertTimeStringToMinutes(timeString: string) {
	const [hours, minutes] = timeString.split(":").map(Number);
	//esse map(Number) é a msm coisa q map(item => Number(item)). passamos ele assim, pq o number é uma função construtura, logo ja vai funcionar.
	//então função construtora funciona como callback

	return hours * 60 + minutes;
}
