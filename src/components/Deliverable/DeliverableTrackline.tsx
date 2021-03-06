import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect } from "react";

import { useDashBoardData } from "../../contexts/dashboardContext";
import { useNotificationDispatch } from "../../contexts/notificationContext";
import { GET_ANNUAL_YEARS, GET_FINANCIAL_YEARS, GET_PROJECT_DONORS } from "../../graphql";
import {
	GET_ACHIEVED_VALLUE_BY_TARGET,
	GET_DELIVERABLE_TARGET_BY_PROJECT,
} from "../../graphql/Deliverable/target";
import {
	CREATE_DELIVERABLE_TRACKLINE,
	GET_DELIVERABLE_TRACKLINE_BY_DELIVERABLE_TARGET,
	GET_DELIVERABLE_TRACKLINE_COUNT,
	UPDATE_DELIVERABLE_TRACKLINE,
} from "../../graphql/Deliverable/trackline";
import {
	DeliverableTargetLineProps,
	IDeliverableTargetLine,
} from "../../models/deliverable/deliverableTrackline";
import { setErrorNotification, setSuccessNotification } from "../../reducers/notificationReducer";
import { getTodaysDate } from "../../utils";
import CommonForm from "../CommonForm/commonForm";
import FormDialog from "../FormDialog/FormDialog";
import { FORM_ACTIONS } from "../Forms/constant";
import { FullScreenLoader } from "../Loader/Loader";
import DeliverableStepper from "../Stepper/Stepper";
import { DELIVERABLE_ACTIONS } from "./constants";
import DeliverableTracklineDonorYearTags from "./DeliverableTracklineDonor";
import { deliverableTragetLineForm } from "./inputField.json";
import {
	IDeliverableTracklineByTargetResponse,
	IGET_DELIVERABLE_TRACKLINE_BY_TARGET,
} from "../../models/deliverable/query";
import { useIntl } from "react-intl";
import { CommonFormTitleFormattedMessage } from "../../utils/commonFormattedMessage";

function getInitialValues(props: DeliverableTargetLineProps) {
	if (props.type === DELIVERABLE_ACTIONS.UPDATE) return { ...props.data };
	return {
		deliverable_target_project: props.deliverableTarget,
		annual_year: "",
		value: 0,
		financial_year: "",
		reporting_date: getTodaysDate(),
		note: "",
		donors: [],
	};
}

function DeliverableTrackLine(props: DeliverableTargetLineProps) {
	const DashBoardData = useDashBoardData();
	const notificationDispatch = useNotificationDispatch();
	let initialValues: IDeliverableTargetLine = getInitialValues(props);
	const { data: annualYears } = useQuery(GET_ANNUAL_YEARS);

	const { data: fyData } = useQuery(GET_FINANCIAL_YEARS, {
		variables: { filter: { country: DashBoardData?.organization?.country?.id } },
	});

	const { data: projectDonors } = useQuery(GET_PROJECT_DONORS, {
		variables: { filter: { project: DashBoardData?.project?.id } },
	});
	const [activeStep, setActiveStep] = React.useState(0);
	const [donors, setDonors] = React.useState<
		{
			id: string;
			name: string;
			donor: { id: string; name: string; country: { id: string; name: string } };
		}[]
	>();

	const [donorForm, setDonorForm] = React.useState<React.ReactNode | undefined>();
	const [donorFormData, setDonorFormData] = React.useState<any>();

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};
	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};
	const handleReset = () => {
		setActiveStep(0);
	};

	const formAction = props.type;
	const formIsOpen = props.open;
	const intl = useIntl();
	const onCancel = () => {
		props.handleClose();
		handleReset();
	};
	let { newOrEdit } = CommonFormTitleFormattedMessage(formAction);
	let formTitle = intl.formatMessage({
		id: "deliverableAchievementFormTitle",
		defaultMessage: "Deliverable Achievement",
		description: `This text will be show on deliverable Achievement form for title`,
	});
	let formSubtitle = intl.formatMessage({
		id: "deliverableAchievementFormSubtitle",
		defaultMessage: "Physical addresses of your organisation like headquarter branch etc",
		description: `This text will be show on deliverable Achievement form for subtitle`,
	});
	const { data: deliverableTargets } = useQuery(GET_DELIVERABLE_TARGET_BY_PROJECT, {
		variables: { filter: { project: DashBoardData?.project?.id } },
	});
	const [createDeliverableTrackline, { loading }] = useMutation(CREATE_DELIVERABLE_TRACKLINE, {
		onCompleted(data) {
			setDonorForm(
				<DeliverableTracklineDonorYearTags
					donors={donors}
					TracklineId={data.createDeliverableTrackingLineitemDetail.id}
					TracklineFyId={data.createDeliverableTrackingLineitemDetail.financial_year?.id}
					onCancel={onCancel}
					type={FORM_ACTIONS.CREATE}
				/>
			);
			notificationDispatch(
				setSuccessNotification("Deliverable Trackline created successfully!")
			);
			// setCreatedDeliverableTracklineId(data.createDeliverableTrackingLineitemDetail.id);
			handleNext();
		},
		onError(data) {
			notificationDispatch(setErrorNotification("Deliverable Trackline creation Failed !"));
		},
	});

	const [
		updateDeliverableTrackLine,
		{ loading: updateDeliverableTrackLineLoading },
	] = useMutation(UPDATE_DELIVERABLE_TRACKLINE, {
		onCompleted(data) {
			setDonorForm(
				<DeliverableTracklineDonorYearTags
					donors={donors}
					TracklineId={data.updateDeliverableTrackingLineitemDetail.id}
					TracklineFyId={data.updateDeliverableTrackingLineitemDetail.financial_year?.id}
					data={Object.keys(donorFormData).length ? donorFormData : {}} // stores dynamic key values with use of donorId
					onCancel={onCancel}
					type={
						Object.keys(donorFormData).length
							? FORM_ACTIONS.UPDATE
							: FORM_ACTIONS.CREATE
					}
					alreadyMappedDonorsIds={
						props.type === DELIVERABLE_ACTIONS.UPDATE
							? props.alreadyMappedDonorsIds
							: []
					}
				/>
			);
			notificationDispatch(
				setSuccessNotification("Deliverable Trackline Updated successfully!")
			);
			handleNext();
		},
		onError(data) {
			notificationDispatch(setErrorNotification("Deliverable Trackline Updation Failed !"));
		},
	});

	// updating annaul year field with fetched annual year list
	useEffect(() => {
		if (annualYears) {
			deliverableTragetLineForm[4].optionsArray = annualYears.annualYears;
		}
	}, [annualYears]);

	// updating annaul year field with fetched annual year list
	useEffect(() => {
		if (deliverableTargets) {
			deliverableTragetLineForm[0].optionsArray = deliverableTargets.deliverableTargetList;
		}
	}, [deliverableTargets]);

	// updating project_donor field with fetched project_donor  list
	useEffect(() => {
		if (projectDonors) {
			let array: any = [];
			projectDonors.projDonors.forEach(
				(elem: {
					id: string;
					donor: { id: string; name: string; country: { id: string; name: string } };
				}) => {
					if (
						props.type === DELIVERABLE_ACTIONS.UPDATE &&
						props.alreadyMappedDonorsIds?.includes(elem.id)
					)
						array.push({ ...elem, name: elem.donor.name, disabled: true });
					else array.push({ ...elem, name: elem.donor.name });
				}
			);
			deliverableTragetLineForm[3].optionsArray = array;
		}
	}, [projectDonors]);

	// updating financial year field with fetched financial year list
	useEffect(() => {
		if (fyData) {
			deliverableTragetLineForm[5].optionsArray = fyData.financialYearList;
		}
	}, [fyData]);

	const onCreate = (value: IDeliverableTargetLine) => {
		value.reporting_date = new Date(value.reporting_date);
		console.log(`on Created is called with: `, value);
		setDonors(value.donors);
		// setCreateDeliverableTracklineFyId(value.financial_year);
		let input = { ...value };
		delete (input as any).donors;

		createDeliverableTrackline({
			variables: { input },
			update: async (
				store,
				{ data: { createDeliverableTrackingLineitemDetail: lineItemCreated } }
			) => {
				try {
					const count = await store.readQuery<{
						deliverableTrackingLineitemCount: number;
					}>({
						query: GET_DELIVERABLE_TRACKLINE_COUNT,
						variables: {
							filter: {
								deliverable_target_project: value.deliverable_target_project,
							},
						},
					});
					store.writeQuery<{ deliverableTrackingLineitemCount: number }>({
						query: GET_DELIVERABLE_TRACKLINE_COUNT,
						variables: {
							filter: {
								deliverable_target_project: value.deliverable_target_project,
							},
						},
						data: {
							deliverableTrackingLineitemCount:
								count!.deliverableTrackingLineitemCount + 1,
						},
					});
					let limit = 0;
					if (count) {
						limit = count.deliverableTrackingLineitemCount;
					}
					const data = await store.readQuery<IGET_DELIVERABLE_TRACKLINE_BY_TARGET>({
						query: GET_DELIVERABLE_TRACKLINE_BY_DELIVERABLE_TARGET,
						variables: {
							filter: {
								deliverable_target_project: value.deliverable_target_project,
							},
							limit: limit > 10 ? 10 : limit,
							start: 0,
							sort: "created_at:DESC",
						},
					});
					let deliverableTrackingLineitemList: IDeliverableTracklineByTargetResponse[] = data?.deliverableTrackingLineitemList
						? data?.deliverableTrackingLineitemList
						: [];
					store.writeQuery<IGET_DELIVERABLE_TRACKLINE_BY_TARGET>({
						query: GET_DELIVERABLE_TRACKLINE_BY_DELIVERABLE_TARGET,
						variables: {
							filter: {
								deliverable_target_project: value.deliverable_target_project,
							},
							limit: limit > 10 ? 10 : limit,
							start: 0,
							sort: "created_at:DESC",
						},
						data: {
							deliverableTrackingLineitemList: [
								lineItemCreated,
								...deliverableTrackingLineitemList,
							],
						},
					});
				} catch (err) {
					console.error(err);
				}
			},
			refetchQueries: [
				{
					query: GET_DELIVERABLE_TRACKLINE_BY_DELIVERABLE_TARGET,
					variables: {
						filter: {
							deliverable_target_project: value.deliverable_target_project,
						},
					},
				},
				{
					query: GET_ACHIEVED_VALLUE_BY_TARGET,
					variables: {
						filter: { deliverableTargetProject: value.deliverable_target_project },
					},
				},
			],
		});
	};

	const onUpdate = (value: IDeliverableTargetLine) => {
		let DeliverableTargetLineId = value.id;
		delete (value as any).id;
		value.reporting_date = new Date(value.reporting_date);
		console.log(`on update is called with: `, value);
		setDonors(value.donors);
		setDonorFormData(value.donorMapValues);
		let input = { ...value };
		delete (input as any).donors;
		delete (input as any).donorMapValues;
		updateDeliverableTrackLine({
			variables: {
				id: DeliverableTargetLineId,
				input,
			},
			refetchQueries: [
				{
					query: GET_DELIVERABLE_TRACKLINE_BY_DELIVERABLE_TARGET,
					variables: {
						filter: {
							deliverable_target_project: value.deliverable_target_project,
						},
					},
				},
				{
					query: GET_DELIVERABLE_TRACKLINE_BY_DELIVERABLE_TARGET,
					variables: {
						limit: 10,
						start: 0,
						sort: "created_at:DESC",
						filter: {
							deliverable_target_project: value.deliverable_target_project,
						},
					},
				},
				{
					query: GET_DELIVERABLE_TRACKLINE_BY_DELIVERABLE_TARGET,
					variables: {
						limit: 10,
						start: 0,
						sort: "created_at:DESC",
						filter: {
							deliverable_target_project: value.deliverable_target_project,
						},
					},
				},
				{
					query: GET_ACHIEVED_VALLUE_BY_TARGET,
					variables: {
						filter: { deliverableTargetProject: value.deliverable_target_project },
					},
				},
			],
		});
	};
	const validate = (values: IDeliverableTargetLine) => {
		let errors: Partial<IDeliverableTargetLine> = {};
		if (!values.deliverable_target_project) {
			errors.deliverable_target_project = "Target is required";
		}
		if (!values.reporting_date) {
			errors.reporting_date = "Date is required";
		}
		if (!values.value) {
			errors.value = "Value is required";
		}
		// if (!values.financial_year) {
		// 	errors.financial_year = "Financial Year is required";
		// }

		return errors;
	};
	let basicForm = (
		<CommonForm
			{...{
				initialValues,
				validate,
				onCreate,
				onCancel,
				formAction,
				onUpdate,
				inputFields: deliverableTragetLineForm,
			}}
		/>
	);

	return (
		<React.Fragment>
			<FormDialog
				title={newOrEdit + " " + formTitle}
				subtitle={formSubtitle}
				workspace={DashBoardData?.workspace?.name}
				project={DashBoardData?.project?.name}
				open={formIsOpen}
				handleClose={onCancel}
			>
				<DeliverableStepper
					stepperHelpers={{
						activeStep,
						setActiveStep,
						handleNext,
						handleBack,
						handleReset,
					}}
					basicForm={basicForm}
					donorForm={donorForm}
				/>
			</FormDialog>
			{loading ? <FullScreenLoader /> : null}
			{updateDeliverableTrackLineLoading ? <FullScreenLoader /> : null}
		</React.Fragment>
	);
}

export default DeliverableTrackLine;
