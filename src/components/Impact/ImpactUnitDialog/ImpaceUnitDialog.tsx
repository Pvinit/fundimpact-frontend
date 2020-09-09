import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { IImpactUnitFormInput } from "../../../models/impact/impactForm";
import {
	CREATE_IMPACT_UNITS_ORG_INPUT,
	CREATE_IMPACT_CATEGORY_UNIT,
	UPDATE_IMPACT_UNIT_ORG,
} from "../../../graphql/Impact/mutation";
import { GET_IMPACT_UNIT_BY_ORG, GET_IMPACT_CATEGORY_BY_ORG } from "../../../graphql/Impact/query";
import { useNotificationDispatch } from "../../../contexts/notificationContext";
import {
	setErrorNotification,
	setSuccessNotification,
} from "../../../reducers/notificationReducer";
import { impactUnitForm, impactUnitSelect } from "../inputField.json";
import { IInputField } from "../../../models";
import FormDialog from "../../FormDialog";
import CommonForm from "../../Forms/CommonForm";
import { useDashBoardData } from "../../../contexts/dashboardContext";
import { IImpactUnitProps, IImpactUnitData } from "../../../models/impact/impact";
import { FORM_ACTIONS } from "../../../models/constants";
import { IGetImpactUnit } from "../../../models/impact/query";

let inputFields: IInputField[] = impactUnitForm;

const defaultValues: IImpactUnitFormInput = {
	name: "",
	description: "",
	code: "",
	target_unit: "",
	prefix_label: "",
	suffix_label: "",
	impactCategory: "",
};

const validate = (values: IImpactUnitFormInput) => {
	let errors: Partial<IImpactUnitFormInput> = {};
	if (!values.name) {
		errors.name = "Name is required";
	}
	if (!values.description) {
		errors.description = "Description is required";
	}
	if (!values.code) {
		errors.code = "Impact Code is required";
	}
	if (!values.target_unit) {
		errors.target_unit = "Target unit is required";
	}
	if (!values.prefix_label) {
		errors.prefix_label = "Prefix label is required";
	}
	if (!values.suffix_label) {
		errors.suffix_label = "Suffix label is required";
	}
	return errors;
};

function ImpactUnitDialog({
	open,
	handleClose,
	formAction,
	initialValues: formValues,
}: IImpactUnitProps) {
	const notificationDispatch = useNotificationDispatch();
	const dashboardData = useDashBoardData();
	const [impactCategory, setImpactCategory] = useState<string>();

	const { data: impactCategories } = useQuery(GET_IMPACT_CATEGORY_BY_ORG, {
		variables: { filter: { organization: dashboardData?.organization?.id } },
	});
	const [createImpactCategoryUnit] = useMutation(CREATE_IMPACT_CATEGORY_UNIT);

	const [createImpactUnitsOrgInput, { loading: creatingInpactUnit }] = useMutation(
		CREATE_IMPACT_UNITS_ORG_INPUT,
		{
			onCompleted(data) {
				if (impactCategory) {
					createImpactCategoryUnit({
						variables: {
							input: {
								impact_category_org: impactCategory,
								impact_units_org: data.createImpactUnitsOrgInput?.id,
							},
						},
					});
				}
				notificationDispatch(setSuccessNotification("Impact Unit Creation Success"));
				handleClose();
			},
			onError() {
				notificationDispatch(setErrorNotification("Impact Unit Creation Failure"));
				handleClose();
			},
		}
	);

	const [updateImpactUnitsOrgInput, { loading: updatingImpactUnit }] = useMutation(
		UPDATE_IMPACT_UNIT_ORG,
		{
			onCompleted(data) {
				if (impactCategory) {
					createImpactCategoryUnit({
						variables: {
							input: {
								impact_category_org: impactCategory,
								impact_units_org: data.updateImpactUnitsOrgInput?.id,
							},
						},
					});
				}
				notificationDispatch(setSuccessNotification("Impact Unit Updation Success"));
				handleClose();
			},
			onError() {
				notificationDispatch(setErrorNotification("Impact Unit Updation Failure"));
				handleClose();
			},
		}
	);

	const initialValues = formAction == FORM_ACTIONS.CREATE ? defaultValues : formValues;

	useEffect(() => {
		if (impactCategories) {
			impactUnitSelect[0].optionsArray = impactCategories?.impactCategoryOrgList;
		}
	}, [impactCategories]);

	const onSubmit = async (values: IImpactUnitFormInput) => {
		try {
			setImpactCategory(values.impactCategory);
			delete values.impactCategory;
			await createImpactUnitsOrgInput({
				variables: {
					input: {
						...values,
						organization: dashboardData?.organization?.id,
					},
				},
				update: (store, { data: { createImpactUnitsOrgInput } }) => {
					try {
						const cachedData = store.readQuery<IGetImpactUnit>({
							query: GET_IMPACT_UNIT_BY_ORG,
							variables: {
								filter: {
									organization: dashboardData?.organization?.id,
								},
							},
						});

						let impactUnitList: IImpactUnitData[] =
							cachedData?.impactUnitsOrgList || [];

						store.writeQuery<IGetImpactUnit>({
							query: GET_IMPACT_UNIT_BY_ORG,
							variables: {
								filter: {
									organization: dashboardData?.organization?.id,
								},
							},
							data: {
								impactUnitsOrgList: [createImpactUnitsOrgInput, ...impactUnitList],
							},
						});
					} catch (err) {}
				},
			});
		} catch (err) {}
	};

	const onUpdate = async (values: IImpactUnitFormInput) => {
		try {
			setImpactCategory(values.impactCategory);
			delete values.impactCategory;
			delete values.id;
			console.log("initialValues?.id :>> ", initialValues?.id);
			await updateImpactUnitsOrgInput({
				variables: {
					id: initialValues?.id,
					input: {
						...values,
						organization: dashboardData?.organization?.id,
					},
				},
			});
		} catch (err) {}
	};

	return (
		<FormDialog
			handleClose={handleClose}
			open={open}
			loading={creatingInpactUnit || updatingImpactUnit}
			title="New Impact Unit"
			subtitle="Physical addresses of your organizatin like headquater, branch etc."
			workspace={dashboardData?.workspace?.name}
			project={dashboardData?.project?.name ? dashboardData?.project?.name : ""}
		>
			<CommonForm
				initialValues={initialValues}
				validate={validate}
				onSubmit={onSubmit}
				onCancel={handleClose}
				inputFields={inputFields}
				selectFields={impactUnitSelect}
				onUpdate={onUpdate}
				formAction={formAction}
			/>
		</FormDialog>
	);
}

export default ImpactUnitDialog;
