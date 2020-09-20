import React, { useState, useEffect } from "react";
import {
	TableContainer,
	Table,
	TableRow,
	TableCell,
	TableBody,
	TableHead,
	IconButton,
	MenuItem,
	TableFooter,
	TablePagination,
	TableSortLabel,
} from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SimpleMenu from "../../Menu";
import Donor from "../../Donor";
import { FORM_ACTIONS } from "../../../models/constants";
import { IDONOR_RESPONSE } from "../../../models/donor/query";
import { GET_ORG_DONOR, GET_DONOR_COUNT } from "../../../graphql/donor";
import { IDONOR } from "../../../models/donor";
import pagination from "../../../hooks/pagination";
import { useDashBoardData } from "../../../contexts/dashboardContext";
import TableSkeleton from "../../Skeletons/TableSkeleton";
import { donorTableHeading as tableHeading } from "../constants";

const useStyles = makeStyles({
	table: {
		minWidth: 650,
	},
});

const StyledTableHeader = makeStyles((theme: Theme) =>
	createStyles({
		th: { color: theme.palette.primary.main, fontSize: "13px" },
		tbody: {
			"& tr:nth-child(even) td": { background: "#F5F6FA" },
			"& td.MuiTableCell-root": {
				paddingTop: "1px",
				paddingBottom: "1px",
				fontSize: "13px",
			},
		},
	})
);

const keyNames = ["name", "legal_name", "short_name", "country,name"];

const getInitialValues = (donor: IDONOR_RESPONSE | null): IDONOR => {
	return {
		country: donor?.country?.id || "",
		legal_name: donor?.legal_name || "",
		name: donor?.name || "",
		short_name: donor?.short_name || "",
		id: donor?.id || "",
	};
};

function getValue(obj: any, key: string[]): any {
	if (!obj?.hasOwnProperty(key[0])) {
		return "";
	}
	if (key.length == 1) {
		return obj[key[0]];
	}
	return getValue(obj[key[0]], key.slice(1));
}

function DonorTable({
	tableFilterList,
}: {
	tableFilterList?: { [key: string]: string | string[] };
}) {
	const classes = useStyles();
	const tableHeader = StyledTableHeader();
	const selectedDonor = React.useRef<IDONOR_RESPONSE | null>(null);
	const [page, setPage] = useState<number>(0);
	const [orderBy, setOrderBy] = useState<string>("created_at");
	const [order, setOrder] = useState<"asc" | "desc">("desc");
	const [queryFilter, setQueryFilter] = useState({});

	const dashboardData = useDashBoardData();

	useEffect(() => {
		setQueryFilter({
			organization: dashboardData?.organization?.id,
		});
	}, [dashboardData]);

	useEffect(() => {
		let obj: { [key: string]: string | string[] } = {};
		for (let key in tableFilterList) {
			if (tableFilterList[key] && tableFilterList[key].length) {
				obj[key] = tableFilterList[key];
			}
		}
		setQueryFilter({
			organization: dashboardData?.organization?.id,
			...obj,
		});
	}, [tableFilterList]);

	const [openDialog, setOpenDialog] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	let { changePage, count, queryData: donorList, queryLoading, countQueryLoading } = pagination({
		countQuery: GET_DONOR_COUNT,
		countFilter: queryFilter,
		query: GET_ORG_DONOR,
		queryFilter,
		sort: `${orderBy}:${order.toUpperCase()}`,
	});

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
					Edit Donor
				</MenuItem>
			),
		},
	];

	if (countQueryLoading || queryLoading) {
		return <TableSkeleton />;
	}

	return (
		<TableContainer component={Paper}>
			<Donor
				formAction={FORM_ACTIONS.UPDATE}
				handleClose={() => setOpenDialog(false)}
				initialValues={getInitialValues(selectedDonor.current)}
				open={openDialog}
			/>
			<Table className={classes.table} aria-label="simple table">
				<TableHead>
					<TableRow color="primary">
						{donorList?.orgDonors?.length
							? tableHeading.map(
									(
										heading: { label: string; keyMapping?: string },
										index: number
									) => (
										<TableCell
											className={tableHeader.th}
											key={index}
											align="left"
										>
											{heading.label}
											{heading.keyMapping && (
												<TableSortLabel
													active={orderBy == heading.keyMapping}
													onClick={() => {
														if (orderBy == heading.keyMapping) {
															setOrder &&
																setOrder(
																	order == "asc" ? "desc" : "asc"
																);
														} else {
															setOrderBy &&
																setOrderBy(
																	heading.keyMapping || ""
																);
														}
													}}
													direction={order}
												></TableSortLabel>
											)}
										</TableCell>
									)
							  )
							: null}
					</TableRow>
				</TableHead>
				<TableBody className={tableHeader.tbody}>
					{donorList?.orgDonors?.map((donor: IDONOR_RESPONSE, index: number) => (
						<TableRow key={donor.id}>
							<TableCell component="td" scope="row">
								{page * 10 + index + 1}
							</TableCell>
							{keyNames.map((keyName: string, i: number) => {
								return (
									<TableCell key={i} align="left">
										{getValue(donor, keyName.split(","))}
									</TableCell>
								);
							})}
							<TableCell>
								<IconButton
									aria-haspopup="true"
									onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
										selectedDonor.current = donor;
										handleClick(event);
									}}
								>
									<MoreVertIcon />
								</IconButton>
								<SimpleMenu
									handleClose={handleClose}
									id={`organizationMenu-${donor.id}`}
									anchorEl={
										selectedDonor?.current?.id === donor.id ? anchorEl : null
									}
									menuList={menuList}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
				{donorList?.orgDonors?.length ? (
					<TableFooter>
						<TableRow>
							<TablePagination
								rowsPerPageOptions={[]}
								colSpan={8}
								count={count}
								rowsPerPage={count > 10 ? 10 : count}
								page={page}
								SelectProps={{
									inputProps: { "aria-label": "rows per page" },
									native: true,
								}}
								onChangePage={(
									event: React.MouseEvent<HTMLButtonElement> | null,
									newPage: number
								) => {
									if (newPage > page) {
										changePage();
									} else {
										changePage(true);
									}
									setPage(newPage);
								}}
								onChangeRowsPerPage={() => {}}
								style={{ paddingRight: "40px" }}
							/>
						</TableRow>
					</TableFooter>
				) : null}
			</Table>
		</TableContainer>
	);
}

export default React.memo(DonorTable);
