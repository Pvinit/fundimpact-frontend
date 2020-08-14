import { IconButton, Menu, MenuItem, Table } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import { useQuery } from "@apollo/client";
import { GET_BUDGET_TARGET_PROJECT } from "../../../graphql/queries/budget";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { IBudgetTargetProjectResponse } from "../../../models/budget/query";
import React, { useState, useEffect } from "react";
import CreateBudgetTargetDialog from "../../Dasboard/CreateBudgetTargetDialog";
import { BUDGET_ACTIONS } from "../../../models/budget/constants";
import SimpleMenu from "../../Menu/Menu";
import MoreVertOutlinedIcon from "@material-ui/icons/MoreVertOutlined";

const useStyles = makeStyles({
	table: {
		minWidth: 650,
	},
});

const StyledTableHeader = makeStyles((theme: Theme) =>
	createStyles({
		th: { color: theme.palette.primary.main },
		tbody: {
			"& tr:nth-child(even) td": { background: "#F5F6FA" },
			"& td.MuiTableCell-root": {
				paddingTop: "1px",
				paddingBottom: "1px",
			},
		},
	})
);

const tableHeading = [
	{ label: "S.no" },
	{ label: "Organization Currency" },
	{ label: "Project" },
	{ label: "Name" },
	{ label: "Budget Category" },
	{ label: "Total Target Amount" },
	{ label: "Conversion Factor" },
];

export default function BudgetTargetTable() {
	const classes = useStyles();
	const tableHeader = StyledTableHeader();
	const menuId = React.useRef("");

	const { data, loading, error } = useQuery(GET_BUDGET_TARGET_PROJECT);
	const [openDialog, setOpenDialog] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	useEffect(() => {
		if (data) {
			console.log("data :>> ", data);
			let arr = data.budgetTargetsProjects.map(
				(ele: any) => ele.budget_category_organization
			);
			console.log("arr :>> ", arr);
		}
	}, [data]);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const menuList = [
		{
			children: (
				<MenuItem
					onClick={() => {
						setOpenDialog(true);
						handleClose();
					}}
				>
					Edit Budget Target
				</MenuItem>
			),
		},
	];

	return (
		<TableContainer component={Paper}>
			<Table className={classes.table} aria-label="simple table">
				<TableHead>
					<TableRow color="primary">
						{tableHeading.map((heading) => (
							<TableCell className={tableHeader.th} key={heading.label} align="left">
								{heading.label}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody className={tableHeader.tbody}>
					{/* {wirte here loading} */}
					{data
						? data.budgetTargetsProjects.map(
								(
									budgetTargetsProject: IBudgetTargetProjectResponse,
									index: number
								) => (
									<TableRow key={budgetTargetsProject.id}>
										<CreateBudgetTargetDialog
											open={
												menuId.current == budgetTargetsProject.id &&
												openDialog
											}
											handleClose={() => setOpenDialog(false)}
											formAction={BUDGET_ACTIONS.UPDATE}
											initialValues={{
												name: budgetTargetsProject.name,
												description: budgetTargetsProject.description,
												total_target_amount:
													budgetTargetsProject.total_target_amount,
												conversion_factor:
													budgetTargetsProject.conversion_factor,
												organization_currency:
													budgetTargetsProject.organization_currency.id,
												budget_category_organization: budgetTargetsProject
													?.budget_category_organization?.id
													? budgetTargetsProject
															?.budget_category_organization?.id
													: "12",
												id: budgetTargetsProject.id,
											}}
										/>
										<TableCell component="td" scope="row">
											{index + 1}
										</TableCell>
										<TableCell align="left">
											{
												budgetTargetsProject?.organization_currency
													?.currency?.name
											}
										</TableCell>
										<TableCell align="left">
											{budgetTargetsProject.project?.name}
										</TableCell>
										<TableCell align="left">
											{budgetTargetsProject.name}
										</TableCell>
										<TableCell align="left">
											{
												budgetTargetsProject?.budget_category_organization
													?.name
											}
										</TableCell>
										<TableCell align="left">
											{budgetTargetsProject.total_target_amount}
										</TableCell>
										<TableCell align="left">
											{budgetTargetsProject.conversion_factor}
										</TableCell>
										<TableCell>
											<IconButton
												aria-haspopup="true"
												onClick={(
													event: React.MouseEvent<HTMLButtonElement>
												) => {
													menuId.current = budgetTargetsProject.id;
													handleClick(event);
												}}
											>
												<MoreVertIcon />
											</IconButton>
											<SimpleMenu
												handleClose={handleClose}
												id={`organizationMenu-${budgetTargetsProject.id}`}
												anchorEl={
													menuId.current == budgetTargetsProject.id
														? anchorEl
														: null
												}
												menuList={menuList}
											/>
										</TableCell>
									</TableRow>
								)
						  )
						: null}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
