import React, { useState, useRef } from "react";
import BudgetCategoryTableView from "./BudgetCategoryTableView";
import { IBudgetCategory } from "../../../models/budget";

const getInitialValues = (
	budgetCategory: Required<IBudgetCategory> | null
): Required<IBudgetCategory> => {
	return {
		code: budgetCategory?.code || "",
		description: budgetCategory?.description || "",
		id: budgetCategory?.id || "",
		name: budgetCategory?.name || "",
	};
};

function BudgetCategoryTableContainer({
	budgetCategoryList,
	collapsableTable,
	changePage,
	loading,
	count,
	order,
	setOrder,
	orderBy,
	setOrderBy,
}: {
	budgetCategoryList: Required<IBudgetCategory>[];
	collapsableTable: boolean;
	changePage: (prev?: boolean) => void;
	loading: boolean;
	count: number;
	order: "asc" | "desc";
	setOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
	orderBy: string;
	setOrderBy: React.Dispatch<React.SetStateAction<string>>;
}) {
	const selectedBudgetCategory = useRef<Required<IBudgetCategory> | null>(null);
	const [openDialogs, setOpenDialogs] = useState<boolean[]>([false]);

	const toggleDialogs = (index: number, val: boolean) => {
		setOpenDialogs((openStatus) =>
			openStatus.map((element: boolean, i) => (i === index ? val : element))
		);
	};

	return (
		<BudgetCategoryTableView
			openDialogs={openDialogs}
			toggleDialogs={toggleDialogs}
			selectedBudgetCategory={selectedBudgetCategory}
			initialValues={getInitialValues(selectedBudgetCategory.current)}
			budgetCategoryList={budgetCategoryList}
			collapsableTable={collapsableTable}
			changePage={changePage}
			loading={loading}
			count={count}
			order={order}
			setOrder={setOrder}
			orderBy={orderBy}
			setOrderBy={setOrderBy}
		/>
	);
}

export default BudgetCategoryTableContainer;
