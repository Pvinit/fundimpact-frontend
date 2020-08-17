import { Box, Button, createStyles, makeStyles, TextField, Theme } from "@material-ui/core";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import Slide from "@material-ui/core/Slide";
import { TransitionProps } from "@material-ui/core/transitions";
import { IDeliverableFormProps } from "../../../models/deliverable/deliverableForm";
import { IDeliverable } from "../../../models/deliverable/deliverable";
import { DELIVERABLE_ACTIONS } from "../../Deliverable/constants";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: "flex",
			flexDirection: "column",
			"& .MuiTextField-root,": {
				margin: theme.spacing(1),
			},
			"& .MuiButtonBase-root": {
				marginTop: theme.spacing(2),
			},
		},
		button: {
			color: theme.palette.common.white,
			margin: theme.spacing(1),
		},
	})
);

const Transition = React.forwardRef(function Transition(
	props: TransitionProps & { children?: React.ReactElement<any, any> },
	ref: React.Ref<unknown>
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

function DeliverableForm({
	clearErrors,
	initialValues,
	validate,
	formState,
	onCreate,
	onUpdate,
	children,
	formIsOpen,
	handleFormOpen,
}: IDeliverableFormProps & React.PropsWithChildren<IDeliverableFormProps>) {
	const classes = useStyles();
	const validateInitialValue = (initialValue: IDeliverable) => {
		const errors = validate(initialValue) as object;
		if (!errors) return true;
		return Object.keys(errors).length ? false : true;
	};
	return (
		<Box
			mx="auto"
			height={"100%"}
			width={{ xs: "100%", md: "100%", lg: "100%" }}
			onChange={clearErrors}
		>
			<Formik
				validateOnBlur
				validateOnChange
				initialValues={initialValues}
				isInitialValid={(props: any) => validateInitialValue(props.initialValues)}
				enableReinitialize={true}
				validate={validate}
				onSubmit={(values) =>
					formState === DELIVERABLE_ACTIONS.CREATE ? onCreate(values) : onUpdate(values)
				}
			>
				{(formik) => {
					return (
						<Form id="deliverable_form" className={classes.root} autoComplete="off">
							<TextField
								data-testid="deliverableFormName"
								value={formik.values.name}
								error={!!formik.errors.name}
								inputProps={{
									"data-testid": "deliverableFormNameInput",
								}}
								helperText={formik.touched.name && formik.errors.name}
								onChange={formik.handleChange}
								label="Name"
								required
								name="name"
								variant="outlined"
								fullWidth
							/>

							<TextField
								data-testid="deliverableFormCode"
								value={formik.values.code}
								error={!!formik.errors.code}
								onChange={formik.handleChange}
								inputProps={{
									"data-testid": "deliverableFormCodeInput",
								}}
								label="Deliverable Code"
								required
								name="code"
								type="text"
								variant="outlined"
								fullWidth
							/>
							<TextField
								data-testid="deliverableFormDescription"
								value={formik.values.description}
								error={!!formik.errors.description}
								onChange={formik.handleChange}
								inputProps={{
									"data-testid": "deliverableFormDescriptionInput",
								}}
								label="Description"
								multiline
								rows={3}
								name="description"
								type="text"
								variant="outlined"
								fullWidth
							/>
							<Box display="flex" m={1}>
								<Button
									color="primary"
									className={classes.button}
									onClick={handleFormOpen}
									variant="contained"
								>
									Cancel
								</Button>
								<Button
									className={classes.button}
									data-testid="deliverableFormSubmit"
									form="deliverable_form"
									disabled={!formik.isValid}
									type="submit"
									color="secondary"
									variant="contained"
								>
									{formState === DELIVERABLE_ACTIONS.CREATE ? "Create" : "Update"}
								</Button>
							</Box>
						</Form>
					);
				}}
			</Formik>
		</Box>
	);
}

export default DeliverableForm;
