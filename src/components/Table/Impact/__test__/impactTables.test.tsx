import React from "react";
import { renderApollo } from "../../../../utils/test.util";
import { waitForElement, act, fireEvent } from "@testing-library/react";
import ImpactTable from "../Impacts";
import {
	GET_IMPACT_TARGET_BY_PROJECT,
	GET_ACHIEVED_VALLUE_BY_TARGET,
	GET_IMPACT_TARGETS_COUNT,
} from "../../../../graphql//Impact/target";
import {
	GET_IMPACT_TRACKLINE_BY_IMPACT_TARGET,
	GET_IMPACT_TRACKLINE_COUNT,
	GET_IMPACT_LINEITEM_FYDONOR,
} from "../../../../graphql/Impact/trackline";
import { DashboardProvider } from "../../../../contexts/dashboardContext";
import { NotificationProvider } from "../../../../contexts/notificationContext";
import {
	deliverableAndImpactHeadings,
	deliverableAndimpactTracklineHeading,
} from "../../constants";
import {
	impactTargetMock,
	achieveValueMock,
	impactTracklineByTargetMock,
	projectMock,
	impactLinitemFyDonorListMock,
} from "../../../Impact/__test__/testHelp";

const mocks = [
	{
		request: {
			query: GET_IMPACT_TARGET_BY_PROJECT,
			variables: { sort: "created_at:DESC", limit: 1, start: 0, filter: { project: 2 } },
		},
		result: { data: { impactTargetProjectList: impactTargetMock } },
	},
	{
		request: {
			query: GET_ACHIEVED_VALLUE_BY_TARGET,
			variables: { filter: { impactTargetProject: "14" } },
		},
		result: { data: { impactTrackingSpendValue: achieveValueMock } },
	},
	{
		request: {
			query: GET_IMPACT_TRACKLINE_BY_IMPACT_TARGET,
			variables: {
				filter: { impact_target_project: "14" },
				sort: "created_at:DESC",
				limit: 1,
				start: 0,
			},
		},
		result: { data: { impactTrackingLineitemList: impactTracklineByTargetMock } },
	},
	{
		request: {
			query: GET_IMPACT_TARGETS_COUNT,
			variables: { filter: { project: 2 } },
		},
		result: { data: { impactTargetProjectCount: 1 } },
	},
	{
		request: {
			query: GET_IMPACT_TRACKLINE_COUNT,
			variables: { filter: { impact_target_project: "14" } },
		},
		result: { data: { impactTrackingLineitemListCount: 1 } },
	},
	{
		request: {
			query: GET_IMPACT_LINEITEM_FYDONOR,
			variables: { filter: { impact_tracking_lineitem: "8" } },
		},
		result: { data: { impactLinitemFyDonorList: impactLinitemFyDonorListMock } },
	},
];

let impactTable: any;

beforeEach(() => {
	act(() => {
		impactTable = renderApollo(
			<DashboardProvider defaultState={{ project: projectMock }}>
				<NotificationProvider>
					<ImpactTable />
				</NotificationProvider>
			</DashboardProvider>,
			{
				mocks,
				resolvers: {},
			}
		);
	});
});
jest.setTimeout(30000);
describe("Impact Table and impact trackline table Graphql Calls and data listing", () => {
	test("Table Headings for Impact Table", async () => {
		const { getAllByText } = impactTable;
		for (let i = 0; i < deliverableAndImpactHeadings.length; i++) {
			await waitForElement(() => getAllByText(deliverableAndImpactHeadings[i].label));
		}
	});

	test("Data listing of impact table", async () => {
		const { getByText } = impactTable;
		await waitForElement(() => getByText(/Impact TARGETcc/i)); // name of target
		await waitForElement(() => getByText(/SONG/i)); // Category of target
		await waitForElement(() => getByText(/2500000000 units/i)); // Target Value of target
		await waitForElement(() => getByText(/630000 units/i)); // achievd value of target
		await waitForElement(() => getByText(/0.03 %/i)); // calculated percentage of target
	});

	test("Data listing of impact trackline table", async () => {
		let collaspeButton = await impactTable.findByTestId(`collaspeButton${0}`);
		expect(collaspeButton).toBeInTheDocument();
		act(() => {
			fireEvent.click(collaspeButton);
		});
		const { getByText, getAllByText } = impactTable;

		for (let i = 0; i < deliverableAndimpactTracklineHeading.length; i++) {
			await waitForElement(() => getAllByText(deliverableAndimpactTracklineHeading[i].label));
		}

		await waitForElement(() => getByText(/this is a note/i)); // Category of target trackline
		await waitForElement(() => getAllByText(/630000 units/i)); // Target Value of target trackline
		await waitForElement(() => getAllByText(/2015/));
		await waitForElement(() => getAllByText(/FY 2019-20/));
		await waitForElement(() => getByText(/2020-08-26/i)); // date of target trackline
	});
});