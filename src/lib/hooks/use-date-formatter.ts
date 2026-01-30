import { format } from 'date-fns';

export function useDateFormatter() {
	const formatDate = (value: string | Date, fmt = 'Pp') => {
		return format(new Date(value), fmt);
	};

	return { formatDate };
}
