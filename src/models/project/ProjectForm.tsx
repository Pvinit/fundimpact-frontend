import { PROJECT_ACTIONS } from "../../components/Project/constants";
import { IWorkspace } from "../workspace/workspace";
import { IProject } from "./project";

export interface IProjectFormProps {
	initialValues: IProject;
	onCreate: (values: IProject) => void;
	onUpdate: (values: IProject) => void;
	clearErrors: any;
	validate: any;
	formState: PROJECT_ACTIONS.CREATE | PROJECT_ACTIONS.UPDATE;
	workspaces: Pick<IWorkspace, "id" | "name">[];
}
