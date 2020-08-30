import { useLazyQuery, useQuery } from "@apollo/client";
import { IconButton, Menu, MenuItem, TableCell } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import React, { useEffect, useState } from "react";

import { useDashBoardData } from "../../../contexts/dashboardContext";
import {
	GET_ACHIEVED_VALLUE_BY_TARGET,
	GET_IMPACT_TARGET_BY_PROJECT,
} from "../../../graphql/Impact/target";
import { IImpactTarget } from "../../../models/impact/impactTarget";
import FullScreenLoader from "../../commons/GlobalLoader";
import { IMPACT_ACTIONS } from "../../Impact/constants";
import ImpactTarget from "../../Impact/impactTarget";
import ImpactTrackLine from "../../Impact/impactTrackLine";
import { deliverableAndImpactHeadings } from "../constants";
import FICollaspeTable from "../FICollapseTable";
import ImpactTrackLineTable from "./impactTrackline";

function EditImpactTargetIcon({ impactTarget }: { impactTarget: any }) {
	const [impactTargetMenuAnchor, setImpactTargetMenuAnchor] = useState<null | HTMLElement>(null);
	const [impactTargetLineDialog, setImpactTargetLineDialog] = useState<boolean>();
	const [impactTargetData, setImpactTargetData] = useState<IImpactTarget | null>();
	const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setImpactTargetMenuAnchor(event.currentTarget);
	};
	const handleMenuClose = () => {
		setImpactTargetMenuAnchor(null);
	};
	return (
		<>
			<TableCell>
				<IconButton aria-label="impact-target-edit" onClick={handleMenuClick}>
					<MoreVertIcon />
				</IconButton>
			</TableCell>
			<Menu
				id="impact-target-simple-menu"
				anchorEl={impactTargetMenuAnchor}
				keepMounted
				open={Boolean(impactTargetMenuAnchor)}
				onClose={handleMenuClose}
			>
				<MenuItem
					onClick={() => {
						setImpactTargetData({
							id: impactTarget.id,
							name: impactTarget.name,
							target_value: impactTarget.target_value,
							description: impactTarget.description,
							impact_category_unit: impactTarget.impact_category_unit.id,
							project: impactTarget.project.id,
						});
						handleMenuClose();
					}}
				>
					Edit Target
				</MenuItem>
				<MenuItem
					onClick={() => {
						handleMenuClose();
						setImpactTargetLineDialog(true);
					}}
				>
					Report Achievement
				</MenuItem>
			</Menu>
			{impactTargetData && (
				<ImpactTarget
					open={impactTargetData !== null}
					handleClose={() => setImpactTargetData(null)}
					type={IMPACT_ACTIONS.UPDATE}
					data={impactTargetData}
					project={impactTarget.project.id}
				/>
			)}
			{impactTargetLineDialog && (
				<ImpactTrackLine
					open={impactTargetLineDialog}
					handleClose={() => setImpactTargetLineDialog(false)}
					type={IMPACT_ACTIONS.CREATE}
					impactTarget={impactTarget.id}
				/>
			)}
		</>
	);
}

function ImpactTargetAchievementAndProgress({
	impactTargetId,
	impactTargetValue,
	impactTargetUnit,
}: {
	impactTargetId: string;
	impactTargetValue: number;
	impactTargetUnit: string;
}) {
	const { data } = useQuery(GET_ACHIEVED_VALLUE_BY_TARGET, {
		variables: { filter: { impactTargetProject: impactTargetId } },
	});
	const [impactTargetAchieved, setImpactTargetAchieved] = useState<number>();
	const [impactTargetProgess, setImpactTargetProgess] = useState<string>();
	useEffect(() => {
		if (data) {
			setImpactTargetAchieved(data.impactTrackingSpendValue);
			setImpactTargetProgess(
				((data.impactTrackingSpendValue / impactTargetValue) * 100).toFixed(2)
			);
		}
	}, [data, impactTargetValue]);
	return (
		<>
			<TableCell>{`${impactTargetAchieved} ${impactTargetUnit}`}</TableCell>
			<TableCell>{impactTargetProgess} %</TableCell>
		</>
	);
}

export default function ImpactsTable() {
	const [getImpactTargetByProject, { loading, data }] = useLazyQuery(
		GET_IMPACT_TARGET_BY_PROJECT
	);
	const dashboardData = useDashBoardData();
	const [rows, setRows] = useState<
		{ collaspeTable: React.ReactNode; column: React.ReactNode[] }[]
	>([]);

	useEffect(() => {
		if (dashboardData?.project) {
			getImpactTargetByProject({
				variables: { filter: { project: dashboardData?.project.id } },
			});
		}
	}, [dashboardData, getImpactTargetByProject]);

	useEffect(() => {
		if (data) {
			let impactTargetProjectList = data.impactTargetProjectList;
			let array: { collaspeTable: React.ReactNode; column: React.ReactNode[] }[] = [];
			for (let i = 0; i < impactTargetProjectList.length; i++) {
				let row: { collaspeTable: React.ReactNode; column: React.ReactNode[] } = {
					collaspeTable: null,
					column: [],
				};

				row.collaspeTable = (
					<ImpactTrackLineTable impactTargetId={impactTargetProjectList[i].id} />
				); // row collaspeTable for impact

				if (impactTargetProjectList[i].impact_category_unit) {
					let column = [
						<TableCell>{impactTargetProjectList[i].name}</TableCell>,
						<TableCell>
							{
								impactTargetProjectList[i].impact_category_unit.impact_category_org
									.name
							}
						</TableCell>,
						<TableCell>{`${impactTargetProjectList[i].target_value} ${impactTargetProjectList[i].impact_category_unit.impact_units_org.name}`}</TableCell>,
					];
					column.push(
						<ImpactTargetAchievementAndProgress
							impactTargetId={impactTargetProjectList[i].id}
							impactTargetValue={impactTargetProjectList[i].target_value}
							impactTargetUnit={
								impactTargetProjectList[i].impact_category_unit.impact_units_org
									.name
							}
						/>
					);
					column.push(<EditImpactTargetIcon impactTarget={impactTargetProjectList[i]} />);

					row.column = column;
					array.push(row);
				}
			}
			setRows(array);
		} else {
			setRows([]);
		}
	}, [data]);

	return (
		<>
			{loading ? <FullScreenLoader /> : null}
			<FICollaspeTable tableHeading={deliverableAndImpactHeadings} rows={rows} />
		</>
	);
}
