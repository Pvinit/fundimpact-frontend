import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect } from "react";

import { useDashBoardData } from "../../contexts/dashboardContext";
import { useNotificationDispatch } from "../../contexts/notificationContext";
import { GET_ANNUAL_YEARS, GET_FINANCIAL_YEARS, GET_PROJECT_DONORS } from "../../graphql";
import {
	GET_ACHIEVED_VALLUE_BY_TARGET,
	GET_IMPACT_TARGET_BY_PROJECT,
} from "../../graphql/Impact/target";
import {
	CREATE_IMPACT_TRACKLINE,
	GET_IMPACT_TRACKLINE_BY_IMPACT_TARGET,
	GET_IMPACT_TRACKLINE_COUNT,
	UPDATE_IMPACT_TRACKLINE,
} from "../../graphql/Impact/trackline";
import { IImpactTargetLine, ImpactTargetLineProps } from "../../models/impact/impactTargetline";
import { setErrorNotification, setSuccessNotification } from "../../reducers/notificationReducer";
import { getTodaysDate } from "../../utils";
import CommonForm from "../CommonForm/commonForm";
import FormDialog from "../FormDialog/FormDialog";
import { FORM_ACTIONS } from "../Forms/constant";
import { FullScreenLoader } from "../Loader/Loader";
import Stepper from "../Stepper/Stepper";
import { IMPACT_ACTIONS } from "./constants";
import ImpacTracklineDonorYearTags from "./impactTracklineDonor";
import { impactTragetLineForm } from "./inputField.json";
import {
	IGET_IMPACT_TRACKLINE_BY_TARGET,
	IImpactTracklineByTargetResponse,
} from "../../models/impact/query";
import { useIntl } from "react-intl";
import { CommonFormTitleFormattedMessage } from "../../utils/commonFormattedMessage";

function getInitialValues(props: ImpactTargetLineProps) {
	if (props.type === IMPACT_ACTIONS.UPDATE) return { ...props.data };
	return {
		impact_target_project: props.impactTarget,
		annual_year: "",
		value: 0,
		financial_year: "",
		reporting_date: getTodaysDate(),
		note: "",
		donors: [],
	};
}

function ImpactTrackLine(props: ImpactTargetLineProps) {
	const DashBoardData = useDashBoardData();
	const notificationDispatch = useNotificationDispatch();
	let initialValues: IImpactTargetLine = getInitialValues(props);
	const { data: getAnnualYears } = useQuery(GET_ANNUAL_YEARS);

	const { data: impactFyData } = useQuery(GET_FINANCIAL_YEARS, {
		variables: { filter: { country: DashBoardData?.organization?.country?.id } },
	});

	const { data: impactProjectDonors } = useQuery(GET_PROJECT_DONORS, {
		variables: { filter: { project: DashBoardData?.project?.id } },
	});
	const [stepperActiveStep, setStepperActiveStep] = React.useState(0);

	const { data: impactTargets } = useQuery(GET_IMPACT_TARGET_BY_PROJECT, {
		variables: { filter: { project: DashBoardData?.project?.id } },
	});

	const [donors, setDonors] = React.useState<
		{
			id: string;
			name: string;
			donor: { id: string; name: string; country: { id: string; name: string } };
		}[]
	>();
	const [impactDonorForm, setImpactDonorForm] = React.useState<React.ReactNode | undefined>();
	const [impactDonorFormData, setImpactDonorFormData] = React.useState<any>();
	const handleNext = () => {
		setStepperActiveStep((prevActiveStep) => prevActiveStep + 1);
	};
	const handleBack = () => {
		setStepperActiveStep((prevActiveStep) => prevActiveStep - 1);
	};
	const handleReset = () => {
		setStepperActiveStep(0);
	};
	const formAction = props.type;
	const formIsOpen = props.open;
	const onCancel = () => {
		props.handleClose();
		handleReset();
	};
	let { newOrEdit } = CommonFormTitleFormattedMessage(formAction);
	const [createImpactTrackline, { loading }] = useMutation(CREATE_IMPACT_TRACKLINE, {
		onCompleted(data) {
			setImpactDonorForm(
				<ImpacTracklineDonorYearTags
					donors={donors}
					TracklineId={data.createImpactTrackingLineitemInput.id}
					TracklineFyId={data.createImpactTrackingLineitemInput.financial_year?.id}
					onCancel={onCancel}
					type={FORM_ACTIONS.CREATE}
				/>
			);
			notificationDispatch(setSuccessNotification("Impact Trackline created successfully!"));
			handleNext();
		},
		onError(data) {
			notificationDispatch(setErrorNotification("Impact Trackline creation Failed !"));
		},
	});

	const [updateImpactTrackLine, { loading: updateImpactTrackLineLoading }] = useMutation(
		UPDATE_IMPACT_TRACKLINE,
		{
			onCompleted(data) {
				setImpactDonorForm(
					<ImpacTracklineDonorYearTags
						donors={donors}
						TracklineId={data.updateImpactTrackingLineitemInput.id}
						TracklineFyId={data.updateImpactTrackingLineitemInput.financial_year?.id}
						onCancel={onCancel}
						data={Object.keys(impactDonorFormData).length ? impactDonorFormData : {}}
						type={
							Object.keys(impactDonorFormData).length
								? FORM_ACTIONS.UPDATE
								: FORM_ACTIONS.CREATE
						}
						alreadyMappedDonorsIds={
							props.type === IMPACT_ACTIONS.UPDATE ? props.alreadyMappedDonorsIds : []
						}
					/>
				);
				notificationDispatch(
					setSuccessNotification("Impact Trackline Updated successfully!")
				);
				handleNext();
			},
			onError(data) {
				notificationDispatch(setErrorNotification("Impact Trackline Updation Failed !"));
			},
		}
	);

	// updating annaul year field with fetched annual year list
	useEffect(() => {
		if (getAnnualYears) {
			impactTragetLineForm[4].optionsArray = getAnnualYears.annualYears;
		}
	}, [getAnnualYears]);

	// updating Impact Target field with fetched Target list
	useEffect(() => {
		if (impactTargets) {
			impactTragetLineForm[0].optionsArray = impactTargets.impactTargetProjectList;
		}
	}, [impactTargets]);

	useEffect(() => {
		if (impactProjectDonors) {
			let donorsArray: any = [];
			impactProjectDonors.projDonors.forEach(
				(elem: {
					id: string;
					donor: { id: string; name: string; country: { id: string; name: string } };
				}) => {
					if (
						props.type === IMPACT_ACTIONS.UPDATE &&
						props.alreadyMappedDonorsIds?.includes(elem.id)
					)
						donorsArray.push({ ...elem, name: elem.donor.name, disabled: true });
					else donorsArray.push({ ...elem, name: elem.donor.name });
				}
			);
			impactTragetLineForm[3].optionsArray = donorsArray;
		}
	}, [impactProjectDonors]);

	// updating financial year field with fetched financial year list
	useEffect(() => {
		if (impactFyData) {
			impactTragetLineForm[5].optionsArray = impactFyData.financialYearList;
		}
	}, [impactFyData]);

	const onCreate = (value: IImpactTargetLine) => {
		value.reporting_date = new Date(value.reporting_date);
		setDonors(value.donors);
		let input = { ...value };
		delete (input as any).donors;
		createImpactTrackline({
			variables: { input },
			update: async (
				store,
				{ data: { createImpactTrackingLineitemInput: tracklineCreated } }
			) => {
				try {
					const count = await store.readQuery<{
						impactTrackingLineitemListCount: number;
					}>({
						query: GET_IMPACT_TRACKLINE_COUNT,
						variables: {
							filter: {
								impact_target_project: value.impact_target_project,
							},
						},
					});

					store.writeQuery<{ impactTrackingLineitemListCount: number }>({
						query: GET_IMPACT_TRACKLINE_COUNT,
						variables: {
							filter: {
								impact_target_project: value.impact_target_project,
							},
						},
						data: {
							impactTrackingLineitemListCount:
								count!.impactTrackingLineitemListCount + 1,
						},
					});

					let limit = 0;
					if (count) {
						limit = count.impactTrackingLineitemListCount;
					}
					const dataRead = await store.readQuery<IGET_IMPACT_TRACKLINE_BY_TARGET>({
						query: GET_IMPACT_TRACKLINE_BY_IMPACT_TARGET,
						variables: {
							filter: {
								impact_target_project: value.impact_target_project,
							},
							limit: limit > 10 ? 10 : limit,
							start: 0,
							sort: "created_at:DESC",
						},
					});
					let impactTrackingLineitemList: IImpactTracklineByTargetResponse[] = dataRead?.impactTrackingLineitemList
						? dataRead?.impactTrackingLineitemList
						: [];

					store.writeQuery<IGET_IMPACT_TRACKLINE_BY_TARGET>({
						query: GET_IMPACT_TRACKLINE_BY_IMPACT_TARGET,
						variables: {
							filter: {
								impact_target_project: value.impact_target_project,
							},
							limit: limit > 10 ? 10 : limit,
							start: 0,
							sort: "created_at:DESC",
						},
						data: {
							impactTrackingLineitemList: [
								...impactTrackingLineitemList,
								tracklineCreated,
							],
						},
					});

					store.writeQuery<IGET_IMPACT_TRACKLINE_BY_TARGET>({
						query: GET_IMPACT_TRACKLINE_BY_IMPACT_TARGET,
						variables: {
							filter: {
								impact_target_project: value.impact_target_project,
							},
						},
						data: {
							impactTrackingLineitemList: [
								...impactTrackingLineitemList,
								tracklineCreated,
							],
						},
					});
				} catch (err) {
					console.error(err);
				}
			},
			refetchQueries: [
				{
					query: GET_IMPACT_TRACKLINE_BY_IMPACT_TARGET,
					variables: {
						filter: { impact_target_project: value.impact_target_project },
					},
				},
				{
					query: GET_ACHIEVED_VALLUE_BY_TARGET,
					variables: {
						filter: { impactTargetProject: value.impact_target_project },
					},
				},
			],
		});
	};

	const onUpdate = (value: IImpactTargetLine) => {
		let impactTargetLineId = value.id;
		delete (value as any).id;
		value.reporting_date = new Date(value.reporting_date);
		setDonors(value.donors);
		setImpactDonorFormData(value.impactDonorMapValues);
		let input = { ...value };
		delete (input as any).donors;
		delete (input as any).impactDonorMapValues;
		updateImpactTrackLine({
			variables: {
				id: impactTargetLineId,
				input,
			},
			refetchQueries: [
				{
					query: GET_IMPACT_TRACKLINE_BY_IMPACT_TARGET,
					variables: {
						limit: 10,
						start: 0,
						sort: "created_at:DESC",
						filter: { impact_target_project: value.impact_target_project },
					},
				},
				{
					query: GET_IMPACT_TRACKLINE_BY_IMPACT_TARGET,
					variables: {
						filter: { impact_target_project: value.impact_target_project },
					},
				},
				{
					query: GET_ACHIEVED_VALLUE_BY_TARGET,
					variables: {
						filter: { impactTargetProject: value.impact_target_project },
					},
				},
			],
		});
	};

	const validate = (values: IImpactTargetLine) => {
		let errors: Partial<IImpactTargetLine> = {};
		if (!values.impact_target_project) {
			errors.impact_target_project = "Target is required";
		}
		if (!values.reporting_date) {
			errors.reporting_date = "Date is required";
		}
		if (!values.value) {
			errors.value = "Value is required";
		}
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
				inputFields: impactTragetLineForm,
			}}
		/>
	);
	const intl = useIntl();
	return (
		<React.Fragment>
			<FormDialog
				title={
					newOrEdit +
					" " +
					intl.formatMessage({
						id: "impactAchievementFormTitle",
						defaultMessage: "Impact Achievement",
						description: `This text will be show on Impact Achievement form for title`,
					})
				}
				subtitle={intl.formatMessage({
					id: "impactAchievementFormSubtitle",
					defaultMessage:
						"Physical addresses of your organisation like headquarter branch etc",
					description: `This text will be show on Impact Achievement form for subtitle`,
				})}
				workspace={DashBoardData?.workspace?.name}
				project={DashBoardData?.project?.name}
				open={formIsOpen}
				handleClose={onCancel}
			>
				<Stepper
					stepperHelpers={{
						activeStep: stepperActiveStep,
						setActiveStep: setStepperActiveStep,
						handleNext,
						handleBack,
						handleReset,
					}}
					basicForm={basicForm}
					donorForm={impactDonorForm}
				/>
			</FormDialog>
			{loading ? <FullScreenLoader /> : null}
			{updateImpactTrackLineLoading ? <FullScreenLoader /> : null}
		</React.Fragment>
	);
}

export default ImpactTrackLine;
