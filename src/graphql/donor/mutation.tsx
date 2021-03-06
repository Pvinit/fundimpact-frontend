import { gql } from "@apollo/client";

export const CREATE_ORG_DONOR = gql`
	mutation createOrgDonor($input: DonorInput!) {
		createOrgDonor(input: $input) {
			id
		}
	}
`;

export const UPDATE_ORG_DONOR = gql`
	mutation updateOrgDonor($id: ID!, $input: DonorInput) {
		updateOrgDonor(id: $id, input: $input) {
			id
			name
			country {
				id
				name
			}
			short_name
			legal_name
		}
	}
`;

export const CREATE_PROJECT_DONOR = gql`
	mutation createProjDonor($input: ProjectDonorInput!) {
		createProjDonor(input: $input) {
			id
			project {
				id
				name
			}
			donor {
				id
				name
			}
		}
	}
`;
