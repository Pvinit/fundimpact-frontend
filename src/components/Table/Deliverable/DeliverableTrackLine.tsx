import React, { useEffect, useState } from "react";
import {
	GET_DELIVERABLE_TRACKLINE_BY_DELIVERABLE_TARGET,
	GET_DELIVERABLE_LINEITEM_FYDONOR,
} from "../../../graphql/queries/Deliverable/trackline";
import { useQuery } from "@apollo/client";
import { deliverableAndimpactTracklineHeading } from "../constants";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DeliverableTrackline from "../../Deliverable/DeliverableTrackline";
import { IconButton, Menu, MenuItem, TableCell } from "@material-ui/core";
import FITable from "../FITable";
import { IDeliverableTargetLine } from "../../../models/deliverable/deliverableTrackline";
import { DELIVERABLE_ACTIONS } from "../../Deliverable/constants";
import FullScreenLoader from "../../commons/GlobalLoader";
import { getTodaysDate } from "../../../utils";

function EditDeliverableTrackLineIcon({ deliverableTrackline }: { deliverableTrackline: any }) {
	const [tracklineDonorsMapValues, setTracklineDonorsMapValues] = useState<any>({});
	const [tracklineDonors, setTracklineDonors] = useState<
		{
			id: string;
			name: string;
			donor: { id: string; name: string; country: { id: string; name: string } };
		}[]
	>([]);

	const { loading } = useQuery(GET_DELIVERABLE_LINEITEM_FYDONOR, {
		variables: { filter: { deliverable_tracking_lineitem: deliverableTrackline.id } },
		onCompleted(data) {
			let obj: any = {};
			let donors: any = [];
			data.deliverableLinitemFyDonorList.forEach((elem: any) => {
				obj[`${elem.project_donor.id}mapValues`] = {
					id: elem.id,
					financial_year: elem.financial_year?.id,
					grant_periods_project: elem.grant_periods_project?.id,
					deliverable_tracking_lineitem: elem.deliverable_tracking_lineitem?.id,
					project_donor: elem.project_donor?.id,
				};
				donors.push({
					id: elem.project_donor?.id,
					name: elem.project_donor?.donor?.name,
					donor: elem.project_donor?.donor,
				});
			});
			setTracklineDonors(donors);
			setTracklineDonorsMapValues(obj);
		},
		onError(data) {
			console.log("errrr", data);
		},
	});
	useEffect(() => {});
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
	const [
		deliverableTracklineData,
		setDeliverableTracklineData,
	] = useState<IDeliverableTargetLine | null>();
	console.log("tracklineDonors", deliverableTracklineData);
	const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setMenuAnchor(event.currentTarget);
	};
	const handleMenuClose = () => {
		setMenuAnchor(null);
	};
	return (
		<>
			<TableCell>
				<IconButton aria-label="delete" onClick={handleMenuClick}>
					<MoreVertIcon />
				</IconButton>
			</TableCell>
			<Menu
				id="deliverable-trackline-simple-menu"
				anchorEl={menuAnchor}
				keepMounted
				open={Boolean(menuAnchor)}
				onClose={handleMenuClose}
			>
				<MenuItem
					onClick={() => {
						setDeliverableTracklineData({
							id: deliverableTrackline?.id,
							deliverable_target_project:
								deliverableTrackline.deliverable_target_project?.id,
							annual_year: deliverableTrackline.annual_year?.id,
							reporting_date: getTodaysDate(deliverableTrackline?.reporting_date),
							value: deliverableTrackline?.value,
							note: deliverableTrackline?.note,
							financial_year: deliverableTrackline.financial_year?.id,
							donors: tracklineDonors,
							donorMapValues: tracklineDonorsMapValues,
						});

						handleMenuClose();
					}}
				>
					Edit Achievement
				</MenuItem>
			</Menu>
			{deliverableTracklineData && (
				<DeliverableTrackline
					open={deliverableTracklineData !== null}
					handleClose={() => setDeliverableTracklineData(null)}
					type={DELIVERABLE_ACTIONS.UPDATE}
					data={deliverableTracklineData}
					deliverableTarget={deliverableTrackline.deliverable_target_project.id}
				/>
			)}
		</>
	);
}

export default function DeliverablesTrackLineTable({
	deliverableTargetId,
}: {
	deliverableTargetId: string;
}) {
	const { loading, data } = useQuery(GET_DELIVERABLE_TRACKLINE_BY_DELIVERABLE_TARGET, {
		variables: { filter: { deliverable_target_project: deliverableTargetId } },
	});
	console.log("hey", deliverableTargetId, data);
	const [rows, setRows] = useState<React.ReactNode[]>([]);
	useEffect(() => {
		if (
			data &&
			data.deliverableTrackingLineitemList &&
			data.deliverableTrackingLineitemList.length
		) {
			let deliverableTrackingLineitemList = data.deliverableTrackingLineitemList;
			let arr = [];
			for (let i = 0; i < deliverableTrackingLineitemList.length; i++) {
				if (deliverableTrackingLineitemList[i]) {
					let row = [
						<TableCell>
							{getTodaysDate(deliverableTrackingLineitemList[i]?.reporting_date)}
						</TableCell>,
						<TableCell>{deliverableTrackingLineitemList[i]?.note}</TableCell>,
						<TableCell>{deliverableTrackingLineitemList[i]?.value}</TableCell>,
					];
					row.push(
						<EditDeliverableTrackLineIcon
							deliverableTrackline={deliverableTrackingLineitemList[i]}
						/>
					);
					arr.push(row);
				}
			}
			setRows(arr);
		} else {
			setRows([]);
		}
	}, [data]);

	return (
		<>
			{loading ? <FullScreenLoader /> : null}
			<FITable tableHeading={deliverableAndimpactTracklineHeading} rows={rows} />{" "}
		</>
	);
}
