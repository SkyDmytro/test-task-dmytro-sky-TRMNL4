export const applicationStatuses = ['new', 'reviewed', 'accepted', 'rejected'] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
	return typeof value === 'string' && (applicationStatuses as readonly string[]).includes(value);
}
