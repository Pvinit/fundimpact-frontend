import { useMutation } from "@apollo/client";
import React, { useEffect, useState } from "react";

import { GET_WORKSPACES_BY_ORG } from "../../graphql";
import { CREATE_WORKSPACE, UPDATE_WORKSPACE } from "../../graphql/workspace";
import {
	ICreate_Workspace_Response,
	IGET_WORKSPACES_BY_ORG,
	IOrganisationWorkspaces,
	IUPDATE_WORKSPACE_Response,
} from "../../models/workspace/query";
import { IWorkspace, WorkspaceProps } from "../../models/workspace/workspace";
import AlertMsg from "../AlertMessage/AlertMessage";
import WorkspaceForm from "../Forms/workspace/workspaceForm";
import { FullScreenLoader } from "../Loader/Loader";
import { WORKSPACE_ACTIONS } from "./constants";
import { TWorkspaceUpdate } from "./models/worksapceUpdate";

function getInitialValues(props: WorkspaceProps) {
	if (props.type === WORKSPACE_ACTIONS.UPDATE) return { ...props.data };
	return {
		name: "Workspace 1",
		short_name: "short name",
		description: "some description",
		organization: props.organizationId,
	};
}

// let formValue: IWorkspace & { __typename?: string };

/**
 *
 * @description When a new workspace is created or an existing workspace is update,
 * this method will update the workspace list in the cache. To update the existing
 * workspace, pass action value as UPDATE, however, if the workpsace id is not found,
 * then no changes will be made to the cache.
 *
 * NOTE: This will only update the data in Apollo cache, not on the server.
 *
 */
const updateOrganisationWorkspaceList = ({
	newWorkspace,
	action,
	cache,
	organizationId,
}: TWorkspaceUpdate) => {
	// Get the old data from Apollo Cache.
	const oldCachedData = cache.readQuery<IGET_WORKSPACES_BY_ORG>({
		query: GET_WORKSPACES_BY_ORG,
		variables: { filter: { organization: organizationId } },
	}) as NonNullable<IGET_WORKSPACES_BY_ORG>;

	let updatedWorkspaces = oldCachedData
		? {
				...oldCachedData,
				orgWorkspaces: [...oldCachedData.orgWorkspaces],
		  }
		: { orgWorkspaces: [] };

	if (action === "UPDATE") {
		const workspaceIndexFound = updatedWorkspaces.orgWorkspaces.findIndex(
			(workspace) => workspace.id === newWorkspace.id
		);
		if (workspaceIndexFound > -1) {
			updatedWorkspaces.orgWorkspaces[workspaceIndexFound] = {
				...newWorkspace,
			};
		}
	} else {
		updatedWorkspaces = {
			...updatedWorkspaces,
			orgWorkspaces: [...updatedWorkspaces.orgWorkspaces, { ...newWorkspace }],
		};
	}

	// Write new workspace list to cache.
	cache.writeQuery({
		broadcast: true,
		query: GET_WORKSPACES_BY_ORG,
		data: updatedWorkspaces,
		variables: { filter: { organization: organizationId } },
	});
};

function Workspace(props: WorkspaceProps) {
	const [initialValues, setinitialValues] = useState(getInitialValues(props));
	const [successMessage, setsuccessMessage] = useState<string>();
	const [errorMessage, seterrorMessage] = useState<string>();

	/*********************************
	 *
	 * 	WORKSPACE CREATE
	 *
	 *********************************/
	let [CreateWorkspace, { data: response, loading, error: createError }] = useMutation<
		ICreate_Workspace_Response,
		{ payload: { data: Omit<IWorkspace, "id"> | null } }
	>(CREATE_WORKSPACE, {
		onCompleted: (data) => {
			return setsuccessMessage("Workspace Created.");
		},
		update: (cache, option) => {
			updateOrganisationWorkspaceList({
				action: "INSERT",
				cache: cache,
				organizationId: props.organizationId,
				newWorkspace: option.data?.createWorkspace.workspace as NonNullable<
					IOrganisationWorkspaces
				>,
			});
		},
	});

	const onCreate = (value: IWorkspace) => {
		CreateWorkspace({
			variables: { payload: { data: { ...value } } },
		});
	};

	useEffect(() => {
		if (!response) return;
		setinitialValues({ description: "", name: "", short_name: "", organization: "" });

		setsuccessMessage("Workspace Created.");
	}, [response]);

	useEffect(() => {
		seterrorMessage("Workspace Creation Failed.");
	}, [createError]);

	/******************************
	 *
	 * WROKSPACE UPDATE
	 *
	 ******************************/
	let [UpdateWorkspace, { error: updateError }] = useMutation<
		IUPDATE_WORKSPACE_Response,
		{
			payload: Omit<IWorkspace, "id"> | null;
			workspaceID: IUPDATE_WORKSPACE_Response["updateWorkspace"]["workspace"]["id"];
		}
	>(UPDATE_WORKSPACE, {
		onCompleted: (data) => {
			return setsuccessMessage("Workspace Updated.");
		},
		update: (cache, option) => {
			updateOrganisationWorkspaceList({
				action: "UPDATE",
				cache: cache,
				organizationId: props.organizationId,
				newWorkspace: (option.data as NonNullable<IUPDATE_WORKSPACE_Response>)
					.updateWorkspace.workspace,
			});
		},
	});

	useEffect(() => {
		if (!updateError) return seterrorMessage(undefined);
		return seterrorMessage("Workspace Updation Failed.");
	}, [updateError]);

	const onUpdate = (value: IWorkspace & { __typename?: string }) => {
		// formValue = { ...value };
		delete value["__typename"];
		const workspaceId = value.id as string;
		delete value.id;
		UpdateWorkspace({ variables: { payload: value, workspaceID: workspaceId } });
	};

	const clearErrors = () => {
		if (!errorMessage) return;
		seterrorMessage(undefined);
	};

	const validate = () => {};

	const formState = props.type;

	return (
		<React.Fragment>
			<WorkspaceForm
				initialValues={initialValues}
				formState={formState}
				onCreate={onCreate}
				onUpdate={onUpdate}
				clearErrors={clearErrors}
				validate={validate}
				Close={props.close}
			>
				{successMessage ? <AlertMsg severity={"success"} msg={successMessage} /> : null}
				{errorMessage ? <AlertMsg severity={"error"} msg={errorMessage} /> : null}
			</WorkspaceForm>
			{loading ? <FullScreenLoader /> : null}
		</React.Fragment>
	);
}

export default Workspace;
