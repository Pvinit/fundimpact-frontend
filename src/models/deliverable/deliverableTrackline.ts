import { DELIVERABLE_ACTIONS } from "../../components/Deliverable/constants";

export interface IDeliverableTargetLine {
	id?: number;
	deliverable_target_project: number | string | undefined;
	annual_year: string;
	value: number | string;
	financial_year: string;
	reporting_date: Date | string;
	donors?:
		| {
				id: string;
				name: string;
				donor: { id: string; name: string; country: { id: string; name: string } };
		  }[]
		| [];
	donorMapValues?: object;
	note?: string;
}

export type DeliverableTargetLineProps = {
	open: boolean;
	handleClose: () => void;
	deliverableTarget?: number | string | undefined;
} & (
	| {
			type: DELIVERABLE_ACTIONS.CREATE;
	  }
	| {
			type: DELIVERABLE_ACTIONS.UPDATE;
			data: IDeliverableTargetLine;
	  }
);
